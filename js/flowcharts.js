// ==================== Flowchart Gallery (Premium) ====================

// Password hash (SHA-256 of the actual password)
// Default password: "research2026" — change by updating this hash
const FC_PASSWORD_HASH = '5a8dd3ad0756a93ded72b823b19dd877115c5f6958f3cf527f3a0e006cb05940';

const flowchartData = [
    // Add flowchart entries here as they are created
    // Example format:
    // {
    //     id: 'fc-unique-id',
    //     title: 'Paper Title / Flowchart Name',
    //     journal: 'CVPR 2024',
    //     field: 'CV',
    //     authors: 'Author et al.',
    //     tags: ['keyword1', 'keyword2'],
    //     svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400">...</svg>`
    // }
];

// SHA-256 hash function
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function isFlowchartsUnlocked() {
    return localStorage.getItem('fc_unlocked') === 'true';
}

async function unlockFlowcharts() {
    const input = document.getElementById('fcPasswordInput');
    if (!input) return;
    const password = input.value.trim();
    if (!password) { showToast(t('fc.password.empty'), 'warning'); return; }

    const hash = await sha256(password);
    if (hash === FC_PASSWORD_HASH) {
        localStorage.setItem('fc_unlocked', 'true');
        input.value = '';
        updateLockUI();
        renderFlowcharts();
        showToast(t('fc.unlock.success'));
    } else {
        showToast(t('fc.unlock.fail'), 'error');
    }
}

function lockFlowcharts() {
    localStorage.removeItem('fc_unlocked');
    updateLockUI();
    renderFlowcharts();
    showToast(t('fc.lock.success'));
}

function updateLockUI() {
    const lockBar = document.getElementById('fcLockBar');
    const unlockedBar = document.getElementById('fcUnlockedBar');
    if (!lockBar || !unlockedBar) return;

    if (isFlowchartsUnlocked()) {
        lockBar.style.display = 'none';
        unlockedBar.style.display = 'flex';
    } else {
        lockBar.style.display = 'flex';
        unlockedBar.style.display = 'none';
    }
}

function renderFlowcharts() {
    const gallery = document.getElementById('fcGallery');
    if (!gallery) return;

    const fieldFilter = document.getElementById('fcFieldFilter');
    const field = fieldFilter ? fieldFilter.value : 'all';
    const unlocked = isFlowchartsUnlocked();

    let items = flowchartData;
    if (field !== 'all') {
        items = items.filter(fc => fc.field === field);
    }

    if (items.length === 0) {
        gallery.innerHTML = '<p class="preview-placeholder">' + t('fc.empty') + '</p>';
        return;
    }

    let html = '';
    items.forEach(fc => {
        html += '<div class="fc-card">';
        html += '<div class="fc-preview' + (unlocked ? '' : ' fc-blurred') + '">';
        html += fc.svg;
        if (!unlocked) {
            html += '<div class="fc-watermark">' + t('fc.watermark') + '</div>';
        }
        html += '</div>';
        html += '<div class="fc-info">';
        html += '<h4>' + fc.title + '</h4>';
        html += '<span class="fc-journal">' + fc.journal + '</span>';
        html += '<span class="fc-field">' + fc.field + '</span>';
        html += '</div>';
        html += '<div class="fc-actions">';
        if (unlocked) {
            html += '<button onclick="downloadFlowchartSvg(\'' + fc.id + '\')" data-i18n="fc.btn.downloadsvg">' + t('fc.btn.downloadsvg') + '</button>';
            html += '<button onclick="downloadFlowchartPng(\'' + fc.id + '\')" data-i18n="fc.btn.downloadpng">' + t('fc.btn.downloadpng') + '</button>';
        } else {
            html += '<button class="fc-btn-locked" onclick="showToast(t(\'fc.needunlock\'), \'warning\')" data-i18n="fc.btn.locked">' + t('fc.btn.locked') + '</button>';
        }
        html += '</div>';
        html += '</div>';
    });

    gallery.innerHTML = html;
}

function downloadFlowchartSvg(id) {
    const fc = flowchartData.find(f => f.id === id);
    if (!fc || !isFlowchartsUnlocked()) return;

    const blob = new Blob([fc.svg], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fc.id + '.svg';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(t('alert.downloadSuccess'));
}

function downloadFlowchartPng(id) {
    const fc = flowchartData.find(f => f.id === id);
    if (!fc || !isFlowchartsUnlocked()) return;

    const container = document.createElement('div');
    container.innerHTML = fc.svg;
    const svgEl = container.querySelector('svg');
    if (!svgEl) return;

    const viewBox = svgEl.getAttribute('viewBox');
    let width = 800, height = 400;
    if (viewBox) {
        const parts = viewBox.split(/\s+/);
        width = parseFloat(parts[2]) || 800;
        height = parseFloat(parts[3]) || 400;
    }

    const scale = 2; // Retina
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    const svgString = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = function () {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = fc.id + '.png';
        a.click();
        showToast(t('alert.downloadSuccess'));
    };
    img.src = url;
}

// Handle Enter key in password input
document.addEventListener('DOMContentLoaded', function () {
    const pwInput = document.getElementById('fcPasswordInput');
    if (pwInput) {
        pwInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') unlockFlowcharts();
        });
    }
    updateLockUI();

    // Auto-render on section visit
    const fcSection = document.getElementById('flowcharts');
    if (fcSection) {
        const observer = new MutationObserver(function () {
            if (fcSection.classList.contains('active')) renderFlowcharts();
        });
        observer.observe(fcSection, { attributes: true, attributeFilter: ['class'] });
    }
});
