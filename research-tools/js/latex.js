// ==================== LaTeX Formatter ====================

let previewTimeout = null;

function formatLatex() {
    const input = document.getElementById('latexInput').value;
    const output = document.getElementById('latexOutput');

    if (!input.trim()) {
        output.textContent = t('alert.inputLatex');
        return;
    }

    try {
        let formatted = input;
        let indentLevel = 0;
        const lines = formatted.split('\n');
        const formattedLines = [];

        for (let line of lines) {
            const trimmed = line.trim();
            if (trimmed === '') { formattedLines.push(''); continue; }
            if (trimmed.startsWith('\\end{') || trimmed === '}') {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            const indent = '  '.repeat(indentLevel);
            formattedLines.push(indent + trimmed);
            if (trimmed.startsWith('\\begin{') || trimmed === '{') {
                indentLevel++;
            }
        }

        formatted = formattedLines.join('\n');
        formatted = formatted.replace(/\\begin\{/g, '\n\\begin{');
        formatted = formatted.replace(/\\end\{/g, '\\end{');
        formatted = formatted.replace(/\n\n\n+/g, '\n\n');

        output.textContent = formatted.trim();
        highlightLatexOutput();
    } catch (error) {
        output.textContent = t('alert.formatError') + error.message;
    }
}

function renderLatexPreview() {
    const input = document.getElementById('latexInput').value;
    const preview = document.getElementById('latexPreview');

    if (!input.trim()) {
        preview.innerHTML = '<p class="preview-placeholder">' + t('latex.preview.placeholder') + '</p>';
        return;
    }

    let content = input;
    if (!content.includes('$$') && !content.includes('\\[') && !content.includes('\\(')) {
        content = '$$\n' + content + '\n$$';
    }
    preview.textContent = content;

    if (window.MathJax) {
        MathJax.typesetPromise([preview]).catch((err) => {
            preview.innerHTML = '<p style="color: red;">' + t('alert.renderError') + err.message + '</p>';
        });
    } else {
        preview.innerHTML = '<p style="color: orange;">' + t('alert.loadingMathJax') + '</p>';
        setTimeout(renderLatexPreview, 1000);
    }
}

function toggleAutoPreview() {
    autoPreviewEnabled = !autoPreviewEnabled;
    const btn = document.getElementById('autoPreviewBtn');
    if (autoPreviewEnabled) {
        btn.textContent = t('latex.btn.autopreview.off');
        btn.style.background = '#e74c3c';
        renderLatexPreview();
    } else {
        btn.textContent = t('latex.btn.autopreview.on');
        btn.style.background = '';
    }
}

function clearLatex() {
    const input = document.getElementById('latexInput');
    const output = document.getElementById('latexOutput');
    const preview = document.getElementById('latexPreview');
    if (input) input.value = '';
    if (output) output.textContent = t('latex.output.placeholder');
    if (preview) preview.innerHTML = '<p class="preview-placeholder">' + t('latex.preview.placeholder') + '</p>';
}

function copyLatex() {
    const output = document.getElementById('latexOutput').textContent;
    if (output === t('latex.output.placeholder') || output === t('alert.inputLatex')) {
        showToast(t('alert.noContent'), 'warning');
        return;
    }
    navigator.clipboard.writeText(output).then(() => {
        showToast(t('alert.copied'));
    }).catch(err => {
        showToast(t('alert.copyFail') + err, 'error');
    });
}

// ==================== LaTeX Syntax Highlighting ====================

function highlightLatexOutput() {
    const output = document.getElementById('latexOutput');
    if (!output) return;
    const text = output.textContent;
    const highlighted = text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/(%.+)/g, '<span class="latex-hl-comment">$1</span>')
        .replace(/(\\begin\{[^}]+\}|\\end\{[^}]+\})/g, '<span class="latex-hl-env">$1</span>')
        .replace(/(\\[a-zA-Z]+)/g, '<span class="latex-hl-cmd">$1</span>')
        .replace(/(\{|\})/g, '<span class="latex-hl-brace">$1</span>')
        .replace(/(\$\$?)/g, '<span class="latex-hl-math">$1</span>');
    output.innerHTML = highlighted;
}

