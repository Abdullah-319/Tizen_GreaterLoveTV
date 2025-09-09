// Greater Love Network - Home View
// Converted from Swift HomeView.swift to JavaScript

class HomeView {
    constructor(apiService, progressManager) {
        this.apiService = apiService;
        this.progressManager = progressManager;
        this.container = null;
        this.focusedElement = null;
        this.focusIndex = 0;
        this.focusableElements = [];
        
        // Focus states for navigation - matching tvOS hierarchy
        this.smartCTAFocused = false;
        this.continueWatchingFocused = null;
        this.liveStreamsFocused = null;
        this.featuredShowsFocused = null;

        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        const container = document.getElementById('home-view');
        if (!container) return;

        this.container = container;

        container.innerHTML = `
            ${this.renderHeroSection()}
            ${this.renderContinueWatchingSection()}
            ${this.renderLiveStreamsSection()}
            ${this.renderFeaturedShowsSection()}
        `;

        this.updateFocusableElements();
    }

    renderHeroSection() {
        return `
            <section class="hero-section fade-in">
                <h1 class="hero-title">STREAM YOUR FAVORITE</h1>
                <p class="hero-subtitle">BIBLE TEACHERS IN ONE PLACE</p>
            </section>
        `;
    }

    renderContinueWatchingSection() {
        const continueWatchingVideos = this.progressManager.getContinueWatchingVideos();
        
        if (!continueWatchingVideos || continueWatchingVideos.length === 0) {
            return '';
        }

        return `
            <section class="section slide-in-up">
                <div class="section-header">
                    <h2 class="section-title">
                        <span class="section-icon">⏯️</span>
                        Continue Watching
                    </h2>
                </div>
                <div class="shows-grid">
                    ${continueWatchingVideos.map((video, index) => this.renderContinueWatchingCard(video, index)).join('')}
                </div>
            </section>
        `;
    }

    renderContinueWatchingCard(video, index) {
        const progress = this.progressManager.getProgress(video.id);
        const progressPercent = progress ? (progress.currentTime / progress.duration) * 100 : 0;

        return `
            <div class="show-card focusable continue-watching-card" 
                 tabindex="0" 
                 data-type="continue-watching" 
                 data-video-id="${video.id}"
                 data-index="${index}">
                <div class="show-category">Continue Watching</div>
                <h3 class="show-title">${video.fileName || 'Untitled'}</h3>
                <p class="show-author">${video.author || 'Greater Love Network'}</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="show-stats">
                    <span>${this.formatTime(progress ? progress.currentTime : 0)} / ${this.formatTime(progress ? progress.duration : 0)}</span>
                </div>
            </div>
        `;
    }

    renderLiveStreamsSection() {
        const liveStreams = this.apiService.liveStreams.filter(stream => stream.isValidForStreaming);

        return `
            <section class="section slide-in-up">
                <div class="section-header">
                    <h2 class="section-title">
                        <span class="section-icon">📡</span>
                        Live Streams
                    </h2>
                    <div class="live-indicator">
                        <div class="live-dot"></div>
                        <span>Live now</span>
                    </div>
                </div>
                <div class="live-streams-grid">
                    ${liveStreams.map((stream, index) => this.renderLiveStreamCard(stream, index)).join('')}
                </div>
            </section>
        `;
    }

    renderLiveStreamCard(stream, index) {
        const channelNumber = index + 1;
        const subtitle = `Greater Love TV ${channelNumber === 1 ? 'I' : 'II'}`;

        return `
            <div class="live-stream-card focusable" 
                 tabindex="0" 
                 data-type="live-stream" 
                 data-stream-id="${stream.id}"
                 data-index="${index}">
                <div class="stream-background"></div>
                <div class="stream-overlay">
                    <div class="stream-number">${channelNumber}</div>
                    <div class="stream-status ${stream.isOnline ? 'online' : 'offline'}">
                        <div class="stream-status-dot"></div>
                        ${stream.isOnline ? 'ONLINE' : 'OFFLINE'}
                    </div>
                    <div class="stream-info">
                        <div class="stream-title">GREATER LOVE TV</div>
                        <div class="stream-subtitle">${subtitle}</div>
                    </div>
                </div>
                <button class="stream-play-button" aria-label="Play ${stream.name}">▶</button>
            </div>
        `;
    }

