"""Per-user UI preferences AND per-user API keys.

Keys entered in the UI take precedence over server `.env` values. They are
stored in plaintext in SQLite (user_kv table) — same trust level as the
bcrypt password hashes there. If you're concerned about DB-at-rest exposure,
keep keys in `.env` and leave the UI fields empty.
"""
from fastapi import APIRouter, Depends

from ..auth import require_user
from ..db import conn, jdump, jload

router = APIRouter(prefix="/api/settings", tags=["settings"])


DEFAULTS = {
    "direction": "nl-en",
    "levels": ["A2", "B1", "B2", "C1"],
    "sessionSize": 15,
    "categoryFilter": None,
    "coreOnly": False,
    # AI
    "apiKey": "",
    "aiModel": "gpt-5-mini",
    "aiEnabled": True,
    "aiSoftLimit": 50,
    # TTS / STT
    "ttsProvider": "openai",
    "ttsModel": "gpt-4o-mini-tts",
    "ttsVoice": "shimmer",
    "sttModel": "gpt-4o-mini-transcribe",
    # Azure
    "azureKey": "",
    "azureRegion": "westeurope",
    "azureVoice": "nl-BE-DenaNeural",
    "azureRate": "-10%",
    # Misc
    "outputLanguage": "Dutch (Belgian / Standard Dutch register)",
    "durationMinutes": 2.5,
    "speechRate": 0.95,
}


@router.get("")
def get_settings(user=Depends(require_user)):
    with conn() as c:
        row = c.execute(
            "SELECT value FROM user_kv WHERE user_id = ? AND key = 'settings'",
            (user["id"],),
        ).fetchone()
    stored = jload(row["value"], {}) if row else {}
    merged = dict(DEFAULTS)
    merged.update(stored or {})
    return {"settings": merged}


@router.put("")
def put_settings(body: dict, user=Depends(require_user)):
    """Merge a settings patch into the stored blob. apiKey / azureKey are
    accepted here — the AI proxy uses them in preference to .env values."""
    with conn() as c:
        row = c.execute(
            "SELECT value FROM user_kv WHERE user_id = ? AND key = 'settings'",
            (user["id"],),
        ).fetchone()
        stored = jload(row["value"], {}) if row else {}
        stored.update(body or {})
        c.execute(
            """INSERT INTO user_kv (user_id, key, value) VALUES (?, 'settings', ?)
               ON CONFLICT (user_id, key) DO UPDATE SET value = excluded.value""",
            (user["id"], jdump(stored)),
        )
    merged = dict(DEFAULTS); merged.update(stored)
    return {"settings": merged}


def get_user_keys(user_id: int) -> dict:
    """Look up the user's effective API keys. UI-stored values win over
    server .env; falls back to env if the user hasn't set their own.
    Called by ai_proxy.py before every upstream request."""
    from ..settings import OPENAI_API_KEY, AZURE_SPEECH_KEY, AZURE_SPEECH_REGION
    with conn() as c:
        row = c.execute(
            "SELECT value FROM user_kv WHERE user_id = ? AND key = 'settings'",
            (user_id,),
        ).fetchone()
    s = jload(row["value"], {}) if row else {}
    return {
        "openai_key":   (s.get("apiKey")      or "").strip() or OPENAI_API_KEY,
        "azure_key":    (s.get("azureKey")    or "").strip() or AZURE_SPEECH_KEY,
        "azure_region": (s.get("azureRegion") or "").strip() or AZURE_SPEECH_REGION,
    }
