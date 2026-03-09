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
        output.textContent = '请输入LaTeX代码...';
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
        output.textContent = '格式化出错: ' + error.message;
    }
}

function renderLatexPreview() {
    const input = document.getElementById('latexInput').value;
    const preview = document.getElementById('latexPreview');

    if (!input.trim()) {
        preview.innerHTML = '<p class="preview-placeholder">数学公式预览将显示在这里...</p>';
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
            preview.innerHTML = '<p style="color: red;">渲染错误: ' + err.message + '</p>';
        });
    } else {
        preview.innerHTML = '<p style="color: orange;">正在加载MathJax，请稍候...</p>';
        setTimeout(renderLatexPreview, 1000);
    }
}

function toggleAutoPreview() {
    autoPreviewEnabled = !autoPreviewEnabled;
    const btn = document.getElementById('autoPreviewBtn');

    if (autoPreviewEnabled) {
        btn.textContent = '关闭自动预览';
        btn.style.background = '#e74c3c';
        renderLatexPreview();
    } else {
        btn.textContent = '开启自动预览';
        btn.style.background = '';
    }
}

function clearLatex() {
    document.getElementById('latexInput').value = '';
    document.getElementById('latexOutput').textContent = '格式化后的代码将显示在这里...';
    document.getElementById('latexPreview').innerHTML = '<p class="preview-placeholder">数学公式预览将显示在这里...</p>';
}

function copyLatex() {
    const output = document.getElementById('latexOutput').textContent;

    if (output === '格式化后的代码将显示在这里...' || output === '请输入LaTeX代码...') {
        alert('没有可复制的内容');
        return;
    }

    navigator.clipboard.writeText(output).then(() => {
        alert('已复制到剪贴板!');
    }).catch(err => {
        alert('复制失败: ' + err);
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
    rect.setAttribute('data-layer-name', '矩形 ' + svgElementCounter);

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
    circle.setAttribute('data-layer-name', '圆形 ' + svgElementCounter);

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
    line.setAttribute('data-layer-name', '直线 ' + svgElementCounter);

    svg.appendChild(line);
    updateLayersList();
}

function svgAddText() {
    const svg = document.getElementById('svgCanvas');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    const x = 100 + Math.random() * 200;
    const y = 100 + Math.random() * 200;

    const textContent = prompt('请输入文本内容:', '示例文本');
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
    line.setAttribute('data-layer-name', '箭头 ' + svgElementCounter);

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
    if (confirm('确定要清空画布吗?')) {
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
        alert('SVG代码已复制到剪贴板!');
    }).catch(err => {
        alert('复制失败: ' + err);
    });
}

// ==================== Layer Management ====================

function updateLayersList() {
    const svg = document.getElementById('svgCanvas');
    const layersList = document.getElementById('layersList');

    // Get all SVG elements except defs
    const elements = Array.from(svg.children).filter(el => el.tagName !== 'defs');

    if (elements.length === 0) {
        layersList.innerHTML = '<p class="layers-placeholder">暂无图层</p>';
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
        alert('请先选择一个图层');
        return;
    }

    if (confirm('确定要删除选中的图层吗?')) {
        selectedLayer.remove();
        selectedLayer = null;
        updateLayersList();
    }
}

function moveLayerUp() {
    if (!selectedLayer) {
        alert('请先选择一个图层');
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
        alert('请先选择一个图层');
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
    button.textContent = '下载成功!';
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

// Welcome message
console.log('%c欢迎使用科研工具集!', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%c这是一个开源的科研工具整合平台', 'color: #555; font-size: 14px;');
console.log('%c如果您有任何建议或问题，欢迎反馈!', 'color: #27ae60; font-size: 14px;');
