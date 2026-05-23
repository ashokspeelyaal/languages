"""Luisteren (listening) exercises — generated script + audio + karaoke timings."""
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from ..auth import require_user
from ..db import conn, jdump, jload

router = APIRouter(prefix="/api/listening", tags=["listening"])


def _make_id() -> str:
    return "lex-" + secrets.token_urlsafe(6).replace("_", "").replace("-", "")[:10]


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
        "script": r["script"],
        "questions": jload(r["questions_json"], []),
        "vocab": jload(r["vocab_json"], []),
        "grammar": jload(r["grammar_json"], []),
        "audioKey": r["audio_path"],
        "wordTimings": jload(r["word_timings"], None),
        "sttText": r["stt_text"],
        "userAnswers": jload(r["user_answers"], []),
        "autoTitled": bool(r["auto_titled"]),
        "pushedToCorpus": bool(r["pushed_to_corpus"]),
        "createdAt": r["created_at"],
        "updatedAt": r["updated_at"],
    }


@router.get("")
def list_ex(user=Depends(require_user)):
    with conn() as c:
        rows = c.execute(
            "SELECT * FROM listening_exercises WHERE user_id = ? ORDER BY updated_at DESC",
            (user["id"],),
        ).fetchall()
    return {"exercises": [_row(r) for r in rows]}


@router.get("/{ex_id}")
def get_ex(ex_id: str, user=Depends(require_user)):
    with conn() as c:
        r = c.execute(
            "SELECT * FROM listening_exercises WHERE id = ? AND user_id = ?",
            (ex_id, user["id"]),
        ).fetchone()
    if not r:
        raise HTTPException(404, "Not found")
    return {"exercise": _row(r)}


@router.post("")
def create_ex(body: dict, user=Depends(require_user)):
    eid = body.get("id") or _make_id()
    with conn() as c:
        c.execute(
            """INSERT OR REPLACE INTO listening_exercises (id, user_id, title, topic, level, status)
               VALUES (?, ?, ?, ?, ?, 'new')""",
            (
                eid,
                user["id"],
                body.get("title") or "Nieuwe oefening",
                body.get("topic") or "",
                (body.get("level") or "B2").upper(),
            ),
        )
        r = c.execute("SELECT * FROM listening_exercises WHERE id = ?", (eid,)).fetchone()
    return {"exercise": _row(r)}


_PATCH_FIELDS = {
    "title": "title",
    "topic": "topic",
    "level": "level",
    "status": "status",
    "error": "error_msg",
    "script": "script",
    "sttText": "stt_text",
    "audioKey": "audio_path",
    "autoTitled": "auto_titled",
    "pushedToCorpus": "pushed_to_corpus",
}
_JSON_FIELDS = {
    "questions": "questions_json",
    "vocab": "vocab_json",
    "grammar": "grammar_json",
    "wordTimings": "word_timings",
    "userAnswers": "user_answers",
}


@router.patch("/{ex_id}")
def patch_ex(ex_id: str, body: dict, user=Depends(require_user)):
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
    values.extend([ex_id, user["id"]])
    with conn() as c:
        c.execute(
            f"UPDATE listening_exercises SET {', '.join(sets)} WHERE id = ? AND user_id = ?",
            values,
        )
        r = c.execute(
            "SELECT * FROM listening_exercises WHERE id = ? AND user_id = ?",
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
            "DELETE FROM listening_exercises WHERE id = ? AND user_id = ?",
            (ex_id, user["id"]),
        )
    return {"ok": True}
