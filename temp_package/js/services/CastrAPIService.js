// Greater Love Network - Castr API Service
// Converted from Swift CastrAPIService.swift to JavaScript

class CastrAPIService {
    constructor() {
        this.baseURL = 'https://api.castr.com/v2';
        this.accessToken = '5aLoKjrNjly4';
        this.secretKey = 'UjTCq8wOj76vjXznGFzdbMRzAkFq6VlJElBQ';
        
        // Published properties (equivalent to @Published in Swift)
        this.liveStreams = [];
        this.shows = [];
        this.allEpisodes = [];
        this.showCollections = [];
        this.recordings = [];
        this.featuredShows = [];
        this.featuredMinisters = {};
        this.isLoading = false;
        this.isLoadingMoreShows = false;
        this.errorMessage = null;
        this.thumbnailStates = {};
        
        // Pagination state
        this.currentPage = 1;
        this.totalPages = 1;
        this.hasMorePages = false;
        
        // Backward compatibility properties
        this.videos = [];
        this.videoData = [];
        this.categories = [];
        
        // Event callbacks for reactive updates
        this.callbacks = {
            onShowsUpdate: [],
            onLiveStreamsUpdate: [],
            onLoadingUpdate: [],
            onError: []
        };
    }

    // MARK: - Auth Header
    get authHeader() {
        const credentials = `${this.accessToken}:${this.secretKey}`;
        const encodedCredentials = btoa(credentials);
        return `Basic ${encodedCredentials}`;
    }

    // MARK: - Event Subscription Methods
    onShowsUpdate(callback) {
        this.callbacks.onShowsUpdate.push(callback);
    }

    onLiveStreamsUpdate(callback) {
        this.callbacks.onLiveStreamsUpdate.push(callback);
    }

    onLoadingUpdate(callback) {
        this.callbacks.onLoadingUpdate.push(callback);
    }

    onError(callback) {
        this.callbacks.onError.push(callback);
    }

    // MARK: - Private notification methods
    _notifyShowsUpdate() {
        this.callbacks.onShowsUpdate.forEach(callback => callback(this.shows));
    }

    _notifyLiveStreamsUpdate() {
        this.callbacks.onLiveStreamsUpdate.forEach(callback => callback(this.liveStreams));
    }

    _notifyLoadingUpdate() {
        this.callbacks.onLoadingUpdate.forEach(callback => callback(this.isLoading));
    }

    _notifyError(error) {
        this.callbacks.onError.forEach(callback => callback(error));
    }

    // MARK: - Main Content Fetching
    async fetchAllContent() {
        this.addStaticLiveStreams();
        await Promise.all([
            this.fetchAllShowsWithPagination(),
            this.fetchLiveStreams()
        ]);
    }

    // MARK: - Static Live Streams
    addStaticLiveStreams() {
        const channel1 = new LiveStream({
            _id: 'static_channel_1',
            name: 'Greater Love TV Channel 1',
            enabled: true,
            creation_time: '2025-01-01T00:00:00.000Z',
            embed_url: 'https://swf.tulix.tv/iframe/greaterlove/',
            hls_url: 'https://rpn.bozztv.com/dvrfl03/itv04060/index.m3u8',
            thumbnail_url: null,
            broadcasting_status: 'online',
            ingest: null,
            playback: new Playback({
                hls_url: 'https://rpn.bozztv.com/dvrfl03/itv04060/index.m3u8',
                embed_url: 'https://swf.tulix.tv/iframe/greaterlove/',
                embed_audio_url: null
            })
        });

        const channel2 = new LiveStream({
            _id: 'static_channel_2',
            name: 'Greater Love TV Channel 2',
            enabled: true,
            creation_time: '2025-01-01T00:00:00.000Z',
            embed_url: 'https://swf.tulix.tv/iframe/greaterlove2/',
            hls_url: 'https://rpn.bozztv.com/dvrfl03/itv04061/index.m3u8',
            thumbnail_url: null,
            broadcasting_status: 'online',
            ingest: null,
            playback: new Playback({
                hls_url: 'https://rpn.bozztv.com/dvrfl03/itv04061/index.m3u8',
                embed_url: 'https://swf.tulix.tv/iframe/greaterlove2/',
                embed_audio_url: null
            })
        });

        this.liveStreams = [channel1, channel2];
        this._notifyLiveStreamsUpdate();
    }

