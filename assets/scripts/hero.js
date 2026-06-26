// Hero Section Script

document.addEventListener('DOMContentLoaded', () => {
    const explorBtn = document.querySelector('.hero-buttons .btn-primary');
    const packagesSection = document.getElementById('packages');

    if (explorBtn && packagesSection) {
        explorBtn.addEventListener('click', () => {
            packagesSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
});
