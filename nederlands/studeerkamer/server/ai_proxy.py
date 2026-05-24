"""Server-side proxy to OpenAI (chat / TTS / Whisper / vision) and Azure Speech.

Why this lives behind our server:
 - Keys are server-side env vars — client never sees them.
 - We can enforce per-user soft caps + log per-user usage.
 - We can later add caching / cost reports / fallback models without
   touching the frontend.

Endpoints:
  POST /api/ai/complete    body: {kind, system?, user?, messages?, model, maxTokens, json, reasoning}
  POST /api/ai/tts         body: {text, provider, model, voice, instructions, rate, region}
  POST /api/ai/transcribe  multipart: file, language, prompt — Whisper word timestamps
  POST /api/ai/ocr         body: {image_b64, mime} — GPT-5 vision verbatim handwriting OCR
  GET  /api/ai/usage       → recent call counts for transparency
"""
import base64
import json
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse, Response

from .auth import require_user
from .db import conn
from .routes.settings_routes import get_user_keys
from .settings import (
    AI_SOFT_LIMIT,
    AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION,
    OPENAI_API_KEY,
)

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


def _resolve_openai_key(user_id: int) -> str:
    key = get_user_keys(user_id)["openai_key"]
    if not key:
        raise HTTPException(503,
            "Geen OpenAI-sleutel. Zet er een in Instellingen → API-sleutel, of in .env.")
    return key


async def _openai_json(path: str, payload: dict, user_id: int, timeout: float = 120.0) -> dict:
    key = _resolve_openai_key(user_id)
    async with httpx.AsyncClient(timeout=timeout) as client:
        r = await client.post(
            f"{OPENAI_BASE}{path}",
            json=payload,
            headers={
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
            },
        )
    if r.status_code != 200:
        # NEVER pass through 401 — that means OpenAI rejected OUR key, not
        # that the user's session expired. The frontend's api.js redirects
        # to /login on 401, which would be very misleading. Remap to 502.
        out = 502 if r.status_code in (401, 403) else r.status_code
        raise HTTPException(out, f"OpenAI {r.status_code}: {r.text[:400]}")
    return r.json()


@router.post("/complete")
async def complete(body: dict, user=Depends(require_user)):
    """Chat completion proxy. Mirrors the original ai.js rawComplete() options."""
    kind = body.get("kind") or "complete"
    model = body.get("model") or "gpt-5-mini"
    messages = body.get("messages")
    if not messages:
        system = body.get("system") or ""
        user_msg = body.get("user") or ""
        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": user_msg},
        ]

    payload = {
        "model": model,
        "messages": messages,
        "max_completion_tokens": int(body.get("maxTokens") or 800),
        "reasoning_effort": body.get("reasoning") or "minimal",
    }
    if body.get("json"):
        payload["response_format"] = {"type": "json_object"}

    data = await _openai_json("/chat/completions", payload, user["id"], timeout=240.0)
    text = ((data.get("choices") or [{}])[0].get("message") or {}).get("content") or ""
    bump_counter(user["id"], kind)
    return {"text": text.strip(), "model": model, "kind": kind}


@router.post("/tts")
async def tts(body: dict, user=Depends(require_user)):
    """TTS proxy. provider=openai uses OpenAI; provider=azure uses Azure Speech."""
    provider = (body.get("provider") or "openai").lower()
    text = (body.get("text") or "").strip()
    if not text:
        raise HTTPException(400, "Empty text")

    if provider == "azure":
        return await _azure_tts(text, body, user)
    return await _openai_tts(text, body, user)


async def _openai_tts(text: str, body: dict, user: dict) -> Response:
    key = _resolve_openai_key(user["id"])
    model = body.get("model") or "gpt-4o-mini-tts"
    voice = body.get("voice") or "shimmer"
    payload = {"model": model, "input": text, "voice": voice, "response_format": "mp3"}
    if model == "gpt-4o-mini-tts" and body.get("instructions"):
        payload["instructions"] = body["instructions"]

    async with httpx.AsyncClient(timeout=120.0) as client:
        r = await client.post(
            f"{OPENAI_BASE}/audio/speech",
            json=payload,
            headers={"Authorization": f"Bearer {key}"},
        )
    if r.status_code != 200:
        out = 502 if r.status_code in (401, 403) else r.status_code
        raise HTTPException(out, f"OpenAI TTS {r.status_code}: {r.text[:400]}")
    bump_counter(user["id"], "tts")
    return Response(content=r.content, media_type="audio/mpeg")


