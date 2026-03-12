// ==================== Academic Calendar ====================

const conferenceData = [
    // AI/ML
    { name: 'NeurIPS 2026', field: 'AI/ML', abstract: '2026-05-15', deadline: '2026-05-22', notification: '2026-09-15', conference: '2026-12-07', location: 'TBD', url: 'https://neurips.cc', tier: 'A*' },
    { name: 'ICML 2026', field: 'AI/ML', abstract: '2026-01-23', deadline: '2026-01-30', notification: '2026-05-01', conference: '2026-07-20', location: 'TBD', url: 'https://icml.cc', tier: 'A*' },
    { name: 'ICLR 2026', field: 'AI/ML', abstract: '2025-09-28', deadline: '2025-10-02', notification: '2026-01-15', conference: '2026-04-24', location: 'TBD', url: 'https://iclr.cc', tier: 'A*' },
    { name: 'AAAI 2026', field: 'AI/ML', abstract: '2025-08-07', deadline: '2025-08-15', notification: '2025-11-20', conference: '2026-02-20', location: 'TBD', url: 'https://aaai.org', tier: 'A*' },
    // CV
    { name: 'CVPR 2026', field: 'CV', abstract: '2025-11-07', deadline: '2025-11-14', notification: '2026-02-25', conference: '2026-06-15', location: 'TBD', url: 'https://cvpr.thecvf.com', tier: 'A*' },
    { name: 'ICCV 2025', field: 'CV', abstract: '2025-03-07', deadline: '2025-03-14', notification: '2025-07-01', conference: '2025-10-19', location: 'Honolulu', url: 'https://iccv2025.thecvf.com', tier: 'A*' },
    { name: 'ECCV 2026', field: 'CV', abstract: '2026-03-06', deadline: '2026-03-13', notification: '2026-07-01', conference: '2026-10-04', location: 'TBD', url: 'https://eccv.ecva.net', tier: 'A*' },
    // NLP
    { name: 'ACL 2026', field: 'NLP', abstract: '2026-01-16', deadline: '2026-01-23', notification: '2026-05-01', conference: '2026-08-01', location: 'TBD', url: 'https://www.aclweb.org', tier: 'A*' },
    { name: 'EMNLP 2025', field: 'NLP', abstract: '2025-05-15', deadline: '2025-05-22', notification: '2025-08-15', conference: '2025-11-05', location: 'TBD', url: 'https://www.aclweb.org', tier: 'A' },
    { name: 'NAACL 2025', field: 'NLP', abstract: '2025-01-15', deadline: '2025-01-22', notification: '2025-04-01', conference: '2025-06-29', location: 'Albuquerque', url: 'https://www.aclweb.org', tier: 'A' },
    // Systems
    { name: 'SIGMOD 2026', field: 'DB', deadline: '2025-10-01', notification: '2026-01-15', conference: '2026-06-14', location: 'TBD', url: 'https://sigmod.org', tier: 'A*' },
    { name: 'OSDI 2026', field: 'Systems', deadline: '2025-12-04', notification: '2026-03-15', conference: '2026-07-13', location: 'TBD', url: 'https://www.usenix.org/conference/osdi26', tier: 'A*' },
    // Web/IR
    { name: 'WWW 2026', field: 'Web', abstract: '2025-10-07', deadline: '2025-10-14', notification: '2026-01-15', conference: '2026-04-27', location: 'TBD', url: 'https://www2026.thewebconf.org', tier: 'A*' },
    { name: 'KDD 2026', field: 'DM', deadline: '2026-02-01', notification: '2026-05-15', conference: '2026-08-02', location: 'TBD', url: 'https://kdd.org', tier: 'A*' },
    // SE/Security
    { name: 'ICSE 2026', field: 'SE', deadline: '2025-08-01', notification: '2025-11-15', conference: '2026-04-12', location: 'TBD', url: 'https://conf.researchr.org/home/icse-2026', tier: 'A*' },
    { name: 'CCS 2025', field: 'Security', deadline: '2025-04-15', notification: '2025-07-01', conference: '2025-11-17', location: 'TBD', url: 'https://www.sigsac.org/ccs.html', tier: 'A*' },
];