// ==================== LaTeX Template Library ====================

const latexTemplates = {
    equation: '\\begin{equation}\n  E = mc^2\n\\end{equation}',
    align: '\\begin{align}\n  f(x) &= x^2 + 2x + 1 \\\\\n       &= (x + 1)^2\n\\end{align}',
    matrix: '\\begin{pmatrix}\n  a & b \\\\\n  c & d\n\\end{pmatrix}',
    fraction: '\\frac{\\partial f}{\\partial x} = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}',
    integral: '\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)',
    sum: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
    cases: '|x| = \\begin{cases}\n  x & \\text{if } x \\geq 0 \\\\\n  -x & \\text{if } x < 0\n\\end{cases}',
    table: '\\begin{table}[htbp]\n  \\centering\n  \\caption{Table Title}\n  \\label{tab:example}\n  \\begin{tabular}{lcc}\n    \\hline\n    Item & Value 1 & Value 2 \\\\\n    \\hline\n    A & 1.0 & 2.0 \\\\\n    B & 3.0 & 4.0 \\\\\n    \\hline\n  \\end{tabular}\n\\end{table}',
    figure: '\\begin{figure}[htbp]\n  \\centering\n  \\includegraphics[width=0.8\\textwidth]{figure.png}\n  \\caption{Figure Title}\n  \\label{fig:example}\n\\end{figure}',
    article: '\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amsmath}\n\\usepackage{graphicx}\n\n\\title{Paper Title}\n\\author{Author Name}\n\\date{\\today}\n\n\\begin{document}\n\n\\maketitle\n\n\\begin{abstract}\nYour abstract here.\n\\end{abstract}\n\n\\section{Introduction}\nIntroduction text.\n\n\\section{Methods}\nMethods description.\n\n\\section{Results}\nResults description.\n\n\\section{Conclusion}\nConclusion text.\n\n\\bibliographystyle{plain}\n\\bibliography{references}\n\n\\end{document}',
    beamer: '\\documentclass{beamer}\n\\usetheme{Madrid}\n\\usepackage[utf8]{inputenc}\n\n\\title{Presentation Title}\n\\author{Author Name}\n\\date{\\today}\n\n\\begin{document}\n\n\\begin{frame}\n  \\titlepage\n\\end{frame}\n\n\\begin{frame}{Outline}\n  \\tableofcontents\n\\end{frame}\n\n\\section{Introduction}\n\\begin{frame}{Introduction}\n  \\begin{itemize}\n    \\item Point 1\n    \\item Point 2\n    \\item Point 3\n  \\end{itemize}\n\\end{frame}\n\n\\section{Results}\n\\begin{frame}{Results}\n  Your results here.\n\\end{frame}\n\n\\end{document}',
    letter: '\\documentclass{letter}\n\\usepackage[utf8]{inputenc}\n\n\\signature{Your Name}\n\\address{Your Address}\n\n\\begin{document}\n\n\\begin{letter}{Recipient Name \\\\ Recipient Address}\n\n\\opening{Dear Sir/Madam,}\n\nLetter body text.\n\n\\closing{Sincerely,}\n\n\\end{letter}\n\\end{document}',
    algorithm: '\\begin{algorithm}[H]\n  \\caption{Algorithm Name}\n  \\label{alg:example}\n  \\begin{algorithmic}[1]\n    \\Require Input data $X$\n    \\Ensure Output result $Y$\n    \\State Initialize $Y \\gets 0$\n    \\For{$i = 1$ to $n$}\n      \\If{$X_i > 0$}\n        \\State $Y \\gets Y + X_i$\n      \\EndIf\n    \\EndFor\n    \\Return $Y$\n  \\end{algorithmic}\n\\end{algorithm}',
    tikz: '\\begin{tikzpicture}\n  \\draw[->] (0,0) -- (4,0) node[right] {$x$};\n  \\draw[->] (0,0) -- (0,3) node[above] {$y$};\n  \\draw[blue, thick, domain=0:3.5] plot (\\x, {0.5*\\x*\\x}) node[right] {$f(x) = \\frac{x^2}{2}$};\n\\end{tikzpicture}'
};

