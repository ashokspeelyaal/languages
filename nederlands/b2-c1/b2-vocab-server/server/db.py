"""SQLite schema + connection helper. WAL mode, foreign keys on, JSON columns.

The schema covers every entity the original localStorage/IndexedDB-backed app
had: users + sessions for auth, vocab + custom vocab + SRS state for the core
study loop, chats + messages, essays, writing exercises, listening exercises,
exam attempts, per-user settings, AI call log, and a free-form key/value
scratch table for things like XP / achievements / streak.
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

-- Built-in vocabulary (loaded once from seeds/*.json). Identical across users.
CREATE TABLE IF NOT EXISTS vocab_items (
  id           TEXT PRIMARY KEY,
  level        TEXT NOT NULL,
  category     TEXT,
  subcategory  TEXT,
  dutch        TEXT NOT NULL,
  english      TEXT NOT NULL,
  example_nl   TEXT,
  example_en   TEXT,
  core         INTEGER NOT NULL DEFAULT 0,
  source_file  TEXT
);
CREATE INDEX IF NOT EXISTS vocab_level_idx ON vocab_items(level);
CREATE INDEX IF NOT EXISTS vocab_cat_idx ON vocab_items(category);

-- User-added vocab (from Luisteren/Schrijven "Voeg toe aan corpus" flow).
CREATE TABLE IF NOT EXISTS custom_vocab (
  id           TEXT PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level        TEXT NOT NULL,
  category     TEXT,
  subcategory  TEXT,
  dutch        TEXT NOT NULL,
  english      TEXT NOT NULL,
  example_nl   TEXT,
  example_en   TEXT,
  core         INTEGER NOT NULL DEFAULT 0,
  source       TEXT,
  source_id    TEXT,
  added_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS custom_vocab_user_idx ON custom_vocab(user_id);
CREATE INDEX IF NOT EXISTS custom_vocab_source_idx ON custom_vocab(user_id, source_id);

-- Per-user, per-item SRS state. Item id can refer to a vocab_items.id OR
-- a custom_vocab.id — we don't enforce FK so the row survives if a custom
-- item is deleted (cleanup happens lazily).
CREATE TABLE IF NOT EXISTS srs_state (
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id      TEXT NOT NULL,
  box          INTEGER NOT NULL DEFAULT 1,
  seen         INTEGER NOT NULL DEFAULT 0,
  correct      INTEGER NOT NULL DEFAULT 0,
  wrong        INTEGER NOT NULL DEFAULT 0,
  last_seen    TEXT,
  due          TEXT,
  starred      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, item_id)
);
CREATE INDEX IF NOT EXISTS srs_due_idx ON srs_state(user_id, due);
CREATE INDEX IF NOT EXISTS srs_box_idx ON srs_state(user_id, box);
CREATE INDEX IF NOT EXISTS srs_star_idx ON srs_state(user_id, starred);

-- Aggregated per-day history (for streak + metrics + dashboard).
CREATE TABLE IF NOT EXISTS history_day (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day         TEXT NOT NULL,
  right_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  sessions    INTEGER NOT NULL DEFAULT 0,
  modes_json  TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (user_id, day)
);

-- User-level scalars (xp, streak, achievements, settings) stored as JSON
-- in one row per (user, key) — avoids schema churn when we add new fields.
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

-- Chats + messages.
CREATE TABLE IF NOT EXISTS chats (
  id          TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'Nieuw gesprek',
  auto_titled INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS chats_user_idx ON chats(user_id, updated_at);

CREATE TABLE IF NOT EXISTS chat_messages (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id   TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role      TEXT NOT NULL,
  content   TEXT NOT NULL,
  ts        TEXT NOT NULL DEFAULT (datetime('now')),
  meta_json TEXT
);
CREATE INDEX IF NOT EXISTS chat_messages_chat_idx ON chat_messages(chat_id, id);

-- Standalone essay corrections (the /essay route — older, simpler than /schrijven).
CREATE TABLE IF NOT EXISTS essays (
  id           TEXT PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_text  TEXT NOT NULL,
  result_json  TEXT,
  level        TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS essays_user_idx ON essays(user_id, created_at);

-- Schrijven exercises (rich writing-correction with audio + score).
CREATE TABLE IF NOT EXISTS writing_exercises (
  id              TEXT PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL DEFAULT 'Nieuwe correctie',
  level           TEXT NOT NULL DEFAULT 'B2',
  source_essay    TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'new',
  error_msg       TEXT,
  sentences_json  TEXT,
  corrected_full  TEXT,
  vocab_json      TEXT,
  grammar_json    TEXT,
  score_json      TEXT,
  audio_path      TEXT,
  word_timings    TEXT,
  stt_text        TEXT,
  auto_titled     INTEGER NOT NULL DEFAULT 0,
  pushed_to_corpus INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS writing_user_idx ON writing_exercises(user_id, updated_at);

-- Listening exercises.
CREATE TABLE IF NOT EXISTS listening_exercises (
  id              TEXT PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL DEFAULT 'Nieuwe oefening',
  topic           TEXT NOT NULL DEFAULT '',
  level           TEXT NOT NULL DEFAULT 'B2',
  status          TEXT NOT NULL DEFAULT 'new',
  error_msg       TEXT,
  script          TEXT,
  questions_json  TEXT,
  vocab_json      TEXT,
  grammar_json    TEXT,
  audio_path      TEXT,
  word_timings    TEXT,
  stt_text        TEXT,
  user_answers    TEXT,
  auto_titled     INTEGER NOT NULL DEFAULT 0,
  pushed_to_corpus INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS listening_user_idx ON listening_exercises(user_id, updated_at);

-- Exam attempts (Lezen / Luisteren / Schrijven / Spreken).
CREATE TABLE IF NOT EXISTS exam_attempts (
  id              TEXT PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL DEFAULT 'CNaVT-C1-EP',
  title           TEXT NOT NULL,
  current_section TEXT NOT NULL DEFAULT 'lezen',
  sections_json   TEXT NOT NULL DEFAULT '{}',
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at    TEXT
);
CREATE INDEX IF NOT EXISTS exam_user_idx ON exam_attempts(user_id, updated_at);
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
