# img2ppt — high-precision backend (Edit-Banana wrapper)

Runs on a CUDA host (e.g. your A6000 box), fronted by a thin FastAPI wrapper
that accepts an image upload, invokes Edit-Banana's CLI, and returns the
generated DrawIO XML. The browser parses that XML and builds the PPTX
client-side via pptxgenjs — so the backend only has to do the vision work.

## Prerequisites

- Linux with NVIDIA GPU + recent driver (CUDA 11.8 or 12.x)
- Python 3.10+
- ~10 GB disk (SAM3 weights + deps)
- Tailscale (or any way to reach port 8000 from your browser)

## Install

On the GPU host:

```bash
curl -O https://raw.githubusercontent.com/startRUNGO/research-tools/main/img2ppt/backend/install.sh
curl -O https://raw.githubusercontent.com/startRUNGO/research-tools/main/img2ppt/backend/wrapper.py
bash install.sh
```

`install.sh` is idempotent — re-running it will pull the latest Edit-Banana
and skip anything already present.

Override defaults with env vars:

```bash
EB_ROOT=/data/eb CUDA_VER=cu121 PY=python3.11 bash install.sh
```

## Run

```bash
cd ~/img2ppt-backend
conda activate img2ppt
python wrapper.py
# → Uvicorn running on http://0.0.0.0:8000
# First request triggers a ~100s warmup (SAM3 + PaddleOCR + RMBG);
# subsequent requests are ~5-10s on an idle GPU.
```

Tune with env:

| Variable    | Default                     | Purpose                                      |
|-------------|-----------------------------|----------------------------------------------|
| `EB_DIR`    | dir containing `wrapper.py` | Edit-Banana clone location                   |
| `EB_UI_DIR` | `<EB_DIR>/ui`               | Static UI served at `/ui/`                   |
| `EB_HOST`   | `0.0.0.0`                   | Bind address                                 |
| `EB_PORT`   | `8000`                      | Bind port                                    |
| `EB_WARMUP` | `1`                         | Set `0` to skip the dummy-image warmup       |

Smoke test from the same host (sync mode for curl):

```bash
curl http://localhost:8000/health
# {"status":"ok","pipeline_loaded":true, ...}

curl -F file=@test.png 'http://localhost:8000/convert?sync=true' -o out.xml
```

## Exposing to the browser

Pick one:

- **Tailscale direct**: paste `http://<tailscale-ip>:8000/ui/` into a
  browser on a device in the same tailnet. If your Windows browser can't
  reach the Tailscale IP, it's almost always a system-proxy issue —
  bypass `100.64.0.0/10` in your OS proxy settings.

- **Cloudflare quick tunnel**: run `cloudflared tunnel --url
  http://localhost:8000 --no-autoupdate` and use the
  `https://<slug>.trycloudflare.com/ui/` URL it prints. URL changes each
  time cloudflared restarts. Works for anyone regardless of network. Uses
  HTTPS, so safe to embed from GitHub Pages. See systemd unit below.

- **Named tunnel** (stable URL, requires Cloudflare account + domain):
  `cloudflared tunnel create img2ppt`, map to `img2ppt.yourdomain.com`,
  use that URL.

## API (async since v0.2.0)

```
GET  /health               → {"status": "ok", "pipeline_loaded": ..., ...}
GET  /                     → service info
POST /convert              → 202 Accepted {"job_id": "...", "poll_url": "...", "result_url": "..."}
POST /convert?sync=true    → blocks up to 15 min, returns FileResponse (for curl testing)
GET  /jobs/{job_id}        → {"status": "queued|running|done|failed",
                              "elapsed": <seconds>, ...}
GET  /jobs/{job_id}/result → FileResponse(XML) once status=done, else 425/404/500
GET  /ui/                  → bundled frontend (served from EB_UI_DIR)
```

Accepted inputs: `.png .jpg .jpeg .bmp .tiff .webp .pdf`.

The `max_workers=1` pool means only one SAM3 job runs at a time (the
model + RMBG already use ~13 GB VRAM; running two concurrently OOMs).
Incoming requests queue.

## Troubleshooting

- **`main_exists: false`** → `EB_DIR` doesn't point at the Edit-Banana repo
  root (the one containing `main.py`).
- **`CUDA out of memory`** → close other jobs, or force CPU in
  `config/config.yaml` under `sam3.device`.
- **Timeout (504)** → raise `EB_TIMEOUT`; first request always warms up the
  model and can take 30-60s.
- **CORS blocked** → the wrapper sets `allow_origins=["*"]`; make sure your
  browser is actually hitting the wrapper and not Edit-Banana's
  `server_pa.py` on the same port.