function insertTemplate(key) {
    const input = document.getElementById('latexInput');
    if (!input) return;
    const template = latexTemplates[key];
    if (!template) return;

    // Insert at cursor position
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    const before = text.substring(0, start);
    const after = text.substring(end);

    input.value = before + (before && !before.endsWith('\n') ? '\n' : '') + template + (after && !after.startsWith('\n') ? '\n' : '') + after;
    input.selectionStart = input.selectionEnd = start + template.length + 1;
    input.focus();

    // Save and trigger preview
    localStorage.setItem('latexInput', input.value);
    if (autoPreviewEnabled) {
        clearTimeout(previewTimeout);
        previewTimeout = setTimeout(renderLatexPreview, 500);
    }
    showToast(t('latex.template.inserted'));
}

function toggleTemplatePanel() {
    const panel = document.getElementById('templatePanel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
}

// ==================== BibTeX Formatter ====================

function formatBibtex() {
    const input = document.getElementById('latexInput').value;
    if (!input.trim()) { showToast(t('alert.noContent'), 'warning'); return; }

    try {
        let formatted = input;
        // Normalize entry types
        formatted = formatted.replace(/@(\w+)\s*\{/gi, function(match, type) {
            return '@' + type.toLowerCase() + '{';
        });

        // Format fields with consistent indentation
        const entries = [];
        let current = '';
        let braceDepth = 0;

        for (let i = 0; i < formatted.length; i++) {
            const ch = formatted[i];
            current += ch;
            if (ch === '{') braceDepth++;
            if (ch === '}') {
                braceDepth--;
                if (braceDepth === 0) {
                    entries.push(current.trim());
                    current = '';
                }
            }
        }
        if (current.trim()) entries.push(current.trim());

        const result = entries.map(entry => {
            // Match entry type and key
            const headerMatch = entry.match(/^(@\w+)\{([^,]*),/);
            if (!headerMatch) return entry;

            const entryType = headerMatch[1];
            const entryKey = headerMatch[2].trim();

            // Extract fields
            let body = entry.substring(headerMatch[0].length);
            body = body.replace(/\}$/, '').trim();

            // Split fields by comma (respecting braces)
            const fields = [];
            let field = '';
            let depth = 0;
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

            // Format each field
            const formattedFields = fields.map(f => {
                const eqIdx = f.indexOf('=');
                if (eqIdx === -1) return '  ' + f;
                const key = f.substring(0, eqIdx).trim().toLowerCase();
                let value = f.substring(eqIdx + 1).trim();
                return '  ' + key.padEnd(12) + ' = ' + value;
            });

            return entryType + '{' + entryKey + ',\n' + formattedFields.join(',\n') + '\n}';
        }).join('\n\n');

        const output = document.getElementById('latexOutput');
        if (output) {
            output.textContent = result;
            highlightLatexOutput();
        }
    } catch (err) {
        showToast(t('alert.formatError') + err.message, 'error');
    }
}

// Keyboard shortcut: Ctrl/Cmd + K for format
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const currentSection = document.querySelector('.section.active');
        if (currentSection && currentSection.id === 'latex') {
            formatLatex();
        }
    }
});

// Auto-save LaTeX input to localStorage and trigger auto-preview
document.addEventListener('DOMContentLoaded', function() {
    const latexInput = document.getElementById('latexInput');
    if (latexInput) {
        const savedLatex = localStorage.getItem('latexInput');
        if (savedLatex) {
            latexInput.value = savedLatex;
        }
        latexInput.addEventListener('input', function() {
            localStorage.setItem('latexInput', this.value);
            if (autoPreviewEnabled) {
                clearTimeout(previewTimeout);
                previewTimeout = setTimeout(() => {
                    renderLatexPreview();
                }, 500);
            }
        });
    }
});
