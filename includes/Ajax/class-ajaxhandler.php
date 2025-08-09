<?php

/**
 * AjaxHandler Class for PHP Compatibility Checker
 *
 * Handles all AJAX requests for the PHP compatibility checker, including
 * scan operations, target management, and progress tracking.
 *
 * @package         EH\PHPCompatibilityChecker\Ajax
 * @author          EH
 * @version         1.0.0
 * @license         GPL-2.0-or-later
 */

namespace EH\PHPCompatibilityChecker\Ajax;

use EH\PHPCompatibilityChecker\Core\Scanner;

/**
 * AjaxHandler Class
 *
 * Manages AJAX operations for PHP compatibility scanning.
 *
 * @package EH\PHPCompatibilityChecker\Ajax
 */
class AjaxHandler
{





	/**
	 * Initialize all AJAX hooks
	 */
	public function init()
	{
		add_action('wp_ajax_phpcompat_checker_scan', array($this, 'handle_scan'));
		add_action('wp_ajax_phpcompat_checker_targets', array($this, 'handle_targets'));
		add_action('wp_ajax_phpcompat_checker_preflight', array($this, 'handle_preflight'));
		add_action('wp_ajax_phpcompat_checker_batch_scan', array($this, 'handle_batch_scan'));
		add_action('wp_ajax_phpcompat_checker_progress', array($this, 'handle_progress'));
		add_action('wp_ajax_phpcompat_checker_process_batch', array($this, 'handle_process_batch'));
		add_action('wp_ajax_phpcompat_checker_load_options', array($this, 'handle_load_options'));
		add_action('wp_ajax_phpcompat_checker_save_options', array($this, 'handle_save_options'));
		add_action('wp_ajax_phpcompat_checker_stop_scan', array($this, 'handle_stop_scan'));
	}

	/**
	 * Verify user permissions and nonce for all AJAX requests
	 */
	private function verify_ajax_request()
	{
		if (! current_user_can('manage_options')) {
			wp_send_json_error(array('message' => __('Unauthorized', 'phpcompatibility-checker')), 403);
		}

		// Verify AJAX referer and nonce.
		check_ajax_referer('phpcompat_checker_ajax', 'nonce');
	}

	/**
	 * Set execution limits for resource-intensive operations
	 */
	private function extend_limits()
	{
		set_time_limit(300);
		if (function_exists('wp_raise_memory_limit')) {
			wp_raise_memory_limit('admin');
		}
	}

	/**
	 * Handle single scan request
	 */
	public function handle_scan()
	{
		$this->verify_ajax_request();
		$this->extend_limits();

		$scanner = new Scanner();

		try {
			$scan_path = $this->get_scan_path_from_request();
			if (! $scan_path) {
				wp_send_json_error(array('message' => 'Invalid scan target specified.'));
			}

			$result = $scanner->run($scan_path);
			wp_send_json_success(array('output' => $result));
		} catch (\Throwable $e) {
			wp_send_json_error(array('output' => 'Exception: ' . $e->getMessage()));
		}
	}

	/**
	 * Handle targets listing request
	 */
	public function handle_targets()
	{
		$this->verify_ajax_request();

		require_once ABSPATH . 'wp-admin/includes/plugin.php';
		$plugins = get_plugins();
		$self    = plugin_basename(dirname(dirname(__DIR__)) . '/phpcompatibility-checker.php');

		$plugin_targets = array();
		foreach ($plugins as $file => $data) {
			if ($file === $self) {
				continue;
			}
			$plugin_targets[] = array(
				'type' => 'plugin',
				'slug' => $file,
				'name' => isset($data['Name']) ? $data['Name'] : $file,
			);
		}

		$themes        = wp_get_themes();
		$theme_targets = array();
		foreach ($themes as $stylesheet => $theme) {
			$theme_targets[] = array(
				'type' => 'theme',
				'slug' => $stylesheet,
				'name' => $theme->get('Name') ? $theme->get('Name') : $stylesheet,
			);
		}

		wp_send_json_success(
			array(
				'plugins' => $plugin_targets,
				'themes'  => $theme_targets,
			)
		);
	}

	/**
	 * Handle preflight system check
	 */
	public function handle_preflight()
	{
		$this->verify_ajax_request();

		$scanner = new Scanner();
		$status  = $scanner->check_system_requirements();

		if ($status['ready']) {
			wp_send_json_success($status);
		}
		wp_send_json_error($status);
	}

	/**
	 * Handle batch scan request
	 */
	public function handle_batch_scan()
	{
		$this->verify_ajax_request();
		$this->extend_limits();

		$scanner = new Scanner();

		try {
			$scan_path = $this->get_scan_path_from_request();
			if (! $scan_path) {
				wp_send_json_error(array('message' => 'Invalid scan target specified.'));
			}

			$result = $scanner->scan_in_batches($scan_path);
			wp_send_json_success($result);
		} catch (\Throwable $e) {
			wp_send_json_error(array('message' => 'Exception: ' . $e->getMessage()));
		}
	}

