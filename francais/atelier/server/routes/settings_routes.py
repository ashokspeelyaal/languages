"""Per-user settings backed by `user_kv`.

Schema in user_kv: one row per (user_id, key) with a JSON value. Keys:

  active_level     str — 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  register         str — 'tu' | 'vous'
  voice_pref       dict — {provider, voice, rate, region, dialect}
  api_keys         dict — {openai_key, azure_key, azure_region}
                          (per-user override; overrides .env defaults)
  simple_ui        bool — A1-friendly UI on by default
  auto_article     bool — A1 helper: auto-prefix le/la in typed mode
  daily_goal       int  — minutes/day target
  onboarding_done  bool — has the user completed the wizard?
  settings_misc    dict — free-form bag for direction/strictMatch/theme/etc.

All endpoints require an authenticated user.

`get_user_keys()` is also imported by ai_proxy.py — it resolves API keys
preferring per-user values from `api_keys` over the .env defaults.
"""
from typing import Any, Optional

from fastapi import APIRouter, Body, Depends, HTTPException

from ..auth import require_user
from ..db import conn, jdump, jload
from ..settings import (
    AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION,
    OPENAI_API_KEY,
)

router = APIRouter(prefix="/api/settings", tags=["settings"])

LEVELS = {"A1", "A2", "B1", "B2", "C1"}
REGISTERS = {"tu", "vous"}

DEFAULT_VOICE_PREF = {
    "provider": "openai",
    "voice": "nova",          # Camille (clear female FR)
    "rate": "0%",
    "region": "francecentral",
    "dialect": "fr-FR",
}

DEFAULT_SETTINGS_MISC = {
    "direction": "fr-en",
    "strictMatch": False,      # accent-folded match is the default
    "theme": "auto",
    "sessionSize": 15,
    "playbackRate": 0.85,      # slow at A1; bumped to 1.0 at B1+ by client
    "outputLanguage": "Français (français de France)",
    "durationMinutes": 2.5,
}


# ---------------------------------------------------------------------------
# user_kv helpers
# ---------------------------------------------------------------------------
def _kv_get(user_id: int, key: str, default: Any = None) -> Any:
    with conn() as c:
        row = c.execute(
            "SELECT value FROM user_kv WHERE user_id = ? AND key = ?",
            (user_id, key),
        ).fetchone()
    if not row:
        return default
    return jload(row["value"], default=default)


def _kv_set(user_id: int, key: str, value: Any) -> None:
    with conn() as c:
        c.execute(
            """INSERT INTO user_kv (user_id, key, value) VALUES (?, ?, ?)
               ON CONFLICT (user_id, key) DO UPDATE SET value = excluded.value""",
            (user_id, key, jdump(value)),
        )


# ---------------------------------------------------------------------------
# Shared key resolver (ai_proxy imports this)
# ---------------------------------------------------------------------------
def get_user_keys(user_id: int) -> dict:
    """Per-user override > .env default."""
    overrides = _kv_get(user_id, "api_keys", default={}) or {}
    return {
        "openai_key": (overrides.get("openai_key") or "").strip() or OPENAI_API_KEY,
        "azure_key": (overrides.get("azure_key") or "").strip() or AZURE_SPEECH_KEY,
        "azure_region": (overrides.get("azure_region") or "").strip() or AZURE_SPEECH_REGION,
    }


# ---------------------------------------------------------------------------
# Aggregate read — Store.boot() pulls this once and caches synchronously.
# ---------------------------------------------------------------------------
@router.get("")
def get_all(user=Depends(require_user)):
    voice_pref = _kv_get(user["id"], "voice_pref", default={}) or {}
    misc = _kv_get(user["id"], "settings_misc", default={}) or {}
    return {
        "active_level":    _kv_get(user["id"], "active_level", default="A1"),
        "register":        _kv_get(user["id"], "register", default="vous"),
        "voice_pref":      {**DEFAULT_VOICE_PREF, **voice_pref},
        "simple_ui":       bool(_kv_get(user["id"], "simple_ui", default=True)),
        "auto_article":    bool(_kv_get(user["id"], "auto_article", default=True)),
        "daily_goal":      int(_kv_get(user["id"], "daily_goal", default=15)),
        "onboarding_done": bool(_kv_get(user["id"], "onboarding_done", default=False)),
        "settings":        {**DEFAULT_SETTINGS_MISC, **misc},
        # Note: api_keys is NOT returned. The frontend never needs the key
        # values, only whether each provider is configured (see /api/ai/config).
    }


