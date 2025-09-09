// Greater Love Network - Data Models
// Converted from Swift Models.swift to JavaScript

// MARK: - Live Stream Model
class LiveStream {
    constructor(data) {
        this.id = data.id || data._id || this.generateId();
        this._id = data._id;
        this.name = data.name;
        this.enabled = data.enabled || true;
        this.creation_time = data.creation_time;
        this.embed_url = data.embed_url;
        this.hls_url = data.hls_url;
        this.thumbnail_url = data.thumbnail_url;
        this.broadcasting_status = data.broadcasting_status;
        this.ingest = data.ingest ? new Ingest(data.ingest) : null;
        this.playback = data.playback ? new Playback(data.playback) : null;
    }

    generateId() {
        return 'stream_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    get bestStreamURL() {
        // Prioritize HLS URLs for live streaming
        if (this.hls_url) return this.hls_url;
        if (this.playback && this.playback.hls_url) return this.playback.hls_url;
        
        // Fallback to embed URL
        if (this.embed_url) return this.embed_url;
        if (this.playback && this.playback.embed_url) return this.playback.embed_url;
        
        return null;
    }

    get isOnline() {
        return this.broadcasting_status && this.broadcasting_status.toLowerCase() === 'online';
    }

    get isValidForStreaming() {
        return this.enabled && this.bestStreamURL !== null;
    }

    get statusColor() {
        switch (this.broadcasting_status && this.broadcasting_status.toLowerCase()) {
            case 'online':
                return '#ff4444';
            case 'offline':
                return '#gray';
            default:
                return '#orange';
        }
    }
}

// MARK: - Ingest Model
class Ingest {
    constructor(data) {
        this.server = data.server;
        this.key = data.key;
    }
}

// MARK: - Playback Model
class Playback {
    constructor(data) {
        this.hls_url = data.hls_url;
        this.embed_url = data.embed_url;
        this.embed_audio_url = data.embed_audio_url;
    }
}

// MARK: - Show Model
class Show {
    constructor(data) {
        this.id = data.id || data._id || this.generateId();
        this._id = data._id;
        this.name = data.name;
        this.displayName = data.displayName || data.name;
        this.author = data.author;
        this.showCategory = data.showCategory || ShowCategory.GENERAL;
        this.episodeCount = data.episodeCount || 0;
        this.creationTime = data.creationTime;
        this.episodes = data.episodes ? data.episodes.map(ep => new Episode(ep)) : [];
    }

    generateId() {
        return 'show_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    get firstEpisode() {
        return this.episodes.length > 0 ? this.episodes[0] : null;
    }

    get latestEpisode() {
        if (this.episodes.length === 0) return null;
        
        return this.episodes.reduce((latest, current) => {
            const latestTime = new Date(latest.creationTime || 0);
            const currentTime = new Date(current.creationTime || 0);
            return currentTime > latestTime ? current : latest;
        });
    }

    addEpisode(episode) {
        this.episodes.push(new Episode(episode));
        this.episodeCount = this.episodes.length;
    }
}

// MARK: - Episode Model
class Episode {
    constructor(data) {
        this.id = data.id || data._id || this.generateId();
        this._id = data._id;
        this.episodeId = data.episodeId || data.id;
        this.fileName = data.fileName;
        this.enabled = data.enabled || true;
        this.bytes = data.bytes;
        this.mediaInfo = data.mediaInfo ? new MediaInfo(data.mediaInfo) : null;
        this.encodingRequired = data.encodingRequired || false;
        this.precedence = data.precedence || 0;
        this.author = data.author;
        this.creationTime = data.creationTime;
        this.playback = data.playback ? new EpisodePlayback(data.playback) : null;
    }

    generateId() {
        return 'episode_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    get displayTitle() {
        return this.fileName || 'Untitled Episode';
    }

    get duration() {
        return this.mediaInfo ? this.mediaInfo.duration : null;
    }

    get isPlayable() {
        return this.enabled && this.playback && (this.playback.hls_url || this.playback.embed_url);
    }
}

// MARK: - Episode Playback Model
class EpisodePlayback {
    constructor(data) {
        this.embed_url = data.embed_url;
        this.hls_url = data.hls_url;
    }
}

