"""Env loader. Single source of truth for runtime config."""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

ROOT = Path(__file__).resolve().parent.parent

USERS_RAW = os.environ.get("USERS", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "").strip()
AZURE_SPEECH_KEY = os.environ.get("AZURE_SPEECH_KEY", "").strip()
AZURE_SPEECH_REGION = os.environ.get("AZURE_SPEECH_REGION", "francecentral").strip()
DATABASE_PATH = Path(os.environ.get("DATABASE_PATH", str(ROOT / "data" / "frvocab.db"))).resolve()
AUDIO_DIR = Path(os.environ.get("AUDIO_DIR", str(ROOT / "data" / "audio"))).resolve()
SEEDS_DIR = Path(os.environ.get("SEEDS_DIR", str(ROOT / "seeds"))).resolve()
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "").strip()
AI_SOFT_LIMIT = int(os.environ.get("AI_SOFT_LIMIT", "50"))
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "15192"))

STATIC_DIR = ROOT / "static"

DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
AUDIO_DIR.mkdir(parents=True, exist_ok=True)


def parse_users(raw: str):
    """USERS=ashok:pw1,partner:pw2 → [('ashok', 'pw1'), ('partner', 'pw2')]"""
    out = []
    for entry in raw.split(","):
        entry = entry.strip()
        if not entry or ":" not in entry:
            continue
        name, _, pw = entry.partition(":")
        name = name.strip()
        pw = pw.strip()
        if name and pw:
            out.append((name, pw))
    return out


SEED_USERS = parse_users(USERS_RAW)
