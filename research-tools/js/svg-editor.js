// ==================== SVG Editor ====================

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

let svgElementCounter = 0;
let selectedLayer = null;
let multiSelectMode = false;
let selectedLayers = [];

let undoStack = [];
let redoStack = [];
const MAX_UNDO = 50;

function saveUndoState() {
    const svg = document.getElementById('svgCanvas');
    undoStack.push(svg.innerHTML);
    if (undoStack.length > MAX_UNDO) undoStack.shift();
    redoStack = [];
}

function undo() {
    const svg = document.getElementById('svgCanvas');
    if (undoStack.length === 0) { showToast(t('svg.undo.empty'), 'warning'); return; }
    redoStack.push(svg.innerHTML);
    svg.innerHTML = undoStack.pop();
    // Re-attach drag handlers
    svg.querySelectorAll('rect, circle, ellipse, text, polygon, path').forEach(el => makeDraggable(el));
    updateLayersList();
}

function redo() {
    const svg = document.getElementById('svgCanvas');
    if (redoStack.length === 0) { showToast(t('svg.redo.empty'), 'warning'); return; }
    undoStack.push(svg.innerHTML);
    svg.innerHTML = redoStack.pop();
    svg.querySelectorAll('rect, circle, ellipse, text, polygon, path').forEach(el => makeDraggable(el));
    updateLayersList();
}

function svgAddRect() {
    saveUndoState();
    const svg = document.getElementById('svgCanvas');
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const x = 50 + Math.random() * 200;
    const y = 50 + Math.random() * 200;
    rect.setAttribute('x', x); rect.setAttribute('y', y);
    rect.setAttribute('width', 100); rect.setAttribute('height', 80);
    rect.setAttribute('fill', document.getElementById('fillColor').value);
    rect.setAttribute('stroke', document.getElementById('strokeColor').value);
    rect.setAttribute('stroke-width', document.getElementById('strokeWidth').value);
    rect.setAttribute('id', 'rect-' + svgElementCounter++);
    rect.setAttribute('data-layer-name', t('layer.rect') + ' ' + svgElementCounter);
    makeDraggable(rect);
    svg.appendChild(rect);
    updateLayersList();
}

function svgAddCircle() {
    saveUndoState();
    const svg = document.getElementById('svgCanvas');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const cx = 100 + Math.random() * 200;
    const cy = 100 + Math.random() * 200;
    circle.setAttribute('cx', cx); circle.setAttribute('cy', cy);
    circle.setAttribute('r', 50);
    circle.setAttribute('fill', document.getElementById('fillColor').value);
    circle.setAttribute('stroke', document.getElementById('strokeColor').value);
    circle.setAttribute('stroke-width', document.getElementById('strokeWidth').value);
    circle.setAttribute('id', 'circle-' + svgElementCounter++);
    circle.setAttribute('data-layer-name', t('layer.circle') + ' ' + svgElementCounter);
    makeDraggable(circle);
    svg.appendChild(circle);
    updateLayersList();
}

function svgAddEllipse() {
    saveUndoState();
    const svg = document.getElementById('svgCanvas');
    const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    const cx = 100 + Math.random() * 200;
    const cy = 100 + Math.random() * 200;
    ellipse.setAttribute('cx', cx); ellipse.setAttribute('cy', cy);
    ellipse.setAttribute('rx', 70); ellipse.setAttribute('ry', 40);
    ellipse.setAttribute('fill', document.getElementById('fillColor').value);
    ellipse.setAttribute('stroke', document.getElementById('strokeColor').value);
    ellipse.setAttribute('stroke-width', document.getElementById('strokeWidth').value);
    ellipse.setAttribute('id', 'ellipse-' + svgElementCounter++);
    ellipse.setAttribute('data-layer-name', t('layer.ellipse') + ' ' + svgElementCounter);
    makeDraggable(ellipse);
    svg.appendChild(ellipse);
    updateLayersList();
}

