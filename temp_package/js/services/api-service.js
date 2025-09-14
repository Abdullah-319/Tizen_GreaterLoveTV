// js/services/api-service.js - Professional Castr API Service
// Recreated from iOS CastrAPIService.swift with same architecture and functionality

class CastrAPIService {
    constructor(config) {
        this.config = config || {
            apiBaseURL: 'https://api.castr.com/v2',
            accessToken: '5aLoKjrNjly4',
            secretKey: 'UjTCq8wOj76vjXznGFzdbMRzAkFq6VlJElBQ'
        };

        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.isLoading = false;
        this.lastFetchTime = null;

        // Internal state for content management
        this.allShows = [];
        this.liveStreams = [];
        this.featuredShows = [];
        this.featuredMinisters = [];
        this.totalPages = 1;
        this.currentPage = 1;

        console.log('CastrAPIService initialized with professional architecture');
    }

    async init() {
        console.log('Professional API Service initializing...');

        // Load initial data in parallel like iOS app
        try {
            await Promise.all([
                this.fetchAllShowsWithPagination(),
                this.fetchLiveStreams(),
                this.processFeaturedContent()
            ]);

            console.log('✅ Professional API Service initialized successfully');
        } catch (error) {
            console.error('❌ API Service initialization failed:', error);
            // Use fallback data like iOS app
            this.loadFallbackData();
        }
    }

