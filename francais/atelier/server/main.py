"""FastAPI app entry. Wires up auth + AI proxy and serves the static SPA shell.

Phase 0: no feature routes — those land starting Phase 1 (vocab, srs, chats,
writing/listening/spreken, exam, metrics, settings, audio).
"""
from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .ai_proxy import router as ai_router
from .auth import (
    SESSION_COOKIE,
    clear_cookie,
    create_session,
    destroy_session,
    require_user,
    set_cookie,
    verify_password,
)
from .db import conn, init_schema
from .seed import run_seed
from .settings import ALLOWED_ORIGIN, STATIC_DIR


def create_app() -> FastAPI:
    init_schema()
    summary = run_seed()
    if summary["users_created"]:
        print(f"[seed] created {summary['users_created']} user(s) from USERS env")

    app = FastAPI(title="Atelier", docs_url=None, redoc_url=None)

    if ALLOWED_ORIGIN:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[ALLOWED_ORIGIN],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.get("/api/health")
    def health():
        return {"ok": True}

    # ---- Auth ----
    @app.post("/api/auth/login")
    async def login(body: dict, response: Response):
        username = (body.get("username") or "").strip()
        password = body.get("password") or ""
        if not username or not password:
            raise HTTPException(400, "username + password required")
        with conn() as c:
            row = c.execute(
                "SELECT id, password_hash FROM users WHERE username = ?",
                (username,),
            ).fetchone()
        if not row or not verify_password(password, row["password_hash"]):
            raise HTTPException(401, "Nom d'utilisateur ou mot de passe incorrect.")
        token = create_session(row["id"])
        set_cookie(response, token)
        return {"ok": True, "username": username}

    @app.post("/api/auth/logout")
    async def logout(request: Request, response: Response):
        token = request.cookies.get(SESSION_COOKIE)
        if token:
            destroy_session(token)
        clear_cookie(response)
        return {"ok": True}

    @app.get("/api/auth/me")
    def me(user=Depends(require_user)):
        return {"username": user["username"]}

    # ---- Routers (Phase 0: AI only; feature routers land in Phase 1+) ----
    app.include_router(ai_router)

    # ---- Static SPA ----
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR), html=False), name="static")

    @app.get("/")
    def root():
        return FileResponse(STATIC_DIR / "index.html")

    @app.get("/login")
    def login_page():
        return FileResponse(STATIC_DIR / "login.html")

    @app.get("/manifest.webmanifest")
    def manifest():
        return FileResponse(STATIC_DIR / "manifest.webmanifest", media_type="application/manifest+json")

    @app.get("/service-worker.js")
    def sw():
        # Service worker MUST be served from / so its scope covers the whole app.
        return FileResponse(STATIC_DIR / "service-worker.js", media_type="application/javascript")

    @app.get("/favicon.ico")
    def favicon():
        ico = STATIC_DIR / "icons" / "favicon.ico"
        if ico.exists():
            return FileResponse(ico)
        return Response(status_code=204)

    return app


app = create_app()