	/**
	 * Handle scan progress request
	 */
	public function handle_progress()
	{
		$this->verify_ajax_request();

		$scanner = new Scanner();

		try {
			$scan_path = $this->get_scan_path_from_request();
			if (! $scan_path) {
				wp_send_json_error(array('message' => 'Invalid scan target specified.'));
			}

			$batch_size       = (int) (wp_unslash($_POST['batch_size'] ?? 50));
			$skip_vendor      = ! empty(wp_unslash($_POST['skip_vendor'])) && wp_unslash($_POST['skip_vendor']) === '1';
			$exclude_patterns = $skip_vendor ? array('vendor/*') : array();

			$result = $scanner->get_scan_progress($scan_path, $batch_size, $exclude_patterns);
			wp_send_json_success($result);
		} catch (\Throwable $e) {
			wp_send_json_error(array('message' => 'Exception: ' . $e->getMessage()));
		}
	}

	/**
	 * Handle process batch request
	 */
	public function handle_process_batch()
	{
		$this->verify_ajax_request();
		$this->extend_limits();

		$scanner = new Scanner();

		try {
			if (empty($_POST['scan_id']) || empty($_POST['batch_number'])) {
				wp_send_json_error(array('message' => 'Invalid scan ID or batch number.'));
			}

			$scan_id      = sanitize_text_field(wp_unslash($_POST['scan_id']));
			$batch_number = (int) $_POST['batch_number'];

			$batch_info = $scanner->get_batch_files_from_scan($scan_id, $batch_number);
			if (! empty($batch_info['files'])) {
				$php_version  = get_option('phpcompat_checker_php_version', '8.3');
				$batch_result = $scanner->scan_batch($batch_info['files'], $php_version);

				// Don't send files list to frontend, just the scan results.
				$result = array(
					'batch_number'  => $batch_info['batch_number'],
					'total_batches' => $batch_info['total_batches'],
					'is_last_batch' => $batch_info['is_last_batch'],
					'output'        => $batch_result['output'],
					'errors'        => $batch_result['errors'],
					'warnings'      => $batch_result['warnings'],
				);
			} else {
				$result = $batch_info;
			}

			wp_send_json_success($result);
		} catch (\Throwable $e) {
			wp_send_json_error(array('message' => 'Exception: ' . $e->getMessage()));
		}
	}

	/**
	 * Handle load options request
	 */
	public function handle_load_options()
	{
		$this->verify_ajax_request();

		$options = array(
			'report_mode' => get_option('phpcompat_checker_report_mode', 'detailed'),
			'batch_size'  => get_option('phpcompat_checker_batch_size', '50'),
			'php_version' => get_option('phpcompat_checker_php_version', '8.3'),
			'skip_vendor' => get_option('phpcompat_checker_skip_vendor', '1'),
		);

		wp_send_json_success($options);
	}

	/**
	 * Handle save options request
	 */
	public function handle_save_options()
	{
		$this->verify_ajax_request();

		$report_mode = sanitize_text_field(wp_unslash($_POST['report_mode'] ?? 'detailed'));
		$batch_size  = sanitize_text_field(wp_unslash($_POST['batch_size'] ?? '50'));
		$php_version = sanitize_text_field(wp_unslash($_POST['php_version'] ?? '8.3'));
		$skip_vendor = sanitize_text_field(wp_unslash($_POST['skip_vendor'] ?? '1'));

		// Validate batch size.
		$valid_batch_sizes = array('10', '25', '50', '75', '100');
		if (! in_array($batch_size, $valid_batch_sizes, true)) {
			$batch_size = '50';
		}

		// Validate PHP version.
		$valid_php_versions = array('7.4', '8.0', '8.1', '8.2', '8.3', '8.4');
		if (! in_array($php_version, $valid_php_versions, true)) {
			$php_version = '8.3';
		}

		update_option('phpcompat_checker_report_mode', $report_mode);
		update_option('phpcompat_checker_batch_size', $batch_size);
		update_option('phpcompat_checker_php_version', $php_version);
		update_option('phpcompat_checker_skip_vendor', $skip_vendor);

		wp_send_json_success(array('message' => __('Options saved successfully.', 'phpcompatibility-checker')));
	}

	/**
	 * Handle stop scan request
	 */
	public function handle_stop_scan()
	{
		$this->verify_ajax_request();

		update_option('phpcompat_checker_stop_scan', '1');
		wp_send_json_success(array('message' => __('Scan stop requested.', 'phpcompatibility-checker')));
	}

	/**
	 * Extract scan path from POST request data
	 */
	private function get_scan_path_from_request()
	{
		if (! empty($_POST['type']) && ! empty($_POST['slug'])) {
			$type = sanitize_text_field(wp_unslash($_POST['type']));
			$slug = sanitize_text_field(wp_unslash($_POST['slug']));

			if ('plugin' === $type) {
				$plugin_file = WP_PLUGIN_DIR . '/' . $slug;
				if (file_exists($plugin_file)) {
					return dirname($plugin_file);
				}
			} elseif ('theme' === $type) {
				$theme_dir = get_theme_root() . '/' . $slug;
				if (is_dir($theme_dir)) {
					return $theme_dir;
				}
			}
		}

		return null;
	}
}
