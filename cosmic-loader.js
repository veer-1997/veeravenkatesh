// Cosmic Loader Animation - Black Hole Only
class CosmicLoader {
    constructor() {
        this.loader = document.getElementById('cosmic-loader');
    }

    start() {
        // Black hole is already active in HTML
        // Just wait 1.5 seconds then complete
        setTimeout(() => this.complete(), 1500);
    }

    complete() {
        this.loader.classList.add('complete');
        setTimeout(() => {
            this.loader.style.display = 'none';
            document.body.classList.add('loaded');
        }, 1000);
    }
}

// Initialize cosmic loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const cosmicLoader = new CosmicLoader();
    cosmicLoader.start();
});
