# Atelier · Français A1 → C1 — Implementation Plan

Server-backed language trainer for French, modelled on
`nederlands/studeerkamer/` but **starting from zero** (A1) instead of
mid-intermediate (B2). Same architecture (FastAPI + SQLite + vanilla JS
SPA + PWA), same feature surface, but adapted for the French language
and a beginner-first learning curve.

> **Naming.** The Dutch app is "Studeerkamer" (study room). For French I
> propose **"Atelier"** (workshop) — short, French, evokes hands-on
> practice rather than passive reading. If you prefer a different name
> (Bureau, Salon, Cabinet, Studio…) we rename one folder + a handful of
> string constants. Pick before we generate code; cheap to change now,
> expensive once seeds + DB + nginx + systemd reference it.

> **Working assumptions.** Where the Dutch app made an opinionated
> choice (port number, domain, voice provider), this plan picks the
> next-free analog and flags it as ⚙️. Confirm or override before code.

---

## 1. North-star differences vs Studeerkamer

| Concern | Studeerkamer (NL) | Atelier (FR) |
|---|---|---|
| Level range | B2 → C1 (plus A2/B1 refresher seed) | **A1 → C1** (5 CEFR levels, A1 is home) |
| Active level UI | Implicit; everything assumes B2/C1 | **Global level chooser** in topbar, persists in `user_kv.active_level`; every view filters/scales to it |
| Vocabulary scope | ~9 000 items, B2-heavy | Will grow ~12-15 k items; A1/A2 carry most of the weight at launch |
| Grammar focus | Word order, separable verbs, modal verbs, perfect tenses | **Gender** (le/la), **conjugation tables** across many tenses, **pronoun ordering** (me te le la lui leur y en), **agreement** rules, **partitive articles** |
| Verb trainer | `werkwoorden-views.js` — separable verbs, perfect tense | `conjugaison-views.js` — full conjugation drill across présent / passé composé / imparfait / futur / conditionnel / subjonctif, by group (-er / -ir / -re / irreguliers) |
| Audio voices | Ellen (BE-nl) + Xander (NL-nl) for dialect contrast | Denise (FR-FR) + Henri (FR-FR) for M/F contrast; optional Quebec voice (FR-CA) for register contrast (⚙️) |
| Exam | CNaVT-C1-EP mock (Dutch C1) | **DELF/DALF mocks**: A1, A2, B1, B2 (DELF) + C1 (DALF). Each level its own template |
| Chat persona | Generic Dutch tutor | French tutor with explicit register switch (tutoiement/vouvoiement) |
| Translations | NL ↔ EN | **FR ↔ EN** by default; add FR ↔ NL as a settings toggle since the user already studies Dutch — same `english` column but rename UI label / add `dutch` column (⚙️ decide) |
| Audio TTS engine | OpenAI TTS + optional Azure for BE-NL | OpenAI TTS (alloy/nova good in FR) + optional Azure (FR-FR-DeniseNeural / FR-FR-HenriNeural / FR-CA-SylvieNeural) |
| Domain | `nederlands.yaal.be` | `francais.yaal.be` (⚙️) |
| Internal port | 15191 | **15192** (next free, ⚙️) |
| SQLite file | `data/b2vocab.db` | `data/frvocab.db` |

---

## 2. CEFR level model + global level chooser

This is the single biggest UX departure from the Dutch app. Every view
must read the **active level** from a single source of truth and adapt.

### 2.1 Level definitions

```js
LEVELS = [
  { id: 'A1', label: 'A1 · Débutant',         color: '#22c55e' },
  { id: 'A2', label: 'A2 · Élémentaire',      color: '#84cc16' },
  { id: 'B1', label: 'B1 · Intermédiaire',    color: '#eab308' },
  { id: 'B2', label: 'B2 · Avancé',           color: '#f97316' },
  { id: 'C1', label: 'C1 · Autonome',         color: '#ef4444' },
]
```

C2 is intentionally out of scope for v1 — the gap from C1 → C2 is more
about exposure than trainable drills; we'll add it once C1 is solid.

### 2.2 Storage + propagation

- `user_kv` row: `key='active_level'`, `value='A1'` (default at signup).
- `GET /api/me` returns `active_level` alongside `username`; client
  caches it in `window.state.activeLevel`.
- `PUT /api/settings/active_level` `{level: 'A2'}` updates DB + emits a
  client-side `level-changed` event that every view listens for to
  re-render.
- Level chooser sits in the **topbar** as a 5-pill segmented control,
  always visible (collapses to a `<select>` on narrow widths). Active
  pill matches the level's brand color.

### 2.3 Per-view behavior

