// js/core/focus-manager.js - Focus Management for TV Navigation
class FocusManager {
    constructor() {
        this.currentFocusedElement = null;
        this.focusableElements = [];
        this.debugMode = true; // Enable debug for TV troubleshooting
        this.currentIndex = 0;
    }

    async init() {
        console.log('FocusManager initializing...');
        this.setupFocusStyles();
        this.updateFocusableElements();

        // Set initial focus after a delay to ensure DOM is ready
        setTimeout(() => {
            this.setInitialFocus();
        }, 2000);

        console.log('FocusManager initialized with', this.focusableElements.length, 'elements');
    }

    setInitialFocus() {
        console.log('Setting initial focus...');

        // Try navigation button first
        let firstElement = document.querySelector('.nav-button.active');
        if (!firstElement) {
            firstElement = document.querySelector('.nav-button');
        }

        // If no nav button, try first tabindex element
        if (!firstElement) {
            firstElement = document.querySelector('[tabindex="1"]');
        }

        // Fallback to any tabindex element
        if (!firstElement) {
            firstElement = document.querySelector('[tabindex]:not([tabindex="-1"])');
        }

        if (firstElement) {
            console.log('Setting initial focus to:', firstElement.className, firstElement.tagName);
            this.setFocus(firstElement);
        } else {
            console.error('No focusable element found for initial focus');
        }
    }

    updateFocusableElements() {
        // Get all focusable elements including navigation
        this.focusableElements = Array.from(document.querySelectorAll(
            '.nav-button, [tabindex]:not([tabindex="-1"]):not([disabled])'
        )).filter(el => {
            const isVisible = this.isElementVisible(el);
            const isInActiveView = this.isInActiveViewOrNav(el);
            return isVisible && isInActiveView;
        });

        console.log('Updated focusable elements:', this.focusableElements.length);
        this.focusableElements.forEach((el, i) => {
            console.log(`  ${i}: ${el.className || el.tagName} - tabindex: ${el.tabIndex}`);
        });
    }

    isInActiveViewOrNav(element) {
        // Navigation elements are always available
        if (element.classList.contains('nav-button')) return true;

        // Check if element is in active view
        const activeView = document.querySelector('.view.active');
        if (!activeView) return true;

        return activeView.contains(element);
    }

    setupFocusStyles() {
        // Add focus styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .focused {
                transform: scale(1.1) !important;
                box-shadow: 0 0 30px rgba(255, 255, 255, 1),
                           0 0 60px rgba(0, 122, 255, 0.8) !important;
                border: 4px solid #FFFFFF !important;
                transition: all 0.3s ease !important;
                z-index: 1000 !important;
                position: relative !important;
                outline: 2px solid #007AFF !important;
                outline-offset: 4px !important;
            }

