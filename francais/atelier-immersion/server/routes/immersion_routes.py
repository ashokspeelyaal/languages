"""Immersion exercises — the one feature this app exists for.

Lifecycle:

   POST   /api/immersion             create (transcript + level)
   POST   /api/immersion/{id}/run    one-shot: analyze → tts → timings (~30-60s)
   POST   /api/immersion/{id}/analyze   GPT only (vocab + exercises)
   POST   /api/immersion/{id}/audio     TTS only
   POST   /api/immersion/{id}/timings   Whisper only
   GET    /api/immersion             list
   GET    /api/immersion/{id}        detail
   PATCH  /api/immersion/{id}        update title / level / user_progress
   DELETE /api/immersion/{id}        wipe + remove audio file
   GET    /api/immersion/{id}/audio  serve the mp3 (session-scoped)

Status field walks:
   new → analyzing → tts → timings → done   (or error at any step)

Why three sub-steps + one /run umbrella: gives the user a retry knob if
one step fails (typical: Whisper times out on long transcripts) without
re-paying for GPT analysis. The frontend defaults to /run.
"""
from __future__ import annotations

import json
import re
import secrets
import shutil
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.responses import FileResponse

from ..ai_proxy import openai_complete, openai_tts, openai_whisper
from ..auth import require_user
from ..db import conn, jdump, jload
from ..settings import AUDIO_DIR

router = APIRouter(prefix="/api/immersion", tags=["immersion"])

LEVELS = {"A1", "A2", "B1", "B2", "C1"}
DEFAULT_VOICE = "nova"   # Camille
MAX_TRANSCRIPT_CHARS = 6000   # ~ 1000 words; soft budget guard


# ============================================================ helpers
def _make_id() -> str:
    return "im-" + secrets.token_urlsafe(8).replace("_", "").replace("-", "")[:12]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _row(r) -> dict:
    return {
        "id": r["id"],
        "title": r["title"],
        "level": r["level"],
        "status": r["status"],
        "error": r["error_msg"],
        "transcript": r["source_transcript"],
        "vocab": jload(r["vocab_json"], []),
        "sentences": jload(r["sentences_json"], []),
        "wordTimings": jload(r["word_timings"], []),
        "hasAudio": bool(r["audio_path"]),
        "userProgress": jload(r["user_progress"], {}),
        "createdAt": r["created_at"],
        "updatedAt": r["updated_at"],
        "completedAt": r["completed_at"],
    }


def _audio_dir(user_id: int, ex_id: str):
    d = AUDIO_DIR / str(user_id) / "immersion" / ex_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def _set(c, ex_id: str, user_id: int, **fields):
    if not fields:
        return
    sets = ", ".join(f"{k} = ?" for k in fields) + ", updated_at = ?"
    values = list(fields.values()) + [_now(), ex_id, user_id]
    c.execute(
        f"UPDATE immersion_exercises SET {sets} WHERE id = ? AND user_id = ?",
        values,
    )


def _get(c, ex_id: str, user_id: int):
    row = c.execute(
        "SELECT * FROM immersion_exercises WHERE id = ? AND user_id = ?",
        (ex_id, user_id),
    ).fetchone()
    if not row:
        raise HTTPException(404, "Not found")
    return row


# ============================================================ CRUD
@router.get("")
def list_ex(user=Depends(require_user)):
    with conn() as c:
        rows = c.execute(
            "SELECT * FROM immersion_exercises WHERE user_id = ? ORDER BY updated_at DESC",
            (user["id"],),
        ).fetchall()
    return {"exercises": [_row(r) for r in rows]}


@router.get("/{ex_id}")
def get_ex(ex_id: str, user=Depends(require_user)):
    with conn() as c:
        r = _get(c, ex_id, user["id"])
    return {"exercise": _row(r)}


@router.post("")
def create_ex(body: dict = Body(...), user=Depends(require_user)):
    transcript = (body.get("transcript") or "").strip()
    if not transcript:
        raise HTTPException(400, "transcript required")
    if len(transcript) > MAX_TRANSCRIPT_CHARS:
        raise HTTPException(400, f"transcript exceeds {MAX_TRANSCRIPT_CHARS} chars")
    level = (body.get("level") or "A2").upper()
    if level not in LEVELS:
        raise HTTPException(400, f"invalid level: {level}")
    title = (body.get("title") or "").strip() or "Immersion " + datetime.now().strftime("%d/%m %H:%M")
    eid = _make_id()
    with conn() as c:
        c.execute(
            """INSERT INTO immersion_exercises
                  (id, user_id, title, level, status, source_transcript)
               VALUES (?, ?, ?, ?, 'new', ?)""",
            (eid, user["id"], title, level, transcript),
        )
        r = c.execute("SELECT * FROM immersion_exercises WHERE id = ?", (eid,)).fetchone()
    return {"exercise": _row(r)}


