// js/components/navigation-bar.js - Navigation Bar Component
class NavigationBar {
    constructor(app) {
        this.app = app;
        this.element = null;
        this.buttons = [];
        this.activeView = 'home';
    }

    async init() {
        this.element = document.getElementById('navigationBar');
        this.buttons = Array.from(this.element.querySelectorAll('.nav-button'));
        
        this.setupEventListeners();
        console.log('NavigationBar initialized');
    }

    setupEventListeners() {
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const viewName = button.getAttribute('data-view');
                if (viewName) {
                    this.navigateToView(viewName);
                }
            });

            button.addEventListener('focus', () => {
                this.app.focusManager.setFocus(button);
            });
        });
    }

    navigateToView(viewName) {
        if (viewName !== this.activeView) {
            this.setActiveView(viewName);
            this.app.navigateToView(viewName);
        }
    }

    setActiveView(viewName) {
        this.activeView = viewName;
        
        // Update button states
        this.buttons.forEach(button => {
            const buttonView = button.getAttribute('data-view');
            if (buttonView === viewName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
}
