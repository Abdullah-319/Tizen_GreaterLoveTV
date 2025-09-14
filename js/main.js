/**
 * GreaterLove TV - Main Application Controller
 * Tizen TV Web Application
 */

// Application state management
const AppState = {
    initialized: false,
    currentScreen: 'main',
    isLoading: false,
    error: null
};

// TV Remote Key Codes
const TizenKeys = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ENTER: 13,
    BACK: 27,
    EXIT: 10182,
    RETURN: 10252,
    PLAY_PAUSE: 10252,
    VOLUME_UP: 7,
    VOLUME_DOWN: 11,
    VOLUME_MUTE: 8,
    CH_UP: 33,
    CH_DOWN: 34
};

// Main Application Class
class GreaterLoveTVController {
    constructor() {
        this.focusedElement = null;
        this.navigationStack = [];
        this.streamUrls = {
            live: 'https://your-stream-url.com/live',
            backup: 'https://backup-stream-url.com/live'
        };
        
        // Bind event handlers
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleApplicationEvent = this.handleApplicationEvent.bind(this);
        
        console.log('GreaterLove TV Controller initialized');
    }
    
    // Initialize the application
    initialize() {
        console.log('Initializing GreaterLove TV App...');
        
        try {
            // Set up Tizen application event handlers
            this.setupTizenEvents();
            
            // Set up keyboard navigation
            this.setupNavigation();
            
            // Set up video player
            this.setupVideoPlayer();
            
            // Load initial content
            this.loadInitialContent();
            
            // Hide splash screen
            this.hideSplashScreen();
            
            AppState.initialized = true;
            console.log('GreaterLove TV App successfully initialized');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Initialization failed. Please restart the app.');
        }
    }
    
    // Setup Tizen-specific event handlers
    setupTizenEvents() {
        if (typeof tizen !== 'undefined') {
            try {
                // Get current application
                const app = tizen.application.getCurrentApplication();
                
                // Handle app events
                app.addEventListener('exit', this.handleApplicationEvent);
                app.addEventListener('suspend', this.handleApplicationEvent);
                app.addEventListener('resume', this.handleApplicationEvent);
                
                console.log('Tizen events configured');
            } catch (error) {
                console.warn('Could not setup Tizen events:', error);
            }
        }
    }
    
    // Handle Tizen application events
    handleApplicationEvent(event) {
        console.log('Application event:', event.type);
        
        switch (event.type) {
            case 'exit':
                this.cleanup();
                break;
            case 'suspend':
                this.pauseVideo();
                break;
            case 'resume':
                this.resumeVideo();
                break;
        }
    }
    
    // Setup keyboard navigation
    setupNavigation() {
        document.addEventListener('keydown', this.handleKeyPress, true);
        console.log('Navigation setup complete');
    }
    
    // Handle key press events
    handleKeyPress(event) {
        const keyCode = event.keyCode || event.which;
        console.log('Key pressed:', keyCode);
        
        // Prevent default behavior
        event.preventDefault();
        event.stopPropagation();
        
        // Handle key based on current state
        if (AppState.isLoading) {
            // Only allow back key during loading
            if (keyCode === TizenKeys.BACK || keyCode === TizenKeys.RETURN) {
                this.cancelLoading();
            }
            return;
        }
        
        switch (keyCode) {
            case TizenKeys.LEFT:
                this.navigateLeft();
                break;
            case TizenKeys.RIGHT:
                this.navigateRight();
                break;
            case TizenKeys.UP:
                this.navigateUp();
                break;
            case TizenKeys.DOWN:
                this.navigateDown();
                break;
            case TizenKeys.ENTER:
                this.selectCurrent();
                break;
            case TizenKeys.BACK:
            case TizenKeys.RETURN:
                this.goBack();
                break;
            case TizenKeys.EXIT:
                this.exitApp();
                break;
            default:
                console.log('Unhandled key:', keyCode);
        }
    }
    
    // Navigation methods
    navigateLeft() {
        const current = this.getCurrentFocusedElement();
        const next = this.getNextFocusableElement('left', current);
        if (next) {
            this.setFocus(next);
        }
    }
    
