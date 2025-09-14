// Simple Focus Manager for Tizen TV - Direct key handling
class SimpleFocusManager {
    constructor() {
        this.elements = [];
        this.currentIndex = 0;
        this.isActive = true;

        // Create status indicator
        this.createStatusIndicator();

        console.log('SimpleFocusManager created');
    }

    createStatusIndicator() {
        // Production version - no visual debug indicator
        this.indicator = null;
    }

    updateStatus(message) {
        if (this.indicator) {
            this.indicator.innerHTML = message;
            console.log('Focus Status:', message);
        }
    }

    init() {
        console.log('🎯 SimpleFocusManager.init() started');
        this.updateStatus('Initializing...');

        // Start listening for keys immediately
        this.setupKeyListener();

        // Set initial focus immediately and repeatedly until successful
        this.setInitialFocusAggressively();

        // Also refresh elements periodically in case DOM changes
        this.startPeriodicRefresh();

        console.log('✅ SimpleFocusManager initialized - setting focus aggressively');
    }

    startPeriodicRefresh() {
        // Refresh focusable elements every 3 seconds
        setInterval(() => {
            const oldCount = this.elements.length;
            this.collectElements();
            const newCount = this.elements.length;

            if (oldCount !== newCount) {
                console.log(`🔄 Element count changed from ${oldCount} to ${newCount}`);
                this.updateStatus(`Elements: ${newCount} (was ${oldCount})`);
            }
        }, 3000);
    }

    setInitialFocusAggressively() {
        // Try multiple times with different delays to ensure focus is set
        const attempts = [100, 500, 1000, 2000, 3000];

        attempts.forEach((delay, index) => {
            setTimeout(() => {
                this.collectElements();

                if (this.elements.length > 0) {
                    // Find the first navigation button
                    let initialElement = this.elements.find(el => el.classList.contains('nav-button'));

                    // If no nav button, use first element
                    if (!initialElement) {
                        initialElement = this.elements[0];
                    }

                    const initialIndex = this.elements.indexOf(initialElement);
                    this.setFocus(initialIndex);

                    this.updateStatus(`Attempt ${index + 1}: Focus set to element ${initialIndex}`);
                    console.log(`Focus attempt ${index + 1} at ${delay}ms - set to index ${initialIndex}`);
                } else {
                    this.updateStatus(`Attempt ${index + 1}: No elements found`);
                    console.warn(`Focus attempt ${index + 1}: No focusable elements found`);
                }
            }, delay);
        });
    }

    collectElements() {
        // Get all buttons and focusable elements
        const selectors = [
            '.nav-button',
            '.video-card',
            '.live-stream-card',
            '.category-card',
            '.qr-card',
            '[tabindex]:not([tabindex="-1"])'
        ];

        this.elements = [];

        selectors.forEach(selector => {
            const found = document.querySelectorAll(selector);
            found.forEach(el => {
                if (this.isVisible(el) && !this.elements.includes(el)) {
                    this.elements.push(el);
                }
            });
        });

        console.log('Collected elements:', this.elements.map(el => el.className || el.tagName));
    }

    isVisible(element) {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);

