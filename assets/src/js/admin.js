/**
 * PHP Compatibility Checker - Main Entry Point
 * 
 * This file initializes the application using the new class-based architecture.
 * It replaces the old monolithic admin.js file with a clean, modular approach.
 */

import jQuery from 'jquery';

/* global PHPCompatChecker */

// Main application instance
let app = null;

// Initialize when DOM is ready
jQuery(function ($) {
    // Check if we have the required configuration
    const config = (typeof window !== 'undefined' && window.PHPCompatChecker) ? window.PHPCompatChecker : null;

    if (!config || !config.ajaxUrl || !config.nonce) {
        console.error('PHP Compatibility Checker: Missing required configuration');
        return;
    }

    // Initialize the application
    initializeApp(config);
});

/**
 * Initialize the main application
 */
async function initializeApp(config) {
    try {
        // Import and create the main App class
        const { App } = await import('./classes/App.js');

        // Create and initialize the application
        app = new App(config);
        await app.init();

        // Make app available globally for debugging (optional)
        if (typeof window !== 'undefined') {
            window.PHPCompatCheckerApp = app;
        }

        console.log('PHP Compatibility Checker application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize PHP Compatibility Checker application:', error);
        showInitializationError(error);
    }
}

/**
 * Show initialization error in the UI
 */
function showInitializationError(error) {
    const $status = jQuery('#phpcompat-scan-status');
    const $button = jQuery('#phpcompat-start-scan');

    if ($status.length) {
        $status.html(`❌ Failed to initialize: ${error.message}`);
    }

    if ($button.length) {
        $button.prop('disabled', true);
    }
}

/**
 * Utility function to get the app instance (for debugging)
 */
function getApp() {
    return app;
}

/**
 * Utility function to check if app is ready
 */
function isAppReady() {
    return app && app.isReady();
}

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        getApp,
        isAppReady
    };
}
