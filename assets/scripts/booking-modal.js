// Booking Modal Script

document.addEventListener('DOMContentLoaded', () => {
    const ctaButtons = document.querySelectorAll('[aria-label*="Book"]');
    const contactSection = document.getElementById('contact');

    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Scroll to contact section
            setTimeout(() => {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        });
    });

    // Handle CTA section buttons
    const ctaCtaButtons = document.querySelectorAll('.cta-btn');
    ctaCtaButtons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.textContent.trim();
            if (buttonText === 'Book a Package') {
                alert('Opening booking form...');
                // In production, implement booking form here
            } else if (buttonText === 'Contact Us') {
                // Scroll to footer or contact form
                document.querySelector('.footer').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
