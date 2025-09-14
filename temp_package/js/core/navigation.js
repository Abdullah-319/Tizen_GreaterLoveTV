// js/core/navigation.js - Navigation Management
class NavigationManager {
    constructor(app) {
        this.app = app;
        this.viewHistory = [];
        this.currentView = null;
    }

    navigateTo(viewName, addToHistory = true) {
        if (addToHistory && this.currentView) {
            this.viewHistory.push(this.currentView);
        }
        
        this.currentView = viewName;
        this.app.showView(viewName);
    }

    goBack() {
        if (this.viewHistory.length > 0) {
            const previousView = this.viewHistory.pop();
            this.currentView = previousView;
            this.app.showView(previousView);
            return true;
        }
        return false;
    }

    canGoBack() {
        return this.viewHistory.length > 0;
    }

    getCurrentView() {
        return this.currentView;
    }

    clearHistory() {
        this.viewHistory = [];
    }
}