# Episode engine (built with episode 1)
Shared code in `francais/jurassic-serie/`: `voices.py` (voice table), `characters.py` (6 busts), `dsl.py` (script helpers), `episode_audio.py` (Azure TTS -> timeline), `episode_render.py` (frames + encode), `fetch_commons.py` (Commons search/download). An episode folder `francais/jurassic-serie/episodes/epNN-slug/` needs only: `lesson_plan.md`, `script_data.py`, `imgmap.py`, `images/` (titles.txt, files, credits.json, catalog.md). Never copy engine code into the episode.

## Run (from the languages/ root; episode folder = EP)
1. Images: `python3 francais/jurassic-serie/fetch_commons.py search "query" 10` -> pick titles -> `EP/images/titles.txt` -> `python3 -u .../fetch_commons.py fetch EP/images` (run_in_background; ~3 min for 40 files). LOOK at every image (contact sheets), write `images/catalog.md`, avoid titles/contents that show the films. Make `imgmap.py` = `IMG = {key: filename}`.
2. Audio (Azure venv): `nederlands/eurostar-video/.venv/bin/python francais/jurassic-serie/episode_audio.py EP` -> `audio/narration.wav`, `audio/timeline.json`, prints duration, boards %, card count and WARN lines (board groups vs `[[+]]`, alignment). Cached per item in `audio/cache`, so re-runs are quick.
3. Stills: `/opt/homebrew/bin/python3.13 francais/jurassic-serie/episode_render.py EP still 95s 300s ...` -> `EP/qa/still_N.png`. It prints `WARN long photo hold` (>24 s visible) and `MISSING IMAGE`.
4. Render (run_in_background, ~9 min for 26 min on 16 cores): same script without `still` -> `EP/master_720.mp4`.
5. Encode: `ffmpeg -y -i EP/master_720.mp4 -vf scale=1280:-2 -c:v libx264 -profile:v high -preset slow -crf 30 -pix_fmt yuv420p -c:a aac -b:a 80k -ac 1 -ar 48000 -movflags +faststart EP/final.mp4`, copy to `~/Library/Mobile Documents/com~apple~CloudDocs/FrenchVideos/A1|A2/NN-lesson-<slug>.mp4` (e.g. `02-lesson-les-dinosaures.mp4`; A1 = episodes 1-6, A2 = 7-12), `ls -lh`, delete master.
6. Listen companion (after the audio timeline exists; no Azure needed): `/opt/homebrew/bin/python3.13 francais/jurassic-serie/episode_render.py EP listen` -> `EP/listen.mp4` (3 s title card + only the first slow pass of every non-replay chapter whose title starts with `Scène`; FR+EN subtitles, cards, busts; no boards/À toi/replays; same encode as the lesson, so files concat with `-c copy`). Python: `from episode_render import render_listen` is not needed, use the CLI. Then `python3 francais/jurassic-serie/build_listen.py N` joins ep01..epNN listen.mp4 into iCloud `FrenchVideos/A1|A2/NN-listen-ep01-NN.mp4` (`01-listen-ep01.mp4` for N=1; fails if any listen.mp4 is missing). So every scene chapter must be titled `Scène ...` and every episode must have a listen.mp4 before build_listen.

## script_data.py format
```
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'jurassic-serie'))
from dsl import *
meta(num=2, title="Les dinosaures", level='A1', slug='les-dinosaures', rate='-25%')   # A2: rate='-15%'
board('id', "Title", ["<s>je</s> <v>suis</v>", "# small annotation", "+second line of same group", ...])
chapter("Scène 1 · Titre", ['hammond'], bg='imgkey', id='s1')   # cast: up to 3 of ellie alan malcolm hammond owen claire ashok
fr('hammond', "[[imgkey]]{Bonjour|x|hello}, Ashok !", "Hello, Ashok!")        # French line + English translation
chapter("Pause ! · Titre", ['ellie'])                                            # title starting with "Pause" shows the PAUSE stamp
explain('ellie', "English … [[+]]«Je suis.»² …", board='id')                     # speaker must be ellie/alan/malcolm
atoi("Say: I am Ashok.", "Je suis Ashok.", img='key')                             # 4 s countdown, answer twice
replay('s1')                                                                      # French-only replay of scene s1
```
- Markup: `{mot|m|EN}` card (m blue, f red, x gold; put the article in the word for nouns; cards appear only in scene `fr` lines, top-right); `[[key]]` photo change; `[[+]]` reveal next board group; `«fr»` French run inside English (yellow, slow); `«fr»²` said twice. Board groups: a line = new group, `+line` joins previous group, `#line` = small note; one `[[+]]` per group (the audio script warns on mismatch). Board colours: `<s>` subject blue, `<v>` verb orange, `<e>` ending green, `<m>` masculine blue, `<f>` feminine red, `<y>` yellow, `<w>` white. The chalk font has no arrow glyph: write `=`.
- Do not put « » inside English quotes for non-French words; the `?`/`!` after a French word may be separated by a space (French typography) – it is handled.
- Photo markers: one every <= 20 s of visible photo; À toi `img=` changes the photo behind the card. Board time does not count toward holds.
- Pacing built in: French -25 % (A1) / -15 % (A2), 900 ms after each French sentence, 1.5 s between turns, À toi answer twice (-35 %, then scene speed). Episode 1: 26.5 min, boards 63 %.

