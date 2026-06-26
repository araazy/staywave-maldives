// Booking Modal Script

document.addEventListener('DOMContentLoaded', () => {
    const contactSection = document.getElementById('contact');

    // Package "Request Quote" buttons → scroll to contact form
    const ctaButtons = document.querySelectorAll('[aria-label*="quote" i], [aria-label*="Quote" i]');
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Booking CTA "Request Custom Quote" button → scroll to contact form
    const ctaLightBtn = document.querySelector('.btn-light[aria-label*="quote" i]');
    if (ctaLightBtn && contactSection) {
        ctaLightBtn.addEventListener('click', () => {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
});
