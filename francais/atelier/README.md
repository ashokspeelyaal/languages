# Atelier · Français A1 → C1

Server-backed French language trainer. Sibling of `nederlands/studeerkamer/`
but starting from zero (A1) instead of mid-intermediate (B2).

## Status

**Phase 0 — skeleton.** Auth, AI proxy, and the static SPA shell are
live. Feature views (browse, flashcards, conjugaison, grammaire,
chat, écrire, écouter, parler, examen, métriques) land in subsequent
phases. See `IMPLEMENTATION_PLAN.md` for the full plan and phase list.

## Run locally

```bash
cd francais/atelier
./run.sh            # first run creates .venv, installs deps, copies .env
```

Then open <http://127.0.0.1:15192> and log in with the credentials
you put in `USERS=` in `.env` (default: `ashok:change-me` — change it!).

## Architecture

```
atelier/
├── server/                        # FastAPI app
│   ├── main.py                    # app factory + login/logout endpoints
│   ├── auth.py                    # bcrypt + session cookie
│   ├── db.py                      # schema + sqlite3 helpers
│   ├── seed.py                    # USERS env → users table
│   ├── ai_proxy.py                # /api/ai/{complete,tts,transcribe,ocr,...}
│   ├── settings.py                # env loader
│   └── routes/                    # feature routes land here in Phase 1+
├── static/
│   ├── index.html                 # SPA shell
│   ├── login.html                 # login page (FR)
│   ├── manifest.webmanifest       # PWA
│   ├── service-worker.js          # offline shell + audio cache
│   ├── css/styles.css             # ported verbatim from Studeerkamer
│   └── js/                        # api.js + app.js (Phase 0 boot)
├── seeds/                         # vocabulary JSON (Phase 1+)
├── deploy/                        # systemd + nginx (Phase 11)
├── data/                          # SQLite + audio (gitignored)
├── .env.example
├── requirements.txt
└── run.sh                         # dev launcher (uvicorn --reload)
```

## Deploy

Once Phase 11 lands, deployment piggy-backs on the renamed
`.github/workflows/deploy-language-apps.yml` workflow: a push that
changes `francais/atelier/**` triggers only Atelier; a push that
changes `nederlands/studeerkamer/**` triggers only Studeerkamer; a
push touching both deploys both in parallel.

**Production topology**:
Cloudflare (TLS) → `francais.yaal.be` → nginx :80 → uvicorn :15192 →
SQLite + audio files on disk, same Hetzner box as Studeerkamer.
