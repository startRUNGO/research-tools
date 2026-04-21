'use strict';

const $ = (id) => document.getElementById(id);

const state = {
  img: null,
  imgData: null,
  imgName: 'image',
  imgFile: null,
  precision: 'low',
  tracedSvgStr: null,
  svgDoc: null,
  elements: [],
  drawioShapes: null,
};

const BACKEND_KEY = 'img2ppt.backendUrl';

const PRECISION_OPTS = {
  low: {
    numberofcolors: 6,
    ltres: 1,
    qtres: 1,
    pathomit: 20,
    colorsampling: 2,
    colorquantcycles: 3,
    rightangleenhance: true,
    blurradius: 1,
    blurdelta: 20,
    viewbox: true,
  },
  medium: {
    numberofcolors: 16,
    ltres: 0.4,
    qtres: 0.4,
    pathomit: 8,
    colorsampling: 2,
    colorquantcycles: 3,
    rightangleenhance: true,
    blurradius: 0,
    blurdelta: 20,
    viewbox: true,
  },
};

// ---- Upload ----
const drop = $('drop');
const fileInput = $('fileInput');

drop.addEventListener('click', (e) => { if (e.target.tagName !== 'LABEL' && e.target.tagName !== 'INPUT') fileInput.click(); });
drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('dragover'); });
drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
drop.addEventListener('drop', (e) => {
  e.preventDefault();
  drop.classList.remove('dragover');
  if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', (e) => { if (e.target.files[0]) loadFile(e.target.files[0]); });

function loadFile(file) {
  if (!file.type.startsWith('image/')) { alert('请选择图片文件'); return; }
  state.imgName = file.name.replace(/\.[^.]+$/, '') || 'image';
  state.imgFile = file;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      state.img = img;
      drawOriginal(img);
      $('step2').hidden = false;
      $('step2').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function drawOriginal(img) {
  const canvas = $('canvasOrig');
  const MAX = 800;
  const scale = Math.min(1, MAX / Math.max(img.width, img.height));
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  state.imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  $('metaOrig').textContent = `${img.width} × ${img.height} px  →  preview ${canvas.width} × ${canvas.height}`;
}

// ---- Precision selection ----
document.querySelectorAll('.prec-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('disabled')) return;
    document.querySelectorAll('.prec-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.precision = btn.dataset.prec;
    $('highConfig').hidden = state.precision !== 'high';
  });
});

// ---- Backend URL ----
const backendInput = $('backendUrl');
backendInput.value = localStorage.getItem(BACKEND_KEY) || '';
backendInput.addEventListener('change', () => {
  localStorage.setItem(BACKEND_KEY, backendInput.value.trim());
});
$('btnBackendCheck').addEventListener('click', async () => {
  const url = (backendInput.value || '').trim().replace(/\/+$/, '');
  const status = $('backendStatus');
  if (!url) { status.textContent = '填入 URL 先'; status.className = 'status err'; return; }
  localStorage.setItem(BACKEND_KEY, url);
  status.textContent = '探测中...';
  status.className = 'status';
  try {
    const r = await fetch(url + '/health', { method: 'GET' });
    const j = await r.json();
    if (j.status === 'ok') {
      status.textContent = j.main_exists ? '后端 OK · Edit-Banana 就绪' : '后端 OK · 但 main.py 找不到 (检查 EB_DIR)';
      status.className = j.main_exists ? 'status ok' : 'status err';
    } else {
      status.textContent = '后端返回异常: ' + JSON.stringify(j);
      status.className = 'status err';
    }
  } catch (e) {
    status.textContent = '连不上: ' + e.message;
    status.className = 'status err';
  }
});

// ---- Trace ----
$('btnTrace').addEventListener('click', async () => {
  if (!state.imgData) { alert('先选择图片'); return; }
  const status = $('traceStatus');
  status.className = 'status';
  $('btnTrace').disabled = true;

  try {
    if (state.precision === 'high') {
      await traceHighPrecision(status);
    } else {
      await traceLocal(status);
    }
    $('step3').hidden = false;
    $('step4').hidden = false;
    $('step4').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    console.log(err);
    status.textContent = '出错：' + err.message;
    status.className = 'status err';
  } finally {
    $('btnTrace').disabled = false;
  }
});

async function traceLocal(status) {
  status.textContent = '追踪中... (大图可能需要几秒)';
  await sleep(50);
  const opts = PRECISION_OPTS[state.precision];
  const svgStr = ImageTracer.imagedataToSVG(state.imgData, opts);
  state.tracedSvgStr = svgStr;
  state.drawioShapes = null;
  $('svgHolder').innerHTML = svgStr;
  parseSvg(svgStr);
  const pathCount = state.svgDoc.querySelectorAll('path').length;
  $('metaTraced').textContent = `${pathCount} paths · ${Math.round(svgStr.length / 1024)} KB`;
  status.textContent = `完成：${pathCount} 条路径`;
  status.className = 'status ok';
}

async function traceHighPrecision(status) {
  const url = (localStorage.getItem(BACKEND_KEY) || '').trim().replace(/\/+$/, '');
  if (!url) throw new Error('请先在上面填入 Backend URL 并测试连接');

  status.textContent = '上传图片 → Edit-Banana (SAM3 推理，首次 30-60s)...';
  const form = new FormData();
  form.append('file', state.imgFile);
  const resp = await fetch(url + '/convert', { method: 'POST', body: form });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`后端 ${resp.status}: ${text.slice(0, 300)}`);
  }
  const xmlText = await resp.text();
  state.tracedSvgStr = null;
  state.drawioShapes = parseDrawioXml(xmlText);
  $('svgHolder').innerHTML = renderDrawioPreviewSvg(state.drawioShapes);
  $('metaTraced').textContent = `${state.drawioShapes.shapes.length} shapes · DrawIO XML`;
  status.textContent = `完成：${state.drawioShapes.shapes.length} 个可编辑形状`;
  status.className = 'status ok';
}

