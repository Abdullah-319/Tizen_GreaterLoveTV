// main.js - Tizen TV Remote Control and Navigation Handler
// This file handles TV-specific functionality and remote control integration

(function() {
    'use strict';

    // Tizen TV Key Codes
    const TizenKeys = {
        LEFT: 37,
        UP: 38, 
        RIGHT: 39,
        DOWN: 40,
        ENTER: 13,
        RETURN: 10009,
        EXIT: 10182,
        BACK: 8,
        ESC: 27,
        PLAY: 415,
        PAUSE: 19,
        STOP: 413,
        FF: 417,
        REW: 412,
        MENU: 18,
        HOME: 10073,
        SOURCE: 10072,
        CH_UP: 427,
        CH_DOWN: 428,
        VOL_UP: 447,
        VOL_DOWN: 448,
        MUTE: 449,
        RED: 403,
        GREEN: 404, 
        YELLOW: 405,
        BLUE: 406,
        NUM_0: 48,
        NUM_1: 49,
        NUM_2: 50,
        NUM_3: 51,
        NUM_4: 52,
        NUM_5: 53,
        NUM_6: 54,
        NUM_7: 55,
        NUM_8: 56,
        NUM_9: 57
    };

    // TV Remote Navigation Manager
    class TizenRemoteManager {
        constructor() {
            this.isInitialized = false;
            this.currentVideoPlayer = null;
            this.init();
        }

        init() {
            try {
                // Initialize Tizen TV APIs
                this.initializeTizen();
                
                // Register key event handlers
                this.registerKeyHandlers();
                
                // Handle app lifecycle
                this.handleAppLifecycle();
                
                this.isInitialized = true;
                console.log('Tizen Remote Manager initialized successfully');
                
            } catch (error) {
                console.error('Failed to initialize Tizen Remote Manager:', error);
                // Fall back to basic web functionality
                this.initWebFallback();
            }
        }

        initializeTizen() {
            if (typeof tizen === 'undefined') {
                throw new Error('Tizen API not available');
            }

            // Initialize TV Window API
            if (tizen.tvwindow) {
                try {
                    tizen.tvwindow.getAvailableWindows((windows) => {
                        console.log('Available TV windows:', windows);
                    }, (error) => {
                        console.error('TV window error:', error);
                    });
                } catch (e) {
                    console.log('TV window API not available');
                }
            }

            // Initialize Input Device API for remote control
            if (tizen.tvinputdevice) {
                try {
                    const supportedKeys = tizen.tvinputdevice.getSupportedKeys();
                    console.log('Supported TV keys:', supportedKeys);
                    
                    // Register for key events
                    tizen.tvinputdevice.registerKey('ColorF0Red');
                    tizen.tvinputdevice.registerKey('ColorF1Green'); 
                    tizen.tvinputdevice.registerKey('ColorF2Yellow');
                    tizen.tvinputdevice.registerKey('ColorF3Blue');
                    tizen.tvinputdevice.registerKey('MediaPlay');
                    tizen.tvinputdevice.registerKey('MediaPause');
                    tizen.tvinputdevice.registerKey('MediaStop');
                    tizen.tvinputdevice.registerKey('MediaFastForward');
                    tizen.tvinputdevice.registerKey('MediaRewind');
                    
                } catch (e) {
                    console.error('Failed to register TV keys:', e);
                }
            }
        }

        initWebFallback() {
            console.log('Using web fallback mode');
            // Basic keyboard navigation for testing in browser
            this.registerKeyHandlers();
        }

        registerKeyHandlers() {
            document.addEventListener('keydown', (event) => {
                this.handleKeyDown(event);
            });

            document.addEventListener('keyup', (event) => {
                this.handleKeyUp(event);
            });
        }

        handleKeyDown(event) {
            const keyCode = event.keyCode;
            
            // Prevent default browser behavior for TV keys
            if (this.isTVKey(keyCode)) {
                event.preventDefault();
                event.stopPropagation();
            }

            switch (keyCode) {
                case TizenKeys.RETURN:
                case TizenKeys.BACK:
                case TizenKeys.ESC:
                    this.handleBackKey();
                    break;

                case TizenKeys.HOME:
                    this.handleHomeKey();
                    break;

                case TizenKeys.EXIT:
                    this.handleExitKey();
                    break;

                case TizenKeys.MENU:
                    this.handleMenuKey();
                    break;

                // Media control keys
                case TizenKeys.PLAY:
                    this.handlePlayKey();
                    break;

                case TizenKeys.PAUSE:
                    this.handlePauseKey();
                    break;

                case TizenKeys.STOP:
                    this.handleStopKey();
                    break;

                case TizenKeys.FF:
                    this.handleFastForward();
                    break;

                case TizenKeys.REW:
                    this.handleRewind();
                    break;

                // Color keys for shortcuts
                case TizenKeys.RED:
                    this.handleRedKey();
                    break;

                case TizenKeys.GREEN:
                    this.handleGreenKey();
                    break;

                case TizenKeys.YELLOW:
                    this.handleYellowKey();
                    break;

                case TizenKeys.BLUE:
                    this.handleBlueKey();
                    break;

                // Volume keys
                case TizenKeys.VOL_UP:
                    this.handleVolumeUp();
                    break;

                case TizenKeys.VOL_DOWN:
                    this.handleVolumeDown();
                    break;

                case TizenKeys.MUTE:
                    this.handleMute();
                    break;

                // Number keys for direct access
                case TizenKeys.NUM_1:
                    this.handleNumberKey(1);
                    break;
                case TizenKeys.NUM_2:
                    this.handleNumberKey(2);
                    break;
                // Add more number keys as needed

                default:
                    // Let the main app handle navigation keys
                    break;
            }
        }

        handleKeyUp(event) {
            // Handle key up events if needed
        }

        isTVKey(keyCode) {
            return Object.values(TizenKeys).includes(keyCode);
        }

        // Key handler methods
        handleBackKey() {
            console.log('Back key pressed');
            
            if (window.GreaterLoveApp && window.GreaterLoveApp.isVideoPlayerOpen) {
                window.GreaterLoveApp.closeVideoPlayer();
            } else {
                // Navigate to home or previous page
                if (window.GreaterLoveApp) {
                    window.GreaterLoveApp.switchPage('home');
                }
            }
        }

        handleHomeKey() {
            console.log('Home key pressed');
            if (window.GreaterLoveApp) {
                window.GreaterLoveApp.switchPage('home');
            }
        }

        handleExitKey() {
            console.log('Exit key pressed');
            this.exitApplication();
        }

        handleMenuKey() {
            console.log('Menu key pressed');
            // Show context menu or settings
        }

        handlePlayKey() {
            console.log('Play key pressed');
            if (this.currentVideoPlayer) {
                this.playVideo();
            }
        }

        handlePauseKey() {
            console.log('Pause key pressed');
            if (this.currentVideoPlayer) {
                this.pauseVideo();
            }
        }

        handleStopKey() {
            console.log('Stop key pressed');
            if (window.GreaterLoveApp && window.GreaterLoveApp.isVideoPlayerOpen) {
                window.GreaterLoveApp.closeVideoPlayer();
            }
        }

        handleFastForward() {
            console.log('Fast forward key pressed');
            // Implement fast forward functionality
        }

        handleRewind() {
            console.log('Rewind key pressed');
            // Implement rewind functionality
        }

        handleRedKey() {
            console.log('Red key pressed');
            // Quick access to live streams
            if (window.GreaterLoveApp) {
                window.GreaterLoveApp.switchPage('live');
            }
        }

        handleGreenKey() {
            console.log('Green key pressed');
            // Quick access to shows
            if (window.GreaterLoveApp) {
                window.GreaterLoveApp.switchPage('shows');
            }
        }

        handleYellowKey() {
            console.log('Yellow key pressed');
            // Custom functionality
        }

        handleBlueKey() {
            console.log('Blue key pressed');
            // Quick access to about page
            if (window.GreaterLoveApp) {
                window.GreaterLoveApp.switchPage('about');
            }
        }

        handleVolumeUp() {
            console.log('Volume up pressed');
            this.adjustVolume(true);
        }

        handleVolumeDown() {
            console.log('Volume down pressed');
            this.adjustVolume(false);
        }

        handleMute() {
            console.log('Mute pressed');
            this.toggleMute();
        }

        handleNumberKey(number) {
            console.log(`Number ${number} pressed`);
            // Implement direct channel access or shortcuts
        }

        // Video control methods
        playVideo() {
            if (typeof tizen !== 'undefined' && tizen.tvavplay) {
                try {
                    tizen.tvavplay.play();
                } catch (e) {
                    console.error('Failed to play video:', e);
                }
            }
        }

        pauseVideo() {
            if (typeof tizen !== 'undefined' && tizen.tvavplay) {
                try {
                    tizen.tvavplay.pause();
                } catch (e) {
                    console.error('Failed to pause video:', e);
                }
            }
        }

        adjustVolume(increase) {
            if (typeof tizen !== 'undefined' && tizen.tvaudiocontrol) {
                try {
                    const currentVolume = tizen.tvaudiocontrol.getVolume();
                    const newVolume = increase ? 
                        Math.min(currentVolume + 5, 100) : 
                        Math.max(currentVolume - 5, 0);
                    tizen.tvaudiocontrol.setVolume(newVolume);
                } catch (e) {
                    console.error('Failed to adjust volume:', e);
                }
            }
        }

        toggleMute() {
            if (typeof tizen !== 'undefined' && tizen.tvaudiocontrol) {
                try {
                    const isMuted = tizen.tvaudiocontrol.isMute();
                    tizen.tvaudiocontrol.setMute(!isMuted);
                } catch (e) {
                    console.error('Failed to toggle mute:', e);
                }
            }
        }

        // App lifecycle methods
        handleAppLifecycle() {
            if (typeof tizen !== 'undefined' && tizen.application) {
                try {
                    const app = tizen.application.getCurrentApplication();
                    
                    app.addEventListener('pause', () => {
                        console.log('App paused');
                        this.onAppPause();
                    });

                    app.addEventListener('resume', () => {
                        console.log('App resumed');
                        this.onAppResume();
                    });

                } catch (e) {
                    console.error('Failed to set up app lifecycle:', e);
                }
            }
        }

        onAppPause() {
            // Pause video if playing
            if (this.currentVideoPlayer && window.GreaterLoveApp?.isVideoPlayerOpen) {
                this.pauseVideo();
            }
        }

        onAppResume() {
            // Resume video if it was playing
            if (this.currentVideoPlayer && window.GreaterLoveApp?.isVideoPlayerOpen) {
                // Auto-resume could be implemented here
            }
        }

        exitApplication() {
            try {
                if (typeof tizen !== 'undefined' && tizen.application) {
                    tizen.application.getCurrentApplication().exit();
                } else {
                    // Fallback for web testing
                    window.close();
                }
            } catch (e) {
                console.error('Failed to exit application:', e);
            }
        }

        // TV-specific video player integration
        initTVVideoPlayer(videoElement) {
            this.currentVideoPlayer = videoElement;
            
            if (typeof tizen !== 'undefined' && tizen.tvavplay) {
                try {
                    // Initialize TV AV Play
                    tizen.tvavplay.getPlayer((player) => {
                        this.currentVideoPlayer = player;
                        console.log('TV video player initialized');
                    }, (error) => {
                        console.error('Failed to get TV video player:', error);
                    });
                } catch (e) {
                    console.error('TV video player not available:', e);
                }
            }
        }

        // Network status monitoring
        monitorNetworkStatus() {
            if (typeof tizen !== 'undefined' && tizen.systeminfo) {
                try {
                    tizen.systeminfo.getPropertyValue('NETWORK', (network) => {
                        console.log('Network status:', network.networkType);
                        
                        if (network.networkType === 'NONE') {
                            this.handleNetworkDisconnected();
                        } else {
                            this.handleNetworkConnected();
                        }
                    }, (error) => {
                        console.error('Failed to get network info:', error);
                    });
                } catch (e) {
                    console.error('System info API not available:', e);
                }
            }
        }

        handleNetworkDisconnected() {
            console.log('Network disconnected');
            if (window.GreaterLoveApp) {
                window.GreaterLoveApp.showError('Network connection lost. Please check your internet connection.');
            }
        }

        handleNetworkConnected() {
            console.log('Network connected');
            // Retry failed operations or refresh content
        }

        // TV Display settings
        optimizeForTVDisplay() {
            try {
                // Set optimal display settings for TV
                if (typeof tizen !== 'undefined' && tizen.tvdisplaycontrol) {
                    // Adjust display settings if needed
                    console.log('TV display optimized');
                }
                
                // Ensure proper scaling for different TV resolutions
                this.adjustForTVResolution();
                
            } catch (e) {
                console.error('Failed to optimize TV display:', e);
            }
        }

        adjustForTVResolution() {
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;
            
            console.log(`TV Resolution: ${screenWidth}x${screenHeight}`);
            
            // Apply resolution-specific adjustments
            if (screenWidth >= 1920 && screenHeight >= 1080) {
                document.body.classList.add('hd-resolution');
            } else if (screenWidth >= 1280 && screenHeight >= 720) {
                document.body.classList.add('standard-resolution');
            }
        }

        // Accessibility features
        enableTVAccessibility() {
            try {
                // Enable high contrast mode if needed
                if (typeof tizen !== 'undefined' && tizen.preference) {
                    tizen.preference.getValue('HIGH_CONTRAST', (value) => {
                        if (value) {
                            document.body.classList.add('high-contrast');
                        }
                    });
                }
                
                // Enable larger fonts if needed
                this.adjustFontSizeForTV();
                
            } catch (e) {
                console.error('Failed to enable TV accessibility:', e);
            }
        }

        adjustFontSizeForTV() {
            // TV screens require larger fonts for readability
            const distance = window.screen.width > 1920 ? 'far' : 'near';
            document.body.classList.add(`tv-${distance}-viewing`);
        }

        // Performance monitoring
        monitorPerformance() {
            // Monitor memory usage
            if (typeof tizen !== 'undefined' && tizen.systeminfo) {
                setInterval(() => {
                    try {
                        tizen.systeminfo.getPropertyValue('MEMORY', (memory) => {
                            const usagePercent = (memory.availableCapacity / memory.totalCapacity) * 100;
                            if (usagePercent < 20) {
                                console.warn('Low memory warning');
                                this.handleLowMemory();
                            }
                        });
                    } catch (e) {
                        console.error('Memory monitoring failed:', e);
                    }
                }, 30000); // Check every 30 seconds
            }
        }

        handleLowMemory() {
            console.log('Handling low memory situation');
            // Clear cached data, pause non-essential operations
            if (window.GreaterLoveApp) {
                // Clear cached thumbnails or reduce quality
            }
        }
    }

    // Voice control integration (if supported)
    class TizenVoiceControl {
        constructor() {
            this.isEnabled = false;
            this.init();
        }

        init() {
            if (typeof tizen !== 'undefined' && tizen.voicecontrol) {
                try {
                    this.setupVoiceCommands();
                    this.isEnabled = true;
                    console.log('Voice control enabled');
                } catch (e) {
                    console.log('Voice control not available');
                }
            }
        }

        setupVoiceCommands() {
            const commands = [
                { command: 'play', callback: () => this.handleVoicePlay() },
                { command: 'pause', callback: () => this.handleVoicePause() },
                { command: 'stop', callback: () => this.handleVoiceStop() },
                { command: 'home', callback: () => this.handleVoiceHome() },
                { command: 'shows', callback: () => this.handleVoiceShows() },
                { command: 'live', callback: () => this.handleVoiceLive() }
            ];

            commands.forEach(cmd => {
                tizen.voicecontrol.setVoiceControlCommand(cmd.command, cmd.callback);
            });
        }

        handleVoicePlay() {
            if (window.GreaterLoveApp?.isVideoPlayerOpen) {
                // Play current video
                console.log('Voice: Play video');
            }
        }

        handleVoicePause() {
            if (window.GreaterLoveApp?.isVideoPlayerOpen) {
                // Pause current video
                console.log('Voice: Pause video');
            }
        }

        handleVoiceStop() {
            if (window.GreaterLoveApp?.isVideoPlayerOpen) {
                window.GreaterLoveApp.closeVideoPlayer();
            }
        }

        handleVoiceHome() {
            if (window.GreaterLoveApp) {
                window.GreaterLoveApp.switchPage('home');
            }
        }

        handleVoiceShows() {
            if (window.GreaterLoveApp) {
                window.GreaterLoveApp.switchPage('shows');
            }
        }

        handleVoiceLive() {
            if (window.GreaterLoveApp) {
                window.GreaterLoveApp.switchPage('live');
            }
        }
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize TV remote control
        window.TizenRemoteManager = new TizenRemoteManager();
        
        // Initialize voice control
        window.TizenVoiceControl = new TizenVoiceControl();
        
        // Optimize for TV display
        if (window.TizenRemoteManager.isInitialized) {
            window.TizenRemoteManager.optimizeForTVDisplay();
            window.TizenRemoteManager.enableTVAccessibility();
            window.TizenRemoteManager.monitorNetworkStatus();
            window.TizenRemoteManager.monitorPerformance();
        }
    });

    // Clock function for the template compatibility
    window.startTime = function() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        
        // Find a display element or create one
        let timeDisplay = document.getElementById('time-display');
        if (!timeDisplay) {
            timeDisplay = document.createElement('div');
            timeDisplay.id = 'time-display';
            timeDisplay.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 18px;
                z-index: 1001;
            `;
            document.body.appendChild(timeDisplay);
        }
        
        timeDisplay.textContent = timeString;
        
        // Update every second
        setTimeout(window.startTime, 1000);
    };

    // Global error handling
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        if (window.GreaterLoveApp) {
            window.GreaterLoveApp.showError('An unexpected error occurred. Please try again.');
        }
    });

    // Unhandled promise rejection handling
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        event.preventDefault();
    });

})();