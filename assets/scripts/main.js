// Main Script - Global Initialization

document.addEventListener('DOMContentLoaded', () => {
    console.log('StayWave Maldives Premium Website Loaded');
    
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Initialize all interactions
    initializeScrollAnimations();
    initializeLazyLoading();
});

// Scroll animations
function initializeScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll(
        '.package-card, .feature-card, .marine-card, .site-card, .testimonial-card, .faq-item, .fuvahmulah-card, .accommodation-content'
    );

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
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
