/**
 * SystemChecker - Handles system preflight checks and validation
 */
import jQuery from 'jquery';

export class SystemChecker {
    constructor(ajaxClient) {
        this.ajaxClient = ajaxClient;
        this.isSystemReady = false;
    }

    /**
     * Initialize system checker
     */
    async init() {
        await this.runPreflightCheck();
    }

    /**
     * Run system preflight check
     */
    async runPreflightCheck() {
        try {
            const $sys = jQuery('#phpcompat-system-check');
            const $button = jQuery('#phpcompat-start-scan');
            const $status = jQuery('#phpcompat-scan-status');

            const response = await this.ajaxClient.preflightCheck();
            const ok = response && response.success;
            const data = response && response.data ? response.data : {};

            const lines = [];
            lines.push(`${data.execEnabled ? '✅' : '❌'} exec() ${data.execEnabled ? 'enabled' : 'disabled'}`);
            lines.push(`${data.phpBinaryExists ? '✅' : '❌'} PHP binary: ${data.phpBinary || '(unknown)'}`);
            lines.push(`${data.phpcsExists ? '✅' : '❌'} phpcs: ${data.phpcsPath || '(unknown)'}`);

            if (data.phpcsVersionOutput) {
                lines.push(`Version: ${data.phpcsVersionOutput}`);
            }

            if (data.messages && data.messages.length) {
                lines.push(...data.messages);
            }

            $sys.text(lines.join('\n'));

            if (ok) {
                $button.prop('disabled', false);
                this.isSystemReady = true;
            } else {
                $button.prop('disabled', true);
                $status.text('System check failed');
                this.isSystemReady = false;
            }
        } catch (error) {
            console.error('System check failed:', error);
            jQuery('#phpcompat-system-check').text('System check failed to run');
            jQuery('#phpcompat-start-scan').prop('disabled', true);
            this.isSystemReady = false;
        }
    }

    /**
     * Check if system is ready for scanning
     */
    isReady() {
        return this.isSystemReady;
    }

    /**
     * Get system status message
     */
    getStatusMessage() {
        if (this.isSystemReady) {
            return 'System ready for scanning';
        } else {
            return 'System check failed - scanning disabled';
        }
    }
}
