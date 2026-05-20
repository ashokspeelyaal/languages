#!/usr/bin/env python3
"""Combine vocabulary_b2.json + vocabulary_refresher.json into js/vocab-data.js.

The generated .js file defines window.VOCAB_DATA so the SPA can be opened
directly from disk (browsers block fetch() on file:// URLs).
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "js" / "vocab-data.js"


def main():
    b2 = json.loads((HERE / "vocabulary_b2.json").read_text(encoding="utf-8"))
    r = json.loads((HERE / "vocabulary_refresher.json").read_text(encoding="utf-8"))
    combined = {"items": r["items"] + b2["items"], "levels": ["A2", "B1", "B2"]}
    with OUT.open("w", encoding="utf-8") as f:
        f.write("// Auto-generated. Regenerate: python3 parse_md.py && python3 build_data_js.py\n")
        f.write("window.VOCAB_DATA = ")
        json.dump(combined, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")
    print(f"wrote {OUT} ({len(combined['items'])} items)")


if __name__ == "__main__":
    main()
