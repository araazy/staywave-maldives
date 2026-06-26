// Main Script - Global Initialization

document.addEventListener('DOMContentLoaded', () => {
    console.log('StayWave Maldives website loaded successfully!');

    // Initialize all components
    initializeScrollAnimations();
    initializeIntersectionObserver();
    initializeFormValidation();
});

// Scroll Animations
function initializeScrollAnimations() {
    const elementsToAnimate = document.querySelectorAll(
        'section > .container > div > article, .section-header'
    );

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    elementsToAnimate.forEach(element => {
        element.style.opacity = '0';
        observer.observe(element);
    });
}

// Intersection Observer for scroll detection
function initializeIntersectionObserver() {
    const navbarLinks = document.querySelectorAll('.navbar-menu a');
    const sections = document.querySelectorAll('section');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navbarLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + entry.target.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        },
        { threshold: 0.5 }
    );

    sections.forEach(section => observer.observe(section));
}

// Form Validation (Placeholder for future use)
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Form submitted - implement validation here');
        });
    });
}

// Add CSS animation keyframe
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
