// ==================== Share / Collaboration ====================

function shareLatex() {
    const text = document.getElementById('latexInput').value;
    if (!text.trim()) { showToast(t('alert.noContent'), 'warning'); return; }
    const encoded = btoa(unescape(encodeURIComponent(text)));
    const url = location.origin + location.pathname + '?latex=' + encoded;
    if (url.length > 8000) { showToast(t('share.toolarge'), 'warning'); return; }
    navigator.clipboard.writeText(url).then(() => { showToast(t('share.copied')); });
}

function shareSvg() {
    const svg = document.getElementById('svgCanvas');
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const encoded = btoa(unescape(encodeURIComponent(svgString)));
    const url = location.origin + location.pathname + '?svg=' + encoded;
    if (url.length > 8000) { showToast(t('share.toolarge'), 'warning'); return; }
    navigator.clipboard.writeText(url).then(() => { showToast(t('share.copied')); });
}

function exportWorkspace() {
    const workspace = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        workspace[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(workspace, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'research-tools-workspace.json';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(t('share.exported'));
}

function importWorkspace() {
    document.getElementById('importFileInput').click();
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                showToast(t('share.importError'), 'error'); return;
            }
            const maxSize = 5 * 1024 * 1024; // 5MB limit
            if (e.target.result.length > maxSize) {
                showToast(t('share.importError'), 'error'); return;
            }
            Object.keys(data).forEach(key => {
                if (typeof data[key] === 'string') {
                    localStorage.setItem(key, data[key]);
                }
            });
            showToast(t('share.imported'));
            setTimeout(() => location.reload(), 1500);
        } catch (err) {
            showToast(t('share.importError'), 'error');
        }
    };
    reader.readAsText(file);
}

// Check URL params on load for shared content
document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(location.search);
    if (params.has('latex')) {
        try {
            const text = decodeURIComponent(escape(atob(params.get('latex'))));
            document.getElementById('latexInput').value = text;
            navigateTo('latex');
        } catch(e) { console.warn('Share URL parse error:', e); }
    }
    if (params.has('svg')) {
        try {
            const svgString = decodeURIComponent(escape(atob(params.get('svg'))));
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgString, 'image/svg+xml');
            const svgCanvas = document.getElementById('svgCanvas');
            while (svgCanvas.firstChild) svgCanvas.removeChild(svgCanvas.firstChild);
            Array.from(doc.documentElement.children).forEach(child => {
                svgCanvas.appendChild(document.importNode(child, true));
            });
            navigateTo('svg');
            updateLayersList();
        } catch(e) { console.warn('Share URL parse error:', e); }
    }
});

// Apply saved language on load (must be last)
document.addEventListener('DOMContentLoaded', function() {
    setLanguage(currentLang);
});

