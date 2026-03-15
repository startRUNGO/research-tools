// ==================== Paper Digest / 论文速递 ====================

let paperDigestData = [];
let pdLoaded = false;

// Load papers from external JSON file
function loadPaperDigest(callback) {
    if (pdLoaded) { if (callback) callback(); return; }

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
            if (callback) callback();
        })
        .catch(function () {
            paperDigestData = [];
            pdLoaded = true;
            if (callback) callback();
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
    renderPdTo('');
    renderPdTo('Home');
}

// Render paper digest to a specific set of elements (suffix: '' or 'Home')
function renderPdTo(suffix) {
    const list = document.getElementById('pdList' + suffix);
    const countEl = document.getElementById('pdCount' + suffix);
    if (!list) return;

    if (!pdLoaded) {
        loadPaperDigest(function () { renderPdTo(suffix); });
        return;
    }

    const fieldFilter = document.getElementById('pdFieldFilter' + suffix);
    const dateFilter = document.getElementById('pdDateFilter' + suffix);
    const searchInput = document.getElementById('pdSearchInput' + suffix);
    const field = fieldFilter ? fieldFilter.value : 'all';
    const days = dateFilter ? dateFilter.value : 'all';
    const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const bookmarks = getPdBookmarks();
    const now = new Date();

    let items = paperDigestData.slice();

    if (field !== 'all') {
        items = items.filter(function (p) { return p.field === field; });
    }

    if (days !== 'all') {
        const cutoff = new Date(now.getTime() - parseInt(days) * 86400000);
        items = items.filter(function (p) { return new Date(p.date) >= cutoff; });
    }

    if (search) {
        items = items.filter(function (p) {
            const haystack = (p.title + ' ' + p.authors + ' ' + (p.tags || []).join(' ') + ' ' + (p.abstract || '')).toLowerCase();
            return haystack.includes(search);
        });
    }

    items.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

    if (countEl) {
        countEl.textContent = t('pd.count').replace('{n}', items.length);
    }

    if (items.length === 0) {
        list.innerHTML = '<div class="pd-empty"><p>' + t('pd.empty') + '</p></div>';
        return;
    }

    let html = '';
    let lastDate = '';

    items.forEach(function (paper) {
        if (paper.date !== lastDate) {
            lastDate = paper.date;
            const dateObj = new Date(paper.date);
            const dateStr = dateObj.toLocaleDateString(currentLang === 'zh' ? 'zh-CN' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
            });
            html += '<div class="pd-date-divider"><span>' + dateStr + '</span></div>';
        }

        const isBookmarked = bookmarks.includes(paper.id);

        html += '<article class="pd-card">';
        html += '<div class="pd-card-header">';
        html += '<div class="pd-card-meta">';
        html += '<span class="pd-journal">' + paper.journal + '</span>';
        html += '<span class="pd-field">' + paper.field + '</span>';
        html += '</div>';
        html += '<button class="pd-bookmark' + (isBookmarked ? ' active' : '') + '" onclick="togglePdBookmark(\'' + paper.id + '\')" title="' + t('pd.bookmark') + '">' + (isBookmarked ? '★' : '☆') + '</button>';
        html += '</div>';

        var titleLink = paper.url || (paper.arxiv ? 'https://arxiv.org/abs/' + paper.arxiv : '') || (paper.doi ? 'https://doi.org/' + paper.doi : '');
        if (titleLink) {
            html += '<h3 class="pd-title"><a href="' + titleLink + '" target="_blank" rel="noopener">' + paper.title + '</a></h3>';
        } else {
            html += '<h3 class="pd-title">' + paper.title + '</h3>';
        }
        html += '<p class="pd-authors">' + paper.authors + '</p>';

        if (paper.abstract) {
            html += '<div class="pd-abstract"><p>' + paper.abstract + '</p></div>';
        }

        if (paper.highlights && paper.highlights.length > 0) {
            html += '<div class="pd-highlights"><h4>' + t('pd.highlights') + '</h4><ul>';
            paper.highlights.forEach(function (h) { html += '<li>' + h + '</li>'; });
            html += '</ul></div>';
        }

        if (paper.comment) {
            html += '<div class="pd-comment"><h4>' + t('pd.comment') + '</h4><p>' + paper.comment + '</p></div>';
        }

        html += '<div class="pd-card-footer"><div class="pd-tags">';
        if (paper.tags) {
            paper.tags.forEach(function (tag) { html += '<span class="pd-tag">' + tag + '</span>'; });
        }
        html += '</div><div class="pd-links">';
        if (paper.url) {
            html += '<a href="' + paper.url + '" target="_blank" rel="noopener">' + t('pd.link.paper') + '</a>';
        }
        if (paper.arxiv) {
            html += '<a href="https://arxiv.org/abs/' + paper.arxiv + '" target="_blank" rel="noopener">arXiv</a>';
        }
        if (paper.doi) {
            html += '<a href="https://doi.org/' + paper.doi + '" target="_blank" rel="noopener">DOI</a>';
        }
        html += '</div></div>';
        html += '</article>';
    });

    list.innerHTML = html;
}

// Wrapper functions for the two instances
function renderPaperDigest() { renderPdTo(''); }
function renderPaperDigestHome() { renderPdTo('Home'); }

// Load and render on page load (home shows papers immediately)
document.addEventListener('DOMContentLoaded', function () {
    loadPaperDigest(function () {
        renderPdTo('Home');
    });

    // Also render when paper-digest section is visited
    const pdSection = document.getElementById('paper-digest');
    if (pdSection) {
        const observer = new MutationObserver(function () {
            if (pdSection.classList.contains('active')) renderPdTo('');
        });
        observer.observe(pdSection, { attributes: true, attributeFilter: ['class'] });
    }
});
