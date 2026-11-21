# Episode engine (built with episode 1)
Shared code in `francais/jurassic-serie/`: `voices.py` (voice table), `characters.py` (6 busts), `dsl.py` (script helpers), `episode_audio.py` (Azure TTS -> timeline), `episode_render.py` (frames + encode), `fetch_commons.py` (Commons search/download). An episode folder `francais/jurassic-serie/episodes/epNN-slug/` needs only: `lesson_plan.md`, `script_data.py`, `imgmap.py`, `images/` (titles.txt, files, credits.json, catalog.md). Never copy engine code into the episode.

## Run (from the languages/ root; episode folder = EP)
1. Images: `python3 francais/jurassic-serie/fetch_commons.py search "query" 10` -> pick titles -> `EP/images/titles.txt` -> `python3 -u .../fetch_commons.py fetch EP/images` (run_in_background; ~3 min for 40 files). LOOK at every image (contact sheets), write `images/catalog.md`, avoid titles/contents that show the films. Make `imgmap.py` = `IMG = {key: filename}`.
2. Audio (Azure venv): `nederlands/eurostar-video/.venv/bin/python francais/jurassic-serie/episode_audio.py EP` -> `audio/narration.wav`, `audio/timeline.json`, prints duration, boards %, card count and WARN lines (board groups vs `[[+]]`, alignment). Cached per item in `audio/cache`, so re-runs are quick.
3. Stills: `/opt/homebrew/bin/python3.13 francais/jurassic-serie/episode_render.py EP still 95s 300s ...` -> `EP/qa/still_N.png`. It prints `WARN long photo hold` (>24 s visible) and `MISSING IMAGE`.
4. Render (run_in_background, ~9 min for 26 min on 16 cores): same script without `still` -> `EP/master_720.mp4`.
5. Encode: `ffmpeg -y -i EP/master_720.mp4 -vf scale=1280:-2 -c:v libx264 -profile:v high -preset slow -crf 30 -pix_fmt yuv420p -c:a aac -b:a 80k -ac 1 -movflags +faststart EP/final.mp4`, copy to `~/Library/Mobile Documents/com~apple~CloudDocs/FrenchVideos/A1|A2/NN-slug.mp4`, `ls -lh`, delete master.

## script_data.py format
```
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'jurassic-serie'))
from dsl import *
meta(num=2, title="Les dinosaures", level='A1', slug='les-dinosaures', rate='-25%')   # A2: rate='-15%'
board('id', "Title", ["<s>je</s> <v>suis</v>", "# small annotation", "+second line of same group", ...])
chapter("Scène 1 · Titre", ['hammond'], bg='imgkey', id='s1')   # cast: up to 3 of ellie alan malcolm hammond owen claire
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

## Voices (fixed)
ellie fr-FR-VivienneMultilingualNeural (all English prompts and most explanations), alan fr-FR-RemyMultilingualNeural, malcolm fr-FR-LucienMultilingualNeural, hammond fr-FR-MauriceNeural, owen fr-FR-HenriNeural, claire fr-FR-DeniseNeural. Only ellie/alan/malcolm may use `explain`/English (multilingual `<lang>` tags). Owen/Claire/Hammond: French lines only (non-multilingual).

## Gotchas found
- Azure word-boundary events inside `<lang>` runs have garbled text and sometimes one extra event: `align()` matches by count, then by first letters; bare `?`/`!` tokens are skipped.
- `ImageDraw.Draw(im,'RGBA')` on an RGBA image overwrites instead of blending: the renderer keeps frames in RGB and uses `comp()` for layers.
- Non-multilingual voices cannot do English; boards need an `explain` speaker from ellie/alan/malcolm.
- Characters: `python3.13 characters.py sheet.png` renders all six busts.
- Don't use `pgrep` loops; use run_in_background and wait for the notification.
