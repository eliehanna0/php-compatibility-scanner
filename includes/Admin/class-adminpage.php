<?php

/**
 * AdminPage Class for PHP Compatibility Checker
 *
 * Handles the rendering of the admin interface for the PHP compatibility checker,
 * including scan options, target selection, and results display.
 *
 * @package         EH\PHPCompatibilityChecker\Admin
 * @author          EH
 * @version         1.0.0
 * @license         GPL-2.0-or-later
 */

namespace EH\PHPCompatibilityChecker\Admin;

/**
 * AdminPage Class
 *
 * Renders the admin interface for PHP compatibility scanning.
 *
 * @package EH\PHPCompatibilityChecker\Admin
 */
class AdminPage
{





	/**
	 * Render the admin page with all UI elements
	 */
	public function render()
	{
?>
		<div class="wrap">
			<h1><?php echo esc_html(__('PHP Compatibility Scanner', 'eli-php-compatibility-scanner')); ?></h1>
			<p><?php echo esc_html(__('Check your site plugins and themes for PHP version compatibility using PHPCompatibility.', 'eli-php-compatibility-scanner')); ?></p>
			<h2 class="phpcompat-subheading"><?php echo esc_html(__('System check', 'eli-php-compatibility-scanner')); ?></h2>
			<pre id="phpcompat-system-check" class="phpcompat-output"><?php echo esc_html(__('Checking environment', 'eli-php-compatibility-scanner')); ?></pre>

			<!-- How to Use Section -->
			<div class="phpcompat-how-to-use">
				<h2 class="phpcompat-subheading">
					<span class="phpcompat-toggle-icon">▼</span>
					<?php echo esc_html(__('How to Use', 'eli-php-compatibility-scanner')); ?>
				</h2>
				<div class="phpcompat-how-to-use-content">
					<ol>
						<li><strong>Select Targets:</strong> Choose which plugins and themes to scan by checking the boxes below.</li>
						<li><strong>Configure Options:</strong> Set your preferred PHP version, batch size, and report mode.</li>
						<li><strong>Start Scan:</strong> Click Start Scan to begin the compatibility check.</li>
						<li><strong>Review Results:</strong> Results will appear below each target with error counts and details.</li>
						<li><strong>Interpret Status:</strong>
							<span class="phpcompat-status-example">✅ No issues found</span> |
							<span class="phpcompat-status-example">❌ X errors found</span> |
							<span class="phpcompat-status-example">⚠️ Y warnings found</span>
						</li>
					</ol>
				</div>
			</div>

			<!-- Scan Options -->
			<div class="phpcompat-sticky-controls">
				<h2 class="phpcompat-subheading"><?php echo esc_html(__('Scan Options', 'eli-php-compatibility-scanner')); ?></h2>
				<div class="phpcompat-options">
					<div class="phpcompat-option-group">
						<label for="php-version"><?php echo esc_html(__('Target PHP Version:', 'eli-php-compatibility-scanner')); ?></label>
						<select id="php-version" name="php-version">
							<option value="7.4">PHP 7.4</option>
							<option value="8.0">PHP 8.0</option>
							<option value="8.1">PHP 8.1</option>
							<option value="8.2">PHP 8.2</option>
							<option value="8.3" selected>PHP 8.3</option>
							<option value="8.4">PHP 8.4</option>
						</select>
						<span class="phpcompat-help-tip" title="<?php echo esc_attr(__('Select the PHP version you want to check compatibility against. The scan will identify code that may not work in this version.', 'eli-php-compatibility-scanner')); ?>">?</span>
					</div>

					<div class="phpcompat-option-group">
						<label for="batch-size"><?php echo esc_html(__('Batch Size:', 'eli-php-compatibility-scanner')); ?></label>
						<select id="batch-size" name="batch-size">
							<option value="10">10 files</option>
							<option value="25">25 files</option>
							<option value="50" selected>50 files</option>
							<option value="75">75 files</option>
							<option value="100">100 files</option>
						</select>
						<span class="phpcompat-help-tip" title="<?php echo esc_attr(__('Number of files to process in each batch. Smaller batches use less memory but take longer to complete.', 'eli-php-compatibility-scanner')); ?>">?</span>
					</div>

					<div class="phpcompat-option-group">
						<label for="skip-vendor">
							<input type="checkbox" id="skip-vendor" name="skip-vendor" value="1" checked>
							<span class="toggle-label"><?php echo esc_html(__('Skip Vendor Directory', 'eli-php-compatibility-scanner')); ?></span>
							<span class="phpcompat-help-tip" title="<?php echo esc_attr(__('Skip scanning files in vendor directories. This excludes third-party dependencies and can significantly speed up scans.', 'eli-php-compatibility-scanner')); ?>">?</span>
						</label>
					</div>

					<div class="phpcompat-option-group">
						<div class="phpcompat-selected-targets">
							<label><?php echo esc_html(__('Selected Targets:', 'eli-php-compatibility-scanner')); ?></label>
							<div id="phpcompat-selected-targets-list" class="phpcompat-selected-targets-list">
								<span class="phpcompat-no-targets"><?php echo esc_html(__('No targets selected', 'eli-php-compatibility-scanner')); ?></span>
							</div>
						</div>
					</div>

					<div class="phpcompat-option-group">
						<div class="phpcompat-scan-summary">
							<label><?php echo esc_html(__('Scan Summary:', 'eli-php-compatibility-scanner')); ?></label>
							<div id="phpcompat-scan-summary-list" class="phpcompat-scan-summary-list">
								<span class="phpcompat-no-scans"><?php echo esc_html(__('No scans completed yet', 'eli-php-compatibility-scanner')); ?></span>
							</div>
						</div>
					</div>

					<div class="phpcompat-option-group">
						<button id="phpcompat-start-scan" class="button button-primary" disabled><?php echo esc_html(__('Start Scan', 'eli-php-compatibility-scanner')); ?></button>
						<button id="phpcompat-stop-scan" class="button button-secondary" style="display: none;"><?php echo esc_html(__('Stop Scan', 'eli-php-compatibility-scanner')); ?></button>
						<span id="phpcompat-scan-status" class="phpcompat-status"></span>
					</div>
				</div>
			</div>

			<h2 class="phpcompat-subheading"><?php echo esc_html(__('Targets', 'eli-php-compatibility-scanner')); ?></h2>
			<div id="phpcompat-targets" class="phpcompat-targets"></div>
		</div>
<?php
	}
}
