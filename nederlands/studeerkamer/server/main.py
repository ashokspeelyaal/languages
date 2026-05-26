"""FastAPI app entry. Wires up auth, AI proxy, all feature routes, and serves
the static SPA from /static (and / → /static/index.html via fallthrough)."""
import secrets
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from .ai_proxy import router as ai_router
from .auth import (
    SESSION_COOKIE,
    clear_cookie,
    create_session,
    destroy_session,
    get_user_id_by_name,
    require_user,
    set_cookie,
    verify_password,
)
from .db import conn, init_schema
from .seed import run_seed
from .settings import ALLOWED_ORIGIN, STATIC_DIR

from .routes import (
    audio_routes,
    chats_routes,
    custom_vocab_routes,
    exam_routes,
    listening_routes,
    metrics_routes,
    progress_routes,
    settings_routes,
    srs_routes,
    vocab_routes,
    writing_routes,
)


def create_app() -> FastAPI:
    init_schema()
    summary = run_seed()
    if summary["users_created"]:
        print(f"[seed] created {summary['users_created']} user(s) from USERS env")
    if summary["vocab_created"]:
        print(f"[seed] loaded {summary['vocab_created']} vocab items into DB")

    app = FastAPI(title="Studeerkamer", docs_url=None, redoc_url=None)

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
            raise HTTPException(401, "Verkeerde gebruikersnaam of wachtwoord.")
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

    # ---- Routers ----
    app.include_router(ai_router)
    app.include_router(vocab_routes.router)
    app.include_router(custom_vocab_routes.router)
    app.include_router(srs_routes.router)
    app.include_router(progress_routes.router)
    app.include_router(chats_routes.router)
    app.include_router(writing_routes.router)
    app.include_router(listening_routes.router)
    app.include_router(exam_routes.router)
    app.include_router(metrics_routes.router)
    app.include_router(settings_routes.router)
    app.include_router(audio_routes.router)

    # ---- Static SPA ----
    # /static/* serves everything in static/ verbatim.
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

    # PWA / iOS icon fallthrough — single transparent PNG until you upload real ones.
    @app.get("/favicon.ico")
    def favicon():
        ico = STATIC_DIR / "icons" / "favicon.ico"
        if ico.exists():
            return FileResponse(ico)
        return Response(status_code=204)

    return app


app = create_app()