function parseDrawioXml(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  const cells = doc.querySelectorAll('mxCell');
  const shapes = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  cells.forEach((cell) => {
    const geom = cell.querySelector('mxGeometry');
    if (!geom) return;
    const style = cell.getAttribute('style') || '';
    const value = cell.getAttribute('value') || '';
    const vertex = cell.getAttribute('vertex') === '1';
    const edge = cell.getAttribute('edge') === '1';
    const x = parseFloat(geom.getAttribute('x') || '0');
    const y = parseFloat(geom.getAttribute('y') || '0');
    const w = parseFloat(geom.getAttribute('width') || '0');
    const h = parseFloat(geom.getAttribute('height') || '0');
    if (vertex && w > 0 && h > 0) {
      shapes.push({ kind: 'vertex', x, y, w, h, style, value: htmlDecode(value) });
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w); maxY = Math.max(maxY, y + h);
    } else if (edge) {
      const pts = Array.from(geom.querySelectorAll('mxPoint')).map((p) => ({
        x: parseFloat(p.getAttribute('x') || '0'),
        y: parseFloat(p.getAttribute('y') || '0'),
      }));
      if (pts.length >= 2) shapes.push({ kind: 'edge', pts, style });
    }
  });
  if (!isFinite(minX)) { minX = minY = 0; maxX = maxY = 800; }
  return { shapes, bbox: { x: minX, y: minY, w: maxX - minX, h: maxY - minY } };
}

