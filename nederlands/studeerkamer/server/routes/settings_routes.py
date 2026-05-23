"""Per-user UI preferences. NOT secrets — API keys live in server env now,
NOT here. This stores: direction, levels filter, session size, coreOnly,
selected models / voices, output language, default duration."""
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
    "aiModel": "gpt-5-mini",
    "aiEnabled": True,
    "ttsProvider": "openai",
    "ttsModel": "gpt-4o-mini-tts",
    "ttsVoice": "shimmer",
    "azureVoice": "nl-BE-DenaNeural",
    "azureRate": "-10%",
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
    """Merge a settings patch into the stored blob."""
    with conn() as c:
        row = c.execute(
            "SELECT value FROM user_kv WHERE user_id = ? AND key = 'settings'",
            (user["id"],),
        ).fetchone()
        stored = jload(row["value"], {}) if row else {}
        # Server-side, we reject any attempt to store secrets here.
        for forbidden in ("apiKey", "azureKey"):
            body.pop(forbidden, None)
        stored.update(body or {})
        c.execute(
            """INSERT INTO user_kv (user_id, key, value) VALUES (?, 'settings', ?)
               ON CONFLICT (user_id, key) DO UPDATE SET value = excluded.value""",
            (user["id"], jdump(stored)),
        )
    merged = dict(DEFAULTS); merged.update(stored)
    return {"settings": merged}