            .focused::before {
                content: '◀ FOCUSED ▶';
                position: absolute;
                top: -40px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 255, 255, 0.9);
                color: #000;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
                font-weight: bold;
                z-index: 1001;
                pointer-events: none;
                animation: focusPulse 1.5s infinite;
            }

            @keyframes focusPulse {
                0%, 100% { opacity: 0.8; transform: translateX(-50%) scale(1); }
                50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
            }

            /* Enhanced navigation button focus */
            .nav-button.focused {
                background: rgba(255, 255, 255, 0.3) !important;
                color: #000 !important;
            }

            /* Enhanced card focus */
            .video-card.focused,
            .live-stream-card.focused,
            .category-card.focused {
                transform: scale(1.15) !important;
            }
        `;
        document.head.appendChild(style);
        console.log('Focus styles added');
    }

    setFocus(element) {
        if (!element) {
            console.error('Attempted to set focus to null element');
            return;
        }

        console.log('Setting focus to:', element.className || element.tagName, 'tabIndex:', element.tabIndex);

        // Remove focus from current element
        if (this.currentFocusedElement) {
            this.currentFocusedElement.classList.remove('focused');
            this.currentFocusedElement.blur();
            console.log('Removed focus from:', this.currentFocusedElement.className || this.currentFocusedElement.tagName);
        }

        // Set focus on new element
        this.currentFocusedElement = element;
        element.classList.add('focused');

        // Try both focus methods
        try {
            element.focus();
        } catch (e) {
            console.warn('Element focus failed:', e);
        }

        // Update index for linear navigation
        this.currentIndex = this.focusableElements.indexOf(element);

        // Scroll into view if needed
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });

        console.log('✅ Focus successfully set to:', element.className || element.tagName);
    }

    navigateUp() {
        this.navigate('up');
    }

    navigateDown() {
        this.navigate('down');
    }

    navigateLeft() {
        this.navigate('left');
    }

    navigateRight() {
        this.navigate('right');
    }

    navigate(direction) {
        console.log('Navigate:', direction);
        this.updateFocusableElements();

        if (this.focusableElements.length === 0) {
            console.error('No focusable elements available');
            return;
        }

        if (!this.currentFocusedElement) {
            // No current focus, set to first element
            this.currentIndex = 0;
            this.setFocus(this.focusableElements[0]);
            return;
        }

        // Find current element index
        this.currentIndex = this.focusableElements.indexOf(this.currentFocusedElement);
        if (this.currentIndex === -1) {
            console.warn('Current focused element not in list, resetting');
            this.currentIndex = 0;
            this.setFocus(this.focusableElements[0]);
            return;
        }

        console.log('Current index:', this.currentIndex, 'of', this.focusableElements.length);

        // Try spatial navigation first
        const spatialCandidate = this.findSpatialCandidate(direction);
        if (spatialCandidate) {
            console.log('Using spatial navigation');
            this.setFocus(spatialCandidate);
            return;
        }

        // Fallback to simple linear navigation
        console.log('Using fallback linear navigation');
        this.navigateLinear(direction);
    }

    findSpatialCandidate(direction) {
        if (!this.currentFocusedElement) return null;

        const currentRect = this.currentFocusedElement.getBoundingClientRect();
        let bestCandidate = null;
        let bestDistance = Infinity;

        for (const element of this.focusableElements) {
            if (element === this.currentFocusedElement) continue;

            const rect = element.getBoundingClientRect();

            if (this.isInDirection(currentRect, rect, direction)) {
                const distance = this.calculateDistance(currentRect, rect, direction);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestCandidate = element;
                }
            }
        }

        return bestCandidate;
    }

    navigateLinear(direction) {
        let newIndex = this.currentIndex;

        switch (direction) {
            case 'up':
            case 'left':
                newIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.focusableElements.length - 1;
                break;
            case 'down':
            case 'right':
                newIndex = this.currentIndex < this.focusableElements.length - 1 ? this.currentIndex + 1 : 0;
                break;
        }

        console.log('Linear navigation: moving from index', this.currentIndex, 'to', newIndex);
        this.currentIndex = newIndex;
        this.setFocus(this.focusableElements[newIndex]);
    }

    isInDirection(fromRect, toRect, direction) {
        const threshold = 10; // Pixels of overlap allowed
        
        switch (direction) {
            case 'up':
                return toRect.bottom <= fromRect.top + threshold;
            case 'down':
                return toRect.top >= fromRect.bottom - threshold;
            case 'left':
                return toRect.right <= fromRect.left + threshold;
            case 'right':
                return toRect.left >= fromRect.right - threshold;
            default:
                return false;
        }
    }

    calculateDistance(fromRect, toRect, direction) {
        const fromCenter = {
            x: fromRect.left + fromRect.width / 2,
            y: fromRect.top + fromRect.height / 2
        };
        const toCenter = {
            x: toRect.left + toRect.width / 2,
            y: toRect.top + toRect.height / 2
        };

        // Primary distance in the direction of navigation
        let primaryDistance;
        switch (direction) {
            case 'up':
                primaryDistance = fromCenter.y - toCenter.y;
                break;
            case 'down':
                primaryDistance = toCenter.y - fromCenter.y;
                break;
            case 'left':
                primaryDistance = fromCenter.x - toCenter.x;
                break;
            case 'right':
                primaryDistance = toCenter.x - fromCenter.x;
                break;
            default:
                primaryDistance = 0;
        }

        // Secondary distance (perpendicular to primary direction)
        let secondaryDistance;
        switch (direction) {
            case 'up':
            case 'down':
                secondaryDistance = Math.abs(fromCenter.x - toCenter.x);
                break;
            case 'left':
            case 'right':
                secondaryDistance = Math.abs(fromCenter.y - toCenter.y);
                break;
            default:
                secondaryDistance = 0;
        }

        // Combine distances with primary being more important
        return primaryDistance + (secondaryDistance * 0.3);
    }

    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        
        return rect.width > 0 && 
               rect.height > 0 && 
               style.visibility !== 'hidden' && 
               style.display !== 'none' &&
               element.offsetParent !== null;
    }

    selectCurrentElement() {
        if (this.currentFocusedElement) {
            this.currentFocusedElement.click();
        }
    }

    getCurrentFocusedElement() {
        return this.currentFocusedElement;
    }
}