// ==================== i18n System ====================

let currentLang = localStorage.getItem('lang') || 'zh';

const translations = {
    zh: {
        // Header
        'site.title': '科研工具集',
        'site.subtitle': 'Research Tools Hub - 提升科研效率的工具集合',
        // Nav
        'nav.home': '首页',
        'nav.latex': 'LaTeX工具',
        'nav.svg': 'SVG编辑器',
        'nav.models': '神经网络模型库',
        'nav.resources': '科研资源',
        // Home
        'home.welcome': '欢迎使用科研工具集',
        'home.latex.title': '📝 LaTeX格式化工具',
        'home.latex.desc': '格式化、美化和预览LaTeX代码',
        'home.svg.title': '🎨 SVG图片编辑器',
        'home.svg.desc': '在线创建和编辑SVG矢量图形',
        'home.models.title': '🧠 神经网络模型库',
        'home.models.desc': '常见神经网络架构图示例',
        'home.resources.title': '📚 科研资源导航',
        'home.resources.desc': '论文、会议、期刊等资源整合',
        // LaTeX
        'latex.heading': 'LaTeX 格式化工具',
        'latex.input.heading': '输入LaTeX代码',
        'latex.input.placeholder': '在此输入LaTeX代码...\n\n示例:\n\\begin{equation}\nE = mc^2\n\\end{equation}\n\n\\begin{align}\n\\nabla \\times \\mathbf{E} &= -\\frac{\\partial \\mathbf{B}}{\\partial t} \\\\\n\\nabla \\times \\mathbf{B} &= \\mu_0\\mathbf{J} + \\mu_0\\epsilon_0\\frac{\\partial \\mathbf{E}}{\\partial t}\n\\end{align}',
        'latex.btn.format': '格式化代码',
        'latex.btn.clear': '清空',
        'latex.btn.copy': '复制结果',
        'latex.output.heading': '格式化结果',
        'latex.output.placeholder': '格式化后的代码将显示在这里...',
        'latex.preview.heading': '实时预览',
        'latex.preview.placeholder': '数学公式预览将显示在这里...',
        'latex.btn.render': '渲染预览',
        'latex.btn.autopreview.on': '开启自动预览',
        'latex.btn.autopreview.off': '关闭自动预览',
        'latex.tips.heading': '常用LaTeX命令参考',
        'latex.tip.frac': '分数:',
        'latex.tip.sup': '上下标:',
        'latex.tip.greek': '希腊字母:',
        'latex.tip.sum': '求和:',
        'latex.tip.int': '积分:',
        'latex.tip.matrix': '矩阵:',
        // SVG
        'svg.heading': 'SVG 图片编辑器',
        'svg.toolbar': '工具栏',
        'svg.btn.rect': '矩形',
        'svg.btn.circle': '圆形',
        'svg.btn.line': '直线',
        'svg.btn.text': '文本',
        'svg.btn.arrow': '箭头',
        'svg.label.fill': '填充色:',
        'svg.label.stroke': '边框色:',
        'svg.label.strokewidth': '边框宽度:',
        'svg.btn.clear': '清空画布',
        'svg.btn.download': '下载SVG',
        'svg.btn.code': '查看代码',
        'svg.canvas': '画布',
        'svg.layers': '图层管理',
        'svg.layers.empty': '暂无图层',
        'svg.btn.delete': '删除选中',
        'svg.btn.moveup': '上移',
        'svg.btn.movedown': '下移',
        'svg.code.heading': 'SVG代码',
        'svg.btn.copycode': '复制代码',
        'svg.btn.close': '关闭',
        // Models
        'models.heading': '神经网络模型库',
        'models.cnn.title': '卷积神经网络 (CNN)',
        'models.cnn.desc': '经典卷积神经网络架构，包含卷积层、池化层和全连接层',
        'models.rnn.title': '循环神经网络 (RNN)',
        'models.rnn.desc': '循环神经网络结构，展示时间步之间的循环连接',
        'models.transformer.title': 'Transformer 架构',
        'models.transformer.desc': 'Transformer架构，包含编码器和解码器，使用注意力机制',
        'models.gan.title': '生成对抗网络 (GAN)',
        'models.gan.desc': '生成对抗网络，生成器和判别器相互博弈训练',
        'models.btn.download': '下载此模型图',
        // Resources
        'resources.heading': '科研资源导航',
        'resources.search.title': '🔍 论文搜索与下载',
        'resources.datasets.title': '📊 数据集与代码',
        'resources.conferences.title': '📅 学术会议',
        'resources.journals.title': '📖 期刊与出版物',
        'resources.tools.title': '🛠️ 科研工具',
        'resources.scholar.desc': '最全面的学术搜索引擎',
        'resources.arxiv.desc': '物理、数学、计算机科学预印本',
        'resources.semantic.desc': 'AI驱动的学术搜索',
        'resources.researchgate.desc': '学术社交网络平台',
        'resources.pubmed.desc': '生物医学文献数据库',
        'resources.ieee.desc': '电气电子工程师学会数字图书馆',
        'resources.kaggle.desc': '机器学习数据集平台',
        'resources.github.desc': '开源代码托管平台',
        'resources.pwc.desc': '论文与代码实现对照',
        'resources.hf.desc': 'NLP和ML数据集',
        'resources.tfds.desc': 'TensorFlow官方数据集',
        'resources.neurips.desc': '神经信息处理系统大会',
        'resources.icml.desc': '国际机器学习大会',
        'resources.cvpr.desc': '计算机视觉与模式识别会议',
        'resources.iclr.desc': '国际学习表征会议',
        'resources.aaai.desc': '人工智能促进协会会议',
        'resources.nature.desc': '自然科学综合性期刊',
        'resources.science.desc': '科学综合性期刊',
        'resources.cell.desc': '生命科学期刊',
        'resources.jmlr.desc': '机器学习研究期刊',
        'resources.overleaf.desc': '在线LaTeX编辑器',
        'resources.zotero.desc': '文献管理工具',
        'resources.mendeley.desc': '文献管理与学术社交',
        'resources.connectedpapers.desc': '论文关系图谱可视化',
        'resources.scispace.desc': 'AI论文阅读助手',
        // Footer
        'footer.text': '© 2025 科研工具集 Research Tools Hub | 提升科研效率',
        // JS alerts & prompts
        'alert.noContent': '没有可复制的内容',
        'alert.copied': '已复制到剪贴板!',
        'alert.copyFail': '复制失败: ',
        'alert.svgCopied': 'SVG代码已复制到剪贴板!',
        'alert.clearCanvas': '确定要清空画布吗?',
        'alert.selectLayer': '请先选择一个图层',
        'alert.deleteLayer': '确定要删除选中的图层吗?',
        'alert.downloadSuccess': '下载成功!',
        'prompt.text': '请输入文本内容:',
        'prompt.textDefault': '示例文本',
        'alert.inputLatex': '请输入LaTeX代码...',
        'alert.renderError': '渲染错误: ',
        'alert.loadingMathJax': '正在加载MathJax，请稍候...',
        'alert.formatError': '格式化出错: ',
        // Layer names
        'layer.rect': '矩形',
        'layer.circle': '圆形',
        'layer.line': '直线',
        'layer.arrow': '箭头',
    },
    en: {
        // Header
        'site.title': 'Research Tools Hub',
        'site.subtitle': 'A Collection of Tools to Boost Research Productivity',
        // Nav
        'nav.home': 'Home',
        'nav.latex': 'LaTeX Tools',
        'nav.svg': 'SVG Editor',
        'nav.models': 'Neural Network Models',
        'nav.resources': 'Resources',
        // Home
        'home.welcome': 'Welcome to Research Tools Hub',
        'home.latex.title': '📝 LaTeX Formatter',
        'home.latex.desc': 'Format, beautify, and preview LaTeX code',
        'home.svg.title': '🎨 SVG Image Editor',
        'home.svg.desc': 'Create and edit SVG vector graphics online',
        'home.models.title': '🧠 Neural Network Models',
        'home.models.desc': 'Common neural network architecture diagrams',
        'home.resources.title': '📚 Research Resources',
        'home.resources.desc': 'Papers, conferences, journals and more',
        // LaTeX
        'latex.heading': 'LaTeX Formatter',
        'latex.input.heading': 'Input LaTeX Code',
        'latex.input.placeholder': 'Enter LaTeX code here...\n\nExample:\n\\begin{equation}\nE = mc^2\n\\end{equation}\n\n\\begin{align}\n\\nabla \\times \\mathbf{E} &= -\\frac{\\partial \\mathbf{B}}{\\partial t} \\\\\n\\nabla \\times \\mathbf{B} &= \\mu_0\\mathbf{J} + \\mu_0\\epsilon_0\\frac{\\partial \\mathbf{E}}{\\partial t}\n\\end{align}',
        'latex.btn.format': 'Format Code',
        'latex.btn.clear': 'Clear',
        'latex.btn.copy': 'Copy Result',
        'latex.output.heading': 'Formatted Result',
        'latex.output.placeholder': 'Formatted code will appear here...',
        'latex.preview.heading': 'Live Preview',
        'latex.preview.placeholder': 'Math formula preview will appear here...',
        'latex.btn.render': 'Render Preview',
        'latex.btn.autopreview.on': 'Enable Auto Preview',
        'latex.btn.autopreview.off': 'Disable Auto Preview',
        'latex.tips.heading': 'Common LaTeX Commands Reference',
        'latex.tip.frac': 'Fraction:',
        'latex.tip.sup': 'Super/Subscript:',
        'latex.tip.greek': 'Greek Letters:',
        'latex.tip.sum': 'Summation:',
        'latex.tip.int': 'Integral:',
        'latex.tip.matrix': 'Matrix:',
        // SVG
        'svg.heading': 'SVG Image Editor',
        'svg.toolbar': 'Toolbar',
        'svg.btn.rect': 'Rectangle',
        'svg.btn.circle': 'Circle',
        'svg.btn.line': 'Line',
        'svg.btn.text': 'Text',
        'svg.btn.arrow': 'Arrow',
        'svg.label.fill': 'Fill Color:',
        'svg.label.stroke': 'Stroke Color:',
        'svg.label.strokewidth': 'Stroke Width:',
        'svg.btn.clear': 'Clear Canvas',
        'svg.btn.download': 'Download SVG',
        'svg.btn.code': 'View Code',
        'svg.canvas': 'Canvas',
        'svg.layers': 'Layer Manager',
        'svg.layers.empty': 'No layers yet',
        'svg.btn.delete': 'Delete Selected',
        'svg.btn.moveup': 'Move Up',
        'svg.btn.movedown': 'Move Down',
        'svg.code.heading': 'SVG Code',
        'svg.btn.copycode': 'Copy Code',
        'svg.btn.close': 'Close',
        // Models
        'models.heading': 'Neural Network Model Gallery',
        'models.cnn.title': 'Convolutional Neural Network (CNN)',
        'models.cnn.desc': 'Classic CNN architecture with convolutional, pooling, and fully connected layers',
        'models.rnn.title': 'Recurrent Neural Network (RNN)',
        'models.rnn.desc': 'RNN structure showing recurrent connections across time steps',
        'models.transformer.title': 'Transformer Architecture',
        'models.transformer.desc': 'Transformer with encoder and decoder using attention mechanism',
        'models.gan.title': 'Generative Adversarial Network (GAN)',
        'models.gan.desc': 'GAN with generator and discriminator trained adversarially',
        'models.btn.download': 'Download Model Diagram',
        // Resources
        'resources.heading': 'Research Resources',
        'resources.search.title': '🔍 Paper Search & Download',
        'resources.datasets.title': '📊 Datasets & Code',
        'resources.conferences.title': '📅 Academic Conferences',
        'resources.journals.title': '📖 Journals & Publications',
        'resources.tools.title': '🛠️ Research Tools',
        'resources.scholar.desc': 'Most comprehensive academic search engine',
        'resources.arxiv.desc': 'Physics, Math, CS preprints',
        'resources.semantic.desc': 'AI-powered academic search',
        'resources.researchgate.desc': 'Academic social network',
        'resources.pubmed.desc': 'Biomedical literature database',
        'resources.ieee.desc': 'IEEE digital library',
        'resources.kaggle.desc': 'Machine learning datasets platform',
        'resources.github.desc': 'Open-source code hosting platform',
        'resources.pwc.desc': 'Papers matched with code implementations',
        'resources.hf.desc': 'NLP and ML datasets',
        'resources.tfds.desc': 'Official TensorFlow datasets',
        'resources.neurips.desc': 'Neural Information Processing Systems',
        'resources.icml.desc': 'International Conference on Machine Learning',
        'resources.cvpr.desc': 'Computer Vision and Pattern Recognition',
        'resources.iclr.desc': 'International Conference on Learning Representations',
        'resources.aaai.desc': 'Association for the Advancement of AI',
        'resources.nature.desc': 'Multidisciplinary science journal',
        'resources.science.desc': 'Comprehensive science journal',
        'resources.cell.desc': 'Life sciences journal',
        'resources.jmlr.desc': 'Journal of Machine Learning Research',
        'resources.overleaf.desc': 'Online LaTeX editor',
        'resources.zotero.desc': 'Reference management tool',
        'resources.mendeley.desc': 'Reference management & academic social network',
        'resources.connectedpapers.desc': 'Paper citation graph visualization',
        'resources.scispace.desc': 'AI-powered paper reading assistant',
        // Footer
        'footer.text': '© 2025 Research Tools Hub | Boosting Research Productivity',
        // JS alerts & prompts
        'alert.noContent': 'Nothing to copy',
        'alert.copied': 'Copied to clipboard!',
        'alert.copyFail': 'Copy failed: ',
        'alert.svgCopied': 'SVG code copied to clipboard!',
        'alert.clearCanvas': 'Are you sure you want to clear the canvas?',
        'alert.selectLayer': 'Please select a layer first',
        'alert.deleteLayer': 'Are you sure you want to delete the selected layer?',
        'alert.downloadSuccess': 'Downloaded!',
        'prompt.text': 'Enter text content:',
        'prompt.textDefault': 'Sample text',
        'alert.inputLatex': 'Please enter LaTeX code...',
        'alert.renderError': 'Render error: ',
        'alert.loadingMathJax': 'Loading MathJax, please wait...',
        'alert.formatError': 'Format error: ',
        // Layer names
        'layer.rect': 'Rectangle',
        'layer.circle': 'Circle',
        'layer.line': 'Line',
        'layer.arrow': 'Arrow',
    }
};

