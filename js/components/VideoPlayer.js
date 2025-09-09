// Video Player Component
class VideoPlayer {
    constructor() {
        this.currentVideo = null;
        this.isPlaying = false;
        this.isVisible = false;
        this.progressManager = WatchProgressManager.shared;
        this.render();
        this.setupEventListeners();
    }

    render() {
        const container = document.getElementById('video-player-overlay');
        if (!container) return;

        container.innerHTML = `
            <div class="video-player">
                <video id="main-video-player" controls>
                    Your browser does not support video playback.
                </video>
                <div class="video-controls">
                    <button class="control-btn focusable" id="play-pause-btn" tabindex="0">⏯️</button>
                    <button class="control-btn focusable" id="mute-btn" tabindex="0">🔊</button>
                    <button class="control-btn focusable" id="fullscreen-btn" tabindex="0">⛶</button>
                </div>
                <button class="close-btn focusable" id="close-video-btn" tabindex="0">✕</button>
            </div>
        `;
    }

    playLiveStream(stream) {
        const video = document.getElementById('main-video-player');
        if (!video || !stream.bestStreamURL) return;

        this.currentVideo = stream;
        video.src = stream.bestStreamURL;
        this.show();
        
        video.load();
        video.play().catch(error => {
            console.error('Failed to play stream:', error);
            this.showError('Failed to play live stream');
        });
    }

    playEpisode(episode, startTime = 0) {
        if (!episode.isPlayable) {
            this.showError('This episode is not available for playback');
            return;
        }

        const video = document.getElementById('main-video-player');
        if (!video) return;

        this.currentVideo = episode;
        
        if (episode.playback.hls_url) {
            video.src = episode.playback.hls_url;
            video.currentTime = startTime;
            this.show();
            video.load();
            video.play();
        } else if (episode.playback.embed_url) {
            // Extract direct URL from embed
            this.extractAndPlay(episode.playback.embed_url, startTime);
        }
    }

    async extractAndPlay(embedUrl, startTime = 0) {
        try {
            const directUrl = await window.apiService.extractMP4URL(embedUrl);
            if (directUrl) {
                const video = document.getElementById('main-video-player');
                video.src = directUrl;
                video.currentTime = startTime;
                this.show();
                video.load();
                video.play();
            } else {
                this.showError('Unable to extract video URL');
            }
        } catch (error) {
            console.error('Failed to extract video URL:', error);
            this.showError('Failed to load video');
        }
    }

    show() {
        const overlay = document.getElementById('video-player-overlay');
        overlay.classList.add('active');
        this.isVisible = true;
        
        // Focus the close button for navigation
        setTimeout(() => {
            document.getElementById('close-video-btn').focus();
        }, 100);
    }

    hide() {
        const overlay = document.getElementById('video-player-overlay');
        const video = document.getElementById('main-video-player');
        
        if (video) {
            this.saveProgress();
            video.pause();
            video.src = '';
        }
        
        overlay.classList.remove('active');
        this.isVisible = false;
    }

    saveProgress() {
        const video = document.getElementById('main-video-player');
        if (video && this.currentVideo && !this.currentVideo.bestStreamURL) {
            // Only save progress for episodes, not live streams
            this.progressManager.saveProgress(
                this.currentVideo.id,
                video.currentTime,
                video.duration
            );
        }
    }

    setupEventListeners() {
        document.getElementById('close-video-btn').addEventListener('click', () => this.hide());
        
        const video = document.getElementById('main-video-player');
        video.addEventListener('timeupdate', () => {
            if (this.currentVideo && !this.currentVideo.bestStreamURL) {
                // Save progress every 10 seconds for episodes
                if (Math.floor(video.currentTime) % 10 === 0) {
                    this.saveProgress();
                }
            }
        });
    }
}