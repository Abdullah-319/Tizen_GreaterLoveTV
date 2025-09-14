// Watch Progress Manager - Track viewing progress
class WatchProgressManager {
    constructor() {
        this.progress = this.loadProgress();
        this.callbacks = [];
    }

    static get shared() {
        if (!WatchProgressManager._instance) {
            WatchProgressManager._instance = new WatchProgressManager();
        }
        return WatchProgressManager._instance;
    }

    saveProgress(videoId, currentTime, duration) {
        this.progress[videoId] = {
            currentTime: currentTime,
            duration: duration,
            timestamp: Date.now(),
            completed: (currentTime / duration) > 0.9
        };
        this.persistProgress();
        this.notifyCallbacks();
    }

    getProgress(videoId) {
        return this.progress[videoId] || null;
    }

    getContinueWatchingVideos() {
        return Object.keys(this.progress)
            .filter(videoId => {
                const prog = this.progress[videoId];
                return prog && !prog.completed && prog.currentTime > 30;
            })
            .map(videoId => ({
                id: videoId,
                ...this.progress[videoId]
            }))
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 6);
    }

    loadProgress() {
        try {
            return JSON.parse(localStorage.getItem('greaterLoveProgress') || '{}');
        } catch {
            return {};
        }
    }

    persistProgress() {
        try {
            localStorage.setItem('greaterLoveProgress', JSON.stringify(this.progress));
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }

    onProgressUpdate(callback) {
        this.callbacks.push(callback);
    }

    notifyCallbacks() {
        this.callbacks.forEach(cb => cb(this.progress));
    }
}