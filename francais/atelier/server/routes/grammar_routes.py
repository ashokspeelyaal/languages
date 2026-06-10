"""Grammar curriculum endpoint.

The topic catalog lives in seeds/grammar_topics.json — it's read once at
import time and cached in-memory. Per-user attempt counters live in the
`grammar_progress` table (one row per (user, topic_id)).

Endpoints
---------
GET  /api/grammar/topics             — full tree (lessons + drills) merged with this user's progress
POST /api/grammar/answer             — record one drill attempt: {topic_id, correct: bool}

A topic is *mastered* once `seen ≥ MASTERY_THRESHOLD_SEEN` AND
`correct/seen ≥ MASTERY_THRESHOLD_ACC`. We stamp `mastered_at` the first
time both conditions hold; the client surfaces this as a ✓ badge.
"""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path

from fastapi import APIRouter, Body, Depends, HTTPException

from ..auth import require_user
from ..db import conn
from ..settings import SEEDS_DIR

router = APIRouter(prefix="/api/grammar", tags=["grammar"])

MASTERY_THRESHOLD_SEEN = 20
MASTERY_THRESHOLD_ACC = 0.8

_topics_cache: list | None = None


def _load_topics() -> list:
    """Read seeds/grammar_topics.json. Cached in-process; clears on next boot."""
    global _topics_cache
    if _topics_cache is not None:
        return _topics_cache
    path = Path(SEEDS_DIR) / "grammar_topics.json"
    if not path.exists():
        _topics_cache = []
        return _topics_cache
    data = json.loads(path.read_text(encoding="utf-8"))
    _topics_cache = data.get("topics") or []
    return _topics_cache


@router.get("/topics")
def get_topics(user=Depends(require_user)):
    """Return the topic tree with this user's progress merged in.

    Each topic gets a `progress` field: {seen, correct, wrong, ratio,
    mastered: bool, mastered_at: iso|null}.
    """
    topics = _load_topics()
    with conn() as c:
        rows = c.execute(
            "SELECT topic_id, seen, correct, wrong, mastered_at FROM grammar_progress WHERE user_id = ?",
            (user["id"],),
        ).fetchall()
    progress_by_id = {r["topic_id"]: dict(r) for r in rows}

    out = []
    for t in topics:
        p = progress_by_id.get(t["id"], {"seen": 0, "correct": 0, "wrong": 0, "mastered_at": None})
        seen = p["seen"]
        correct = p["correct"]
        ratio = (correct / seen) if seen > 0 else 0.0
        out.append({
            **t,
            "progress": {
                "seen": seen,
                "correct": correct,
                "wrong": p["wrong"],
                "ratio": round(ratio, 2),
                "mastered": bool(p["mastered_at"]),
                "mastered_at": p["mastered_at"],
            },
        })
    return {"topics": out, "thresholds": {"seen": MASTERY_THRESHOLD_SEEN, "accuracy": MASTERY_THRESHOLD_ACC}}


@router.post("/answer")
def post_answer(body: dict = Body(...), user=Depends(require_user)):
    """Record one drill attempt and return the updated progress for that topic.

    Body: {topic_id, correct: bool}.
    Side-effects:
      - upsert grammar_progress (seen/correct/wrong increments).
      - stamp mastered_at the first time both thresholds are met.
      - bump history_day right/wrong counts (treats grammar drills as
        review events alongside flashcards).
    """
    topic_id = body.get("topic_id")
    if not topic_id:
        raise HTTPException(400, "topic_id required")
    correct = bool(body.get("correct"))

    # Look up the topic level for the denormalized `level` column on
    # grammar_progress. Falls back to "A1" if the topic id isn't known.
    topics = _load_topics()
    level = next((t["level"] for t in topics if t["id"] == topic_id), "A1")

    today = date.today().isoformat()
    with conn() as c:
        # Upsert grammar_progress
        c.execute(
            """INSERT INTO grammar_progress (user_id, topic_id, level, seen, correct, wrong)
               VALUES (?, ?, ?, 1, ?, ?)
               ON CONFLICT (user_id, topic_id) DO UPDATE SET
                 seen = seen + 1,
                 correct = correct + ?,
                 wrong   = wrong + ?""",
            (user["id"], topic_id, level,
             1 if correct else 0, 0 if correct else 1,
             1 if correct else 0, 0 if correct else 1),
        )
        row = c.execute(
            "SELECT seen, correct, wrong, mastered_at FROM grammar_progress WHERE user_id = ? AND topic_id = ?",
            (user["id"], topic_id),
        ).fetchone()
        seen, corr, wrong, mastered_at = row["seen"], row["correct"], row["wrong"], row["mastered_at"]
        ratio = corr / seen if seen else 0.0
        # Stamp mastery once thresholds are hit (only the first time).
        if not mastered_at and seen >= MASTERY_THRESHOLD_SEEN and ratio >= MASTERY_THRESHOLD_ACC:
            c.execute(
                "UPDATE grammar_progress SET mastered_at = ? WHERE user_id = ? AND topic_id = ?",
                (today, user["id"], topic_id),
            )
            mastered_at = today

        # Mirror into history_day so the dashboard "today" counter and
        # streak include grammar-drill activity.
        right = 1 if correct else 0
        wrong_inc = 1 - right
        c.execute(
            """INSERT INTO history_day (user_id, day, right_count, wrong_count)
               VALUES (?, ?, ?, ?)
               ON CONFLICT (user_id, day) DO UPDATE SET
                 right_count = right_count + ?, wrong_count = wrong_count + ?""",
            (user["id"], today, right, wrong_inc, right, wrong_inc),
        )

    return {
        "ok": True,
        "progress": {
            "seen": seen, "correct": corr, "wrong": wrong,
            "ratio": round(ratio, 2),
            "mastered": bool(mastered_at),
            "mastered_at": mastered_at,
        },
    }
