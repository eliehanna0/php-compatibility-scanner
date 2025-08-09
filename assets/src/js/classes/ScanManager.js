/**
 * ScanManager - Handles the scanning process, batch processing, and scan coordination
 */
import jQuery from 'jquery';

export class ScanManager {
    constructor(ajaxClient, optionsManager, targetsManager) {
        this.ajaxClient = ajaxClient;
        this.optionsManager = optionsManager;
        this.targetsManager = targetsManager;
        this.isScanning = false;
        this.currentScanId = null;
    }

    /**
     * Initialize scan manager
     */
    init() {
        this.bindEvents();
    }

    /**
     * Bind event handlers for scan controls
     */
    bindEvents() {
        jQuery('#phpcompat-start-scan').on('click', () => {
            this.startScan();
        });

        jQuery('#phpcompat-stop-scan').on('click', () => {
            this.stopScan();
        });
    }

    /**
     * Start the scanning process
     */
    async startScan() {
        if (this.isScanning) {
            return;
        }

        const $button = jQuery('#phpcompat-start-scan');
        const $stopButton = jQuery('#phpcompat-stop-scan');
        const $status = jQuery('#phpcompat-scan-status');

        // Validate targets
        if (!this.targetsManager.hasSelectedTargets()) {
            $status.text('Select at least one target');
            return;
        }

        // Start scanning
        this.isScanning = true;
        $status.text('Running…');
        $button.prop('disabled', true);
        $stopButton.show().prop('disabled', false);

        try {
            const selectedTargets = this.targetsManager.getSelectedTargets();
            await this.processTargets(selectedTargets);
        } catch (error) {
            console.error('Scan failed:', error);
            $status.text('Scan failed');
        } finally {
            this.isScanning = false;
            $button.prop('disabled', false);
            $stopButton.hide();
        }
    }

    /**
     * Stop the current scan
     */
    async stopScan() {
        if (!this.isScanning) {
            return;
        }

        const $button = jQuery('#phpcompat-start-scan');
        const $stopButton = jQuery('#phpcompat-stop-scan');
        const $status = jQuery('#phpcompat-scan-status');

        $stopButton.prop('disabled', true).text('Stopping...');

        try {
            const response = await this.ajaxClient.stopScan();
            if (response && response.success) {
                $button.prop('disabled', false).text('Start Scan');
                $stopButton.prop('disabled', false).text('Stop Scan').hide();
                $status.html(`✅ ${response.data.message || 'Scan stopped'}`);

                // Clear scan progress
                jQuery('.phpcompat-progress').remove();
                jQuery('.phpcompat-batch-results').remove();
            }
        } catch (error) {
            console.error('Failed to stop scan:', error);
            $stopButton.prop('disabled', false).text('Stop Scan');
            $status.html('❌ Failed to stop scan');
        }

        this.isScanning = false;
    }

    /**
     * Process all selected targets
     */
    async processTargets(targets) {
        let anyFailed = false;

        for (let i = 0; i < targets.length; i++) {
            if (!this.isScanning) {
                break; // Scan was stopped
            }

            const target = targets[i];
            try {
                await this.processTarget(target);
            } catch (error) {
                console.error(`Failed to process target ${target.name}:`, error);
                anyFailed = true;
            }
        }

        // Final cleanup
        if (this.isScanning) {
            const $status = jQuery('#phpcompat-scan-status');
            $status.text(anyFailed ? 'Some scans failed' : 'Done');

            // Uncheck all targets when complete
            this.targetsManager.uncheckAllTargets();
        }
    }

