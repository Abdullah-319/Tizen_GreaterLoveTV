// js/views/categories-view.js - Categories View Component
class CategoriesView {
    constructor(app) {
        this.app = app;
        this.element = null;
        this.grid = null;
    }

    async init() {
        this.element = document.getElementById('categoriesView');
        this.grid = document.getElementById('allCategoriesGrid');
        console.log('CategoriesView initialized');
    }

    async updateWithData(appData) {
        this.renderAllCategories(appData.categories);
    }

    renderAllCategories(categories) {
        if (!this.grid) return;
        
        this.grid.innerHTML = '';
        
        if (!categories || categories.length === 0) {
            // Show loading cards
            for (let i = 0; i < 8; i++) {
                const loadingCard = this.createLoadingCategoryCard(i);
                this.grid.appendChild(loadingCard);
            }
            return;
        }
        
        categories.forEach((category, index) => {
            const card = this.createCategoryCard(category, index + 300);
            this.grid.appendChild(card);
        });
    }

    createCategoryCard(category, tabIndex) {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.tabIndex = tabIndex;
        
        card.innerHTML = `
            <div class="category-icon" style="background-color: ${category.color}">
                <span class="icon">${this.getCategoryIcon(category.icon)}</span>
            </div>
            <div class="category-info">
                <h3 class="category-title">${category.displayName}</h3>
                <p class="category-count">${category.showCount || 0} shows</p>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.filterByCategory(category);
        });
        
        return card;
    }

    createLoadingCategoryCard(index) {
        const card = document.createElement('div');
        card.className = 'loading-card category';
        
        card.innerHTML = `
            <div class="category-icon loading">
                <div class="loading-shimmer"></div>
            </div>
            <div class="category-info">
                <div class="loading-text title"></div>
                <div class="loading-text subtitle"></div>
            </div>
        `;
        
        return card;
    }

    getCategoryIcon(iconName) {
        const icons = {
            grid: '⋮⋯⋮',
            star: '⭐',
            tv: '📺',
            film: '🎬',
            play: '▶️',
            book: '📖',
            music: '🎵',
            eye: '👁️'
        };
        return icons[iconName] || '📺';
    }

    filterByCategory(category) {
        this.app.showToast(`Filtering by ${category.displayName}`, 'info');
        // Here you would implement category filtering logic
        // For now, just show a toast message
    }

    onActivate() {
        if (this.app.focusManager) {
            const firstFocusable = this.element.querySelector('[tabindex]');
            if (firstFocusable) {
                this.app.focusManager.setFocus(firstFocusable);
            }
        }
    }
}