@router.patch("/{ex_id}")
def patch_ex(ex_id: str, body: dict = Body(...), user=Depends(require_user)):
    sets = {}
    if "title" in body:
        sets["title"] = (body["title"] or "").strip() or "Sans titre"
    if "level" in body:
        lvl = (body["level"] or "").upper()
        if lvl not in LEVELS:
            raise HTTPException(400, f"invalid level: {body['level']}")
        sets["level"] = lvl
    if "userProgress" in body:
        sets["user_progress"] = jdump(body["userProgress"])
    if not sets:
        with conn() as c:
            r = _get(c, ex_id, user["id"])
        return {"exercise": _row(r)}
    with conn() as c:
        _set(c, ex_id, user["id"], **sets)
        r = _get(c, ex_id, user["id"])
    return {"exercise": _row(r)}


@router.delete("/{ex_id}")
def delete_ex(ex_id: str, user=Depends(require_user)):
    with conn() as c:
        # Confirm ownership before wiping the audio dir on disk.
        _get(c, ex_id, user["id"])
        c.execute(
            "DELETE FROM immersion_exercises WHERE id = ? AND user_id = ?",
            (ex_id, user["id"]),
        )
    shutil.rmtree(AUDIO_DIR / str(user["id"]) / "immersion" / ex_id, ignore_errors=True)
    return {"ok": True}


# ============================================================ Audio serve
@router.get("/{ex_id}/audio")
def get_audio(ex_id: str, user=Depends(require_user)):
    with conn() as c:
        r = _get(c, ex_id, user["id"])
    if not r["audio_path"]:
        raise HTTPException(404, "no audio yet")
    from pathlib import Path
    p = Path(r["audio_path"])
    if not p.exists():
        raise HTTPException(404, "audio file missing")
    return FileResponse(p, media_type="audio/mpeg", filename=f"{ex_id}.mp3")


# ============================================================ AI pipeline
ANALYSIS_SYSTEM = """You are a French language teacher. Given a French transcript and a CEFR level (A1-C1), produce a JSON object with:

{
  "title": "<short French title for the transcript, 3-6 words>",
  "translation": "<full English translation of the transcript, preserving sentence breaks>",
  "vocab": [
    {
      "french": "<lemma>",
      "english": "<gloss>",
      "article": "<le|la|l'|les|null>",
      "gender": "<m|f|null>",
      "pos": "<noun|verb|adj|adv|prep|conj|pron|det|interj|phrase>",
      "ipa": "<IPA transcription, optional>",
      "hint": "<short usage note for learners of this level>"
    }
  ],
  "sentences": [
    {
      "idx": <0-based>,
      "text": "<sentence as in the transcript>",
      "translation": "<English translation>",
      "exercises": [
        {"type": "mc", "question": "<a comprehension question in French about this sentence>", "options": ["<opt1>","<opt2>","<opt3>","<opt4>"], "correct": <0-based index>},
        {"type": "blank", "masked": "<sentence with one key word replaced by ___>", "answer": "<the masked word>", "hint": "<short hint, optional>"},
        {"type": "reorder", "scrambled": ["<word1>","<word2>","<word3>"], "correct": ["<word1>","<word2>","<word3>"]},
        {"type": "tf", "statement": "<a statement about the sentence in French>", "answer": true},
        {"type": "translate", "prompt_en": "<the English translation>", "answer_fr": "<the original sentence>"}
      ]
    }
  ]
}

Strict rules:
- vocab MUST cover every non-trivial word in the transcript appropriate to the level — at A1 include very common closed-class words too; at C1 focus on collocations, idioms, register markers.
- EACH sentence MUST have 3-5 different exercise types from {mc, blank, reorder, tf, translate}. Always include at least one blank.
- Scale difficulty to the CEFR level. A1 = direct comprehension; C1 = nuance, register, inference.
- Exercise text in French; mc question, blank hint, tf statement in French. translate.prompt_en in English.
- Output strictly valid JSON. No prose around it. Use UTF-8 accents directly (é, è, à, ç).
"""


