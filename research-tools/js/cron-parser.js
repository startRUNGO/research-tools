// ==================== Cron Expression Parser ====================

const cronFieldNames = ['minute', 'hour', 'day', 'month', 'weekday'];
const cronFieldRanges = [
    { min: 0, max: 59, name: 'minute' },
    { min: 0, max: 23, name: 'hour' },
    { min: 1, max: 31, name: 'day of month' },
    { min: 1, max: 12, name: 'month' },
    { min: 0, max: 6, name: 'day of week' }
];

const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function parseCronField(field, range) {
    if (field === '*') return t('cron.every') + ' ' + t('cron.field.' + range.name);
    if (field.includes('/')) {
        const parts = field.split('/');
        return t('cron.every') + ' ' + parts[1] + ' ' + t('cron.field.' + range.name) + (parts[0] !== '*' ? ' (' + t('cron.from') + ' ' + parts[0] + ')' : '');
    }
    if (field.includes('-')) {
        const parts = field.split('-');
        if (range.name === 'day of week') return dayNames[parseInt(parts[0])] + ' ' + t('cron.to') + ' ' + dayNames[parseInt(parts[1])];
        if (range.name === 'month') return monthNames[parseInt(parts[0])] + ' ' + t('cron.to') + ' ' + monthNames[parseInt(parts[1])];
        return parts[0] + ' ' + t('cron.to') + ' ' + parts[1];
    }
    if (field.includes(',')) {
        const values = field.split(',');
        if (range.name === 'day of week') return values.map(v => dayNames[parseInt(v)]).join(', ');
        if (range.name === 'month') return values.map(v => monthNames[parseInt(v)]).join(', ');
        return values.join(', ');
    }
    // Single value
    if (range.name === 'day of week') return dayNames[parseInt(field)] || field;
    if (range.name === 'month') return monthNames[parseInt(field)] || field;
    return field;
}

function describeCron(expr) {
    const fields = expr.trim().split(/\s+/);
    if (fields.length < 5 || fields.length > 6) return t('cron.invalidFormat');

    // Skip optional seconds field if 6 fields
    const offset = fields.length === 6 ? 1 : 0;

    const descriptions = [];
    for (let i = 0; i < 5; i++) {
        const field = fields[i + offset];
        const range = cronFieldRanges[i];
        if (field !== '*') {
            descriptions.push(parseCronField(field, range));
        }
    }

    if (descriptions.length === 0) return t('cron.everyMinute');
    return descriptions.join('; ');
}

function getNextRuns(expr, count) {
    const fields = expr.trim().split(/\s+/);
    if (fields.length < 5) return [];

    const offset = fields.length === 6 ? 1 : 0;
    const minute = fields[0 + offset];
    const hour = fields[1 + offset];
    const dom = fields[2 + offset];
    const month = fields[3 + offset];
    const dow = fields[4 + offset];

    function expandField(field, min, max) {
        if (field === '*') {
            const arr = [];
            for (let i = min; i <= max; i++) arr.push(i);
            return arr;
        }
        const values = new Set();
        field.split(',').forEach(part => {
            if (part.includes('/')) {
                const [range, step] = part.split('/');
                const s = parseInt(step);
                const start = range === '*' ? min : parseInt(range);
                for (let i = start; i <= max; i += s) values.add(i);
            } else if (part.includes('-')) {
                const [a, b] = part.split('-').map(Number);
                for (let i = a; i <= b; i++) values.add(i);
            } else {
                values.add(parseInt(part));
            }
        });
        return [...values].sort((a, b) => a - b);
    }

    const minutes = expandField(minute, 0, 59);
    const hours = expandField(hour, 0, 23);
    const doms = expandField(dom, 1, 31);
    const months = expandField(month, 1, 12);
    const dows = expandField(dow, 0, 6);

    const results = [];
    const now = new Date();
    const check = new Date(now);
    check.setSeconds(0, 0);
    check.setMinutes(check.getMinutes() + 1);

    let safety = 0;
    while (results.length < count && safety < 525960) {
        safety++;
        const m = check.getMinutes();
        const h = check.getHours();
        const d = check.getDate();
        const mo = check.getMonth() + 1;
        const dw = check.getDay();

        if (months.includes(mo) && doms.includes(d) && dows.includes(dw) && hours.includes(h) && minutes.includes(m)) {
            results.push(new Date(check));
        }
        check.setMinutes(check.getMinutes() + 1);
    }
    return results;
}

function parseCron() {
    const input = document.getElementById('cronInput');
    const output = document.getElementById('cronOutput');
    if (!input || !output) return;

    const expr = input.value.trim();
    if (!expr) { showToast(t('alert.noContent'), 'warning'); return; }

    const description = describeCron(expr);
    const nextRuns = getNextRuns(expr, 10);

    let html = '<div class="cron-result">';
    html += '<h4>' + t('cron.description') + '</h4>';
    html += '<p class="cron-desc-text">' + description + '</p>';
    html += '<h4>' + t('cron.nextRuns') + '</h4>';
    if (nextRuns.length > 0) {
        html += '<ol class="cron-runs-list">';
        nextRuns.forEach(d => {
            html += '<li>' + d.toLocaleString() + '</li>';
        });
        html += '</ol>';
    } else {
        html += '<p>' + t('cron.noRuns') + '</p>';
    }
    html += '</div>';

    // Visual field breakdown
    const fields = expr.trim().split(/\s+/);
    const offset = fields.length === 6 ? 1 : 0;
    html += '<div class="cron-fields">';
    const fieldLabels = [t('cron.field.minute'), t('cron.field.hour'), t('cron.field.day of month'), t('cron.field.month'), t('cron.field.day of week')];
    for (let i = 0; i < 5 && (i + offset) < fields.length; i++) {
        html += '<div class="cron-field-box"><div class="cron-field-value">' + fields[i + offset] + '</div><div class="cron-field-label">' + fieldLabels[i] + '</div></div>';
    }
    html += '</div>';

    output.innerHTML = html;
}

function insertCronPreset(expr) {
    const input = document.getElementById('cronInput');
    if (input) { input.value = expr; parseCron(); }
}

function clearCron() {
    const input = document.getElementById('cronInput');
    const output = document.getElementById('cronOutput');
    if (input) input.value = '';
    if (output) output.innerHTML = '<p class="preview-placeholder">' + t('cron.output.placeholder') + '</p>';
}