| View | How `activeLevel` influences it |
|---|---|
| Dashboard | XP, streak, due cards filtered to items at-or-below active level by default. Toggle "tous niveaux" reveals everything. |
| Browse | Default filter = exactly the active level; chips for the other 4 levels show counts at a glance. |
| Flashcards / Generation / Cloze / Mixed | Item pool = active level + every lower level (you don't forget A1 when you reach B1). "Strict" toggle restricts to exactly the active level. |
| Grammatica | Curriculum tree shows lessons up to and including active level; higher-level lessons greyed with a lock icon ("débloque B1 d'abord"). |
| Conjugaison | Tenses unlock by level: A1 = présent + impératif; A2 + passé composé + futur proche + imparfait; B1 + futur simple + conditionnel présent; B2 + subjonctif présent + plus-que-parfait; C1 + subjonctif imparfait/plus-que-parfait + passé simple (recognition only) + conditionnel passé. |
| Chat | System prompt receives `activeLevel`; tutor matches register, sentence length, vocabulary range to it. |
| Schrijven (Écrire) | Prompts scaled to level; scoring rubric uses level-specific descriptors from CEFR self-assessment grid. |
| Luisteren (Écouter) | TTS speech rate + script complexity scale with level (A1: ~140 wpm + simple sentences; C1: native rate + idioms). |
| Spreken (Parler) | Pronunciation evaluation thresholds relax for A1/A2 (focus on intelligibility, not perfection). |
| Examen | DELF A1 / A2 / B1 / B2 + DALF C1 templates; active level picks the default but you can override. |
| Metrics | Histograms grouped by level so you see distribution of progress across A1 → C1. |

### 2.4 Why "active level" instead of "set my level once and stick"

Adult learners revisit lower levels constantly. We want one switch that
says "today I'm drilling A1 articles" and another that says "I want a
C1 chat about the news". The dashboard's "weakest items" list also
needs to span levels, which the toggle gives us for free.

---

## 3. Directory layout

```
francais/atelier/
├── server/                        # FastAPI app
│   ├── main.py                    # app factory + login/logout + level routes
│   ├── auth.py                    # bcrypt + session cookie (verbatim port)
│   ├── db.py                      # schema below
│   ├── seed.py                    # USERS env + seeds/*.json → DB
│   ├── ai_proxy.py                # /api/ai/{complete,tts,transcribe,ocr,usage}
│   ├── settings.py                # env loader
│   ├── french_voice.py            # FR-FR + FR-CA voice config + Azure SSML helpers
│   └── routes/
│       ├── vocab_routes.py
│       ├── custom_vocab_routes.py
│       ├── srs_routes.py
│       ├── progress_routes.py
│       ├── chats_routes.py
│       ├── writing_routes.py      # Écrire
│       ├── listening_routes.py    # Écouter
│       ├── spreken_routes.py      # Parler
│       ├── exam_routes.py         # DELF/DALF
│       ├── conjugation_routes.py  # NEW: drill + lookup + verify
│       ├── grammar_routes.py      # NEW: progress per topic
│       ├── metrics_routes.py
│       ├── settings_routes.py     # incl. active_level, register, dialect
│       └── audio_routes.py
├── static/
│   ├── index.html                 # SPA shell, language="fr"
│   ├── login.html
│   ├── manifest.webmanifest
│   ├── service-worker.js
│   ├── icons/                     # new "FR" mark icons (180/192/512)
│   ├── css/styles.css             # ported + level-pill styles
│   └── js/
│       ├── api.js                 # fetch wrapper, csrf header
│       ├── state.js               # adds activeLevel + level-changed event
│       ├── srs.js
│       ├── match.js               # FR accent-folding + elision-aware match
│       ├── speech.js              # voice list = Denise / Henri / Sylvie
│       ├── ai.js
│       ├── audio.js
│       ├── views.js               # router + dashboard + browse + flashcard etc.
│       ├── conjugation-views.js   # NEW
│       ├── grammar-views.js       # ported from grammatica-views.js
│       ├── ai-views.js            # chat
│       ├── writing-views.js       # Écrire
│       ├── listening-views.js     # Écouter
│       ├── spreken-views.js       # Parler
│       ├── exam-views.js          # DELF/DALF
│       ├── radio-views.js         # ported, FR radio stations preset
│       ├── metrics.js
│       ├── level-picker.js        # NEW: topbar segmented control
│       ├── selection-bar.js
│       ├── handwriting.js
│       ├── wav-encoder.js
│       └── offline.js
├── seeds/                         # JSON corpora (see §5)
│   ├── vocabulary_core.json
│   ├── vocabulary_a1.json
│   ├── vocabulary_a2.json
│   ├── vocabulary_b1.json
│   ├── vocabulary_b2.json
│   ├── vocabulary_c1.json
│   ├── conjugation_irregular.json # 50 most common irregular verbs, all tenses
│   ├── grammar_topics.json        # curriculum tree A1 → C1
│   ├── exam_templates_delf.json
│   └── radio_stations.json        # France Inter, FIP, RFI Monde, Radio-Canada…
├── scripts/
│   ├── generate-verbs.py          # GPT-batch fill of conjugation_irregular.json
│   ├── seed-from-frequency.py     # take a frequency list, gloss top-N with GPT
│   └── audit-gender.py            # cross-check le/la against a wiktionary dump
├── deploy/
│   ├── nginx-atelier.conf
│   └── atelier.service
├── data/                          # SQLite + audio (gitignored)
├── .env.example
├── .gitignore
├── requirements.txt               # same as NL: fastapi, uvicorn, bcrypt, httpx, dotenv
├── run.sh                         # dev launcher (verbatim port)
└── README.md
```

---

## 4. Data model

Reuse Studeerkamer's schema with **column renames + 2 new tables**.
Renaming `dutch` → `french` is the only intrusive change; everything
else (SRS, history, KV, AI calls, chats, essays, writing/listening/
spreken/exam) ports verbatim with column-name swap.

### 4.1 Renamed columns

| Old (NL) | New (FR) |
|---|---|
| `vocab_items.dutch` | `vocab_items.french` |
| `vocab_items.example_nl` | `vocab_items.example_fr` |
| `custom_vocab.dutch` | `custom_vocab.french` |
| `custom_vocab.example_nl` | `custom_vocab.example_fr` |
| `writing_exercises.level` default `'B2'` | default `'A1'` |
| `listening_exercises.level` default `'B2'` | default `'A1'` |
| `spreken_exercises.level` default `'B2'` | default `'A1'` |
| `exam_attempts.type` default `'CNaVT-C1-EP'` | default `'DELF-A1'` |

### 4.2 New columns on `vocab_items`

```sql
gender        TEXT,    -- 'm' / 'f' / 'mf' / null (for non-nouns)
article       TEXT,    -- 'le' / 'la' / 'l\'' / 'les' (display hint)
plural        TEXT,    -- irregular plurals only ('yeux', 'travaux', …)
pos           TEXT,    -- 'noun' / 'verb' / 'adj' / 'adv' / 'prep' / …
verb_group    TEXT,    -- '1' (-er), '2' (-ir/-iss), '3' (irreg/-re/-oir), null
audio_phon    TEXT,    -- IPA phonetic transcription (for A1 pronunciation cards)
```

Mirror columns on `custom_vocab`.

### 4.3 New tables

```sql
-- One row per (lemma, tense, person). Looked up by conjugation drill
-- + lookup. Regular verbs are generated on the fly from rules; only
-- irregulars get persisted here. ~50 irregulars × 8 tenses × 6 persons
-- ≈ 2 400 rows.
CREATE TABLE IF NOT EXISTS verb_forms (
  lemma     TEXT NOT NULL,             -- 'être', 'avoir', 'aller', …
  tense     TEXT NOT NULL,             -- 'present', 'passe_compose', …
  person    TEXT NOT NULL,             -- 'je', 'tu', 'il', 'nous', 'vous', 'ils'
  form      TEXT NOT NULL,             -- 'suis', 'as', 'va', …
  audio_phon TEXT,
  PRIMARY KEY (lemma, tense, person)
);
CREATE INDEX IF NOT EXISTS verb_forms_lemma_idx ON verb_forms(lemma);

-- Per-user grammar topic progress: each topic in seeds/grammar_topics.json
-- has a stable id; we track seen/correct/wrong like a coarser SRS.
CREATE TABLE IF NOT EXISTS grammar_progress (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id   TEXT NOT NULL,
  level      TEXT NOT NULL,            -- denormalized for fast filter
  seen       INTEGER NOT NULL DEFAULT 0,
  correct    INTEGER NOT NULL DEFAULT 0,
  wrong      INTEGER NOT NULL DEFAULT 0,
  mastered_at TEXT,                    -- timestamp when correct ≥ N and ratio ≥ M
  PRIMARY KEY (user_id, topic_id)
);
CREATE INDEX IF NOT EXISTS grammar_progress_level_idx ON grammar_progress(user_id, level);
```

### 4.4 Migration story

There is none — this is a greenfield DB at `data/frvocab.db`. The
schema is created from scratch on first boot. We do **not** try to
import data from `b2vocab.db`.

---

## 5. Seed corpora (the slow part)

This is where most of the wall-clock goes. Plan by level.

### 5.1 Sizing target

| Level | Items | Notes |
|---|---|---|
| Core | ~150 | Closed-class: articles, pronouns, demonstratives, prepositions, conjunctions, question words, negation. Identical across all users. |
| A1 | ~700 | CEFR A1 wordlist + 300 most-frequent French words. Foods, family, time, body, basic verbs, numbers, colors. |
| A2 | ~1 200 | Daily life, work, travel, health, basic opinions. |
| B1 | ~2 500 | Abstract topics, work scenarios, recounting events. |
| B2 | ~3 500 | Argumentation, media, culture, social issues. |
| C1 | ~3 000 | Nuance, register, idioms, specialist topics. |
| **Total** | **~11 000** | First-class plus user-grown corpus via "Ajouter au corpus" flow. |

### 5.2 Generation strategy

Three sources, in priority order, deduped on lemma:

1. **CEFR official wordlists** (RFI/CIEP A1-B2 référentiels) — manually
   ingest as plaintext, GPT-batched into JSON with example_fr +
   example_en + gender/article.
2. **Frequency list** (Lexique 3.83, top-15 000) — fill the long tail.
3. **User additions** — Écrire / Écouter / Parler all surface "ajouter
   au corpus" buttons that route into `custom_vocab` (this is the
   Studeerkamer flow, ported verbatim).

