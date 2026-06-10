"""First-boot seeding.

Phase 0: bcrypt the USERS env into the users table. Idempotent — re-running is safe.
Phase 1+ adds vocabulary loading from seeds/*.json.
"""
from .auth import hash_password
from .db import conn
from .settings import SEED_USERS


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


def run_seed() -> dict:
    return {"users_created": seed_users(), "vocab_created": 0}