def _split_into_sentences(text: str) -> list[str]:
    """Conservative split — preserves question marks, exclamations. Used to
    pre-compute idx for matching against AI output."""
    parts = re.split(r"(?<=[.!?…])\s+", text.strip())
    return [p for p in parts if p.strip()]


@router.post("/{ex_id}/analyze")
async def analyze(ex_id: str, user=Depends(require_user)):
    with conn() as c:
        r = _get(c, ex_id, user["id"])
        if r["status"] in ("analyzing", "tts", "timings"):
            raise HTTPException(409, f"already running: {r['status']}")
        _set(c, ex_id, user["id"], status="analyzing", error_msg=None)
    try:
        prompt = (
            f"CEFR level: {r['level']}\n\n"
            f"Transcript (French):\n\"\"\"\n{r['source_transcript']}\n\"\"\""
        )
        text = await openai_complete(
            user_id=user["id"],
            system=ANALYSIS_SYSTEM,
            user=prompt,
            model="gpt-5-mini",
            json_mode=True,
            max_tokens=8000,
            reasoning="medium",
            timeout=300.0,
        )
        data = json.loads(text)
        title = (data.get("title") or "").strip() or r["title"]
        vocab = data.get("vocab") or []
        sentences = data.get("sentences") or []
        # Inject idx if the model omitted it.
        for i, s in enumerate(sentences):
            s.setdefault("idx", i)
        with conn() as c:
            _set(
                c, ex_id, user["id"],
                status="analyzed",
                title=title,
                vocab_json=jdump(vocab),
                sentences_json=jdump(sentences),
            )
            r = _get(c, ex_id, user["id"])
    except HTTPException:
        with conn() as c:
            _set(c, ex_id, user["id"], status="error", error_msg="analyze failed")
        raise
    except (json.JSONDecodeError, ValueError) as e:
        with conn() as c:
            _set(c, ex_id, user["id"], status="error", error_msg=f"AI returned invalid JSON: {e}")
        raise HTTPException(502, "AI returned invalid JSON")
    return {"exercise": _row(r)}


@router.post("/{ex_id}/audio")
async def gen_audio(ex_id: str, user=Depends(require_user)):
    with conn() as c:
        r = _get(c, ex_id, user["id"])
        _set(c, ex_id, user["id"], status="tts", error_msg=None)
    try:
        audio_bytes = await openai_tts(
            user_id=user["id"],
            text=r["source_transcript"],
            voice=DEFAULT_VOICE,
        )
        path = _audio_dir(user["id"], ex_id) / "full.mp3"
        path.write_bytes(audio_bytes)
        with conn() as c:
            _set(c, ex_id, user["id"], audio_path=str(path), status="audio_ready")
            r = _get(c, ex_id, user["id"])
    except HTTPException:
        with conn() as c:
            _set(c, ex_id, user["id"], status="error", error_msg="tts failed")
        raise
    return {"exercise": _row(r)}


@router.post("/{ex_id}/timings")
async def gen_timings(ex_id: str, user=Depends(require_user)):
    with conn() as c:
        r = _get(c, ex_id, user["id"])
        if not r["audio_path"]:
            raise HTTPException(400, "no audio yet — run /audio first")
        _set(c, ex_id, user["id"], status="timings", error_msg=None)
    try:
        from pathlib import Path
        audio_bytes = Path(r["audio_path"]).read_bytes()
        payload = await openai_whisper(user_id=user["id"], audio_bytes=audio_bytes, language="fr")
        words = []
        for w in payload.get("words") or []:
            words.append({"word": w.get("word"), "start": w.get("start"), "end": w.get("end")})
        with conn() as c:
            _set(
                c, ex_id, user["id"],
                status="done",
                word_timings=jdump(words),
                completed_at=_now(),
            )
            r = _get(c, ex_id, user["id"])
    except HTTPException:
        with conn() as c:
            _set(c, ex_id, user["id"], status="error", error_msg="whisper failed")
        raise
    return {"exercise": _row(r)}


@router.post("/{ex_id}/run")
async def run_all(ex_id: str, user=Depends(require_user)):
    """Convenience: analyze → audio → timings. Returns the final row.

    On failure, status stays at the failing step + error_msg is set; the
    caller can retry just the failed step via its dedicated endpoint.
    """
    out = await analyze(ex_id, user)
    out = await gen_audio(ex_id, user)
    out = await gen_timings(ex_id, user)
    return out
