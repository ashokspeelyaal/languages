# Cindy revision set — French A1→A2, for the lesson of 11 September 2026

Built from `Cindy-italki.docx` (the italki chat log with Cindy CHENE, lessons of
11, 13, 15, 18, 22 June and 2, 8, 13 July 2026). Bilingual: English + தமிழ்.

## Files

**`cindy-complet.pdf` — 102 pages.** All three volumes in one document, with *instructional* Tamil removed: explanatory prose is English-only, while Tamil is kept wherever it glosses French (vocabulary tables, drill prompts, dialogues, conjugation labels, and the translations of Cindy's texts). Built by `build/merge.py`, which runs `build/trim.py` over the three volume HTMLs and concatenates them.

The three volumes are also kept separately, fully bilingual:

## The three volumes

| File | Pages | What it is |
|---|---|---|
| `01-revision-cindy.pdf` | 87 | **Cindy's material only.** All eight lessons rebuilt lesson by lesson, in her order, with her texts, her corrections and all **36 of her images**. Vocabulary tables with a ruled "write it 2×" column, grammar rules, drills with answer keys, a homework ledger and a ~260-word master glossary. Ends with an explicit **"END OF CINDY'S MATERIAL"** separator. |
| `02-au-dela.pdf` | 25 | **The extra (~29% of Vol. 1), kept deliberately separate.** Opens with a full-width red **"STOP — everything after this line was NOT taught by Cindy"** banner. Nine short chapters, each growing out of something already sitting in her own texts, links or corrections: possessives, present tense, passé composé, futur proche, negation, numbers & time, en/au/aux, *les repas* (the link she sent on her last day), and four texts to write plus the opening script for 11 September. |
| `03-cahier-decriture.pdf` | 20 | **Writing workbook — no new content.** Copy-and-trace, dictation, transformation, EN→FR and TA→FR translation, ten free-writing prompts, a self-check list and an error log. Print it again every week. |

## Rebuilding

```
python3 build/book1.py && python3 build/book2.py && python3 build/book3.py
python3 build/merge.py          # -> cindy-complet.html
NODE_PATH=/Users/ashokkumar/Development/Workspace/SpeelYaal/campuszeus-college/demo-recorder/node_modules \
  node build/render.js          # all three, or pass names
```

`build/kit.py` holds the shared stylesheet and helpers (`vocab`, `trace`, `drill`,
`lines`, `fig`, `conj`, …). Images live in `img/` and are inlined as base64, so each
HTML file is self-contained. `source-chat.txt` is the extracted chat log with image
markers, kept for provenance.

No study schedule, deadlines or pacing appear anywhere in the three PDFs — by design. Work through them at whatever pace suits you.
