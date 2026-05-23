"""Session-cookie auth.

- Passwords are bcrypt-hashed (seeded from USERS env on first boot, then ignored).
- A login creates a random 32-byte token, stored in the sessions table.
- The token is sent back as an httponly, SameSite=Lax cookie.
- Subsequent requests pass through `require_user` (Depends) which loads the
  user row, or returns 401 if the cookie is missing/expired/unknown.
- For CSRF protection on state-changing requests we rely on SameSite=Lax
  cookies plus a custom header (X-Requested-With) — fine for our single-host
  setup; not designed to defend against subdomain takeovers.
"""
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import Cookie, Depends, HTTPException, Request, Response

from .db import conn


SESSION_COOKIE = "studeerkamer_session"
SESSION_DAYS = 30


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    if not plain or not hashed:
        return False
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_session(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    expires = (datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)).isoformat()
    with conn() as c:
        c.execute(
            "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
            (token, user_id, expires),
        )
    return token


def destroy_session(token: str) -> None:
    if not token:
        return
    with conn() as c:
        c.execute("DELETE FROM sessions WHERE token = ?", (token,))


def lookup_session(token: Optional[str]) -> Optional[dict]:
    if not token:
        return None
    now = datetime.now(timezone.utc).isoformat()
    with conn() as c:
        row = c.execute(
            """SELECT u.id AS id, u.username AS username
               FROM sessions s JOIN users u ON u.id = s.user_id
               WHERE s.token = ? AND s.expires_at > ?""",
            (token, now),
        ).fetchone()
    return dict(row) if row else None


def set_cookie(resp: Response, token: str) -> None:
    resp.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=SESSION_DAYS * 24 * 3600,
        httponly=True,
        samesite="lax",
        secure=False,  # set True when serving over HTTPS — Caddy handles that
        path="/",
    )


def clear_cookie(resp: Response) -> None:
    resp.delete_cookie(SESSION_COOKIE, path="/")


def require_user(
    request: Request,
    studeerkamer_session: Optional[str] = Cookie(default=None),
) -> dict:
    user = lookup_session(studeerkamer_session)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    # CSRF defence-in-depth: require X-Requested-With on writes.
    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        if request.headers.get("x-requested-with") != "fetch":
            raise HTTPException(status_code=403, detail="Missing X-Requested-With")
    return user


def get_user_id_by_name(username: str) -> Optional[int]:
    with conn() as c:
        row = c.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
    return row["id"] if row else None
