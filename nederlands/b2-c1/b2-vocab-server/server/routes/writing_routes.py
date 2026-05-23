"""Schrijven exercises — writing correction with audio + score."""
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from ..auth import require_user
from ..db import conn, jdump, jload

router = APIRouter(prefix="/api/writing", tags=["writing"])


def _make_id() -> str:
    return "wex-" + secrets.token_urlsafe(6).replace("_", "").replace("-", "")[:10]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _row(r) -> dict:
    return {
        "id": r["id"],
        "title": r["title"],
        "level": r["level"],
        "sourceEssay": r["source_essay"],
        "status": r["status"],
        "error": r["error_msg"],
        "sentences": jload(r["sentences_json"], []),
        "correctedFull": r["corrected_full"] or "",
        "vocab": jload(r["vocab_json"], []),
        "grammar": jload(r["grammar_json"], []),
        "score": jload(r["score_json"], None),
        "audioKey": r["audio_path"],  # client only needs presence; download via /api/audio
        "wordTimings": jload(r["word_timings"], None),
        "sttText": r["stt_text"],
        "autoTitled": bool(r["auto_titled"]),
        "pushedToCorpus": bool(r["pushed_to_corpus"]),
        "createdAt": r["created_at"],
        "updatedAt": r["updated_at"],
    }


@router.get("")
def list_writing(user=Depends(require_user)):
    with conn() as c:
        rows = c.execute(
            "SELECT * FROM writing_exercises WHERE user_id = ? ORDER BY updated_at DESC",
            (user["id"],),
        ).fetchall()
    return {"exercises": [_row(r) for r in rows]}


@router.get("/{wid}")
def get_writing(wid: str, user=Depends(require_user)):
    with conn() as c:
        r = c.execute(
            "SELECT * FROM writing_exercises WHERE id = ? AND user_id = ?",
            (wid, user["id"]),
        ).fetchone()
    if not r:
        raise HTTPException(404, "Not found")
    return {"exercise": _row(r)}


@router.post("")
def create_writing(body: dict, user=Depends(require_user)):
    wid = body.get("id") or _make_id()
    with conn() as c:
        c.execute(
            """INSERT OR REPLACE INTO writing_exercises
               (id, user_id, title, level, source_essay, status)
               VALUES (?, ?, ?, ?, ?, 'new')""",
            (
                wid,
                user["id"],
                body.get("title") or "Nieuwe correctie",
                (body.get("level") or "B2").upper(),
                body.get("sourceEssay") or "",
            ),
        )
        r = c.execute("SELECT * FROM writing_exercises WHERE id = ?", (wid,)).fetchone()
    return {"exercise": _row(r)}


_PATCH_FIELDS = {
    "title": "title",
    "level": "level",
    "sourceEssay": "source_essay",
    "status": "status",
    "error": "error_msg",
    "correctedFull": "corrected_full",
    "sttText": "stt_text",
    "audioKey": "audio_path",
    "autoTitled": "auto_titled",
    "pushedToCorpus": "pushed_to_corpus",
}
_JSON_FIELDS = {
    "sentences": "sentences_json",
    "vocab": "vocab_json",
    "grammar": "grammar_json",
    "score": "score_json",
    "wordTimings": "word_timings",
}


@router.patch("/{wid}")
def patch_writing(wid: str, body: dict, user=Depends(require_user)):
    sets, values = [], []
    for k, col in _PATCH_FIELDS.items():
        if k in body:
            v = body[k]
            if k in {"autoTitled", "pushedToCorpus"}:
                v = 1 if v else 0
            sets.append(f"{col} = ?")
            values.append(v)
    for k, col in _JSON_FIELDS.items():
        if k in body:
            sets.append(f"{col} = ?")
            values.append(jdump(body[k]) if body[k] is not None else None)
    if not sets:
        return {"ok": True}
    sets.append("updated_at = ?")
    values.append(_now())
    values.extend([wid, user["id"]])
    with conn() as c:
        c.execute(
            f"UPDATE writing_exercises SET {', '.join(sets)} WHERE id = ? AND user_id = ?",
            values,
        )
        r = c.execute(
            "SELECT * FROM writing_exercises WHERE id = ? AND user_id = ?",
            (wid, user["id"]),
        ).fetchone()
    if not r:
        raise HTTPException(404, "Not found")
    return {"exercise": _row(r)}


@router.delete("/{wid}")
def delete_writing(wid: str, user=Depends(require_user)):
    """Also deletes any pushed custom vocab tagged with this exercise as source."""
    with conn() as c:
        c.execute(
            "DELETE FROM custom_vocab WHERE user_id = ? AND source_id = ?",
            (user["id"], wid),
        )
        c.execute(
            "DELETE FROM writing_exercises WHERE id = ? AND user_id = ?",
            (wid, user["id"]),
        )
    return {"ok": True}
