// js/views/show-detail-view.js - Show Detail View Component
class ShowDetailView {
    constructor(app) {
        this.app = app;
        this.element = null;
        this.currentShow = null;
    }

    async init() {
        this.element = document.getElementById('showDetailView');
        this.setupEventListeners();
        console.log('ShowDetailView initialized');
    }

    setupEventListeners() {
        // Play first episode button
        const playFirstBtn = document.getElementById('playFirstEpisodeBtn');
        if (playFirstBtn) {
            playFirstBtn.addEventListener('click', () => {
                this.playFirstEpisode();
            });
        }

        // Back button
        const backBtn = document.getElementById('backToHomeBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.goBack();
            });
        }
    }

    showShow(show) {
        console.log('Showing show detail for:', show);
        this.currentShow = show;

        // Update show information
        this.updateShowInfo(show);

        // Generate and display episodes
        this.displayEpisodes(show);

        // Show the view
        this.app.navigateToView('showDetail');
    }

    updateShowInfo(show) {
        // Update poster
        const poster = document.getElementById('showDetailPoster');
        if (poster) {
            poster.src = show.thumbnail || 'images/logo.png';
            poster.alt = show.displayName || show.name;
        }

        // Update title
        const title = document.getElementById('showDetailTitle');
        if (title) {
            title.textContent = show.displayName || show.name;
        }

        // Update category
        const category = document.getElementById('showDetailCategory');
        if (category) {
            category.textContent = show.category || 'Teaching';
        }

        // Update episode count
        const episodeCount = document.getElementById('showDetailEpisodeCount');
        if (episodeCount) {
            const count = show.episodeCount || this.generateEpisodeCount();
            episodeCount.textContent = `${count} episodes`;
        }

        // Update description
        const description = document.getElementById('showDetailDescription');
        if (description) {
            description.textContent = show.description || this.generateDescription(show);
        }
    }

    displayEpisodes(show) {
        const episodesGrid = document.getElementById('episodesGrid');
        if (!episodesGrid) return;

        // Clear existing episodes
        episodesGrid.innerHTML = '';

        // Generate episodes for the show
        const episodes = this.generateEpisodes(show);

        episodes.forEach((episode, index) => {
            const episodeCard = this.createEpisodeCard(episode, index);
            episodesGrid.appendChild(episodeCard);
        });
    }

    generateEpisodes(show) {
        const episodeCount = parseInt(show.episodeCount) || 12;
        const episodes = [];

        for (let i = 1; i <= Math.min(episodeCount, 24); i++) { // Limit to 24 episodes for demo
            episodes.push({
                id: i,
                number: i,
                title: this.generateEpisodeTitle(show, i),
                description: this.generateEpisodeDescription(show, i),
                duration: this.generateDuration(),
                thumbnail: show.thumbnail || 'images/logo.png',
                streamUrl: show.streamUrl
            });
        }

        return episodes;
    }

    generateEpisodeTitle(show, episodeNumber) {
        const showName = show.displayName || show.name;
        const category = show.category || 'Teaching';

        const titleTemplates = {
            'Teaching': [
                `${showName} - Episode ${episodeNumber}`,
                `Biblical Foundations - Part ${episodeNumber}`,
                `Scripture Study - Lesson ${episodeNumber}`,
                `Faith Journey - Episode ${episodeNumber}`,
                `Divine Wisdom - Part ${episodeNumber}`
            ],
            'Worship': [
                `Worship Experience ${episodeNumber}`,
                `Songs of Praise - Episode ${episodeNumber}`,
                `Musical Ministry - Part ${episodeNumber}`,
                `Worship & Prayer ${episodeNumber}`,
                `Spiritual Songs - Episode ${episodeNumber}`
            ],
            'Prophecy': [
                `Prophetic Insights - Episode ${episodeNumber}`,
                `End Times Teaching - Part ${episodeNumber}`,
                `Biblical Prophecy ${episodeNumber}`,
                `Future Revealed - Episode ${episodeNumber}`,
                `Signs & Wonders - Part ${episodeNumber}`
            ]
        };

        const templates = titleTemplates[category] || titleTemplates['Teaching'];
        return templates[(episodeNumber - 1) % templates.length];
    }

    generateEpisodeDescription(show, episodeNumber) {
        const category = show.category || 'Teaching';

        const descriptionTemplates = {
            'Teaching': [
                'In this episode, we dive deep into Biblical principles that will strengthen your faith and guide your daily walk with God.',
                'Join us for an inspiring message about living according to God\'s word and finding purpose in His plan.',
                'Discover practical wisdom from Scripture that you can apply to overcome life\'s challenges with faith.',
                'Learn how to grow spiritually and develop a closer relationship with Jesus Christ through prayer and study.',
                'Explore the transformative power of God\'s love and how it can change your life from the inside out.'
            ],
            'Worship': [
                'Experience the presence of God through heartfelt worship and beautiful music that lifts your spirit.',
                'Join us for an inspiring time of praise and worship that will draw you closer to the heart of God.',
                'Let your soul be refreshed through powerful worship songs and meaningful spiritual reflection.',
                'Discover the joy of worshiping God through music, prayer, and spiritual connection.',
                'Experience the peace and joy that comes from true worship and praise to our Lord and Savior.'
            ],
            'Prophecy': [
                'Gain insight into Biblical prophecy and understand God\'s plan for the future of His people.',
                'Explore prophetic revelations and discover what Scripture reveals about the end times.',
                'Learn to discern the signs of the times and prepare your heart for Christ\'s return.',
                'Understand Biblical prophecy and how it applies to current world events and spiritual preparation.',
                'Discover prophetic truths that will strengthen your faith and hope in God\'s eternal plan.'
            ]
        };

        const descriptions = descriptionTemplates[category] || descriptionTemplates['Teaching'];
        return descriptions[(episodeNumber - 1) % descriptions.length];
    }

    generateDuration() {
        // Generate random duration between 25-65 minutes
        const minutes = Math.floor(Math.random() * 40) + 25;
        return `${minutes}:00`;
    }

    generateEpisodeCount() {
        // Generate random episode count between 12-200
        return Math.floor(Math.random() * 188) + 12;
    }

    generateDescription(show) {
        const showName = show.displayName || show.name;
        const category = show.category || 'Teaching';

        const descriptions = {
            'Teaching': `Join ${showName} for inspiring biblical teachings that will strengthen your faith and provide practical guidance for daily Christian living. Each episode offers deep insights into God's word and practical application for modern believers.`,
            'Worship': `Experience the power of worship with ${showName}. Through beautiful music and heartfelt praise, these episodes will draw you closer to God and fill your heart with joy and peace.`,
            'Prophecy': `${showName} brings you prophetic insights and biblical revelation about God's plan for the future. Gain understanding of end-times events and learn how to prepare spiritually for what's to come.`
        };

        return descriptions[category] || descriptions['Teaching'];
    }

    createEpisodeCard(episode, index) {
        const card = document.createElement('div');
        card.className = 'episode-card';
        card.tabIndex = 400 + index;

        card.innerHTML = `
            <div class="episode-thumbnail">
                <img src="${episode.thumbnail}" alt="${episode.title}" loading="lazy">
                <div class="episode-number">${episode.number}</div>
                <div class="episode-duration">${episode.duration}</div>
            </div>
            <div class="episode-info">
                <h3 class="episode-title">${episode.title}</h3>
                <p class="episode-description">${episode.description}</p>
            </div>
        `;

        // Add click handler
        card.addEventListener('click', () => {
            this.playEpisode(episode);
        });

        return card;
    }

    playFirstEpisode() {
        if (this.currentShow) {
            const firstEpisode = {
                id: 1,
                title: this.generateEpisodeTitle(this.currentShow, 1),
                description: this.generateEpisodeDescription(this.currentShow, 1),
                streamUrl: this.currentShow.streamUrl
            };
            this.playEpisode(firstEpisode);
        }
    }

    playEpisode(episode) {
        console.log('Playing episode:', episode);

        const videoData = {
            title: episode.title,
            description: episode.description,
            streamUrl: episode.streamUrl,
            isEpisode: true,
            show: this.currentShow
        };

        this.app.playVideo(videoData);
    }

    goBack() {
        this.app.goBack();
    }

    onActivate() {
        // Set focus when view is activated
        if (this.app.focusManager) {
            const playBtn = document.getElementById('playFirstEpisodeBtn');
            if (playBtn) {
                this.app.focusManager.setFocus(playBtn);
            }
        }
    }

    async updateWithData(appData) {
        // Show detail view doesn't need data updates
    }
}