// Main Application Entry Point
class GreaterLoveTVApp {
    constructor() {
        this.apiService = new CastrAPIService();
        this.progressManager = WatchProgressManager.shared;
        this.contentView = null;
        this.navigationHeader = null;
        this.videoPlayer = null;
        this.tizenHelper = new TizenHelper();
        
        this.init();
    }

    async init() {
        this.showLoadingScreen();
        
        try {
            // Initialize components
            this.navigationHeader = new NavigationHeader();
            this.videoPlayer = new VideoPlayer();
            this.contentView = new ContentView(this.apiService, this.progressManager);
            
            // Load content
            await this.apiService.fetchAllContent();
            
            // Setup global references
            window.apiService = this.apiService;
            window.VideoPlayer = this.videoPlayer;
            window.ContentView = this.contentView;
            
            // Initialize Tizen features
            this.tizenHelper.initialize();
            
            // Hide loading and show app
            this.hideLoadingScreen();
            
            // Setup keyboard navigation
            this.setupKeyboardNavigation();
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load the application');
        }
    }

    showLoadingScreen() {
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
    }

    hideLoadingScreen() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
    }

    handleKeyPress(event) {
        const key = event.keyCode || event.which;
        
        // Tizen TV remote key codes
        const keys = {
            LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40,
            ENTER: 13, RETURN: 10009, BACK: 461,
            RED: 403, GREEN: 404, YELLOW: 405, BLUE: 406
        };

        // Prevent default behavior
        event.preventDefault();

        // Handle video player keys first
        if (this.videoPlayer.isVisible) {
            switch (key) {
                case keys.RETURN:
                case keys.BACK:
                    this.videoPlayer.hide();
                    return;
                case keys.ENTER:
                    // Toggle play/pause
                    const video = document.getElementById('main-video-player');
                    if (video.paused) video.play();
                    else video.pause();
                    return;
            }
        }

        // Handle navigation keys
        switch (key) {
            case keys.LEFT:
                this.contentView.navigateLeft();
                break;
            case keys.RIGHT:
                this.contentView.navigateRight();
                break;
            case keys.UP:
                this.contentView.navigateUp();
                break;
            case keys.DOWN:
                this.contentView.navigateDown();
                break;
            case keys.ENTER:
                this.contentView.activateCurrentElement();
                break;
            case keys.RETURN:
            case keys.BACK:
                this.handleBackNavigation();
                break;
            case keys.RED:
                this.playQuickChannel(1);
                break;
            case keys.GREEN:
                this.playQuickChannel(2);
                break;
        }
    }

    playQuickChannel(channelNumber) {
        const streams = this.apiService.liveStreams;
        if (streams.length >= channelNumber) {
            this.videoPlayer.playLiveStream(streams[channelNumber - 1]);
        }
    }

    handleBackNavigation() {
        if (this.contentView.currentPage !== 'home') {
            this.contentView.navigateToPage('home');
        } else {
            this.tizenHelper.exitApp();
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.GreaterLoveApp = new GreaterLoveTVApp();
});