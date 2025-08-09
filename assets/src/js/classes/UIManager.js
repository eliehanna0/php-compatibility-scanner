/**
 * UIManager - Handles UI interactions, enhancements, and general UI management
 */
import jQuery from 'jquery';

export class UIManager {
    constructor() {
        this.init();
    }

    /**
     * Initialize UI manager
     */
    init() {
        this.bindEvents();
        this.initializeUI();
    }

    /**
     * Bind general UI event handlers
     */
    bindEvents() {
        // Add toggle functionality for How to Use section
        jQuery(document).on('click', '.phpcompat-how-to-use h2', function () {
            jQuery(this).closest('.phpcompat-how-to-use').toggleClass('collapsed');
        });

        // Note: Batch results toggle is handled by ScanManager after results are created
    }

    /**
     * Initialize UI elements
     */
    initializeUI() {
        // Ensure stop button is hidden initially
        jQuery('#phpcompat-stop-scan').hide();

        // Add any initial UI enhancements
        this.enhanceFormElements();
        this.enhanceProgressBars();
    }

    /**
     * Enhance form elements with better UX
     */
    enhanceFormElements() {
        // Add focus effects to form inputs
        jQuery('.phpcompat-form-group input, .phpcompat-form-group select').on('focus', function () {
            jQuery(this).closest('.phpcompat-form-group').addClass('focused');
        }).on('blur', function () {
            jQuery(this).closest('.phpcompat-form-group').removeClass('focused');
        });

        // Add hover effects to target items
        jQuery('.phpcompat-target-item').on('mouseenter', function () {
            jQuery(this).addClass('hovered');
        }).on('mouseleave', function () {
            jQuery(this).removeClass('hovered');
        });
    }

    /**
     * Enhance progress bars with animations
     */
    enhanceProgressBars() {
        // Add smooth transitions to progress bars
        jQuery('.phpcompat-progress-fill').css('transition', 'width 0.3s ease');
    }

    /**
     * Show loading state for an element
     */
    showLoading($element, message = 'Loading...') {
        $element.prop('disabled', true);
        const originalText = $element.text();
        $element.data('original-text', originalText);
        $element.text(message);
        return originalText;
    }

    /**
     * Hide loading state for an element
     */
    hideLoading($element) {
        $element.prop('disabled', false);
        const originalText = $element.data('original-text');
        if (originalText) {
            $element.text(originalText);
        }
    }

    /**
     * Show success message
     */
    showSuccess(message, duration = 3000) {
        this.showMessage(message, 'success', duration);
    }

    /**
     * Show error message
     */
    showError(message, duration = 5000) {
        this.showMessage(message, 'error', duration);
    }

    /**
     * Show warning message
     */
    showWarning(message, duration = 4000) {
        this.showMessage(message, 'warning', duration);
    }

    /**
     * Show info message
     */
    showInfo(message, duration = 3000) {
        this.showMessage(message, 'info', duration);
    }

    /**
     * Show a message with specified type and duration
     */
    showMessage(message, type = 'info', duration = 3000) {
        const $messageContainer = jQuery('#phpcompat-messages');

        if (!$messageContainer.length) {
            jQuery('<div id="phpcompat-messages"></div>').insertAfter('#phpcompat-scan-status');
        }

        const messageHtml = `<div class="phpcompat-message phpcompat-message-${type}">
            <span class="message-text">${message}</span>
            <button class="message-close">&times;</button>
        </div>`;

        const $message = jQuery(messageHtml);
        $messageContainer.append($message);

        // Auto-remove after duration
        setTimeout(() => {
            $message.fadeOut(300, function () {
                jQuery(this).remove();
            });
        }, duration);

        // Close button functionality
        $message.find('.message-close').on('click', function () {
            $message.fadeOut(300, function () {
                jQuery(this).remove();
            });
        });
    }

    /**
     * Update status display
     */
    updateStatus(message, type = 'info') {
        const $status = jQuery('#phpcompat-scan-status');
        const icon = this.getStatusIcon(type);
        $status.html(`${icon} ${message}`);
    }

    /**
     * Get status icon based on type
     */
    getStatusIcon(type) {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
            default:
                return 'ℹ️';
        }
    }

    /**
     * Toggle element visibility with animation
     */
    toggleElement($element, show = true, duration = 300) {
        if (show) {
            $element.slideDown(duration);
        } else {
            $element.slideUp(duration);
        }
    }

    /**
     * Fade in element
     */
    fadeInElement($element, duration = 300) {
        $element.fadeIn(duration);
    }

    /**
     * Fade out element
     */
    fadeOutElement($element, duration = 300) {
        $element.fadeOut(duration);
    }

    /**
     * Scroll to element smoothly
     */
    scrollToElement($element, offset = 0) {
        jQuery('html, body').animate({
            scrollTop: $element.offset().top - offset
        }, 500);
    }

    /**
     * Highlight element temporarily
     */
    highlightElement($element, duration = 2000) {
        $element.addClass('highlighted');
        setTimeout(() => {
            $element.removeClass('highlighted');
        }, duration);
    }

    /**
     * Disable form during processing
     */
    disableForm() {
        jQuery('.phpcompat-form-group input, .phpcompat-form-group select, .phpcompat-form-group button').prop('disabled', true);
    }

    /**
     * Enable form after processing
     */
    enableForm() {
        jQuery('.phpcompat-form-group input, .phpcompat-form-group select, .phpcompat-form-group button').prop('disabled', false);
    }

    /**
     * Reset form to default state
     */
    resetForm() {
        jQuery('.phpcompat-form-group input[type="text"], .phpcompat-form-group input[type="number"]').val('');
        jQuery('.phpcompat-form-group select').prop('selectedIndex', 0);
        jQuery('.phpcompat-form-group input[type="checkbox"]').prop('checked', false);
    }

    /**
     * Clear all scan results
     */
    clearScanResults() {
        jQuery('.phpcompat-output').remove();
        jQuery('.phpcompat-progress').remove();
        jQuery('.phpcompat-batch-results').remove();
        jQuery('.phpcompat-flag').remove();
    }

    /**
     * Update progress indicator
     */
    updateProgress(percent, text = '') {
        const $progressFill = jQuery('.phpcompat-progress-fill');
        const $progressText = jQuery('.phpcompat-progress-text');

        if ($progressFill.length) {
            $progressFill.css('width', `${percent}%`);
        }

        if ($progressText.length && text) {
            $progressText.text(text);
        }
    }
}