function svgAddPolygon() {
    saveUndoState();
    const svg = document.getElementById('svgCanvas');
    const sides = parseInt(prompt(t('prompt.polygonSides'), '5')) || 5;
    const cx = 200 + Math.random() * 100;
    const cy = 200 + Math.random() * 100;
    const r = 50;
    let points = '';
    for (let i = 0; i < sides; i++) {
        const angle = (2 * Math.PI * i / sides) - Math.PI / 2;
        points += (cx + r * Math.cos(angle)) + ',' + (cy + r * Math.sin(angle)) + ' ';
    }
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points.trim());
    polygon.setAttribute('fill', document.getElementById('fillColor').value);
    polygon.setAttribute('stroke', document.getElementById('strokeColor').value);
    polygon.setAttribute('stroke-width', document.getElementById('strokeWidth').value);
    polygon.setAttribute('id', 'polygon-' + svgElementCounter++);
    polygon.setAttribute('data-layer-name', t('layer.polygon') + ' ' + svgElementCounter);
    makeDraggable(polygon);
    svg.appendChild(polygon);
    updateLayersList();
}

function svgAddLine() {
    saveUndoState();
    const svg = document.getElementById('svgCanvas');
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const x1 = 50 + Math.random() * 200;
    const y1 = 50 + Math.random() * 200;
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x1 + 100); line.setAttribute('y2', y1 + 50);
    line.setAttribute('stroke', document.getElementById('strokeColor').value);
    line.setAttribute('stroke-width', document.getElementById('strokeWidth').value);
    line.setAttribute('id', 'line-' + svgElementCounter++);
    line.setAttribute('data-layer-name', t('layer.line') + ' ' + svgElementCounter);
    svg.appendChild(line);
    updateLayersList();
}

function svgAddText() {
    const svg = document.getElementById('svgCanvas');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const x = 100 + Math.random() * 200;
    const y = 100 + Math.random() * 200;
    const textContent = prompt(t('prompt.text'), t('prompt.textDefault'));
    if (!textContent) return;
    saveUndoState();
    text.setAttribute('x', x); text.setAttribute('y', y);
    text.setAttribute('fill', document.getElementById('fillColor').value);
    text.setAttribute('font-size', '20');
    text.setAttribute('font-family', 'Arial, sans-serif');
    text.setAttribute('id', 'text-' + svgElementCounter++);
    text.setAttribute('data-layer-name', textContent.substring(0, 10) + (textContent.length > 10 ? '...' : ''));
    text.textContent = textContent;
    makeDraggable(text);
    svg.appendChild(text);
    updateLayersList();
}

function svgAddArrow() {
    saveUndoState();
    const svg = document.getElementById('svgCanvas');
    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.appendChild(defs);
    }
    const markerId = 'arrowhead-' + svgElementCounter;
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', markerId);
    marker.setAttribute('markerWidth', '10'); marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '9'); marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3, 0 6');
    polygon.setAttribute('fill', document.getElementById('strokeColor').value);
    marker.appendChild(polygon);
    defs.appendChild(marker);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const x1 = 50 + Math.random() * 200;
    const y1 = 50 + Math.random() * 200;
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x1 + 150); line.setAttribute('y2', y1 + 50);
    line.setAttribute('stroke', document.getElementById('strokeColor').value);
    line.setAttribute('stroke-width', document.getElementById('strokeWidth').value);
    line.setAttribute('marker-end', `url(#${markerId})`);
    line.setAttribute('id', 'arrow-' + svgElementCounter++);
    line.setAttribute('data-layer-name', t('layer.arrow') + ' ' + svgElementCounter);
    svg.appendChild(line);
    updateLayersList();
}

