"""First-boot user seeding. No vocab seed — this app generates content per-exercise."""
from .auth import hash_password
from .db import conn
from .settings import SEED_USERS


def seed_users() -> int:
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
    return {"users_created": seed_users()}