    // MARK: - Professional API Request Method
    async request(endpoint, options = {}) {
        const url = `${this.config.apiBaseURL}${endpoint}`;
        const cacheKey = `${endpoint}_${JSON.stringify(options)}`;

        console.log(`🌐 API Request: ${url}`);

        // Check cache first (professional caching)
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log(`💾 Cache hit for: ${endpoint}`);
                return cached.data;
            }
        }

        try {
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.accessToken}`,
                    'X-API-Key': this.config.secretKey,
                    ...options.headers
                },
                body: options.body ? JSON.stringify(options.body) : undefined
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Professional caching strategy
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            console.log(`✅ API Success: ${endpoint}`, data);
            return data;

        } catch (error) {
            console.error(`❌ API Error for ${endpoint}:`, error);

            // Professional fallback strategy
            const fallbackData = this.getFallbackData(endpoint);
            if (fallbackData) {
                console.log(`🔄 Using fallback data for: ${endpoint}`);
                return fallbackData;
            }

            throw error;
        }
    }

    // MARK: - Fetch All Shows with Pagination (matching iOS)
    async fetchAllShowsWithPagination() {
        console.log('📚 Fetching all shows with pagination...');

        if (this.isLoading) {
            console.log('⏳ Already loading, skipping duplicate request');
            return this.allShows;
        }

        this.isLoading = true;
        this.allShows = [];

        try {
            let currentPage = 1;
            let hasMorePages = true;

            while (hasMorePages && currentPage <= 10) { // Limit to prevent infinite loop
                console.log(`📖 Fetching page ${currentPage}...`);

                const response = await this.request(`/shows?page=${currentPage}&limit=50`);

                if (response && response.docs) {
                    const shows = response.docs.map(showData => {
                        // Process each show with professional data handling
                        return this.processShowData(showData);
                    });

                    this.allShows.push(...shows);

                    // Update pagination info
                    this.totalPages = response.pages || 1;
                    this.currentPage = response.page || currentPage;

                    hasMorePages = currentPage < this.totalPages;
                    currentPage++;

                    console.log(`✅ Page ${this.currentPage} loaded: ${shows.length} shows`);
                } else {
                    hasMorePages = false;
                }
            }

            console.log(`🎉 Total shows loaded: ${this.allShows.length}`);
            this.lastFetchTime = Date.now();

        } catch (error) {
            console.error('❌ Error fetching shows:', error);
            this.loadFallbackShows();
        } finally {
            this.isLoading = false;
        }

        return this.allShows;
    }

    // MARK: - Process Show Data (professional data processing)
    processShowData(showData) {
        try {
            // Extract episodes with professional error handling
            const episodes = [];

            if (showData.docs && Array.isArray(showData.docs)) {
                showData.docs.forEach(episodeData => {
                    try {
                        const episode = new Episode({
                            id: episodeData._id || episodeData.id,
                            title: this.extractTitle(episodeData.fileName) || episodeData.fileName,
                            description: this.generateEpisodeDescription(episodeData),
                            filename: episodeData.fileName,
                            filesize: episodeData.bytes,
                            duration: episodeData.mediaInfo?.duration,
                            createdAt: episodeData.creationTime,
                            author: episodeData.author,
                            thumbnail: this.extractThumbnail(episodeData),
                            playbackUrl: episodeData.playback?.embed_url,
                            hlsUrl: episodeData.playback?.hls_url,
                            mp4Url: this.extractMP4URL(episodeData.playback?.embed_url),
                            showId: showData._id
                        });

                        episodes.push(episode);
                    } catch (episodeError) {
                        console.warn('⚠️ Error processing episode:', episodeError);
                    }
                });
            }

            // Create show with professional data mapping
            const show = new Show({
                id: showData._id || showData.id,
                name: showData.name,
                displayName: this.formatShowName(showData.name),
                description: this.generateShowDescription(showData, episodes),
                thumbnail: this.generateShowThumbnail(episodes[0]),
                createdAt: showData.creationTime,
                author: this.extractAuthor(showData),
                episodes: episodes,
                category: this.determineShowCategory(showData.name, episodes),
                featured: this.isShowFeatured(showData.name),
                gradient: this.generateGradient(showData.name)
            });

            console.log(`📺 Processed show: ${show.displayName} (${show.episodeCount} episodes)`);
            return show;

        } catch (error) {
            console.error('❌ Error processing show data:', error);
            return null;
        }
    }

    // MARK: - Fetch Live Streams (professional implementation)
    async fetchLiveStreams() {
        console.log('🔴 Fetching live streams...');

        try {
            const response = await this.request('/live-streams');

            if (response && response.docs) {
                this.liveStreams = response.docs.map(streamData => {
                    return new LiveStream({
                        id: streamData._id,
                        name: streamData.name,
                        displayName: this.formatStreamName(streamData.name),
                        enabled: streamData.enabled,
                        createdAt: streamData.creation_time,
                        embedUrl: streamData.embed_url,
                        hlsUrl: streamData.hls_url,
                        thumbnailUrl: streamData.thumbnail_url,
                        broadcastingStatus: streamData.broadcasting_status,
                        channelNumber: this.extractChannelNumber(streamData.name),
                        networkName: 'Greater Love TV',
                        ingest: streamData.ingest
                    });
                });

                console.log(`✅ Live streams loaded: ${this.liveStreams.length}`);
            }

        } catch (error) {
            console.error('❌ Error fetching live streams:', error);
            this.loadFallbackLiveStreams();
        }

        return this.liveStreams;
    }

    // MARK: - Process Featured Content (matching iOS featured logic)
    async processFeaturedContent() {
        console.log('⭐ Processing featured content...');

        if (this.allShows.length === 0) {
            await this.fetchAllShowsWithPagination();
        }

        // Featured Ministers (specific show names from iOS app)
        const featuredMinisterNames = [
            'Anthony & Sheila Wynn',
            'Jessica & Micah Wynn',
            'Perry Stone',
            'Joey And Rita Rogers',
            'Dr. Caesar Molebatsi',
            'Tim Hill'
        ];

        this.featuredMinisters = this.allShows.filter(show =>
            featuredMinisterNames.some(name =>
                show.author?.includes(name) ||
                show.name?.includes(name) ||
                show.displayName?.includes(name)
            )
        );

        // Featured Shows (shows with high episode count or special criteria)
        this.featuredShows = this.allShows.filter(show =>
            show.episodeCount >= 50 ||
            show.featured ||
            this.featuredMinisters.includes(show)
        ).slice(0, 6);

        console.log(`⭐ Featured ministers: ${this.featuredMinisters.length}`);
        console.log(`⭐ Featured shows: ${this.featuredShows.length}`);

        return {
            featuredMinisters: this.featuredMinisters,
            featuredShows: this.featuredShows
        };
    }

    // MARK: - Public API Methods (professional interface)
    async getShows() {
        if (this.allShows.length === 0) {
            await this.fetchAllShowsWithPagination();
        }
        return this.allShows;
    }

    async getCategories() {
        const shows = await this.getShows();
        return this.createCategoriesFromShows(shows);
    }

    async getLiveStreams() {
        if (this.liveStreams.length === 0) {
            await this.fetchLiveStreams();
        }
        return this.liveStreams;
    }

    async getFeaturedContent() {
        if (this.featuredShows.length === 0) {
            await this.processFeaturedContent();
        }
        return {
            featuredShows: this.featuredShows,
            featuredMinisters: this.featuredMinisters
        };
    }

    // MARK: - Professional Utility Methods
    formatShowName(name) {
        if (!name) return 'Unknown Show';

        // Clean up common patterns
        return name
            .replace(/^\d+\s*-\s*/, '') // Remove leading numbers
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    formatStreamName(name) {
        if (!name) return 'Live Stream';

        if (name.toLowerCase().includes('greater love tv')) {
            return name;
        }

        return `Greater Love TV - ${name}`;
    }

    extractChannelNumber(streamName) {
        const match = streamName?.match(/(\d+)/);
        return match ? parseInt(match[1]) : 1;
    }

    extractTitle(fileName) {
        if (!fileName) return null;

        return fileName
            .replace(/\.(mp4|mov|avi|mkv)$/i, '') // Remove extensions
            .replace(/[-_]/g, ' ') // Replace dashes and underscores
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    extractMP4URL(embedUrl) {
        if (!embedUrl) return null;

        // Professional URL extraction logic from iOS app
        try {
            const url = new URL(embedUrl);
            const segments = url.pathname.split('/');
            const filename = segments[segments.length - 1];

            if (filename && filename.includes('.')) {
                return embedUrl.replace(filename, filename.replace(/\.[^.]+$/, '.mp4'));
            }

            return embedUrl + '.mp4';
        } catch {
            return null;
        }
    }

    extractThumbnail(episodeData) {
        // Generate thumbnail from video URL or use placeholder
        if (episodeData.playback?.embed_url) {
            try {
                const url = new URL(episodeData.playback.embed_url);
                return url.origin + url.pathname + '_thumb.jpg';
            } catch {
                return 'images/logo.png';
            }
        }
        return 'images/logo.png';
    }

    generateShowThumbnail(firstEpisode) {
        if (firstEpisode?.thumbnail) {
            return firstEpisode.thumbnail;
        }
        return 'images/logo.png';
    }

    extractAuthor(showData) {
        // Extract author from show name or first episode
        const name = showData.name || '';

        const authorPatterns = [
            /with\s+([^-]+)/i,
            /by\s+([^-]+)/i,
            /([^-]+)\s*-/,
        ];

        for (const pattern of authorPatterns) {
            const match = name.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        return showData.author || 'Unknown Minister';
    }

    determineShowCategory(showName, episodes) {
        const name = (showName || '').toLowerCase();

        if (name.includes('worship') || name.includes('praise') || name.includes('music')) {
            return 'Worship';
        }
        if (name.includes('prophecy') || name.includes('prophetic')) {
            return 'Prophecy';
        }
        if (name.includes('live') || name.includes('broadcast')) {
            return 'Live';
        }
        if (name.includes('original') || name.includes('exclusive')) {
            return 'Original';
        }
        if (name.includes('movie') || name.includes('film')) {
            return 'Movies';
        }

        return 'Teaching'; // Default category
    }

    isShowFeatured(showName) {
        const featuredKeywords = [
            'oasis',
            'manna-fest',
            'perry stone',
            'greater love',
            'featured'
        ];

        const name = (showName || '').toLowerCase();
        return featuredKeywords.some(keyword => name.includes(keyword));
    }

    generateGradient(showName) {
        // Generate consistent gradients based on show name
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
        ];

        const hash = (showName || '').split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);

        return gradients[Math.abs(hash) % gradients.length];
    }

    generateEpisodeDescription(episodeData) {
        const templates = [
            'Experience powerful spiritual teaching that will transform your faith journey.',
            'Join us for inspiring biblical insights and practical life application.',
            'Discover God\'s love through this encouraging message of hope and faith.',
            'Strengthen your spiritual walk with profound biblical wisdom and guidance.',
            'Be inspired by this uplifting message that speaks to the heart and soul.'
        ];

        const hash = (episodeData.fileName || '').length;
        return templates[hash % templates.length];
    }

    generateShowDescription(showData, episodes) {
        const author = this.extractAuthor(showData);
        const episodeCount = episodes.length;

        return `Join ${author} for inspiring spiritual content that will strengthen your faith and provide biblical guidance for daily living. This collection features ${episodeCount} episodes of transformative teaching and encouragement.`;
    }

    createCategoriesFromShows(shows) {
        const categories = [];
        const categoryMap = new Map();

        // Count shows by category
        shows.forEach(show => {
            const category = show.category || 'Teaching';
            categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
        });

        // Create category objects matching iOS structure
        categoryMap.forEach((count, categoryName) => {
            const categoryData = ShowCategory[categoryName.toUpperCase()] || ShowCategory.TEACHING;

            categories.push({
                id: categoryName.toLowerCase(),
                name: categoryName,
                displayName: categoryData.displayName,
                color: categoryData.color,
                icon: categoryData.icon,
                showCount: count
            });
        });

        return categories;
    }

    // MARK: - Professional Fallback Data (matching iOS patterns)
    getFallbackData(endpoint) {
        switch (endpoint) {
            case '/shows':
                return { docs: this.getFallbackShowsData() };
            case '/live-streams':
                return { docs: this.getFallbackLiveStreamsData() };
            default:
                return null;
        }
    }

    loadFallbackData() {
        console.log('🔄 Loading professional fallback data...');
        this.loadFallbackShows();
        this.loadFallbackLiveStreams();
    }

    loadFallbackShows() {
        const fallbackData = this.getFallbackShowsData();
        this.allShows = fallbackData.map(showData => this.processShowData(showData)).filter(Boolean);
        console.log(`📚 Loaded ${this.allShows.length} fallback shows`);
    }

    loadFallbackLiveStreams() {
        const fallbackData = this.getFallbackLiveStreamsData();
        this.liveStreams = fallbackData.map(streamData => new LiveStream(streamData));
        console.log(`🔴 Loaded ${this.liveStreams.length} fallback live streams`);
    }

    getFallbackShowsData() {
        return [
            {
                _id: 'show_oasis_ministries',
                name: 'Oasis Ministries with Anthony & Sheila Wynn',
                author: 'Anthony & Sheila Wynn',
                creationTime: '2023-01-01T00:00:00Z',
                docs: this.generateFallbackEpisodes('oasis', 125)
            },
            {
                _id: 'show_light_up_world',
                name: 'Light Up The World with Jessica & Micah Wynn',
                author: 'Jessica & Micah Wynn',
                creationTime: '2023-02-01T00:00:00Z',
                docs: this.generateFallbackEpisodes('light_up', 89)
            },
            {
                _id: 'show_created_to_praise',
                name: 'Created To Praise with Tim Hill',
                author: 'Tim Hill',
                creationTime: '2023-03-01T00:00:00Z',
                docs: this.generateFallbackEpisodes('praise', 67)
            },
            {
                _id: 'show_manna_fest',
                name: 'Manna-Fest with Perry Stone',
                author: 'Perry Stone',
                creationTime: '2023-04-01T00:00:00Z',
                docs: this.generateFallbackEpisodes('manna_fest', 234)
            },
            {
                _id: 'show_pace_assembly',
                name: 'Pace Assembly with Joey And Rita Rogers',
                author: 'Joey And Rita Rogers',
                creationTime: '2023-05-01T00:00:00Z',
                docs: this.generateFallbackEpisodes('pace', 156)
            },
            {
                _id: 'show_word_of_life',
                name: 'Word Of Life with Dr. Caesar Molebatsi',
                author: 'Dr. Caesar Molebatsi',
                creationTime: '2023-06-01T00:00:00Z',
                docs: this.generateFallbackEpisodes('word_of_life', 98)
            }
        ];
    }

    generateFallbackEpisodes(showPrefix, count) {
        const episodes = [];
        const maxEpisodes = Math.min(count, 24); // Limit for demo

        for (let i = 1; i <= maxEpisodes; i++) {
            episodes.push({
                _id: `${showPrefix}_episode_${i}`,
                fileName: `${showPrefix}_episode_${i.toString().padStart(3, '0')}.mp4`,
                bytes: Math.floor(Math.random() * 1000000000) + 500000000, // 500MB - 1.5GB
                creationTime: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toISOString(),
                author: this.getShowAuthorByPrefix(showPrefix),
                mediaInfo: {
                    duration: Math.floor(Math.random() * 3600) + 1800 // 30-90 minutes
                },
                playback: {
                    embed_url: `https://demo.castr.com/embed/${showPrefix}_ep_${i}`,
                    hls_url: `https://demo.castr.com/hls/${showPrefix}_ep_${i}.m3u8`
                }
            });
        }

        return episodes;
    }

    getShowAuthorByPrefix(prefix) {
        const authorMap = {
            'oasis': 'Anthony & Sheila Wynn',
            'light_up': 'Jessica & Micah Wynn',
            'praise': 'Tim Hill',
            'manna_fest': 'Perry Stone',
            'pace': 'Joey And Rita Rogers',
            'word_of_life': 'Dr. Caesar Molebatsi'
        };
        return authorMap[prefix] || 'Greater Love Network';
    }

    getFallbackLiveStreamsData() {
        return [
            {
                _id: 'stream_greater_love_1',
                name: 'Greater Love TV I',
                enabled: true,
                creation_time: '2023-01-01T00:00:00Z',
                embed_url: 'https://live.castr.com/5b6b58b3-ce82-4e6b-9a9c-0a8c3b4c5d6e/live',
                hls_url: 'https://live.castr.com/5b6b58b3-ce82-4e6b-9a9c-0a8c3b4c5d6e/live.m3u8',
                thumbnail_url: 'images/GL_live_1.png',
                broadcasting_status: 'online',
                ingest: {
                    server: 'rtmp://live.castr.com/live',
                    key: 'gl_stream_key_1'
                }
            },
            {
                _id: 'stream_greater_love_2',
                name: 'Greater Love TV II',
                enabled: true,
                creation_time: '2023-01-01T00:00:00Z',
                embed_url: 'https://live.castr.com/alternative-stream/live',
                hls_url: 'https://live.castr.com/alternative-stream/live.m3u8',
                thumbnail_url: 'images/GL_live_2.png',
                broadcasting_status: 'online',
                ingest: {
                    server: 'rtmp://live.castr.com/live',
                    key: 'gl_stream_key_2'
                }
            }
        ];
    }

    // MARK: - Legacy Support Methods (for backward compatibility)
    getMockShows() {
        return this.getShows();
    }

    getMockCategories() {
        return this.getCategories();
    }

    getMockLiveStreams() {
        return this.getLiveStreams();
    }
}

    getMockShows() {
        return [
            {
                id: 1,
                name: "Oasis Ministries",
                displayName: "Oasis Ministries with Anthony & Sheila Wynn",
                category: "Teaching",
                episodeCount: 125,
                thumbnail: "images/logo.png",
                description: "Biblical teaching from Anthony & Sheila Wynn",
                streamUrl: "https://example.com/stream1.m3u8"
            },
            {
                id: 2,
                name: "Jessica & Micah Wynn",
                displayName: "Light Up The World",
                category: "Teaching",
                episodeCount: 89,
                thumbnail: "images/logo.png",
                description: "Inspirational messages from Jessica & Micah Wynn",
                streamUrl: "https://example.com/stream2.m3u8"
            },
            {
                id: 3,
                name: "Created To Praise",
                displayName: "Created To Praise with Tim Hill",
                category: "Worship",
                episodeCount: 67,
                thumbnail: "images/logo.png",
                description: "Worship and praise with Tim Hill",
                streamUrl: "https://example.com/stream3.m3u8"
            },
            {
                id: 4,
                name: "Manna-Fest",
                displayName: "Manna-Fest with Perry Stone",
                category: "Prophecy",
                episodeCount: 234,
                thumbnail: "images/logo.png",
                description: "Prophetic insights with Perry Stone",
                streamUrl: "https://example.com/stream4.m3u8"
            },
            {
                id: 5,
                name: "Pace Assembly",
                displayName: "Pace Assembly with Joey And Rita Rogers",
                category: "Teaching",
                episodeCount: 156,
                thumbnail: "images/logo.png",
                description: "Biblical teachings from Joey and Rita Rogers",
                streamUrl: "https://example.com/stream5.m3u8"
            },
            {
                id: 6,
                name: "Word Of Life Ministries",
                displayName: "Word Of Life with Dr. Caesar Molebatsi",
                category: "Teaching",
                episodeCount: 98,
                thumbnail: "images/logo.png",
                description: "Life-changing teachings from Dr. Caesar Molebatsi",
                streamUrl: "https://example.com/stream6.m3u8"
            }
        ];
    }

    getMockCategories() {
        return [
            {
                id: 1,
                name: "All",
                displayName: "All Categories",
                color: "#007AFF",
                icon: "grid",
                showCount: 45
            },
            {
                id: 2,
                name: "Original",
                displayName: "Original Content",
                color: "#34C759",
                icon: "star",
                showCount: 12
            },
            {
                id: 3,
                name: "Live TV",
                displayName: "Live Broadcasts",
                color: "#FF3B30",
                icon: "tv",
                showCount: 8
            },
            {
                id: 4,
                name: "Movies",
                displayName: "Spiritual Movies",
                color: "#FF9500",
                icon: "film",
                showCount: 15
            },
            {
                id: 5,
                name: "Web Series",
                displayName: "Web Series",
                color: "#AF52DE",
                icon: "play",
                showCount: 10
            },
            {
                id: 6,
                name: "Teaching",
                displayName: "Bible Teaching",
                color: "#5856D6",
                icon: "book",
                showCount: 25
            },
            {
                id: 7,
                name: "Worship",
                displayName: "Worship & Music",
                color: "#FF2D92",
                icon: "music",
                showCount: 18
            },
            {
                id: 8,
                name: "Prophecy",
                displayName: "Prophetic Content",
                color: "#32D74B",
                icon: "eye",
                showCount: 12
            }
        ];
    }

    getMockLiveStreams() {
        return [
            {
                id: 1,
                name: "Greater Love TV I",
                displayName: "Greater Love TV 1",
                channelNumber: 1,
                broadcasting_status: "online",
                streamUrl: "https://live.castr.com/5b6b58b3-ce82-4e6b-9a9c-0a8c3b4c5d6e/live.m3u8",
                thumbnail: "images/GL_live_1.png"
            },
            {
                id: 2,
                name: "Greater Love TV II",
                displayName: "Greater Love TV 2",
                channelNumber: 2,
                broadcasting_status: "online",
                streamUrl: "https://live.castr.com/5b6b58b3-ce82-4e6b-9a9c-0a8c3b4c5d6e/live.m3u8",
                thumbnail: "images/GL_live_2.png"
            }
        ];
    }
}
