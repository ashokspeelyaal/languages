"""Audio blob storage. Replaces the IndexedDB BlobStore from the original app.

Files live at AUDIO_DIR/{user_id}/{owner_type}/{owner_id}/{key}.mp3
where:
  owner_type ∈ {writing, listening, exam, free}
  owner_id   = exercise / exam id (or 'free' for ad-hoc clips)
  key        = arbitrary client-supplied filename (sanitised)

The owner-table row stores audio_path as the relative path so we can serve
it back via GET /api/audio/{relative_path}.
"""
import re
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse

from ..auth import require_user
from ..db import conn
from ..settings import AUDIO_DIR

router = APIRouter(prefix="/api/audio", tags=["audio"])


_SAFE = re.compile(r"[^a-zA-Z0-9_.\-]")


def _sanitise(s: str, default: str = "x") -> str:
    s = _SAFE.sub("_", s or "").strip("._") or default
    return s[:80]


def _path_for(user_id: int, owner_type: str, owner_id: str, key: str) -> Path:
    p = AUDIO_DIR / str(user_id) / _sanitise(owner_type) / _sanitise(owner_id)
    p.mkdir(parents=True, exist_ok=True)
    return p / (_sanitise(key, "audio") + ".mp3")


@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    owner_type: str = Form("free"),
    owner_id: str = Form("free"),
    key: str = Form("audio"),
    user=Depends(require_user),
):
    """Upload an audio blob. Returns the relative path the client should
    store in the owner row's audioKey field."""
    if owner_type not in {"writing", "listening", "exam", "free"}:
        raise HTTPException(400, "invalid owner_type")
    target = _path_for(user["id"], owner_type, owner_id, key)
    with target.open("wb") as f:
        while chunk := await file.read(64 * 1024):
            f.write(chunk)
    rel = target.relative_to(AUDIO_DIR).as_posix()
    return {"audioKey": rel, "size": target.stat().st_size}


@router.get("/{relpath:path}")
def fetch(relpath: str, user=Depends(require_user)):
    # Must start with the requesting user's id — never serve another user's audio.
    if not relpath.startswith(f"{user['id']}/"):
        raise HTTPException(404, "Not found")
    target = (AUDIO_DIR / relpath).resolve()
    if AUDIO_DIR not in target.parents and target != AUDIO_DIR:
        raise HTTPException(400, "Invalid path")
    if not target.exists():
        raise HTTPException(404, "Not found")
    return FileResponse(target, media_type="audio/mpeg")


@router.delete("/{relpath:path}")
def remove(relpath: str, user=Depends(require_user)):
    if not relpath.startswith(f"{user['id']}/"):
        raise HTTPException(404, "Not found")
    target = (AUDIO_DIR / relpath).resolve()
    if AUDIO_DIR not in target.parents:
        raise HTTPException(400, "Invalid path")
    if target.exists():
        target.unlink()
    return {"ok": True}
