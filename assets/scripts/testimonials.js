// Testimonials Carousel — Sprint 7

document.addEventListener('DOMContentLoaded', () => {
    const track       = document.getElementById('testimonials-track');
    if (!track) return;

    const slides        = Array.from(track.querySelectorAll('.testimonial-card'));
    const prevBtn       = document.getElementById('testimonials-prev');
    const nextBtn       = document.getElementById('testimonials-next');
    const dotsContainer = document.getElementById('testimonials-dots');
    const totalSlides   = slides.length;
    let current         = 0;
    let autoPlayTimer   = null;

    if (totalSlides === 0) return;

    // ── Build dot indicators ─────────────────────────────────────────────────
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.setAttribute('aria-label', `Review ${i + 1} of ${totalSlides}`);
        dot.addEventListener('click', () => { goTo(i); restartAutoPlay(); });
        dotsContainer.appendChild(dot);
    });

    // ── Slide navigation ─────────────────────────────────────────────────────
    function goTo(index) {
        slides[current].setAttribute('aria-hidden', 'true');
        current = (index + totalSlides) % totalSlides;
        track.style.transform = `translateX(-${current * 100}%)`;
        slides[current].removeAttribute('aria-hidden');
        updateDots();
    }

    function updateDots() {
        dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            const active = i === current;
            dot.classList.toggle('active', active);
            dot.setAttribute('aria-selected', active ? 'true' : 'false');
        });
    }

    // ── Auto-play ─────────────────────────────────────────────────────────────
    function startAutoPlay() {
        if (autoPlayTimer) return;
        autoPlayTimer = setInterval(() => goTo(current + 1), 5000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
    }

    function restartAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    // ── Controls ──────────────────────────────────────────────────────────────
    if (prevBtn) {
        prevBtn.addEventListener('click', () => { goTo(current - 1); restartAutoPlay(); });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => { goTo(current + 1); restartAutoPlay(); });
    }

    // Keyboard navigation on the carousel container
    const carousel = document.getElementById('testimonials-carousel');
    if (carousel) {
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft')  { goTo(current - 1); restartAutoPlay(); }
            if (e.key === 'ArrowRight') { goTo(current + 1); restartAutoPlay(); }
        });

        // Pause on hover / focus
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
        carousel.addEventListener('focusin',    stopAutoPlay);
        carousel.addEventListener('focusout',   startAutoPlay);
    }

    // ── Initial accessibility state ───────────────────────────────────────────
    slides.forEach((slide, i) => {
        if (i !== 0) slide.setAttribute('aria-hidden', 'true');
    });

    // Only auto-play when the user hasn't requested reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        startAutoPlay();
    }
});
