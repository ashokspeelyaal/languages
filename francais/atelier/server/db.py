"""SQLite schema + connection helper. WAL mode, foreign keys on, JSON columns.

Phase 1 schema:
  - users + sessions          → auth
  - user_kv                   → per-user scalars (active_level, register, …)
  - ai_calls                  → AI proxy soft-cap + transparency
  - vocab_items               → built-in vocabulary (from seeds/*.json)
  - custom_vocab              → user-added vocabulary
  - verb_forms                → irregular verb conjugations
  - grammar_progress          → per-user per-topic progress (Phase 5)
  - history_day               → per-day right/wrong counts (Phase 2)

SRS state + chats/writing/listening/spreken/exam tables land in their
respective phases.
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

-- Built-in vocabulary (loaded once from seeds/*.json). Identical across users.
CREATE TABLE IF NOT EXISTS vocab_items (
  id           TEXT PRIMARY KEY,
  level        TEXT NOT NULL,
  category     TEXT,
  subcategory  TEXT,
  french       TEXT NOT NULL,
  english      TEXT NOT NULL,
  example_fr   TEXT,
  example_en   TEXT,
  gender       TEXT,           -- 'm' / 'f' / 'mf' / null
  article      TEXT,           -- 'le' / 'la' / 'l'' / 'les' / null
  plural       TEXT,           -- irregular plural form, null otherwise
  pos          TEXT,           -- 'noun' / 'verb' / 'adj' / 'adv' / 'prep' / 'conj' / 'pron' / 'det' / 'interj'
  verb_group   TEXT,           -- '1' (-er) / '2' (-ir/-iss) / '3' (irreg/-re/-oir) / null
  audio_phon   TEXT,           -- IPA transcription
  cognate      INTEGER NOT NULL DEFAULT 0,
  core         INTEGER NOT NULL DEFAULT 0,
  source_file  TEXT
);
CREATE INDEX IF NOT EXISTS vocab_level_idx ON vocab_items(level);
CREATE INDEX IF NOT EXISTS vocab_cat_idx ON vocab_items(category);
CREATE INDEX IF NOT EXISTS vocab_pos_idx ON vocab_items(pos);

-- User-added vocab (from Écrire/Écouter/Parler "+corpus" flow).
CREATE TABLE IF NOT EXISTS custom_vocab (
  id           TEXT PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level        TEXT NOT NULL,
  category     TEXT,
  subcategory  TEXT,
  french       TEXT NOT NULL,
  english      TEXT NOT NULL,
  example_fr   TEXT,
  example_en   TEXT,
  gender       TEXT,
  article      TEXT,
  plural       TEXT,
  pos          TEXT,
  verb_group   TEXT,
  audio_phon   TEXT,
  cognate      INTEGER NOT NULL DEFAULT 0,
  core         INTEGER NOT NULL DEFAULT 0,
  source       TEXT,
  source_id    TEXT,
  added_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS custom_vocab_user_idx ON custom_vocab(user_id);
CREATE INDEX IF NOT EXISTS custom_vocab_source_idx ON custom_vocab(user_id, source_id);

-- Irregular verb conjugations. Regular verbs (groups 1+2) are generated
-- on the fly from rules in static/js/conjugation-rules.js; only irregular
-- forms persist here. ~50 verbs × 8 tenses × 6 persons ≈ 2400 rows.
CREATE TABLE IF NOT EXISTS verb_forms (
  lemma      TEXT NOT NULL,
  tense      TEXT NOT NULL,           -- 'present', 'passe_compose', 'imparfait', …
  person     TEXT NOT NULL,           -- 'je', 'tu', 'il', 'nous', 'vous', 'ils'
  form       TEXT NOT NULL,
  audio_phon TEXT,
  PRIMARY KEY (lemma, tense, person)
);
CREATE INDEX IF NOT EXISTS verb_forms_lemma_idx ON verb_forms(lemma);

-- Per-user grammar topic progress (Phase 5 uses this).
CREATE TABLE IF NOT EXISTS grammar_progress (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id    TEXT NOT NULL,
  level       TEXT NOT NULL,
  seen        INTEGER NOT NULL DEFAULT 0,
  correct     INTEGER NOT NULL DEFAULT 0,
  wrong       INTEGER NOT NULL DEFAULT 0,
  mastered_at TEXT,
  PRIMARY KEY (user_id, topic_id)
);
CREATE INDEX IF NOT EXISTS grammar_progress_level_idx ON grammar_progress(user_id, level);

-- Per-user, per-item Leitner SRS state. item_id can refer to either a
-- vocab_items.id OR a custom_vocab.id — no FK so rows survive if a custom
-- item is later deleted (cleanup happens lazily).
CREATE TABLE IF NOT EXISTS srs_state (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id    TEXT NOT NULL,
  box        INTEGER NOT NULL DEFAULT 1,
  seen       INTEGER NOT NULL DEFAULT 0,
  correct    INTEGER NOT NULL DEFAULT 0,
  wrong      INTEGER NOT NULL DEFAULT 0,
  last_seen  TEXT,
  due        TEXT,
  starred    INTEGER NOT NULL DEFAULT 0,
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
