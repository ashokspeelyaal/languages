"""Server-side proxy to OpenAI (chat / TTS / Whisper / vision) and Azure Speech.

Why this lives behind our server:
 - Keys are server-side env vars — client never sees them.
 - We can enforce per-user soft caps + log per-user usage.
 - We can later add caching / cost reports / fallback models without
   touching the frontend.

Phase 0 uses env-only keys (no per-user override yet). When
`server/routes/settings_routes.py` lands in Phase 1+, `_user_keys` will
prefer per-user values from `user_kv` over the env defaults.

Endpoints:
  POST /api/ai/complete    body: {kind, system?, user?, messages?, model, maxTokens, json, reasoning}
  POST /api/ai/tts         body: {text, provider, model, voice, instructions, rate, region}
  POST /api/ai/transcribe  multipart: file, language, prompt — Whisper word timestamps
  POST /api/ai/pronounce   multipart: file (WAV 16kHz mono), language, reference_text
  POST /api/ai/ocr         body: {image_b64, mime} — GPT-5 vision verbatim handwriting OCR
  GET  /api/ai/usage       → recent call counts for transparency
  GET  /api/ai/config      → which providers are wired up
"""
import base64
import json
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from .auth import require_user
from .db import conn
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


def _normalise_reasoning(val: str) -> str:
    """Older clients (and cached service workers) send reasoning_effort=
    "minimal" which gpt-5.4+ rejects with 400. Map it to "low" —
    universally accepted across gpt-5 and gpt-5.4 families."""
    v = (val or "low").strip()
    if v == "minimal":
        return "low"
    return v


def bump_counter(user_id: int, kind: str) -> None:
    with conn() as c:
        c.execute(
            """INSERT INTO ai_calls (user_id, day, kind, count) VALUES (?, ?, ?, 1)
               ON CONFLICT (user_id, day, kind) DO UPDATE SET count = count + 1""",
            (user_id, _today(), kind),
        )


def _user_keys(user_id: int) -> dict:
    """Phase 0: env-only. Phase 1+: prefer user_kv overrides."""
    return {
        "openai_key": OPENAI_API_KEY,
        "azure_key": AZURE_SPEECH_KEY,
        "azure_region": AZURE_SPEECH_REGION,
    }


def _resolve_openai_key(user_id: int) -> str:
    key = _user_keys(user_id)["openai_key"]
    if not key:
        raise HTTPException(503,
            "Pas de clé OpenAI. Ajoutez-en une dans Paramètres → Clé API, ou dans .env.")
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
        "reasoning_effort": _normalise_reasoning(body.get("reasoning")),
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
    # FR-default voices: nova (clear F → Camille) / echo (M → Antoine).
    voice = body.get("voice") or "nova"
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
    keys = _user_keys(user["id"])
    az_key = keys["azure_key"]
    if not az_key:
        raise HTTPException(503,
            "Pas de clé Azure. Ajoutez-en une dans Paramètres → Clé Azure, ou dans .env.")
    region = (body.get("region") or keys["azure_region"] or "francecentral").strip()
    # Default to fr-FR-DeniseNeural; fr-CA-SylvieNeural also works.
    voice = body.get("voice") or "fr-FR-DeniseNeural"
    rate = body.get("rate") or "0%"
    if voice.startswith("fr-CA"):
        lang = "fr-CA"
    elif voice.startswith("fr-BE"):
        lang = "fr-BE"
    else:
        lang = "fr-FR"
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
                "User-Agent": "atelier-app/1.0",
            },
        )
    if r.status_code != 200:
        msg = r.text[:400]
        if r.status_code == 401:
            msg = f"Azure 401 — souvent un décalage de région (configurée : {region}). {msg}"
        out = 502 if r.status_code in (401, 403) else r.status_code
        raise HTTPException(out, msg)
    bump_counter(user["id"], "tts-azure")
    return Response(content=r.content, media_type="audio/mpeg")


@router.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    language: str = Form("fr"),
    prompt: Optional[str] = Form(None),
    word_timings: bool = Form(True),
    user=Depends(require_user),
):
    """Whisper-1 transcription. Returns word-level timings when word_timings
    is true — required for karaoke sync in Écouter."""
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