function t(key) {
    return translations[currentLang][key] || translations['zh'][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = t(key);
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
            el.placeholder = text;
        } else {
            el.textContent = text;
        }
    });

    // Update the auto-preview button text
    const autoBtn = document.getElementById('autoPreviewBtn');
    if (autoBtn) {
        autoBtn.textContent = autoPreviewEnabled ? t('latex.btn.autopreview.off') : t('latex.btn.autopreview.on');
    }

    // Update toggle button
    const langBtn = document.getElementById('langToggle');
    if (langBtn) {
        langBtn.textContent = lang === 'zh' ? '🌐 EN' : '🌐 中文';
    }

    // Update layers list
    if (typeof updateLayersList === 'function') {
        updateLayersList();
    }
}

function toggleLanguage() {
    setLanguage(currentLang === 'zh' ? 'en' : 'zh');
}

// ==================== Navigation ====================

// Navigation functionality
function navigateTo(sectionId) {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    sections.forEach(section => {
        section.classList.remove('active');
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');
    const targetLink = document.querySelector(`a[href="#${sectionId}"]`);
    if (targetLink) {
        targetLink.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            navigateTo(sectionId);
        });
    });
});

// ==================== LaTeX Formatter ====================

let autoPreviewEnabled = false;
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

        // Add proper indentation
        let indentLevel = 0;
        const lines = formatted.split('\n');
        const formattedLines = [];

        for (let line of lines) {
            const trimmed = line.trim();

            if (trimmed === '') {
                formattedLines.push('');
                continue;
            }

            // Decrease indent for end tags
            if (trimmed.startsWith('\\end{') || trimmed === '}') {
                indentLevel = Math.max(0, indentLevel - 1);
            }

            // Add indentation
            const indent = '  '.repeat(indentLevel);
            formattedLines.push(indent + trimmed);

            // Increase indent for begin tags
            if (trimmed.startsWith('\\begin{') || trimmed === '{') {
                indentLevel++;
            }
        }

        formatted = formattedLines.join('\n');

        // Add spacing around environments
        formatted = formatted.replace(/\\begin\{/g, '\n\\begin{');
        formatted = formatted.replace(/\\end\{/g, '\\end{');

        // Clean up multiple blank lines
        formatted = formatted.replace(/\n\n\n+/g, '\n\n');

        output.textContent = formatted.trim();
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

    // Wrap content for MathJax rendering
    let content = input;

    // If content doesn't have math delimiters, wrap it
    if (!content.includes('$$') && !content.includes('\\[') && !content.includes('\\(')) {
        content = '$$\n' + content + '\n$$';
    }

    preview.innerHTML = content;

    // Render with MathJax if available
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
    document.getElementById('latexInput').value = '';
    document.getElementById('latexOutput').textContent = t('latex.output.placeholder');
    document.getElementById('latexPreview').innerHTML = '<p class="preview-placeholder">' + t('latex.preview.placeholder') + '</p>';
}

function copyLatex() {
    const output = document.getElementById('latexOutput').textContent;

    if (output === t('latex.output.placeholder') || output === t('alert.inputLatex')) {
        alert(t('alert.noContent'));
        return;
    }

    navigator.clipboard.writeText(output).then(() => {
        alert(t('alert.copied'));
    }).catch(err => {
        alert(t('alert.copyFail') + err);
    });
}

// ==================== SVG Editor ====================

let svgElementCounter = 0;
let selectedLayer = null;

function svgAddRect() {
    const svg = document.getElementById('svgCanvas');
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

    const x = 50 + Math.random() * 200;
    const y = 50 + Math.random() * 200;

    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', 100);
    rect.setAttribute('height', 80);
    rect.setAttribute('fill', document.getElementById('fillColor').value);
    rect.setAttribute('stroke', document.getElementById('strokeColor').value);
    rect.setAttribute('stroke-width', document.getElementById('strokeWidth').value);
    rect.setAttribute('id', 'rect-' + svgElementCounter++);
    rect.setAttribute('data-layer-name', t('layer.rect') + ' ' + svgElementCounter);

    makeDraggable(rect);
    svg.appendChild(rect);
    updateLayersList();
}

function svgAddCircle() {
    const svg = document.getElementById('svgCanvas');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

    const cx = 100 + Math.random() * 200;
    const cy = 100 + Math.random() * 200;

    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', 50);
    circle.setAttribute('fill', document.getElementById('fillColor').value);
    circle.setAttribute('stroke', document.getElementById('strokeColor').value);
    circle.setAttribute('stroke-width', document.getElementById('strokeWidth').value);
    circle.setAttribute('id', 'circle-' + svgElementCounter++);
    circle.setAttribute('data-layer-name', t('layer.circle') + ' ' + svgElementCounter);

    makeDraggable(circle);
    svg.appendChild(circle);
    updateLayersList();
}

function svgAddLine() {
    const svg = document.getElementById('svgCanvas');
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

    const x1 = 50 + Math.random() * 200;
    const y1 = 50 + Math.random() * 200;

    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x1 + 100);
    line.setAttribute('y2', y1 + 50);
    line.setAttribute('stroke', document.getElementById('strokeColor').value);
    line.setAttribute('stroke-width', document.getElementById('strokeWidth').value);
    line.setAttribute('id', 'line-' + svgElementCounter++);
    line.setAttribute('data-layer-name', t('layer.line') + ' ' + svgElementCounter);

    svg.appendChild(line);
    updateLayersList();
}