    /**
     * Process a single target
     */
    async processTarget(target) {
        const $cb = jQuery(target.element);
        const $label = $cb.closest('.phpcompat-target-item');
        const $status = jQuery('#phpcompat-scan-status');

        // Create result container
        const containerId = `pcp-result-${target.type}-${target.slug.replace(/[^a-z0-9_-]/gi, '_')}`;
        let $container = jQuery(`#${containerId}`);

        if (!$container.length) {
            $container = jQuery('<div/>', {
                id: containerId,
                class: 'phpcompat-output main_output',
                css: { marginTop: '8px' }
            });
            $cb.closest('.phpcompat-target-item').after($container);
        } else {
            $container.text('');
        }

        // Show spinner
        let $flag = $label.find('.phpcompat-flag');
        if (!$flag.length) {
            $flag = jQuery('<span/>', {
                class: 'phpcompat-flag',
                css: { marginLeft: '6px' }
            }).appendTo($label);
        }
        $flag.html('<span class="spinner is-active"></span>');

        $status.text(`Scanning ${target.name}...`);

        // Get progress info
        const batchSize = this.optionsManager.getBatchSize();
        const skipVendor = this.optionsManager.getSkipVendor();

        const progressRes = await this.ajaxClient.getProgress(
            target.type,
            target.slug,
            batchSize,
            skipVendor
        );

        if (progressRes && progressRes.success && progressRes.data) {
            const progress = progressRes.data;

            if (progress.total_files > 0) {
                // Create progress section
                $container.html(this.createProgressSection(progress));

                // Process batches
                await this.processBatches(progress, $container, $flag);
            } else {
                $container.html('<div class="phpcompat-progress"><strong>No PHP files found to scan</strong><br>The selected target does not contain any PHP files.</div>');
            }
        }
    }

    /**
     * Create progress section HTML
     */
    createProgressSection(progress) {
        return `<div class="phpcompat-progress">
            <strong>Scan Progress:</strong>
            Total files: ${progress.total_files}
            Estimated batches: ${progress.estimated_batches}
            <div class="phpcompat-progress-bar"><div class="phpcompat-progress-fill" style="width: 0%"></div></div>
            <div class="phpcompat-progress-text">Preparing to scan...</div>
        </div>`;
    }