@router.post("/pronounce")
async def pronounce(
    file: UploadFile = File(...),
    language: str = Form("fr-FR"),
    reference_text: str = Form(""),
    user=Depends(require_user),
):
    """Azure Speech Pronunciation Assessment.

    Audio MUST be WAV 16kHz mono 16-bit PCM. The client (audio.js) does
    the resample/encode dance in the browser via AudioContext before
    sending here. Free-form speech: pass reference_text="" — the service
    runs ASR + assessment in one shot.

    Returns the raw NBest[0] payload from Azure (we surface scores +
    per-word breakdown to the UI as-is)."""
    keys = _user_keys(user["id"])
    az_key = keys["azure_key"]
    if not az_key:
        raise HTTPException(503,
            "Pas de clé Azure. Ajoutez-en une dans Paramètres → Clé Azure, ou dans .env.")
    region = (keys["azure_region"] or "francecentral").strip()

    config = {
        "ReferenceText": reference_text or "",
        "GradingSystem": "HundredMark",
        "Granularity": "Phoneme",
        "Dimension": "Comprehensive",
        "EnableMiscue": bool(reference_text),
        "EnableProsodyAssessment": True,
        "PhonemeAlphabet": "IPA",
    }
    pa_header = base64.b64encode(json.dumps(config).encode("utf-8")).decode("ascii")

    audio_bytes = await file.read()
    url = (f"https://{region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1"
           f"?language={language}&format=detailed")
    async with httpx.AsyncClient(timeout=120.0) as client:
        r = await client.post(
            url,
            content=audio_bytes,
            headers={
                "Ocp-Apim-Subscription-Key": az_key,
                "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
                "Pronunciation-Assessment": pa_header,
                "Accept": "application/json",
                "User-Agent": "atelier-app/1.0",
            },
        )
    if r.status_code != 200:
        msg = r.text[:600]
        if r.status_code == 401:
            msg = f"Azure 401 — souvent un décalage de région (configurée : {region}). {msg}"
        out = 502 if r.status_code in (401, 403) else r.status_code
        raise HTTPException(out, msg)
    bump_counter(user["id"], "pronounce")
    return r.json()


@router.post("/ocr")
async def ocr(body: dict, user=Depends(require_user)):
    """Handwriting OCR via GPT-5 vision. image_b64 is raw base64 (no data:
    prefix); mime defaults to image/jpeg. Returns verbatim text — DO NOT
    correct learner mistakes."""
    image_b64 = body.get("image_b64")
    if not image_b64:
        raise HTTPException(400, "image_b64 required")
    mime = body.get("mime") or "image/jpeg"
    model = body.get("model") or "gpt-5"

    system = (
        "Tu es un moteur OCR précis pour le texte manuscrit français. "
        "Lis CHAQUE lettre LITTÉRALEMENT, telle qu'elle est écrite. "
        "NE CORRIGE RIEN — pas l'orthographe, pas la grammaire, pas la "
        "ponctuation, pas les accents manquants. Conserve les sauts de "
        "ligne. Si un mot est illisible, écris [?]. "
        "NEVER invent acronyms, organisation names, dates, or facts. "
        "Réponds UNIQUEMENT avec le texte transcrit, sans explication."
    )

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Transcris le texte manuscrit ci-dessous verbatim."},
                    {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{image_b64}"}},
                ],
            },
        ],
        "max_completion_tokens": 4000,
        "reasoning_effort": "low",
    }
    data = await _openai_json("/chat/completions", payload, user["id"], timeout=180.0)
    text = ((data.get("choices") or [{}])[0].get("message") or {}).get("content") or ""
    bump_counter(user["id"], "ocr")
    return {"text": text.strip()}


@router.get("/usage")
def usage(days: int = 14, user=Depends(require_user)):
    """Per-day AI call totals for the last N days, grouped by kind."""
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
    """Tell the frontend which providers are wired up. In Phase 0 keys are
    env-only, so this just reflects the .env presence."""
    keys = _user_keys(user["id"])
    return {
        "openai": bool(keys["openai_key"]),
        "azure":  bool(keys["azure_key"]),
        "azureRegion": keys["azure_region"],
        "softLimit": AI_SOFT_LIMIT,
    }
