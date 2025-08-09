/**
 * TargetsManager - Handles loading and managing scan targets (plugins and themes)
 */
import jQuery from 'jquery';

export class TargetsManager {
    constructor(ajaxClient) {
        this.ajaxClient = ajaxClient;
        this.targets = {
            plugins: [],
            themes: []
        };
    }

    /**
     * Initialize targets manager
     */
    async init() {
        await this.loadTargets();
        this.bindEvents();
        this.updateSelectedTargetsDisplay();
        this.updateScanSummaryDisplay();
    }

    /**
     * Load available scan targets from the backend
     */
    async loadTargets() {
        try {
            const $targets = jQuery('#phpcompat-targets');
            $targets.html('<div class="phpcompat-loader">Loading targets...</div>');

            const response = await this.ajaxClient.getTargets();
            if (response && response.success && response.data) {
                this.targets = {
                    plugins: response.data.plugins || [],
                    themes: response.data.themes || []
                };
                this.renderTargets();
            }
        } catch (error) {
            console.error('Failed to load targets:', error);
            jQuery('#phpcompat-targets').html('<div class="phpcompat-error">Failed to load targets</div>');
        }
    }

    /**
     * Render targets in the UI
     */
    renderTargets() {
        const $targets = jQuery('#phpcompat-targets');
        let html = '';

        if (this.targets.plugins.length > 0) {
            html += '<div class="phpcompat-target-group"><strong>Plugins</strong></div>';
            this.targets.plugins.forEach(plugin => {
                html += this.renderTargetItem(plugin, 'plugin');
            });
        }

        if (this.targets.themes.length > 0) {
            html += '<div class="phpcompat-target-group"><strong>Themes</strong></div>';
            this.targets.themes.forEach(theme => {
                html += this.renderTargetItem(theme, 'theme');
            });
        }

        $targets.html(html);
    }

    /**
     * Render a single target item
     */
    renderTargetItem(item, type) {
        const escapedSlug = item.slug.replace(/"/g, '&quot;');
        const escapedName = jQuery('<div/>').text(item.name).html();

        return `<label class="phpcompat-target-item">
            <input type="checkbox" class="phpcompat-target" data-type="${type}" data-slug="${escapedSlug}"> 
            ${escapedName}
        </label>`;
    }

    /**
     * Bind event handlers for target interactions
     */
    bindEvents() {
        jQuery(document).on('change', '.phpcompat-target', () => {
            this.updateSelectedTargetsDisplay();
        });
    }

    /**
     * Update the display of selected targets
     */
    updateSelectedTargetsDisplay() {
        const $selectedTargets = jQuery('.phpcompat-target:checked');
        const $targetsList = jQuery('#phpcompat-selected-targets-list');

        if ($selectedTargets.length === 0) {
            $targetsList.html('<span class="phpcompat-no-targets">No targets selected</span>');
            return;
        }

        let html = '';
        $selectedTargets.each(function () {
            const $target = jQuery(this);
            const type = $target.data('type');
            const name = $target.closest('.phpcompat-target-item').text().trim();

            html += `<span class="phpcompat-target-tag ${type}">${name}</span>`;
        });

        $targetsList.html(html);
    }

    /**
     * Update the scan summary display
     */
    updateScanSummaryDisplay() {
        const $completedScans = jQuery('.phpcompat-target-item').filter(function () {
            return jQuery(this).find('.phpcompat-status-count').length > 0;
        });

        const $summaryList = jQuery('#phpcompat-scan-summary-list');

        if ($completedScans.length === 0) {
            $summaryList.html('<span class="phpcompat-no-scans">No scans completed yet</span>');
            return;
        }

        let html = '';
        $completedScans.each(function () {
            const $target = jQuery(this);
            const $statusCount = $target.find('.phpcompat-status-count');

            if ($statusCount.length === 0) {
                return;
            }

            const targetName = $target.clone().find('input').remove().end().text().trim();
            const statusText = $statusCount.text();
            const hasErrors = statusText.includes('error');
            const hasWarnings = statusText.includes('warning');

            let statusClass = 'success';
            let statusIcon = '✅';

            if (hasErrors) {
                statusClass = 'errors';
                statusIcon = '❌';
            } else if (hasWarnings) {
                statusClass = 'warnings';
                statusIcon = '⚠️';
            }

            html += `<span class="phpcompat-scan-result ${statusClass}">${targetName} ${statusIcon}</span>`;
        });

        $summaryList.html(html);
    }

    /**
     * Get selected targets
     */
    getSelectedTargets() {
        const $items = jQuery('.phpcompat-target:checked');
        return $items.toArray().map(item => {
            const $item = jQuery(item);
            return {
                element: item,
                type: $item.data('type'),
                slug: $item.data('slug'),
                name: $item.closest('.phpcompat-target-item').text().trim()
            };
        });
    }

    /**
     * Check if any targets are selected
     */
    hasSelectedTargets() {
        return jQuery('.phpcompat-target:checked').length > 0;
    }

    /**
     * Uncheck all selected targets
     */
    uncheckAllTargets() {
        jQuery('.phpcompat-target:checked').prop('checked', false);
        this.updateSelectedTargetsDisplay();
    }
}