function svgAddText() {
    const svg = document.getElementById('svgCanvas');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    const x = 100 + Math.random() * 200;
    const y = 100 + Math.random() * 200;

    const textContent = prompt(t('prompt.text'), t('prompt.textDefault'));
    if (!textContent) return;

    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('fill', document.getElementById('fillColor').value);
    text.setAttribute('font-size', '20');
    text.setAttribute('font-family', 'Arial, sans-serif');
    text.setAttribute('id', 'text-' + svgElementCounter++);
    text.setAttribute('data-layer-name', textContent.substring(0, 10) + (textContent.length > 10 ? '...' : ''));
    text.textContent = textContent;

    makeDraggable(text);
    svg.appendChild(text);
    updateLayersList();
}

function svgAddArrow() {
    const svg = document.getElementById('svgCanvas');

    // Create arrow marker if not exists
    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.appendChild(defs);
    }

    const markerId = 'arrowhead-' + svgElementCounter;
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', markerId);
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3, 0 6');
    polygon.setAttribute('fill', document.getElementById('strokeColor').value);

    marker.appendChild(polygon);
    defs.appendChild(marker);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

    const x1 = 50 + Math.random() * 200;
    const y1 = 50 + Math.random() * 200;

    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x1 + 150);
    line.setAttribute('y2', y1 + 50);
    line.setAttribute('stroke', document.getElementById('strokeColor').value);
    line.setAttribute('stroke-width', document.getElementById('strokeWidth').value);
    line.setAttribute('marker-end', `url(#${markerId})`);
    line.setAttribute('id', 'arrow-' + svgElementCounter++);
    line.setAttribute('data-layer-name', t('layer.arrow') + ' ' + svgElementCounter);

    svg.appendChild(line);
    updateLayersList();
}

