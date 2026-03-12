// ==================== Code Highlight Sharing ====================

const codeLanguages = {
    javascript: { name: 'JavaScript', keywords: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|this|typeof|instanceof|switch|case|break|continue|default|do|in|of|yield|delete|void|with|debugger)\b/g },
    python: { name: 'Python', keywords: /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|raise|with|yield|lambda|pass|break|continue|and|or|not|is|in|True|False|None|print|self|async|await|global|nonlocal)\b/g },
    java: { name: 'Java', keywords: /\b(public|private|protected|static|final|abstract|class|interface|extends|implements|new|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|import|package|void|int|String|boolean|double|float|long|char|byte|short|this|super|null|true|false|instanceof|synchronized|volatile|transient|native|enum)\b/g },
    cpp: { name: 'C/C++', keywords: /\b(int|float|double|char|void|bool|long|short|unsigned|signed|const|static|extern|auto|register|volatile|struct|class|enum|union|typedef|sizeof|return|if|else|for|while|do|switch|case|break|continue|default|goto|include|define|ifdef|ifndef|endif|template|namespace|using|new|delete|try|catch|throw|public|private|protected|virtual|override|nullptr|true|false|this|string|vector|map|set)\b/g },
    sql: { name: 'SQL', keywords: /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|IN|BETWEEN|LIKE|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|AS|INTO|VALUES|SET|NULL|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|CHECK|DEFAULT|COUNT|SUM|AVG|MAX|MIN|DISTINCT|UNION|ALL|EXISTS|CASE|WHEN|THEN|ELSE|END|IS)\b/gi },
    html: { name: 'HTML', keywords: /(&lt;\/?)([\w-]+)/g },
    css: { name: 'CSS', keywords: /\b(color|background|border|margin|padding|font|display|position|width|height|top|left|right|bottom|flex|grid|transition|transform|animation|opacity|overflow|z-index|text|align|justify|content|items|gap|box-shadow|border-radius)\b/g },
    bash: { name: 'Bash', keywords: /\b(echo|cd|ls|mkdir|rm|cp|mv|cat|grep|find|sed|awk|chmod|chown|sudo|apt|yum|pip|npm|git|docker|curl|wget|export|source|if|then|else|fi|for|do|done|while|case|esac|function|return|exit|read|eval|exec|set|unset|shift|trap|wait|kill)\b/g },
    go: { name: 'Go', keywords: /\b(func|package|import|var|const|type|struct|interface|map|chan|go|defer|return|if|else|for|range|switch|case|default|break|continue|select|fallthrough|goto|make|new|append|len|cap|close|delete|copy|nil|true|false|iota|string|int|float64|bool|error|byte|rune)\b/g },
    rust: { name: 'Rust', keywords: /\b(fn|let|mut|const|static|struct|enum|impl|trait|pub|mod|use|crate|self|super|if|else|for|while|loop|match|return|break|continue|as|in|ref|move|async|await|unsafe|where|type|dyn|Box|Vec|String|Option|Result|Some|None|Ok|Err|true|false|println|macro_rules)\b/g }
};

function highlightCode() {
    const input = document.getElementById('codeInput');
    const output = document.getElementById('codeOutput');
    const langSelect = document.getElementById('codeLang');
    if (!input || !output || !langSelect) return;

    const code = input.value;
    if (!code.trim()) { showToast(t('alert.noContent'), 'warning'); return; }

    const lang = langSelect.value;
    let html = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Highlight strings
    html = html.replace(/(["'`])(?:(?!\1|\\).|\\.)*\1/g, '<span class="code-hl-string">$&</span>');

    // Highlight comments
    html = html.replace(/(\/\/.*$|#.*$)/gm, '<span class="code-hl-comment">$&</span>');
    html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="code-hl-comment">$&</span>');

    // Highlight numbers
    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="code-hl-number">$1</span>');

    // Highlight keywords
    const langDef = codeLanguages[lang];
    if (langDef && langDef.keywords) {
        html = html.replace(langDef.keywords, '<span class="code-hl-keyword">$&</span>');
    }

    output.innerHTML = html;
    document.getElementById('codeOutputContainer').style.display = 'block';

    // Add line numbers
    const lines = code.split('\n');
    const lineNums = lines.map((_, i) => i + 1).join('\n');
    const lineNumEl = document.getElementById('codeLineNums');
    if (lineNumEl) lineNumEl.textContent = lineNums;
}

function copyCodeHtml() {
    const output = document.getElementById('codeOutput');
    if (!output || !output.innerHTML.trim()) { showToast(t('alert.noContent'), 'warning'); return; }

    const style = '<style>.code-hl-keyword{color:#c678dd;font-weight:600}.code-hl-string{color:#98c379}.code-hl-comment{color:#5c6370;font-style:italic}.code-hl-number{color:#d19a66}pre{background:#282c34;color:#abb2bf;padding:1rem;border-radius:8px;font-family:monospace;font-size:14px;overflow-x:auto;line-height:1.6}</style>';
    const html = style + '<pre>' + output.innerHTML + '</pre>';

    navigator.clipboard.writeText(html).then(() => {
        showToast(t('alert.copied'));
    }).catch(err => {
        showToast(t('alert.copyFail') + err, 'error');
    });
}

function downloadCodeImage() {
    const output = document.getElementById('codeOutput');
    if (!output || !output.innerHTML.trim()) { showToast(t('alert.noContent'), 'warning'); return; }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const lines = output.textContent.split('\n');
    const lineHeight = 22;
    const padding = 32;
    const charWidth = 9;
    const maxLineWidth = Math.max(...lines.map(l => l.length)) * charWidth;

    canvas.width = Math.max(maxLineWidth + padding * 2, 600);
    canvas.height = lines.length * lineHeight + padding * 2;

    // Background
    ctx.fillStyle = '#282c34';
    ctx.roundRect(0, 0, canvas.width, canvas.height, 12);
    ctx.fill();

    // Window dots
    ctx.fillStyle = '#ff5f56'; ctx.beginPath(); ctx.arc(20, 18, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffbd2e'; ctx.beginPath(); ctx.arc(38, 18, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#27c93f'; ctx.beginPath(); ctx.arc(56, 18, 6, 0, Math.PI * 2); ctx.fill();

    // Code text
    ctx.font = '14px monospace';
    ctx.fillStyle = '#abb2bf';
    lines.forEach((line, i) => {
        ctx.fillText(line, padding, padding + 16 + i * lineHeight);
    });

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'code-snippet.png';
    a.click();
    showToast(t('alert.downloadSuccess'));
}

function clearCode() {
    const input = document.getElementById('codeInput');
    const output = document.getElementById('codeOutput');
    if (input) input.value = '';
    if (output) output.innerHTML = '';
    const container = document.getElementById('codeOutputContainer');
    if (container) container.style.display = 'none';
}
