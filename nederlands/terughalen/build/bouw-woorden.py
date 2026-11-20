#!/usr/bin/env python3
"""Bouwt data/woordbank.js uit de woordenlijsten die je al had.

Bron: ../studeerkamer/seeds/*.json (blijft onaangeroerd).
Uitvoer is platte JS, want file:// mag geen JSON inladen.

Draaien: python3 build/bouw-woorden.py
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SEEDS = os.path.join(os.path.dirname(ROOT), "studeerkamer", "seeds")

# alleen wat een B1/B2-lezer echt nodig heeft; C1 mag erbij als je het aanzet
BRONNEN = [("vocabulary_core.json", 0), ("vocabulary_refresher.json", 0),
           ("vocabulary_b2.json", 0), ("vocabulary_c1.json", 1)]


def main():
    woorden, gezien = [], set()
    for naam, extra in BRONNEN:
        pad = os.path.join(SEEDS, naam)
        if not os.path.exists(pad):
            print("  ontbreekt:", naam); continue
        data = json.load(open(pad, encoding="utf-8"))
        for it in (data["items"] if isinstance(data, dict) else data):
            nl = (it.get("dutch") or "").strip()
            en = (it.get("english") or "").strip()
            if not nl or not en or nl.lower() in gezien:
                continue
            gezien.add(nl.lower())
            rij = {"nl": nl, "en": en, "n": it.get("level") or "B2"}
            if it.get("exampleNL"):
                rij["z"] = it["exampleNL"].strip()
            if extra:
                rij["x"] = 1
            woorden.append(rij)

    uit = os.path.join(ROOT, "data", "woordbank.js")
    with open(uit, "w", encoding="utf-8") as f:
        f.write("/* GEGENEREERD door build/bouw-woorden.py — niet met de hand bewerken. */\n")
        f.write("window.T_WOORDEN = ")
        json.dump(woorden, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")
    kern = len([w for w in woorden if "x" not in w])
    print("woordbank.js  %d woorden (%d binnen B2)  %.0f kB"
          % (len(woorden), kern, os.path.getsize(uit) / 1024))


if __name__ == "__main__":
    main()
