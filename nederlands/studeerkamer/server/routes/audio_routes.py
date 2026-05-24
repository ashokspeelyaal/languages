"""Audio blob storage. Replaces the IndexedDB BlobStore from the original app.

Two endpoint families:

  /api/audio/key/{logical_key}     — preferred. Client passes an opaque
    logical key like `listening-{exId}` or `exam-{examId}-q3/recording`;
    server parses owner_type/owner_id/filename and prepends the
    authenticated user's id. Client never sees the user_id, so it can
    store the same logical key it sent and call get() with it.

  /api/audio/{relative_path:path}  — direct (user_id-prefixed) access,
    kept for completeness.

Files live at: AUDIO_DIR/{user_id}/{owner_type}/{owner_id}/{filename}.mp3
where owner_type ∈ {writing, listening, exam, free}.
"""
import re
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse

from ..auth import require_user
from ..settings import AUDIO_DIR

router = APIRouter(prefix="/api/audio", tags=["audio"])


_SAFE = re.compile(r"[^a-zA-Z0-9_.\-]")
_KEY = re.compile(r"^(writing|listening|exam|free)-([^/]+)(?:/(.+))?$")


def _sanitise(s: str, default: str = "x") -> str:
    s = _SAFE.sub("_", s or "").strip("._") or default
    return s[:80]


def _parse_logical_key(logical_key: str):
    """Mirror of the client-side parseKey in blob-store.js."""
    m = _KEY.match(logical_key or "")
    if m:
        owner_type, owner_id, filename = m.group(1), m.group(2), (m.group(3) or "audio")
    else:
        owner_type, owner_id, filename = "free", "free", logical_key or "audio"
    return owner_type, owner_id, filename


def _path_for(user_id: int, owner_type: str, owner_id: str, filename: str) -> Path:
    p = AUDIO_DIR / str(user_id) / _sanitise(owner_type) / _sanitise(owner_id)
    p.mkdir(parents=True, exist_ok=True)
    return p / (_sanitise(filename, "audio") + ".mp3")


@router.get("/keys")
def list_keys(user=Depends(require_user)):
    """List every audio file the user owns, as logical keys + sizes.
    The PWA's offline sync pre-warms its cache by walking this list."""
    user_root = AUDIO_DIR / str(user["id"])
    keys = []
    total = 0
    if user_root.exists():
        for path in user_root.rglob("*.mp3"):
            try:
                rel = path.relative_to(user_root)
            except ValueError:
                continue
            parts = rel.parts
            if len(parts) != 3:
                continue
            owner_type, owner_id, fname = parts
            if owner_type not in {"writing", "listening", "exam", "free"}:
                continue
            filename = fname[:-4] if fname.endswith(".mp3") else fname
            key = f"{owner_type}-{owner_id}" + (f"/{filename}" if filename != "audio" else "")
            size = path.stat().st_size
            keys.append({"key": key, "size": size})
            total += size
    return {"keys": keys, "totalSize": total, "count": len(keys)}


# ---- Logical-key endpoints (preferred) ----

@router.post("/key/{logical_key:path}")
async def upload_by_key(
    logical_key: str,
    file: UploadFile = File(...),
    user=Depends(require_user),
):
    """Store an audio blob under a logical key. Returns the same logical
    key so the client can use it for later get() — matches the original
    BlobStore semantics."""
    owner_type, owner_id, filename = _parse_logical_key(logical_key)
    target = _path_for(user["id"], owner_type, owner_id, filename)
    with target.open("wb") as f:
        while chunk := await file.read(64 * 1024):
            f.write(chunk)
    return {"audioKey": logical_key, "size": target.stat().st_size}


@router.get("/key/{logical_key:path}")
def fetch_by_key(logical_key: str, user=Depends(require_user)):
    owner_type, owner_id, filename = _parse_logical_key(logical_key)
    target = _path_for(user["id"], owner_type, owner_id, filename)
    if not target.exists():
        raise HTTPException(404, "Not found")
    return FileResponse(target, media_type="audio/mpeg")


@router.delete("/key/{logical_key:path}")
def remove_by_key(logical_key: str, user=Depends(require_user)):
    owner_type, owner_id, filename = _parse_logical_key(logical_key)
    target = _path_for(user["id"], owner_type, owner_id, filename)
    if target.exists():
        target.unlink()
    return {"ok": True}


# ---- Legacy relative-path endpoints (user_id-prefixed) ----

@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    owner_type: str = Form("free"),
    owner_id: str = Form("free"),
    key: str = Form("audio"),
    user=Depends(require_user),
):
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
