// Hero Section Script

document.addEventListener('DOMContentLoaded', () => {
    const heroBtn = document.querySelector('.hero-btn');
    const packagesSection = document.getElementById('packages');

    // Smooth scroll to packages when hero button is clicked
    heroBtn.addEventListener('click', () => {
        packagesSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Parallax effect for hero background
    const heroBackground = document.querySelector('.hero-background');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight) {
            heroBackground.style.transform = `translateY(${scrollY * 0.5}px)`;
        }
    });
});
