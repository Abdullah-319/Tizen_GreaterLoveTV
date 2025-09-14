// js/components/CardComponents.js - Professional Card Components
// Recreated from iOS CardComponents.swift with same functionality and design

class CardComponents {
    constructor(app) {
        this.app = app;
        this.thumbnailCache = new Map();
        this.loadingStates = new Map();
    }

    // MARK: - VideoDataCard (main content card)
    createVideoDataCard(video, index = 0, options = {}) {
        const card = document.createElement('div');
        card.className = 'video-data-card video-card';
        card.tabIndex = index + 100;
        card.dataset.videoId = video.id;

        // Card structure matching iOS design
        card.innerHTML = `
            <div class="video-thumbnail-container">
                <img class="video-thumbnail" src="${this.getThumbnailUrl(video)}" alt="${video.displayTitle}" loading="lazy">
                <div class="video-overlay">
                    <div class="play-button">
                        <span class="play-icon">▶</span>
                    </div>
                </div>
                <div class="video-duration">${video.formattedDuration || '0:00'}</div>
                ${this.getProgressBar(video)}
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.displayTitle}</h3>
                <p class="video-description">${this.truncateText(video.description || '', 100)}</p>
                <div class="video-metadata">
                    <span class="video-author">${video.author || 'Greater Love TV'}</span>
                    <span class="metadata-separator">•</span>
                    <span class="video-date">${this.formatDate(video.createdAt)}</span>
                </div>
            </div>
        `;

        // Professional interaction handling
        this.setupVideoCardInteractions(card, video);

        // Professional thumbnail loading
        this.loadThumbnail(card, video);

        return card;
    }

    // MARK: - CategoryCard (category selection card)
    createCategoryCard(category, index = 0) {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.tabIndex = index + 200;
        card.dataset.categoryId = category.id;

        // Apply category color gradient
        const gradient = this.getCategoryGradient(category.color);

        card.innerHTML = `
            <div class="category-background" style="background: ${gradient}"></div>
            <div class="category-content">
                <div class="category-icon">
                    ${this.getCategoryIcon(category.icon)}
                </div>
                <h3 class="category-name">${category.displayName}</h3>
                <p class="category-count">${category.showCount} shows</p>
            </div>
            <div class="category-overlay"></div>
        `;

        // Professional focus and interaction
        this.setupCategoryCardInteractions(card, category);

        return card;
    }

    // MARK: - ShowCircleCard (circular show card for featured content)
    createShowCircleCard(show, index = 0) {
        const card = document.createElement('div');
        card.className = 'show-circle-card';
        card.tabIndex = index + 300;
        card.dataset.showId = show.id;

        card.innerHTML = `
            <div class="circle-thumbnail-container">
                <img class="circle-thumbnail" src="${show.thumbnailUrl}" alt="${show.displayName}" loading="lazy">
                <div class="circle-overlay">
                    <div class="circle-play-button">
                        <span class="play-icon">▶</span>
                    </div>
                </div>
                ${this.getCircularProgress(show)}
            </div>
            <div class="circle-info">
                <h4 class="circle-title">${show.displayName}</h4>
                <p class="circle-episodes">${show.episodeCount} episodes</p>
            </div>
        `;

        this.setupShowCardInteractions(card, show);
        return card;
    }