// MARK: - Media Info Model
class MediaInfo {
    constructor(data) {
        this.duration = data.duration;
        this.width = data.width;
        this.height = data.height;
        this.bitrate = data.bitrate;
        this.frameRate = data.frameRate;
        this.codec = data.codec;
    }

    get aspectRatio() {
        if (this.width && this.height) {
            return this.width / this.height;
        }
        return 16/9; // Default aspect ratio
    }

    get resolution() {
        if (this.width && this.height) {
            return `${this.width}x${this.height}`;
        }
        return 'Unknown';
    }
}

// MARK: - Show Category Enum
const ShowCategory = {
    ALL: 'All Shows',
    BIBLICAL_TEACHING: 'Biblical Teaching',
    MINISTRY: 'Ministry & Outreach',
    CHURCH: 'Church Services',
    INSPIRATIONAL: 'Inspirational',
    WORSHIP: 'Worship & Praise',
    TESTIMONY: 'Testimonies',
    LIVE_STREAMS: 'Live Streams',
    GENERAL: 'General',

    // Static methods
    getAll() {
        return [
            this.ALL,
            this.BIBLICAL_TEACHING,
            this.MINISTRY,
            this.CHURCH,
            this.INSPIRATIONAL,
            this.WORSHIP,
            this.TESTIMONY,
            this.LIVE_STREAMS,
            this.GENERAL
        ];
    },

    getColor(category) {
        switch (category) {
            case this.ALL:
                return 'rgba(51, 153, 255, 1)';
            case this.BIBLICAL_TEACHING:
                return 'rgba(204, 102, 51, 1)';
            case this.MINISTRY:
                return 'rgba(76, 178, 102, 1)';
            case this.CHURCH:
                return 'rgba(153, 51, 204, 1)';
            case this.INSPIRATIONAL:
                return 'rgba(255, 178, 76, 1)';
            case this.WORSHIP:
                return 'rgba(229, 76, 229, 1)';
            case this.TESTIMONY:
                return 'rgba(51, 204, 204, 1)';
            case this.LIVE_STREAMS:
                return '#ff4444';
            case this.GENERAL:
            default:
                return 'rgba(127, 127, 204, 1)';
        }
    },

    getIcon(category) {
        switch (category) {
            case this.ALL:
                return '📺';
            case this.BIBLICAL_TEACHING:
                return '📖';
            case this.MINISTRY:
                return '🏢';
            case this.CHURCH:
                return '⛪';
            case this.INSPIRATIONAL:
                return '💝';
            case this.WORSHIP:
                return '🙏';
            case this.TESTIMONY:
                return '💬';
            case this.LIVE_STREAMS:
                return '📡';
            case this.GENERAL:
            default:
                return '🎬';
        }
    }
};

// MARK: - Show Collection Model
class ShowCollection {
    constructor(category, shows = []) {
        this.id = this.generateId();
        this.category = category;
        this.shows = shows.map(show => show instanceof Show ? show : new Show(show));
    }

    generateId() {
        return 'collection_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    get displayTitle() {
        return this.category;
    }

    get showCount() {
        return this.shows.length;
    }

    get totalEpisodes() {
        return this.shows.reduce((total, show) => total + show.episodeCount, 0);
    }

    addShow(show) {
        this.shows.push(show instanceof Show ? show : new Show(show));
    }

    getShowsByAuthor(author) {
        return this.shows.filter(show => 
            show.author && show.author.toLowerCase().includes(author.toLowerCase())
        );
    }

    getRecentShows(limit = 5) {
        return this.shows
            .sort((a, b) => new Date(b.creationTime || 0) - new Date(a.creationTime || 0))
            .slice(0, limit);
    }
}

// MARK: - Recording Model (for backward compatibility)
class Recording {
    constructor(data) {
        this.id = data.id || data._id || this.generateId();
        this._id = data._id;
        this.videoFolderId = data.videoFolderId;
        this.recordingId = data.recordingId || data.id;
        this.name = data.name;
        this.from = data.from;
        this.duration = data.duration;
        this.bytes = data.bytes;
        this.status = data.status;
        this.creationTime = data.creationTime;
        this.playback = data.playback ? new RecordingPlayback(data.playback) : null;
    }

