// Categories View - Browse by category
class CategoriesView {
    constructor(apiService) {
        this.apiService = apiService;
        this.container = null;
        this.init();
    }

    render() {
        const container = document.getElementById('categories-view');
        if (!container) return;

        container.innerHTML = `
            <section class="section">
                <div class="section-header">
                    <h2 class="section-title">
                        <span class="section-icon">📂</span>
                        Browse Categories
                    </h2>
                </div>
                <div class="categories-grid">
                    ${this.renderCategories()}
                </div>
            </section>
        `;
    }

    renderCategories() {
        const collections = this.apiService.showCollections;
        return collections.map((collection, index) => `
            <div class="category-card focusable" 
                 data-category="${collection.category}"
                 data-index="${index}"
                 tabindex="0">
                <div class="category-icon">
                    ${ShowCategory.getIcon(collection.category)}
                </div>
                <h3 class="category-name">${collection.displayTitle}</h3>
                <div class="category-stats">
                    <span>${collection.showCount} shows</span>
                    <span>${collection.totalEpisodes} episodes</span>
                </div>
            </div>
        `).join('');
    }
}