// ==================== Markdown Editor ====================

function renderMarkdownPreview() {
    const input = document.getElementById('markdownInput');
    const preview = document.getElementById('markdownPreview');
    if (!input || !preview) return;

    const text = input.value;
    if (!text.trim()) {
        preview.innerHTML = '<p class="preview-placeholder">' + t('markdown.preview.placeholder') + '</p>';
        return;
    }

    preview.innerHTML = markdownToHtml(text);

    // Render math with MathJax if present
    if (window.MathJax && window.MathJax.typesetPromise) {
        MathJax.typesetPromise([preview]).catch(() => {});
    }

    // Save to localStorage
    localStorage.setItem('markdownInput', text);
}

function markdownToHtml(md) {
    let html = md;

    // Escape HTML
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Code blocks (``` ... ```) - must be before other rules
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function(match, lang, code) {
        return '<pre><code class="language-' + lang + '">' + code.trim() + '</code></pre>';
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Math blocks ($$...$$)
    html = html.replace(/\$\$([\s\S]*?)\$\$/g, '<div class="math-block">$$$$1$$</div>');

    // Inline math ($...$)
    html = html.replace(/\$([^\$\n]+)\$/g, '<span class="math-inline">\\($1\\)</span>');

    // Headings
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // Horizontal rule
    html = html.replace(/^---+$/gm, '<hr>');
    html = html.replace(/^\*\*\*+$/gm, '<hr>');

    // Bold + Italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Strikethrough
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Images (before links)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;">');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Blockquotes
    html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    // Merge consecutive blockquotes
    html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

    // Tables
    html = html.replace(/^(\|.+\|)\n(\|[\s\-:|]+\|)\n((?:\|.+\|\n?)+)/gm, function(match, header, separator, body) {
        const headers = header.split('|').filter(c => c.trim()).map(c => '<th>' + c.trim() + '</th>').join('');
        const rows = body.trim().split('\n').map(row => {
            const cells = row.split('|').filter(c => c.trim()).map(c => '<td>' + c.trim() + '</td>').join('');
            return '<tr>' + cells + '</tr>';
        }).join('');
        return '<table><thead><tr>' + headers + '</tr></thead><tbody>' + rows + '</tbody></table>';
    });

    // Unordered lists
    html = html.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Ordered lists
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<oli>$1</oli>');
    html = html.replace(/((?:<oli>.*<\/oli>\n?)+)/g, function(match) {
        return '<ol>' + match.replace(/<\/?oli>/g, function(tag) {
            return tag.replace('oli', 'li');
        }) + '</ol>';
    });

    // Paragraphs - wrap remaining lines
    html = html.replace(/^(?!<[a-z/])((?!<).+)$/gm, '<p>$1</p>');

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');

    return html;
}

function insertMdSyntax(type) {
    const input = document.getElementById('markdownInput');
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selected = input.value.substring(start, end);
    const before = input.value.substring(0, start);
    const after = input.value.substring(end);

    let insert = '';
    let cursorOffset = 0;

    switch (type) {
        case 'bold':
            insert = '**' + (selected || 'bold text') + '**';
            cursorOffset = selected ? insert.length : 2;
            break;
        case 'italic':
            insert = '*' + (selected || 'italic text') + '*';
            cursorOffset = selected ? insert.length : 1;
            break;
        case 'heading':
            insert = '## ' + (selected || 'Heading');
            cursorOffset = insert.length;
            break;
        case 'link':
            insert = '[' + (selected || 'link text') + '](url)';
            cursorOffset = insert.length - 4;
            break;
        case 'image':
            insert = '![' + (selected || 'alt text') + '](image-url)';
            cursorOffset = insert.length - 10;
            break;
        case 'code':
            insert = '`' + (selected || 'code') + '`';
            cursorOffset = selected ? insert.length : 1;
            break;
        case 'codeblock':
            insert = '```\n' + (selected || 'code here') + '\n```';
            cursorOffset = selected ? insert.length : 4;
            break;
        case 'list':
            insert = '- ' + (selected || 'list item');
            cursorOffset = insert.length;
            break;
        case 'olist':
            insert = '1. ' + (selected || 'list item');
            cursorOffset = insert.length;
            break;
        case 'quote':
            insert = '> ' + (selected || 'quote text');
            cursorOffset = insert.length;
            break;
        case 'table':
            insert = '| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Cell 1 | Cell 2 | Cell 3 |';
            cursorOffset = insert.length;
            break;
        case 'hr':
            insert = '\n---\n';
            cursorOffset = insert.length;
            break;
        case 'math':
            insert = '$$\n' + (selected || 'E = mc^2') + '\n$$';
            cursorOffset = selected ? insert.length : 3;
            break;
    }

    input.value = before + insert + after;
    input.selectionStart = input.selectionEnd = start + cursorOffset;
    input.focus();
    renderMarkdownPreview();
}

function copyMarkdownHtml() {
    const preview = document.getElementById('markdownPreview');
    if (!preview || !preview.innerHTML.trim()) {
        showToast(t('alert.noContent'), 'warning');
        return;
    }
    navigator.clipboard.writeText(preview.innerHTML).then(() => {
        showToast(t('alert.copied'));
    }).catch(err => {
        showToast(t('alert.copyFail') + err, 'error');
    });
}

function downloadMarkdownHtml() {
    const preview = document.getElementById('markdownPreview');
    if (!preview || !preview.innerHTML.trim()) {
        showToast(t('alert.noContent'), 'warning');
        return;
    }
    const fullHtml = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>Markdown Export</title>\n<style>\nbody { font-family: -apple-system, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.8; color: #333; }\ntable { border-collapse: collapse; width: 100%; }\nth, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\nth { background: #f5f5f5; }\npre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; }\ncode { background: #f0f0f0; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }\nblockquote { border-left: 4px solid #667eea; margin-left: 0; padding-left: 1rem; color: #555; }\nimg { max-width: 100%; }\n</style>\n</head>\n<body>\n' + preview.innerHTML + '\n</body>\n</html>';
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'markdown-export.html';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(t('alert.downloadSuccess'));
}

function clearMarkdown() {
    const input = document.getElementById('markdownInput');
    const preview = document.getElementById('markdownPreview');
    if (input) input.value = '';
    if (preview) preview.innerHTML = '<p class="preview-placeholder">' + t('markdown.preview.placeholder') + '</p>';
    localStorage.removeItem('markdownInput');
}

// Keyboard shortcuts for Markdown
document.addEventListener('keydown', function(e) {
    const activeSection = document.querySelector('.section.active');
    if (!activeSection || activeSection.id !== 'markdown') return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault(); insertMdSyntax('bold');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault(); insertMdSyntax('italic');
    }
});

// Auto-restore from localStorage
document.addEventListener('DOMContentLoaded', function() {
    const saved = localStorage.getItem('markdownInput');
    const input = document.getElementById('markdownInput');
    if (saved && input) {
        input.value = saved;
        renderMarkdownPreview();
    }
});
