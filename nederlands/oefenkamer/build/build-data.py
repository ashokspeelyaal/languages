#!/usr/bin/env python3
"""Genereert data/reference.js en data/vocab.js voor de Oefenkamer.

Bronnen (blijven onaangeroerd):
  ../studiemateriaal/grammatica-overzicht.html   -> uitlegteksten per hoofdstuk
  ../studeerkamer/seeds/vocabulary_*.json        -> woordenschat

Output is platte JS (window.OK_REFERENCE / window.OK_VOCAB) zodat alles
werkt vanaf file:// zonder server (fetch() mag daar geen lokale bestanden lezen).

Draaien:  python3 build/build-data.py
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                    # oefenkamer/
NL = os.path.dirname(ROOT)                      # nederlands/
SRC_DOC = os.path.join(NL, "studiemateriaal", "grammatica-overzicht.html")
SEEDS = os.path.join(NL, "studeerkamer", "seeds")
OUT = os.path.join(ROOT, "data")

BANNER = "/* GEGENEREERD door build/build-data.py — niet met de hand bewerken. */\n"


def build_reference():
    html = open(SRC_DOC, encoding="utf-8").read()
    arts = re.findall(
        r'<article class="hoofdstuk" id="([^"]+)">(.*?)</article>', html, re.S)
    out = {}
    for cid, body in arts:
        # kop uit het hoofdstuk halen, die tonen we zelf in de app
        m = re.search(r"<h2>(.*?)</h2>", body, re.S)
        title = re.sub(r"<[^>]+>", " ", m.group(1)) if m else cid
        title = re.sub(r"\s+", " ", title).strip()
        body = re.sub(r"<h2>.*?</h2>", "", body, count=1, flags=re.S)
        out[cid] = {"t": title, "h": body.strip()}
    if not out:
        sys.exit("geen hoofdstukken gevonden in " + SRC_DOC)
    path = os.path.join(OUT, "reference.js")
    with open(path, "w", encoding="utf-8") as f:
        f.write(BANNER)
        f.write("window.OK_REFERENCE = ")
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")
    print("reference.js  %4d hoofdstukken  %6.1f kB" %
          (len(out), os.path.getsize(path) / 1024))


# bron -> (prefix, bonus?)  bonus = boven B2, alleen als je wil rekken
FILES = [
    ("vocabulary_core.json", "core", False),
    ("vocabulary_refresher.json", "refr", False),
    ("vocabulary_b2.json", "b2", False),
    ("vocabulary_c1.json", "c1", True),
]


def build_vocab():
    items, seen = [], set()
    for fname, prefix, bonus in FILES:
        p = os.path.join(SEEDS, fname)
        if not os.path.exists(p):
            print("  overslaan (ontbreekt):", fname)
            continue
        data = json.load(open(p, encoding="utf-8"))
        src = data["items"] if isinstance(data, dict) else data
        for it in src:
            nl_ = (it.get("dutch") or "").strip()
            en_ = (it.get("english") or "").strip()
            if not nl_ or not en_:
                continue
            key = nl_.lower() + "|" + en_.lower()
            if key in seen:
                continue
            seen.add(key)
            row = {
                "id": it.get("id") or "%s-%04d" % (prefix, len(items) + 1),
                "l": it.get("level") or ("C1" if bonus else "B2"),
                "c": (it.get("category") or "Overig").strip(),
                "nl": nl_,
                "en": en_,
            }
            if it.get("exampleNL"):
                row["xn"] = it["exampleNL"].strip()
            if it.get("exampleEN"):
                row["xe"] = it["exampleEN"].strip()
            if bonus:
                row["b"] = 1
            items.append(row)
    path = os.path.join(OUT, "vocab.js")
    with open(path, "w", encoding="utf-8") as f:
        f.write(BANNER)
        f.write("window.OK_VOCAB = ")
        json.dump(items, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")
    lvls = {}
    for i in items:
        lvls[i["l"]] = lvls.get(i["l"], 0) + 1
    print("vocab.js      %4d woorden      %6.1f kB   %s" %
          (len(items), os.path.getsize(path) / 1024, lvls))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    build_reference()
    build_vocab()
