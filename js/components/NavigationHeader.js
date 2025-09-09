// Navigation Header Component
class NavigationHeader {
    constructor() {
        this.activeTab = 'home';
        this.focusedNavItem = null;
        this.render();
        this.setupEventListeners();
    }

    render() {
        const container = document.getElementById('navigation-header');
        if (!container) return;

        container.innerHTML = `
            <div class="navigation-header">
                <div class="header-content">
                    <div class="logo">
                        <div class="logo-icon">GL</div>
                        <div class="logo-text">GREATER LOVE NETWORK</div>
                    </div>
                    <nav class="nav-menu">
                        <div class="nav-item focusable ${this.activeTab === 'home' ? 'active' : ''}" 
                             data-page="home" tabindex="0">HOME</div>
                        <div class="nav-item focusable ${this.activeTab === 'shows' ? 'active' : ''}" 
                             data-page="shows" tabindex="0">SHOWS</div>
                        <div class="nav-item focusable ${this.activeTab === 'categories' ? 'active' : ''}" 
                             data-page="categories" tabindex="0">CATEGORIES</div>
                        <div class="nav-item focusable ${this.activeTab === 'about' ? 'active' : ''}" 
                             data-page="about" tabindex="0">ABOUT</div>
                    </nav>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const container = document.getElementById('navigation-header');
        if (!container) return;

        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-item')) {
                this.setActiveTab(e.target.dataset.page);
            }
        });
    }

    setActiveTab(tabName) {
        this.activeTab = tabName;
        this.render();
        
        // Notify ContentView of tab change
        if (window.ContentView) {
            window.ContentView.navigateToPage(tabName);
        }
    }
}