function makeDraggable(element) {
    let isDragging = false;
    let offset = { x: 0, y: 0 };
    element.style.cursor = 'move';
    element.addEventListener('mousedown', function(e) {
        isDragging = true;
        const CTM = element.getScreenCTM();
        if (element.tagName === 'circle' || element.tagName === 'ellipse') {
            offset.x = (e.clientX - CTM.e) - parseFloat(element.getAttribute('cx'));
            offset.y = (e.clientY - CTM.f) - parseFloat(element.getAttribute('cy'));
        } else if (element.tagName === 'rect' || element.tagName === 'text') {
            offset.x = (e.clientX - CTM.e) - parseFloat(element.getAttribute('x'));
            offset.y = (e.clientY - CTM.f) - parseFloat(element.getAttribute('y'));
        } else if (element.tagName === 'polygon' || element.tagName === 'path') {
            const transform = element.getAttribute('transform') || '';
            const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
            const tx = match ? parseFloat(match[1]) : 0;
            const ty = match ? parseFloat(match[2]) : 0;
            offset.x = (e.clientX - CTM.e) - tx;
            offset.y = (e.clientY - CTM.f) - ty;
        }
        e.preventDefault();
    });
    const svg = document.getElementById('svgCanvas');
    svg.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        const CTM = element.getScreenCTM();
        const x = e.clientX - CTM.e - offset.x;
        const y = e.clientY - CTM.f - offset.y;
        if (element.tagName === 'circle' || element.tagName === 'ellipse') {
            element.setAttribute('cx', x); element.setAttribute('cy', y);
        } else if (element.tagName === 'rect' || element.tagName === 'text') {
            element.setAttribute('x', x); element.setAttribute('y', y);
        } else if (element.tagName === 'polygon' || element.tagName === 'path') {
            element.setAttribute('transform', `translate(${x}, ${y})`);
        }
    });
    svg.addEventListener('mouseup', function() { isDragging = false; });
}

function svgClear() {
    if (confirm(t('alert.clearCanvas'))) {
        saveUndoState();
        const svg = document.getElementById('svgCanvas');
        while (svg.lastChild) { svg.removeChild(svg.lastChild); }
        svgElementCounter = 0;
        selectedLayer = null;
        updateLayersList();
    }
}

function svgDownload() {
    const svg = document.getElementById('svgCanvas');
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'drawing.svg';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function svgShowCode() {
    const svg = document.getElementById('svgCanvas');
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svg);
    svgString = svgString.replace(/></g, '>\n<');
    document.getElementById('svgCodeOutput').value = svgString;
    document.getElementById('svgCodePanel').style.display = 'block';
}

function closeSvgCode() { document.getElementById('svgCodePanel').style.display = 'none'; }

function importSvgCode() {
    const codeInput = document.getElementById('svgCodeOutput');
    if (!codeInput) return;
    const code = codeInput.value.trim();
    if (!code) { showToast(t('alert.noContent'), 'warning'); return; }

    // Wrap in <svg> if the input is just inner SVG content (no root <svg> tag)
    let svgString = code;
    if (!/<svg[\s>]/i.test(svgString)) {
        svgString = '<svg xmlns="http://www.w3.org/2000/svg">' + svgString + '</svg>';
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
        showToast(t('svg.import.parseError'), 'error');
        return;
    }

    const svgCanvas = document.getElementById('svgCanvas');
    saveUndoState();

    // Clear existing content
    while (svgCanvas.firstChild) svgCanvas.removeChild(svgCanvas.firstChild);

    // Import child elements from parsed SVG
    const srcSvg = doc.documentElement;

    // Copy viewBox if present
    if (srcSvg.getAttribute('viewBox')) {
        svgCanvas.setAttribute('viewBox', srcSvg.getAttribute('viewBox'));
    }

    Array.from(srcSvg.children).forEach(child => {
        const imported = document.importNode(child, true);
        svgCanvas.appendChild(imported);
    });

    // Re-attach drag handlers
    svgCanvas.querySelectorAll('rect, circle, ellipse, text, polygon, path').forEach(el => makeDraggable(el));
    updateLayersList();

    closeSvgCode();
    showToast(t('svg.import.success'));
}

