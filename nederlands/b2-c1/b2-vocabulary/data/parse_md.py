#!/usr/bin/env python3
"""Convert dutch_b2_vocabulary_table.md to vocabulary.json."""
import json
import re
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parents[2] / "dutch_b2_vocabulary_table.md"
OUT = Path(__file__).resolve().parent / "vocabulary_b2.json"


def slugify(text: str) -> str:
    t = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return t


# Maps subcategory keywords (in supplementary section) → canonical parent category
SUPPLEMENT_MAP = [
    ("Subordinating", "Subordinating Conjunctions"),
    ("Coordinating", "Coordinating Conjunctions"),
    ("Discourse", "Discourse Markers"),
    ("Preposition", "Prepositional Phrases"),
    ("Modal", "Modal & Semi-modal Verbs"),
    ("Verb", "Verbs – Mixed"),
    ("Adjective", "Adjectives – Mixed"),
    ("Adverb", "Adverbs – Mixed"),
    ("Society", "Nouns – Society & Politics"),
    ("Politic", "Nouns – Society & Politics"),
    ("Work", "Nouns – Work & Economy"),
    ("Economy", "Nouns – Work & Economy"),
    ("Education", "Nouns – Education & Knowledge"),
    ("Technology", "Nouns – Technology & Innovation"),
    ("Environment", "Nouns – Environment & Nature"),
    ("Health", "Nouns – Health & Wellbeing"),
    ("Tense", "Tense & Aspect Markers"),
    ("Opinion", "Expressing Opinion & Stance"),
    ("Stance", "Expressing Opinion & Stance"),
    ("Passive", "Passive Voice Constructions"),
    ("Conditional", "Conditional & Hypothetical Language"),
    ("Formal", "Formal Expressions"),
    ("Idiom", "Common Idioms"),
    ("Argumentation", "Argumentation"),
    ("Cause", "Argumentation – Cause & Effect"),
    ("Statistic", "Numbers & Statistics Vocabulary"),
    ("Number", "Numbers & Statistics Vocabulary"),
]


def clean_category(name: str) -> str:
    # "1. Subordinating Conjunctions (verb goes to end of clause)" → "Subordinating Conjunctions"
    name = re.sub(r"^\d+\.\s*", "", name)
    name = re.sub(r"\s*\([^)]+\)\s*$", "", name)
    return name.strip()


def map_supplement(subcat: str | None) -> str | None:
    if not subcat:
        return None
    for needle, canonical in SUPPLEMENT_MAP:
        if needle.lower() in subcat.lower():
            return canonical
    return None


def parse():
    lines = SRC.read_text(encoding="utf-8").splitlines()
    items = []
    current_h2 = None
    current_h3 = None
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i]
        if line.startswith("## "):
            current_h2 = re.sub(r"\*+", "", line[3:]).strip()
            current_h3 = None
        elif line.startswith("### "):
            current_h3 = re.sub(r"\*+", "", line[4:]).strip()
        elif line.startswith("|") and "---" not in line and current_h2:
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            # Skip header row
            if len(cells) == 4 and cells[0].lower() not in ("dutch",):
                dutch, english, en_ex, nl_ex = cells
                # Skip obvious non-data rows
                if not dutch or dutch.startswith("-"):
                    i += 1
                    continue
                raw_cat = current_h2
                category = clean_category(raw_cat)
                # Re-map supplementary items into their canonical parent category
                if "SUPPLEMENTARY" in raw_cat.upper():
                    mapped = map_supplement(current_h3)
                    if mapped:
                        category = mapped
                    else:
                        category = "Extras"
                items.append({
                    "id": f"b2-{len(items)+1:04d}",
                    "level": "B2",
                    "category": category,
                    "subcategory": current_h3,
                    "dutch": dutch,
                    "english": english,
                    "exampleEN": en_ex,
                    "exampleNL": nl_ex,
                })
        i += 1
    return items


def main():
    items = parse()
    # De-dup on (dutch, english)
    seen = set()
    deduped = []
    for it in items:
        key = (it["dutch"].lower(), it["english"].lower())
        if key in seen:
            continue
        seen.add(key)
        deduped.append(it)
    # Re-assign ids
    for idx, it in enumerate(deduped, 1):
        it["id"] = f"b2-{idx:04d}"

    # Build category list
    categories = {}
    for it in deduped:
        cat = it["category"]
        categories.setdefault(cat, 0)
        categories[cat] += 1

    OUT.write_text(json.dumps({
        "items": deduped,
        "stats": {"total": len(deduped), "byCategory": categories},
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(deduped)} items to {OUT}", file=sys.stderr)
    print(f"Categories: {len(categories)}", file=sys.stderr)


if __name__ == "__main__":
    main()
