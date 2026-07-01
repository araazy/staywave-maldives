// Navigation Script

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navbarMenu = document.getElementById('navbar-menu');
    const navbar = document.getElementById('navbar');

    if (!navbarMenu) return;

    const navbarLinks = navbarMenu.querySelectorAll('a');

    // Toggle hamburger menu
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', String(!isExpanded));
            hamburger.classList.toggle('active');
            navbarMenu.classList.toggle('active');
        });
    }

    // Close menu when a link is clicked
    navbarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger) {
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.classList.remove('active');
                navbarMenu.classList.remove('active');
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (hamburger && !e.target.closest('.navbar-container')) {
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.classList.remove('active');
            navbarMenu.classList.remove('active');
        }
    });
});
