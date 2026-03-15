// ==================== Navigation ====================

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
        constdropdown = targetLink.closest('.nav-dropdown');
        if (dropdown) {
            consttoggle = dropdown.querySelector('.nav-dropdown-toggle');
            if (toggle) toggle.classList.add('active');
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMenu();
    // Close all dropdowns
    document.querySelectorAll('.nav-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
}

document.addEventListener('DOMContentLoaded', function() {
    // Handle nav link clicks
    constnavLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            // If it's a dropdown toggle, toggle the dropdown on mobile
            if (this.classList.contains('nav-dropdown-toggle')) {
                e.preventDefault();
                constparent = this.closest('.nav-dropdown');
                if (parent) {
                    // Close other open dropdowns
                    document.querySelectorAll('.nav-dropdown.open').forEach(function(d) {
                        if (d !== parent) d.classList.remove('open');
                    });
                    parent.classList.toggle('open');
                }
                return;
            }
            consthref = this.getAttribute('href');
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
