"""SQLite schema + connection helper. WAL mode, FK on, JSON columns.

Schema is intentionally tiny — just what immersion needs:
  - users + sessions (auth)
  - ai_calls (soft-cap + transparency for the AI proxy)
  - immersion_exercises (the single feature)

No vocab table, no SRS, no grammar, no conjugation. If you want those,
go to atelier/. This app is one feature, well-built.
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

-- AI call ledger (per-user, per-day, per-kind) for transparency + soft cap.
CREATE TABLE IF NOT EXISTS ai_calls (
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day      TEXT NOT NULL,
  kind     TEXT NOT NULL,
  count    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day, kind)
);

-- One row per exercise. Lifecycle in `status`:
--   new           -- just created, transcript stored
--   analyzing     -- GPT extracting vocab + exercises
--   tts           -- OpenAI TTS generating audio
--   timings       -- Whisper transcribing for word timings
--   done          -- ready to study
--   error         -- failed; see error_msg
--
-- The big nested fields live as JSON in TEXT columns:
--   vocab_json:     [{french, english, article, gender, pos, ipa, hint, sentence_index}]
--   sentences_json: [{idx, text, translation, exercises: [{type, …}], word_timings: [{word, start, end}]?}]
--   word_timings:   [{word, start, end}]   -- whole transcript, used by the karaoke player
CREATE TABLE IF NOT EXISTS immersion_exercises (
  id               TEXT PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL DEFAULT 'Nouvelle immersion',
  level            TEXT NOT NULL DEFAULT 'A2',
  status           TEXT NOT NULL DEFAULT 'new',
  error_msg        TEXT,
  source_transcript TEXT NOT NULL DEFAULT '',
  vocab_json       TEXT,
  sentences_json   TEXT,
  audio_path       TEXT,
  word_timings     TEXT,
  user_progress    TEXT,            -- per-exercise pass/fail flags
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at     TEXT
);
CREATE INDEX IF NOT EXISTS immersion_user_idx ON immersion_exercises(user_id, updated_at);
"""


@contextmanager
def conn() -> Iterator[sqlite3.Connection]:
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
