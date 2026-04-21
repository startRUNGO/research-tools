// ==================== Navigation ====================

// SEO: Dynamic page title & meta description per section
const seoMeta = {
    'home':         { title: 'Paper Digest - Daily Top Journal Papers | Research Tools Hub', desc: 'Daily curated papers from top journals in Federated Learning, IoV Security, TinyML, Virtual Power Plant, and Energy Management.' },
    'latex':        { title: 'LaTeX Formatter & Preview | Research Tools Hub', desc: 'Format, beautify and preview LaTeX code online. Free tool for researchers and students.' },
    'svg':          { title: 'SVG Editor - Create Vector Graphics | Research Tools Hub', desc: 'Online SVG vector graphics editor. Draw shapes, export SVG/PNG for academic papers and presentations.' },
    'ai-writing':   { title: 'AI Writing Assistant - Paper Polishing & Review Reply | Research Tools Hub', desc: 'AI prompt templates for academic writing: paper polishing, plagiarism reduction, review reply generation.' },
    'ai-tools':     { title: 'AI Tools Directory | Research Tools Hub', desc: 'Curated AI tools for research: writing, drawing, PPT, coding assistants and more.' },
    'models':       { title: 'Neural Network Model Library | Research Tools Hub', desc: 'Visual neural network architectures: CNN, RNN, Transformer, GAN with downloadable SVG diagrams.' },
    'resources':    { title: 'Research Resources | Research Tools Hub', desc: 'Academic resources: paper databases, conferences, journals, and research tools directory.' },
    'paper-digest': { title: 'Paper Digest - Daily Top Journal Papers | Research Tools Hub', desc: 'Daily curated papers with highlights and analysis from top journals.' },
    'markdown':     { title: 'Markdown Editor & Preview | Research Tools Hub', desc: 'Online Markdown editor with real-time preview. Convert Markdown to HTML instantly.' },
    'references':   { title: 'Reference Manager - DOI/BibTeX | Research Tools Hub', desc: 'Fetch citation info from DOI, format references in APA/MLA/Chicago styles.' },
    'data-viz':     { title: 'Data Visualization Charts | Research Tools Hub', desc: 'Create bar, line, pie, and scatter charts for research papers and presentations.' },
    'code-highlight': { title: 'Code Syntax Highlighter | Research Tools Hub', desc: 'Highlight code snippets for papers and presentations. Support multiple languages.' },
    'flowcharts':   { title: 'Top Journal Flowchart Gallery | Research Tools Hub', desc: 'Premium SVG flowcharts redrawn from top journal papers. High-quality vector downloads.' },
    'formula':      { title: 'Formula Helper - Math Symbols | Research Tools Hub', desc: 'Quick reference for mathematical symbols, Greek letters, and LaTeX commands.' },
    'text-tools':   { title: 'Text Tools - Word Count & Format | Research Tools Hub', desc: 'Text utilities: word count, character count, case conversion, and text formatting.' },
    'cron':         { title: 'Cron Expression Parser | Research Tools Hub', desc: 'Parse and generate cron expressions with human-readable descriptions.' },
    'calendar':     { title: 'Academic Calendar | Research Tools Hub', desc: 'Track academic conference deadlines, journal submission dates, and research milestones.' },
    'pomodoro':     { title: 'Pomodoro Timer | Research Tools Hub', desc: 'Focus timer using Pomodoro technique. Boost research productivity with timed work sessions.' },
};

function updateSeoMeta(sectionId) {
    var meta = seoMeta[sectionId] || seoMeta['home'];
    document.title = meta.title;
    var descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute('content', meta.desc);
    // Update canonical with hash
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        var base = 'https://startrungo.github.io/research-tools/';
        canonical.setAttribute('href', sectionId === 'home' ? base : base + '#' + sectionId);
    }
}

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
    const targetLink = document.querySelector('a[href="#' + sectionId + '"]');
    if (targetLink) {
        targetLink.classList.add('active');
        // Also highlight parent dropdown toggle
        const dropdown = targetLink.closest('.nav-dropdown');
        if (dropdown) {
            const toggle = dropdown.querySelector('.nav-dropdown-toggle');
            if (toggle) toggle.classList.add('active');
        }
    }

    updateSeoMeta(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMenu();
    // Close all dropdowns
    document.querySelectorAll('.nav-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
}

document.addEventListener('DOMContentLoaded', function() {
    // Handle nav link clicks
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            // If it's a dropdown toggle, toggle the dropdown on mobile
            if (this.classList.contains('nav-dropdown-toggle')) {
                e.preventDefault();
                const parent = this.closest('.nav-dropdown');
                if (parent) {
                    // Close other open dropdowns
                    document.querySelectorAll('.nav-dropdown.open').forEach(function(d) {
                        if (d !== parent) d.classList.remove('open');
                    });
                    parent.classList.toggle('open');
                }
                return;
            }
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                navigateTo(href.substring(1));
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-dropdown')) {
            document.querySelectorAll('.nav-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
        }
    });
});