        return rect.width > 0 &&
               rect.height > 0 &&
               style.display !== 'none' &&
               style.visibility !== 'hidden';
    }

    setupKeyListener() {
        // Remove any existing listeners
        document.removeEventListener('keydown', this.handleKey);

        // Add new listener
        this.handleKey = this.handleKey.bind(this);
        document.addEventListener('keydown', this.handleKey, true);

        console.log('Key listener setup complete');
        this.updateStatus('Listening for keys...');
    }

    handleKey(event) {
        console.log('🔑 Key pressed:', event.keyCode, event.key, 'Elements:', this.elements.length, 'Current:', this.currentIndex);
        this.updateStatus(`Key: ${event.keyCode} (${event.key}) | Elements: ${this.elements.length} | Index: ${this.currentIndex}`);

        // First collect elements if we don't have any
        if (this.elements.length === 0) {
            console.log('🔍 No elements found, collecting...');
            this.collectElements();
        }

        let handled = false;

        switch(event.keyCode) {
            case 37: // Left
                this.navigate(-1);
                handled = true;
                break;

            case 39: // Right
                this.navigate(1);
                handled = true;
                break;

            case 38: // Up
                this.navigate(-1);
                handled = true;
                break;

            case 40: // Down
                this.navigate(1);
                handled = true;
                break;

            case 13: // Enter
            case 32: // Space
                this.selectCurrent();
                handled = true;
                break;

            case 10009: // Tizen Back
            case 8: // Backspace
            case 27: // Escape
                this.goBack();
                handled = true;
                break;
        }

        if (handled) {
            event.preventDefault();
            event.stopPropagation();
            this.updateStatus(`Handled key: ${event.keyCode}`);
        }
    }

    navigate(direction) {
        if (this.elements.length === 0) {
            this.updateStatus('No elements to navigate');
            return;
        }

        // Simple linear navigation
        const oldIndex = this.currentIndex;

        if (direction > 0) {
            this.currentIndex = (this.currentIndex + 1) % this.elements.length;
        } else {
            this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.elements.length - 1;
        }

        this.setFocus(this.currentIndex);
        this.updateStatus(`Navigate: ${oldIndex} -> ${this.currentIndex}`);
    }

    setFocus(index) {
        if (index < 0 || index >= this.elements.length) {
            this.updateStatus(`Invalid index: ${index}`);
            return;
        }

        // Remove previous focus from all elements
        document.querySelectorAll('.tv-focused').forEach(el => {
            el.classList.remove('tv-focused');
            el.style.border = '';
            el.style.transform = '';
            el.style.boxShadow = '';
            el.style.outline = '';
        });

        // Set new focus
        this.currentIndex = index;
        const element = this.elements[index];

        element.classList.add('tv-focused');

        // Make it VERY visible
        element.style.border = '6px solid #ff0000 !important';
        element.style.outline = '4px solid #ffffff !important';
        element.style.outlineOffset = '2px !important';
        element.style.transform = 'scale(1.15) !important';
        element.style.boxShadow = `
            0 0 30px rgba(255, 0, 0, 1),
            inset 0 0 20px rgba(255, 255, 255, 0.5) !important
        `;
        element.style.transition = 'all 0.2s ease !important';
        element.style.zIndex = '9999 !important';
        element.style.position = 'relative !important';

        // Add a pulsing background
        element.style.backgroundColor = 'rgba(255, 0, 0, 0.3) !important';

        // Scroll into view aggressively
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });

        // Also use browser focus
        element.focus();

        const elementInfo = element.className || element.tagName;
        this.updateStatus(`FOCUSED: ${index} - ${elementInfo.substring(0, 30)}`);

        console.log('✅ FOCUS SET TO:', index, element);
        console.log('Element rect:', element.getBoundingClientRect());
    }

    selectCurrent() {
        if (this.currentIndex >= 0 && this.currentIndex < this.elements.length) {
            const element = this.elements[this.currentIndex];
            this.updateStatus(`Select: ${element.className || element.tagName}`);

            // Trigger click
            element.click();

            console.log('Selected element:', element);
        }
    }

    goBack() {
        this.updateStatus('Back button pressed');

        // Try to go back in app
        if (window.app && window.app.goBack) {
            window.app.goBack();
        } else {
            console.log('Back action - no handler');
        }
    }

    refresh() {
        console.log('Refreshing focus manager...');
        this.collectElements();

        if (this.elements.length === 0) {
            this.updateStatus('Refresh: No elements found');
            return;
        }

        // If current index is invalid, reset to first nav button or first element
        if (this.currentIndex >= this.elements.length || this.currentIndex < 0) {
            let firstNav = this.elements.find(el => el.classList.contains('nav-button'));
            this.currentIndex = firstNav ? this.elements.indexOf(firstNav) : 0;
        }

        this.setFocus(this.currentIndex);
        this.updateStatus(`Refreshed: ${this.elements.length} elements, focus at ${this.currentIndex}`);
        console.log('Focus refreshed to index:', this.currentIndex);
    }

    // Method to be called when views change
    onViewChange() {
        console.log('View changed - refreshing focus');
        setTimeout(() => this.refresh(), 100);
        setTimeout(() => this.refresh(), 500);
    }
}