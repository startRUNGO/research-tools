// ==================== Reference / Citation Manager ====================

const citationStyles = {
    apa: formatAPA,
    ieee: formatIEEE,
    gb: formatGB
};

function parseBibtexEntry(bibtex) {
    const result = {};
    const headerMatch = bibtex.match(/@(\w+)\{([^,]*),/);
    if (!headerMatch) return null;
    result.type = headerMatch[1].toLowerCase();
    result.key = headerMatch[2].trim();

    let body = bibtex.substring(headerMatch[0].length).replace(/\}\s*$/, '');

    // Parse fields
    let field = '';
    let depth = 0;
    const fields = [];
    for (let i = 0; i < body.length; i++) {
        const c = body[i];
        if (c === '{') depth++;
        if (c === '}') depth--;
        if (c === ',' && depth === 0) {
            if (field.trim()) fields.push(field.trim());
            field = '';
        } else {
            field += c;
        }
    }
    if (field.trim()) fields.push(field.trim());

    fields.forEach(f => {
        const eqIdx = f.indexOf('=');
        if (eqIdx === -1) return;
        const key = f.substring(0, eqIdx).trim().toLowerCase();
        let value = f.substring(eqIdx + 1).trim();
        // Remove wrapping braces or quotes
        value = value.replace(/^\{|\}$/g, '').replace(/^"|"$/g, '').trim();
        result[key] = value;
    });

    return result;
}

function formatAPA(entry) {
    if (!entry) return '';
    const authors = entry.author || 'Unknown';
    const year = entry.year || 'n.d.';
    const title = entry.title || '';
    const journal = entry.journal || entry.booktitle || '';
    const volume = entry.volume || '';
    const pages = entry.pages || '';
    const doi = entry.doi || '';

    let ref = authors.replace(/ and /g, ', & ') + ' (' + year + '). ' + title + '.';
    if (journal) ref += ' <em>' + journal + '</em>';
    if (volume) ref += ', <em>' + volume + '</em>';
    if (pages) ref += ', ' + pages;
    ref += '.';
    if (doi) ref += ' https://doi.org/' + doi;
    return ref;
}

function formatIEEE(entry) {
    if (!entry) return '';
    const authors = entry.author || 'Unknown';
    const title = entry.title || '';
    const journal = entry.journal || entry.booktitle || '';
    const volume = entry.volume || '';
    const pages = entry.pages || '';
    const year = entry.year || '';
    const doi = entry.doi || '';

    // IEEE: initials first
    const authorList = authors.split(' and ').map(a => {
        const parts = a.trim().split(',');
        if (parts.length === 2) return parts[1].trim() + ' ' + parts[0].trim();
        return a.trim();
    });

    let ref = authorList.join(', ') + ', "' + title + ',"';
    if (journal) ref += ' <em>' + journal + '</em>';
    if (volume) ref += ', vol. ' + volume;
    if (pages) ref += ', pp. ' + pages;
    if (year) ref += ', ' + year;
    ref += '.';
    if (doi) ref += ' doi: ' + doi;
    return ref;
}

function formatGB(entry) {
    if (!entry) return '';
    const authors = entry.author || 'Unknown';
    const title = entry.title || '';
    const journal = entry.journal || entry.booktitle || '';
    const year = entry.year || '';
    const volume = entry.volume || '';
    const number = entry.number || '';
    const pages = entry.pages || '';

    let ref = authors.replace(/ and /g, ', ') + '. ' + title + '[J].';
    if (journal) ref += ' ' + journal;
    if (year) ref += ', ' + year;
    if (volume) ref += ', ' + volume;
    if (number) ref += '(' + number + ')';
    if (pages) ref += ': ' + pages;
    ref += '.';
    return ref;
}

function convertCitation() {
    const input = document.getElementById('refInput');
    const output = document.getElementById('refOutput');
    const styleSelect = document.getElementById('refStyle');
    if (!input || !output || !styleSelect) return;

    const bibtex = input.value.trim();
    if (!bibtex) { showToast(t('alert.noContent'), 'warning'); return; }

    const style = styleSelect.value;

    // Split multiple entries
    const entries = [];
    let current = '';
    let depth = 0;
    for (let i = 0; i < bibtex.length; i++) {
        const c = bibtex[i];
        if (c === '@' && depth === 0 && current.trim()) {
            entries.push(current.trim());
            current = '';
        }
        current += c;
        if (c === '{') depth++;
        if (c === '}') depth--;
    }
    if (current.trim()) entries.push(current.trim());

    const results = entries.map(entry => {
        const parsed = parseBibtexEntry(entry);
        if (!parsed) return '<p style="color:red;">' + t('ref.parseError') + '</p>';
        const formatter = citationStyles[style];
        return formatter ? formatter(parsed) : '';
    });

    output.innerHTML = results.map((r, i) => '<div class="ref-item"><span class="ref-num">[' + (i + 1) + ']</span> ' + r + '</div>').join('');
}

function fetchDOI() {
    const doiInput = document.getElementById('doiInput');
    if (!doiInput) return;
    let doi = doiInput.value.trim();
    if (!doi) { showToast(t('ref.enterDoi'), 'warning'); return; }

    // Clean DOI: remove URL prefix if present
    doi = doi.replace(/^https?:\/\/doi\.org\//i, '');

    showToast(t('ref.fetching'), 'info');

    fetch('https://api.crossref.org/works/' + encodeURIComponent(doi))
        .then(r => r.json())
        .then(data => {
            const work = data.message;
            if (!work) throw new Error('No data');

            const authors = (work.author || []).map(a => (a.family || '') + ', ' + (a.given || '')).join(' and ');
            const title = (work.title && work.title[0]) || '';
            const journal = (work['container-title'] && work['container-title'][0]) || '';
            const year = work.published && work.published['date-parts'] && work.published['date-parts'][0] ? work.published['date-parts'][0][0] : '';
            const volume = work.volume || '';
            const pages = work.page || '';
            const entryType = work.type === 'journal-article' ? 'article' : work.type || 'misc';
            const key = (work.author && work.author[0] ? work.author[0].family : 'ref') + year;

            const bibtex = '@' + entryType + '{' + key + ',\n' +
                '  author    = {' + authors + '},\n' +
                '  title     = {' + title + '},\n' +
                (journal ? '  journal   = {' + journal + '},\n' : '') +
                (year ? '  year      = {' + year + '},\n' : '') +
                (volume ? '  volume    = {' + volume + '},\n' : '') +
                (pages ? '  pages     = {' + pages + '},\n' : '') +
                '  doi       = {' + doi + '}\n' +
                '}';

            const refInput = document.getElementById('refInput');
            if (refInput) {
                refInput.value = (refInput.value ? refInput.value + '\n\n' : '') + bibtex;
            }
            showToast(t('ref.fetched'));
        })
        .catch(err => {
            showToast(t('ref.fetchError') + err.message, 'error');
        });
}

function copyRefOutput() {
    const output = document.getElementById('refOutput');
    if (!output || !output.textContent.trim()) {
        showToast(t('alert.noContent'), 'warning'); return;
    }
    navigator.clipboard.writeText(output.textContent).then(() => {
        showToast(t('alert.copied'));
    }).catch(err => {
        showToast(t('alert.copyFail') + err, 'error');
    });
}

function clearRef() {
    const input = document.getElementById('refInput');
    const output = document.getElementById('refOutput');
    const doiInput = document.getElementById('doiInput');
    if (input) input.value = '';
    if (output) output.innerHTML = '<p class="preview-placeholder">' + t('ref.output.placeholder') + '</p>';
    if (doiInput) doiInput.value = '';
}