function makeDraggable(element) {
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    element.style.cursor = 'move';

    element.addEventListener('mousedown', function(e) {
        isDragging = true;

        const CTM = element.getScreenCTM();
        if (element.tagName === 'circle') {
            offset.x = (e.clientX - CTM.e) - parseFloat(element.getAttribute('cx'));
            offset.y = (e.clientY - CTM.f) - parseFloat(element.getAttribute('cy'));
        } else if (element.tagName === 'rect') {
            offset.x = (e.clientX - CTM.e) - parseFloat(element.getAttribute('x'));
            offset.y = (e.clientY - CTM.f) - parseFloat(element.getAttribute('y'));
        } else if (element.tagName === 'text') {
            offset.x = (e.clientX - CTM.e) - parseFloat(element.getAttribute('x'));
            offset.y = (e.clientY - CTM.f) - parseFloat(element.getAttribute('y'));
        }

        e.preventDefault();
    });

    const svg = document.getElementById('svgCanvas');
    svg.addEventListener('mousemove', function(e) {
        if (!isDragging) return;

        const CTM = element.getScreenCTM();
        const x = e.clientX - CTM.e - offset.x;
        const y = e.clientY - CTM.f - offset.y;

        if (element.tagName === 'circle') {
            element.setAttribute('cx', x);
            element.setAttribute('cy', y);
        } else if (element.tagName === 'rect') {
            element.setAttribute('x', x);
            element.setAttribute('y', y);
        } else if (element.tagName === 'text') {
            element.setAttribute('x', x);
            element.setAttribute('y', y);
        }
    });

    svg.addEventListener('mouseup', function() {
        isDragging = false;
    });
}

