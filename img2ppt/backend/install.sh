#!/usr/bin/env bash
# One-shot installer for the img2ppt high-precision backend on a CUDA host.
# Clones Edit-Banana v1, sets up a conda env, installs all deps, downloads
# SAM3 weights, patches known issues, and drops wrapper.py in place.
# Safe to re-run.
#
# Usage:
#   bash install.sh                              # defaults
#   EB_ROOT=/data/eb CUDA_VER=cu121 bash install.sh
#
# Env knobs:
#   EB_ROOT      target install dir     default: $HOME/img2ppt-backend
#   EB_REPO      Edit-Banana git URL    default: BIT-DataLab/Edit-Banana
#   CONDA_ENV    conda env name         default: img2ppt
#   PY_VER       Python version         default: 3.11
#   CUDA_VER     torch wheel tag        default: cu118  (A6000/A100 ok on cu118)
#   SKIP_SAM3    skip weight download   default: 0

set -euo pipefail

EB_ROOT="${EB_ROOT:-$HOME/img2ppt-backend}"
EB_REPO="${EB_REPO:-https://github.com/BIT-DataLab/Edit-Banana.git}"
CONDA_ENV="${CONDA_ENV:-img2ppt}"
PY_VER="${PY_VER:-3.11}"
CUDA_VER="${CUDA_VER:-cu118}"
SKIP_SAM3="${SKIP_SAM3:-0}"

echo "==> EB_ROOT   : $EB_ROOT"
echo "==> CONDA_ENV : $CONDA_ENV (python $PY_VER)"
echo "==> CUDA      : $CUDA_VER"

# ---------- 1. Conda env ----------
if [ ! -d "$HOME/miniconda3" ] && [ ! -d "$HOME/anaconda3" ]; then
    echo "[FATAL] conda not found. Install Miniconda first: https://docs.conda.io/en/latest/miniconda.html" >&2
    exit 1
fi

# shellcheck source=/dev/null
source "$HOME/miniconda3/etc/profile.d/conda.sh" 2>/dev/null || source "$HOME/anaconda3/etc/profile.d/conda.sh"
if ! conda env list | awk '{print $1}' | grep -qx "$CONDA_ENV"; then
    echo "==> Creating conda env $CONDA_ENV (python $PY_VER)"
    conda create -n "$CONDA_ENV" python="$PY_VER" -y
fi
conda activate "$CONDA_ENV"

# ---------- 2. Clone Edit-Banana ----------
if [ ! -d "$EB_ROOT" ]; then
    echo "==> Cloning Edit-Banana into $EB_ROOT"
    git clone "$EB_REPO" "$EB_ROOT"
else
    echo "==> $EB_ROOT exists, pulling latest"
    git -C "$EB_ROOT" pull --ff-only || true
fi
cd "$EB_ROOT"

# ---------- 3. Python deps ----------
echo "==> Upgrading pip"
pip install -q --upgrade pip

echo "==> Installing torch ($CUDA_VER)"
pip install torch torchvision --index-url "https://download.pytorch.org/whl/$CUDA_VER"

echo "==> Installing Edit-Banana requirements"
[ -f requirements.txt ] && pip install -r requirements.txt

echo "==> Installing PaddleOCR + Pix2Text + modelscope"
pip install "paddlepaddle==3.2.2" paddleocr pix2text onnxruntime-gpu onnxruntime modelscope

echo "==> Installing SAM3 runtime deps (often missing from setup.py)"
pip install einops pycocotools hydra-core omegaconf

echo "==> Pinning setuptools<80 (keeps pkg_resources available for sam3)"
pip install "setuptools<80" --upgrade

echo "==> Installing wrapper deps"
pip install fastapi "uvicorn[standard]" python-multipart

# ---------- 4. SAM3 weights (ModelScope, slow ~3h at ~200kB/s) ----------
if [ "$SKIP_SAM3" = "0" ]; then
    mkdir -p models/sam3_ms
    if [ ! -f "models/sam3_ms/facebook/sam3/sam3.pt" ]; then
        echo "==> Downloading SAM3 weights via ModelScope (skipping .safetensors to halve bandwidth)"
        python - <<'PYEOF'
