// Packages Script

document.addEventListener('DOMContentLoaded', () => {
    const packageButtons = document.querySelectorAll('.package-footer .btn');

    packageButtons.forEach(button => {
        button.addEventListener('click', () => {
            const packageCard = button.closest('.package-card');
            const packageTitle = packageCard.querySelector('.package-header h3').textContent;
            
            // Open WhatsApp with pre-filled message
            const whatsappUrl = `https://wa.me/9607972103?text=Hi%20StayWave%2C%20I%27m%20interested%20in%20the%20${encodeURIComponent(packageTitle)}%20package.`;
            window.open(whatsappUrl, '_blank');
        });
    });
});
