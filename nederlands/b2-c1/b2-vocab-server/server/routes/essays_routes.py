"""Legacy /essay route — simpler than /schrijven. Stores essay text + AI result."""
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from ..auth import require_user
from ..db import conn, jdump, jload

router = APIRouter(prefix="/api/essays", tags=["essays"])


def _make_id() -> str:
    return "essay-" + secrets.token_urlsafe(6).replace("_", "").replace("-", "")[:10]


def _row(r) -> dict:
    return {
        "id": r["id"],
        "sourceText": r["source_text"],
        "result": jload(r["result_json"], None),
        "level": r["level"],
        "createdAt": r["created_at"],
    }


@router.get("")
def list_essays(user=Depends(require_user)):
    with conn() as c:
        rows = c.execute(
            "SELECT * FROM essays WHERE user_id = ? ORDER BY created_at DESC LIMIT 100",
            (user["id"],),
        ).fetchall()
    return {"essays": [_row(r) for r in rows]}


@router.post("")
def save_essay(body: dict, user=Depends(require_user)):
    source = body.get("sourceText") or ""
    result = body.get("result")
    level = body.get("level") or "B2"
    eid = _make_id()
    with conn() as c:
        c.execute(
            "INSERT INTO essays (id, user_id, source_text, result_json, level) VALUES (?, ?, ?, ?, ?)",
            (eid, user["id"], source, jdump(result) if result else None, level),
        )
    return {"id": eid}


@router.delete("/{essay_id}")
def delete_essay(essay_id: str, user=Depends(require_user)):
    with conn() as c:
        c.execute("DELETE FROM essays WHERE id = ? AND user_id = ?",
                  (essay_id, user["id"]))
    return {"ok": True}
