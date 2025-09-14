// TV Focus Manager - tvOS-style navigation
class TVFocusManager {
    constructor() {
        this.focusedElement = null;
        this.navigationItems = [];
        this.currentView = 'home';
        this.isInitialized = false;

        console.log('TVFocusManager created');
    }

    init() {
        console.log('Initializing TV Focus Manager...');

        // Setup key event listener
        this.setupKeyListener();

        // Initialize navigation items
        this.initializeNavigation();

        // Set initial focus to HOME
        this.setInitialFocus();

        this.isInitialized = true;
        console.log('TV Focus Manager initialized');
    }

    setupKeyListener() {
        // Remove existing listener
        document.removeEventListener('keydown', this.handleKeyDown);

        // Add new listener
        this.handleKeyDown = this.handleKeyDown.bind(this);
        document.addEventListener('keydown', this.handleKeyDown, true);

        console.log('Key listener setup complete');
    }

    initializeNavigation() {
        // Get all navigation buttons
        this.navigationItems = Array.from(document.querySelectorAll('.nav-button'));
        console.log('Found navigation items:', this.navigationItems.length);

        // Setup click handlers for navigation
        this.navigationItems.forEach((item, index) => {
            item.setAttribute('data-nav-index', index);
            item.addEventListener('click', () => {
                const viewName = item.getAttribute('data-view');
                if (viewName) {
                    this.navigateToView(viewName, item);
                }
            });
        });
    }

    setInitialFocus() {
        // Always start with HOME navigation button focused
        const homeButton = this.navigationItems.find(item =>
            item.getAttribute('data-view') === 'home'
        );

        if (homeButton) {
            this.setFocus(homeButton);
            console.log('Initial focus set to HOME button');
        } else {
            console.warn('HOME button not found, using first navigation item');
            if (this.navigationItems.length > 0) {
                this.setFocus(this.navigationItems[0]);
            }
        }
    }

    handleKeyDown(event) {
        if (!this.isInitialized) return;

        let handled = false;

        switch (event.keyCode) {
            case 37: // Left Arrow
                this.navigateLeft();
                handled = true;
                break;

            case 39: // Right Arrow
                this.navigateRight();
                handled = true;
                break;

            case 38: // Up Arrow
                this.navigateUp();
                handled = true;
                break;

            case 40: // Down Arrow
                this.navigateDown();
                handled = true;
                break;

            case 13: // Enter/OK
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
        }
    }

    navigateLeft() {
        // In navigation bar, move left between nav items
        if (this.isInNavigationBar()) {
            const currentIndex = this.getCurrentNavIndex();
            const newIndex = currentIndex > 0 ? currentIndex - 1 : this.navigationItems.length - 1;
            this.setFocus(this.navigationItems[newIndex]);
        }
    }

    navigateRight() {
        // In navigation bar, move right between nav items
        if (this.isInNavigationBar()) {
            const currentIndex = this.getCurrentNavIndex();
            const newIndex = currentIndex < this.navigationItems.length - 1 ? currentIndex + 1 : 0;
            this.setFocus(this.navigationItems[newIndex]);
        }
    }

    navigateUp() {
        // Move to navigation bar if we're in content
        if (!this.isInNavigationBar()) {
            // Find the nav button that matches current view
            const currentViewButton = this.navigationItems.find(item =>
                item.getAttribute('data-view') === this.currentView
            );
            if (currentViewButton) {
                this.setFocus(currentViewButton);
            } else {
                this.setFocus(this.navigationItems[0]);
            }
        }
    }

    navigateDown() {
        // Move from navigation bar to content
        if (this.isInNavigationBar()) {
            this.focusFirstContentItem();
        }
    }

    selectCurrent() {
        if (this.focusedElement) {
            console.log('Selecting:', this.focusedElement);
            this.focusedElement.click();
        }
    }

    goBack() {
        // Simple back navigation - always go to home
        this.navigateToView('home');
    }

    isInNavigationBar() {
        return this.focusedElement && this.navigationItems.includes(this.focusedElement);
    }

    getCurrentNavIndex() {
        if (!this.focusedElement || !this.isInNavigationBar()) return 0;
        return parseInt(this.focusedElement.getAttribute('data-nav-index')) || 0;
    }

    focusFirstContentItem() {
        // Try to focus first content item in current view
        const currentViewElement = document.getElementById(this.currentView + 'View');
        if (currentViewElement) {
            const contentItems = currentViewElement.querySelectorAll(
                '.smart-cta-button, .video-card, .live-stream-card, .category-card, .qr-card, [tabindex]:not([tabindex="-1"])'
            );

            // Filter out navigation buttons from content items
            const validContentItems = Array.from(contentItems).filter(item =>
                !item.classList.contains('nav-button')
            );

            if (validContentItems.length > 0) {
                this.setFocus(validContentItems[0]);
                return;
            }
        }

        // If no content items, stay on navigation
        console.log('No content items found, staying on navigation');
    }

    setFocus(element) {
        if (!element) return;

        // Remove focus from previous element
        if (this.focusedElement) {
            this.focusedElement.classList.remove('tv-focused');
            this.focusedElement.style.transform = '';
            this.focusedElement.style.boxShadow = '';
            this.focusedElement.style.border = '';
        }

        // Set new focus
        this.focusedElement = element;
        element.classList.add('tv-focused');

        // Apply tvOS-style focus styling
        element.style.transform = 'scale(1.1)';
        element.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.8)';
        element.style.border = '3px solid rgba(255, 255, 255, 0.9)';
        element.style.transition = 'all 0.2s ease';

        // Scroll into view smoothly
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });

        // Also set browser focus
        element.focus();

        console.log('Focus set to:', element.className || element.tagName);
    }

    navigateToView(viewName, navButton = null) {
        console.log('Navigating to view:', viewName);

        this.currentView = viewName;

        // Update view visibility
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        const targetView = document.getElementById(viewName + 'View');
        if (targetView) {
            targetView.classList.add('active');
        }

        // Update navigation button states
        this.navigationItems.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-view') === viewName) {
                button.classList.add('active');
            }
        });

        // If we're not already focused on the nav button, focus it
        if (navButton && this.focusedElement !== navButton) {
            this.setFocus(navButton);
        }
    }

    // Called when views change
    onViewChange() {
        console.log('View changed, maintaining focus');
        // In tvOS style, we maintain focus on navigation when switching views
        if (!this.isInNavigationBar()) {
            const currentViewButton = this.navigationItems.find(item =>
                item.getAttribute('data-view') === this.currentView
            );
            if (currentViewButton) {
                this.setFocus(currentViewButton);
            }
        }
    }

    refresh() {
        console.log('Refreshing TV Focus Manager');
        this.initializeNavigation();

        // Maintain focus on current view's nav button
        const currentViewButton = this.navigationItems.find(item =>
            item.getAttribute('data-view') === this.currentView
        );
        if (currentViewButton) {
            this.setFocus(currentViewButton);
        } else if (this.navigationItems.length > 0) {
            this.setFocus(this.navigationItems[0]);
        }
    }
}

// Make TVFocusManager globally available
window.TVFocusManager = TVFocusManager;