## iCloud naming (FrenchVideos/A1|A2)
Lesson `NN-lesson-<slug>.mp4`; cumulative listen `NN-listen-ep01-NN.mp4`.

## Ashok (on-screen learner)
Key `ashok` (bust: brown skin, short black hair, light grey shirt; voice `fr-FR-AlainNeural`, French only, not multilingual). Use him in the cast and give him `fr('ashok', ...)` lines: he introduces himself (Kulithalai, India; lives in Genk, Belgium; engineer) and answers. Max 3 busts per scene; set the cast to include `'ashok'`. Subtitles: a `fr` line now shows the WHOLE utterance (up to 2 lines, auto-shrunk), never just one sentence.

## Voices (fixed)
ellie fr-FR-VivienneMultilingualNeural (all English prompts and most explanations), alan fr-FR-RemyMultilingualNeural, malcolm fr-FR-LucienMultilingualNeural, hammond fr-FR-MauriceNeural, owen fr-FR-HenriNeural, claire fr-FR-DeniseNeural, ashok fr-FR-AlainNeural. Only ellie/alan/malcolm may use `explain`/English (multilingual `<lang>` tags). Owen/Claire/Hammond: French lines only (non-multilingual).

## Gotchas found
- Azure word-boundary events inside `<lang>` runs have garbled text and sometimes one extra event: `align()` matches by count, then by first letters; bare `?`/`!` tokens are skipped.
- `ImageDraw.Draw(im,'RGBA')` on an RGBA image overwrites instead of blending: the renderer keeps frames in RGB and uses `comp()` for layers.
- Non-multilingual voices cannot do English; boards need an `explain` speaker from ellie/alan/malcolm.
- Characters: `python3.13 characters.py sheet.png` renders all six busts.
- Don't use `pgrep` loops; use run_in_background and wait for the notification.

## Engine v3 (A2 episodes; all options are optional, defaults keep v1/v2 behaviour)
- **Pronunciation aliases:** `dsl.SSML_ALIAS` defaults `Genk -> Guenk`, `Kulithalai -> Koulitalaï`; add per episode with `alias({'Tiruchirappalli': 'Tirouchirapaly'})` in script_data.py (keys and values must be ONE word). Applied only to the spoken SSML (all speakers, French and English runs, single regex pass, longest key first, whole words); subtitles keep the real spelling and the word count is unchanged, so word-index alignment is intact. Note: a changed spoken text means a new audio cache entry for those lines.
- **`atoi(prompt, answer, img=..., by='ashok')`:** English prompt stays in Ellie's voice; the French answer (both times, and the bust highlighted) is spoken by `by`. `by` must be a French voice (ashok, owen, claire, hammond ...).
- **Replay skipping:** `fr(who, text, en, id='x', mistake=True)`: a `mistake=True` line is never replayed; `replay('s1', skip=['x'])` also skips lines by `id`. Still the un-id'd "Oups !" chapter trick for whole chapters.
- **Subtitle wrap:** a lone `! ? : ; » …` token never starts a new line (it stays on the previous line after its French space).
- **End card:** `NEXT_TITLES` (episode_render.py) names the next episode (keys 1-11); episode 12 shows "Félicitations ! Tu as fini le niveau A2 !".
- **A2 notes:** `meta(rate='-15%')`. Owen (Henri) and Claire (Denise) have no multilingual voice: they never `explain`; English explanations stay with Ellie, Alan or Malcolm, while Owen/Claire speak French in scenes and demonstrate the board examples in `fr` lines. `build_listen.py N` for N>=7 writes `FrenchVideos/A2/NN-listen-ep01-NN.mp4` (needs listen.mp4 for ALL earlier episodes, 1-6 included).
