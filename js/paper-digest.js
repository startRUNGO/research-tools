// ==================== Paper Digest ====================

let paperDigestData = [];
let pdLoaded = false;
var PD_PAGE_SIZE = 10;
var pdCurrentPage = { '': 1, 'Home': 1 };

// Load papers from daily JSON files via papers-index.json
function loadPaperDigest(callback) {
    if (pdLoaded) { if (callback) callback(); return; }

    fetch('data/papers-index.json')
        .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(function (dates) {
            var fetches = dates.map(function (d) {
                return fetch('data/papers/' + d + '.json')
                    .then(function (r) {
                        if (!r.ok) throw new Error('HTTP ' + r.status);
                        return r.json();
                    })
                    .catch(function () { return []; });
            });
            return Promise.all(fetches);
        })
        .then(function (results) {
            paperDigestData = [];
            results.forEach(function (arr) {
                if (Array.isArray(arr)) {
                    paperDigestData = paperDigestData.concat(arr);
                }
            });
            if (paperDigestData.length === 0) {
                return fetch('data/papers.json')
                    .then(function (r) { return r.ok ? r.json() : []; })
                    .then(function (data) {
                        if (Array.isArray(data)) paperDigestData = data;
                    })
                    .catch(function () { paperDigestData = []; });
            }
        })
        .then(function () {
            pdLoaded = true;
            if (callback) callback();
        })
        .catch(function () {
            fetch('data/papers.json')
                .then(function (r) { return r.ok ? r.json() : []; })
                .then(function (data) {
                    if (Array.isArray(data)) paperDigestData = data;
                    pdLoaded = true;
                    if (callback) callback();
                })
                .catch(function () {
                    paperDigestData = [];
                    pdLoaded = true;
                    if (callback) callback();
                });
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

// Highlight search keywords in text
function highlightSearch(text, search) {
    if (!search || !text) return text;
    var escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp('(' + escaped + ')', 'gi'), '<mark>$1</mark>');
}

// Export bookmarked papers as BibTeX
function exportPdBibtex() {
    var bookmarks = getPdBookmarks();
    if (bookmarks.length === 0) {
        showToast(t('pd.export.empty') || 'No bookmarked papers to export');
        return;
    }
    var bibtex = '';
    paperDigestData.forEach(function (p) {
        if (!bookmarks.includes(p.id)) return;
        var key = p.id.replace(/[^a-zA-Z0-9]/g, '');
        var type = p.arxiv ? 'article' : 'article';
        bibtex += '@' + type + '{' + key + ',\n';
        bibtex += '  title = {' + p.title + '},\n';
        bibtex += '  author = {' + p.authors + '},\n';
        bibtex += '  journal = {' + p.journal + '},\n';
        bibtex += '  year = {' + (p.date || '').substring(0, 4) + '},\n';
        if (p.doi) bibtex += '  doi = {' + p.doi + '},\n';
        if (p.arxiv) bibtex += '  eprint = {' + p.arxiv + '},\n  archivePrefix = {arXiv},\n';
        if (p.url) bibtex += '  url = {' + p.url + '},\n';
        bibtex += '}\n\n';
    });

    var blob = new Blob([bibtex], { type: 'text/plain' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'papers-bookmarked.bib';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(t('pd.export.success') || 'BibTeX exported (' + bookmarks.length + ' papers)');
}

// Share a paper via Web Share API or copy to clipboard
function sharePaper(encodedTitle, encodedUrl) {
    var title = decodeURIComponent(encodedTitle);
    var url = decodeURIComponent(encodedUrl);
    if (navigator.share) {
        navigator.share({ title: title, url: url }).catch(function () {});
    } else {
        // Fallback: show share menu
        var menu = document.getElementById('shareMenu');
        if (menu) { menu.remove(); return; }
        menu = document.createElement('div');
        menu.id = 'shareMenu';
        menu.className = 'pd-share-menu';
        menu.innerHTML =
            '<a href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(url) + '" target="_blank">Twitter</a>' +
            '<a href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url) + '" target="_blank">LinkedIn</a>' +
            '<button onclick="copyPaperLink(\'' + encodeURIComponent(url) + '\')">' + t('pd.share.copy') + '</button>';
        event.target.closest('.pd-card-footer').appendChild(menu);
        setTimeout(function () {
            document.addEventListener('click', function closeMenu(e) {
                if (!e.target.closest('.pd-share-menu')) {
                    var m = document.getElementById('shareMenu');
                    if (m) m.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 10);
    }
}

function copyPaperLink(encodedUrl) {
    var url = decodeURIComponent(encodedUrl);
    navigator.clipboard.writeText(url).then(function () {
        showToast(t('pd.share.copied'));
    }).catch(function () {
        showToast('Copy failed');
    });
    var m = document.getElementById('shareMenu');
    if (m) m.remove();
}

// Render paper digest to a specific set of elements (suffix: '' or 'Home')
function renderPdTo(suffix) {
    const list = document.getElementById('pdList' + suffix);
    const countEl = document.getElementById('pdCount' + suffix);
    if (!list) return;
    if (!pdLoaded) { loadPaperDigest(function () { renderPdTo(suffix); }); return; }

    const fieldFilter = document.getElementById('pdFieldFilter' + suffix);
    const dateFilter = document.getElementById('pdDateFilter' + suffix);
    const searchInput = document.getElementById('pdSearchInput' + suffix);

    const field = fieldFilter ? fieldFilter.value : 'all';
    const days = dateFilter ? dateFilter.value : 'all';
    const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const bookmarks = getPdBookmarks();
    const now = new Date();

    // Reset page when filters change
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

    var totalCount = items.length;
    if (countEl) {
        countEl.textContent = t('pd.count').replace('{n}', totalCount);
    }

    if (items.length === 0) {
        list.innerHTML = '<div class="pd-empty"><p>' + t('pd.empty') + '</p></div>';
        return;
    }

    // Lazy load: show only first N pages
    var page = pdCurrentPage[suffix] || 1;
    var showCount = page * PD_PAGE_SIZE;
    var hasMore = items.length > showCount;
    var visibleItems = items.slice(0, showCount);

    // Group by date
    var today = new Date().toISOString().slice(0, 10);
    var dateGroups = [];
    var currentGroup = null;
    visibleItems.forEach(function (paper) {
        if (!currentGroup || currentGroup.date !== paper.date) {
            currentGroup = { date: paper.date, papers: [] };
            dateGroups.push(currentGroup);
        }
        currentGroup.papers.push(paper);
    });

    let html = '';
    dateGroups.forEach(function (group, gi) {
        var dateObj = new Date(group.date);
        var dateStr = dateObj.toLocaleDateString(currentLang === 'zh' ? 'zh-CN' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
        });
        var isToday = group.date === today;
        var collapsed = !isToday && gi > 0;

        html += '<div class="pd-date-group' + (collapsed ? ' collapsed' : '') + '">';
        html += '<div class="pd-date-divider" onclick="toggleDateGroup(this)">';
        html += '<span>' + dateStr + ' (' + group.papers.length + ')</span>';
        html += '<span class="pd-collapse-icon">' + (collapsed ? '+' : '\u2212') + '</span>';
        html += '</div>';
        html += '<div class="pd-date-papers"' + (collapsed ? ' style="display:none"' : '') + '>';

        group.papers.forEach(function (paper) {
        const isBookmarked = bookmarks.includes(paper.id);
        html += '<article class="pd-card">';
        html += '<div class="pd-card-header">';
        html += '<div class="pd-card-meta">';
        html += '<span class="pd-journal">' + paper.journal + '</span>';
        html += '<span class="pd-field">' + paper.field + '</span>';
        html += '</div>';
        html += '<button class="pd-bookmark' + (isBookmarked ? ' active' : '') + '" onclick="togglePdBookmark(\'' + paper.id + '\')" title="' + t('pd.bookmark') + '">' + (isBookmarked ? '\u2605' : '\u2606') + '</button>';
        html += '</div>';

        var titleText = search ? highlightSearch(paper.title, search) : paper.title;
        var titleLink = paper.url || (paper.arxiv ? 'https://arxiv.org/abs/' + paper.arxiv : '') || (paper.doi ? 'https://doi.org/' + paper.doi : '');
        if (titleLink) {
            html += '<h3 class="pd-title"><a href="' + titleLink + '" target="_blank" rel="noopener">' + titleText + '</a></h3>';
        } else {
            html += '<h3 class="pd-title">' + titleText + '</h3>';
        }

        var authorsText = search ? highlightSearch(paper.authors, search) : paper.authors;
        html += '<p class="pd-authors">' + authorsText + '</p>';

        if (paper.abstract) {
            var abstractText = search ? highlightSearch(paper.abstract, search) : paper.abstract;
            html += '<div class="pd-abstract"><p>' + abstractText + '</p></div>';
        }
        if (paper.highlights && paper.highlights.length > 0) {
            html += '<div class="pd-highlights"><h4>' + t('pd.highlights') + '</h4><ul>';
            paper.highlights.forEach(function (h) {
                html += '<li>' + (search ? highlightSearch(h, search) : h) + '</li>';
            });
            html += '</ul></div>';
        }
        if (paper.comment) {
            html += '<div class="pd-comment"><h4>' + t('pd.comment') + '</h4><p>' + paper.comment + '</p></div>';
        }

        html += '<div class="pd-card-footer"><div class="pd-tags">';
        if (paper.tags) {
            paper.tags.forEach(function (tag) {
                var tagText = search ? highlightSearch(tag, search) : tag;
                html += '<span class="pd-tag">' + tagText + '</span>';
            });
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
        // Share button
        var shareUrl = paper.url || (paper.arxiv ? 'https://arxiv.org/abs/' + paper.arxiv : '') || (paper.doi ? 'https://doi.org/' + paper.doi : '');
        if (shareUrl) {
            html += '<button class="pd-share-btn" onclick="sharePaper(\'' + encodeURIComponent(paper.title) + '\',\'' + encodeURIComponent(shareUrl) + '\')" title="Share">&#x1F517;</button>';
        }
        html += '</div></div>';
        html += '</article>';
        });

        html += '</div></div>'; // close pd-date-papers and pd-date-group
    });

    // Load more button
    if (hasMore) {
        html += '<div class="pd-load-more"><button onclick="pdLoadMore(\'' + suffix + '\')">' + t('pd.loadmore') + ' (' + showCount + '/' + totalCount + ')</button></div>';
    }

    list.innerHTML = html;
}

function toggleDateGroup(el) {
    var group = el.closest('.pd-date-group');
    var papers = group.querySelector('.pd-date-papers');
    var icon = group.querySelector('.pd-collapse-icon');
    if (group.classList.contains('collapsed')) {
        group.classList.remove('collapsed');
        papers.style.display = '';
        icon.textContent = '\u2212';
    } else {
        group.classList.add('collapsed');
        papers.style.display = 'none';
        icon.textContent = '+';
    }
}

function pdLoadMore(suffix) {
    pdCurrentPage[suffix] = (pdCurrentPage[suffix] || 1) + 1;
    renderPdTo(suffix);
}

// Reset page on filter change
function renderPaperDigest() { pdCurrentPage[''] = 1; renderPdTo(''); }
function renderPaperDigestHome() { pdCurrentPage['Home'] = 1; renderPdTo('Home'); }

// Load and render on page load
document.addEventListener('DOMContentLoaded', function () {
    loadPaperDigest(function () { renderPdTo('Home'); });
    var pdSection = document.getElementById('paper-digest');
    if (pdSection) {
        var observer = new MutationObserver(function () {
            if (pdSection.classList.contains('active')) renderPdTo('');
        });
        observer.observe(pdSection, { attributes: true, attributeFilter: ['class'] });
    }
});
