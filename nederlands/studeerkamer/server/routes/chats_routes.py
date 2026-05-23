"""Multi-thread chat persistence. The chat AI logic itself stays on the client
(it composes the messages array and calls /api/ai/complete). This module just
stores chats + messages."""
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from ..auth import require_user
from ..db import conn, jdump, jload

router = APIRouter(prefix="/api/chats", tags=["chats"])


def _make_id() -> str:
    return "chat-" + secrets.token_urlsafe(6).replace("_", "").replace("-", "")[:10]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _chat_dict(row, messages=None) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "autoTitled": bool(row["auto_titled"]),
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
        "messages": messages or [],
    }


def _msg_dict(row) -> dict:
    return {
        "role": row["role"],
        "content": row["content"],
        "ts": row["ts"],
        **(jload(row["meta_json"], {}) or {}),
    }


@router.get("")
def list_chats(user=Depends(require_user)):
    """Return all chats *with* their full messages. The original app stored
    chats in one localStorage blob so views read chat.messages freely; we
    preserve that by eager-loading messages here. A typical user has a
    handful of chats so the payload stays small."""
    with conn() as c:
        rows = c.execute(
            "SELECT * FROM chats WHERE user_id = ? ORDER BY updated_at DESC",
            (user["id"],),
        ).fetchall()
        msg_rows = c.execute(
            """SELECT chat_id, role, content, ts, meta_json
               FROM chat_messages
               WHERE chat_id IN (SELECT id FROM chats WHERE user_id = ?)
               ORDER BY chat_id, id""",
            (user["id"],),
        ).fetchall()
    by_chat = {}
    for m in msg_rows:
        by_chat.setdefault(m["chat_id"], []).append(_msg_dict(m))
    return {"chats": [_chat_dict(r, by_chat.get(r["id"], [])) for r in rows]}


@router.get("/{chat_id}")
def get_chat(chat_id: str, user=Depends(require_user)):
    with conn() as c:
        row = c.execute(
            "SELECT * FROM chats WHERE id = ? AND user_id = ?",
            (chat_id, user["id"]),
        ).fetchone()
        if not row:
            raise HTTPException(404, "Not found")
        msgs = c.execute(
            "SELECT role, content, ts, meta_json FROM chat_messages WHERE chat_id = ? ORDER BY id ASC",
            (chat_id,),
        ).fetchall()
    return {"chat": _chat_dict(row, [_msg_dict(m) for m in msgs])}


@router.post("")
def create_chat(body: dict, user=Depends(require_user)):
    title = (body.get("title") or "Nieuw gesprek")[:200]
    cid = body.get("id") or _make_id()
    with conn() as c:
        c.execute(
            "INSERT OR REPLACE INTO chats (id, user_id, title) VALUES (?, ?, ?)",
            (cid, user["id"], title),
        )
        row = c.execute("SELECT * FROM chats WHERE id = ?", (cid,)).fetchone()
    return {"chat": _chat_dict(row, [])}


@router.patch("/{chat_id}")
def patch_chat(chat_id: str, body: dict, user=Depends(require_user)):
    fields = []
    values = []
    if "title" in body:
        fields.append("title = ?")
        values.append(str(body["title"])[:200])
        if body.get("autoTitled") is not None:
            fields.append("auto_titled = ?")
            values.append(1 if body["autoTitled"] else 0)
    if not fields:
        return {"ok": True}
    fields.append("updated_at = ?")
    values.append(_now())
    values.extend([chat_id, user["id"]])
    with conn() as c:
        c.execute(
            f"UPDATE chats SET {', '.join(fields)} WHERE id = ? AND user_id = ?",
            values,
        )
    return {"ok": True}


@router.delete("/{chat_id}")
def delete_chat(chat_id: str, user=Depends(require_user)):
    with conn() as c:
        c.execute("DELETE FROM chats WHERE id = ? AND user_id = ?",
                  (chat_id, user["id"]))
    return {"ok": True}


@router.post("/{chat_id}/messages")
def append_message(chat_id: str, body: dict, user=Depends(require_user)):
    role = body.get("role")
    content = body.get("content") or ""
    if role not in {"system", "user", "assistant"}:
        raise HTTPException(400, "role must be system|user|assistant")
    meta = {k: v for k, v in body.items() if k not in {"role", "content"}}
    with conn() as c:
        own = c.execute(
            "SELECT id FROM chats WHERE id = ? AND user_id = ?",
            (chat_id, user["id"]),
        ).fetchone()
        if not own:
            raise HTTPException(404, "Chat not found")
        c.execute(
            "INSERT INTO chat_messages (chat_id, role, content, meta_json) VALUES (?, ?, ?, ?)",
            (chat_id, role, content, jdump(meta) if meta else None),
        )
        c.execute("UPDATE chats SET updated_at = ? WHERE id = ?", (_now(), chat_id))
    return {"ok": True}


@router.delete("/{chat_id}/messages")
def clear_messages(chat_id: str, user=Depends(require_user)):
    """Wipe all messages from a chat (but keep the chat itself).
    Used by the "Wis" button in the chat view."""
    with conn() as c:
        own = c.execute(
            "SELECT id FROM chats WHERE id = ? AND user_id = ?",
            (chat_id, user["id"]),
        ).fetchone()
        if not own:
            raise HTTPException(404, "Chat not found")
        c.execute("DELETE FROM chat_messages WHERE chat_id = ?", (chat_id,))
        c.execute("UPDATE chats SET updated_at = ? WHERE id = ?", (_now(), chat_id))
    return {"ok": True}


@router.delete("")
def delete_all(user=Depends(require_user)):
    with conn() as c:
        c.execute("DELETE FROM chats WHERE user_id = ?", (user["id"],))
    return {"ok": True}