# ---------------------------------------------------------------------------
# Bulk PUT (used by Onboarding finish + the Paramètres page)
# ---------------------------------------------------------------------------
@router.put("")
def put_all(body: dict = Body(...), user=Depends(require_user)):
    if "active_level" in body:
        lvl = (body["active_level"] or "").upper()
        if lvl not in LEVELS:
            raise HTTPException(400, f"Invalid level: {body['active_level']}")
        _kv_set(user["id"], "active_level", lvl)
    if "register" in body:
        reg = (body["register"] or "").lower()
        if reg not in REGISTERS:
            raise HTTPException(400, f"Invalid register: {body['register']}")
        _kv_set(user["id"], "register", reg)
    if "voice_pref" in body and isinstance(body["voice_pref"], dict):
        cur = _kv_get(user["id"], "voice_pref", default={}) or {}
        cur.update({k: v for k, v in body["voice_pref"].items() if v is not None})
        _kv_set(user["id"], "voice_pref", cur)
    if "simple_ui" in body:
        _kv_set(user["id"], "simple_ui", bool(body["simple_ui"]))
    if "auto_article" in body:
        _kv_set(user["id"], "auto_article", bool(body["auto_article"]))
    if "daily_goal" in body:
        try:
            _kv_set(user["id"], "daily_goal", max(1, min(240, int(body["daily_goal"]))))
        except (TypeError, ValueError):
            raise HTTPException(400, "daily_goal must be an integer (minutes)")
    if "onboarding_done" in body:
        _kv_set(user["id"], "onboarding_done", bool(body["onboarding_done"]))
    if "settings" in body and isinstance(body["settings"], dict):
        cur = _kv_get(user["id"], "settings_misc", default={}) or {}
        cur.update(body["settings"])
        _kv_set(user["id"], "settings_misc", cur)
    if "api_keys" in body and isinstance(body["api_keys"], dict):
        cur = _kv_get(user["id"], "api_keys", default={}) or {}
        for k in ("openai_key", "azure_key", "azure_region"):
            if k in body["api_keys"]:
                v = body["api_keys"][k]
                cur[k] = v.strip() if isinstance(v, str) else v
        _kv_set(user["id"], "api_keys", cur)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Fine-grained shortcuts — the topbar level chooser uses /active_level
# rather than the bulk PUT to keep the hot path under 1 KB.
# ---------------------------------------------------------------------------
@router.put("/active_level")
def put_active_level(body: dict = Body(...), user=Depends(require_user)):
    lvl = (body.get("level") or "").upper()
    if lvl not in LEVELS:
        raise HTTPException(400, f"Invalid level: {body.get('level')}")
    _kv_set(user["id"], "active_level", lvl)
    return {"ok": True, "active_level": lvl}


@router.put("/register")
def put_register(body: dict = Body(...), user=Depends(require_user)):
    reg = (body.get("register") or "").lower()
    if reg not in REGISTERS:
        raise HTTPException(400, f"Invalid register: {body.get('register')}")
    _kv_set(user["id"], "register", reg)
    return {"ok": True, "register": reg}


@router.put("/simple_ui")
def put_simple_ui(body: dict = Body(...), user=Depends(require_user)):
    _kv_set(user["id"], "simple_ui", bool(body.get("simple_ui")))
    return {"ok": True}


@router.put("/onboarding_done")
def put_onboarding_done(body: dict = Body(...), user=Depends(require_user)):
    _kv_set(user["id"], "onboarding_done", bool(body.get("done", True)))
    return {"ok": True}
