"""XP, streak, achievements, history aggregation. Backed by user_kv + history_day."""
from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends

from ..auth import require_user
from ..db import conn, jdump, jload

router = APIRouter(prefix="/api/progress", tags=["progress"])


def _today() -> str:
    return date.today().isoformat()


def _get_kv(c, user_id: int, key: str, default):
    row = c.execute(
        "SELECT value FROM user_kv WHERE user_id = ? AND key = ?",
        (user_id, key),
    ).fetchone()
    return jload(row["value"], default) if row else default


def _set_kv(c, user_id: int, key: str, value):
    c.execute(
        """INSERT INTO user_kv (user_id, key, value) VALUES (?, ?, ?)
           ON CONFLICT (user_id, key) DO UPDATE SET value = excluded.value""",
        (user_id, key, jdump(value)),
    )


def _bump_streak(c, user_id: int) -> dict:
    streak = _get_kv(c, user_id, "streak", {"lastDay": None, "count": 0, "best": 0})
    today = _today()
    if streak["lastDay"] == today:
        return streak
    if not streak["lastDay"]:
        streak = {"lastDay": today, "count": 1, "best": 1}
    else:
        last = date.fromisoformat(streak["lastDay"])
        days = (date.today() - last).days
        count = streak["count"] + 1 if days == 1 else 1
        streak = {"lastDay": today, "count": count, "best": max(streak.get("best", 0), count)}
    _set_kv(c, user_id, "streak", streak)
    return streak


@router.get("")
def get_progress(user=Depends(require_user), days: int = 60):
    with conn() as c:
        xp = _get_kv(c, user["id"], "xp", 0)
        streak = _get_kv(c, user["id"], "streak", {"lastDay": None, "count": 0, "best": 0})
        achievements = _get_kv(c, user["id"], "achievements", {})

        # History buckets for last N days
        rows = c.execute(
            """SELECT day, right_count, wrong_count, sessions, modes_json
               FROM history_day WHERE user_id = ? AND day >= date('now', ?)
               ORDER BY day ASC""",
            (user["id"], f"-{days} days"),
        ).fetchall()
    history = {}
    for r in rows:
        history[r["day"]] = {
            "right": r["right_count"],
            "wrong": r["wrong_count"],
            "sessions": r["sessions"],
            "modes": jload(r["modes_json"], {}),
        }
    return {"xp": xp, "streak": streak, "achievements": achievements, "history": history}


@router.post("/bump-xp")
def bump_xp(body: dict, user=Depends(require_user)):
    """Add XP (capped per request) and bump streak. Called after each retrieval."""
    add = int(body.get("add", 0))
    add = max(0, min(50, add))
    with conn() as c:
        xp = int(_get_kv(c, user["id"], "xp", 0))
        xp += add
        _set_kv(c, user["id"], "xp", xp)
        streak = _bump_streak(c, user["id"])
    return {"xp": xp, "streak": streak}


@router.post("/unlock")
def unlock_achievement(body: dict, user=Depends(require_user)):
    """Server-side, the client tells us which achievement IDs it has earned.
    We trust the client's logic but stamp the date here (so a fresh device
    sees the historical achievement)."""
    ids = body.get("ids") or []
    today = date.today().isoformat()
    with conn() as c:
        ach = _get_kv(c, user["id"], "achievements", {})
        changed = False
        for aid in ids:
            if not isinstance(aid, str) or aid in ach:
                continue
            ach[aid] = {"date": today}
            changed = True
        if changed:
            _set_kv(c, user["id"], "achievements", ach)
    return {"achievements": ach}


@router.post("/reset")
def reset(user=Depends(require_user)):
    """Wipe everything user-specific. Vocab items remain; only this user's
    state is cleared."""
    uid = user["id"]
    with conn() as c:
        c.execute("DELETE FROM srs_state WHERE user_id = ?", (uid,))
        c.execute("DELETE FROM history_day WHERE user_id = ?", (uid,))
        c.execute("DELETE FROM user_kv WHERE user_id = ?", (uid,))
        c.execute("DELETE FROM custom_vocab WHERE user_id = ?", (uid,))
        c.execute("DELETE FROM chats WHERE user_id = ?", (uid,))
        c.execute("DELETE FROM essays WHERE user_id = ?", (uid,))
        c.execute("DELETE FROM writing_exercises WHERE user_id = ?", (uid,))
        c.execute("DELETE FROM listening_exercises WHERE user_id = ?", (uid,))
        c.execute("DELETE FROM exam_attempts WHERE user_id = ?", (uid,))
        c.execute("DELETE FROM ai_calls WHERE user_id = ?", (uid,))
    return {"ok": True}