function renderCalendar() {
    const output = document.getElementById('calendarOutput');
    const fieldFilter = document.getElementById('calFieldFilter').value;
    const statusFilter = document.getElementById('calStatusFilter').value;
    if (!output) return;

    const now = new Date();

    let filtered = conferenceData.map(conf => {
        const deadlineDate = new Date(conf.deadline);
        const confDate = new Date(conf.conference);
        const daysToDeadline = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
        const daysToConf = Math.ceil((confDate - now) / (1000 * 60 * 60 * 24));

        let status;
        if (daysToDeadline > 30) status = 'upcoming';
        else if (daysToDeadline > 0) status = 'soon';
        else if (daysToConf > 0) status = 'closed';
        else status = 'past';

        return { ...conf, daysToDeadline, daysToConf, status };
    });

    if (fieldFilter !== 'all') {
        filtered = filtered.filter(c => c.field === fieldFilter);
    }
    if (statusFilter === 'open') {
        filtered = filtered.filter(c => c.daysToDeadline > 0);
    } else if (statusFilter === 'soon') {
        filtered = filtered.filter(c => c.daysToDeadline > 0 && c.daysToDeadline <= 30);
    }

    filtered.sort((a, b) => a.daysToDeadline - b.daysToDeadline);

    if (filtered.length === 0) {
        output.innerHTML = '<p class="preview-placeholder">' + t('cal.noResults') + '</p>';
        return;
    }

    let html = '<div class="cal-list">';
    filtered.forEach(conf => {
        let statusClass = 'cal-upcoming';
        let statusText = t('cal.status.upcoming');
        let badgeColor = '#27ae60';

        if (conf.status === 'soon') {
            statusClass = 'cal-soon';
            statusText = conf.daysToDeadline + ' ' + t('cal.daysLeft');
            badgeColor = '#f39c12';
        } else if (conf.status === 'closed') {
            statusClass = 'cal-closed';
            statusText = t('cal.status.closed');
            badgeColor = '#95a5a6';
        } else if (conf.status === 'past') {
            statusClass = 'cal-past';
            statusText = t('cal.status.past');
            badgeColor = '#bdc3c7';
        } else {
            statusText = conf.daysToDeadline + ' ' + t('cal.daysLeft');
        }

        html += '<div class="cal-item ' + statusClass + '">';
        html += '<div class="cal-item-header">';
        html += '<span class="cal-name"><a href="' + conf.url + '" target="_blank" rel="noopener">' + conf.name + '</a></span>';
        html += '<span class="cal-tier">' + conf.tier + '</span>';
        html += '<span class="cal-badge" style="background:' + badgeColor + '">' + statusText + '</span>';
        html += '</div>';
        html += '<div class="cal-item-details">';
        html += '<span>' + t('cal.field') + ': ' + conf.field + '</span>';
        html += '<span>' + t('cal.deadline') + ': ' + conf.deadline + '</span>';
        if (conf.notification) html += '<span>' + t('cal.notification') + ': ' + conf.notification + '</span>';
        html += '<span>' + t('cal.conference') + ': ' + conf.conference + '</span>';
        if (conf.location) html += '<span>\ud83d\udccd ' + conf.location + '</span>';
        html += '</div>';
        html += '</div>';
    });
    html += '</div>';

    output.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
    // Auto-render on section visit
    const calSection = document.getElementById('calendar');
    if (calSection) {
        const observer = new MutationObserver(() => {
            if (calSection.classList.contains('active')) renderCalendar();
        });
        observer.observe(calSection, { attributes: true, attributeFilter: ['class'] });
    }
});
