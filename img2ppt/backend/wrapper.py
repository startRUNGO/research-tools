"""
img2ppt backend wrapper — v2 (in-process Pipeline).

Earlier version shelled out to `python main.py -i ...` per request, which
re-imported torch/paddle, re-built the SAM3 model, and re-JIT'd ONNX every
call — adding ~90-120s of cold-start to every single request.

This version imports `main.Pipeline` once at startup, holds the loaded
models in-process, and calls `pipeline.process_image()` per request. First
request still pays the warm-up cost; subsequent requests pay only actual
inference.

Env knobs:
    EB_DIR      Edit-Banana clone root (containing main.py, config/, ...)
    EB_UI_DIR   optional static UI dir to mount at /ui/  (default: EB_DIR/ui)
    EB_HOST     bind host     (default 0.0.0.0)
    EB_PORT     bind port     (default 8000)
    EB_TIMEOUT  ignored in v2 (kept for compatibility)
    EB_WARMUP   set to "0" to skip eager model load at startup
"""

from __future__ import annotations

import os
import sys
import threading
import time
import uuid
from concurrent.futures import Future, ThreadPoolExecutor
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

EB_DIR = Path(os.environ.get("EB_DIR", Path(__file__).resolve().parent)).resolve()
INPUT_DIR = EB_DIR / "input"
OUTPUT_DIR = EB_DIR / "output"
UI_DIR = Path(os.environ.get("EB_UI_DIR", EB_DIR / "ui")).resolve()
MAIN_SCRIPT = EB_DIR / "main.py"
WARMUP = os.environ.get("EB_WARMUP", "1") != "0"

ALLOWED_EXT = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tif", ".webp", ".pdf"}

# Make Edit-Banana importable.
if str(EB_DIR) not in sys.path:
    sys.path.insert(0, str(EB_DIR))

_pipeline = None
_pipeline_err: Optional[str] = None


def _import_pipeline():
    """Import main.Pipeline lazily so the FastAPI app can at least boot
    and return a useful /health error when EB_DIR is misconfigured."""
    global _pipeline, _pipeline_err
    if _pipeline is not None or _pipeline_err is not None:
        return
    try:
        # Resolve cwd to EB_DIR so relative paths in config.yaml (models/,
        # output/, input/) work as main.py expects.
        os.chdir(EB_DIR)
        from main import Pipeline  # type: ignore
        _pipeline = Pipeline()
        if WARMUP:
            # Property access just instantiates classes; actual model weights
            # (SAM3.pt, RMBG onnx, PaddleOCR) are loaded on first inference.
            # Drive one 256x256 dummy image through the full pipeline so the
            # *next* real request pays only inference time.
            print("[wrapper] warming up (running a dummy image through the pipeline) ...", flush=True)
            t0 = time.time()
            try:
                import numpy as _np
                from PIL import Image as _PILImage
                warm_dir = INPUT_DIR
                warm_dir.mkdir(parents=True, exist_ok=True)
                warm_path = warm_dir / "_warmup.png"
                arr = (_np.ones((256, 256, 3), dtype=_np.uint8) * 240)
                arr[40:120, 40:200] = (80, 120, 200)
                arr[140:220, 60:180] = (200, 80, 80)
                _PILImage.fromarray(arr).save(warm_path)
                _pipeline.process_image(
                    image_path=str(warm_path),
                    output_dir=str(OUTPUT_DIR / "_warmup"),
                )
                print(f"[wrapper] warmup done in {time.time() - t0:.1f}s", flush=True)
            except Exception as we:  # noqa: BLE001
                print(f"[wrapper] warmup FAILED (will retry on first real request): {we}", flush=True)
            finally:
                try:
                    warm_path.unlink(missing_ok=True)
                except Exception:
                    pass
    except Exception as e:  # noqa: BLE001
        _pipeline_err = f"{type(e).__name__}: {e}"
        print(f"[wrapper] FAILED to load Pipeline: {_pipeline_err}", flush=True)


app = FastAPI(title="img2ppt backend", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

if UI_DIR.is_dir():
    app.mount("/ui", StaticFiles(directory=str(UI_DIR), html=True), name="ui")

    # Also serve the UI at / so users don't have to type /ui/ — but register
    # this mount last so /health, /convert, and the routes above still match.


@app.on_event("startup")
def _on_startup() -> None:
    INPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    if not MAIN_SCRIPT.exists():
        print(f"[wrapper] WARN: {MAIN_SCRIPT} not found. Set EB_DIR.", flush=True)
        return
    _import_pipeline()


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "eb_dir": str(EB_DIR),
        "main_exists": MAIN_SCRIPT.exists(),
        "pipeline_loaded": _pipeline is not None,
        "pipeline_error": _pipeline_err,
    }


@app.get("/")
def root() -> dict:
    return {"service": "img2ppt wrapper v0.2.0", "endpoints": ["/health", "/convert", "/ui/"]}


def _find_output(stem: str) -> Optional[Path]:
    """Edit-Banana writes output/<stem>/<stem>_merged.drawio.xml."""
    candidates = [
        OUTPUT_DIR / stem / f"{stem}_merged.drawio.xml",
        OUTPUT_DIR / stem / f"{stem}.drawio.xml",
        OUTPUT_DIR / stem / f"{stem}.xml",
        OUTPUT_DIR / f"{stem}.xml",
    ]
    for c in candidates:
        if c.exists():
            return c
    xmls = sorted(OUTPUT_DIR.rglob("*.xml"), key=lambda p: p.stat().st_mtime, reverse=True)
    return xmls[0] if xmls else None


