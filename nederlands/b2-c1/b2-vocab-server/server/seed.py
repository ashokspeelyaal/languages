"""First-boot seeding: bcrypt the USERS env into the users table, and load the
four vocabulary JSON files into vocab_items. Idempotent — re-running is safe.
"""
import json
from pathlib import Path

from .auth import hash_password
from .db import conn
from .settings import SEED_USERS, SEEDS_DIR


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
    """Load seeds/vocabulary_*.json into vocab_items if empty. Idempotent."""
    with conn() as c:
        existing = c.execute("SELECT COUNT(*) AS n FROM vocab_items").fetchone()["n"]
    if existing > 0:
        return 0

    files = [
        ("vocabulary_core.json", "core"),
        ("vocabulary_refresher.json", "refresher"),
        ("vocabulary_b2.json", "b2"),
        ("vocabulary_c1.json", "c1"),
    ]
    total = 0
    with conn() as c:
        c.execute("BEGIN")
        for fname, source_file in files:
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
                       (id, level, category, subcategory, dutch, english,
                        example_nl, example_en, core, source_file)
                       VALUES (?,?,?,?,?,?,?,?,?,?)""",
                    (
                        vid,
                        it.get("level") or "B2",
                        it.get("category"),
                        it.get("subcategory"),
                        it.get("dutch") or "",
                        it.get("english") or "",
                        it.get("exampleNL") or it.get("example_nl"),
                        it.get("exampleEN") or it.get("example_en"),
                        1 if it.get("core") else 0,
                        source_file,
                    ),
                )
                total += 1
        c.execute("COMMIT")
    return total


def run_seed() -> dict:
    users_created = seed_users()
    vocab_created = seed_vocab()
    return {"users_created": users_created, "vocab_created": vocab_created}