### Gotchas we already hit so you don't have to

- **`ModuleNotFoundError: pkg_resources`** — setuptools ≥ 80 removed it.
  `install.sh` pins `setuptools<80`.
- **`ModuleNotFoundError: einops` / `pycocotools` / `hydra`** — not declared
  in SAM3's setup.py. `install.sh` installs them explicitly.
- **`mat1 and mat2 must have the same dtype, but got BFloat16 and Float`** —
  SAM3 checkpoint is BF16 but the Sam3Processor mixes precisions. Fix: wrap
  the inference calls in `torch.autocast("cuda", dtype=torch.bfloat16)`.
  `install.sh` patches `modules/sam3_info_extractor.py` automatically.
- **SAM3 download is slow (~200 kB/s, 3+ hours)** — ModelScope rate-limits
  per connection and the SDK downloads both `sam3.pt` and `model.safetensors`
  (same weights, different format). `install.sh` passes
  `ignore_file_pattern=["*.safetensors"]` to halve the bandwidth waste. HF
  mirror is not an option — `facebook/sam3` is a gated repo (401/403).
- **`setup_sam3.sh` fails with `server certificate verification failed` on
  gitclone.com** — use direct GitHub: `SAM3_CLONE_URL=https://github.com/facebookresearch/sam3.git`.
- **Wrapper returns `No XML output produced`** — Edit-Banana writes to
  `output/<stem>/<stem>_merged.drawio.xml` (nested). The current
  `_find_output` handles that.
- **Tesseract-related "Text step failed"** — harmless. We skip tesseract
  install (would need sudo). PaddleOCR is configured as the fallback via
  `config/config.yaml: ocr.engine: paddleocr`.
- **Browser fetch fails from same host** — likely a system HTTP proxy
  intercepting Tailscale IPs. Configure your OS proxy to bypass
  `100.64.0.0/10` or your tailnet's CIDR.

### Quality-related gotchas

- **Text missing in the output** — flip
  `config/config.yaml` `ocr.engine: "tesseract"` → `"paddleocr"`.
  `install.sh` does this automatically.
- **Embedded images/icons have dirty backgrounds** — RMBG model missing.
  Ensure `models/rmbg/model.onnx` exists (should be a symlink into
  `models/rmbg_ms/briaai/RMBG-2___0/onnx/model.onnx` after install).
- **Detection too coarse / missing small elements** — lower
  `sam3.score_threshold` from `0.5` to `0.4`, and per-group
  `score_threshold` under `prompt_groups` to ~`0.3`. Going below that
  tends to flood RMBG with false positives and balloon runtime.
- **Detection too noisy / slow due to too many candidates** — raise
  thresholds back up, or raise `min_area`.

### Finding the cloudflared URL after a restart

```bash
grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' ~/cf-tunnel.log | tail -1
# or if running under systemd:
journalctl -u cloudflared-tunnel -n 100 | grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' | tail -1
```

## Making it survive reboots (systemd)

```ini
# /etc/systemd/system/img2ppt-wrapper.service
[Unit]
Description=img2ppt backend wrapper (Edit-Banana + SAM3)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=hmd
WorkingDirectory=/home/hmd/img2ppt-backend
Environment=PATH=/home/hmd/miniconda3/envs/img2ppt/bin:/usr/bin:/bin
ExecStart=/home/hmd/miniconda3/envs/img2ppt/bin/python /home/hmd/img2ppt-backend/wrapper.py
Restart=on-failure
RestartSec=5
StandardOutput=append:/home/hmd/img2ppt-backend/server.log
StandardError=append:/home/hmd/img2ppt-backend/server.log

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now img2ppt-wrapper
sudo systemctl status img2ppt-wrapper
```

Optional companion unit for the cloudflared quick tunnel (the URL it picks
will change each restart — that's a property of the free trycloudflare
service, not the unit):

```ini
# /etc/systemd/system/cloudflared-tunnel.service
[Unit]
Description=cloudflared quick tunnel for img2ppt backend
After=img2ppt-wrapper.service network-online.target
Wants=img2ppt-wrapper.service network-online.target

[Service]
Type=simple
User=hmd
ExecStart=/home/hmd/bin/cloudflared tunnel --url http://localhost:8000 --no-autoupdate
Restart=on-failure
RestartSec=10
StandardOutput=append:/home/hmd/cf-tunnel.log
StandardError=append:/home/hmd/cf-tunnel.log

[Install]
WantedBy=multi-user.target
```
