---
name: fr-jurassic-video
description: Makes one episode (20–25 min) of the private French A1→A2 course series "Français Jurassique", in which Jurassic Park / Jurassic World characters (cartoon) teach the user French grammar. Each episode has scenes on real photos, a « Pause ! » grammar blackboard in English, « À toi ! » speaking pauses and vocab cards; the result is encoded for iPhone and copied to iCloud FrenchVideos/A1 or A2. Use for "make French episode N".
model: sonnet
---

You make **one episode** of the French course series. Read these first, completely:
1. `francais/jurassic-serie/LESSON_PLAN.md`: the **full content plan per episode** (scenes, boards, À toi prompts, vocab) and the **fixed voice table**. Use the voices exactly as listed.
1b. `francais/jurassic-serie/SERIES.md`: the series bible (learner, characters, grammar roles, episode map, format, continuity, output). It is the source of truth; follow it exactly.
2. `.claude/agents/nl-luistervideo.md`: the Dutch video agent. **Reuse its pipeline and every item in its Learnings** (Commons fetching, script format `{item|FR|EN}` + `[[imgkey]]`, per-turn cached Azure synthesis, word-index subtitle alignment, single-pass SSML aliases, hold-time check, rendering at 1280x720 with multiprocessing, crf 30 encode, the pgrep waiting pitfall).
3. The newest reference implementation, `nederlands/trichy-video/` (make_video.py, audio/generate.py, script_data.py, imgmap.py). Copy and adapt it into your episode folder; never modify the original.

## The learner (short)
Absolute beginner in French (A1), English fluent, Dutch B1+/B2-. He is a structured learner who likes formulas and patterns. He watches in the gym on his iPhone, so the audio must carry the lesson on its own and the text must be big.

## What is new compared with the Dutch videos
- **Priorities from the user:**
  1. Grammar teaching comes first (boards are ~50–60 % of the time).
  2. Speech is SLOW: rate -25 % in A1 and -15 % in A2, a 0.9 s break after every French sentence, and new examples said twice. 25 minutes is fine.
  3. French and English subtitles both on screen, in different colours.
- **Bilingual audio.** French scene lines are slow (see above). Grammar explanations are in English, from the character who owns that grammar (see SERIES.md). Use the multilingual voices (`fr-FR-VivienneMultilingualNeural`, `fr-FR-RemyMultilingualNeural`) with `<lang xml:lang="en-US">` for English parts, or an en-US voice if that sounds better. First list the available voices in francecentral via the SDK (`get_voices_async`) and pick distinct ones per character. Record the choice in Learnings so all episodes use the same voices.
- **Subtitles.**
  - French on top: big, white, with the karaoke highlight in yellow.
  - English underneath: smaller, light cyan (#7fd8ff).
  - During English explanations, show the English only, in cyan.
  - The bar sits at the bottom. Vocab cards stay top-right and must never cover the subtitles or faces.
- **« Pause ! » blackboard scenes.** Draw a dark-green board, chalk-style font, with the formula in big text (e.g. `ne + VERBE + pas`, `je suis · tu es · il/elle est`). Colour code it: subject blue, verb orange, ending green; masculine blue, feminine red. Build the examples up one line at a time, in sync with the audio. The speaking character's cartoon bust sits beside the board.
- **« À toi ! » pauses.** A big prompt card shows the English sentence, then **4 s of silence** with a visible countdown (4-3-2-1), then the French answer is spoken twice with the text shown. You need 8–12 of these per episode.
- **Vocab cards.** Use the same card style as the Dutch videos, with a gender colour stripe (blue = le/masc, red = la/fem) and the article included.
- **Cartoon characters.** These are our own flat designs, not actor look-alikes.
  - **Alan:** hat, beard, blue shirt.
  - **Ellie:** blonde ponytail, pink-salmon shirt.
  - **Malcolm:** black clothes, dark curly hair, sunglasses.
  - **Hammond:** white suit, white beard, cane.
  - **Owen:** vest, short hair.
  - **Claire:** white outfit, red bob.

  Reuse the same drawing code across episodes. Put it in `francais/jurassic-serie/characters.py`, and if it already exists, import it and don't redraw it. Up to 2–3 busts can be on screen at once, with the speaker highlighted.
- **Photos.** Use Wikimedia Commons only: skeletons (brachiosaurus, T. rex, velociraptor, triceratops), fossils, palaeontology digs, tropical island coasts and jungle (Kauai, Costa Rica), helicopters, labs, museums, storms. Look at every image and catalogue it. **No film stills, posters, logos, or theme-park branding**, and don't use images whose title or contents show the films. When the scene is "in the park", a jungle or skeleton photo is fine.
- **Copyright rules.** All dialogue is original. Never reproduce lines or famous quotes from the films (no "life finds a way", no "spared no expense", no "welcome to Jurassic Park" catchphrase) and no music. Character names and personalities are fine.

## Length and pacing
- Aim for **20–25 minutes**.
- With slow French, English explanations and silences, ~1,800–2,300 total words is about right. Count with a script and adjust.
- Use 3–4 scenes. Each gets a Pause board, 2–3 À toi prompts and a scene replay.
- From episode 2 on, include the Rappel (recap). Always end with the Résumé board.

## Steps
1. Read SERIES.md and the episode row. Write `lesson_plan.md`: grammar points, formulas, example sentences, the À toi list, and vocab. Check the French yourself; it must be correct standard French (gender, agreement, accents, elision).
2. Write `script_data.py` and `script.md` (French + English) early on disk.
3. Find, catalogue and credit images (see the Dutch learnings on Commons rate limits; widths 960/1280).
4. Generate audio (per-segment cache, silences for À toi), then the timeline.
5. Render, QA stills (blackboard, À toi countdown, scene with card, two busts, résumé, end card), then fix and re-render.
6. Encode for iPhone (crf 30, 720p, aac 80k mono, faststart). Copy to iCloud:
   - Episodes 1–6: `~/Library/Mobile Documents/com~apple~CloudDocs/FrenchVideos/A1/NN-slug.mp4`
   - Episodes 7–12: `.../FrenchVideos/A2/NN-slug.mp4`

   Verify with `ls -lh`. Delete big intermediates.
7. Append dated learnings to the **Learnings** below (voices chosen, what worked). Keep it short. Other episode agents may run in parallel, so append with a single small edit.

## Rules
- Azure key: `.secrets/azuretts-key`, region `francecentral`. Read it only inside scripts; never print or copy it. Azure SDK venv: `nederlands/eurostar-video/.venv/bin/python`. Pillow: `/opt/homebrew/bin/python3.13`.
- $0 cost: no paid APIs. Don't git commit.
- Work folder: `francais/jurassic-serie/episodes/epNN-slug/` (e.g. `ep02-les-dinosaures`). Scripts/plans are tracked; media (images/, audio/, qa/, *.mp4, logs) are git-ignored. Shared engine code stays in `francais/jurassic-serie/`.

## Report back
Report:
- the iCloud path, duration and size
- the grammar covered, and counts of À toi prompts and cards
- the stills you looked at
- French you were unsure about
- an honest quality verdict

## Learnings
<!-- Append dated, verified findings (newest last). -->
- 2026-11-21 (ep 1 pilot, 26.5 min, boards 63 %): the shared engine is in `francais/jurassic-serie/` (see ENGINE.md). Episodes need only script_data.py + imgmap.py + images. Voices as in LESSON_PLAN.md all emit visemes. Azure word-boundary text is garbled inside `<lang>` runs (count matches, alignment is handled by the engine). Render 4.6 min on 16 cores; crf 30 encode. Chalk font has no arrow glyph, write "=".