`scripts/seed-from-frequency.py` accepts a CSV of `(lemma, frequency)`
and produces the appropriate `vocabulary_<level>.json`. Run once per
level, hand-review, commit.

### 5.3 Seed JSON shape

Same as NL, with new columns. Example:

```json
{
  "id": "a1-0042",
  "level": "A1",
  "category": "Family",
  "pos": "noun",
  "gender": "m",
  "article": "le",
  "plural": null,
  "french": "frère",
  "english": "brother",
  "exampleFR": "Mon frère habite à Lyon.",
  "exampleEN": "My brother lives in Lyon.",
  "audioPhon": "/fʁɛʁ/",
  "core": false
}
```

For verbs, include the infinitive in `french` and use `verb_group`:

```json
{
  "id": "a1-0099",
  "level": "A1",
  "category": "Verbs · Daily life",
  "pos": "verb",
  "verb_group": "1",
  "french": "manger",
  "english": "to eat",
  "exampleFR": "Je mange une pomme.",
  "exampleEN": "I'm eating an apple."
}
```

The conjugation engine reads `pos='verb' AND verb_group IS NOT NULL`
to know what to drill.

---

## 6. French-specific UX details

These are the deltas that beginners notice — getting them right is
what makes the app feel "for French" rather than a translated UI.

### 6.1 Gender display

Every noun in Flashcards / Browse / Cloze shows the article inline
when revealing the answer (`le frère`, `la sœur`), and the article
chip is colored (blue for `le`, pink for `la`, purple for `les`)
because color memory is faster than reading.

A1/A2 strict mode for Generation: typing `frère` is **wrong**, must
type `le frère` (or have the article auto-prefixed and only the noun
expected). Setting toggles this.

### 6.2 Accent-folding match

Studeerkamer's `match.js` does case-folding. French needs more:

- `é/è/ê/ë → e`, `à/â → a`, `î/ï → i`, `ô → o`, `ù/û/ü → u`, `ç → c`,
  `œ → oe`, `æ → ae`.
- Apostrophe normalization: `l’` ↔ `l'`, `c’` ↔ `c'`.
- Trailing punctuation strip stays.

Match is **lenient by default, strict on toggle**. Strict mode tells
A1 learners they wrote `etre` not `être`; lenient mode accepts so they
can move on. Persist toggle per-user in `user_kv`.

### 6.3 Conjugation drill (`conjugaison-views.js`)

Four modes:

1. **Lookup** — type a verb + tense, see the full table.
2. **Drill** — pick verb + tense; cycle through 6 persons; type each
   form; lenient/strict accent match.
3. **Reverse drill** — given a conjugated form, name lemma + tense +
   person. Catches recognition vs production gap.
4. **Mixed** — random verb × random unlocked tense × random person.
   This is the C1-side challenge.

Tenses unlock per the level table in §2.3. UI shows locked tenses
greyed with the level required.

Engine logic:
- **Regular verbs** (`verb_group IN ('1','2')` and no row in `verb_forms`):
  compute the form from the rule at request time. Source rules live
  in `static/js/conjugation-rules.js` so the client can drill offline.
- **Irregular verbs** (`verb_group='3'` or any row in `verb_forms`):
  look up `verb_forms` table; client fetches `GET
  /api/conjugation/forms?lemma=être` and caches per session.

### 6.4 Pronoun ordering trainer (B1+)

New cloze mode where the prompt is a sentence with the verb and
object pronouns scrambled (`tu / le / lui / donnes`) and the user
orders them correctly (`tu le lui donnes`). Tag in `grammar_topics`
unlocks at B1.

### 6.5 Register toggle (tu / vous)

Settings has a default-register toggle. Chat respects it; Écrire and
Parler prompts include the chosen register in the system prompt. The
toggle is per-conversation overridable in chat with a chip.

### 6.6 Liaison hints

Listening mode optionally renders a phonetic overlay showing
liaisons (`les_amis`, `un_enfant`). Read from the script's IPA pass
that GPT generates alongside the audio.

---

## 7. AI prompts — what changes for French

`ai_proxy.py` stays a transparent proxy. The per-route prompts change.

| Route | Prompt delta from NL |
|---|---|
| Chat | "You are a friendly French tutor. The student is at level {activeLevel}. Use {register} (tu/vous). Keep vocabulary and grammar within {activeLevel}. If you use a new word, gloss it inline." |
| Écrire (writing correction) | Add explicit rubric for **gender errors**, **agreement errors**, **register mismatches**, **pronoun ordering**. Use DELF/DALF descriptors for the level. |
| Écouter (listening generation) | "Generate a {duration}s monologue at CEFR {activeLevel} on the topic '{topic}'. Use sentence length and vocabulary frequency appropriate to {activeLevel}. Include 2–4 deliberate liaisons. Provide questions with one correct answer + three distractors." |
| Parler (speaking eval) | Eval rubric for **liaison**, **nasal vowels**, **uvular R**, **schwa drop**. Lenient at A1/A2 (intelligibility > accent). |
| OCR | Add hint for **accent restoration** — phone cameras + handwriting routinely drop accents; the OCR step should restore them with high confidence from context. |
| Examen | One system prompt per DELF/DALF level, derived from the CIEP descriptor grid. |

---

## 8. Audio + voices

- OpenAI TTS voices (`alloy`, `echo`, `fable`, `nova`, `shimmer`)
  speak good French out of the box. Default pair: `nova` (clear
  female) + `echo` (male). Names in UI: **Camille** + **Antoine**.
- Azure (optional, `.env` toggle): `fr-FR-DeniseNeural` +
  `fr-FR-HenriNeural` for FR-FR; `fr-CA-SylvieNeural` for FR-CA.
- The keyboard shortcuts that say "E for Ellen / X for Xander" in NL
  become "**C** pour Camille / **A** pour Antoine".
- Audio cache path: `data/audio/<user_id>/<owner_type>/<owner_id>/<voice>.mp3`
  (verbatim from NL, but `<voice>` now multi-valued so we don't refetch
  when the user toggles voices on the same exercise).

---

## 9. Routes — full API surface