    navigateRight() {
        const current = this.getCurrentFocusedElement();
        const next = this.getNextFocusableElement('right', current);
        if (next) {
            this.setFocus(next);
        }
    }
    
    navigateUp() {
        const current = this.getCurrentFocusedElement();
        const next = this.getNextFocusableElement('up', current);
        if (next) {
            this.setFocus(next);
        }
    }
    
    navigateDown() {
        const current = this.getCurrentFocusedElement();
        const next = this.getNextFocusableElement('down', current);
        if (next) {
            this.setFocus(next);
        }
    }
    
    // Get currently focused element
    getCurrentFocusedElement() {
        return document.querySelector('.menu-item.focused') || 
               document.querySelector('.menu-item:first-child');
    }
    
    // Get next focusable element based on direction
    getNextFocusableElement(direction, current) {
        const menuItems = Array.from(document.querySelectorAll('.menu-item'));
        const currentIndex = menuItems.indexOf(current);
        
        let nextIndex;
        
        switch (direction) {
            case 'left':
                nextIndex = currentIndex > 0 && currentIndex % 3 !== 0 ? currentIndex - 1 : currentIndex;
                break;
            case 'right':
                nextIndex = currentIndex < menuItems.length - 1 && (currentIndex + 1) % 3 !== 0 ? 
                           currentIndex + 1 : currentIndex;
                break;
            case 'up':
                nextIndex = currentIndex >= 3 ? currentIndex - 3 : currentIndex;
                break;
            case 'down':
                nextIndex = currentIndex < menuItems.length - 3 ? currentIndex + 3 : currentIndex;
                break;
            default:
                nextIndex = currentIndex;
        }
        
        return menuItems[nextIndex];
    }
    
    // Set focus to element
    setFocus(element) {
        // Remove previous focus
        document.querySelectorAll('.menu-item.focused').forEach(el => {
            el.classList.remove('focused');
        });
        
        // Set new focus
        if (element) {
            element.classList.add('focused');
            element.focus();
            this.focusedElement = element;
        }
    }
    
    // Select current focused element
    selectCurrent() {
        const current = this.getCurrentFocusedElement();
        if (current) {
            const action = current.dataset.action;
            this.executeAction(action);
        }
    }
    
    // Execute menu action
    executeAction(action) {
        console.log('Executing action:', action);
        this.showLoading(`Loading ${action}...`);
        
        switch (action) {
            case 'live':
                setTimeout(() => this.startLiveStream(), 1500);
                break;
            case 'videos':
                setTimeout(() => this.showVideoLibrary(), 1500);
                break;
            case 'schedule':
                setTimeout(() => this.showSchedule(), 1500);
                break;
            case 'sermons':
                setTimeout(() => this.showSermons(), 1500);
                break;
            case 'music':
                setTimeout(() => this.showMusic(), 1500);
                break;
            case 'settings':
                setTimeout(() => this.showSettings(), 1500);
                break;
            default:
                this.hideLoading();
                this.showError(`Unknown action: ${action}`);
        }
    }
    
