"""Thin proxy to OpenAI for the three calls this app needs:
   /api/ai/complete    — GPT chat completion (used for analysis)
   /api/ai/tts         — OpenAI TTS (mp3)
   /api/ai/transcribe  — Whisper with word-level timings

Kept exposed even though immersion calls these *internally* — the
frontend can also hit /api/ai/tts directly for quick replay of any
text the user wants to hear.
"""
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from .auth import require_user
from .db import conn
from .settings import AI_SOFT_LIMIT, OPENAI_API_KEY

router = APIRouter(prefix="/api/ai", tags=["ai"])
OPENAI_BASE = "https://api.openai.com/v1"


def _today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def bump_counter(user_id: int, kind: str) -> None:
    with conn() as c:
        c.execute(
            """INSERT INTO ai_calls (user_id, day, kind, count) VALUES (?, ?, ?, 1)
               ON CONFLICT (user_id, day, kind) DO UPDATE SET count = count + 1""",
            (user_id, _today(), kind),
        )


def _key() -> str:
    if not OPENAI_API_KEY:
        raise HTTPException(503, "Pas de clé OpenAI. Ajoutez-en une dans .env.")
    return OPENAI_API_KEY


async def openai_complete(
    *,
    user_id: int,
    system: str,
    user: str,
    model: str = "gpt-5-mini",
    json_mode: bool = False,
    max_tokens: int = 4000,
    reasoning: str = "low",
    timeout: float = 240.0,
) -> str:
    """Helper used by immersion_routes too — kept here so the key + counter
    are managed in one place."""
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "max_completion_tokens": max_tokens,
        "reasoning_effort": reasoning if reasoning != "minimal" else "low",
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    async with httpx.AsyncClient(timeout=timeout) as client:
        r = await client.post(
            f"{OPENAI_BASE}/chat/completions",
            json=payload,
            headers={"Authorization": f"Bearer {_key()}", "Content-Type": "application/json"},
        )
    if r.status_code != 200:
        out = 502 if r.status_code in (401, 403) else r.status_code
        raise HTTPException(out, f"OpenAI {r.status_code}: {r.text[:600]}")
    data = r.json()
    bump_counter(user_id, "complete")
    text = ((data.get("choices") or [{}])[0].get("message") or {}).get("content") or ""
    return text.strip()


async def openai_tts(*, user_id: int, text: str, voice: str = "nova", model: str = "gpt-4o-mini-tts") -> bytes:
    payload = {"model": model, "input": text, "voice": voice, "response_format": "mp3"}
    async with httpx.AsyncClient(timeout=180.0) as client:
        r = await client.post(
            f"{OPENAI_BASE}/audio/speech",
            json=payload,
            headers={"Authorization": f"Bearer {_key()}"},
        )
    if r.status_code != 200:
        out = 502 if r.status_code in (401, 403) else r.status_code
        raise HTTPException(out, f"OpenAI TTS {r.status_code}: {r.text[:600]}")
    bump_counter(user_id, "tts")
    return r.content


async def openai_whisper(*, user_id: int, audio_bytes: bytes, language: str = "fr") -> dict:
    files = {"file": ("audio.mp3", audio_bytes, "audio/mpeg")}
    data = {
        "model": "whisper-1",
        "language": language,
        "response_format": "verbose_json",
        "timestamp_granularities[]": "word",
    }
    async with httpx.AsyncClient(timeout=300.0) as client:
        r = await client.post(
            f"{OPENAI_BASE}/audio/transcriptions",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {_key()}"},
        )
    if r.status_code != 200:
        out = 502 if r.status_code in (401, 403) else r.status_code
        raise HTTPException(out, f"Whisper {r.status_code}: {r.text[:600]}")
    bump_counter(user_id, "stt-words")
    return r.json()


# -------- HTTP endpoints exposed to the frontend --------
@router.post("/complete")
async def complete(body: dict, user=Depends(require_user)):
    text = await openai_complete(
        user_id=user["id"],
        system=body.get("system", ""),
        user=body.get("user", ""),
        model=body.get("model", "gpt-5-mini"),
        json_mode=bool(body.get("json")),
        max_tokens=int(body.get("maxTokens") or 4000),
        reasoning=body.get("reasoning") or "low",
    )
    return {"text": text}


@router.post("/tts")
async def tts(body: dict, user=Depends(require_user)):
    text = (body.get("text") or "").strip()
    if not text:
        raise HTTPException(400, "Empty text")
    audio = await openai_tts(
        user_id=user["id"],
        text=text,
        voice=body.get("voice") or "nova",
        model=body.get("model") or "gpt-4o-mini-tts",
    )
    return Response(content=audio, media_type="audio/mpeg")


@router.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    language: str = Form("fr"),
    user=Depends(require_user),
):
    audio = await file.read()
    payload = await openai_whisper(user_id=user["id"], audio_bytes=audio, language=language)
    words = []
    for w in payload.get("words") or []:
        words.append({"word": w.get("word"), "start": w.get("start"), "end": w.get("end")})
    return {"text": payload.get("text") or "", "words": words}


@router.get("/usage")
def usage(user=Depends(require_user)):
    with conn() as c:
        rows = c.execute(
            "SELECT day, kind, count FROM ai_calls WHERE user_id = ? AND day >= date('now', '-14 days') ORDER BY day",
            (user["id"],),
        ).fetchall()
    by_day = {}
    for r in rows:
        by_day.setdefault(r["day"], {"total": 0, "byKind": {}})
        by_day[r["day"]]["total"] += r["count"]
        by_day[r["day"]]["byKind"][r["kind"]] = r["count"]
    return {"softLimit": AI_SOFT_LIMIT, "byDay": by_day,
            "todayTotal": by_day.get(_today(), {}).get("total", 0)}


@router.get("/config")
def ai_config(user=Depends(require_user)):
    return {"openai": bool(OPENAI_API_KEY), "softLimit": AI_SOFT_LIMIT}