All under `/api/`. State-changing routes require session cookie +
`X-Requested-With: fetch` header (defence in depth — same as NL).

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/login` | username/password → session cookie |
| `POST` | `/api/auth/logout` | destroy session |
| `GET`  | `/api/auth/me` | returns `{username, active_level, register, voice_pref}` |
| `GET`  | `/api/health` | unauthenticated heartbeat |
| `GET`  | `/api/vocab` | list/filter by level + category + search |
| `GET`  | `/api/vocab/{id}` | one item |
| `POST` | `/api/custom_vocab` | add a custom item (Écrire/Écouter/Parler "+corpus") |
| `DELETE` | `/api/custom_vocab/{id}` | remove |
| `GET`  | `/api/srs/due` | next-due items at-or-below active level |
| `POST` | `/api/srs/grade` | `{item_id, grade}` → Leitner box update |
| `POST` | `/api/srs/star` | toggle starred |
| `GET`  | `/api/progress/today` | xp + streak + counts |
| `POST` | `/api/progress/event` | record right/wrong/session-start |
| `GET`/`POST`/`DELETE` | `/api/chats` | chat CRUD |
| `GET`/`POST` | `/api/chats/{id}/messages` | per-thread |
| `GET`/`POST`/`PATCH`/`DELETE` | `/api/writing` | Écrire exercises |
| `GET`/`POST`/`PATCH`/`DELETE` | `/api/listening` | Écouter exercises |
| `GET`/`POST`/`PATCH`/`DELETE` | `/api/spreken` | Parler exercises (route name kept for code reuse; UI label "Parler") |
| `GET`/`POST`/`PATCH`/`DELETE` | `/api/exam` | DELF/DALF attempts |
| `GET`  | `/api/conjugation/lemmas?level=A1` | NEW |
| `GET`  | `/api/conjugation/forms?lemma=être` | NEW: full table (server combines verb_forms + rules) |
| `POST` | `/api/conjugation/check` | NEW: `{lemma, tense, person, answer}` → `{correct, expected}` |
| `GET`  | `/api/grammar/topics` | NEW: curriculum tree |
| `POST` | `/api/grammar/progress` | NEW: `{topic_id, correct/wrong}` |
| `GET`  | `/api/metrics/...` | aggregated histograms |
| `GET`/`PUT` | `/api/settings/active_level` | NEW |
| `GET`/`PUT` | `/api/settings/register` | NEW: 'tu' / 'vous' |
| `GET`/`PUT` | `/api/settings/voice_pref` | NEW: which TTS voices to use |
| `POST` | `/api/ai/complete` | proxy → OpenAI |
| `POST` | `/api/ai/tts` | proxy → OpenAI TTS (cached on disk) |
| `POST` | `/api/ai/transcribe` | proxy → Whisper |
| `POST` | `/api/ai/ocr` | proxy → GPT-4 vision |
| `GET`  | `/api/ai/usage` | per-user/day count |
| `GET`  | `/api/audio/{owner_type}/{owner_id}/{voice}.mp3` | session-scoped audio fetch |

---

## 10. Frontend routes (hash router)

```
#/dashboard
#/browse
#/flashcards
#/typed           Generation (FR → EN / EN → FR)
#/cloze
#/mixed
#/grammaire       (was grammatica)
#/conjugaison     NEW
#/chat
#/ecrire          (was schrijven)
#/ecouter         (was luisteren)
#/parler          (was spreken)
#/examen          DELF/DALF
#/radio           France Inter / FIP / RFI / Radio-Canada presets
#/metrics
#/help
#/parametres
#/logout
```

Topbar grouping:
- **Apprendre** (Browse, Flashcards, Grammaire, Conjugaison)
- **Pratiquer** (Generation, Cloze, Mixed, Examen)
- **IA** (Chat, Écrire, Écouter, Parler)
- **Plus** (Radio, Metrics, Help, Paramètres, Logout)

Plus the always-visible **level chooser** + streak chip.

---

## 11. Curriculum tree (`seeds/grammar_topics.json`)

Authored once, used by both the Grammaire view (read-only lessons)
and the grammar_progress tracker. Sketch:

```json
{
  "A1": [
    {"id":"a1-articles-definis",     "title":"Le / la / les"},
    {"id":"a1-articles-indefinis",   "title":"Un / une / des"},
    {"id":"a1-etre-avoir",           "title":"Être & avoir au présent"},
    {"id":"a1-verbes-er",            "title":"Verbes en -er au présent"},
    {"id":"a1-negation-simple",      "title":"Ne … pas"},
    {"id":"a1-questions-est-ce-que", "title":"Est-ce que … ?"},
    {"id":"a1-nombres-1-100",        "title":"Nombres 1–100"},
    {"id":"a1-heure-date",           "title":"L'heure & la date"}
  ],
  "A2": [
    {"id":"a2-passe-compose-avoir",  "title":"Passé composé avec avoir"},
    {"id":"a2-passe-compose-etre",   "title":"Passé composé avec être (accord)"},
    {"id":"a2-imparfait",            "title":"Imparfait"},
    {"id":"a2-futur-proche",         "title":"Futur proche (aller + inf.)"},
    {"id":"a2-pronoms-cod",          "title":"Pronoms COD : le, la, les"},
    {"id":"a2-pronoms-coi",          "title":"Pronoms COI : lui, leur"},
    {"id":"a2-partitifs",            "title":"Du, de la, de l', des"},
    {"id":"a2-comparatif",           "title":"Plus / moins / aussi … que"}
  ],
  "B1": [
    {"id":"b1-futur-simple",         "title":"Futur simple"},
    {"id":"b1-conditionnel-present", "title":"Conditionnel présent"},
    {"id":"b1-pronom-y",             "title":"Le pronom Y"},
    {"id":"b1-pronom-en",            "title":"Le pronom EN"},
    {"id":"b1-pronoms-ordre",        "title":"Ordre des pronoms"},
    {"id":"b1-relatifs-simples",     "title":"Qui, que, où, dont"},
    {"id":"b1-si-hypothese-1",       "title":"Si + présent → futur"}
  ],
  "B2": [
    {"id":"b2-subjonctif-present",   "title":"Subjonctif présent"},
    {"id":"b2-plus-que-parfait",     "title":"Plus-que-parfait"},
    {"id":"b2-discours-rapporte",    "title":"Discours rapporté"},
    {"id":"b2-cause-consequence",    "title":"Cause / conséquence / but"},
    {"id":"b2-si-hypothese-2",       "title":"Si + imparfait → conditionnel"}
  ],
  "C1": [
    {"id":"c1-subjonctif-passe",     "title":"Subjonctif passé"},
    {"id":"c1-passe-simple-recog",   "title":"Passé simple (reconnaissance)"},
    {"id":"c1-conditionnel-passe",   "title":"Conditionnel passé + regrets"},
    {"id":"c1-si-hypothese-3",       "title":"Si + plus-que-parfait → cond. passé"},
    {"id":"c1-registre-soutenu",     "title":"Registre soutenu"},
    {"id":"c1-nuances-modales",      "title":"Devoir / pouvoir : nuances"}
  ]
}
```

Each topic id maps to a lesson page (mini-explanation + 5-10
embedded drills). Mastered once ≥ 20 attempts and ≥ 80% correct.

---

## 12. Deployment — extend the existing workflow, don't fork it

The user already has `.github/workflows/deploy-studeerkamer.yml` doing
rsync + venv + systemd + nginx on `162.55.47.246`. Same box hosts
Atelier; only the port, domain, app root, and seeded secrets differ.

### 12.1 One workflow, path-based dispatch

Rename `deploy-studeerkamer.yml` → **`deploy-language-apps.yml`** and
replace the single `deploy` job with a **matrix** of apps. The
`paths-filter` action gates which matrix entries actually run, so a
push that only touches `nederlands/` still only redeploys
Studeerkamer, and vice versa.

Skeleton:

```yaml
name: Deploy Language Apps