    // MARK: - Shows Fetching
    async fetchAllShowsWithPagination() {
        this.isLoading = true;
        this.currentPage = 1;
        this._notifyLoadingUpdate();

        try {
            let allShows = [];
            let hasMore = true;

            while (hasMore && this.currentPage <= 10) { // Limit to prevent infinite loops
                const response = await this.fetchShows(this.currentPage);
                
                if (response && response.docs) {
                    allShows.push(...response.docs);
                    
                    this.totalPages = response.pages || 1;
                    hasMore = this.currentPage < this.totalPages;
                    this.currentPage++;
                } else {
                    hasMore = false;
                }
                
                // Add delay to prevent rate limiting
                if (hasMore) {
                    await this.delay(500);
                }
            }

            this.shows = allShows.map(show => new Show(show));
            this.hasMorePages = this.currentPage <= this.totalPages;

            // Fetch episodes for each show
            await this.fetchEpisodesForAllShows();
            
            // Create collections and categories
            this.createShowCollections();
            this.createBackwardCompatibilityData();

        } catch (error) {
            console.error('Failed to fetch shows:', error);
            this.errorMessage = 'Failed to load shows. Please check your connection.';
            this._notifyError(this.errorMessage);
            
            // Load mock data as fallback
            this.loadMockData();
        } finally {
            this.isLoading = false;
            this._notifyLoadingUpdate();
            this._notifyShowsUpdate();
        }
    }

