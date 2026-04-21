// ==================== Formula Helper ====================

const symbolCategories = {
    greek: {
        label: 'Greek Letters',
        symbols: [
            ['\\alpha','\u03b1'],['\\beta','\u03b2'],['\\gamma','\u03b3'],['\\delta','\u03b4'],['\\epsilon','\u03b5'],
            ['\\zeta','\u03b6'],['\\eta','\u03b7'],['\\theta','\u03b8'],['\\iota','\u03b9'],['\\kappa','\u03ba'],
            ['\\lambda','\u03bb'],['\\mu','\u03bc'],['\\nu','\u03bd'],['\\xi','\u03be'],['\\pi','\u03c0'],
            ['\\rho','\u03c1'],['\\sigma','\u03c3'],['\\tau','\u03c4'],['\\upsilon','\u03c5'],['\\phi','\u03c6'],
            ['\\chi','\u03c7'],['\\psi','\u03c8'],['\\omega','\u03c9'],
            ['\\Gamma','\u0393'],['\\Delta','\u0394'],['\\Theta','\u0398'],['\\Lambda','\u039b'],['\\Xi','\u039e'],
            ['\\Pi','\u03a0'],['\\Sigma','\u03a3'],['\\Phi','\u03a6'],['\\Psi','\u03a8'],['\\Omega','\u03a9']
        ]
    },
    operators: {
        label: 'Operators',
        symbols: [
            ['\\pm','\u00b1'],['\\mp','\u2213'],['\\times','\u00d7'],['\\div','\u00f7'],['\\cdot','\u00b7'],
            ['\\star','\u22c6'],['\\circ','\u2218'],['\\bullet','\u2022'],['\\oplus','\u2295'],['\\otimes','\u2297'],
            ['\\leq','\u2264'],['\\geq','\u2265'],['\\neq','\u2260'],['\\approx','\u2248'],['\\equiv','\u2261'],
            ['\\sim','\u223c'],['\\propto','\u221d'],['\\ll','\u226a'],['\\gg','\u226b'],
            ['\\subset','\u2282'],['\\supset','\u2283'],['\\subseteq','\u2286'],['\\supseteq','\u2287'],
            ['\\in','\u2208'],['\\notin','\u2209'],['\\cup','\u222a'],['\\cap','\u2229'],['\\setminus','\u2216']
        ]
    },
    arrows: {
        label: 'Arrows',
        symbols: [
            ['\\leftarrow','\u2190'],['\\rightarrow','\u2192'],['\\leftrightarrow','\u2194'],
            ['\\Leftarrow','\u21d0'],['\\Rightarrow','\u21d2'],['\\Leftrightarrow','\u21d4'],
            ['\\uparrow','\u2191'],['\\downarrow','\u2193'],['\\updownarrow','\u2195'],
            ['\\mapsto','\u21a6'],['\\hookrightarrow','\u21aa'],['\\nearrow','\u2197'],['\\searrow','\u2198']
        ]
    },
    calculus: {
        label: 'Calculus & Analysis',
        symbols: [
            ['\\sum','\u2211'],['\\prod','\u220f'],['\\int','\u222b'],['\\oint','\u222e'],
            ['\\partial','\u2202'],['\\nabla','\u2207'],['\\infty','\u221e'],
            ['\\lim','lim'],['\\sup','sup'],['\\inf','inf'],['\\max','max'],['\\min','min'],
            ['\\sqrt{}','\u221a'],['\\frac{}{}','a/b'],
            ['\\binom{}{}','C(n,k)']
        ]
    },
    logic: {
        label: 'Logic & Sets',
        symbols: [
            ['\\forall','\u2200'],['\\exists','\u2203'],['\\nexists','\u2204'],
            ['\\neg','\u00ac'],['\\land','\u2227'],['\\lor','\u2228'],['\\implies','\u27f9'],['\\iff','\u27fa'],
            ['\\emptyset','\u2205'],['\\mathbb{R}','\u211d'],['\\mathbb{N}','\u2115'],['\\mathbb{Z}','\u2124'],
            ['\\mathbb{Q}','\u211a'],['\\mathbb{C}','\u2102'],
            ['\\top','\u22a4'],['\\bot','\u22a5'],['\\vdash','\u22a2'],['\\models','\u22a8']
        ]
    },
    accents: {
        label: 'Accents & Decorations',
        symbols: [
            ['\\hat{x}','x\u0302'],['\\bar{x}','x\u0304'],['\\tilde{x}','x\u0303'],['\\vec{x}','x\u20d7'],
            ['\\dot{x}','\u1e8b'],['\\ddot{x}','\u1e8d'],['\\overline{x}','x\u0305'],
            ['\\underline{x}','x\u0332'],['\\overbrace{x}','\u23de'],['\\underbrace{x}','\u23df'],
            ['\\mathbf{x}','\ud835\udc31'],['\\mathcal{X}','\ud835\udcb3'],['\\mathfrak{X}','\ud835\udd1b']
        ]
    },
    structures: {
        label: 'Structures',
        symbols: [
            ['\\begin{matrix}\\end{matrix}', 'matrix'],
            ['\\begin{pmatrix}\\end{pmatrix}', '(matrix)'],
            ['\\begin{bmatrix}\\end{bmatrix}', '[matrix]'],
            ['\\begin{cases}\\end{cases}', 'cases'],
            ['\\begin{aligned}\\end{aligned}', 'aligned'],
            ['\\left(\\right)', '( )'],
            ['\\left[\\right]', '[ ]'],
            ['\\left\\{\\right\\}', '{ }'],
            ['\\left|\\right|', '| |'],
            ['\\left\\|\\right\\|', '\u2016 \u2016']
        ]
    }
};

