<?php

/**
 * Plugin Name: PHPCompatibility Checker
 * Plugin URI: https://wordpress.org/plugins/phpcompatibility-checker
 * Description: A comprehensive WordPress plugin that scans your plugins and themes for PHP version compatibility issues using the industry-standard PHPCompatibility ruleset.
 * Version: 1.0.0
 * Author: EH
 * Author URI: https://elihanna.dev
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: phpcompatibility-checker
 * Domain Path: /languages
 * Requires PHP: 7.4
 * Tested up to: 6.8.2
 *
 * @package         EH\PHPCompatibilityChecker
 * @author          EH
 * @version         1.0.0
 * @license         GPL-2.0-or-later
 *
 * PHP Compatibility Checker is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * any later version.
 *
 * PHP Compatibility Checker is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with PHP Compatibility Checker. If not, see
 * https://www.gnu.org/licenses/gpl-2.0.html.
 */

// Prevent direct access.
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants.
define('PHPCOMPAT_CHECKER_VERSION', '1.0.0');

// Include and register the autoloader.
require_once __DIR__ . '/includes/class-autoloader.php';
EH\PHPCompatibilityChecker\Autoloader::register();

/**
 * Initialize the PHP Compatibility Checker plugin.
 *
 * @return void
 */
function phpcompat_checker_init()
{
    // Initialize the main plugin class.
    EH\PHPCompatibilityChecker\Plugin::get_instance();
}

// Hook into WordPress plugins_loaded action.
add_action('plugins_loaded', 'phpcompat_checker_init');
