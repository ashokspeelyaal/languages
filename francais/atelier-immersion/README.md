# Atelier Immersion · Français

One feature, done well: paste a French transcript + pick a CEFR level →
get a complete immersion package:

- **Vocabulary** with article, gender, IPA, English gloss, usage hint
- **Per-sentence exercises** — multiple-choice, fill-in-the-blank,
  word-reorder, true/false, translate
- **Audio** generated via OpenAI TTS
- **Karaoke sync** via Whisper word-level timings (click any word to
  seek and replay)

Sibling app to `atelier/` (which has full A1→C1 curriculum, SRS, etc.).
Immersion is **contextual learning** — you bring the text, the app
builds the lesson around it.

## Run locally

```bash
cd francais/atelier-immersion
./run.sh
```

Then open <http://127.0.0.1:15193> and log in with the credentials in
`.env` (`USERS=ashok:change-me` by default — change it).

Requires `OPENAI_API_KEY` in `.env` for the AI pipeline. Without one
you can still create draft exercises, but `/analyze`, `/audio`,
`/timings` will return 503.

## Architecture

```
atelier-immersion/
├── server/
│   ├── main.py              # FastAPI app: auth + AI proxy + immersion
│   ├── auth.py              # session cookie (cookie name: immersion_session)
│   ├── db.py                # 3 tables: users, sessions, immersion_exercises
│   ├── seed.py              # users from USERS env
│   ├── ai_proxy.py          # OpenAI /complete, /tts, /transcribe + Python helpers
│   ├── settings.py          # env loader (port 15193)
│   └── routes/
│       └── immersion_routes.py   # CRUD + analyze/audio/timings/run
├── static/
│   ├── index.html           # SPA shell
│   ├── login.html
│   ├── manifest.webmanifest
│   ├── service-worker.js
│   ├── css/styles.css       # purple-accent theme (vs atelier's blue)
│   └── js/
│       ├── api.js
│       ├── karaoke.js       # transcript-to-spans + Whisper-timing player
│       ├── exercise-widgets.js  # mc / blank / reorder / tf / translate
│       ├── views.js         # router + list / new / detail
│       └── app.js           # boot
├── data/                    # SQLite + audio files (gitignored)
├── requirements.txt
├── run.sh                   # dev launcher
├── .env.example
└── README.md
```

## Data model

One table — `immersion_exercises`:

| Column | Type | Purpose |
|---|---|---|
| `id` | TEXT PK | `im-` + 12-char random |
| `user_id` | INT FK | scopes to caller |
| `title`, `level` | TEXT | metadata |
| `status` | TEXT | `new` → `analyzing` → `analyzed` → `tts` → `audio_ready` → `timings` → `done` / `error` |
| `error_msg` | TEXT | populated on failure |
| `source_transcript` | TEXT | user input (≤ 6000 chars) |
| `vocab_json` | TEXT (JSON) | array of vocab items |
| `sentences_json` | TEXT (JSON) | array of `{idx, text, translation, exercises[]}` |
| `audio_path` | TEXT | server-side path to mp3 |
| `word_timings` | TEXT (JSON) | full-transcript Whisper timings |
| `user_progress` | TEXT (JSON) | per-exercise pass/fail (client-managed) |

## Lifecycle

```
POST /api/immersion                 → create row (status=new)
POST /api/immersion/{id}/run        → one-shot: analyze → tts → timings (~60s)
POST /api/immersion/{id}/analyze    → just GPT analysis (retryable)
POST /api/immersion/{id}/audio      → just TTS (retryable)
POST /api/immersion/{id}/timings    → just Whisper (retryable)
```

Each step is idempotent and the failing step records `error_msg` so
the user can retry from the dashboard.

## AI prompt design

The `analyze` endpoint sends one system prompt instructing GPT to
return strict JSON with `title`, `translation`, `vocab[]`, and
`sentences[]` — each sentence carrying 3-5 exercises chosen from
{mc, blank, reorder, tf, translate}. The prompt scales difficulty by
the chosen CEFR level. See `immersion_routes.py:ANALYSIS_SYSTEM`.
