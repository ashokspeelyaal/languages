"""Spreken exercises — user records audio, AI scores pronunciation, transcribes,
corrects, and TTS-reads the corrected version back. Structure mirrors
listening_routes / writing_routes."""
import secrets
import shutil
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from ..auth import require_user
from ..db import conn, jdump, jload
from ..settings import AUDIO_DIR

router = APIRouter(prefix="/api/spreken", tags=["spreken"])


def _make_id() -> str:
    return "sp-" + secrets.token_urlsafe(6).replace("_", "").replace("-", "")[:10]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _row(r) -> dict:
    return {
        "id": r["id"],
        "title": r["title"],
        "topic": r["topic"],
        "level": r["level"],
        "status": r["status"],
        "error": r["error_msg"],
        "originalAudioKey":   r["original_audio_path"],
        "originalTranscript": r["original_transcript"],
        "originalWordTimings": jload(r["original_word_timings"], None),
        "pronunciation":      jload(r["pronunciation_json"], None),
        "correctedText":      r["corrected_text"],
        "correctedAudioKey":  r["corrected_audio_path"],
        "correctedWordTimings": jload(r["corrected_word_timings"], None),
        "sentences": jload(r["sentences_json"], []),
        "score":     jload(r["score_json"], None),
        "vocab":     jload(r["vocab_json"], []),
        "grammar":   jload(r["grammar_json"], []),
        "autoTitled":      bool(r["auto_titled"]),
        "pushedToCorpus":  bool(r["pushed_to_corpus"]),
        "createdAt": r["created_at"],
        "updatedAt": r["updated_at"],
    }


@router.get("")
def list_ex(user=Depends(require_user)):
    with conn() as c:
        rows = c.execute(
            "SELECT * FROM spreken_exercises WHERE user_id = ? ORDER BY updated_at DESC",
            (user["id"],),
        ).fetchall()
    return {"exercises": [_row(r) for r in rows]}


@router.get("/{ex_id}")
def get_ex(ex_id: str, user=Depends(require_user)):
    with conn() as c:
        r = c.execute(
            "SELECT * FROM spreken_exercises WHERE id = ? AND user_id = ?",
            (ex_id, user["id"]),
        ).fetchone()
    if not r:
        raise HTTPException(404, "Not found")
    return {"exercise": _row(r)}


@router.post("")
def create_ex(body: dict = None, user=Depends(require_user)):
    body = body or {}
    eid = body.get("id") or _make_id()
    with conn() as c:
        c.execute(
            """INSERT OR REPLACE INTO spreken_exercises
               (id, user_id, title, topic, level, status)
               VALUES (?, ?, ?, ?, ?, 'new')""",
            (
                eid,
                user["id"],
                body.get("title") or "Nieuwe opname",
                body.get("topic") or "",
                (body.get("level") or "B2").upper(),
            ),
        )
        r = c.execute("SELECT * FROM spreken_exercises WHERE id = ?", (eid,)).fetchone()
    return {"exercise": _row(r)}


_PATCH_FIELDS = {
    "title": "title",
    "topic": "topic",
    "level": "level",
    "status": "status",
    "error": "error_msg",
    "originalAudioKey":   "original_audio_path",
    "originalTranscript": "original_transcript",
    "correctedText":      "corrected_text",
    "correctedAudioKey":  "corrected_audio_path",
    "autoTitled":         "auto_titled",
    "pushedToCorpus":     "pushed_to_corpus",
}
_JSON_FIELDS = {
    "originalWordTimings":   "original_word_timings",
    "pronunciation":         "pronunciation_json",
    "correctedWordTimings":  "corrected_word_timings",
    "sentences":             "sentences_json",
    "score":                 "score_json",
    "vocab":                 "vocab_json",
    "grammar":               "grammar_json",
}


@router.patch("/{ex_id}")
def patch_ex(ex_id: str, body: dict, user=Depends(require_user)):
    sets, values = [], []
    for k, col in _PATCH_FIELDS.items():
        if k in body:
            v = body[k]
            if k in {"autoTitled", "pushedToCorpus"}:
                v = 1 if v else 0
            sets.append(f"{col} = ?"); values.append(v)
    for k, col in _JSON_FIELDS.items():
        if k in body:
            sets.append(f"{col} = ?")
            values.append(jdump(body[k]) if body[k] is not None else None)
    if not sets:
        return {"ok": True}
    sets.append("updated_at = ?"); values.append(_now())
    values.extend([ex_id, user["id"]])
    with conn() as c:
        c.execute(
            f"UPDATE spreken_exercises SET {', '.join(sets)} WHERE id = ? AND user_id = ?",
            values,
        )
        r = c.execute(
            "SELECT * FROM spreken_exercises WHERE id = ? AND user_id = ?",
            (ex_id, user["id"]),
        ).fetchone()
    if not r:
        raise HTTPException(404, "Not found")
    return {"exercise": _row(r)}


@router.delete("/{ex_id}")
def delete_ex(ex_id: str, user=Depends(require_user)):
    with conn() as c:
        c.execute(
            "DELETE FROM custom_vocab WHERE user_id = ? AND source_id = ?",
            (user["id"], ex_id),
        )
        c.execute(
            "DELETE FROM spreken_exercises WHERE id = ? AND user_id = ?",
            (ex_id, user["id"]),
        )
    audio_dir = AUDIO_DIR / str(user["id"]) / "spreken" / ex_id
    if audio_dir.exists():
        shutil.rmtree(audio_dir, ignore_errors=True)
    return {"ok": True}
