"""Built-in vocabulary corpus. Read-only for clients."""
from fastapi import APIRouter, Depends

from ..auth import require_user
from ..db import conn

router = APIRouter(prefix="/api/vocab", tags=["vocab"])


def _row_to_item(r) -> dict:
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
    }


@router.get("")
def list_vocab(user=Depends(require_user)):
    """Return ALL built-in items. The frontend caches this in memory and
    merges custom items in on top — same model as the original Proxy-wrapped
    ITEMS array."""
    with conn() as c:
        rows = c.execute(
            """SELECT id, level, category, subcategory, dutch, english,
                      example_nl, example_en, core
               FROM vocab_items ORDER BY level, category, id"""
        ).fetchall()
    return {"items": [_row_to_item(r) for r in rows]}


@router.get("/categories")
def categories(user=Depends(require_user)):
    """Distinct (level, category, subcategory) tuples for the Browse filter."""
    with conn() as c:
        rows = c.execute(
            """SELECT level, category, subcategory, COUNT(*) AS n
               FROM vocab_items
               GROUP BY level, category, subcategory
               ORDER BY level, category, subcategory"""
        ).fetchall()
    return {"categories": [dict(r) for r in rows]}