function renderDrawioPreviewSvg(drawio) {
  const { shapes, bbox } = drawio;
  const parts = shapes.map((s) => {
    if (s.kind === 'vertex') {
      const fill = styleGet(s.style, 'fillColor') || '#fff7c2';
      const stroke = styleGet(s.style, 'strokeColor') || '#333';
      const shape = /ellipse/i.test(s.style) ? 'ellipse' : 'rect';
      if (shape === 'ellipse') {
        return `<ellipse cx="${s.x + s.w/2}" cy="${s.y + s.h/2}" rx="${s.w/2}" ry="${s.h/2}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
      }
      const rx = /rounded=1/.test(s.style) ? 6 : 0;
      const label = s.value ? `<text x="${s.x + s.w/2}" y="${s.y + s.h/2}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#222">${escapeAttr(s.value.slice(0, 40))}</text>` : '';
      return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>${label}`;
    } else {
      const d = s.pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y).join(' ');
      return `<path d="${d}" stroke="#555" stroke-width="1.5" fill="none"/>`;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bbox.x - 10} ${bbox.y - 10} ${bbox.w + 20} ${bbox.h + 20}"><rect x="${bbox.x - 10}" y="${bbox.y - 10}" width="${bbox.w + 20}" height="${bbox.h + 20}" fill="#ffffff"/>${parts.join('')}</svg>`;
}

function styleGet(styleStr, key) {
  const m = (styleStr || '').match(new RegExp('(?:^|;)' + key + '=([^;]+)'));
  return m ? m[1] : null;
}

function htmlDecode(s) {
  const d = document.createElement('div');
  d.innerHTML = s;
  return d.textContent || '';
}

function parseSvg(svgStr) {
  const doc = new DOMParser().parseFromString(svgStr, 'image/svg+xml');
  const svgEl = doc.documentElement;
  const liveSvg = svgEl.cloneNode(true);
  const host = $('svgHostHidden');
  host.innerHTML = '';
  host.appendChild(liveSvg);

  const paths = liveSvg.querySelectorAll('path');
  const vb = (liveSvg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
  const viewW = vb[2] || parseFloat(liveSvg.getAttribute('width')) || state.imgData.width;
  const viewH = vb[3] || parseFloat(liveSvg.getAttribute('height')) || state.imgData.height;

  const elements = [];
  paths.forEach((p, i) => {
    let bbox;
    try { bbox = p.getBBox(); } catch (e) { bbox = { x: 0, y: 0, width: 0, height: 0 }; }
    if (bbox.width <= 0 || bbox.height <= 0) return;
    elements.push({
      index: i,
      d: p.getAttribute('d'),
      fill: p.getAttribute('fill') || '#000',
      stroke: p.getAttribute('stroke') || 'none',
      strokeWidth: p.getAttribute('stroke-width') || '0',
      opacity: p.getAttribute('opacity') || '1',
      bbox: { x: bbox.x, y: bbox.y, w: bbox.width, h: bbox.height },
    });
  });
  state.svgDoc = liveSvg;
  state.viewBox = { w: viewW, h: viewH };
  state.elements = elements;
}

// ---- Export SVG ----
$('btnSvg').addEventListener('click', () => {
  if (!state.tracedSvgStr) return;
  downloadBlob(new Blob([state.tracedSvgStr], { type: 'image/svg+xml' }), state.imgName + '.svg');
});

// ---- Export PPTX ----
$('btnPptx').addEventListener('click', async () => {
  if (!state.tracedSvgStr && !state.drawioShapes) return;
  const status = $('exportStatus');
  status.textContent = '生成 PPTX...';
  status.className = 'status';
  $('btnPptx').disabled = true;

  try {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    const SLIDE_W = 13.333, SLIDE_H = 7.5;

    const imgW = state.img.width, imgH = state.img.height;
    const scale = Math.min(SLIDE_W / imgW, SLIDE_H / imgH) * 0.9;
    const drawW = imgW * scale, drawH = imgH * scale;
    const offsetX = (SLIDE_W - drawW) / 2;
    const offsetY = (SLIDE_H - drawH) / 2;

    if ($('optWhole').checked) {
      const slide = pptx.addSlide();
      slide.addText('Original', { x: 0.3, y: 0.2, fontSize: 14, color: '666666' });
      slide.addImage({ data: imgToPngDataUrl(state.img), x: offsetX, y: offsetY, w: drawW, h: drawH });
    }

    if (state.drawioShapes) {
      await exportDrawioSlides(pptx, { SLIDE_W, SLIDE_H });
    } else {
      await exportTracedSlides(pptx, { imgW, imgH, drawW, drawH, offsetX, offsetY, status });
    }

    await pptx.writeFile({ fileName: state.imgName + '.pptx' });
    status.textContent = '已导出 ' + state.imgName + '.pptx';
    status.className = 'status ok';
  } catch (err) {
    console.log(err);
    status.textContent = '出错：' + err.message;
    status.className = 'status err';
  } finally {
    $('btnPptx').disabled = false;
  }
});

async function exportTracedSlides(pptx, { imgW, imgH, drawW, drawH, offsetX, offsetY, status }) {
  if ($('optVector').checked) {
    const slide = pptx.addSlide();
    slide.addText('Vector Traced · ' + state.precision, { x: 0.3, y: 0.2, fontSize: 14, color: '666666' });
    const vectorPng = await svgStrToPngDataUrl(state.tracedSvgStr, imgW, imgH);
    slide.addImage({ data: vectorPng, x: offsetX, y: offsetY, w: drawW, h: drawH });
  }
  if ($('optElements').checked) {
    const slide = pptx.addSlide();
    slide.addText('Per-element · ' + state.elements.length + ' shapes (drag individually)', { x: 0.3, y: 0.2, fontSize: 14, color: '666666' });
    const minArea = parseFloat($('optMinArea').value) || 0;
    const px2inX = drawW / state.viewBox.w, px2inY = drawH / state.viewBox.h;
    let added = 0;
    for (const el of state.elements) {
      if (el.bbox.w * el.bbox.h < minArea) continue;
      const miniSvg = buildMiniSvg(el);
      const png = await svgStrToPngDataUrl(miniSvg, Math.max(1, el.bbox.w), Math.max(1, el.bbox.h));
      slide.addImage({
        data: png,
        x: offsetX + el.bbox.x * px2inX,
        y: offsetY + el.bbox.y * px2inY,
        w: el.bbox.w * px2inX,
        h: el.bbox.h * px2inY,
      });
      added++;
      if (added % 20 === 0) { status.textContent = `生成 PPTX... (${added}/${state.elements.length})`; await sleep(0); }
    }
  }
}

async function exportDrawioSlides(pptx, { SLIDE_W, SLIDE_H }) {
  const { shapes, bbox } = state.drawioShapes;
  const scale = Math.min(SLIDE_W / bbox.w, SLIDE_H / bbox.h) * 0.9;
  const drawW = bbox.w * scale, drawH = bbox.h * scale;
  const offX = (SLIDE_W - drawW) / 2, offY = (SLIDE_H - drawH) / 2;
  const mapX = (x) => offX + (x - bbox.x) * scale;
  const mapY = (y) => offY + (y - bbox.y) * scale;

  if ($('optElements').checked) {
    const slide = pptx.addSlide();
    slide.addText(`Per-element · ${shapes.length} editable shapes (SAM3)`, { x: 0.3, y: 0.2, fontSize: 14, color: '666666' });
    for (const s of shapes) {
      if (s.kind === 'vertex') {
        const fill = normalizeColor(styleGet(s.style, 'fillColor')) || 'FFF7C2';
        const line = normalizeColor(styleGet(s.style, 'strokeColor')) || '333333';
        const isEllipse = /ellipse/i.test(s.style);
        const isRhombus = /rhombus/i.test(s.style);
        const shapeType = isEllipse ? pptx.ShapeType.ellipse : isRhombus ? pptx.ShapeType.diamond : pptx.ShapeType.rect;
        const opts = {
          x: mapX(s.x), y: mapY(s.y), w: s.w * scale, h: s.h * scale,
          fill: { color: fill },
          line: { color: line, width: 1 },
        };
        if (s.value) {
          slide.addText(s.value, { ...opts, fontSize: 10, color: '222222', align: 'center', valign: 'middle', shape: shapeType });
        } else {
          slide.addShape(shapeType, opts);
        }
      } else if (s.kind === 'edge' && s.pts.length >= 2) {
        const a = s.pts[0], b = s.pts[s.pts.length - 1];
        const x1 = mapX(a.x), y1 = mapY(a.y), x2 = mapX(b.x), y2 = mapY(b.y);
        slide.addShape(pptx.ShapeType.line, {
          x: Math.min(x1, x2), y: Math.min(y1, y2),
          w: Math.abs(x2 - x1) || 0.01, h: Math.abs(y2 - y1) || 0.01,
          line: { color: '555555', width: 1.5, endArrowType: 'triangle' },
          flipH: x2 < x1, flipV: y2 < y1,
        });
      }
    }
  }
}

function normalizeColor(c) {
  if (!c) return null;
  c = c.trim();
  if (c === 'none' || c === 'default') return null;
  if (c.startsWith('#')) return c.slice(1).toUpperCase().padEnd(6, '0').slice(0, 6);
  return null;
}

// ---- Helpers ----
function imgToPngDataUrl(img) {
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  c.getContext('2d').drawImage(img, 0, 0);
  return c.toDataURL('image/png');
}

function buildMiniSvg(el) {
  const { x, y, w, h } = el.bbox;
  const fill = el.fill.startsWith('rgb') ? rgbToHex(el.fill) : el.fill;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}"><path d="${escapeAttr(el.d)}" fill="${fill}" fill-opacity="${el.opacity}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"/></svg>`;
}

function svgStrToPngDataUrl(svgStr, w, h, scale = 2) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(w * scale));
      c.height = Math.max(1, Math.round(h * scale));
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(new Error('SVG→PNG 失败')); };
    img.src = url;
  });
}

function rgbToHex(rgb) {
  const m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!m) return '#000000';
  const toHex = (n) => Number(n).toString(16).padStart(2, '0');
  return '#' + toHex(m[1]) + toHex(m[2]) + toHex(m[3]);
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