# ---------- Async job queue ----------
# Cloudflare quick tunnels time out at 100s; even Tailscale direct hits
# problems if the GPU is contended (e.g. co-tenant training jobs). Clients
# POST /convert to enqueue, then poll GET /jobs/{id} every few seconds.
# max_workers=1 because SAM3 + RMBG already use ~13GB; running two jobs
# concurrently OOMs.

_executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="eb-worker")
_jobs: dict[str, dict] = {}
_jobs_lock = threading.Lock()


def _run_pipeline_job(
    job_id: str,
    stem: str,
    input_path: Path,
    filename: str,
    with_text: bool,
    with_refinement: bool,
) -> None:
    t0 = time.time()
    try:
        _pipeline.process_image(
            image_path=str(input_path),
            output_dir=str(OUTPUT_DIR),
            with_text=with_text,
            with_refinement=with_refinement,
        )
        out_path = _find_output(stem)
        elapsed = time.time() - t0
        if not out_path:
            with _jobs_lock:
                _jobs[job_id].update(status="failed", elapsed=elapsed,
                                     error=f"Pipeline finished in {elapsed:.1f}s but produced no XML")
            return
        with _jobs_lock:
            _jobs[job_id].update(status="done", elapsed=elapsed, result_path=str(out_path))
        print(f"[wrapper] job {job_id} ({filename}) -> {out_path.name} in {elapsed:.1f}s", flush=True)
    except Exception as e:  # noqa: BLE001
        elapsed = time.time() - t0
        with _jobs_lock:
            _jobs[job_id].update(status="failed", elapsed=elapsed,
                                 error=f"{type(e).__name__}: {e}")
        print(f"[wrapper] job {job_id} FAILED after {elapsed:.1f}s: {e}", flush=True)
    finally:
        try:
            input_path.unlink(missing_ok=True)
        except Exception:
            pass


@app.post("/convert")
async def convert(
    file: UploadFile = File(...),
    sync: bool = Query(False, description="Block until done (not recommended via tunnel)"),
    with_text: bool = Query(True),
    with_refinement: bool = Query(False),
):
    """Enqueue a conversion job. Returns 202 with {job_id, poll_url} unless sync=true."""
    if _pipeline is None:
        if _pipeline_err is None:
            _import_pipeline()
        if _pipeline is None:
            raise HTTPException(503, f"Pipeline not loaded: {_pipeline_err or 'unknown'}")

    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, f"Unsupported extension: {ext}. Allowed: {sorted(ALLOWED_EXT)}")

    stem = f"upload_{uuid.uuid4().hex[:12]}"
    input_path = INPUT_DIR / f"{stem}{ext}"
    input_path.write_bytes(await file.read())

    job_id = uuid.uuid4().hex[:16]
    with _jobs_lock:
        _jobs[job_id] = {
            "status": "queued",
            "filename": file.filename,
            "stem": stem,
            "created": time.time(),
        }
    _executor.submit(_run_pipeline_job, job_id, stem, input_path,
                     file.filename or "", with_text, with_refinement)
    with _jobs_lock:
        _jobs[job_id]["status"] = "running"

    if sync:
        # Block up to 15 min in-line. Useful for curl tests on Tailscale.
        for _ in range(900):
            with _jobs_lock:
                st = _jobs[job_id]["status"]
                if st in ("done", "failed"):
                    break
            await_sleep(1)
        return await _get_job_result(job_id, filename=file.filename or "")

    return JSONResponse(
        status_code=202,
        content={
            "job_id": job_id,
            "status": "running",
            "poll_url": f"/jobs/{job_id}",
            "result_url": f"/jobs/{job_id}/result",
        },
    )


async def await_sleep(s: float) -> None:
    import asyncio
    await asyncio.sleep(s)


@app.get("/jobs/{job_id}")
def job_status(job_id: str):
    with _jobs_lock:
        j = _jobs.get(job_id)
    if not j:
        raise HTTPException(404, "unknown job_id")
    elapsed = j.get("elapsed", time.time() - j["created"])
    payload = {
        "job_id": job_id,
        "status": j["status"],
        "filename": j.get("filename"),
        "elapsed": round(elapsed, 1),
    }
    if j["status"] == "failed":
        payload["error"] = j.get("error")
    if j["status"] == "done":
        payload["result_url"] = f"/jobs/{job_id}/result"
    return payload


@app.get("/jobs/{job_id}/result")
async def job_result(job_id: str):
    return await _get_job_result(job_id)


async def _get_job_result(job_id: str, filename: str = "") -> FileResponse:
    with _jobs_lock:
        j = _jobs.get(job_id)
    if not j:
        raise HTTPException(404, "unknown job_id")
    if j["status"] == "running" or j["status"] == "queued":
        raise HTTPException(425, "still running")  # 425 Too Early
    if j["status"] == "failed":
        raise HTTPException(500, j.get("error") or "unknown error")
    out_path = Path(j["result_path"])
    if not out_path.exists():
        raise HTTPException(500, "result file gone")
    filename = filename or j.get("filename") or "result.xml"
    download_name = f"{Path(filename).stem or 'result'}.xml"
    return FileResponse(
        out_path,
        media_type="application/xml",
        filename=download_name,
        headers={"X-Process-Seconds": f"{j.get('elapsed', 0):.1f}"},
    )


if __name__ == "__main__":
    host = os.environ.get("EB_HOST", "0.0.0.0")
    port = int(os.environ.get("EB_PORT", "8000"))
    uvicorn.run(app, host=host, port=port, log_level="info")
