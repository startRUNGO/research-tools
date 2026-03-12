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
    const targetLink = document.querySelector(`a[href="#${sectionId}"]`);
    if (targetLink) {
        targetLink.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMenu();
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