function copySvgCode() {
    const code = document.getElementById('svgCodeOutput').value;
    navigator.clipboard.writeText(code).then(() => {
        showToast(t('alert.svgCopied'));
    }).catch(err => {
        showToast(t('alert.copyFail') + err, 'error');
    });
}

// Prevent default drag behavior on SVG canvas
document.addEventListener('DOMContentLoaded', function() {
    const svgCanvas = document.getElementById('svgCanvas');
    if (svgCanvas) {
        svgCanvas.addEventListener('dragstart', function(e) { e.preventDefault(); });
    }
});

// ==================== Layer Management ====================

function updateLayersList() {
    const svg = document.getElementById('svgCanvas');
    const layersList = document.getElementById('layersList');
    const elements = Array.from(svg.children).filter(el => el.tagName !== 'defs');

    if (elements.length === 0) {
        layersList.innerHTML = '<p class="layers-placeholder">' + t('svg.layers.empty') + '</p>';
        return;
    }
    layersList.innerHTML = '';

    function renderLayerItem(element, depth) {
        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        if (depth > 0) layerItem.classList.add('grouped');
        if (selectedLayer === element || selectedLayers.includes(element)) layerItem.classList.add('selected');
        if (element.tagName === 'g') layerItem.classList.add('group-header');

        const icon = getLayerIcon(element.tagName);
        const name = element.getAttribute('data-layer-name') || `${element.tagName} ${element.id}`;
        const type = element.tagName === 'g' ? 'group' : element.tagName;

        layerItem.style.marginLeft = (depth * 16) + 'px';
        layerItem.innerHTML = `<span class="layer-icon">${icon}</span><span class="layer-name">${escapeHtml(name)}</span><span class="layer-type">${escapeHtml(type)}</span>`;
        layerItem.addEventListener('click', function() { selectLayer(element); });
        layersList.appendChild(layerItem);

        if (element.tagName === 'g') {
            Array.from(element.children).reverse().forEach(child => {
                if (child.tagName !== 'defs') renderLayerItem(child, depth + 1);
            });
        }
    }
    elements.reverse().forEach(element => renderLayerItem(element, 0));
}

function getLayerIcon(tagName) {
    const icons = { 'rect': '◻', 'circle': '◯', 'line': '─', 'text': 'T', 'path': '~', 'polygon': '▽', 'ellipse': '⬭', 'g': '📁' };
    return icons[tagName] || '■';
}

function clearAllSelectionHighlights() {
    const svg = document.getElementById('svgCanvas');
    svg.querySelectorAll('[data-selected="true"]').forEach(el => {
        el.removeAttribute('data-selected');
        const orig = el.getAttribute('data-original-stroke');
        if (orig !== null) { el.setAttribute('stroke', orig); el.removeAttribute('data-original-stroke'); }
    });
}

function selectLayer(element) {
    if (multiSelectMode) {
        const idx = selectedLayers.indexOf(element);
        if (idx > -1) {
            selectedLayers.splice(idx, 1);
            element.removeAttribute('data-selected');
            const orig = element.getAttribute('data-original-stroke');
            if (orig !== null) { element.setAttribute('stroke', orig); element.removeAttribute('data-original-stroke'); }
        } else {
            selectedLayers.push(element);
            element.setAttribute('data-selected', 'true');
            if (element.tagName !== 'line' && element.tagName !== 'path') {
                const currentStroke = element.getAttribute('stroke') || 'none';
                element.setAttribute('data-original-stroke', currentStroke);
                element.setAttribute('stroke', '#667eea'); element.setAttribute('stroke-width', '3');
            }
        }
        selectedLayer = selectedLayers.length > 0 ? selectedLayers[selectedLayers.length - 1] : null;
        updateLayersList();
        updatePropertiesPanel();
        return;
    }
    clearAllSelectionHighlights();
    selectedLayer = element;
    element.setAttribute('data-selected', 'true');
    if (element.tagName !== 'line' && element.tagName !== 'path') {
        const currentStroke = element.getAttribute('stroke') || 'none';
        element.setAttribute('data-original-stroke', currentStroke);
        element.setAttribute('stroke', '#667eea'); element.setAttribute('stroke-width', '3');
    }
    updateLayersList();
    updatePropertiesPanel();
}

