// js/core/app.js - Main Application Logic
class GreaterLoveApp {
    constructor() {
        this.initialized = false;
        this.currentView = 'home';
        this.viewStack = ['home'];
        this.isLoading = false;
        this.navigationBar = null;
        this.focusManager = null;
        this.apiService = null;
        this.progressManager = null;
        this.views = {};
        this.overlayStack = [];
        
        // Tizen specific
        this.tizenAvailable = false;
        this.avplaySupported = false;
        
        // App data
        this.appData = {
            shows: [],
            categories: [],
            liveStreams: [],
            continueWatching: []
        };
        
        // Configuration
        this.config = {
            apiBaseURL: 'https://api.castr.com/v2',
            accessToken: '5aLoKjrNjly4',
            secretKey: 'UjTCq8wOj76vjXznGFzdbMRzAkFq6VlJElBQ',
            retryAttempts: 3,
            retryDelay: 1000,
            focusDebug: false
        };
    }

    async init() {
        if (this.initialized) return;
        
        console.log('Initializing Greater Love TV...');
        
        try {
            // Check Tizen environment
            this.checkTizenEnvironment();
            
            // Wait longer for all scripts to load
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Initialize core components
            await this.initializeCore();
            
            // Initialize services
            await this.initializeServices();
            
            // Initialize views
            await this.initializeViews();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadInitialData();
            
            // Show initial view
            this.showView('home');
            
            // Hide loading overlay
            this.hideLoading();
            
            this.initialized = true;
            console.log('Greater Love TV initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            // Even if initialization fails, try to hide loading and show basic interface
            this.hideLoading();
            this.showBasicInterface();
        }
    }

    checkTizenEnvironment() {
        this.tizenAvailable = typeof tizen !== 'undefined';
        this.avplaySupported = this.tizenAvailable && typeof webapis !== 'undefined' && webapis.avplay;
        
        console.log('Tizen environment:', {
            tizenAvailable: this.tizenAvailable,
            avplaySupported: this.avplaySupported
        });
    }

    async initializeCore() {
        console.log('Initializing core components...');

        // Initialize Simple Focus Manager (debug version)
        if (typeof SimpleFocusManager !== 'undefined') {
            console.log('Creating SimpleFocusManager...');
            this.focusManager = new SimpleFocusManager();
            this.focusManager.init();
            console.log('SimpleFocusManager initialized');

            // Make it globally accessible for debugging
            window.focusManager = this.focusManager;
        } else if (typeof TVFocusManager !== 'undefined') {
            console.log('Creating TVFocusManager...');
            this.focusManager = new TVFocusManager();
            this.focusManager.init();
            console.log('TVFocusManager initialized');
        } else {
            console.warn('No focus manager available');
        }
        
        // Initialize Professional Card Components
        if (typeof CardComponents !== 'undefined') {
            console.log('Creating Professional CardComponents...');
            this.cardComponents = new CardComponents(this);
            console.log('✅ Professional CardComponents initialized');
        } else {
            console.warn('❌ CardComponents not available');
        }

        // Initialize Navigation
        if (typeof NavigationBar !== 'undefined') {
            console.log('Creating NavigationBar...');
            this.navigationBar = new NavigationBar(this);
            await this.navigationBar.init();
            console.log('NavigationBar initialized');
        } else {
            console.warn('NavigationBar not available');
        }
    }

    async initializeServices() {
        console.log('Initializing services...');
        
        // Initialize Professional Castr API Service
        if (typeof CastrAPIService !== 'undefined') {
            console.log('Creating Professional CastrAPIService...');
            this.apiService = new CastrAPIService(this.config);
            await this.apiService.init();
            console.log('✅ Professional CastrAPIService initialized');
        } else {
            console.warn('❌ CastrAPIService not available');
        }
        
        // Initialize Progress Manager
        if (typeof ProgressManager !== 'undefined') {
            console.log('Creating ProgressManager...');
            this.progressManager = new ProgressManager();
            await this.progressManager.init();
            console.log('ProgressManager initialized');
        } else {
            console.warn('ProgressManager not available');
        }
    }

    async initializeViews() {
        console.log('Initializing views...');
        
        // Initialize all views
        if (typeof HomeView !== 'undefined') {
            console.log('Creating HomeView...');
            this.views.home = new HomeView(this);
            await this.views.home.init();
            console.log('HomeView initialized');
        } else {
            console.warn('HomeView not available');
        }
        
        if (typeof ShowsView !== 'undefined') {
            console.log('Creating ShowsView...');
            this.views.shows = new ShowsView(this);
            await this.views.shows.init();
            console.log('ShowsView initialized');
        } else {
            console.warn('ShowsView not available');
        }
        
        if (typeof AboutView !== 'undefined') {
            console.log('Creating AboutView...');
            this.views.about = new AboutView(this);
            await this.views.about.init();
            console.log('AboutView initialized');
        } else {
            console.warn('AboutView not available');
        }

        if (typeof QRCodesView !== 'undefined') {
            console.log('Creating InfoView (QRCodesView)...');
            this.views.info = new QRCodesView(this);
            await this.views.info.init();
            console.log('InfoView initialized');
        } else {
            console.warn('InfoView not available');
        }
        
        if (typeof ShowDetailView !== 'undefined') {
            console.log('Creating ShowDetailView...');
            this.views.showDetail = new ShowDetailView(this);
            await this.views.showDetail.init();
            console.log('ShowDetailView initialized');
        } else {
            console.warn('ShowDetailView not available');
        }

        if (typeof VideoPlayerView !== 'undefined') {
            console.log('Creating VideoPlayerView...');
            this.views.videoPlayer = new VideoPlayerView(this);
            await this.views.videoPlayer.init();
            console.log('VideoPlayerView initialized');
        } else {
            console.warn('VideoPlayerView not available');
        }
    }

    setupEventListeners() {
        // Tizen specific setup
        if (this.tizenAvailable) {
            try {
                // Register Tizen TV keys
                tizen.tvinputdevice.registerKey("MediaPlayPause");
                tizen.tvinputdevice.registerKey("MediaStop");
                tizen.tvinputdevice.registerKey("MediaPreviousTrack");
                tizen.tvinputdevice.registerKey("MediaNextTrack");
                console.log('Tizen TV keys registered');
            } catch (error) {
                console.warn('Could not register media keys:', error);
            }
        }

        // Back button handling
        window.addEventListener('popstate', this.handleBackButton.bind(this));

        console.log('App event listeners setup complete (focus handled by SimpleFocusManager)');
    }

    // Key handling now done by SimpleFocusManager

    async loadInitialData() {
        try {
            console.log('Loading initial data...');
            this.showLoading();
            
            // Load data in parallel with fallbacks
            const promises = [];
            
            if (this.apiService) {
                console.log('Loading data from API service...');
                promises.push(
                    this.apiService.getShows().catch(() => []),
                    this.apiService.getCategories().catch(() => []),
                    this.apiService.getLiveStreams().catch(() => [])
                );
            } else {
                console.log('No API service, using empty data...');
                promises.push(Promise.resolve([]), Promise.resolve([]), Promise.resolve([]));
            }
            
            if (this.progressManager) {
                console.log('Loading progress data...');
                promises.push(this.progressManager.getContinueWatching().catch(() => []));
            } else {
                console.log('No progress manager, using empty data...');
                promises.push(Promise.resolve([]));
            }
            
            const [shows, categories, liveStreams, continueWatching] = await Promise.all(promises);
            
            console.log('Data loaded:', { shows: shows.length, categories: categories.length, liveStreams: liveStreams.length, continueWatching: continueWatching.length });

            // Convert raw data to professional models if available
            let processedShows = shows || [];
            let processedCategories = categories || [];
            let processedLiveStreams = liveStreams || [];

            if (typeof Show !== 'undefined' && typeof Category !== 'undefined' && typeof LiveStream !== 'undefined') {
                console.log('Converting data to professional models...');
                try {
                    processedShows = (shows || []).map(showData => new Show(showData));
                    processedCategories = (categories || []).map(categoryData => new Category(categoryData));
                    processedLiveStreams = (liveStreams || []).map(streamData => new LiveStream(streamData));
                    console.log('✅ Data successfully converted to professional models');
                } catch (error) {
                    console.warn('❌ Failed to convert to professional models, using raw data:', error);
                    processedShows = shows || [];
                    processedCategories = categories || [];
                    processedLiveStreams = liveStreams || [];
                }
            } else {
                console.log('⚠️ Professional models not available, using raw data');
            }

            this.appData = {
                shows: processedShows,
                categories: processedCategories,
                liveStreams: processedLiveStreams,
                continueWatching: continueWatching || []
            };
            
            // Update views with data
            console.log('Updating views with data...');
            await this.updateViewsWithData();
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showError('Loading Error', 'Failed to load content from Greater Love TV servers');
        } finally {
            console.log('Hiding loading overlay...');
            this.hideLoading();
        }
    }

    async updateViewsWithData() {
        // Update each view with the loaded data
        for (const [name, view] of Object.entries(this.views)) {
            if (view.updateWithData) {
                await view.updateWithData(this.appData);
            }
        }
    }

    showView(viewName) {
        console.log('Showing view:', viewName);
        
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show target view
        const targetView = document.getElementById(viewName + 'View');
        if (targetView) {
            console.log('Found target view element:', targetView);
            targetView.classList.add('active');
            this.currentView = viewName;

            // Refresh focus manager when view changes
            if (this.focusManager && this.focusManager.onViewChange) {
                this.focusManager.onViewChange();
            }
            
            // Update navigation
            if (this.navigationBar) {
                this.navigationBar.setActiveView(viewName);
            }
            
            // Set focus to first focusable element in view
            setTimeout(() => {
                const firstFocusable = targetView.querySelector('[tabindex]');
                if (firstFocusable && this.focusManager) {
                    this.focusManager.setFocus(firstFocusable);
                }
            }, 100);
            
            // Notify view of activation
            if (this.views[viewName] && this.views[viewName].onActivate) {
                this.views[viewName].onActivate();
            }
        } else {
            console.error('Target view not found:', viewName + 'View');
        }
    }

    goBack() {
        if (this.overlayStack.length > 0) {
            // Close current overlay
            const overlay = this.overlayStack.pop();
            if (overlay) {
                overlay.classList.add('hidden');
            }
            return;
        }
        
        if (this.viewStack.length > 1) {
            // Go to previous view
            this.viewStack.pop();
            const previousView = this.viewStack[this.viewStack.length - 1];
            this.showView(previousView);
        } else if (this.tizenAvailable) {
            // Exit app on Tizen
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (error) {
                console.error('Failed to exit app:', error);
            }
        }
    }

    navigateToView(viewName) {
        if (viewName !== this.currentView) {
            this.viewStack.push(viewName);

            // Use focus manager's navigation if available
            if (this.focusManager && this.focusManager.navigateToView) {
                this.focusManager.navigateToView(viewName);
            } else {
                this.showView(viewName);
            }
        }
    }

    showLoading() {
        this.isLoading = true;
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    hideLoading() {
        console.log('Hiding loading overlay...');
        this.isLoading = false;
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            console.log('Found loading overlay, adding hidden class');
            overlay.classList.add('hidden');
        } else {
            console.error('Loading overlay not found!');
        }
    }

    showError(title, message) {
        console.error('App Error:', title, message);
        
        const overlay = document.getElementById('errorOverlay');
        const titleElement = overlay?.querySelector('.error-title');
        const messageElement = overlay?.querySelector('.error-message');
        const retryButton = overlay?.querySelector('.retry-button');
        
        if (overlay) {
            if (titleElement) titleElement.textContent = title;
            if (messageElement) messageElement.textContent = message;
            
            overlay.classList.remove('hidden');
            this.overlayStack.push(overlay);
            
            // Setup retry button
            if (retryButton) {
                retryButton.onclick = () => {
                    overlay.classList.add('hidden');
                    this.overlayStack.pop();
                    this.loadInitialData();
                };
                
                // Focus the retry button
                if (this.focusManager) {
                    setTimeout(() => {
                        this.focusManager.setFocus(retryButton);
                    }, 100);
                }
            }
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, duration);
    }

    playVideo(videoData) {
        if (this.views.videoPlayer) {
            this.views.videoPlayer.playVideo(videoData);
            this.navigateToView('videoPlayer');
        }
    }

    showShowDetail(show) {
        console.log('App: Showing show detail for:', show);
        if (this.views.showDetail) {
            this.views.showDetail.showShow(show);
        }
    }

    handlePlayPause() {
        if (this.currentView === 'videoPlayer' && this.views.videoPlayer) {
            this.views.videoPlayer.togglePlayPause();
        }
    }

    showBasicInterface() {
        console.log('Showing basic interface as fallback');
        
        // Hide loading overlay
        this.hideLoading();
        
        // Show the home view directly
        const homeView = document.getElementById('homeView');
        if (homeView) {
            homeView.classList.add('active');
            this.currentView = 'home';
        }
        
        // Show a simple message
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            const fallbackMessage = document.createElement('div');
            fallbackMessage.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                z-index: 1000;
            `;
            fallbackMessage.innerHTML = `
                <h2>Greater Love TV</h2>
                <p>Application loaded successfully!</p>
                <p>Use the navigation above to explore content.</p>
            `;
            mainContent.appendChild(fallbackMessage);
            
            // Remove the message after 5 seconds
            setTimeout(() => {
                if (fallbackMessage.parentNode) {
                    fallbackMessage.parentNode.removeChild(fallbackMessage);
                }
            }, 5000);
        }
    }
}

// Make GreaterLoveApp globally available
window.GreaterLoveApp = GreaterLoveApp;