    renderFeaturedShowsSection() {
        const featuredShows = this.apiService.getFeaturedShows(6);

        return `
            <section class="section slide-in-up">
                <div class="section-header">
                    <h2 class="section-title">
                        <span class="section-icon">🎬</span>
                        Featured Shows
                    </h2>
                </div>
                <div class="shows-grid" id="featured-shows-grid">
                    ${featuredShows.length > 0 ? 
                        featuredShows.map((show, index) => this.renderShowCard(show, index)).join('') :
                        this.renderLoadingState()
                    }
                </div>
            </section>
        `;
    }

    renderShowCard(show, index) {
        const categoryColor = ShowCategory.getColor(show.showCategory);
        const year = show.creationTime ? new Date(show.creationTime).getFullYear() : '';

        return `
            <div class="show-card focusable" 
                 tabindex="0" 
                 data-type="show" 
                 data-show-id="${show.id}"
                 data-index="${index}">
                <div class="show-category" style="background: ${categoryColor}">
                    ${show.showCategory || 'General'}
                </div>
                <h3 class="show-title">${show.displayName || show.name}</h3>
                <p class="show-author">${show.author || 'Greater Love Network'}</p>
                <div class="show-stats">
                    <span class="show-episodes">${show.episodeCount || 0} episodes</span>
                    <span class="show-year">${year}</span>
                </div>
            </div>
        `;
    }

    renderLoadingState() {
        return `
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading featured shows...</p>
            </div>
        `;
    }

    // MARK: - Event Listeners
    setupEventListeners() {
        if (!this.container) return;

        // Handle clicks on focusable elements
        this.container.addEventListener('click', (e) => {
            const focusableElement = e.target.closest('.focusable');
            if (focusableElement) {
                this.handleElementActivation(focusableElement);
            }
        });

        // Handle focus events
        this.container.addEventListener('focusin', (e) => {
            if (e.target.classList.contains('focusable')) {
                this.setFocusedElement(e.target);
            }
        });

        // Listen for API updates
        this.apiService.onShowsUpdate(() => {
            this.updateFeaturedShows();
        });

        this.apiService.onLiveStreamsUpdate(() => {
            this.updateLiveStreams();
        });
    }

    // MARK: - Navigation Methods
    updateFocusableElements() {
        this.focusableElements = Array.from(this.container.querySelectorAll('.focusable'));
    }

    setFocusedElement(element) {
        // Remove focus from previous element
        if (this.focusedElement) {
            this.focusedElement.classList.remove('focused');
        }

        // Set new focused element
        this.focusedElement = element;
        element.classList.add('focused');
        
        // Update focus index
        this.focusIndex = this.focusableElements.indexOf(element);
    }

    navigateLeft() {
        const currentRow = this.getCurrentRow();
        const currentCol = this.getCurrentColumn();
        
        if (currentCol > 0) {
            const newIndex = this.getElementIndex(currentRow, currentCol - 1);
            if (newIndex >= 0 && newIndex < this.focusableElements.length) {
                this.focusElementAt(newIndex);
            }
        }
    }

    navigateRight() {
        const currentRow = this.getCurrentRow();
        const currentCol = this.getCurrentColumn();
        const rowLength = this.getRowLength(currentRow);
        
        if (currentCol < rowLength - 1) {
            const newIndex = this.getElementIndex(currentRow, currentCol + 1);
            if (newIndex >= 0 && newIndex < this.focusableElements.length) {
                this.focusElementAt(newIndex);
            }
        }
    }

    navigateUp() {
        const currentRow = this.getCurrentRow();
        
        if (currentRow > 0) {
            const currentCol = this.getCurrentColumn();
            const newRowLength = this.getRowLength(currentRow - 1);
            const newCol = Math.min(currentCol, newRowLength - 1);
            const newIndex = this.getElementIndex(currentRow - 1, newCol);
            
            if (newIndex >= 0 && newIndex < this.focusableElements.length) {
                this.focusElementAt(newIndex);
            }
        }
    }

    navigateDown() {
        const currentRow = this.getCurrentRow();
        const totalRows = this.getTotalRows();
        
        if (currentRow < totalRows - 1) {
            const currentCol = this.getCurrentColumn();
            const newRowLength = this.getRowLength(currentRow + 1);
            const newCol = Math.min(currentCol, newRowLength - 1);
            const newIndex = this.getElementIndex(currentRow + 1, newCol);
            
            if (newIndex >= 0 && newIndex < this.focusableElements.length) {
                this.focusElementAt(newIndex);
            }
        }
    }

