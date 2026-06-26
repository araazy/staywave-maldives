// Navigation Script

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navbarMenu = document.getElementById('navbar-menu');
    const navbarLinks = navbarMenu.querySelectorAll('a');
    const navbar = document.getElementById('navbar');

    // Toggle hamburger menu
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navbarMenu.classList.toggle('active');
        });
    }

    // Close menu when a link is clicked
    navbarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger) {
                hamburger.classList.remove('active');
                navbarMenu.classList.remove('active');
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (hamburger && !e.target.closest('.navbar-container')) {
            hamburger.classList.remove('active');
            navbarMenu.classList.remove('active');
        }
    });
});
