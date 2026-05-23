"""Aggregated metrics for the /metrics view. The frontend builds the D3
charts; this endpoint just gives it the raw numbers."""
from fastapi import APIRouter, Depends

from ..auth import require_user
from ..db import conn, jload

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


@router.get("")
def get_metrics(user=Depends(require_user), days: int = 90):
    uid = user["id"]
    with conn() as c:
        # SRS box distribution + due today
        box_counts = {b: 0 for b in range(1, 6)}
        for r in c.execute(
            "SELECT box, COUNT(*) AS n FROM srs_state WHERE user_id = ? GROUP BY box",
            (uid,),
        ).fetchall():
            box_counts[r["box"]] = r["n"]

        # Items overall stats
        item_stats = c.execute(
            """SELECT COUNT(*) AS touched,
                      SUM(CASE WHEN starred THEN 1 ELSE 0 END) AS starred_count,
                      SUM(seen) AS total_seen, SUM(correct) AS total_correct,
                      SUM(wrong) AS total_wrong
               FROM srs_state WHERE user_id = ?""",
            (uid,),
        ).fetchone()

        history_rows = c.execute(
            """SELECT day, right_count, wrong_count, sessions, modes_json
               FROM history_day WHERE user_id = ? AND day >= date('now', ?)
               ORDER BY day ASC""",
            (uid, f"-{days} days"),
        ).fetchall()
        history = [
            {
                "day": r["day"],
                "right": r["right_count"],
                "wrong": r["wrong_count"],
                "sessions": r["sessions"],
                "modes": jload(r["modes_json"], {}),
            }
            for r in history_rows
        ]

        ai_rows = c.execute(
            """SELECT day, SUM(count) AS total FROM ai_calls
               WHERE user_id = ? AND day >= date('now', ?)
               GROUP BY day ORDER BY day""",
            (uid, f"-{days} days"),
        ).fetchall()
        ai = [{"day": r["day"], "total": r["total"]} for r in ai_rows]

    return {
        "boxes": box_counts,
        "items": dict(item_stats) if item_stats else {},
        "history": history,
        "ai": ai,
    }
