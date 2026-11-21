# Engine voor Jurassic Luisteren (gebouwd met B2-aflevering 1)
Gedeelde code in `nederlands/jurassic-luister/engine/`: `voices.py` (stemtabel), `levels.py` (B2/C1: tempo, pauze, kaartduur, map, disclaimertekst), `dsl.py` (script.txt-lader), `episode_audio.py` (Azure TTS naar timeline), `episode_render.py` (frames + ondertitels + kaartjes), `autoimg.py` (foto-wissels automatisch aanvullen), `fetch_commons.py` (Commons zoeken/downloaden), `characters.py` (bustes: ashok hammond alan ellie malcolm owen claire). Kopieer nooit engine-code naar een aflevering. Wijzig NOOIT iets in `francais/jurassic-serie/` (daar werken andere agents mee). Dit is een aparte, Nederlandse engine.

Afleveringmap: `episodes/b2-epNN-<slug>/` of `episodes/c1-epNN-<slug>/` met: `research.md`, `script.txt`, `script_data.py` (3 regels, kopieer van b2-ep01), `imgmap.py` (`IMG = {sleutel: bestand}`), `imgpools.py` (`POOLS = {hoofdstuknr: [sleutels]}`), `images/` (titles.txt, bestanden, credits.json, catalog.md), later `audio/`, `qa/`.

## Niveau-instelling
`@meta level=B2` of `level=C1` in script.txt. levels.py bepaalt: B2 rate 0%, 0,4 s pauze, kaart 4,0 s; C1 rate +6%, 0,3 s pauze, kaart 4,6 s. De uitvoermap voor iCloud staat in `levels.py` (`folder`): `~/Library/Mobile Documents/com~apple~CloudDocs/DutchVideos/B2` of `/C1`, bestandsnaam `NN-<film-slug>.mp4` (bijv. `01-jurassic-park.mp4`). Het aantal kaartjes en de moeilijkheid bepaal je in het script (zie SERIES.md); de engine toont alle kaartjes, 2 tegelijk (rechtsboven).

## script.txt
```
@meta num=1 ; title=Jurassic Park ; level=B2 ; slug=jurassic-park ; film=Jurassic Park (1993)
@alias Nublar=Noeblar ; Kulithalai=Koelietalai ; Nedry=Nedri          # uitspraak, alleen losse woorden
== 1 · Titel van hoofdstuk | cast: alan ellie malcolm ashok | bg: kauai_aerial
ashok: [[kauai_aerial]]Een zin met een {kaartje|Nederlandse uitleg|English meaning} erin.
```
- Sprekers: ashok hammond alan ellie malcolm owen claire (stemmen: voices.py). Eén regel = één beurt.
- `{item|NL-uitleg|EN}`: kaartje op het moment dat het woord klinkt. Item mag een uitdrukking van meerdere woorden zijn (met lidwoord bij zelfstandige naamwoorden); precies 3 velden, geen `|` of `{}` in de tekst. Houd NL-uitleg kort (max ~70 tekens, 2 regels).
- `[[sleutel]]`: fotowissel vanaf het volgende woord. Markers staan aan het BEGIN van een woord.
- Cast: tot 5 bustes onder in beeld (de spreker komt er automatisch bij).
- Hoofdstukken: 8-12, met chip linksboven. Woordbudget voor ~25 min: B2 3.600-3.700 woorden (gemeten ~145-155 woorden/min), C1 4.300-4.500 woorden (gemeten ~180 woorden/min bij +6%). Render-processen beperken met env `RENDER_PROCS=4` als andere agents ook renderen. Lint: tel woorden/kaartjes met een script (strip `{...|...}` naar item en `[[...]]`).

