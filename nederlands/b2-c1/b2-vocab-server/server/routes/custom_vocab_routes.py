"""User-added vocab — the corpus the user grows through Luisteren/Schrijven."""
import secrets
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from ..auth import require_user
from ..db import conn

router = APIRouter(prefix="/api/custom-vocab", tags=["custom-vocab"])


def _row(r) -> dict:
    return {
        "id": r["id"],
        "level": r["level"],
        "category": r["category"],
        "subcategory": r["subcategory"],
        "dutch": r["dutch"],
        "english": r["english"],
        "exampleNL": r["example_nl"],
        "exampleEN": r["example_en"],
        "core": bool(r["core"]),
        "source": r["source"],
        "sourceId": r["source_id"],
        "addedAt": r["added_at"],
    }


def _make_id() -> str:
    return "user-" + secrets.token_urlsafe(6).replace("_", "").replace("-", "")[:10]


def _norm(s: str) -> str:
    s = (s or "").lower().strip()
    for prefix in ("de ", "het ", "een "):
        if s.startswith(prefix):
            return s[len(prefix):]
    return s


@router.get("")
def list_custom(user=Depends(require_user)):
    with conn() as c:
        rows = c.execute(
            """SELECT * FROM custom_vocab WHERE user_id = ?
               ORDER BY added_at DESC""",
            (user["id"],),
        ).fetchall()
    return {"items": [_row(r) for r in rows]}


@router.post("/batch")
def add_batch(body: dict, user=Depends(require_user)):
    """Bulk-insert items with dedup against built-in + existing custom."""
    items: List[dict] = body.get("items") or []
    meta = body.get("meta") or {}
    if not isinstance(items, list):
        raise HTTPException(400, "items must be an array")

    with conn() as c:
        existing_built = {
            _norm(r["dutch"])
            for r in c.execute("SELECT dutch FROM vocab_items").fetchall()
        }
        existing_custom = {
            _norm(r["dutch"])
            for r in c.execute(
                "SELECT dutch FROM custom_vocab WHERE user_id = ?", (user["id"],)
            ).fetchall()
        }
        seen = existing_built | existing_custom
        added = 0
        skipped = 0
        c.execute("BEGIN")
        for it in items:
            key = _norm(it.get("dutch"))
            if not key or key in seen:
                skipped += 1
                continue
            seen.add(key)
            c.execute(
                """INSERT INTO custom_vocab
                   (id, user_id, level, category, subcategory, dutch, english,
                    example_nl, example_en, core, source, source_id)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    _make_id(),
                    user["id"],
                    it.get("level") or "B2",
                    it.get("category") or meta.get("category") or "Custom",
                    meta.get("subcategory"),
                    it.get("dutch"),
                    it.get("english") or "",
                    it.get("exampleNL") or meta.get("exampleNL") or "",
                    it.get("exampleEN") or "",
                    1 if it.get("core") else 0,
                    meta.get("source") or "user",
                    meta.get("sourceId"),
                ),
            )
            added += 1
        c.execute("COMMIT")
    return {"added": added, "skipped": skipped}


@router.delete("/{item_id}")
def remove_one(item_id: str, user=Depends(require_user)):
    with conn() as c:
        c.execute("DELETE FROM custom_vocab WHERE id = ? AND user_id = ?",
                  (item_id, user["id"]))
    return {"ok": True}


@router.delete("/by-source/{source_id}")
def remove_by_source(source_id: str, user=Depends(require_user)):
    with conn() as c:
        cur = c.execute(
            "DELETE FROM custom_vocab WHERE source_id = ? AND user_id = ?",
            (source_id, user["id"]),
        )
        return {"deleted": cur.rowcount}


@router.delete("")
def remove_all(user=Depends(require_user)):
    with conn() as c:
        cur = c.execute("DELETE FROM custom_vocab WHERE user_id = ?", (user["id"],))
    return {"deleted": cur.rowcount}
