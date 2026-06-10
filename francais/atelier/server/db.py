"""SQLite schema + connection helper. WAL mode, foreign keys on, JSON columns.

Phase 0 schema covers only the cross-cutting tables:
  - users + sessions          → auth
  - user_kv                   → per-user scalars (active_level, register, …)
  - ai_calls                  → AI proxy soft-cap + transparency

Feature tables (vocab_items, custom_vocab, srs_state, history_day,
chats, essays, writing/listening/spreken/exam) land in Phase 1+.
"""
import json
import sqlite3
from contextlib import contextmanager
from typing import Iterator

from .settings import DATABASE_PATH


SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions(expires_at);

-- User-level scalars (active_level, register, settings JSON, etc.) stored
-- as JSON in one row per (user, key) — avoids schema churn as we add fields.
CREATE TABLE IF NOT EXISTS user_kv (
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key      TEXT NOT NULL,
  value    TEXT NOT NULL,
  PRIMARY KEY (user_id, key)
);

-- AI call log per user per day per kind. Used for transparency + soft cap.
CREATE TABLE IF NOT EXISTS ai_calls (
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day      TEXT NOT NULL,
  kind     TEXT NOT NULL,
  count    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day, kind)
);
CREATE INDEX IF NOT EXISTS ai_calls_day_idx ON ai_calls(user_id, day);
"""


@contextmanager
def conn() -> Iterator[sqlite3.Connection]:
    """One connection per request. WAL + foreign keys are set on every connect
    because SQLite tracks those PRAGMAs per-connection."""
    c = sqlite3.connect(DATABASE_PATH, isolation_level=None, timeout=30.0)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA journal_mode=WAL")
    c.execute("PRAGMA foreign_keys=ON")
    c.execute("PRAGMA synchronous=NORMAL")
    try:
        yield c
    finally:
        c.close()


def init_schema() -> None:
    with conn() as c:
        c.executescript(SCHEMA)


def jdump(obj) -> str:
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))


def jload(s, default=None):
    if not s:
        return default
    try:
        return json.loads(s)
    except (json.JSONDecodeError, TypeError):
        return default


def row_to_dict(row: sqlite3.Row) -> dict:
    return dict(row) if row is not None else None
