// Shows View - Display all shows with filtering
class ShowsView {
    constructor(apiService, progressManager) {
        this.apiService = apiService;
        this.progressManager = progressManager;
        this.container = null;
        this.focusedElement = null;
        this.focusableElements = [];
        this.currentFilter = ShowCategory.ALL;
        this.init();
    }

    render() {
        const container = document.getElementById('shows-view');
        if (!container) return;

        container.innerHTML = `
            <section class="section">
                <div class="section-header">
                    <h2 class="section-title">
                        <span class="section-icon">📺</span>
                        All Shows
                    </h2>
                    <div class="filter-buttons">
                        ${this.renderFilterButtons()}
                    </div>
                </div>
                <div class="shows-grid" id="shows-grid">
                    ${this.renderShows()}
                </div>
            </section>
        `;

        this.updateFocusableElements();
    }

    renderFilterButtons() {
        return ShowCategory.getAll().map(category => `
            <button class="filter-btn focusable ${this.currentFilter === category ? 'active' : ''}"
                    data-category="${category}"
                    tabindex="0">
                ${ShowCategory.getIcon(category)} ${category}
            </button>
        `).join('');
    }

    renderShows() {
        const shows = this.apiService.getShowsByCategory(this.currentFilter);
        return shows.map((show, index) => `
            <div class="show-card focusable" 
                 data-show-id="${show.id}"
                 data-index="${index}"
                 tabindex="0">
                <div class="show-category" 
                     style="background: ${ShowCategory.getColor(show.showCategory)}">
                    ${show.showCategory}
                </div>
                <h3 class="show-title">${show.displayName}</h3>
                <p class="show-author">${show.author}</p>
                <div class="show-stats">
                    <span class="show-episodes">${show.episodeCount} episodes</span>
                    <span>${new Date(show.creationTime).getFullYear()}</span>
                </div>
            </div>
        `).join('');
    }
}