    /**
     * Process all batches for a target
     */
    async processBatches(progress, $container, $flag) {
        const totalBatches = progress.estimated_batches;
        const scanId = progress.scan_id;
        const allResults = [];

        for (let currentBatch = 1; currentBatch <= totalBatches; currentBatch++) {
            if (!this.isScanning) {
                break; // Scan was stopped
            }

            // Update progress
            this.updateProgressBar($container, currentBatch, totalBatches);

            try {
                const response = await this.ajaxClient.processBatch(scanId, currentBatch);

                if (response && response.success) {
                    const batchData = response.data;
                    allResults.push(batchData);

                    // Show progressive results
                    this.showProgressiveResults($container, batchData);
                } else {
                    throw new Error(response?.data?.message || 'Batch failed');
                }
            } catch (error) {
                console.error(`Batch ${currentBatch} failed:`, error);
                $flag.html('❌ <span class="phpcompat-status-count">Batch failed</span>');
                $container.html(`Batch ${currentBatch} failed: ${error.message}`);
                return;
            }

            // Small delay between batches
            if (currentBatch < totalBatches) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // All batches complete
        this.finalizeScan($container, $flag, allResults, progress);
    }

    /**
     * Update progress bar
     */
    updateProgressBar($container, currentBatch, totalBatches) {
        const progressPercent = Math.round((currentBatch - 1) / totalBatches * 100);
        const $progressFill = $container.find('.phpcompat-progress-fill');
        const $progressText = $container.find('.phpcompat-progress-text');

        if ($progressFill.length) {
            $progressFill.css('width', `${progressPercent}%`);
        }

        if ($progressText.length) {
            $progressText.text(`Processing batch ${currentBatch} of ${totalBatches}...`);
        }
    }

    /**
     * Show progressive results during scanning
     */
    showProgressiveResults($container, batchData) {
        const batchOutput = `<div class="phpcompat-batch">
            <strong>Batch ${batchData.batch_number}:</strong>
            ${batchData.output && batchData.output.length > 0 ? '<pre class="phpcompat-batch-output"></pre>' : '<em>No issues found in this batch</em>'}
        </div>`;

        let $existingResults = $container.find('.phpcompat-batch-results');
        if ($existingResults.length === 0) {
            $container.append('<div class="phpcompat-batch-results"></div>');
            $existingResults = $container.find('.phpcompat-batch-results');
        }

        $existingResults.append(batchOutput);

        // Safely set output content
        if (batchData.output && batchData.output.length > 0) {
            $existingResults.find('.phpcompat-batch-output').last().text(batchData.output);
        }
    }

    /**
     * Finalize scan and show complete results
     */
    finalizeScan($container, $flag, allResults, progress) {
        // Calculate totals
        const totalErrors = allResults.reduce((sum, batch) => sum + (parseInt(batch.errors, 10) || 0), 0);
        const totalWarnings = allResults.reduce((sum, batch) => sum + (parseInt(batch.warnings, 10) || 0), 0);
        const totalIssues = totalErrors + totalWarnings;
        const phpVersion = this.optionsManager.getPhpVersion();

        // Update flag with status
        if (totalIssues > 0) {
            let statusText = '';
            if (totalErrors > 0 && totalWarnings > 0) {
                statusText = `${totalIssues} issue${totalIssues > 1 ? 's' : ''} (${totalErrors} error${totalErrors > 1 ? 's' : ''}, ${totalWarnings} warning${totalWarnings > 1 ? 's' : ''}) - PHP ${phpVersion}`;
            } else if (totalErrors > 0) {
                statusText = `${totalErrors} error${totalErrors > 1 ? 's' : ''} - PHP ${phpVersion}`;
            } else {
                statusText = `${totalWarnings} warning${totalWarnings > 1 ? 's' : ''} - PHP ${phpVersion}`;
            }

            if (totalErrors > 0) {
                $flag.html(`❌ <span class="phpcompat-status-count">${statusText}</span>`);
            } else {
                $flag.html(`⚠️ <span class="phpcompat-status-count">${statusText}</span>`);
            }
        } else {
            $flag.html(`✅ <span class="phpcompat-status-count">No issues found - PHP ${phpVersion}</span>`);
        }

        // Show final organized results
        this.showFinalResults($container, allResults, progress, phpVersion);

        // Update scan summary
        this.targetsManager.updateScanSummaryDisplay();
    }

    /**
     * Show final organized results
     */
    showFinalResults($container, allResults, progress, phpVersion) {

        // Create the new two-column layout
        const leftColumnHtml = `<div class="phpcompat-output-left">
            <div class="phpcompat-progress">
                <strong>Scan Progress:</strong>
                Total files: ${progress.total_files}
                Estimated batches: ${progress.estimated_batches}
                <div class="phpcompat-progress-bar"><div class="phpcompat-progress-fill" style="width: 100%"></div></div>
                <div class="phpcompat-progress-text">Scan Complete!</div>
            </div>
            <div class="phpcompat-summary">
                <strong>Scan Complete!</strong>
                Total files scanned: ${progress.total_files}
                Batches processed: ${allResults.length}
                Target PHP version: ${phpVersion}
            </div>
        </div>`;

        // Add batch results in right column
        let rightColumnHtml = '';
        if (allResults.length > 0) {
            rightColumnHtml = `<div class="phpcompat-output-right">
                <div class="phpcompat-batch-results">
                    <div class="phpcompat-batch-results-toggle">
                        <span>Batch Results (${allResults.length} batches)</span>
                        <span class="toggle-icon">▼</span>
                    </div>
                    <div class="phpcompat-batch-results-content">`;

            allResults.forEach((batchData, index) => {
                rightColumnHtml += `<div class="phpcompat-batch">
                    <strong>Batch ${batchData.batch_number}:</strong>
                    ${batchData.output && batchData.output.length > 0 ? `<pre class="phpcompat-batch-output" data-batch="${index}"></pre>` : '<em>No issues found in this batch</em>'}
                </div>`;
            });

            rightColumnHtml += '</div></div></div>';
        }

        // Clear existing results and show final organized results
        $container.find('.phpcompat-progress').remove();
        $container.find('.phpcompat-batch-results').remove();
        $container.html(leftColumnHtml + rightColumnHtml);

        // Populate output content
        allResults.forEach((batchData, index) => {
            if (batchData.output && batchData.output.length > 0) {
                $container.find(`.phpcompat-batch-output[data-batch="${index}"]`).text(batchData.output);
            }
        });

        // Add toggle functionality
        const $toggleButton = $container.find('.phpcompat-batch-results-toggle');

        $toggleButton.on('click', function (e) {
            e.preventDefault();

            const $batchResults = jQuery(this).closest('.phpcompat-batch-results');
            const $toggleIcon = jQuery(this).find('.toggle-icon');

            $batchResults.toggleClass('collapsed');

            // Update toggle icon
            if ($batchResults.hasClass('collapsed')) {
                $toggleIcon.text('▶');
            } else {
                $toggleIcon.text('▼');
            }
        });

        // Update progress bar to completion
        const $progressFillFinal = $container.find('.phpcompat-progress-fill');
        if ($progressFillFinal.length) {
            $progressFillFinal.css('width', '100%');
        }
    }

    /**
     * Check if currently scanning
     */
    isCurrentlyScanning() {
        return this.isScanning;
    }
}