    // MARK: - LiveStreamCard (live streaming card)
    createLiveStreamCard(stream, index = 0) {
        const card = document.createElement('div');
        card.className = 'live-stream-card';
        card.tabIndex = index + 400;
        card.dataset.streamId = stream.id;

        // Add live status class
        if (stream.isOnline) {
            card.classList.add('live-online');
        }

        card.innerHTML = `
            <div class="stream-thumbnail-container">
                <img class="stream-thumbnail" src="${stream.thumbnailUrl || 'images/logo.png'}" alt="${stream.displayName}" loading="lazy">
                <div class="stream-overlay">
                    <div class="stream-play-button">
                        <span class="play-icon">▶</span>
                    </div>
                </div>
                <div class="live-indicator ${stream.isOnline ? 'online' : 'offline'}">
                    <span class="live-dot"></span>
                    <span class="live-text">${stream.displayStatus}</span>
                </div>
                ${stream.channelNumber ? `<div class="channel-number">${stream.channelNumber}</div>` : ''}
            </div>
            <div class="stream-info">
                <h3 class="stream-title">${stream.displayName}</h3>
                <p class="stream-description">Live spiritual content and inspirational programming</p>
                <div class="stream-metadata">
                    <span class="stream-network">${stream.networkName || 'Greater Love TV'}</span>
                </div>
            </div>
        `;

        this.setupLiveStreamCardInteractions(card, stream);

        // Add pulsing animation for online streams
        if (stream.isOnline) {
            this.addPulseAnimation(card);
        }

        return card;
    }

    // MARK: - ContinueWatchingCard (watch progress card)
    createContinueWatchingCard(item, index = 0) {
        const card = document.createElement('div');
        card.className = 'continue-watching-card video-card';
        card.tabIndex = index + 500;
        card.dataset.videoId = item.video?.id || item.id;

        const progress = this.getWatchProgress(item);
        const resumeTime = this.formatTime(item.resumeTime || 0);

        card.innerHTML = `
            <div class="video-thumbnail-container">
                <img class="video-thumbnail" src="${this.getThumbnailUrl(item.video || item)}" alt="${item.title || item.video?.displayTitle}" loading="lazy">
                <div class="video-overlay">
                    <div class="resume-button">
                        <span class="resume-icon">▶</span>
                        <span class="resume-text">Resume</span>
                    </div>
                </div>
                <div class="progress-overlay">
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="resume-time">${resumeTime}</div>
                </div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${item.title || item.video?.displayTitle}</h3>
                <p class="video-show">${item.showName || 'Greater Love TV'}</p>
                <div class="watch-progress-text">${Math.round(progress)}% watched</div>
            </div>
        `;

        this.setupContinueWatchingInteractions(card, item);
        return card;
    }

    // MARK: - Professional Interaction Handlers
    setupVideoCardInteractions(card, video) {
        card.addEventListener('click', () => {
            this.app.playVideo({
                title: video.displayTitle,
                description: video.description,
                streamUrl: video.bestPlaybackUrl,
                thumbnail: video.thumbnailUrl,
                isEpisode: true
            });
        });

        // Professional focus effects
        card.addEventListener('focus', () => {
            card.classList.add('focused');
            this.animateCardFocus(card);
        });

        card.addEventListener('blur', () => {
            card.classList.remove('focused');
        });
    }

    setupCategoryCardInteractions(card, category) {
        card.addEventListener('click', () => {
            this.app.navigateToCategory(category);
        });

        card.addEventListener('focus', () => {
            card.classList.add('focused');
            this.animateCategoryFocus(card);
        });

        card.addEventListener('blur', () => {
            card.classList.remove('focused');
        });
    }

    setupShowCardInteractions(card, show) {
        card.addEventListener('click', () => {
            this.app.showShowDetail(show);
        });

        card.addEventListener('focus', () => {
            card.classList.add('focused');
            this.animateShowFocus(card);
        });

        card.addEventListener('blur', () => {
            card.classList.remove('focused');
        });
    }

    setupLiveStreamCardInteractions(card, stream) {
        card.addEventListener('click', () => {
            this.app.playVideo({
                title: stream.displayName,
                description: `Live broadcast from ${stream.displayName}`,
                streamUrl: stream.bestStreamURL,
                thumbnail: stream.thumbnailUrl,
                isLive: true
            });
        });

        card.addEventListener('focus', () => {
            card.classList.add('focused');
            this.animateLiveStreamFocus(card);
        });

        card.addEventListener('blur', () => {
            card.classList.remove('focused');
        });
    }

    setupContinueWatchingInteractions(card, item) {
        card.addEventListener('click', () => {
            this.app.resumeVideo(item);
        });

        card.addEventListener('focus', () => {
            card.classList.add('focused');
        });

        card.addEventListener('blur', () => {
            card.classList.remove('focused');
        });
    }

