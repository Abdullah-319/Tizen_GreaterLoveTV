// js/views/video-player-view.js - Video Player Component
class VideoPlayerView {
    constructor(app) {
        this.app = app;
        this.element = null;
        this.videoElement = null;
        this.currentVideo = null;
        this.isPlaying = false;
        this.controlsTimeout = null;
    }

    async init() {
        this.element = document.getElementById('videoPlayerView');
        this.videoElement = document.getElementById('videoPlayer');
        this.setupEventListeners();
        console.log('VideoPlayerView initialized');
    }

    setupEventListeners() {
        // Video events
        this.videoElement.addEventListener('loadstart', () => {
            console.log('Video loading started');
        });

        this.videoElement.addEventListener('canplay', () => {
            console.log('Video can start playing');
            this.videoElement.play().catch(error => {
                console.error('Error playing video:', error);
                this.app.showError('Playback Error', 'Unable to play video');
            });
        });

        this.videoElement.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayPauseButton();
        });

        this.videoElement.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayPauseButton();
        });

        this.videoElement.addEventListener('error', (error) => {
            console.error('Video error:', error);
            this.app.showError('Video Error', 'Unable to load video stream');
        });

        // Control buttons
        const playPauseBtn = document.getElementById('playPauseBtn');
        const backBtn = document.getElementById('backBtn');

        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                this.togglePlayPause();
            });
        }

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.stop();
                this.app.goBack();
            });
        }

        // Mouse/touch activity for controls
        this.element.addEventListener('mousemove', () => {
            this.showControls();
        });

        this.element.addEventListener('click', () => {
            this.showControls();
        });
    }

    playVideo(videoData) {
        console.log('Playing video:', videoData);
        
        this.currentVideo = videoData;
        
        // Update video info
        const titleElement = document.getElementById('videoTitle');
        const descriptionElement = document.getElementById('videoDescription');
        
        if (titleElement) {
            titleElement.textContent = videoData.title || 'Unknown Title';
        }
        
        if (descriptionElement) {
            descriptionElement.textContent = videoData.description || 'No description available';
        }

        // Load video source
        if (videoData.streamUrl) {
            this.loadVideoSource(videoData.streamUrl);
        } else {
            // Use placeholder or demo video
            this.loadDemoVideo();
        }

        this.showControls();
    }

    loadVideoSource(streamUrl) {
        // Check if HLS is supported
        if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
            const hls = new Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(this.videoElement);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('HLS manifest parsed, starting playback');
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS error:', data);
                this.loadDemoVideo();
            });
        } else if (this.videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari, etc.)
            this.videoElement.src = streamUrl;
        } else {
            // Fallback to demo video
            this.loadDemoVideo();
        }
    }

    loadDemoVideo() {
        // Load a demo video when actual stream is not available
        this.app.showToast('Loading demo content - Stream coming soon!', 'info');

        // Use multiple demo stream URLs as fallbacks
        const demoUrls = [
            'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.mp4/.m3u8',
            'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8'
        ];

        this.tryLoadVideo(demoUrls, 0);
    }

    tryLoadVideo(urls, index) {
        if (index >= urls.length) {
            console.log('All demo URLs failed, showing placeholder');
            this.showVideoPlaceholder();
            return;
        }

        const url = urls[index];
        console.log(`Trying to load demo video ${index + 1}/${urls.length}:`, url);

        try {
            if (Hls.isSupported()) {
                const hls = new Hls({
                    debug: false,
                    enableWorker: false,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hls.loadSource(url);
                hls.attachMedia(this.videoElement);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log(`Demo HLS manifest parsed successfully for URL ${index + 1}`);
                    // Try to start playback
                    this.videoElement.play().catch(error => {
                        console.log('Autoplay prevented, user interaction required');
                    });
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error(`Demo HLS error for URL ${index + 1}:`, data);
                    if (data.fatal) {
                        console.log(`Fatal error, trying next URL...`);
                        hls.destroy();
                        this.tryLoadVideo(urls, index + 1);
                    }
                });

                // Set a timeout to try next URL if this one doesn't load
                setTimeout(() => {
                    if (this.videoElement.readyState === 0) {
                        console.log(`Timeout for URL ${index + 1}, trying next...`);
                        hls.destroy();
                        this.tryLoadVideo(urls, index + 1);
                    }
                }, 5000);

            } else if (this.videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support (Safari)
                this.videoElement.src = url;
                this.videoElement.addEventListener('error', () => {
                    console.error(`Native HLS error for URL ${index + 1}`);
                    this.tryLoadVideo(urls, index + 1);
                });
            } else {
                console.log('HLS not supported, trying next URL or showing placeholder');
                this.tryLoadVideo(urls, index + 1);
            }
        } catch (error) {
            console.error(`Error loading demo video ${index + 1}:`, error);
            this.tryLoadVideo(urls, index + 1);
        }
    }

    showVideoPlaceholder() {
        console.log('Showing video placeholder');

        // Create a demo video element with animated content
        this.videoElement.src = '';
        this.videoElement.poster = '';

        // Create animated demo content
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');

        let frame = 0;
        const animate = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Create animated gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            const hue = (frame * 2) % 360;
            gradient.addColorStop(0, `hsl(${hue}, 70%, 20%)`);
            gradient.addColorStop(0.5, `hsl(${(hue + 60) % 360}, 70%, 25%)`);
            gradient.addColorStop(1, `hsl(${(hue + 120) % 360}, 70%, 30%)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add animated logo/text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 72px Poppins, Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 10;
            ctx.fillText('Greater Love TV', canvas.width / 2, canvas.height / 2 - 50);

            // Animate subtitle
            const opacity = (Math.sin(frame * 0.05) + 1) / 2;
            ctx.fillStyle = `rgba(142, 142, 147, ${opacity})`;
            ctx.font = '36px Poppins, Arial';
            ctx.fillText('Demo Content - Click Play to Start', canvas.width / 2, canvas.height / 2 + 50);

            // Add animated circles
            for (let i = 0; i < 5; i++) {
                const x = canvas.width / 2 + Math.sin((frame + i * 60) * 0.02) * 200;
                const y = canvas.height / 2 + Math.cos((frame + i * 60) * 0.02) * 100;
                const radius = 20 + Math.sin((frame + i * 30) * 0.05) * 10;

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + opacity * 0.2})`;
                ctx.fill();
            }

            // Convert to blob and set as poster
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    this.videoElement.poster = url;
                    // Clean up previous URLs to prevent memory leaks
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                }
            }, 'image/jpeg', 0.8);

            frame++;

            // Continue animation only if we're still on video player view
            if (this.element && this.element.classList.contains('active')) {
                setTimeout(() => requestAnimationFrame(animate), 100);
            }
        };

        // Start animation
        animate();

        // Add click handler to allow manual play attempt
        this.videoElement.onclick = () => {
            this.app.showToast('Demo video - streaming content will be available soon!', 'info');
        };
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.videoElement.pause();
        } else {
            this.videoElement.play().catch(error => {
                console.error('Error playing video:', error);
                this.app.showError('Playback Error', 'Unable to play video');
            });
        }
    }

    stop() {
        this.videoElement.pause();
        this.videoElement.currentTime = 0;
        this.currentVideo = null;
    }

    updatePlayPauseButton() {
        const playPauseBtn = document.getElementById('playPauseBtn');
        const icon = playPauseBtn?.querySelector('.control-icon');
        
        if (icon) {
            icon.textContent = this.isPlaying ? '⏸️' : '▶️';
        }
    }

    showControls() {
        const controls = this.element.querySelector('.video-controls');
        if (controls) {
            controls.style.opacity = '1';
            
            // Clear existing timeout
            if (this.controlsTimeout) {
                clearTimeout(this.controlsTimeout);
            }
            
            // Hide controls after 3 seconds of inactivity
            this.controlsTimeout = setTimeout(() => {
                if (!this.element.matches(':hover')) {
                    controls.style.opacity = '0';
                }
            }, 3000);
        }
    }

    onActivate() {
        this.showControls();
        
        if (this.app.focusManager) {
            const playPauseBtn = document.getElementById('playPauseBtn');
            if (playPauseBtn) {
                this.app.focusManager.setFocus(playPauseBtn);
            }
        }
    }

    async updateWithData(appData) {
        // Video player doesn't need data updates
    }
}
