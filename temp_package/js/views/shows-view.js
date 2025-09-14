// js/views/shows-view.js - Shows View Component
class ShowsView {
    constructor(app) {
        this.app = app;
        this.element = null;
        this.grid = null;
    }

    async init() {
        this.element = document.getElementById('showsView');
        this.grid = document.getElementById('allShowsGrid');
        console.log('ShowsView initialized');
    }

    async updateWithData(appData) {
        this.renderAllShows(appData.shows);
    }

    renderAllShows(shows) {
        if (!this.grid) return;
        
        this.grid.innerHTML = '';
        
        if (!shows || shows.length === 0) {
            // Show loading cards
            for (let i = 0; i < 12; i++) {
                const loadingCard = this.createLoadingShowCard(i);
                this.grid.appendChild(loadingCard);
            }
            return;
        }
        
        shows.forEach((show, index) => {
            const card = this.createShowCard(show, index + 200);
            this.grid.appendChild(card);
        });
    }

    createShowCard(show, tabIndex) {
        const card = document.createElement('div');
        card.className = 'video-card show-card';
        card.tabIndex = tabIndex;
        
        card.innerHTML = `
            <div class="video-thumbnail">
                <img src="${show.thumbnail || 'images/icon.png'}" alt="${show.displayName}" loading="lazy">
                <div class="video-overlay">
                    <div class="play-button">
                        <span>▶</span>
                    </div>
                    <div class="episode-count">${show.episodeCount} episodes</div>
                </div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${show.displayName}</h3>
                <p class="video-subtitle">${show.category}</p>
                <p class="video-description">${show.description}</p>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.app.playVideo(show);
        });
        
        return card;
    }

    createLoadingShowCard(index) {
        const card = document.createElement('div');
        card.className = 'loading-card show';
        
        card.innerHTML = `
            <div class="video-thumbnail loading">
                <div class="loading-shimmer"></div>
            </div>
            <div class="video-info">
                <div class="loading-text title"></div>
                <div class="loading-text subtitle"></div>
                <div class="loading-text description"></div>
            </div>
        `;
        
        return card;
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