    // MARK: - Grid Navigation Helpers
    getCurrentRow() {
        // Determine which section the focused element is in
        if (!this.focusedElement) return 0;
        
        const type = this.focusedElement.getAttribute('data-type');
        const liveStreamCount = this.container.querySelectorAll('[data-type="live-stream"]').length;
        const continueWatchingCount = this.container.querySelectorAll('[data-type="continue-watching"]').length;
        
        let row = 0;
        if (continueWatchingCount > 0) {
            if (type === 'continue-watching') return row;
            row++;
        }
        
        if (liveStreamCount > 0) {
            if (type === 'live-stream') return row;
            row++;
        }
        
        if (type === 'show') return row;
        
        return 0;
    }

    getCurrentColumn() {
        if (!this.focusedElement) return 0;
        const index = parseInt(this.focusedElement.getAttribute('data-index') || '0');
        return index % this.getElementsPerRow();
    }

    getRowLength(row) {
        // This is a simplified calculation - in practice you'd need more sophisticated logic
        return this.getElementsPerRow();
    }

    getTotalRows() {
        let rows = 0;
        if (this.container.querySelectorAll('[data-type="continue-watching"]').length > 0) rows++;
        if (this.container.querySelectorAll('[data-type="live-stream"]').length > 0) rows++;
        if (this.container.querySelectorAll('[data-type="show"]').length > 0) rows++;
        return Math.max(rows, 1);
    }

    getElementIndex(row, col) {
        // This would need more sophisticated logic based on actual layout
        return row * this.getElementsPerRow() + col;
    }

    getElementsPerRow() {
        // Approximate elements per row based on screen width and card size
        const screenWidth = window.innerWidth || 1920;
        if (screenWidth < 1200) return 2;
        if (screenWidth < 1600) return 3;
        return 4;
    }

    focusElementAt(index) {
        if (index >= 0 && index < this.focusableElements.length) {
            const element = this.focusableElements[index];
            element.focus();
            this.setFocusedElement(element);
        }
    }

    // MARK: - Element Activation
    handleElementActivation(element) {
        const type = element.getAttribute('data-type');
        
        switch (type) {
            case 'live-stream':
                this.playLiveStream(element);
                break;
            case 'show':
                this.openShow(element);
                break;
            case 'continue-watching':
                this.continuePlaying(element);
                break;
        }
    }

    playLiveStream(element) {
        const streamId = element.getAttribute('data-stream-id');
        const stream = this.apiService.liveStreams.find(s => s.id === streamId);
        
        if (stream && window.VideoPlayer) {
            window.VideoPlayer.playLiveStream(stream);
        }
    }

    openShow(element) {
        const showId = element.getAttribute('data-show-id');
        const show = this.apiService.findShow(showId);
        
        if (show && show.episodes && show.episodes.length > 0) {
            const firstEpisode = show.episodes[0];
            if (window.VideoPlayer) {
                window.VideoPlayer.playEpisode(firstEpisode);
            }
        } else {
            this.showError('No episodes available for this show.');
        }
    }

    continuePlaying(element) {
        const videoId = element.getAttribute('data-video-id');
        const progress = this.progressManager.getProgress(videoId);
        
        if (progress && window.VideoPlayer) {
            // Find the episode and resume playback
            const episode = this.apiService.findEpisode(videoId);
            if (episode) {
                window.VideoPlayer.playEpisode(episode, progress.currentTime);
            }
        }
    }

    // MARK: - Update Methods
    updateFeaturedShows() {
        const grid = this.container.querySelector('#featured-shows-grid');
        if (!grid) return;

        const featuredShows = this.apiService.getFeaturedShows(6);
        grid.innerHTML = featuredShows.length > 0 ? 
            featuredShows.map((show, index) => this.renderShowCard(show, index)).join('') :
            this.renderLoadingState();
        
        this.updateFocusableElements();
    }

    updateLiveStreams() {
        // Re-render live streams section if needed
        this.render();
    }

    // MARK: - Utility Methods
    formatTime(seconds) {
        if (!seconds || seconds <= 0) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }

    showError(message) {
        // Create error overlay
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        this.container.appendChild(errorDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }

    // MARK: - Public Interface
    focus() {
        if (this.focusableElements.length > 0) {
            this.focusElementAt(0);
        }
    }

    handleKeyPress(direction) {
        switch (direction) {
            case 'left':
                this.navigateLeft();
                break;
            case 'right':
                this.navigateRight();
                break;
            case 'up':
                this.navigateUp();
                break;
            case 'down':
                this.navigateDown();
                break;
            case 'enter':
                if (this.focusedElement) {
                    this.handleElementActivation(this.focusedElement);
                }
                break;
        }
    }

    // MARK: - Cleanup
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.focusedElement = null;
        this.focusableElements = [];
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.HomeView = HomeView;
}