on:
  push:
    branches: [main]
    paths:
      - "nederlands/studeerkamer/**"
      - "francais/atelier/**"
      - ".github/workflows/deploy-language-apps.yml"
  workflow_dispatch:
    inputs:
      app:
        description: "Force-redeploy which app?"
        type: choice
        options: [auto, studeerkamer, atelier, both]
        default: auto

concurrency:
  group: deploy-language-apps-${{ github.ref }}
  cancel-in-progress: false

jobs:
  # ---- which apps changed? -------------------------------------------
  detect:
    runs-on: ubuntu-latest
    outputs:
      studeerkamer: ${{ steps.f.outputs.studeerkamer }}
      atelier:     ${{ steps.f.outputs.atelier }}
    steps:
      - uses: actions/checkout@v4
      - id: f
        uses: dorny/paths-filter@v3
        with:
          filters: |
            studeerkamer:
              - 'nederlands/studeerkamer/**'
            atelier:
              - 'francais/atelier/**'

  # ---- syntax check (matrix) -----------------------------------------
  check:
    needs: detect
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        include:
          - app: studeerkamer
            path: nederlands/studeerkamer
            changed: ${{ needs.detect.outputs.studeerkamer == 'true' || inputs.app == 'studeerkamer' || inputs.app == 'both' }}
          - app: atelier
            path: francais/atelier
            changed: ${{ needs.detect.outputs.atelier == 'true' || inputs.app == 'atelier' || inputs.app == 'both' }}
    steps:
      - if: matrix.changed == 'true'
        uses: actions/checkout@v4
      - if: matrix.changed == 'true'
        uses: actions/setup-python@v5
        with: {python-version: "3.12"}
      - if: matrix.changed == 'true'
        run: python -m compileall -q ${{ matrix.path }}/server
      - if: matrix.changed == 'true'
        uses: actions/setup-node@v4
        with: {node-version: "20"}
      - if: matrix.changed == 'true'
        run: |
          for f in ${{ matrix.path }}/static/js/*.js; do
            [ "$(basename "$f")" = "d3.v7.min.js" ] && continue
            node --check "$f"
          done

  # ---- deploy (matrix) -----------------------------------------------
  deploy:
    needs: [detect, check]
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        include:
          - app: studeerkamer
            path: nederlands/studeerkamer
            app_root: /opt/studeerkamer
            domain: nederlands.yaal.be
            port: "15191"
            db_path: /opt/studeerkamer/data/b2vocab.db
            users_secret: STUDEERKAMER_USERS
            openai_secret: STUDEERKAMER_OPENAI_KEY
            azure_key_secret: STUDEERKAMER_AZURE_KEY
            azure_region_secret: STUDEERKAMER_AZURE_REGION
            default_azure_region: westeurope
            changed: ${{ needs.detect.outputs.studeerkamer == 'true' || inputs.app == 'studeerkamer' || inputs.app == 'both' }}
          - app: atelier
            path: francais/atelier
            app_root: /opt/atelier
            domain: francais.yaal.be
            port: "15192"
            db_path: /opt/atelier/data/frvocab.db
            users_secret: ATELIER_USERS
            openai_secret: ATELIER_OPENAI_KEY
            azure_key_secret: ATELIER_AZURE_KEY
            azure_region_secret: ATELIER_AZURE_REGION
            default_azure_region: francecentral
            changed: ${{ needs.detect.outputs.atelier == 'true' || inputs.app == 'atelier' || inputs.app == 'both' }}
    env:
      SERVER: "162.55.47.246"
    steps:
      # All existing steps (mkdir, rsync, venv, .env, systemd unit,
      # nginx site, verify) — but every reference to "studeerkamer",
      # "/opt/studeerkamer", "15191", "nederlands.yaal.be",
      # "b2vocab.db", STUDEERKAMER_* secrets, "westeurope" becomes
      # the corresponding matrix.* variable. Each step starts with
      # `if: matrix.changed == 'true'`.
      ...
```

What changes vs the current file:

- Wrap every step in `if: matrix.changed == 'true'`.
- Templatize the systemd unit body (`Description=… ${{ matrix.app }} …`,
  `WorkingDirectory=${{ matrix.app_root }}`, `--port ${{ matrix.port }}`,
  `SyslogIdentifier=${{ matrix.app }}`). Write to
  `/etc/systemd/system/${{ matrix.app }}.service`.
- Templatize the nginx site (`server_name ${{ matrix.domain }};`,
  `proxy_pass http://127.0.0.1:${{ matrix.port }};`). Write to
  `/etc/nginx/sites-available/${{ matrix.app }}` and symlink into
  `sites-enabled/${{ matrix.app }}`.
- Pull secrets by name: `${{ secrets[matrix.users_secret] }}` etc.
- Verify step uses `systemctl is-active ${{ matrix.app }}` and
  `curl http://127.0.0.1:${{ matrix.port }}/api/health`.

`concurrency.group` is per-ref, not per-app, so a single push touching
both apps still serializes its own work but doesn't block a separate
PR's deploy.

### 12.2 New GitHub Secrets

Add (in addition to the existing `STUDEERKAMER_*` and `DEPLOY_SSH_KEY`):

| Secret | Value |
|---|---|
| `ATELIER_USERS` | `ashok:strong-password` — seeded on first boot |
| `ATELIER_OPENAI_KEY` | fallback (per-user UI key still wins) |
| `ATELIER_AZURE_KEY` | optional |
| `ATELIER_AZURE_REGION` | optional, default `francecentral` |

### 12.3 Cloudflare DNS

Add one A record:

- **Name**: `francais`
- **Value**: `162.55.47.246`
- **Proxy**: orange cloud on
- Zone SSL/TLS mode is already "Full" from nederlands — no change.

### 12.4 First-deploy bootstrap

When the workflow runs for Atelier the first time, the server has
nothing under `/opt/atelier`. The "Set up server directories" step
creates `/opt/atelier/{server,static,seeds,deploy,data/audio}` and
the rest of the pipeline owns the install. No manual `ssh` step
needed.

### 12.5 Why not two separate workflows?

Considered; rejected because:
- The SSH steps are 95% identical — duplication will drift.
- Single concurrency group + single secrets surface is easier to
  reason about.
- Adding language #3 (Spaans? Deutsch?) later is one matrix row, not
  a new file.

Trade-off: a matrix bug breaks both deploys. We accept that — syntax
check job catches almost everything before it hits the SSH step.

---

## 12A. Feature-parity audit — every Studeerkamer feature accounted for

This is the non-negotiable list. Each row below either ports verbatim,
adapts to French, or is intentionally renamed. Nothing from Studeerkamer
is silently dropped. Rows marked **+** are net-new for Atelier.

### Topbar / shell

| Studeerkamer | Atelier | Notes |
|---|---|---|
| Brand "Studeerkamer" + "A2 · B1 · **B2 → C1**" subline | "Atelier" + active-level pill row | Subline becomes the live 5-pill chooser |
| Streak chip (●  N  dag) | Streak chip (●  N  jours) | Verbatim port + label translation |
| Hamburger nav + grouped dropdowns | Same, French labels | See §10 |
| Footer keyboard hints | Same, FR mnemonics ("C/A" not "E/X") | |
| Shortcuts dialog `?` | Same, FR | |
| Service worker + manifest + offline shell | Verbatim port | New name + icon set |
| Login page | Verbatim port, French copy | |

### Dashboard (Overzicht → Vue d'ensemble)

| Studeerkamer feature | Atelier |
|---|---|
| XP today / week | Port |
| Streak counter + best | Port |
| Due-cards summary by Leitner box | Port; filter respects active level |
| "Continue where you left off" tile | Port |
| Achievements grid | Port + new A1/A2-tier achievements (see §12B) |
| Recent chats / writing / listening / spreken tiles | Port |
| Quick-start buttons (Flashcards / Generation / Mixed) | Port + level-aware "start at A1" tile |

### Browse (Bladeren → Parcourir)

| Studeerkamer | Atelier |
|---|---|
| Full vocab list with virtualized scroll | Port |
| Category + level + starred + search filters | Port; **add gender / pos / verb-group filters** |
| Selection bar (`selection-bar.js`) for bulk star / box-move / delete | Port verbatim |
| In-row TTS button | Port; voice = active voice preference |
| Click-to-expand example sentence | Port + show gender chip on nouns |
| Add to corpus / edit custom item | Port |

### Flashcards

| Studeerkamer | Atelier |
|---|---|
| Front/back cards, swipeable | Port |
| 3-grade feedback (moeilijk/goed/makkelijk → 1/2/3) | Port (difficile/bien/facile) |
| Direction toggle NL→EN / EN→NL / Mixed | FR→EN / EN→FR / Mixed |
| Per-card TTS (Ellen/Xander) | Per-card TTS (Camille/Antoine), keys C/A |
| Auto-advance toggle | Port |
| Star + edit inline | Port |
| Session summary card | Port |

### Grammatica → Grammaire

| Studeerkamer | Atelier |
|---|---|
| Static `grammatica-overzicht.html` reference page | Port → `grammaire-apercu.html`, FR curriculum |
| Inline drill widgets in the lesson | Port + **per-topic progress** via new `grammar_progress` table |
| Cross-links to Browse with pre-applied filter | Port |
| Lazy-loaded lesson sections | Port |

### Werkwoorden → Conjugaison (largest reshape)

| Studeerkamer (`werkwoorden-views.js`) | Atelier (`conjugaison-views.js`) |
|---|---|
| Separable-verb drill | Replaced by **regular -er/-ir/-re drill** (A1 staple) |
| Perfect-tense auxiliary picker | Replaced by **avoir vs être auxiliary picker** in passé composé |
| Modal verb conjugation | Replaced by **full conjugation table** across 8 tenses |
| Built-in 200-verb table | Replaced by **rules engine + 50 irregulars** seeded JSON |
| — | + Reverse drill (form → lemma/tense/person) |
| — | + Mixed mode (random verb × tense × person) |
| — | + **Pronoun-ordering drill** (B1+) |

### Generation / Typed (typed view)

| Studeerkamer | Atelier |
|---|---|
| Type answer in target lang | Port |
| Lenient case match | **Lenient accent + elision match** (§6.2) |
| "Show answer" reveal | Port |
| Auto-grade + Leitner | Port |
| Hint button (first letters) | Port + **article hint** for nouns at A1 |

### Cloze

| Studeerkamer | Atelier |
|---|---|
| Sentence with blanks | Port |
| Multi-blank per sentence | Port |
| Distractor pool from same category | Port |
| Reveal + grade | Port |

### Mixed (Gemengd → Mélangé)

| Studeerkamer | Atelier |
|---|---|
| Random mix of flashcard / typed / cloze | Port |
| Single session counter | Port |
| Audio toggle | Port |

### Examen

| Studeerkamer (CNaVT-C1-EP only) | Atelier (DELF/DALF) |
|---|---|
| Lezen / Luisteren / Schrijven / Spreken sections | Compréhension écrite / orale / Production écrite / orale |
| Single template | **One template per level** (A1, A2, B1, B2 DELF + C1 DALF) |
| Per-section timer | Port (CIEP official durations) |
| Auto-grade objective sections | Port |
| GPT-rubric productions | Port + CEFR-grid descriptors |
| Resume in-progress attempt | Port |
| Per-attempt review screen | Port |

### Chat

| Studeerkamer | Atelier |
|---|---|
| Multi-thread chat | Port verbatim |
| Auto-title after 4 msgs | Port |
| Markdown rendering | Port |
| Inline TTS per assistant message | Port |
| Per-thread audio cache | Port |
| Hover-translate any word | Port + **tap-to-conjugate** any verb (links to Conjugaison) |
| System prompt level-aware | Port + register (tu/vous) |
| "Add to corpus" from any word | Port |

### Schrijven → Écrire

| Studeerkamer | Atelier |
|---|---|
| Paste/type essay → sentence-level correction | Port |
| GPT-scored rubric | Port + **gender + agreement + register** as explicit rubric items |
| Vocab + grammar extraction | Port |
| Audio of corrected version | Port (FR voices) |
| Word timings + karaoke playback | Port |
| Push corrections to corpus | Port |
| Status workflow (new → running → done → error) | Port |
| Resumable / retryable | Port |

### Luisteren → Écouter

| Studeerkamer | Atelier |
|---|---|
| Topic → AI script → audio | Port |
| Multi-choice questions (4 opts) | Port |
| Vocab + grammar extraction | Port |
| Word timings + sync highlight | Port |
| Replay sections by sentence | Port + **liaison overlay** (§6.6) |
| Push vocab to corpus | Port |
| Per-level WPM scaling | + new in Atelier (A1 ≈ 140 wpm, C1 ≈ native) |

### Spreken → Parler

| Studeerkamer | Atelier |
|---|---|
| Topic → AI sample sentences | Port |
| Record (mic), Whisper transcribe | Port |
| Pronunciation score per word | Port + **liaison/nasal-vowel/uvular-R** signals |
| AI correction + corrected audio | Port |
| Word timings on both originals | Port |
| Push corrections to corpus | Port |
| Replay original + corrected | Port |

### Radio

| Studeerkamer | Atelier |
|---|---|
| Curated NL/BE radio stations | Curated **France Inter, FIP, RFI Monde, Radio-Canada Première, RTBF La Première** |
| Live captions via Whisper | Port |
| Save snippet → Écouter exercise | Port |
| Volume / source picker | Port |

### Metrics

| Studeerkamer | Atelier |
|---|---|
| D3 charts (heatmap calendar, level histogram, box distribution) | Port verbatim |
| Per-mode session counts | Port |
| AI usage transparency | Port |
| Achievements progress | Port + A1 tier |
| Export JSON dump | Port |

### Help / Uitleg → Aide

| Studeerkamer | Atelier |
|---|---|
| Static reference: shortcuts, modes, SRS theory | Port + **CEFR explainer** + level-progression diagram |

### Settings / Instellingen → Paramètres

| Studeerkamer | Atelier |
|---|---|
| Change password | Port |
| Voice preference per voice (Ellen/Xander default) | Camille/Antoine + dialect picker FR-FR / FR-CA |
| Personal OpenAI / Azure keys (override server fallback) | Port |
| Strict-match toggle | Port (now means strict-accent in FR) |
| Daily-goal slider | Port |
| Theme (light/dark/auto) | Port |
| Export / delete account | Port |
| — | + **Active level** (also in topbar) |
| — | + **Default register** (tu / vous) |
| — | + **Auto-prefix article** toggle (A1 helper) |
| — | + **TTS playback speed** slider (A1 helper) |

### Cross-cutting infrastructure

| Studeerkamer | Atelier |
|---|---|
| PWA installable (manifest + SW) | Port + new icons + new app name |
| Offline shell for `/static/` + last-seen flashcards | Port |
| IndexedDB blob store for audio | Port (`blob-store.js`) |
| Handwriting input (`handwriting.js`) on touch | Port — usable for typed mode on iPad |
| Selection bar bulk actions (`selection-bar.js`) | Port |
| AI usage soft-cap + ledger | Port |
| AI proxy single shared key in `.env` | Port |
| CSRF defence (`X-Requested-With: fetch`) | Port |
| Session cookie auth | Port |
| `/api/health` unauthenticated heartbeat | Port |
| User-provided key per-feature override | Port |
| WAL SQLite + per-request connection | Port |
| Audio cached by `(user, owner_type, owner_id, voice)` | Port + voice key change |

If a Studeerkamer code path isn't represented in a row above, it's a
gap — file an issue rather than skip it.

---

## 12B. Beginner-first enhancements (net-new for Atelier)

Studeerkamer ships at B2; an A1 learner needs scaffolding that doesn't
exist there yet. These are A1/A2-only or A1/A2-first features.

### B.1 Onboarding flow (first login at A1)

Three-screen wizard:
1. **Self-placement**: a 12-item diagnostic (article, simple
   conjugation, recognition vocab). Sets `active_level` from the
   result, but the user can override.
2. **Goal**: "weekly minutes" slider → daily goal.
3. **Voice + register**: pick Camille or Antoine; tu or vous.

Skippable; safe defaults if skipped (A1, 30 min/week, Camille, vous).

### B.2 Alphabet + IPA primer

Static `alphabet.html` reachable from `#/aide`. Covers:
- Letter names (a, bé, cé, dé…) with audio per letter.
- Accent diacritics — when does each appear?
- IPA chart with French phonemes only, audio per phoneme.
- Nasal vowels page (an/en, on, in, un) — the A1 cliff.

Linked from the dashboard "first day" tile only until the user has
seen it.

### B.3 Gender drill (A1 mini-mode)

New view at `#/genre`. Picks 20 random nouns, asks `le` or `la` for
each. Visually rewards: blue glow for `le`, pink for `la`. Wrong
answers add the noun to a "gender-shaky" cohort that the SRS prefers
to surface.

Why separate from Flashcards: gender is *one bit* of information per
item, easier to drill in bulk. Doing it inside Flashcards bloats the
session.

### B.4 Picture flashcards (A1 only)

Where seed JSON has `image: "..."` (we ship ~200 A1 concrete nouns
with images sourced from Wikimedia/OpenMoji), Flashcards renders a
picture-first card: image → tap → reveal article + word + audio.
Toggleable in Settings.

### B.5 Numbers / dates / time mini-trainer

`#/nombres`. Three sub-drills:
- Type the digit you hear (TTS-driven).
- Say the time shown on an analog clock.
- Type today's date in the spoken form.

Auto-graded; counts toward XP. Available at A1, fades from default
nav at B1+.

### B.6 Cognate hints

For every English ↔ French pair where the items differ by a
mechanical rule (`-tion ↔ -tion`, `-ity ↔ -ité`, `-ous ↔ -eux`), tag
in seed JSON with `cognate: true`. Browse / Flashcards show a small
"≈" chip — beginners see they already know thousands of words.

### B.7 Slower default TTS at A1

`speech.js` honors `playbackRate` from Settings; default is **0.85×**
at A1 and A2, **1.0×** at B1+. Per-card override stays.

### B.8 Auto-prefix article toggle

In Generation (typed) for nouns, when the toggle is on the input box
shows `le ___` / `la ___` as a prefix and the learner only types the
noun. Toggle off → must type the article themselves. Default on for
A1, off from A2 up.

### B.9 Inline tap-translate everywhere

Long-press / click any French word in any view → bubble showing
gender, gloss, audio, "+corpus". Already in Chat for Studeerkamer;
extended here to Cloze, Examen reading sections, Écouter scripts,
Grammaire lesson body, Radio captions. Implemented as a generic
`<span data-fr-word>` enhancer in `views.js`.

### B.10 A1-tier achievements

Add the missing low-rungs of the ladder:
- "Bonjour" — first login.
- "Premier mot" — 1 item rated correct.
- "Cinquante mots" — 50 distinct items mastered (box ≥ 3).
- "Tous les articles" — 100% on gender drill of 20 items.
- "Conjugué" — first regular -er verb fully conjugated.
- "Une semaine" — 7-day streak.
- "Cent mots" — 100 mastered.

C1-tier achievements port from Studeerkamer unchanged.

### B.11 "Simple mode" UI density

A `simple_ui` flag in Settings (default on at A1, off from B1) does:
- Hide Werkwoorden... err, Conjugaison's Mixed + Reverse modes.
- Hide Examen entirely from nav (still reachable by URL).
- Larger touch targets (44 px min).
- One nav-group ("Apprendre") expanded by default; others collapsed.
- Footer keyboard hints replaced by touch hints.

Flips off automatically when the user crosses `level >= B1` *unless*
they manually pinned the choice.

### B.12 First-week curriculum

`seeds/first_week.json` maps day 1..7 to a list of `{view, topic,
item_ids}`. Dashboard's "Today" tile follows it if the user hasn't
ranged off-piste. Day 1 = alphabet + 20 most-frequent words +
`être/avoir` present. Day 7 = first Écrire exercise.

Opt-out at any time. Not visible from B1+.

### B.13 "Reset / forget this card" with one tap

A1 learners hit weird seed items more often. Card overflow menu adds
a "Skip — pas utile pour moi" that drops the item from their SRS pool
permanently. Studeerkamer requires going to Browse to do this.



Each phase ends with something the user can demo end-to-end.

### Phase 0 — Skeleton (½ day)
- Copy `nederlands/studeerkamer/{server,static,deploy,run.sh,
  requirements.txt,.env.example}` into `francais/atelier/`.
- Rename: domain (`francais.yaal.be`), port (`15192`), DB path
  (`data/frvocab.db`), app title, language tag.
- Strip out feature-specific code (vocab/SRS/views) — keep only auth +
  AI proxy + static SPA shell.
- Verify `./run.sh` boots, login page renders.

### Phase 1 — Active level + Core vocab + Onboarding (1.5 days)
- Schema + new tables (`vocab_items` rename + new columns,
  `verb_forms`, `grammar_progress`).
- `seeds/vocabulary_core.json` (~150 closed-class items, mostly A1).
- Vocab list endpoint + Parcourir view, filterable by level + gender
  + pos.
- Topbar level picker (the 5-pill control). Persists in `user_kv`.
- **Onboarding wizard (§B.1)** — diagnostic, goal, voice + register.
- `simple_ui` flag default-on (§B.11).

### Phase 2 — Flashcards + SRS at A1 + first beginner helpers (2 days)
- Port `srs.js` + flashcard view verbatim — it doesn't care about
  language.
- Wire the level filter into the SRS due query.
- Seed `vocabulary_a1.json` (~700 items; ship partial then iterate).
- **Gender chip** + colored article reveal (§6.1).
- **Slower TTS at A1** (§B.7) + per-card playback rate setting.
- **Auto-prefix article toggle** in Settings (§B.8).
- Smallest end-to-end demo proving the architecture carries.

### Phase 3 — A1 dedicated mini-modes (1.5 days)
- **Genre drill view** `#/genre` (§B.3).
- **Numbers / time / date trainer** `#/nombres` (§B.5).
- **Picture flashcards** for the ~200 image-tagged A1 nouns (§B.4).
- **Alphabet + IPA primer** static page (§B.2).
- **Cognate hint** chip rendering (§B.6) — seed tag pass first.

### Phase 4 — Conjugaison (2 days)
- `conjugation-rules.js` for `-er`, `-ir`/`-iss`, regular `-re`.
- `seeds/conjugation_irregular.json` for the 20 most-common
  irregulars (être, avoir, aller, faire, pouvoir, vouloir, devoir,
  savoir, voir, venir, prendre, mettre, dire, lire, écrire, partir,
  sortir, dormir, ouvrir, recevoir) — initial table, grow later.
- `/api/conjugation/{lemmas,forms,check}` endpoints.
- Drill modes 1 (lookup) + 2 (forward drill) first; reverse + mixed
  arrive in Phase 8 once SRS habits are formed.
- Per-tense unlocking against `activeLevel` (§2.3).

### Phase 5 — Grammaire curriculum + drills (2 days)
- `seeds/grammar_topics.json` (the §11 tree).
- Grammaire view: tree on the left, lesson on the right.
- Each lesson has Markdown body + 5 inline cloze items.
- `grammar_progress` table writes on each item answered.
- **Tap-translate** (§B.9) live throughout lesson bodies.

### Phase 6 — Generation + Cloze + Mixed (1 day)
- Three views that all reuse the same item-picker + grading code,
  with the active-level filter applied.
- Accent-folding + elision-aware match (§6.2).
- Article-hint at A1 in Generation.

### Phase 7 — Chat (1 day)
- Port chats schema + view verbatim.
- Update system prompt template with `activeLevel` + register.
- Inline tap-translate on every word in assistant messages.
- Tap-to-conjugate any verb (links to Conjugaison preset).

### Phase 8 — Écrire + Écouter + Parler (3 days)
- These are the AI-heavy views; each is a port of its NL twin with
  prompt updates per §7.
- Audio caching strategy stays identical (voice multi-cache).
- Liaison overlay in Écouter (§6.6).
- Reverse + Mixed modes added to Conjugaison.

### Phase 9 — DELF/DALF Examen (2 days)
- Per-level template JSON (A1, A2, B1, B2 DELF + C1 DALF).
- Section runner (compréhension écrite → orale → production écrite
  → production orale).
- Auto-score where deterministic; GPT-rubric score for productions.
- Tap-translate on reading passages.

### Phase 10 — Radio + Metrics + Achievements + PWA polish (1.5 days)
- `seeds/radio_stations.json` with France Inter, FIP, RFI Monde,
  Radio-Canada Première, RTBF La Première.
- Metrics histograms grouped by level.
- **A1-tier achievements** (§B.10) wired through `user_kv`.
- New PWA icons + manifest brand. Service worker offline shell.
- First-week curriculum tile (§B.12) on dashboard.

### Phase 11 — Deploy (½ day)
- Rename `.github/workflows/deploy-studeerkamer.yml` →
  `deploy-language-apps.yml`, convert to the matrix in §12.1.
- Add `ATELIER_*` secrets to repo.
- Cloudflare DNS A-record `francais` → 162.55.47.246, proxy on.
- First push touching `francais/atelier/**`, verify only the Atelier
  matrix row runs; touch `nederlands/studeerkamer/**` in a second
  commit, verify only Studeerkamer runs.
- Verify `curl https://francais.yaal.be/api/health` returns 200.

**Total estimate: ~18 working days** of focused build (up from 14 to
absorb the beginner enhancements + matrixed CI). Seeds generation
dominates phases 1-5; AI prompt tuning dominates 7-9; the beginner
mini-modes in phase 3 are deceptively heavy because each is its own
mini-view with its own grading rules.

---

## 14. Open decisions (please confirm before code)

Resolved by your latest message: domain (`francais.yaal.be`), single
shared deployment workflow with path-based dispatch (§12). Remaining
calls:

1. **App name** — "Atelier" or another French word (Bureau, Salon, Cabinet, Studio)?
2. **Glosses** — English only (default; easier to source) or add FR↔NL toggle later since you already study Dutch?
3. **Default register** — "vous" (safer / formal default; recommended) or "tu"?
4. **Dialect** — FR-FR only at v1, or include FR-CA voice option in Settings (small additional Azure cost)?
5. **C2 deferral** — confirm A1-C1 only at v1?
6. **Port** — 15192 (next free after 15191) OK?
7. **OpenAI key sharing** — should `ATELIER_OPENAI_KEY` fall back to `STUDEERKAMER_OPENAI_KEY` if unset, or stay strictly isolated?
8. **Onboarding diagnostic** — ship the 12-item placement test (§B.1) at v1, or start everyone at A1 and let the level chooser handle it?

---

## 15. Acceptance checklist (when is v1 done?)

- [ ] User can sign up via `USERS` env, log in, stay logged in across devices.
- [ ] Topbar level chooser persists and re-renders every view.
- [ ] Browse shows ≥ 800 A1 items + ≥ 1 000 A2 items.
- [ ] Flashcards SRS round-trips correctly across all 5 levels.
- [ ] Conjugaison drill covers present + passé composé + imparfait
      across at least 20 irregular verbs + all regular -er/-ir/-re.
- [ ] Grammaire has lesson + 5+ inline drills for each topic in §11.
- [ ] Chat respects active level + register.
- [ ] Écrire returns sentence-level corrections + score + audio of
      corrected version.
- [ ] Écouter generates audio + 4 MC questions at active level.
- [ ] Parler records, transcribes, evaluates pronunciation.
- [ ] DELF A1 mock runnable end-to-end with auto-grading.
- [ ] PWA installable on iPhone + Mac, works offline for browse +
      flashcards.
- [ ] CI/CD pipeline deploys on push, health check passes.
- [ ] `audit-gender.py` reports < 1% gender mismatches against
      Wiktionary.
