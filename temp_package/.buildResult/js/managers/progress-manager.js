// js/managers/progress-manager.js - Progress Management
class ProgressManager {
    constructor() {
        this.storage = new Map();
        this.storageKey = 'greaterLoveTV_progress';
    }

    async init() {
        this.loadFromStorage();
        console.log('ProgressManager initialized');
    }

    loadFromStorage() {
        try {
            // In a real Tizen app, you would use tizen.preference or file system
            // For web compatibility, we'll use a simple in-memory storage
            const stored = sessionStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.storage = new Map(Object.entries(data));
            }
        } catch (error) {
            console.warn('Could not load progress from storage:', error);
        }
    }

    saveToStorage() {
        try {
            const data = Object.fromEntries(this.storage);
            sessionStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.warn('Could not save progress to storage:', error);
        }
    }

    updateProgress(videoId, currentTime, duration, title, showName, thumbnail) {
        const progressData = {
            videoId,
            currentTime,
            duration,
            title,
            showName,
            thumbnail,
            lastWatched: Date.now(),
            progress: (currentTime / duration) * 100
        };

        this.storage.set(videoId, progressData);
        this.saveToStorage();
    }

    getProgress(videoId) {
        return this.storage.get(videoId);
    }

    getContinueWatching() {
        const items = Array.from(this.storage.values())
            .filter(item => item.progress > 5 && item.progress < 95) // Only show partially watched items
            .sort((a, b) => b.lastWatched - a.lastWatched) // Most recent first
            .slice(0, 6); // Limit to 6 items

        return Promise.resolve(items);
    }

    clearProgress(videoId) {
        this.storage.delete(videoId);
        this.saveToStorage();
    }

    clearAllProgress() {
        this.storage.clear();
        this.saveToStorage();
    }
}