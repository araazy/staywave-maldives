// Accommodation Page — Progressive Enhancement

document.addEventListener('DOMContentLoaded', () => {
    initializeRevealAnimations();
    initializeCardAnimations();
});

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

// Card-level scroll animations (opacity + translate)
// Skipped when the user prefers reduced motion.
function initializeCardAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.accom-card, .meal-plan-card, .faq-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        cardObserver.observe(el);
    });
}
