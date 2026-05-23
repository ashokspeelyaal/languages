"""CNaVT-C1-EP mock exam attempts. Each attempt has 4 sections — lezen,
luisteren, schrijven, spreken — and we store the entire `sections` blob as
JSON because the structure varies per section type."""
import secrets
import shutil
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from ..auth import require_user
from ..settings import AUDIO_DIR
from ..db import conn, jdump, jload

router = APIRouter(prefix="/api/exam", tags=["exam"])


def _make_id() -> str:
    return "exam-" + secrets.token_urlsafe(6).replace("_", "").replace("-", "")[:10]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _blank_sections() -> dict:
    section = {"status": "pending", "content": None, "answers": None, "grading": None}
    return {"lezen": dict(section), "luisteren": dict(section),
            "schrijven": dict(section), "spreken": dict(section)}


def _row(r) -> dict:
    return {
        "id": r["id"],
        "type": r["type"],
        "title": r["title"],
        "currentSection": r["current_section"],
        "sections": jload(r["sections_json"], _blank_sections()),
        "createdAt": r["created_at"],
        "updatedAt": r["updated_at"],
        "completedAt": r["completed_at"],
    }


@router.get("")
def list_exams(user=Depends(require_user)):
    with conn() as c:
        rows = c.execute(
            "SELECT * FROM exam_attempts WHERE user_id = ? ORDER BY updated_at DESC",
            (user["id"],),
        ).fetchall()
    return {"exams": [_row(r) for r in rows]}


@router.get("/{exam_id}")
def get_exam(exam_id: str, user=Depends(require_user)):
    with conn() as c:
        r = c.execute(
            "SELECT * FROM exam_attempts WHERE id = ? AND user_id = ?",
            (exam_id, user["id"]),
        ).fetchone()
    if not r:
        raise HTTPException(404, "Not found")
    return {"exam": _row(r)}


@router.post("")
def create_exam(body: dict = None, user=Depends(require_user)):
    body = body or {}
    eid = body.get("id") or _make_id()
    title = body.get("title") or ("Examen · " + datetime.now().strftime("%d %b %Y"))
    with conn() as c:
        c.execute(
            """INSERT OR REPLACE INTO exam_attempts (id, user_id, title, sections_json)
               VALUES (?, ?, ?, ?)""",
            (eid, user["id"], title, jdump(_blank_sections())),
        )
        r = c.execute("SELECT * FROM exam_attempts WHERE id = ?", (eid,)).fetchone()
    return {"exam": _row(r)}


@router.patch("/{exam_id}")
def patch_exam(exam_id: str, body: dict, user=Depends(require_user)):
    """Generic partial update — accepts currentSection, sections (whole blob),
    completedAt, title."""
    sets, values = [], []
    if "currentSection" in body:
        sets.append("current_section = ?"); values.append(body["currentSection"])
    if "sections" in body:
        sets.append("sections_json = ?"); values.append(jdump(body["sections"]))
    if "completedAt" in body:
        sets.append("completed_at = ?"); values.append(body["completedAt"])
    if "title" in body:
        sets.append("title = ?"); values.append(str(body["title"])[:200])
    if not sets:
        return {"ok": True}
    sets.append("updated_at = ?"); values.append(_now())
    values.extend([exam_id, user["id"]])
    with conn() as c:
        c.execute(
            f"UPDATE exam_attempts SET {', '.join(sets)} WHERE id = ? AND user_id = ?",
            values,
        )
        r = c.execute(
            "SELECT * FROM exam_attempts WHERE id = ? AND user_id = ?",
            (exam_id, user["id"]),
        ).fetchone()
    if not r:
        raise HTTPException(404, "Not found")
    return {"exam": _row(r)}


@router.patch("/{exam_id}/section/{section}")
def patch_section(exam_id: str, section: str, body: dict, user=Depends(require_user)):
    """Patch a single section — server merges body into sections[section]."""
    if section not in {"lezen", "luisteren", "schrijven", "spreken"}:
        raise HTTPException(400, "Unknown section")
    with conn() as c:
        r = c.execute(
            "SELECT sections_json FROM exam_attempts WHERE id = ? AND user_id = ?",
            (exam_id, user["id"]),
        ).fetchone()
        if not r:
            raise HTTPException(404, "Not found")
        sections = jload(r["sections_json"], _blank_sections())
        sections.setdefault(section, {})
        sections[section].update(body or {})
        c.execute(
            "UPDATE exam_attempts SET sections_json = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            (jdump(sections), _now(), exam_id, user["id"]),
        )
        r2 = c.execute(
            "SELECT * FROM exam_attempts WHERE id = ? AND user_id = ?",
            (exam_id, user["id"]),
        ).fetchone()
    return {"exam": _row(r2)}


@router.delete("/{exam_id}")
def delete_exam(exam_id: str, user=Depends(require_user)):
    """Exam audio is uploaded under data/audio/<uid>/exam/<owner_id>/. The
    BlobStore client uses logical keys like `exam-{examId}-q{i}` which my
    audio router parses into owner_type=exam, owner_id=`{examId}-q{i}`.
    Sweep the exam audio tree for any subdir whose name starts with this
    exam's id."""
    with conn() as c:
        c.execute(
            "DELETE FROM exam_attempts WHERE id = ? AND user_id = ?",
            (exam_id, user["id"]),
        )
    exam_root = AUDIO_DIR / str(user["id"]) / "exam"
    if exam_root.exists():
        for sub in exam_root.iterdir():
            if sub.name == exam_id or sub.name.startswith(exam_id + "-"):
                shutil.rmtree(sub, ignore_errors=True)
    return {"ok": True}
