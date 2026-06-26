// Navigation Script

document.addEventListener('DOMContentLoaded', () => {
    const hamburger  = document.getElementById('hamburger');
    const navbarMenu = document.getElementById('navbar-menu');
    const navbarLinks = navbarMenu.querySelectorAll('a');
    const navbar     = document.getElementById('navbar');

    // ── Hamburger toggle ──────────────────────────────────────────────────────
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const isOpen = navbarMenu.classList.toggle('active');
            hamburger.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    // Close menu when a nav link is clicked
    navbarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger) {
                hamburger.classList.remove('active');
                navbarMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Close menu when clicking outside the navbar
    document.addEventListener('click', (e) => {
        if (hamburger && !e.target.closest('.navbar-container')) {
            hamburger.classList.remove('active');
            navbarMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    // ── Navbar shadow on scroll ───────────────────────────────────────────────
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });

    // ── Active link highlighting based on visible section ────────────────────
    const sections  = document.querySelectorAll('section[id], header[id]');
    const menuLinks = navbarMenu.querySelectorAll('a[href^="#"]');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                menuLinks.forEach(link => {
                    const active = link.getAttribute('href') === `#${id}`;
                    link.classList.toggle('active', active);
                    if (active) link.setAttribute('aria-current', 'true');
                    else        link.removeAttribute('aria-current');
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(section => sectionObserver.observe(section));
});

