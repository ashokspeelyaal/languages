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
                        pos, verb_group, audio_phon, cognate, core, source_file)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
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
                        1 if it.get("core") else 0,
                        source_file,
                    ),
                )
                total += 1
        c.execute("COMMIT")
    return total


def run_seed() -> dict:
    return {"users_created": seed_users(), "vocab_created": seed_vocab()}