function svgClear() {
    if (confirm(t('alert.clearCanvas'))) {
        const svg = document.getElementById('svgCanvas');
        while (svg.lastChild) {
            svg.removeChild(svg.lastChild);
        }
        svgElementCounter = 0;
        selectedLayer = null;
        updateLayersList();
    }
}

function svgDownload() {
    const svg = document.getElementById('svgCanvas');
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'drawing.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function svgShowCode() {
    const svg = document.getElementById('svgCanvas');
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svg);

    // Format the SVG string
    svgString = svgString.replace(/></g, '>\n<');

    document.getElementById('svgCodeOutput').value = svgString;
    document.getElementById('svgCodePanel').style.display = 'block';
}

function closeSvgCode() {
    document.getElementById('svgCodePanel').style.display = 'none';
}

function copySvgCode() {
    const code = document.getElementById('svgCodeOutput').value;
    navigator.clipboard.writeText(code).then(() => {
        alert(t('alert.svgCopied'));
    }).catch(err => {
        alert(t('alert.copyFail') + err);
    });
}

// ==================== Layer Management ====================

function updateLayersList() {
    const svg = document.getElementById('svgCanvas');
    const layersList = document.getElementById('layersList');

    // Get all SVG elements except defs
    const elements = Array.from(svg.children).filter(el => el.tagName !== 'defs');

    if (elements.length === 0) {
        layersList.innerHTML = '<p class="layers-placeholder">' + t('svg.layers.empty') + '</p>';
        return;
    }

    layersList.innerHTML = '';

    // Create layer items (reverse order so newest is on top)
    elements.reverse().forEach((element, index) => {
        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        if (selectedLayer === element) {
            layerItem.classList.add('selected');
        }

        const icon = getLayerIcon(element.tagName);
        const name = element.getAttribute('data-layer-name') || `${element.tagName} ${element.id}`;
        const type = element.tagName;

        layerItem.innerHTML = `
            <span class="layer-icon">${icon}</span>
            <span class="layer-name">${name}</span>
            <span class="layer-type">${type}</span>
        `;

        layerItem.addEventListener('click', function() {
            selectLayer(element);
        });

        layersList.appendChild(layerItem);
    });
}