function renderSymbolPalette() {
    const container = document.getElementById('symbolPalette');
    if (!container) return;

    let html = '';
    Object.keys(symbolCategories).forEach(catKey => {
        const cat = symbolCategories[catKey];
        html += '<div class="symbol-category">';
        html += '<h4 data-i18n="formula.cat.' + catKey + '">' + cat.label + '</h4>';
        html += '<div class="symbol-grid">';
        cat.symbols.forEach(([latex, display]) => {
            html += '<button class="symbol-btn" onclick="insertSymbol(\'' + latex.replace(/'/g, "\\'").replace(/\\/g, '\\\\') + '\')" title="' + latex + '">' + display + '</button>';
        });
        html += '</div></div>';
    });
    container.innerHTML = html;
}

function insertSymbol(latex) {
    const input = document.getElementById('formulaInput');
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const before = input.value.substring(0, start);
    const after = input.value.substring(end);

    input.value = before + latex + after;

    // Position cursor inside braces if present
    const braceIdx = latex.indexOf('{}');
    if (braceIdx !== -1) {
        input.selectionStart = input.selectionEnd = start + braceIdx + 1;
    } else {
        input.selectionStart = input.selectionEnd = start + latex.length;
    }
    input.focus();
    renderFormulaPreview();
}

function renderFormulaPreview() {
    const input = document.getElementById('formulaInput');
    const preview = document.getElementById('formulaPreview');
    if (!input || !preview) return;

    const text = input.value.trim();
    if (!text) {
        preview.innerHTML = '<p class="preview-placeholder">' + t('formula.preview.placeholder') + '</p>';
        return;
    }

    let content = text;
    if (!content.includes('$$') && !content.includes('\\[') && !content.includes('\\(')) {
        content = '$$' + content + '$$';
    }
    preview.textContent = content;

    if (window.MathJax && window.MathJax.typesetPromise) {
        MathJax.typesetPromise([preview]).catch(err => {
            preview.innerHTML = '<p style="color:red;">' + t('alert.renderError') + err.message + '</p>';
        });
    }
}

function copyFormula() {
    const input = document.getElementById('formulaInput');
    if (!input || !input.value.trim()) { showToast(t('alert.noContent'), 'warning'); return; }
    navigator.clipboard.writeText(input.value).then(() => {
        showToast(t('alert.copied'));
    }).catch(err => {
        showToast(t('alert.copyFail') + err, 'error');
    });
}

function clearFormula() {
    const input = document.getElementById('formulaInput');
    const preview = document.getElementById('formulaPreview');
    if (input) input.value = '';
    if (preview) preview.innerHTML = '<p class="preview-placeholder">' + t('formula.preview.placeholder') + '</p>';
}

document.addEventListener('DOMContentLoaded', renderSymbolPalette);
