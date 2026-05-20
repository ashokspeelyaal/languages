#!/usr/bin/env python3
"""Combine vocabulary_b2.json + vocabulary_refresher.json into js/vocab-data.js.

The generated .js file defines window.VOCAB_DATA so the SPA can be opened
directly from disk (browsers block fetch() on file:// URLs).
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "js" / "vocab-data.js"


# Categories that are inherently structural / closed-class — auto-flagged "core"
CORE_CATEGORIES = {
    "Subordinating Conjunctions",
    "Coordinating Conjunctions",
    "Discourse Markers",
    "Basic Prepositions",
    "Modal Particles",
    "Tricky Prepositions",
    "Pronouns – Forms",
    "Sentence Frames",
    "Tense & Aspect Markers",
    "Conditional & Hypothetical Language",
    "Daily Connectors",
    "Time & Frequency",
    "Argumentation",
    "Argumentation – Introducing Points",
    "Argumentation – Contrasting",
    "Argumentation – Concluding",
    "Argumentation – Cause & Effect",
    "Formal Discourse (C1)",
    "Expressing Opinion & Stance",
    "Modal & Semi-modal Verbs",
    "Word Building – Prefixes",
    "Passive Voice Constructions",
    "Adverbs – Time",
    "Formal Expressions",
}


def annotate_core(items):
    for it in items:
        if it.get("core") is True:
            continue  # already tagged in source JSON
        if it.get("category") in CORE_CATEGORIES:
            it["core"] = True
    return items


def main():
    b2 = json.loads((HERE / "vocabulary_b2.json").read_text(encoding="utf-8"))
    r = json.loads((HERE / "vocabulary_refresher.json").read_text(encoding="utf-8"))
    c1 = json.loads((HERE / "vocabulary_c1.json").read_text(encoding="utf-8"))
    core = json.loads((HERE / "vocabulary_core.json").read_text(encoding="utf-8"))
    items = annotate_core(r["items"] + b2["items"] + c1["items"] + core["items"])
    combined = {
        "items": items,
        "levels": ["A2", "B1", "B2", "C1"],
        "coreCount": sum(1 for it in items if it.get("core")),
    }
    with OUT.open("w", encoding="utf-8") as f:
        f.write("// Auto-generated. Regenerate: python3 parse_md.py && python3 build_data_js.py\n")
        f.write("window.VOCAB_DATA = ")
        json.dump(combined, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")
    print(f"wrote {OUT} ({len(combined['items'])} items, {combined['coreCount']} core)")


if __name__ == "__main__":
    main()
