"""Built-in + custom vocabulary list.

GET /api/vocab — filterable, paginated. Combines vocab_items (shared) with
the caller's custom_vocab (per-user). Filters:

  level     'A1' | 'A2' | 'B1' | 'B2' | 'C1' (single or comma-separated)
  upto      'A1' | … — include all items at-or-below this level
  pos       'noun' | 'verb' | 'adj' | … (comma-separated)
  gender    'm' | 'f' | 'mf'
  category  prefix match (URL-decoded)
  core      '1' to restrict to core: true items
  q         free-text search on french + english + example_fr
  page      1-based; default 1
  page_size default 100, max 500

Response shape:
  {
    "items": [ {id, level, category, pos, gender, article, french, english, exampleFR, exampleEN, audioPhon, core, cognate, custom?: true}, … ],
    "total": <int after filter, before pagination>,
    "page": <int>,
    "page_size": <int>,
    "level_counts": { "A1": <int>, … }   # respects non-level filters; useful for chips
  }
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query

from ..auth import require_user
from ..db import conn

router = APIRouter(prefix="/api/vocab", tags=["vocab"])

LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1"]

BASE_COLS = (
    "id, level, category, subcategory, french, english, "
    "example_fr AS exampleFR, example_en AS exampleEN, "
    "gender, article, plural, pos, verb_group, audio_phon AS audioPhon, "
    "cognate, emoji, core"
)


def _split(s: Optional[str]) -> list:
    if not s:
        return []
    return [t.strip() for t in s.split(",") if t.strip()]


def _expand_upto(upto: Optional[str]) -> list:
    if not upto:
        return []
    upto = upto.upper().strip()
    if upto not in LEVEL_ORDER:
        return []
    idx = LEVEL_ORDER.index(upto)
    return LEVEL_ORDER[: idx + 1]


def _build_where(
    levels: list,
    poses: list,
    gender: Optional[str],
    category: Optional[str],
    core: Optional[str],
    q: Optional[str],
) -> tuple:
    where = []
    args: list = []
    if levels:
        where.append("level IN (" + ",".join("?" * len(levels)) + ")")
        args.extend(levels)
    if poses:
        where.append("pos IN (" + ",".join("?" * len(poses)) + ")")
        args.extend(poses)
    if gender:
        where.append("gender = ?")
        args.append(gender)
    if category:
        where.append("category LIKE ?")
        args.append(category + "%")
    if core == "1":
        where.append("core = 1")
    if q:
        where.append("(french LIKE ? OR english LIKE ? OR example_fr LIKE ?)")
        like = f"%{q}%"
        args.extend([like, like, like])
    return where, args


def _unified_cte(extra_where: list, cols: str) -> str:
    """A WITH-clause that UNION-ALLs vocab_items and custom_vocab using the
    same WHERE fragments on each side, with an `is_custom` discriminant.

    The per-user filter on the custom side is injected last so its `?`
    binding is appended after the per-side WHERE bindings.

    SQLite doesn't accept FROM ((SELECT) UNION (SELECT)) — inner parens
    around UNION sides aren't allowed in a subquery context. A WITH-clause
    sidesteps the issue and is more readable.
    """
    side = " AND ".join(extra_where) if extra_where else "1=1"
    return (
        f"WITH unified AS ("
        f"  SELECT {cols}, 0 AS is_custom FROM vocab_items WHERE {side} "
        f"  UNION ALL "
        f"  SELECT {cols}, 1 AS is_custom FROM custom_vocab WHERE ({side}) AND user_id = ? "
        f")"
    )


@router.get("")
def list_vocab(
    user=Depends(require_user),
    level: Optional[str] = Query(None),
    upto: Optional[str] = Query(None),
    pos: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    core: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=500),
):
    levels = _split(level) or _expand_upto(upto)
    poses = _split(pos)
    where, args = _build_where(levels, poses, gender, category, core, q)

    cte = _unified_cte(where, BASE_COLS)
    # The CTE references its own WHERE bindings TWICE (once per UNION side)
    # plus the user_id once on the custom side.
    cte_bindings = args + args + [user["id"]]

    with conn() as c:
        # Total
        total_row = c.execute(
            f"{cte} SELECT COUNT(*) AS n FROM unified",
            cte_bindings,
        ).fetchone()
        total = total_row["n"] if total_row else 0

        # Page
        offset = (page - 1) * page_size
        rows = c.execute(
            f"""{cte}
                SELECT * FROM unified
                ORDER BY
                  CASE level
                    WHEN 'A1' THEN 1 WHEN 'A2' THEN 2 WHEN 'B1' THEN 3
                    WHEN 'B2' THEN 4 WHEN 'C1' THEN 5 ELSE 9 END,
                  category, french
                LIMIT ? OFFSET ?""",
            cte_bindings + [page_size, offset],
        ).fetchall()

        # Level counts — same shape, but WITHOUT the level filter so the
        # chips reflect every level at the current pos/gender/category/q
        # selection.
        lvl_where, lvl_args = _build_where(
            [], poses, gender, category, core, q,
        )
        lvl_cte = _unified_cte(lvl_where, "level")
        lvl_bindings = lvl_args + lvl_args + [user["id"]]
        lvl_rows = c.execute(
            f"{lvl_cte} SELECT level, COUNT(*) AS n FROM unified GROUP BY level",
            lvl_bindings,
        ).fetchall()

    items = []
    for r in rows:
        d = dict(r)
        if d.pop("is_custom", 0):
            d["custom"] = True
        for k in ("subcategory", "plural", "verb_group", "audioPhon", "article", "emoji"):
            if d.get(k) is None:
                d.pop(k, None)
        items.append(d)

    level_counts = {lvl: 0 for lvl in LEVEL_ORDER}
    for r in lvl_rows:
        if r["level"] in level_counts:
            level_counts[r["level"]] = r["n"]

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "level_counts": level_counts,
    }


@router.get("/categories")
def list_categories(user=Depends(require_user)):
    """Flat list of distinct categories across vocab_items + custom_vocab.
    Used by the Parcourir category dropdown."""
    with conn() as c:
        rows = c.execute(
            """SELECT category, COUNT(*) AS n FROM (
                  SELECT category FROM vocab_items WHERE category IS NOT NULL
                  UNION ALL
                  SELECT category FROM custom_vocab WHERE user_id = ? AND category IS NOT NULL
               ) GROUP BY category ORDER BY category""",
            (user["id"],),
        ).fetchall()
    return [{"category": r["category"], "count": r["n"]} for r in rows]