    // MARK: - Professional Animation Methods
    animateCardFocus(card) {
        card.style.transform = 'scale(1.05)';
        card.style.transition = 'all 0.2s ease-out';
        card.style.boxShadow = '0 8px 25px rgba(0, 122, 255, 0.4)';
    }

    animateCategoryFocus(card) {
        card.style.transform = 'scale(1.08)';
        card.style.transition = 'all 0.2s ease-out';

        const overlay = card.querySelector('.category-overlay');
        if (overlay) {
            overlay.style.opacity = '0.2';
            overlay.style.background = 'rgba(255, 255, 255, 0.2)';
        }
    }

    animateShowFocus(card) {
        card.style.transform = 'scale(1.1)';
        card.style.transition = 'all 0.2s ease-out';
        card.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.3)';
    }

    animateLiveStreamFocus(card) {
        card.style.transform = 'scale(1.05)';
        card.style.transition = 'all 0.2s ease-out';

        const indicator = card.querySelector('.live-indicator');
        if (indicator && card.classList.contains('live-online')) {
            indicator.style.animation = 'pulse 1s infinite';
        }
    }

    addPulseAnimation(card) {
        const indicator = card.querySelector('.live-indicator');
        if (indicator) {
            indicator.style.animation = 'livePulse 2s infinite ease-in-out';
        }
    }

    // MARK: - Professional Utility Methods
    getThumbnailUrl(video) {
        return video.thumbnailUrl || video.thumbnail || 'images/logo.png';
    }

    getProgressBar(video) {
        const progress = this.getWatchProgress(video);
        if (progress > 0) {
            return `
                <div class="video-progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            `;
        }
        return '';
    }

    getCircularProgress(show) {
        const latestEpisode = show.latestEpisode;
        if (latestEpisode) {
            const progress = this.getWatchProgress(latestEpisode);
            if (progress > 0) {
                return `
                    <div class="circular-progress">
                        <svg viewBox="0 0 36 36" class="circular-chart">
                            <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path class="circle" stroke-dasharray="${progress}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                    </div>
                `;
            }
        }
        return '';
    }

    getCategoryGradient(color) {
        const baseColor = color || '#007AFF';
        const rgb = this.hexToRgb(baseColor);
        return `linear-gradient(135deg, ${baseColor} 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7) 100%)`;
    }

    getCategoryIcon(iconName) {
        const icons = {
            'book': '📖',
            'music': '🎵',
            'tv': '📺',
            'star': '⭐',
            'film': '🎬',
            'eye': '👁️',
            'heart': '❤️'
        };
        return icons[iconName] || '📺';
    }

    getWatchProgress(item) {
        if (this.app.progressManager) {
            return this.app.progressManager.getProgress(item.id) || 0;
        }
        return item.watchProgress || 0;
    }

    loadThumbnail(card, video) {
        const img = card.querySelector('.video-thumbnail, .circle-thumbnail, .stream-thumbnail');
        if (!img) return;

        const thumbnailUrl = this.getThumbnailUrl(video);

        if (this.thumbnailCache.has(thumbnailUrl)) {
            img.src = this.thumbnailCache.get(thumbnailUrl);
            return;
        }

        // Show loading state
        img.classList.add('loading');

        const tempImage = new Image();
        tempImage.onload = () => {
            this.thumbnailCache.set(thumbnailUrl, thumbnailUrl);
            img.src = thumbnailUrl;
            img.classList.remove('loading');
            img.classList.add('loaded');
        };

        tempImage.onerror = () => {
            img.src = 'images/logo.png';
            img.classList.remove('loading');
            img.classList.add('error');
        };

        tempImage.src = thumbnailUrl;
    }

    // MARK: - Helper Methods
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    formatDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return '1 day ago';
        if (diffDays < 30) return `${diffDays} days ago`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
        return `${Math.ceil(diffDays / 365)} years ago`;
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 0, g: 122, b: 255};
    }
}

// Export for use in other files
window.CardComponents = CardComponents;