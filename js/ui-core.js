// ==================== Dark Mode ====================

let isDarkMode = localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

function setDarkMode(dark) {
    isDarkMode = dark;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    const btn = document.getElementById('darkModeToggle');
    if (btn) btn.textContent = dark ? '🌙' : '☀️';
}

function toggleDarkMode() {
    setDarkMode(!isDarkMode);
}

document.addEventListener('DOMContentLoaded', function() {
    setDarkMode(isDarkMode);
});

// ==================== Mobile Menu ====================

function toggleMenu() {
    const menu = document.getElementById('navMenu');
    const btn = document.getElementById('hamburgerBtn');
    menu.classList.toggle('menu-open');
    btn.classList.toggle('active');
}

function closeMenu() {
    const menu = document.getElementById('navMenu');
    const btn = document.getElementById('hamburgerBtn');
    if (menu) menu.classList.remove('menu-open');
    if (btn) btn.classList.remove('active');
}

// ==================== Toast Notification ====================

function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, duration);
}

// ==================== Back to Top ====================

window.addEventListener('scroll', function() {
    const btn = document.getElementById('backToTop');
    if (btn) {
        btn.classList.toggle('visible', window.scrollY > 300);
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
