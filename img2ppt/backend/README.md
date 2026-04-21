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
cd ~/img2ppt-backend           # or wherever EB_ROOT pointed to
source .venv/bin/activate
python wrapper.py
# → Uvicorn running on http://0.0.0.0:8000
```

Tune with env:

| Variable     | Default                     | Purpose                              |
|--------------|-----------------------------|--------------------------------------|
| `EB_DIR`     | dir containing `wrapper.py` | Edit-Banana clone location           |
| `EB_HOST`    | `0.0.0.0`                   | Bind address                         |
| `EB_PORT`    | `8000`                      | Bind port                            |
| `EB_PYTHON`  | `sys.executable`            | Python used to invoke `main.py`      |
| `EB_TIMEOUT` | `600`                       | Per-request timeout in seconds       |

Smoke test from the same host:

```bash
curl http://localhost:8000/health
# {"status":"ok","eb_dir":"...","main_exists":true,"python":"..."}

curl -F file=@test.png http://localhost:8000/convert -o out.xml
```

## Exposing to the browser

Pick one:

- **Tailscale (recommended)**: note the MagicDNS name —
  `tailscale status --self` — and paste `http://<name>:8000` into the
  "Backend URL" field of the img2ppt UI. Works over Tailscale; zero config.

- **Public tunnel** (`cloudflared` or `ngrok`): get an HTTPS URL and paste it.
  Required if you want to call the backend from GitHub Pages (mixed-content
  rules block HTTP from HTTPS pages).

## API

```
GET  /health            → {"status": "ok", ...}
GET  /                  → service info
POST /convert           → multipart: field `file`
                          returns: application/xml (DrawIO)
```

Accepted inputs: `.png .jpg .jpeg .bmp .tiff .webp .pdf`.

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
