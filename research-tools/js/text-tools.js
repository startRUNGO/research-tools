// ==================== Text Tools ====================

function analyzeText() {
    const text = document.getElementById('textToolsInput')?.value || '';
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const enWords = text.replace(/[\u4e00-\u9fff]/g, '').trim().split(/\s+/).filter(w => w.length > 0).length;
    const sentences = (text.match(/[.!?。！？；;]+/g) || []).length || (text.trim() ? 1 : 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || (text.trim() ? 1 : 0);
    const readTime = Math.max(1, Math.ceil((chineseChars / 300) + (enWords / 200)));

    const el1 = document.getElementById('statChars');
    if (el1) el1.textContent = text.length;
    const el2 = document.getElementById('statCharsNoSpace');
    if (el2) el2.textContent = text.replace(/\s/g, '').length;
    const el3 = document.getElementById('statChinese');
    if (el3) el3.textContent = chineseChars;
    const el4 = document.getElementById('statEnWords');
    if (el4) el4.textContent = enWords;
    const el5 = document.getElementById('statSentences');
    if (el5) el5.textContent = sentences;
    const el6 = document.getElementById('statParagraphs');
    if (el6) el6.textContent = paragraphs;
    const el7 = document.getElementById('statReadTime');
    if (el7) el7.textContent = text.trim() ? readTime : 0;
}

function cleanupText() {
    const input = document.getElementById('textToolsInput');
    let text = input.value;
    text = text.replace(/[ \t]+/g, ' ');
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.split('\n').map(l => l.trim()).join('\n');
    text = text.trim();
    input.value = text;
    analyzeText();
    showToast(t('texttools.cleaned'));
}

function copyTextResult() {
    const text = document.getElementById('textToolsInput').value;
    if (!text) { showToast(t('alert.noContent'), 'warning'); return; }
    navigator.clipboard.writeText(text).then(() => {
        showToast(t('alert.copied'));
    }).catch(err => {
        showToast(t('alert.copyFail') + err, 'error');
    });
}
