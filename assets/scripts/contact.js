// Contact Form — Sprint 7

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const statusRegion = document.getElementById('form-status');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateForm(form)) return;

        const name    = form.elements['name'].value.trim();
        const email   = form.elements['email'].value.trim();
        const interest = form.elements['interest'].value;
        const message = form.elements['message'].value.trim();

        const interestLabel = interest
            ? form.elements['interest'].options[form.elements['interest'].selectedIndex].text
            : '';

        const lines = [
            "Hi StayWave! I'd like to enquire about a diving trip.",
            `Name: ${name}`,
            `Email: ${email}`,
        ];
        if (interestLabel) lines.push(`Package of interest: ${interestLabel}`);
        lines.push(`Message: ${message}`);

        const text = lines.join('\n');
        const url  = `https://wa.me/+9607972103?text=${encodeURIComponent(text)}`;

        window.open(url, '_blank', 'noopener,noreferrer');

        if (statusRegion) {
            statusRegion.textContent = 'Your enquiry is being opened in WhatsApp. We\'ll get back to you shortly!';
        }
    });

    function validateForm(form) {
        let valid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach((field) => {
            const errorEl = field.parentElement.querySelector('.form-error');
            const isEmpty = field.value.trim() === '';
            const badEmail = field.type === 'email' && !isEmpty &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());

            if (isEmpty) {
                showError(field, errorEl, 'This field is required.');
                valid = false;
            } else if (badEmail) {
                showError(field, errorEl, 'Please enter a valid email address.');
                valid = false;
            } else {
                clearError(field, errorEl);
            }
        });

        // Move focus to the first invalid field
        if (!valid) {
            const firstInvalid = form.querySelector('.invalid');
            if (firstInvalid) firstInvalid.focus();
        }

        return valid;
    }

    function showError(field, errorEl, message) {
        field.classList.add('invalid');
        field.setAttribute('aria-invalid', 'true');
        if (errorEl) errorEl.textContent = message;
    }

    function clearError(field, errorEl) {
        field.classList.remove('invalid');
        field.removeAttribute('aria-invalid');
        if (errorEl) errorEl.textContent = '';
    }

    // Live validation — clear errors on user input
    form.querySelectorAll('input, textarea, select').forEach((field) => {
        field.addEventListener('input', () => {
            if (field.classList.contains('invalid')) {
                const errorEl = field.parentElement.querySelector('.form-error');
                clearError(field, errorEl);
            }
        });
    });
});
