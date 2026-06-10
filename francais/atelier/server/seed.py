"""First-boot seeding.

- bcrypt the USERS env into the users table.
- load seeds/vocabulary_*.json into vocab_items.

Idempotent — re-running is safe.
"""
import json

from .auth import hash_password
from .db import conn
from .settings import SEED_USERS, SEEDS_DIR


SEED_FILES = [
    ("vocabulary_core.json", "core"),
    ("vocabulary_a1.json", "a1"),
    # Future: ("vocabulary_a2.json", "a2"), ("vocabulary_b1.json", "b1"), …
]

VERB_FORMS_SEED = "conjugation_irregular.json"


def seed_users() -> int:
    """Create any users from USERS env that don't yet exist. Returns count created."""
    if not SEED_USERS:
        return 0
    created = 0
    with conn() as c:
        for username, plain in SEED_USERS:
            row = c.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
            if row:
                continue
            c.execute(
                "INSERT INTO users (username, password_hash) VALUES (?, ?)",
                (username, hash_password(plain)),
            )
            created += 1
    return created


def seed_vocab() -> int:
    """Load seeds/vocabulary_*.json into vocab_items if empty.

    Idempotent — if the table already has rows, returns 0 without touching
    it. Re-seeding requires either truncating vocab_items or running a
    proper migration. (Future Phase 12+ admin endpoint.)
    """
    with conn() as c:
        existing = c.execute("SELECT COUNT(*) AS n FROM vocab_items").fetchone()["n"]
    if existing > 0:
        return 0

    total = 0
    with conn() as c:
        c.execute("BEGIN")
        for fname, source_file in SEED_FILES:
            path = SEEDS_DIR / fname
            if not path.exists():
                continue
            data = json.loads(path.read_text(encoding="utf-8"))
            items = data.get("items") if isinstance(data, dict) else data
            if not isinstance(items, list):
                continue
            for it in items:
                vid = it.get("id")
                if not vid:
                    continue
                c.execute(
                    """INSERT OR REPLACE INTO vocab_items
                       (id, level, category, subcategory, french, english,
                        example_fr, example_en, gender, article, plural,
                        pos, verb_group, audio_phon, cognate, emoji, core, source_file)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (
                        vid,
                        (it.get("level") or "A1").upper(),
                        it.get("category"),
                        it.get("subcategory"),
                        it.get("french") or "",
                        it.get("english") or "",
                        it.get("exampleFR") or it.get("example_fr"),
                        it.get("exampleEN") or it.get("example_en"),
                        it.get("gender"),
                        it.get("article"),
                        it.get("plural"),
                        it.get("pos"),
                        it.get("verb_group") or it.get("verbGroup"),
                        it.get("audioPhon") or it.get("audio_phon"),
                        1 if it.get("cognate") else 0,
                        it.get("emoji"),
                        1 if it.get("core") else 0,
                        source_file,
                    ),
                )
                total += 1
        c.execute("COMMIT")
    return total


def seed_verb_forms() -> int:
    """Load conjugation_irregular.json into verb_forms.

    Idempotent — bails if the table already has rows for any seeded lemma.
    To re-seed after editing the JSON, DELETE the affected rows manually
    (or wipe verb_forms entirely) and re-boot.

    The JSON nests per-lemma; we flatten to one row per (lemma, tense,
    person). The per-verb auxiliary + past participle are stored under
    a synthetic tense='_meta' with persons '_aux' / '_pp' — keeps the
    schema flat and the API single-table.
    """
    path = SEEDS_DIR / VERB_FORMS_SEED
    if not path.exists():
        return 0
    with conn() as c:
        existing = c.execute("SELECT COUNT(*) AS n FROM verb_forms").fetchone()["n"]
    if existing > 0:
        return 0

    data = json.loads(path.read_text(encoding="utf-8"))
    verbs = data.get("verbs") or {}
    total = 0
    with conn() as c:
        c.execute("BEGIN")
        for lemma, blob in verbs.items():
            aux = blob.get("auxiliary")
            pp = blob.get("past_participle")
            if aux:
                c.execute(
                    "INSERT OR REPLACE INTO verb_forms (lemma, tense, person, form) VALUES (?, '_meta', '_aux', ?)",
                    (lemma, aux),
                )
                total += 1
            if pp:
                c.execute(
                    "INSERT OR REPLACE INTO verb_forms (lemma, tense, person, form) VALUES (?, '_meta', '_pp', ?)",
                    (lemma, pp),
                )
                total += 1
            for tense, persons in blob.items():
                if tense in ("auxiliary", "past_participle"):
                    continue
                if not isinstance(persons, dict):
                    continue
                for person, form in persons.items():
                    c.execute(
                        """INSERT OR REPLACE INTO verb_forms (lemma, tense, person, form)
                           VALUES (?, ?, ?, ?)""",
                        (lemma, tense, person, form),
                    )
                    total += 1
        c.execute("COMMIT")
    return total


def run_seed() -> dict:
    return {
        "users_created": seed_users(),
        "vocab_created": seed_vocab(),
        "verb_forms_created": seed_verb_forms(),
    }
