<?php

/**
 * Plugin Class for PHP Compatibility Checker
 *
 * Main plugin class that handles initialization, admin assets, and core functionality.
 *
 * @package         EH\PHPCompatibilityChecker
 * @author          EH
 * @version         1.0.0
 * @license         GPL-2.0-or-later
 */

namespace EH\PHPCompatibilityChecker;

/**
 * Main Plugin Class
 *
 * Handles plugin initialization, admin menu creation, and asset management.
 *
 * @package EH\PHPCompatibilityChecker
 */
class Plugin
{




	/**
	 * Plugin instance
	 *
	 * @var Plugin|null
	 */
	private static $instance = null;

	/**
	 * Plugin menu title
	 *
	 * @var string
	 */
	private $menu_title;

	/**
	 * Get plugin instance
	 *
	 * @return Plugin Plugin instance
	 */
	public static function get_instance()
	{
		if (null === self::$instance) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor
	 */
	private function __construct()
	{
		$this->menu_title = __('PHP Compatibility Scanner', 'eli-php-compatibility-scanner');
		$this->init_hooks();
	}

	/**
	 * Get the plugin menu title
	 *
	 * @return string The menu title
	 */
	public function get_menu_title()
	{
		return $this->menu_title;
	}

	/**
	 * Initialize WordPress hooks and plugin functionality
	 */
	private function init_hooks()
	{
		add_action('admin_menu', array($this, 'add_admin_menu'));
		add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));

		$this->init_ajax_handlers();
	}

	/**
	 * Register the admin menu page
	 */
	public function add_admin_menu()
	{
		add_management_page(
			$this->menu_title,
			$this->menu_title,
			'manage_options',
			'php-compatibility-scanner',
			array($this, 'render_admin_page')
		);
	}

	/**
	 * Render the admin page using the AdminPage class
	 */
	public function render_admin_page()
	{
		$admin_page = new Admin\AdminPage();
		$admin_page->render();
	}

	/**
	 * Enqueue admin assets only on the plugin page
	 *
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue_admin_assets($hook)
	{
		if ('tools_page_php-compatibility-scanner' !== $hook) {
			return;
		}

		$plugin_url = plugin_dir_url(__DIR__);

		wp_enqueue_style(
			'phpcompat-checker-admin',
			$plugin_url . 'assets/dist/admin.css',
			array(),
			PHPCOMPAT_CHECKER_VERSION
		);

		wp_enqueue_script(
			'phpcompat-checker-admin',
			$plugin_url . 'assets/dist/admin.js',
			array('jquery'),
			PHPCOMPAT_CHECKER_VERSION,
			true
		);

		wp_localize_script(
			'phpcompat-checker-admin',
			'PHPCompatChecker',
			array(
				'ajaxUrl' => admin_url('admin-ajax.php'),
				'nonce'   => wp_create_nonce('phpcompat_checker_ajax'),
			)
		);
	}

	/**
	 * Initialize AJAX handlers through the AjaxHandler class
	 */
	private function init_ajax_handlers()
	{
		$ajax_handler = new Ajax\AjaxHandler();
		$ajax_handler->init();
	}
}
