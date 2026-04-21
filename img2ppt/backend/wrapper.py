"""
img2ppt backend wrapper.

Thin FastAPI layer that sits next to Edit-Banana (v1 or v2), adds CORS,
runs the CLI on uploaded images, and returns the generated DrawIO XML
directly as a file response. The frontend parses the XML and builds PPTX
client-side via pptxgenjs.

Why a wrapper instead of patching server_pa.py:
 - Upstream returns JSON with output_path (not the file itself)
 - We need a stable CORS config without touching upstream code
 - Easy to swap Edit-Banana v1 <-> v2 by changing EB_DIR

Usage:
    EB_DIR=/home/you/Edit-Banana python wrapper.py
    # or just run with defaults if wrapper.py is placed inside Edit-Banana/
"""

from __future__ import annotations

import os
import subprocess
import sys
import uuid
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import uvicorn

EB_DIR = Path(os.environ.get("EB_DIR", Path(__file__).resolve().parent)).resolve()
INPUT_DIR = EB_DIR / "input"
OUTPUT_DIR = EB_DIR / "output"
PYTHON = os.environ.get("EB_PYTHON", sys.executable)
TIMEOUT_SEC = int(os.environ.get("EB_TIMEOUT", "600"))
MAIN_SCRIPT = EB_DIR / "main.py"

ALLOWED_EXT = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tif", ".webp", ".pdf"}

app = FastAPI(title="img2ppt backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _check_env() -> None:
    if not MAIN_SCRIPT.exists():
        print(f"[WARN] {MAIN_SCRIPT} not found. Set EB_DIR to the Edit-Banana clone path.", flush=True)
    INPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "eb_dir": str(EB_DIR),
        "main_exists": MAIN_SCRIPT.exists(),
        "python": PYTHON,
    }


@app.get("/")
def root() -> dict:
    return {"service": "img2ppt wrapper", "endpoints": ["/health", "/convert"]}


def _find_output(stem: str) -> Path | None:
    """Edit-Banana writes output/<stem>/<stem>_merged.drawio.xml."""
    candidates = [
        OUTPUT_DIR / stem / f"{stem}_merged.drawio.xml",
        OUTPUT_DIR / stem / f"{stem}.drawio.xml",
        OUTPUT_DIR / stem / f"{stem}.xml",
        OUTPUT_DIR / f"{stem}.xml",
        OUTPUT_DIR / f"{stem}.drawio",
    ]
    for c in candidates:
        if c.exists():
            return c
    # Fallback: newest xml anywhere under output/
    xmls = sorted(OUTPUT_DIR.rglob("*.xml"), key=lambda p: p.stat().st_mtime, reverse=True)
    return xmls[0] if xmls else None


@app.post("/convert")
async def convert(
    file: UploadFile = File(...),
    format: str = Query("xml", pattern="^(xml|drawio)$"),
):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, f"Unsupported extension: {ext}. Allowed: {sorted(ALLOWED_EXT)}")

    stem = f"upload_{uuid.uuid4().hex[:12]}"
    input_path = INPUT_DIR / f"{stem}{ext}"
    input_path.write_bytes(await file.read())

    cmd = [PYTHON, str(MAIN_SCRIPT), "-i", str(input_path)]
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(EB_DIR),
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SEC,
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(504, f"Edit-Banana timed out after {TIMEOUT_SEC}s")
    finally:
        try:
            input_path.unlink(missing_ok=True)
        except Exception:
            pass

    if proc.returncode != 0:
        tail = (proc.stderr or proc.stdout or "")[-2000:]
        raise HTTPException(500, f"Edit-Banana failed (exit {proc.returncode}): {tail}")

    out_path = _find_output(stem)
    if not out_path:
        raise HTTPException(500, "No XML output produced. Check Edit-Banana logs and output/ dir.")

    return FileResponse(
        out_path,
        media_type="application/xml",
        filename=f"{Path(file.filename).stem}.xml",
    )


if __name__ == "__main__":
    host = os.environ.get("EB_HOST", "0.0.0.0")
    port = int(os.environ.get("EB_PORT", "8000"))
    uvicorn.run(app, host=host, port=port, log_level="info")