function deleteSelectedLayer() {
    if (!selectedLayer) { showToast(t('alert.selectLayer'), 'warning'); return; }
    if (confirm(t('alert.deleteLayer'))) { saveUndoState(); selectedLayer.remove(); selectedLayer = null; updateLayersList(); }
}

function moveLayerUp() {
    if (!selectedLayer) { showToast(t('alert.selectLayer'), 'warning'); return; }
    const nextSibling = selectedLayer.nextElementSibling;
    if (nextSibling && nextSibling.tagName !== 'defs') { saveUndoState(); selectedLayer.parentNode.insertBefore(nextSibling, selectedLayer); updateLayersList(); }
}

function moveLayerDown() {
    if (!selectedLayer) { showToast(t('alert.selectLayer'), 'warning'); return; }
    const previousSibling = selectedLayer.previousElementSibling;
    if (previousSibling && previousSibling.tagName !== 'defs') { saveUndoState(); selectedLayer.parentNode.insertBefore(selectedLayer, previousSibling); updateLayersList(); }
}

// ==================== Layer Grouping ====================

function toggleMultiSelect() {
    multiSelectMode = !multiSelectMode;
    const btn = document.getElementById('multiSelectBtn');
    if (btn) { btn.style.background = multiSelectMode ? '#e74c3c' : ''; }
    if (!multiSelectMode) { selectedLayers = []; clearAllSelectionHighlights(); updateLayersList(); }
}

function groupSelectedLayers() {
    if (multiSelectMode && selectedLayers.length >= 2) {
        const svg = document.getElementById('svgCanvas');
        saveUndoState();
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', 'group-' + svgElementCounter++);
        g.setAttribute('data-layer-name', t('layer.group') + ' ' + svgElementCounter);
        selectedLayers.forEach(el => {
            el.removeAttribute('data-selected');
            const orig = el.getAttribute('data-original-stroke');
            if (orig !== null) { el.setAttribute('stroke', orig); el.removeAttribute('data-original-stroke'); }
        });
        const firstEl = selectedLayers[0];
        svg.insertBefore(g, firstEl);
        selectedLayers.forEach(el => g.appendChild(el));
        selectedLayers = []; selectedLayer = g;
        multiSelectMode = false;
        const btn = document.getElementById('multiSelectBtn');
        if (btn) btn.style.background = '';
        updateLayersList();
        showToast(t('svg.btn.group'));
    } else {
        showToast(t('alert.groupNeedMultiple'), 'warning');
    }
}

function ungroupSelectedLayers() {
    if (!selectedLayer || selectedLayer.tagName !== 'g') { showToast(t('alert.selectGroup'), 'warning'); return; }
    const svg = document.getElementById('svgCanvas');
    saveUndoState();
    const g = selectedLayer;
    const children = Array.from(g.children);
    children.forEach(child => { svg.insertBefore(child, g); });
    g.remove(); selectedLayer = null;
    updateLayersList();
    showToast(t('svg.btn.ungroup'));
}

// ==================== Properties Panel ====================

