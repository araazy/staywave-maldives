// FAQ Section Script

document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');
    let openItem = null;

    faqItems.forEach(item => {
        const summary = item.querySelector('.faq-question');

        summary.addEventListener('click', () => {
            const isOpen = item.hasAttribute('open');

            // Close previously open item
            if (openItem && openItem !== item) {
                openItem.removeAttribute('open');
            }

            // Toggle current item
            if (isOpen) {
                item.removeAttribute('open');
                openItem = null;
            } else {
                item.setAttribute('open', '');
                openItem = item;
            }
        });
    });
});