    // Start live stream
    startLiveStream() {
        this.hideLoading();
        console.log('Starting live stream...');
        
        try {
            // Create video player element
            const videoContainer = document.createElement('div');
            videoContainer.className = 'video-player-container';
            videoContainer.innerHTML = `
                <div class="video-player">
                    <video id="liveVideo" autoplay controls>
                        <source src="${this.streamUrls.live}" type="application/x-mpegURL">
                        <source src="${this.streamUrls.backup}" type="application/x-mpegURL">
                        Your browser does not support the video tag.
                    </video>
                    <div class="video-controls">
                        <div class="video-info">
                            <h3>🔴 LIVE - GreaterLove TV</h3>
                            <p>Broadcasting now</p>
                        </div>
                        <div class="video-status">Press BACK to return to menu</div>
                    </div>
                </div>
            `;
            
            // Add video player styles
            const style = document.createElement('style');
            style.textContent = `
                .video-player-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #000;
                    z-index: 1000;
                }
                .video-player {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }
                #liveVideo {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .video-controls {
                    position: absolute;
                    top: 30px;
                    left: 30px;
                    z-index: 1001;
                }
                .video-info h3 {
                    color: #ff6b6b;
                    font-size: 28px;
                    margin-bottom: 10px;
                }
                .video-info p {
                    color: #fff;
                    font-size: 18px;
                }
                .video-status {
                    position: absolute;
                    top: 100px;
                    color: rgba(255,255,255,0.7);
                    font-size: 16px;
                }
            `;
            document.head.appendChild(style);
            
            // Show video player
            document.body.appendChild(videoContainer);
            this.navigationStack.push('live');
            AppState.currentScreen = 'video';
            
            // Setup video events
            const video = document.getElementById('liveVideo');
            video.addEventListener('error', (e) => {
                console.error('Video error:', e);
                this.showError('Unable to load live stream. Please check your connection.');
                this.goBack();
            });
            
            video.addEventListener('loadstart', () => {
                console.log('Video loading started');
            });
            
            video.addEventListener('canplay', () => {
                console.log('Video ready to play');
            });
            
        } catch (error) {
            console.error('Error starting live stream:', error);
            this.showError('Failed to start live stream');
        }
    }
    
    // Show video library
    showVideoLibrary() {
        this.hideLoading();
        console.log('Showing video library...');
        this.showError('Video library coming soon!');
    }
    
    // Show schedule
    showSchedule() {
        this.hideLoading();
        console.log('Showing schedule...');
        this.showError('Program schedule coming soon!');
    }
    
    // Show sermons
    showSermons() {
        this.hideLoading();
        console.log('Showing sermons...');
        this.showError('Sermon library coming soon!');
    }
    
    // Show music
    showMusic() {
        this.hideLoading();
        console.log('Showing music...');
        this.showError('Music library coming soon!');
    }
    
    // Show settings
    showSettings() {
        this.hideLoading();
        console.log('Showing settings...');
        this.showError('Settings coming soon!');
    }
    
    // Go back to previous screen
    goBack() {
        console.log('Going back...');
        
        if (this.navigationStack.length > 0) {
            const previousScreen = this.navigationStack.pop();
            
            // Handle different back actions
            switch (AppState.currentScreen) {
                case 'video':
                    this.exitVideoPlayer();
                    break;
                default:
                    this.exitApp();
            }
        } else {
            this.exitApp();
        }
    }
    
    // Exit video player
    exitVideoPlayer() {
        const videoContainer = document.querySelector('.video-player-container');
        if (videoContainer) {
            videoContainer.remove();
        }
        AppState.currentScreen = 'main';
        this.setFocus(this.getCurrentFocusedElement());
    }
    
    // Exit application
    exitApp() {
        console.log('Exiting application...');
        
        try {
            if (typeof tizen !== 'undefined') {
                tizen.application.getCurrentApplication().exit();
            } else {
                // Fallback for non-Tizen environments
                window.close();
            }
        } catch (error) {
            console.error('Error exiting app:', error);
        }
    }
    
    // Setup video player (for future use)
    setupVideoPlayer() {
        console.log('Video player setup complete');
    }
    
    // Load initial content
    loadInitialContent() {
        // Set initial focus
        const firstMenuItem = document.querySelector('.menu-item');
        if (firstMenuItem) {
            this.setFocus(firstMenuItem);
        }
        
        console.log('Initial content loaded');
    }
    
    // Hide splash screen
    hideSplashScreen() {
        console.log('Hiding splash screen...');
        
        // Method 1: Use Tizen custom ready_when
        if (window.screen && window.screen.show) {
            setTimeout(() => {
                try {
                    window.screen.show();
                    console.log('Splash hidden via window.screen.show()');
                } catch (error) {
                    console.error('Error hiding splash:', error);
                }
            }, 1000);
        }
        
        // Method 2: Dispatch custom event
        setTimeout(() => {
            try {
                const readyEvent = new CustomEvent('appready');
                document.dispatchEvent(readyEvent);
                console.log('App ready event dispatched');
            } catch (error) {
                console.error('Error dispatching ready event:', error);
            }
        }, 1200);
        
        // Method 3: Set document ready state
        setTimeout(() => {
            try {
                document.documentElement.setAttribute('data-app-ready', 'true');
                console.log('App ready attribute set');
            } catch (error) {
                console.error('Error setting ready attribute:', error);
            }
        }, 1500);
    }
    
