"""Leitner-style SRS state per user per item, plus the review endpoint.

Ported verbatim from Studeerkamer — the engine is language-agnostic.
"""
from datetime import date, timedelta

from fastapi import APIRouter, Body, Depends, HTTPException

from ..auth import require_user
from ..db import conn

router = APIRouter(prefix="/api/srs", tags=["srs"])

INTERVAL_DAYS = [0, 1, 2, 4, 9, 19]  # index = box


def _today() -> str:
    return date.today().isoformat()


def _next_due(box: int) -> str:
    box = max(1, min(5, box))
    return (date.today() + timedelta(days=INTERVAL_DAYS[box])).isoformat()


def _get_or_create_state(c, user_id: int, item_id: str) -> dict:
    row = c.execute(
        "SELECT * FROM srs_state WHERE user_id = ? AND item_id = ?",
        (user_id, item_id),
    ).fetchone()
    if row:
        return dict(row)
    c.execute(
        "INSERT INTO srs_state (user_id, item_id, box, due) VALUES (?, ?, 1, ?)",
        (user_id, item_id, _today()),
    )
    return {
        "user_id": user_id, "item_id": item_id, "box": 1,
        "seen": 0, "correct": 0, "wrong": 0,
        "last_seen": None, "due": _today(), "starred": 0,
    }


@router.get("/state")
def state(user=Depends(require_user)):
    """Map item_id → SRS state. Sparse: only items the user has touched."""
    with conn() as c:
        rows = c.execute(
            """SELECT item_id, box, seen, correct, wrong, last_seen, due, starred
               FROM srs_state WHERE user_id = ?""",
            (user["id"],),
        ).fetchall()
    out = {}
    for r in rows:
        out[r["item_id"]] = {
            "box": r["box"], "seen": r["seen"], "correct": r["correct"], "wrong": r["wrong"],
            "lastSeen": r["last_seen"], "due": r["due"], "starred": bool(r["starred"]),
        }
    return {"items": out}


@router.post("/review")
def review(body: dict = Body(...), user=Depends(require_user)):
    """Record one retrieval outcome.

    Body: { itemId, outcome }  outcome ∈ easy|good|correct|hard|wrong
    Server-side updates: box, seen/correct/wrong, last_seen, due, history_day.
    """
    item_id = body.get("itemId")
    outcome = body.get("outcome")
    if not item_id or outcome not in {"easy", "good", "correct", "hard", "wrong"}:
        raise HTTPException(400, "itemId + outcome (easy|good|correct|hard|wrong) required")

    with conn() as c:
        st = _get_or_create_state(c, user["id"], item_id)
        st["seen"] += 1
        st["last_seen"] = date.today().isoformat() + "T12:00:00Z"

        if outcome in {"hard", "wrong"}:
            st["wrong"] += 1
            st["box"] = 1
        elif outcome in {"good", "correct"}:
            st["correct"] += 1
            st["box"] = min(5, st["box"] + 1)
        elif outcome == "easy":
            st["correct"] += 1
            st["box"] = min(5, st["box"] + 2)

        st["due"] = _next_due(st["box"])

        c.execute(
            """UPDATE srs_state SET box=?, seen=?, correct=?, wrong=?,
                                    last_seen=?, due=?
               WHERE user_id = ? AND item_id = ?""",
            (st["box"], st["seen"], st["correct"], st["wrong"],
             st["last_seen"], st["due"], user["id"], item_id),
        )

        # History bucket for the day.
        today = _today()
        right = 1 if outcome in {"easy", "good", "correct"} else 0
        wrong = 1 - right
        c.execute(
            """INSERT INTO history_day (user_id, day, right_count, wrong_count)
               VALUES (?, ?, ?, ?)
               ON CONFLICT (user_id, day) DO UPDATE SET
                 right_count = right_count + ?, wrong_count = wrong_count + ?""",
            (user["id"], today, right, wrong, right, wrong),
        )

    return {"ok": True, "state": {
        "box": st["box"], "seen": st["seen"], "correct": st["correct"],
        "wrong": st["wrong"], "due": st["due"], "lastSeen": st["last_seen"],
    }}


@router.post("/star")
def star(body: dict = Body(...), user=Depends(require_user)):
    item_id = body.get("itemId")
    if not item_id:
        raise HTTPException(400, "itemId required")
    with conn() as c:
        _get_or_create_state(c, user["id"], item_id)
        cur = c.execute(
            "UPDATE srs_state SET starred = 1 - starred WHERE user_id = ? AND item_id = ? RETURNING starred",
            (user["id"], item_id),
        )
        row = cur.fetchone()
    return {"starred": bool(row["starred"]) if row else False}


@router.post("/session-start")
def session_start(body: dict = Body(...), user=Depends(require_user)):
    """Record that the user started a study session in a given mode."""
    mode = body.get("mode") or "unknown"
    today = _today()
    with conn() as c:
        row = c.execute(
            "SELECT modes_json, sessions FROM history_day WHERE user_id = ? AND day = ?",
            (user["id"], today),
        ).fetchone()
        from json import dumps, loads
        modes = loads(row["modes_json"]) if row and row["modes_json"] else {}
        modes[mode] = (modes.get(mode) or 0) + 1
        if row:
            c.execute(
                "UPDATE history_day SET sessions = sessions + 1, modes_json = ? WHERE user_id = ? AND day = ?",
                (dumps(modes), user["id"], today),
            )
        else:
            c.execute(
                "INSERT INTO history_day (user_id, day, sessions, modes_json) VALUES (?, ?, 1, ?)",
                (user["id"], today, dumps(modes)),
            )
    return {"ok": True}
