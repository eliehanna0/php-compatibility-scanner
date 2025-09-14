<?php

/**
 * Plugin Name: Eli's PHP Compatibility Scanner
 * Plugin URI: https://wordpress.org/plugins/eli-php-compatibility-scanner
 * Description: A comprehensive WordPress plugin that scans your plugins and themes for PHP version compatibility issues using the industry-standard PHPCompatibility ruleset.
 * Version: 1.0.1
 * Author: EH
 * Author URI: https://elihanna.dev
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: eli-php-compatibility-scanner
 * Domain Path: /languages
 * Requires PHP: 7.4
 * Tested up to: 6.8
 *
 * @package         EH\PHPCompatibilityChecker\Core
 * @author          EH
 * @version         1.0.1
 * @license         GPL-2.0-or-later
 *
 * Eli's PHP Compatibility Scanner is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * any later version.
 *
 * Eli's PHP Compatibility Scanner is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Eli's PHP Compatibility Scanner. If not, see
 * https://www.gnu.org/licenses/gpl-2.0.html.
 */

// Prevent direct access.
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants.
define('PHPCOMPAT_CHECKER_VERSION', '1.0.1');
define('PHPCOMPAT_CHECKER_PLUGIN_FILE', __FILE__);
define('PHPCOMPAT_CHECKER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PHPCOMPAT_CHECKER_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include and register the autoloader.
require_once __DIR__ . '/includes/class-autoloader.php';
EH\PHPCompatibilityChecker\Autoloader::register();

/**
 * Initialize the PHP Compatibility Scanner plugin.
 *
 * @return void
 */
function phpcompat_checker_init()
{
    // Initialize the main plugin class.
    EH\PHPCompatibilityChecker\Plugin::get_instance();
}

// Hook into WordPress init action.
add_action('init', 'phpcompat_checker_init');
