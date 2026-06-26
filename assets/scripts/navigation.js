// Navigation Toggle Script

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navbarMenu = document.getElementById('navbar-menu');
    const navbarLinks = navbarMenu.querySelectorAll('a');

    // Toggle hamburger menu
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navbarMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navbarLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navbarMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar-container')) {
            hamburger.classList.remove('active');
            navbarMenu.classList.remove('active');
        }
    });

    // Sticky navbar on scroll
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.boxShadow = 'var(--shadow-lg)';
        } else {
            navbar.style.boxShadow = 'var(--shadow-md)';
        }
    });
});
