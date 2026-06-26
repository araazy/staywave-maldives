/**
 * Lazy Loading Image Handler
 * Implements Intersection Observer API for efficient image loading
 */

class LazyImageLoader {
    constructor(options = {}) {
        this.options = {
            threshold: options.threshold || 0.1,
            rootMargin: options.rootMargin || '50px',
            fadeInDuration: options.fadeInDuration || 500,
        };
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    threshold: this.options.threshold,
                    rootMargin: this.options.rootMargin,
                }
            );

            // Observe all images with data-src attribute
            document.querySelectorAll('img[data-src]').forEach((img) => {
                this.observer.observe(img);
            });

            // Observe background images with data-bg attribute
            document.querySelectorAll('[data-bg]').forEach((element) => {
                this.observer.observe(element);
            });
        } else {
            // Fallback for older browsers
            this.loadImagesImmediately();
        }
    }

    handleIntersection(entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }

    loadImage(element) {
        if (element.tagName === 'IMG') {
            // Handle regular images
            const src = element.dataset.src;
            if (src) {
                element.addEventListener('load', () => {
                    element.classList.add('loaded');
                });
                element.addEventListener('error', () => {
                    console.warn(`Failed to load image: ${src}`);
                });
                element.src = src;
            }
        } else {
            // Handle background images
            const bgSrc = element.dataset.bg;
            if (bgSrc) {
                const img = new Image();
                img.onload = () => {
                    element.style.backgroundImage = `url('${bgSrc}')`;
                    element.classList.add('loaded');
                };
                img.onerror = () => {
                    console.warn(`Failed to load background image: ${bgSrc}`);
                };
                img.src = bgSrc;
            }
        }
    }

    loadImagesImmediately() {
        document.querySelectorAll('img[data-src]').forEach((img) => {
            img.src = img.dataset.src;
        });

        document.querySelectorAll('[data-bg]').forEach((element) => {
            element.style.backgroundImage = `url('${element.dataset.bg}')`;
        });
    }
}

// Initialize lazy loading when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LazyImageLoader();
    });
} else {
    new LazyImageLoader();
}

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyImageLoader;
}