## Draaien (vanuit de `languages/`-root; EP = aflevering)
1. Foto's: `python3 engine/fetch_commons.py search "zoekterm" 8`, kies titels, zet `File:...` per regel in `EP/images/titles.txt` (Franse serie-foto's mogen gekopieerd worden uit `francais/jurassic-serie/episodes/*/images`, inclusief credits.json), dan `python3 -u engine/fetch_commons.py fetch EP/images` met run_in_background (960 px; ~15% van de titels faalt; trage rate limit, 40 foto's ~5 min). Bekijk ALLE foto's met Read (contactbladen) en schrijf `images/catalog.md`. Gebruik een foto alleen waar de dialoog erover gaat; noem skeletten en illustraties "op deze foto".
2. Audio (Azure venv): `nederlands/eurostar-video/.venv/bin/python nederlands/jurassic-luister/engine/episode_audio.py EP` (run_in_background). Geeft minuten spraak, woorden, kaartjes, alignment-waarschuwingen. Cache per beurt; tweede run duurt seconden. Eerste 8 s zijn titelkaart (3,5 s) + disclaimerkaart (4,5 s); audio start daarna.
3. Foto-wissels: `/opt/homebrew/bin/python3.13 engine/episode_render.py EP still 2s` print `WARN long photo hold` (>20 s). Vul aan met `python3 engine/autoimg.py EP 10` (gebruikt `imgpools.py`), draai audio opnieuw (cache), controleer weer. Richtlijn: elke 8-15 s een nieuwe foto; ~100+ wissels in 25 min, dus 70+ unieke foto's of herhaling met afstand.
4. Stills: `... episode_render.py EP still 95s 300s ...` naar `EP/qa/still_N.png`; kijk ernaar (titel, disclaimer, sprekers, kaartjes, chip, einde).
5. Render (run_in_background): zonder `still`; 1280x720, 30 fps, multiprocessing; master `EP/master_720.mp4` (veryfast crf 18). Eindkaarten: disclaimer (4,5 s) + foto-credits (11 s).
6. Encode: `ffmpeg -y -i EP/master_720.mp4 -vf scale=1280:-2 -c:v libx264 -profile:v high -preset slow -crf 30 -pix_fmt yuv420p -c:a aac -b:a 80k -ac 1 -ar 48000 -movflags +faststart EP/final.mp4`; kopieer naar `.../DutchVideos/B2/01-jurassic-park.mp4`, `ls -lh`, verwijder de master.

## Weergave
Foto vol beeld met langzame Ken Burns, cross-fade 0,6 s; bustes linksonder (spreker gehighlight, mond naar viseme, knipperen); Nederlandse ondertitel onderaan (huidige zin, tot 3 regels, karaoke-highlight geel); kaartjes rechtsboven (Nederlands item + Nederlandse uitleg + Engels, max 2 gestapeld); hoofdstukchip linksboven (4,8 s); titelkaart + disclaimerkaart bij de start; disclaimer + foto-credits aan het einde. Geen Engelse ondertitels, geen borden, geen oefeningen.

## Kopie-voor-kopie regels voor afleveringen 2-6 (B2) en C1
- Disclaimertekst is vast in levels.py (niet wijzigen); filmscènes volgen de film nauw (zelfde situaties, zelfde volgorde), maar alle zinnen eigen Nederlands, geen filmcitaten, geen beroemde regels, geen stills/logo's/muziek.
- Ashok doet mee aan het verhaal (zie SERIES.md voor zijn rol per film); stem nl-BE-ArnaudNeural. Gebruik per aflevering 2-4 personages naast Ashok.
- Controleer de plot op Wikipedia en schrijf `research.md`.
- Een lintscript is nuttig: `{...}` met niet-3 velden breekt de parser.
- Aliassen: alleen losse woorden (anders klopt de woordindex voor ondertitels niet).
- Run lange taken met run_in_background; geen pgrep-lussen.
- Stemmen met `<lang xml:lang="nl-NL">` (alan, malcolm, hammond) geven woordgrens-events met verminkte tekst, maar het aantal klopt; alignment werkt op index en gaf 0 waarschuwingen.
