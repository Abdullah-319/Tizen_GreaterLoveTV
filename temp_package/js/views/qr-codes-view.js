// js/views/qr-codes-view.js - QR Codes View Component
class QRCodesView {
    constructor(app) {
        this.app = app;
        this.element = null;
        this.cards = [];
    }

    async init() {
        this.element = document.getElementById('infoView');
        if (this.element) {
            this.cards = Array.from(this.element.querySelectorAll('.qr-card'));
            this.setupEventListeners();
            console.log('QRCodesView initialized');
        } else {
            console.warn('infoView element not found');
        }
    }

    setupEventListeners() {
        this.cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                this.handleQRCardClick(index);
            });
        });
    }

    handleQRCardClick(index) {
        const actions = [
            'Download Mobile App',
            'Donate to Ministry',
            'Submit Prayer Request',
            'Share Your Story'
        ];
        
        const action = actions[index] || 'Unknown Action';
        this.app.showToast(`${action} - Feature coming soon!`, 'info');
    }

    async updateWithData(appData) {
        // QR codes view doesn't need dynamic data updates
    }

    onActivate() {
        if (this.app.focusManager) {
            const firstFocusable = this.element.querySelector('[tabindex]');
            if (firstFocusable) {
                this.app.focusManager.setFocus(firstFocusable);
            }
        }
    }
}