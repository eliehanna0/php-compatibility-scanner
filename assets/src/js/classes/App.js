/**
 * App - Main application class that orchestrates all components
 */
import jQuery from 'jquery';

export class App {
    constructor(config) {
        this.config = config;
        this.ajaxClient = null;
        this.optionsManager = null;
        this.targetsManager = null;
        this.systemChecker = null;
        this.scanManager = null;
        this.uiManager = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Validate configuration
            if (!this.validateConfig()) {
                throw new Error('Invalid configuration');
            }

            // Initialize components
            await this.initializeComponents();

            // Mark as initialized
            this.isInitialized = true;

            console.log('PHP Compatibility Checker initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showInitializationError(error);
        }
    }

    /**
     * Validate configuration
     */
    validateConfig() {
        return this.config &&
            this.config.ajaxUrl &&
            this.config.nonce;
    }

    /**
     * Initialize all application components
     */
    async initializeComponents() {
        // Create AjaxClient first
        this.ajaxClient = new (await import('./AjaxClient.js')).AjaxClient(this.config);

        // Create other managers
        this.optionsManager = new (await import('./OptionsManager.js')).OptionsManager(this.ajaxClient);
        this.targetsManager = new (await import('./TargetsManager.js')).TargetsManager(this.ajaxClient);
        this.systemChecker = new (await import('./SystemChecker.js')).SystemChecker(this.ajaxClient);
        this.scanManager = new (await import('./ScanManager.js')).ScanManager(
            this.ajaxClient,
            this.optionsManager,
            this.targetsManager
        );
        this.uiManager = new (await import('./UIManager.js')).UIManager();

        // Initialize components in order
        await this.optionsManager.init();
        await this.targetsManager.init();
        await this.systemChecker.init();
        this.scanManager.init();
    }

    /**
     * Show initialization error
     */
    showInitializationError(error) {
        const errorMessage = `Failed to initialize PHP Compatibility Checker: ${error.message}`;
        console.error(errorMessage);

        // Show error in UI if possible
        const $status = jQuery('#phpcompat-scan-status');
        if ($status.length) {
            $status.html(`❌ ${errorMessage}`);
        }

        // Disable scan button
        const $button = jQuery('#phpcompat-start-scan');
        if ($button.length) {
            $button.prop('disabled', true);
        }
    }

    /**
     * Get AjaxClient instance
     */
    getAjaxClient() {
        return this.ajaxClient;
    }

    /**
     * Get OptionsManager instance
     */
    getOptionsManager() {
        return this.optionsManager;
    }

    /**
     * Get TargetsManager instance
     */
    getTargetsManager() {
        return this.targetsManager;
    }

    /**
     * Get SystemChecker instance
     */
    getSystemChecker() {
        return this.systemChecker;
    }

    /**
     * Get ScanManager instance
     */
    getScanManager() {
        return this.scanManager;
    }

    /**
     * Get UIManager instance
     */
    getUIManager() {
        return this.uiManager;
    }

    /**
     * Check if application is initialized
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Get application status
     */
    getStatus() {
        if (!this.isInitialized) {
            return 'Not initialized';
        }

        const systemReady = this.systemChecker ? this.systemChecker.isReady() : false;
        const scanning = this.scanManager ? this.scanManager.isCurrentlyScanning() : false;

        if (scanning) {
            return 'Scanning in progress';
        } else if (systemReady) {
            return 'Ready for scanning';
        } else {
            return 'System not ready';
        }
    }

    /**
     * Refresh application state
     */
    async refresh() {
        try {
            if (this.systemChecker) {
                await this.systemChecker.runPreflightCheck();
            }

            if (this.targetsManager) {
                await this.targetsManager.loadTargets();
            }
        } catch (error) {
            console.error('Failed to refresh application:', error);
        }
    }

    /**
     * Reset application state
     */
    reset() {
        try {
            if (this.uiManager) {
                this.uiManager.clearScanResults();
            }

            if (this.targetsManager) {
                this.targetsManager.uncheckAllTargets();
            }
        } catch (error) {
            console.error('Failed to reset application:', error);
        }
    }

    /**
     * Destroy application and cleanup
     */
    destroy() {
        try {
            // Stop any ongoing scans
            if (this.scanManager && this.scanManager.isCurrentlyScanning()) {
                this.scanManager.stopScan();
            }

            // Clear any timers or intervals
            // Note: In this implementation, we don't have any timers to clear

            // Mark as not initialized
            this.isInitialized = false;

            console.log('PHP Compatibility Checker destroyed');
        } catch (error) {
            console.error('Error during application destruction:', error);
        }
    }
}