from modelscope import snapshot_download
p = snapshot_download(
    "facebook/sam3",
    cache_dir="models/sam3_ms",
    ignore_file_pattern=["*.safetensors"],
)
print("SAM3 cached at:", p)
PYEOF
    else
        echo "==> SAM3 weights already present, skipping"
    fi
fi

# ---------- 5. SAM3 source (for pip install -e + BPE vocab) ----------
if [ ! -d "sam3_src/.git" ]; then
    echo "==> Running setup_sam3.sh with direct GitHub URL (gitclone.com mirror has bad SSL)"
    SAM3_CLONE_URL="https://github.com/facebookresearch/sam3.git" bash scripts/setup_sam3.sh
fi

# ---------- 6. Patch sam3_info_extractor.py for BF16/FP32 autocast ----------
# SAM3 checkpoint stores weights in BFloat16 but Sam3Processor's internal
# tensor ops mix Float inputs with BFloat16 weights, causing:
#   "mat1 and mat2 must have the same dtype, but got BFloat16 and Float"
# Wrapping the inference calls in torch.autocast(cuda, bfloat16) fixes both
# directions without needing to cast the entire model.
python - <<'PYEOF'
p = "modules/sam3_info_extractor.py"
s = open(p).read()
if 'autocast("cuda"' in s:
    print("sam3_info_extractor.py already patched")
else:
    new = s.replace(
        'state, pil_image = self._get_image_state(image_path)',
        'with torch.autocast("cuda", dtype=torch.bfloat16):\n            state, pil_image = self._get_image_state(image_path)',
        1,
    ).replace(
        "            self._processor.reset_all_prompts(state)\n"
        "            result_state = self._processor.set_text_prompt(prompt=prompt, state=state)",
        "            self._processor.reset_all_prompts(state)\n"
        "            with torch.autocast(\"cuda\", dtype=torch.bfloat16):\n"
        "                result_state = self._processor.set_text_prompt(prompt=prompt, state=state)",
        1,
    )
    if new == s:
        raise SystemExit("FAILED to locate patch targets in sam3_info_extractor.py")
    open(p, "w").write(new)
    print("sam3_info_extractor.py patched")
PYEOF

# ---------- 7. Config + dirs ----------
mkdir -p input output
if [ ! -f config/config.yaml ] && [ -f config/config.yaml.example ]; then
    cp config/config.yaml.example config/config.yaml
    echo "==> Created config/config.yaml from example"
fi
# Repoint checkpoint_path to the actual ModelScope location
ACTUAL_PT="models/sam3_ms/facebook/sam3/sam3.pt"
if [ -f config/config.yaml ] && grep -q 'checkpoint_path: "models/sam3_ms/sam3.pt"' config/config.yaml; then
    sed -i "s|checkpoint_path: \"models/sam3_ms/sam3.pt\"|checkpoint_path: \"$ACTUAL_PT\"|" config/config.yaml
    echo "==> Updated checkpoint_path in config.yaml"
fi

# ---------- 8. Wrapper ----------
WRAPPER_SRC="$(dirname "$(readlink -f "$0")")/wrapper.py"
if [ -f "$WRAPPER_SRC" ]; then
    cp "$WRAPPER_SRC" "$EB_ROOT/wrapper.py"
else
    echo "[WARN] wrapper.py not found next to install.sh — scp it manually to $EB_ROOT/wrapper.py"
fi

cat <<EOF

==========================================================
Install complete.

Start the backend:
    cd $EB_ROOT
    conda activate $CONDA_ENV
    nohup python wrapper.py > server.log 2>&1 &
    # or foreground:  python wrapper.py

Smoke test:
    curl http://localhost:8000/health

Tailscale URL (paste into the img2ppt "Backend URL" field):
    tailscale status --self | awk 'NR==1{print "http://"\$1":8000"}'

To make this survive reboots, see README.md (systemd unit).
==========================================================
EOF