    generateId() {
        return 'recording_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// MARK: - Recording Playback Model
class RecordingPlayback {
    constructor(data) {
        this.embed_url = data.embed_url;
        this.hls_url = data.hls_url;
    }
}

// MARK: - Category Model (for backward compatibility)
class Category {
    constructor(name, image, color, videos = []) {
        this.id = this.generateId();
        this.name = name;
        this.image = image;
        this.color = color;
        this.videos = videos.map(video => video instanceof VideoData ? video : new VideoData(video));
    }

    generateId() {
        return 'category_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    get videoCount() {
        return this.videos.length;
    }
}

// MARK: - Video Data Model (for backward compatibility)
class VideoData {
    constructor(data) {
        this.id = data.id || data._id || this.generateId();
        this.dataId = data.dataId || data.id;
        this.fileName = data.fileName;
        this.enabled = data.enabled || true;
        this.bytes = data.bytes;
        this.mediaInfo = data.mediaInfo ? new MediaInfo(data.mediaInfo) : null;
        this.encodingRequired = data.encodingRequired || false;
        this.precedence = data.precedence || 0;
        this.author = data.author;
        this.creationTime = data.creationTime;
        this._id = data._id;
        this.playback = data.playback ? new VideoPlayback(data.playback) : null;
    }

    generateId() {
        return 'video_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// MARK: - Video Playback Model
class VideoPlayback {
    constructor(data) {
        this.embed_url = data.embed_url;
        this.hls_url = data.hls_url;
    }
}

// MARK: - API Response Models
class ShowsResponse {
    constructor(data) {
        this.total = data.total || 0;
        this.page = data.page || 1;
        this.pages = data.pages || 1;
        this.docs = data.docs ? data.docs.map(show => new Show(show)) : [];
    }
}

// MARK: - Thumbnail State Enum
const ThumbnailState = {
    LOADING: 'loading',
    LOADED: 'loaded',
    FAILED: 'failed'
};

// MARK: - Utility Functions
const ModelUtils = {
    // Convert Episode to VideoData for backward compatibility
    convertEpisodeToVideoData(episode) {
        return new VideoData({
            dataId: episode.episodeId,
            fileName: episode.fileName,
            enabled: episode.enabled,
            bytes: episode.bytes,
            mediaInfo: episode.mediaInfo,
            encodingRequired: episode.encodingRequired,
            precedence: episode.precedence,
            author: episode.author,
            creationTime: episode.creationTime,
            _id: episode._id,
            playback: episode.playback ? {
                embed_url: episode.playback.embed_url,
                hls_url: episode.playback.hls_url
            } : null
        });
    },

    // Create categories from shows
    createCategoriesFromShows(shows) {
        const categoryMap = new Map();
        
        shows.forEach(show => {
            const category = show.showCategory || ShowCategory.GENERAL;
            if (!categoryMap.has(category)) {
                categoryMap.set(category, {
                    name: category,
                    shows: [],
                    episodes: []
                });
            }
            
            const cat = categoryMap.get(category);
            cat.shows.push(show);
            cat.episodes.push(...show.episodes.map(ep => 
                this.convertEpisodeToVideoData(ep)
            ));
        });
        
        const categories = [];
        for (const [categoryName, categoryData] of categoryMap) {
            categories.push(new Category(
                categoryName,
                `${categoryName.toLowerCase().replace(/\s+/g, '_')}_image`,
                ShowCategory.getColor(categoryName),
                categoryData.episodes
            ));
        }
        
        return categories;
    },

    // Format duration from seconds to readable string
    formatDuration(seconds) {
        if (!seconds || seconds <= 0) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    },

    // Format file size from bytes to readable string
    formatFileSize(bytes) {
        if (!bytes || bytes <= 0) return '0 B';
        
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
    },

    // Format date to readable string
    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LiveStream,
        Ingest,
        Playback,
        Show,
        Episode,
        EpisodePlayback,
        MediaInfo,
        ShowCategory,
        ShowCollection,
        Recording,
        RecordingPlayback,
        Category,
        VideoData,
        VideoPlayback,
        ShowsResponse,
        ThumbnailState,
        ModelUtils
    };
}