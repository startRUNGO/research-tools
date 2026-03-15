// ==================== Paper Digest / 论文速递 ====================

let paperDigestData = [];
let pdLoaded = false;

// Load papers from external JSON file
function loadPaperDigest() {
    if (pdLoaded) { renderPaperDigest(); return; }

    fetch('data/papers.json')
        .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(function (data) {
            if (Array.isArray(data)) {
                paperDigestData = data;
            }
            pdLoaded = true;
            renderPaperDigest();
        })
        .catch(function () {
            paperDigestData = [];
            pdLoaded = true;
            renderPaperDigest();
        });
}

// Bookmarked papers stored in localStorage
function getPdBookmarks() {
    try {
        return JSON.parse(localStorage.getItem('pd_bookmarks') || '[]');
    } catch { return []; }
}

function togglePdBookmark(id) {
    let bookmarks = getPdBookmarks();
    if (bookmarks.includes(id)) {
        bookmarks = bookmarks.filter(b => b !== id);
        showToast(t('pd.unbookmarked'));
    } else {
        bookmarks.push(id);
        showToast(t('pd.bookmarked'));
    }
    localStorage.setItem('pd_bookmarks', JSON.stringify(bookmarks));
    renderPaperDigest();
}

function renderPaperDigest() {
    const list = document.getElementById('pdList');
    const countEl = document.getElementById('pdCount');
    if (!list) return;

    if (!pdLoaded) { loadPaperDigest(); return; }

    const fieldFilter = document.getElementById('pdFieldFilter');
    const dateFilter = document.getElementById('pdDateFilter');
    const searchInput = document.getElementById('pdSearchInput');
    const field = fieldFilter ? fieldFilter.value : 'all';
    const days = dateFilter ? dateFilter.value : 'all';
    const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const bookmarks = getPdBookmarks();
    const now = new Date();

    let items = paperDigestData.slice();

    // Field filter
    if (field !== 'all') {
        items = items.filter(p => p.field === field);
    }

    // Date filter
    if (days !== 'all') {
        const cutoff = new Date(now.getTime() - parseInt(days) * 86400000);
        items = items.filter(p => new Date(p.date) >= cutoff);
    }

    // Search filter
    if (search) {
        items = items.filter(p => {
            const haystack = (p.title + ' ' + p.authors + ' ' + (p.tags || []).join(' ') + ' ' + (p.abstract || '')).toLowerCase();
            return haystack.includes(search);
        });
    }

    // Sort by date descending (newest first)
    items.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (countEl) {
        countEl.textContent = t('pd.count').replace('{n}', items.length);
    }

    if (items.length === 0) {
        list.innerHTML = '<div class="pd-empty"><p>' + t('pd.empty') + '</p></div>';
        return;
    }

    let html = '';
    let lastDate = '';

    items.forEach(paper => {
        // Date divider
        if (paper.date !== lastDate) {
            lastDate = paper.date;
            const dateObj = new Date(paper.date);
            const dateStr = dateObj.toLocaleDateString(currentLang === 'zh' ? 'zh-CN' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
            });
            html += '<div class="pd-date-divider"><span>' + dateStr + '</span></div>';
        }

        const isBookmarked = bookmarks.includes(paper.id);

        html += '<article class="pd-card" id="' + paper.id + '">';

        // Header
        html += '<div class="pd-card-header">';
        html += '<div class="pd-card-meta">';
        html += '<span class="pd-journal">' + paper.journal + '</span>';
        html += '<span class="pd-field">' + paper.field + '</span>';
        html += '</div>';
        html += '<button class="pd-bookmark' + (isBookmarked ? ' active' : '') + '" onclick="togglePdBookmark(\'' + paper.id + '\')" title="' + t('pd.bookmark') + '">' + (isBookmarked ? '★' : '☆') + '</button>';
        html += '</div>';

        // Title
        html += '<h3 class="pd-title">' + paper.title + '</h3>';
        html += '<p class="pd-authors">' + paper.authors + '</p>';

        // Abstract
        if (paper.abstract) {
            html += '<div class="pd-abstract">';
            html += '<p>' + paper.abstract + '</p>';
            html += '</div>';
        }

        // Highlights
        if (paper.highlights && paper.highlights.length > 0) {
            html += '<div class="pd-highlights">';
            html += '<h4>' + t('pd.highlights') + '</h4>';
            html += '<ul>';
            paper.highlights.forEach(h => {
                html += '<li>' + h + '</li>';
            });
            html += '</ul>';
            html += '</div>';
        }

        // Comment
        if (paper.comment) {
            html += '<div class="pd-comment">';
            html += '<h4>' + t('pd.comment') + '</h4>';
            html += '<p>' + paper.comment + '</p>';
            html += '</div>';
        }

        // Tags & Links
        html += '<div class="pd-card-footer">';
        html += '<div class="pd-tags">';
        if (paper.tags) {
            paper.tags.forEach(tag => {
                html += '<span class="pd-tag">' + tag + '</span>';
            });
        }
        html += '</div>';
        html += '<div class="pd-links">';
        if (paper.url) {
            html += '<a href="' + paper.url + '" target="_blank" rel="noopener">' + t('pd.link.paper') + '</a>';
        }
        if (paper.arxiv) {
            html += '<a href="https://arxiv.org/abs/' + paper.arxiv + '" target="_blank" rel="noopener">arXiv</a>';
        }
        if (paper.doi) {
            html += '<a href="https://doi.org/' + paper.doi + '" target="_blank" rel="noopener">DOI</a>';
        }
        html += '</div>';
        html += '</div>';

        html += '</article>';
    });

    list.innerHTML = html;
}

// Auto-render on section visit
document.addEventListener('DOMContentLoaded', function () {
    const pdSection = document.getElementById('paper-digest');
    if (pdSection) {
        const observer = new MutationObserver(function () {
            if (pdSection.classList.contains('active')) loadPaperDigest();
        });
        observer.observe(pdSection, { attributes: true, attributeFilter: ['class'] });
    }
});
