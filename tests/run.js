// Simple test runner - no dependencies required
const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;
const errors = [];

function assert(condition, message) {
    if (condition) {
        passed++;
        process.stdout.write('.');
    } else {
        failed++;
        errors.push(message);
        process.stdout.write('F');
    }
}

function assertEqual(actual, expected, message) {
    assert(actual === expected, `${message}: expected "${expected}", got "${actual}"`);
}

function assertIncludes(str, substr, message) {
    assert(str.includes(substr), `${message}: "${substr}" not found`);
}

function assertMatch(str, regex, message) {
    assert(regex.test(str), `${message}: pattern ${regex} not matched`);
}

console.log('Research Tools Hub - Test Suite\n');

// ==================== File Structure Tests ====================
console.log('\n[File Structure]');

const requiredFiles = [
    'index.html',
    'manifest.json',
    'sw.js',
    'css/base.css',
    'css/components.css',
    'css/latex.css',
    'css/svg-editor.css',
    'css/sections.css',
    'css/responsive.css',
    'js/i18n.js',
    'js/ui-core.js',
    'js/navigation.js',
    'js/latex.js',
    'js/svg-editor.js',
    'js/models.js',
    'js/text-tools.js',
    'js/markdown.js',
    'js/references.js',
    'js/data-viz.js',
    'js/code-highlight.js',
    'js/cron-parser.js',
    'js/academic-cal.js',
    'js/formula-helper.js',
    'js/pomodoro.js',
    'js/ai-features.js',
    'js/share.js'
];

const root = path.join(__dirname, '..');
requiredFiles.forEach(file => {
    assert(fs.existsSync(path.join(root, file)), `Missing file: ${file}`);
});

// ==================== HTML Validation Tests ====================
console.log('\n[HTML Validation]');

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

assertIncludes(html, '<!DOCTYPE html>', 'DOCTYPE declaration');
assertIncludes(html, 'lang="zh-CN"', 'HTML lang attribute');
assertIncludes(html, '<meta charset="UTF-8">', 'Charset meta tag');
assertIncludes(html, 'viewport', 'Viewport meta tag');
assertIncludes(html, 'manifest.json', 'PWA manifest link');
assertIncludes(html, 'serviceWorker', 'Service worker registration');
assertIncludes(html, 'aria-live', 'ARIA live region for toasts');

// Check all CSS files are linked
['base.css', 'components.css', 'latex.css', 'svg-editor.css', 'sections.css', 'responsive.css'].forEach(css => {
    assertIncludes(html, `css/${css}`, `CSS link: ${css}`);
});

// Check all JS files are referenced
['i18n.js', 'ui-core.js', 'navigation.js', 'latex.js', 'svg-editor.js', 'models.js', 'text-tools.js', 'ai-features.js', 'share.js'].forEach(js => {
    assertIncludes(html, `js/${js}`, `JS script: ${js}`);
});

// Check no references to old monolithic files
assert(!html.includes('src="script.js"'), 'No reference to old script.js');
assert(!html.includes('href="styles.css"'), 'No reference to old styles.css');

// ==================== i18n Tests ====================
console.log('\n[i18n System]');

const i18nContent = fs.readFileSync(path.join(root, 'js/i18n.js'), 'utf8');

// Extract all data-i18n keys from HTML
const i18nKeys = [];
const regex = /data-i18n="([^"]+)"/g;
let match;
while ((match = regex.exec(html)) !== null) {
    i18nKeys.push(match[1]);
}

// Check that translations exist for zh
const uniqueKeys = [...new Set(i18nKeys)];
console.log(`\n  Found ${uniqueKeys.length} unique i18n keys in HTML`);

uniqueKeys.forEach(key => {
    assertIncludes(i18nContent, `'${key}'`, `zh translation for: ${key}`);
});

// Check data-i18n-placeholder keys too
const placeholderKeys = [];
const phRegex = /data-i18n-placeholder="([^"]+)"/g;
while ((match = phRegex.exec(html)) !== null) {
    placeholderKeys.push(match[1]);
}
placeholderKeys.forEach(key => {
    assertIncludes(i18nContent, `'${key}'`, `zh translation for placeholder: ${key}`);
});

// ==================== JS Syntax Tests ====================
console.log('\n[JS Syntax]');

const jsFiles = fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js'));
jsFiles.forEach(file => {
    const content = fs.readFileSync(path.join(root, 'js', file), 'utf8');
    // Check for common issues
    assert(!content.includes('var '), `${file}: no 'var' declarations (use let/const)`);
    assert(!/[^!=]== null|[^!]!= null/.test(content), `${file}: use === for null checks`);
});

// ==================== CSS Validation Tests ====================
console.log('\n[CSS Validation]');

const cssFiles = fs.readdirSync(path.join(root, 'css')).filter(f => f.endsWith('.css'));
cssFiles.forEach(file => {
    const content = fs.readFileSync(path.join(root, 'css', file), 'utf8');
    assert(content.length > 0, `${file}: not empty`);

    // Check for hardcoded 'white' background that should be var(--bg-card)
    // Allow in specific contexts (like button text color)
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        if (line.includes('background') && line.includes(': white') && !line.includes('/*')) {
            // This is a potential dark mode issue
            errors.push(`${file}:${i+1}: hardcoded "white" background - should use var(--bg-card)`);
            failed++;
            process.stdout.write('F');
        }
    });
});

// ==================== Function Reference Tests ====================
console.log('\n[Function References]');

// Extract onclick function names from HTML
const onclickFns = [];
const onclickRegex = /onclick="([a-zA-Z_]\w*)\(/g;
while ((match = onclickRegex.exec(html)) !== null) {
    if (match[1] !== 'event' && match[1] !== 'document' && match[1] !== 'this') {
        onclickFns.push(match[1]);
    }
}
const uniqueFns = [...new Set(onclickFns)];

// Check each function exists in some JS file
const allJsContent = jsFiles.map(f => fs.readFileSync(path.join(root, 'js', f), 'utf8')).join('\n');
uniqueFns.forEach(fn => {
    assertIncludes(allJsContent, `function ${fn}`, `Function defined: ${fn}`);
});

// ==================== Security Tests ====================
console.log('\n[Security]');

jsFiles.forEach(file => {
    const content = fs.readFileSync(path.join(root, 'js', file), 'utf8');
    // Check for eval usage
    assert(!content.includes('eval('), `${file}: no eval() usage`);
    // Check for document.write
    assert(!content.includes('document.write('), `${file}: no document.write() usage`);
});

// ==================== Results ====================
console.log('\n\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
if (errors.length > 0) {
    console.log('\nFailures:');
    errors.forEach((e, i) => console.log(`  ${i+1}. ${e}`));
}
console.log('='.repeat(50));
process.exit(failed > 0 ? 1 : 0);
