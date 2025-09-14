// js/views/home-view.js - Home View Component
class HomeView {
    constructor(app) {
        this.app = app;
        this.element = null;
        this.sections = {};
    }

    async init() {
        this.element = document.getElementById('homeView');
        this.sections = {
            continueWatching: document.getElementById('continueWatchingSection'),
            liveStreams: document.getElementById('liveStreamsSection'),
            categories: document.getElementById('categoriesSection'),
            shows: document.getElementById('showsSection')
        };

        // Setup CTA button handler
        this.setupCtaButton();

        console.log('HomeView initialized');
    }

    setupCtaButton() {
        const ctaButton = document.querySelector('.smart-cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                this.app.navigateToView('shows');
            });
        }
    }

    async updateWithData(appData) {
        console.log('Home view updating with data:', appData);

        this.renderContinueWatching(appData.continueWatching);
        this.renderLiveStreams(appData.liveStreams);
        this.renderCategories(appData.categories.slice(0, 6)); // Show first 6 categories

        // Organize shows by category like Apple TV
        this.renderShowsByCategory(appData.shows, appData.categories);
    }

    renderShowsByCategory(shows, categories) {
        const showsSection = document.getElementById('showsSection');
        const grid = document.getElementById('showsGrid');

        // Clear existing content
        grid.innerHTML = '';

        if (!shows || shows.length === 0) {
            shows = this.getFallbackShows();
        }

        // Group shows by category
        const showsByCategory = this.groupShowsByCategory(shows, categories);

        // Create sections for each category that has shows
        Object.entries(showsByCategory).forEach(([categoryName, categoryShows]) => {
            if (categoryShows.length > 0) {
                const categorySection = this.createCategorySection(categoryName, categoryShows);
                grid.appendChild(categorySection);
            }
        });
    }

    groupShowsByCategory(shows, categories) {
        const grouped = {};

        // Initialize with categories
        categories.forEach(cat => {
            if (cat.name !== 'All') {
                grouped[cat.displayName || cat.name] = [];
            }
        });

        // Add shows to their categories
        shows.forEach(show => {
            const categoryName = show.category || 'Other';

            // Find matching category display name
            const category = categories.find(cat => cat.name === categoryName || cat.displayName === categoryName);
            const displayName = category ? (category.displayName || category.name) : categoryName;

            if (!grouped[displayName]) {
                grouped[displayName] = [];
            }
            grouped[displayName].push(show);
        });

        return grouped;
    }

    createCategorySection(categoryName, shows) {
        const section = document.createElement('div');
        section.className = 'category-shows-section';
        section.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">${categoryName}</h2>
                <div class="section-count">${shows.length} shows</div>
            </div>
            <div class="shows-horizontal-grid"></div>
        `;

        const horizontalGrid = section.querySelector('.shows-horizontal-grid');

        shows.forEach((show, index) => {
            const card = this.createShowCard(show, 200 + index);
            horizontalGrid.appendChild(card);
        });

        return section;
    }

    getFallbackShows() {
        return [
            {
                id: 1,
                name: "Sunday Morning Worship",
                displayName: "Sunday Morning Worship",
                category: "Teaching",
                episodeCount: 52,
                thumbnail: "images/logo.png",
                description: "Join us every Sunday for uplifting worship and inspiring messages"
            },
            {
                id: 2,
                name: "Bible Study Sessions",
                displayName: "Bible Study Sessions",
                category: "Teaching",
                episodeCount: 104,
                thumbnail: "images/logo.png",
                description: "Deep dive into Scripture with our weekly Bible study"
            },
            {
                id: 3,
                name: "Youth Ministry",
                displayName: "Youth Ministry",
                category: "Teaching",
                episodeCount: 36,
                thumbnail: "images/logo.png",
                description: "Engaging content designed for our younger congregation"
            },
            {
                id: 4,
                name: "Prayer & Meditation",
                displayName: "Prayer & Meditation",
                category: "Worship",
                episodeCount: 78,
                thumbnail: "images/logo.png",
                description: "Guided prayer sessions and meditation practices"
            },
            {
                id: 5,
                name: "Community Outreach",
                displayName: "Community Outreach",
                category: "Teaching",
                episodeCount: 24,
                thumbnail: "images/logo.png",
                description: "Stories from our community service and outreach programs"
            },
            {
                id: 6,
                name: "Worship Music",
                displayName: "Worship Music",
                category: "Worship",
                episodeCount: 89,
                thumbnail: "images/logo.png",
                description: "Beautiful worship songs and hymns for spiritual reflection"
            }
        ];
    }

    renderContinueWatching(continueWatching) {
        const grid = document.getElementById('continueWatchingGrid');
        const section = this.sections.continueWatching;
        
        if (!continueWatching || continueWatching.length === 0) {
            section.classList.add('hidden');
            return;
        }
        
        section.classList.remove('hidden');
        grid.innerHTML = '';
        
        continueWatching.forEach((item, index) => {
            const card = this.createContinueWatchingCard(item, index);
            grid.appendChild(card);
        });
    }

    renderLiveStreams(liveStreams) {
        const grid = document.getElementById('liveStreamsGrid');
        grid.innerHTML = '';
        
        if (!liveStreams || liveStreams.length === 0) {
            // Show loading cards
            for (let i = 0; i < 2; i++) {
                const loadingCard = this.createLoadingLiveStreamCard(i);
                grid.appendChild(loadingCard);
            }
            return;
        }
        
        liveStreams.forEach((stream, index) => {
            const card = this.createLiveStreamCard(stream, index);
            grid.appendChild(card);
        });
    }

    renderCategories(categories) {
        const grid = document.getElementById('categoriesGrid');
        grid.innerHTML = '';
        
        if (!categories || categories.length === 0) {
            // Show loading cards
            for (let i = 0; i < 6; i++) {
                const loadingCard = this.createLoadingCategoryCard(i);
                grid.appendChild(loadingCard);
            }
            return;
        }
        
        categories.forEach((category, index) => {
            const card = this.createCategoryCard(category, index + 50);
            grid.appendChild(card);
        });
    }


    createContinueWatchingCard(item, index) {
        const card = document.createElement('div');
        card.className = 'video-card continue-watching-card';
        card.tabIndex = 30 + index;
        
        const progressPercent = Math.round((item.currentTime / item.duration) * 100);
        
        card.innerHTML = `
            <div class="video-thumbnail">
                <img src="${item.thumbnail || 'images/icon.png'}" alt="${item.title}" loading="lazy">
                <div class="video-overlay">
                    <div class="play-button">
                        <span>▶</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${item.title}</h3>
                <p class="video-subtitle">${item.showName}</p>
                <p class="video-progress">${progressPercent}% watched</p>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.app.playVideo(item);
        });
        
        return card;
    }

    createLiveStreamCard(stream, index) {
        // Use professional card components if available
        if (this.app.cardComponents) {
            return this.app.cardComponents.createLiveStreamCard(stream, 40 + index);
        }

        // Fallback to basic card
        const card = document.createElement('div');
        card.className = 'live-stream-card video-card';
        card.tabIndex = 40 + index;
        
        const channelNumber = stream.channelNumber || (index + 1);
        const channelName = stream.displayName || `Greater Love TV ${channelNumber}`;
        
        card.innerHTML = `
            <div class="live-thumbnail">
                <img src="${stream.thumbnail || 'images/icon.png'}" alt="${channelName}" loading="lazy">
                <div class="live-overlay">
                    <div class="live-network-name">GREATER LOVE TV</div>
                    <div class="live-channel-number">${channelNumber}</div>
                </div>
                <div class="live-status">
                    <div class="status-indicator ${stream.broadcasting_status === 'online' ? 'online' : 'offline'}"></div>
                    <span class="status-text">${(stream.broadcasting_status || 'offline').toUpperCase()}</span>
                </div>
                <div class="live-play-button">
                    <span>▶</span>
                </div>
            </div>
            <div class="live-info">
                <h3 class="live-title">${channelName}</h3>
                <p class="live-subtitle">${stream.name}</p>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.playLiveStream(stream);
        });
        
        return card;
    }

    createCategoryCard(category, tabIndex) {
        // Use professional card components if available
        if (this.app.cardComponents) {
            return this.app.cardComponents.createCategoryCard(category, tabIndex);
        }

        // Fallback to basic card
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
            this.app.showView('categories');
        });
        
        return card;
    }

    createShowCard(show, tabIndex) {
        // Use professional card components if available
        if (this.app.cardComponents) {
            return this.app.cardComponents.createVideoDataCard(show, tabIndex);
        }

        // Fallback to basic card
        const card = document.createElement('div');
        card.className = 'video-data-card video-card show-card';
        card.tabIndex = tabIndex;

        card.innerHTML = `
            <div class="video-thumbnail-container">
                <img src="${show.thumbnailUrl || show.thumbnail || 'images/logo.png'}" alt="${show.displayName}" class="video-thumbnail" loading="lazy">
                <div class="video-overlay">
                    <div class="play-button">
                        <span class="play-icon">▶</span>
                    </div>
                </div>
                <div class="episode-count">${show.episodeCount} episodes</div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${show.displayName}</h3>
                <p class="video-subtitle">${show.displayCategory || show.category}</p>
                <p class="video-description">${show.description}</p>
            </div>
        `;

        card.addEventListener('click', () => {
            this.app.showShowDetail(show);
        });

        return card;
    }

    createLoadingLiveStreamCard(index) {
        const card = document.createElement('div');
        card.className = 'loading-card live';
        
        const channelNumber = index + 1;
        const channelName = `Greater Love TV ${index === 0 ? 'I' : 'II'}`;
        
        card.innerHTML = `
            <div class="live-thumbnail loading">
                <div class="loading-shimmer"></div>
                <div class="live-overlay">
                    <div class="live-network-name">GREATER LOVE TV</div>
                    <div class="live-channel-number">${channelNumber}</div>
                </div>
            </div>
            <div class="live-info">
                <h3 class="live-title">${channelName}</h3>
                <div class="loading-text"></div>
            </div>
        `;
        
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

    playLiveStream(stream) {
        const videoData = {
            title: stream.displayName || stream.name || 'Greater Love TV Live',
            description: `Live broadcast - ${stream.name || 'Inspirational Christian content'}`,
            streamUrl: stream.streamUrl,
            isLive: true
        };

        console.log('Playing live stream:', videoData);
        this.app.playVideo(videoData);
    }

    onActivate() {
        // Update focus when view is activated
        if (this.app.focusManager) {
            const firstFocusable = this.element.querySelector('[tabindex]');
            if (firstFocusable) {
                this.app.focusManager.setFocus(firstFocusable);
            }
        }
    }
}