function getLayerIcon(tagName) {
    const icons = {
        'rect': '◻',
        'circle': '◯',
        'line': '─',
        'text': 'T',
        'path': '~',
        'polygon': '▽',
        'ellipse': '⬭'
    };
    return icons[tagName] || '■';
}

function selectLayer(element) {
    // Clear previous selection highlight
    const svg = document.getElementById('svgCanvas');
    const allElements = svg.querySelectorAll('[data-selected="true"]');
    allElements.forEach(el => {
        el.removeAttribute('data-selected');
        const originalStroke = el.getAttribute('data-original-stroke');
        if (originalStroke !== null) {
            el.setAttribute('stroke', originalStroke);
            el.removeAttribute('data-original-stroke');
        }
    });

    // Set new selection
    selectedLayer = element;

    // Highlight selected element
    element.setAttribute('data-selected', 'true');
    if (element.tagName !== 'line' && element.tagName !== 'path') {
        const currentStroke = element.getAttribute('stroke') || 'none';
        element.setAttribute('data-original-stroke', currentStroke);
        element.setAttribute('stroke', '#667eea');
        element.setAttribute('stroke-width', '3');
    }

    updateLayersList();
}

function deleteSelectedLayer() {
    if (!selectedLayer) {
        alert(t('alert.selectLayer'));
        return;
    }

    if (confirm(t('alert.deleteLayer'))) {
        selectedLayer.remove();
        selectedLayer = null;
        updateLayersList();
    }
}