    async fetchShows(page = 1) {
        const response = await fetch(`${this.baseURL}/shows?page=${page}&limit=50`, {
            method: 'GET',
            headers: {
                'Authorization': this.authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    // MARK: - Episodes Fetching
    async fetchEpisodesForAllShows() {
        const promises = this.shows.map(show => this.fetchEpisodes(show._id));
        await Promise.allSettled(promises);
    }

    async fetchEpisodes(showId) {
        try {
            const response = await fetch(`${this.baseURL}/shows/${showId}/episodes?limit=100`, {
                method: 'GET',
                headers: {
                    'Authorization': this.authHeader,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const show = this.shows.find(s => s._id === showId);
                
                if (show && data.docs) {
                    show.episodes = data.docs.map(ep => new Episode(ep));
                    show.episodeCount = show.episodes.length;
                    
                    // Add to allEpisodes array
                    this.allEpisodes.push(...show.episodes);
                }
            }
        } catch (error) {
            console.error(`Failed to fetch episodes for show ${showId}:`, error);
        }
    }

    // MARK: - Live Streams Fetching
    async fetchLiveStreams() {
        try {
            const response = await fetch(`${this.baseURL}/livestreams`, {
                method: 'GET',
                headers: {
                    'Authorization': this.authHeader,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const apiLiveStreams = data.docs ? data.docs.map(stream => new LiveStream(stream)) : [];
                
                // Combine with static streams (static streams first)
                this.liveStreams = [...this.liveStreams, ...apiLiveStreams];
                this._notifyLiveStreamsUpdate();
            }
        } catch (error) {
            console.error('Failed to fetch live streams:', error);
            // Keep static streams only
        }
    }

    // MARK: - Video URL Extraction
    async extractMP4URL(embedURL) {
        return new Promise((resolve) => {
            if (!embedURL) {
                resolve(null);
                return;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

            fetch(embedURL, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Smart TV; Tizen 6.0) AppleWebKit/537.36'
                }
            })
            .then(response => response.text())
            .then(html => {
                clearTimeout(timeoutId);
                
                // Enhanced URL extraction patterns
                const patterns = [
                    /https:\/\/cstr-vod\.castr\.com\/videos\/[^\/]+\/[^\/]+\.mp4\/index\.m3u8/g,
                    /https:\/\/[^"'\s]*\.m3u8[^"'\s]*/g,
                    /https:\/\/cstr-vod\.castr\.com\/videos\/[^\/]+\/[^"'\s]*\.mp4/g,
                    /src\s*[=:]\s*["']([^"']*\.(mp4|m3u8)[^"']*)/g,
                    /file\s*[=:]\s*["']([^"']*\.(mp4|m3u8)[^"']*)/g
                ];

                for (const pattern of patterns) {
                    const matches = html.match(pattern);
                    if (matches && matches.length > 0) {
                        let url = matches[0];
                        
                        // Clean up the URL
                        url = url.replace(/^(src\s*[=:]\s*["']|file\s*[=:]\s*["'])/, '');
                        url = url.replace(/["']$/, '');
                        
                        resolve(url);
                        return;
                    }
                }

                // Fallback pattern matching for Castr VOD URLs
                if (embedURL.includes('player.castr.com/vod/')) {
                    const urlParts = embedURL.split('/');
                    const videoId = urlParts[urlParts.length - 1];
                    
                    if (videoId) {
                        const possibleURL = `https://cstr-vod.castr.com/videos/${videoId}/index.m3u8`;
                        resolve(possibleURL);
                        return;
                    }
                }

                resolve(null);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                console.error('Failed to extract video URL:', error);
                resolve(null);
            });
        });
    }

    // MARK: - Show Collections
    createShowCollections() {
        const collections = [];

        // All Shows Collection (Always first)
        collections.push(new ShowCollection(ShowCategory.ALL, this.shows));

        // Group shows by category
        const groupedShows = {};
        this.shows.forEach(show => {
            const category = show.showCategory || ShowCategory.GENERAL;
            if (!groupedShows[category]) {
                groupedShows[category] = [];
            }
            groupedShows[category].push(show);
        });

        // Create collections for each category
        ShowCategory.getAll().forEach(category => {
            if (category === ShowCategory.ALL) return;
            
            const showsInCategory = groupedShows[category];
            if (showsInCategory && showsInCategory.length > 0) {
                // Sort shows by episode count and name
                const sortedShows = showsInCategory.sort((a, b) => {
                    if (a.episodeCount === b.episodeCount) {
                        return a.displayName.localeCompare(b.displayName);
                    }
                    return b.episodeCount - a.episodeCount;
                });

                collections.push(new ShowCollection(category, sortedShows));
            }
        });

        // Sort collections by total episodes (except "All Shows" which stays first)
        const allShowsCollection = collections.find(c => c.category === ShowCategory.ALL);
        const otherCollections = collections
            .filter(c => c.category !== ShowCategory.ALL)
            .sort((a, b) => b.totalEpisodes - a.totalEpisodes);

        this.showCollections = allShowsCollection ? [allShowsCollection, ...otherCollections] : otherCollections;
    }

    // MARK: - Backward Compatibility
    createBackwardCompatibilityData() {
        // Create videos array (alias for shows)
        this.videos = [...this.shows];

        // Create videoData array from episodes
        this.videoData = this.allEpisodes.map(episode => 
            ModelUtils.convertEpisodeToVideoData(episode)
        );

        // Create categories
        this.categories = ModelUtils.createCategoriesFromShows(this.shows);
    }

    // MARK: - Utility Methods
    findEpisode(episodeId) {
        return this.allEpisodes.find(ep => ep._id === episodeId);
    }

    findShow(showId) {
        return this.shows.find(show => show._id === showId);
    }

    findShowContaining(episodeId) {
        return this.shows.find(show => 
            show.episodes.some(ep => ep._id === episodeId)
        );
    }

    getCategories() {
        return this.categories;
    }

    // MARK: - Mock Data (Fallback)
    loadMockData() {
        console.log('Loading mock data as fallback...');
        
        const mockShows = [
            {
                _id: 'mock1',
                name: 'Biblical Teaching',
                displayName: 'Biblical Teaching Series',
                author: 'Pastor John Smith',
                showCategory: ShowCategory.BIBLICAL_TEACHING,
                episodeCount: 12,
                creationTime: '2024-01-01T00:00:00Z',
                episodes: [
                    {
                        _id: 'ep1',
                        fileName: 'Episode 1 - Introduction to Faith',
                        author: 'Pastor John Smith',
                        creationTime: '2024-01-01T00:00:00Z',
                        enabled: true,
                        playback: {
                            hls_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                        }
                    }
                ]
            },
            {
                _id: 'mock2',
                name: 'Worship & Praise',
                displayName: 'Sunday Worship Services',
                author: 'Greater Love Church',
                showCategory: ShowCategory.WORSHIP,
                episodeCount: 24,
                creationTime: '2024-02-01T00:00:00Z',
                episodes: [
                    {
                        _id: 'ep2',
                        fileName: 'Sunday Service - Week 1',
                        author: 'Greater Love Church',
                        creationTime: '2024-02-01T00:00:00Z',
                        enabled: true,
                        playback: {
                            hls_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
                        }
                    }
                ]
            },
            {
                _id: 'mock3',
                name: 'Ministry Outreach',
                displayName: 'Community Ministry',
                author: 'Ministry Team',
                showCategory: ShowCategory.MINISTRY,
                episodeCount: 8,
                creationTime: '2024-03-01T00:00:00Z',
                episodes: [
                    {
                        _id: 'ep3',
                        fileName: 'Community Outreach Program',
                        author: 'Ministry Team',
                        creationTime: '2024-03-01T00:00:00Z',
                        enabled: true,
                        playback: {
                            hls_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                        }
                    }
                ]
            },
            {
                _id: 'mock4',
                name: 'Testimonies',
                displayName: 'Life Changing Testimonies',
                author: 'Various Speakers',
                showCategory: ShowCategory.TESTIMONY,
                episodeCount: 15,
                creationTime: '2024-01-15T00:00:00Z',
                episodes: [
                    {
                        _id: 'ep4',
                        fileName: 'Testimony of Faith',
                        author: 'Various Speakers',
                        creationTime: '2024-01-15T00:00:00Z',
                        enabled: true,
                        playback: {
                            hls_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
                        }
                    }
                ]
            },
            {
                _id: 'mock5',
                name: 'Church Services',
                displayName: 'Weekly Church Services',
                author: 'Pastor Mary Johnson',
                showCategory: ShowCategory.CHURCH,
                episodeCount: 32,
                creationTime: '2023-12-01T00:00:00Z',
                episodes: [
                    {
                        _id: 'ep5',
                        fileName: 'Sunday Service - Hope in Christ',
                        author: 'Pastor Mary Johnson',
                        creationTime: '2023-12-01T00:00:00Z',
                        enabled: true,
                        playback: {
                            hls_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
                        }
                    }
                ]
            },
            {
                _id: 'mock6',
                name: 'Inspirational Messages',
                displayName: 'Daily Inspiration',
                author: 'Dr. David Wilson',
                showCategory: ShowCategory.INSPIRATIONAL,
                episodeCount: 45,
                creationTime: '2024-01-01T00:00:00Z',
                episodes: [
                    {
                        _id: 'ep6',
                        fileName: 'Finding Purpose in Life',
                        author: 'Dr. David Wilson',
                        creationTime: '2024-01-01T00:00:00Z',
                        enabled: true,
                        playback: {
                            hls_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
                        }
                    }
                ]
            }
        ];

        this.shows = mockShows.map(show => new Show(show));
        this.allEpisodes = this.shows.reduce((allEps, show) => [...allEps, ...show.episodes], []);
        
        this.createShowCollections();
        this.createBackwardCompatibilityData();
        
        this._notifyShowsUpdate();
    }

    // MARK: - Utility Helper
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // MARK: - Thumbnail Management
    loadThumbnail(episode) {
        const thumbnailId = episode._id;
        this.thumbnailStates[thumbnailId] = ThumbnailState.LOADING;

        if (episode.playback && episode.playback.hls_url) {
            this.generateThumbnailFromHLS(episode.playback.hls_url, episode);
        } else {
            this.thumbnailStates[thumbnailId] = ThumbnailState.FAILED;
        }
    }

    generateThumbnailFromHLS(hlsURL, episode) {
        // In a real implementation, this would generate a thumbnail from the video
        // For now, we'll simulate this process
        setTimeout(() => {
            // Simulate thumbnail generation success/failure
            const success = Math.random() > 0.3; // 70% success rate
            this.thumbnailStates[episode._id] = success ? ThumbnailState.LOADED : ThumbnailState.FAILED;
        }, 2000 + Math.random() * 3000); // 2-5 second delay
    }

    // MARK: - Search and Filter Methods
    searchShows(query) {
        if (!query || query.trim() === '') {
            return this.shows;
        }

        const searchTerm = query.toLowerCase().trim();
        return this.shows.filter(show => 
            show.displayName.toLowerCase().includes(searchTerm) ||
            show.author.toLowerCase().includes(searchTerm) ||
            show.showCategory.toLowerCase().includes(searchTerm)
        );
    }

    searchEpisodes(query) {
        if (!query || query.trim() === '') {
            return this.allEpisodes;
        }

        const searchTerm = query.toLowerCase().trim();
        return this.allEpisodes.filter(episode => 
            episode.fileName.toLowerCase().includes(searchTerm) ||
            episode.author.toLowerCase().includes(searchTerm)
        );
    }

    getShowsByCategory(category) {
        if (category === ShowCategory.ALL) {
            return this.shows;
        }
        return this.shows.filter(show => show.showCategory === category);
    }

    getShowsByAuthor(author) {
        return this.shows.filter(show => 
            show.author && show.author.toLowerCase().includes(author.toLowerCase())
        );
    }

    getFeaturedShows(limit = 6) {
        // Return shows with most episodes as featured
        return [...this.shows]
            .sort((a, b) => b.episodeCount - a.episodeCount)
            .slice(0, limit);
    }

    getRecentShows(limit = 10) {
        return [...this.shows]
            .sort((a, b) => new Date(b.creationTime || 0) - new Date(a.creationTime || 0))
            .slice(0, limit);
    }

    // MARK: - Statistics Methods
    getTotalEpisodes() {
        return this.allEpisodes.length;
    }

    getTotalShows() {
        return this.shows.length;
    }

    getMostPopularCategory() {
        const categoryCount = {};
        this.shows.forEach(show => {
            const category = show.showCategory || ShowCategory.GENERAL;
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        return Object.keys(categoryCount).reduce((a, b) => 
            categoryCount[a] > categoryCount[b] ? a : b
        );
    }

    // MARK: - Error Handling
    clearError() {
        this.errorMessage = null;
    }

    setError(message) {
        this.errorMessage = message;
        this._notifyError(message);
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.CastrAPIService = CastrAPIService;
}