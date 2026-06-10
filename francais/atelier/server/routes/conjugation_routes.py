"""Conjugation data exposed to the frontend rules engine.

Architecture: the rules engine for regular -er / -ir / -re lives in
client JS (static/js/conjugation-rules.js) so drills are zero-latency.
The server's job is to expose:

  1. The list of conjugable verb lemmas with their verb_group + level
     (so the client knows what to show and which rules to apply).
  2. The irregular-verb forms table (from verb_forms + the per-verb
     auxiliary + past participle stored under tense='_meta').

A single GET /api/conjugation/data ships everything needed for a full
session — typically <50 KB after gzip, served once per Store.boot().
"""
from fastapi import APIRouter, Depends

from ..auth import require_user
from ..db import conn

router = APIRouter(prefix="/api/conjugation", tags=["conjugation"])


@router.get("/data")
def all_data(user=Depends(require_user)):
    """Returns:
      {
        "lemmas":  [{lemma, verb_group, level, english}, …],
        "irregulars": {
          lemma: {
            "auxiliary": "avoir"|"être",
            "past_participle": "...",
            "tenses": { tense_name: { person: form, … }, … }
          }
        }
      }
    """
    with conn() as c:
        # Conjugable verbs from vocab_items. Custom_vocab can hold verbs
        # too but we leave those out of the canonical lemma list for now
        # — the user can still look them up by typing the infinitive.
        lemma_rows = c.execute(
            """SELECT french AS lemma, verb_group, level, english
               FROM vocab_items
               WHERE pos = 'verb' AND verb_group IS NOT NULL
               ORDER BY level, french"""
        ).fetchall()
        form_rows = c.execute(
            """SELECT lemma, tense, person, form FROM verb_forms
               ORDER BY lemma, tense, person"""
        ).fetchall()

    irregulars: dict = {}
    for r in form_rows:
        lemma = r["lemma"]
        tense = r["tense"]
        person = r["person"]
        form = r["form"]
        if lemma not in irregulars:
            irregulars[lemma] = {"auxiliary": None, "past_participle": None, "tenses": {}}
        if tense == "_meta":
            if person == "_aux":
                irregulars[lemma]["auxiliary"] = form
            elif person == "_pp":
                irregulars[lemma]["past_participle"] = form
            continue
        irregulars[lemma]["tenses"].setdefault(tense, {})[person] = form

    return {
        "lemmas": [dict(r) for r in lemma_rows],
        "irregulars": irregulars,
    }