def _escape_xml(s: str) -> str:
    return (
        (s or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


async def _azure_tts(text: str, body: dict, user: dict) -> Response:
    keys = get_user_keys(user["id"])
    az_key = keys["azure_key"]
    if not az_key:
        raise HTTPException(503,
            "Geen Azure-sleutel. Zet er een in Instellingen → Azure subscription key, of in .env.")
    region = (body.get("region") or keys["azure_region"] or "westeurope").strip()
    voice = body.get("voice") or "nl-BE-DenaNeural"
    rate = body.get("rate") or "0%"
    lang = "nl-BE" if voice.startswith("nl-BE") else ("nl-NL" if voice.startswith("nl-NL") else "nl-BE")
    inner = _escape_xml(text)
    if rate and rate != "0%":
        inner = f"<prosody rate='{_escape_xml(rate)}'>{inner}</prosody>"
    ssml = (
        f"<speak version='1.0' xml:lang='{lang}'>"
        f"<voice name='{voice}'>{inner}</voice></speak>"
    )

    url = f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1"
    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.post(
            url,
            content=ssml,
            headers={
                "Ocp-Apim-Subscription-Key": az_key,
                "Content-Type": "application/ssml+xml",
                "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
                "User-Agent": "studeerkamer-app/1.0",
            },
        )
    if r.status_code != 200:
        msg = r.text[:400]
        if r.status_code == 401:
            msg = f"Azure 401 — meestal regio-mismatch (configured: {region}). {msg}"
        out = 502 if r.status_code in (401, 403) else r.status_code
        raise HTTPException(out, msg)
    bump_counter(user["id"], "tts-azure")
    return Response(content=r.content, media_type="audio/mpeg")


@router.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    language: str = Form("nl"),
    prompt: Optional[str] = Form(None),
    word_timings: bool = Form(True),
    user=Depends(require_user),
):
    """Whisper-1 transcription. Returns verbose_json with word-level timings
    when word_timings is true — required for karaoke sync in Luisteren."""
    key = _resolve_openai_key(user["id"])
    audio_bytes = await file.read()
    files = {"file": (file.filename or "audio.mp3", audio_bytes, file.content_type or "audio/mpeg")}
    data = {
        "model": "whisper-1",
        "language": language,
    }
    if word_timings:
        data["response_format"] = "verbose_json"
        data["timestamp_granularities[]"] = "word"
    else:
        data["response_format"] = "json"
    if prompt:
        data["prompt"] = prompt

    async with httpx.AsyncClient(timeout=300.0) as client:
        r = await client.post(
            f"{OPENAI_BASE}/audio/transcriptions",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {key}"},
        )
    if r.status_code != 200:
        out = 502 if r.status_code in (401, 403) else r.status_code
        raise HTTPException(out, f"Whisper {r.status_code}: {r.text[:400]}")
    payload = r.json()
    bump_counter(user["id"], "stt-words" if word_timings else "stt")
    words = []
    for w in payload.get("words") or []:
        words.append({"word": w.get("word"), "start": w.get("start"), "end": w.get("end")})
    return {"text": payload.get("text") or "", "words": words}


@router.post("/ocr")
async def ocr(body: dict, user=Depends(require_user)):
    """Handwriting OCR via GPT-5 vision. image_b64 is the raw base64 (no data:
    prefix); mime defaults to image/jpeg. Returns verbatim text — DO NOT
    correct learner mistakes."""
    image_b64 = body.get("image_b64")
    if not image_b64:
        raise HTTPException(400, "image_b64 required")
    mime = body.get("mime") or "image/jpeg"
    model = body.get("model") or "gpt-5"

    system = (
        "Je bent een nauwkeurige OCR-engine voor handgeschreven Nederlandse tekst. "
        "Lees ELKE letter LETTERLIJK zoals geschreven. "
        "CORRIGEER NIETS — geen spelfouten, geen grammatica, geen interpunctie. "
        "Behoud regelafbrekingen. Als een woord onleesbaar is, schrijf [?]. "
        "NEVER invent acronyms, organisation names, dates, or facts about the user. "
        "Antwoord met UITSLUITEND de getranscribeerde tekst, geen uitleg."
    )

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Transcribeer de handgeschreven tekst hieronder verbatim."},
                    {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{image_b64}"}},
                ],
            },
        ],
        "max_completion_tokens": 4000,
        "reasoning_effort": "minimal",
    }
    data = await _openai_json("/chat/completions", payload, user["id"], timeout=180.0)
    text = ((data.get("choices") or [{}])[0].get("message") or {}).get("content") or ""
    bump_counter(user["id"], "ocr")
    return {"text": text.strip()}


@router.get("/usage")
def usage(days: int = 14, user=Depends(require_user)):
    """Per-day AI call totals for the last N days, grouped by kind."""
    out = []
    with conn() as c:
        rows = c.execute(
            """SELECT day, kind, count FROM ai_calls
               WHERE user_id = ? AND day >= date('now', ?)
               ORDER BY day ASC""",
            (user["id"], f"-{days} days"),
        ).fetchall()
    by_day = {}
    for r in rows:
        by_day.setdefault(r["day"], {"total": 0, "byKind": {}})
        by_day[r["day"]]["total"] += r["count"]
        by_day[r["day"]]["byKind"][r["kind"]] = r["count"]
    return {
        "softLimit": AI_SOFT_LIMIT,
        "byDay": by_day,
        "todayTotal": by_day.get(_today(), {}).get("total", 0),
    }


@router.get("/config")
def ai_config(user=Depends(require_user)):
    """Tell the frontend which providers are configured — combining the
    user's UI-entered keys and the server's .env defaults. `openai`/`azure`
    are true when *either* source has a key."""
    keys = get_user_keys(user["id"])
    return {
        "openai": bool(keys["openai_key"]),
        "azure":  bool(keys["azure_key"]),
        "azureRegion": keys["azure_region"],
        "softLimit": AI_SOFT_LIMIT,
    }