function moveLayerUp() {
    if (!selectedLayer) {
        alert(t('alert.selectLayer'));
        return;
    }

    const nextSibling = selectedLayer.nextElementSibling;
    if (nextSibling && nextSibling.tagName !== 'defs') {
        selectedLayer.parentNode.insertBefore(nextSibling, selectedLayer);
        updateLayersList();
    }
}

function moveLayerDown() {
    if (!selectedLayer) {
        alert(t('alert.selectLayer'));
        return;
    }

    const previousSibling = selectedLayer.previousElementSibling;
    if (previousSibling && previousSibling.tagName !== 'defs') {
        selectedLayer.parentNode.insertBefore(selectedLayer, previousSibling);
        updateLayersList();
    }
}

// ==================== Neural Network Models ====================

function downloadModelSvg(button) {
    const modelCard = button.parentElement;
    const svg = modelCard.querySelector('.model-diagram');
    const modelName = modelCard.querySelector('h3').textContent;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = modelName.replace(/\s+/g, '_') + '.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show success message
    const originalText = button.textContent;
    button.textContent = t('alert.downloadSuccess');
    button.style.background = '#27ae60';

    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 2000);
}

// ==================== Utilities ====================

// Prevent default drag behavior on the SVG canvas
document.addEventListener('DOMContentLoaded', function() {
    const svgCanvas = document.getElementById('svgCanvas');
    if (svgCanvas) {
        svgCanvas.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for LaTeX format
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
        // Load saved content
        const savedLatex = localStorage.getItem('latexInput');
        if (savedLatex) {
            latexInput.value = savedLatex;
        }

        // Save on input and trigger auto-preview
        latexInput.addEventListener('input', function() {
            localStorage.setItem('latexInput', this.value);

            // Auto-preview if enabled
            if (autoPreviewEnabled) {
                clearTimeout(previewTimeout);
                previewTimeout = setTimeout(() => {
                    renderLatexPreview();
                }, 500);
            }
        });
    }
});

// Apply saved language on load
document.addEventListener('DOMContentLoaded', function() {
    setLanguage(currentLang);
});

// Welcome message
console.log('%cWelcome to Research Tools Hub!', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cAn open-source research tools platform', 'color: #555; font-size: 14px;');