    // Show loading screen
    showLoading(message = 'Loading...') {
        AppState.isLoading = true;
        const loadingScreen = document.getElementById('loadingScreen');
        const mainContainer = document.getElementById('mainContainer');
        
        if (loadingScreen && mainContainer) {
            loadingScreen.style.display = 'block';
            mainContainer.style.opacity = '0.3';
            
            // Update loading message
            const loadingText = loadingScreen.querySelector('h3');
            if (loadingText) {
                loadingText.textContent = message;
            }
        }
    }
    
    // Hide loading screen
    hideLoading() {
        AppState.isLoading = false;
        const loadingScreen = document.getElementById('loadingScreen');
        const mainContainer = document.getElementById('mainContainer');
        
        if (loadingScreen && mainContainer) {
            loadingScreen.style.display = 'none';
            mainContainer.style.opacity = '1';
        }
    }
    
    // Show error message
    showError(message) {
        const errorScreen = document.getElementById('errorScreen');
        const mainContainer = document.getElementById('mainContainer');
        
        if (errorScreen && mainContainer) {
            errorScreen.style.display = 'block';
            mainContainer.style.display = 'none';
            
            // Update error message
            const errorText = errorScreen.querySelector('p');
            if (errorText) {
                errorText.textContent = message;
            }
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                this.hideError();
            }, 3000);
        }
    }
    
    // Hide error message
    hideError() {
        const errorScreen = document.getElementById('errorScreen');
        const mainContainer = document.getElementById('mainContainer');
        
        if (errorScreen && mainContainer) {
            errorScreen.style.display = 'none';
            mainContainer.style.display = 'flex';
        }
    }
    
    // Cancel loading
    cancelLoading() {
        console.log('Loading cancelled');
        this.hideLoading();
    }
    
    // Pause video
    pauseVideo() {
        const video = document.getElementById('liveVideo');
        if (video && !video.paused) {
            video.pause();
            console.log('Video paused');
        }
    }
    
    // Resume video
    resumeVideo() {
        const video = document.getElementById('liveVideo');
        if (video && video.paused) {
            video.play();
            console.log('Video resumed');
        }
    }
    
    // Cleanup resources
    cleanup() {
        console.log('Cleaning up resources...');
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyPress, true);
        
        // Stop video
        this.pauseVideo();
        
        // Clear timers
        // Add any cleanup logic here
        
        console.log('Cleanup complete');
    }
}

// Global application instance
let appController = null;

// Initialize application
function initializeApp() {
    console.log('Starting GreaterLove TV Application...');
    
    try {
        // Create controller instance
        appController = new GreaterLoveTVController();
        
        // Initialize the app
        appController.initialize();
        
        // Make globally available for debugging
        window.greaterLoveTVApp = appController;
        
    } catch (error) {
        console.error('Failed to start application:', error);
        
        // Show fallback error
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background: #1a1a2e;
                color: white;
                font-family: Arial, sans-serif;
                text-align: center;
            ">
                <div>
                    <h1>GreaterLove TV</h1>
                    <p>Application failed to start</p>
                    <p>Please restart your TV or contact support</p>
                    <p style="font-size: 14px; opacity: 0.7;">Error: ${error.message}</p>
                </div>
            </div>
        `;
    }
}

// Document ready handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    initializeApp();
});

// Window load handler (backup)
window.addEventListener('load', function() {
    console.log('Window Loaded');
    
    // Ensure app is initialized
    if (!appController) {
        initializeApp();
    }
    
    // Force splash screen hide after window load
    setTimeout(() => {
        if (window.screen && window.screen.show) {
            window.screen.show();
        }
    }, 2000);
});

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    
    if (appController) {
        appController.showError('An unexpected error occurred');
    }
});

// Prevent context menu
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

console.log('GreaterLove TV main.js loaded successfully');