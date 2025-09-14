// js/views/about-view.js - About View Component
class AboutView {
    constructor(app) {
        this.app = app;
        this.element = null;
    }

    async init() {
        this.element = document.getElementById('aboutView');
        console.log('AboutView initialized');
    }

    async updateWithData(appData) {
        // About view doesn't need dynamic data updates
    }

    onActivate() {
        // About view doesn't have focusable elements by default
        // Could add social media links or other interactive elements here
    }
}