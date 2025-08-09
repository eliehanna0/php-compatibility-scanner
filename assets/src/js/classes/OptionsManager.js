/**
 * OptionsManager - Handles plugin options loading, saving, and management
 */
import jQuery from 'jquery';

export class OptionsManager {
    constructor(ajaxClient) {
        this.ajaxClient = ajaxClient;
        this.options = {
            batch_size: '50',
            php_version: '8.3',
            skip_vendor: true
        };
    }

    /**
     * Initialize options manager
     */
    async init() {
        await this.loadOptions();
        this.bindEvents();
    }

    /**
     * Load saved options from the backend
     */
    async loadOptions() {
        try {
            const response = await this.ajaxClient.loadOptions();
            if (response && response.success && response.data) {
                this.options = {
                    batch_size: response.data.batch_size || '50',
                    php_version: response.data.php_version || '8.3',
                    skip_vendor: response.data.skip_vendor !== '0'
                };
                this.updateUI();
            }
        } catch (error) {
            console.error('Failed to load options:', error);
        }
    }

    /**
     * Save options to the backend
     */
    async saveOptions() {
        try {
            const options = {
                batch_size: this.options.batch_size,
                php_version: this.options.php_version,
                skip_vendor: this.options.skip_vendor ? '1' : '0'
            };

            await this.ajaxClient.saveOptions(options);
        } catch (error) {
            console.error('Failed to save options:', error);
        }
    }

    /**
     * Update the UI to reflect current options
     */
    updateUI() {
        const $batchSize = jQuery('#batch-size');
        const $phpVersion = jQuery('#php-version');
        const $skipVendor = jQuery('#skip-vendor');

        if ($batchSize.length) $batchSize.val(this.options.batch_size);
        if ($phpVersion.length) $phpVersion.val(this.options.php_version);
        if ($skipVendor.length) $skipVendor.prop('checked', this.options.skip_vendor);
    }

    /**
     * Bind event handlers for option changes
     */
    bindEvents() {
        jQuery('#batch-size').on('change', (e) => {
            this.options.batch_size = e.target.value;
            this.saveOptions();
        });

        jQuery('#php-version').on('change', (e) => {
            this.options.php_version = e.target.value;
            this.saveOptions();
        });

        jQuery('#skip-vendor').on('change', (e) => {
            this.options.skip_vendor = e.target.checked;
            this.saveOptions();
        });
    }

    /**
     * Get current options
     */
    getOptions() {
        return { ...this.options };
    }

    /**
     * Get batch size
     */
    getBatchSize() {
        return parseInt(this.options.batch_size, 10) || 50;
    }

    /**
     * Get PHP version
     */
    getPhpVersion() {
        return this.options.php_version;
    }

    /**
     * Get skip vendor setting
     */
    getSkipVendor() {
        return this.options.skip_vendor;
    }
}
