# Studeerkamer · Nederlands B2 → C1 (server edition)

Server-backed port of the original `b2-vocabulary/` static app. Same UI, same
features (Flashcards · Browse · Generation · Cloze · Mixed · Chat · Essay ·
Schrijven · Examen · Luisteren · Metrics), but now backed by FastAPI +
SQLite so the same account works from Mac, iPhone, anywhere.

## What changed vs the original

| Thing | Before | Now |
|---|---|---|
| Storage | localStorage + IndexedDB on each device | SQLite + audio files on server |
| AI keys | In `localStorage` per browser | In server `.env` (one shared key) |
| Auth | None — single device | Cookie session, bcrypt user(s) seeded from `USERS` env |
| Devices | One browser at a time | Login on any device, same state |
| PWA | Could install but data per-device | Installable + truly cross-device |

The original `b2-c1/b2-vocabulary/` directory is **untouched**. This is the new home.

## Run locally

```bash
cd nederlands/studeerkamer
./run.sh            # first run creates .venv, installs deps, copies .env
```

Then open <http://127.0.0.1:8000> and log in with the credentials you put
in `USERS=` in `.env` (default: `ashok:change-me` — change it!).

## Deploy (CI/CD)

Deployment runs automatically via GitHub Actions on push to `main` whenever
files under `nederlands/studeerkamer/**` change. Same pattern as
`campuszeus-college`: rsync + venv + systemd + nginx on the Hetzner box
shared with that project.

**Topology**: Cloudflare (TLS) → `nederlands.yaal.be` → nginx :80 → uvicorn :15191 → SQLite + audio files on disk

### One-time setup (do this before the first push)

1. **GitHub Secrets** — repo Settings → Secrets and variables → Actions:

   | Secret | Value |
   |---|---|
   | `DEPLOY_SSH_KEY` | SSH private key with root@162.55.47.246 access (the same one campuszeus uses) |
   | `STUDEERKAMER_USERS` | `ashok:strong-password-here` — seeded on first boot |
   | `STUDEERKAMER_OPENAI_KEY` | optional fallback; per-user UI key wins |
   | `STUDEERKAMER_AZURE_KEY` | optional |
   | `STUDEERKAMER_AZURE_REGION` | optional, defaults to `westeurope` |

2. **Cloudflare DNS** — add an A record:
   - Name: `nederlands`
   - Value: `162.55.47.246`
   - Proxy: **on** (orange cloud)
   - SSL/TLS mode for the zone: **Full** (not Flexible)

### Deploying

```bash
git push origin main
```

If your changes are under `nederlands/studeerkamer/`, the workflow at
`.github/workflows/deploy-studeerkamer.yml` runs:
- Python syntax check (`compileall`)
- JS parse check (`node --check`)
- rsync code to `/opt/studeerkamer`
- create/refresh venv + install requirements
- write `.env` from secrets
- write systemd unit + nginx site (idempotent — fresh boxes self-bootstrap)
- restart `studeerkamer` + reload nginx
- health check `curl /api/health`

Manual run: Actions tab → "Deploy Studeerkamer" → Run workflow.

### Install as PWA

- **iPhone**: Safari → open the site → Share → "Add to Home Screen"
- **Mac**: Safari → File → Add to Dock; or Chrome → Install

### Adding a second user

Easiest: edit `STUDEERKAMER_USERS` to `ashok:pw1,partner:pw2` and re-deploy.
Seeding only creates users that don't yet exist; existing users keep their
hashed passwords.

## Architecture

```
studeerkamer/
├── server/                     # FastAPI app
│   ├── main.py                 # app factory + login/logout endpoints
│   ├── auth.py                 # bcrypt + session cookie
│   ├── db.py                   # schema + sqlite3 helpers
│   ├── seed.py                 # USERS env → users table; JSON → vocab_items
│   ├── ai_proxy.py             # /api/ai/{complete,tts,transcribe,ocr,usage}
│   ├── settings.py             # env loader
│   └── routes/                 # one file per feature area
├── static/
│   ├── index.html              # SPA shell
│   ├── login.html              # login page
│   ├── manifest.webmanifest    # PWA
│   ├── service-worker.js       # offline shell + SWR for /static
│   ├── icons/                  # PWA icons
│   ├── css/styles.css          # ported verbatim
│   └── js/                     # ported app — store layer rewritten to fetch
├── seeds/                      # the 4 vocab JSON files
├── deploy/
│   ├── Caddyfile               # auto-HTTPS reverse proxy
│   ├── studeerkamer.service    # systemd unit
│   └── deploy.sh               # rsync + restart from laptop
├── data/                       # SQLite + audio (gitignored)
├── .env.example
├── requirements.txt
└── run.sh                      # dev launcher (uvicorn --reload)
```

## Data model

SQLite, single DB at `data/b2vocab.db`. Schema in `server/db.py`.

- `users` + `sessions`: auth
- `vocab_items`: 1509 built-in items loaded from `seeds/` on first boot
- `custom_vocab`: per-user, grown via "Voeg toe aan corpus" flow
- `srs_state`: per-user Leitner box state per item
- `history_day` + `user_kv`: xp, streak, achievements, daily right/wrong counts
- `chats` + `chat_messages`: multi-thread chat
- `essays`: legacy `/essay` route history
- `writing_exercises`: Schrijven (incl. score, audio path, word timings)
- `listening_exercises`: Luisteren (incl. audio, vocab, grammar, questions)
- `exam_attempts`: CNaVT-C1-EP mock exam
- `ai_calls`: per-user/day/kind counters (transparency + soft cap)

Audio files live at `data/audio/<user_id>/<owner_type>/<owner_id>/<key>.mp3`.

## API surface

All routes under `/api/`. State-changing routes require:
- The session cookie (set after `POST /api/auth/login`)
- An `X-Requested-With: fetch` header (CSRF defence-in-depth)

`GET /api/health` is the only unauthenticated endpoint.

## Adding a second user

Easiest: edit `.env`, add `,partner:somepw` to `USERS=`, and **delete the DB
file** (`rm data/b2vocab.db`). Seed will recreate both users with bcrypt
hashes. The cleaner alternative is a one-liner inside the venv:

```python
from server.auth import hash_password
from server.db import conn
with conn() as c:
    c.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)",
              ("partner", hash_password("somepw")))
```
