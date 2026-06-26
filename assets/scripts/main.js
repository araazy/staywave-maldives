// Main Script - Global Initialization

document.addEventListener('DOMContentLoaded', () => {
    console.log('StayWave Maldives Premium Website Loaded');
    
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Initialize all interactions
    initializeScrollAnimations();
    initializeRevealAnimations();
    initializeLazyLoading();
});

// Card-level scroll animations (opacity + translate)
function initializeScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll(
        '.package-card, .feature-card, .marine-card, .site-card, .testimonial-card, .faq-item, .why-card, .plan-step'
    );

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Section-level reveal animations using .reveal CSS class
function initializeRevealAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// Lazy loading for images
function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}
