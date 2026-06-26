// Packages Section Script

document.addEventListener('DOMContentLoaded', () => {
    const packageButtons = document.querySelectorAll('.package-btn');

    packageButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const packageCard = e.target.closest('.package-card');
            const packageTitle = packageCard.querySelector('.package-title').textContent;
            const packagePrice = packageCard.querySelector('.package-price').textContent;
            
            // Show booking modal or redirect
            openBookingModal(packageTitle, packagePrice);
        });
    });
});

function openBookingModal(title, price) {
    // Display alert for now (replace with modal in production)
    alert(`You selected: ${title}\nPrice: ${price}\n\nRedirecting to booking page...`);
    // In production, this would open a modal or redirect to booking page
}
