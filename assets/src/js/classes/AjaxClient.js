/**
 * AjaxClient - Handles all AJAX communication with the WordPress backend
 */
export class AjaxClient {
    constructor(config) {
        this.ajaxUrl = config.ajaxUrl;
        this.nonce = config.nonce;
    }

    /**
     * Make a POST request to the WordPress AJAX endpoint
     */
    async post(action, data = {}) {
        const requestData = {
            action: action,
            nonce: this.nonce,
            ...data
        };

        try {
            const response = await fetch(this.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(requestData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('AJAX request failed:', error);
            throw error;
        }
    }

    /**
     * Load saved options from the backend
     */
    async loadOptions() {
        return this.post('phpcompat_checker_load_options');
    }

    /**
     * Save options to the backend
     */
    async saveOptions(options) {
        return this.post('phpcompat_checker_save_options', {
            report_mode: 'detailed',
            ...options
        });
    }

    /**
     * Get system preflight check results
     */
    async preflightCheck() {
        return this.post('phpcompat_checker_preflight');
    }

    /**
     * Get available scan targets (plugins and themes)
     */
    async getTargets() {
        return this.post('phpcompat_checker_targets');
    }

    /**
     * Get scan progress information
     */
    async getProgress(type, slug, batchSize, skipVendor) {
        return this.post('phpcompat_checker_progress', {
            type,
            slug,
            batch_size: batchSize,
            skip_vendor: skipVendor ? '1' : '0'
        });
    }

    /**
     * Process a scan batch
     */
    async processBatch(scanId, batchNumber) {
        return this.post('phpcompat_checker_process_batch', {
            scan_id: scanId,
            batch_number: batchNumber
        });
    }

    /**
     * Stop an ongoing scan
     */
    async stopScan() {
        return this.post('phpcompat_checker_stop_scan');
    }
}