function updatePropertiesPanel() {
    const panel = document.getElementById('propertiesPanel');
    if (!panel) return;
    if (!selectedLayer) {
        panel.innerHTML = '<p class="layers-placeholder">' + t('svg.props.none') + '</p>';
        return;
    }
    const el = selectedLayer;
    const tag = el.tagName;
    let html = '<div class="prop-row"><label>' + t('svg.props.type') + '</label><span>' + tag + '</span></div>';
    html += '<div class="prop-row"><label>' + t('svg.props.id') + '</label><span>' + (el.id || '-') + '</span></div>';

    const fill = el.getAttribute('fill') || '';
    const stroke = el.getAttribute('stroke') || '';
    const strokeWidth = el.getAttribute('stroke-width') || '1';
    const opacity = el.getAttribute('opacity') || '1';

    if (fill && tag !== 'line') {
        html += '<div class="prop-row"><label>' + t('svg.props.fill') + '</label><input type="color" value="' + fill + '" onchange="setProp(\'fill\', this.value)"></div>';
    }
    if (stroke) {
        html += '<div class="prop-row"><label>' + t('svg.props.stroke') + '</label><input type="color" value="' + stroke + '" onchange="setProp(\'stroke\', this.value)"></div>';
    }
    html += '<div class="prop-row"><label>' + t('svg.props.strokeWidth') + '</label><input type="number" value="' + strokeWidth + '" min="0" max="20" onchange="setProp(\'stroke-width\', this.value)"></div>';
    html += '<div class="prop-row"><label>' + t('svg.props.opacity') + '</label><input type="range" min="0" max="1" step="0.1" value="' + opacity + '" onchange="setProp(\'opacity\', this.value)"><span>' + opacity + '</span></div>';

    // Size properties
    if (tag === 'rect') {
        html += '<div class="prop-row"><label>W</label><input type="number" value="' + (el.getAttribute('width') || 0) + '" onchange="setProp(\'width\', this.value)"></div>';
        html += '<div class="prop-row"><label>H</label><input type="number" value="' + (el.getAttribute('height') || 0) + '" onchange="setProp(\'height\', this.value)"></div>';
    } else if (tag === 'circle') {
        html += '<div class="prop-row"><label>R</label><input type="number" value="' + (el.getAttribute('r') || 0) + '" onchange="setProp(\'r\', this.value)"></div>';
    } else if (tag === 'ellipse') {
        html += '<div class="prop-row"><label>RX</label><input type="number" value="' + (el.getAttribute('rx') || 0) + '" onchange="setProp(\'rx\', this.value)"></div>';
        html += '<div class="prop-row"><label>RY</label><input type="number" value="' + (el.getAttribute('ry') || 0) + '" onchange="setProp(\'ry\', this.value)"></div>';
    }

    panel.innerHTML = html;
}

function setProp(attr, value) {
    if (!selectedLayer) return;
    saveUndoState();
    selectedLayer.setAttribute(attr, value);
    updatePropertiesPanel();
}

// ==================== Undo/Redo Keyboard Shortcuts ====================

document.addEventListener('keydown', function(e) {
    const activeSection = document.querySelector('.section.active');
    if (!activeSection || activeSection.id !== 'svg') return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); undo();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault(); redo();
    }
});

// ==================== SVG Export PNG/JPG ====================

function svgToRaster(svgElement, format, filename) {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const w = parseInt(svgElement.getAttribute('width')) || 800;
        const h = parseInt(svgElement.getAttribute('height')) || 600;
        canvas.width = w * 2; canvas.height = h * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        if (format === 'jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); }
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/' + format, 0.95);
        const a = document.createElement('a');
        a.href = dataUrl; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    };
    img.src = url;
}

function svgExportPNG() {
    svgToRaster(document.getElementById('svgCanvas'), 'png', 'drawing.png');
    showToast(t('alert.downloadSuccess'));
}

function svgExportJPG() {
    svgToRaster(document.getElementById('svgCanvas'), 'jpeg', 'drawing.jpg');
    showToast(t('alert.downloadSuccess'));
}

function downloadModelPng(button) {
    const modelCard = button.parentElement;
    const svg = modelCard.querySelector('.model-diagram');
    const modelName = modelCard.querySelector('h3').textContent;
    svgToRaster(svg, 'png', modelName.replace(/\s+/g, '_') + '.png');
}
