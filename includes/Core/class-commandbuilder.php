<?php

/**
 * CommandBuilder Class for PHP Compatibility Checker
 *
 * Handles building and constructing PHPCS commands for PHP compatibility scanning,
 * including PHP binary detection and path resolution.
 *
 * @package         EH\PHPCompatibilityChecker\Core
 * @author          EH
 * @version         1.0.0
 * @license         GPL-2.0-or-later
 */

namespace EH\PHPCompatibilityChecker\Core;

/**
 * CommandBuilder Class
 *
 * Builds PHPCS commands for PHP compatibility scanning operations.
 *
 * @package EH\PHPCompatibilityChecker\Core
 */
class CommandBuilder
{




	/**
	 * Whether to use global phpcs installation
	 *
	 * @var bool
	 */
	private $use_global_phpcs;

	/**
	 * Reference to temporary file for batch processing
	 *
	 * @var string|null
	 */
	private $temp_file_ref;

	/**
	 * Constructor
	 *
	 * @param bool $use_global_phpcs Whether to use global phpcs installation.
	 */
	public function __construct($use_global_phpcs = false)
	{
		$this->use_global_phpcs = (bool) $use_global_phpcs;
	}

	/**
	 * Build phpcs command for scanning files
	 *
	 * @param array       $paths         Array of file paths to scan.
	 * @param string      $php_version   Target PHP version for compatibility check.
	 * @param string|null $temp_file_ref Reference to store temporary file path.
	 * @return string Built command string.
	 */
	public function build($paths, $php_version, &$temp_file_ref = null)
	{
		$plugin_dir = dirname(dirname(__DIR__));

		$php_binary = $this->detect_php_binary();
		$phpcs_path = $this->resolve_phpcs_path($plugin_dir);

		$is_windows = stripos(PHP_OS, 'WIN') === 0;
		$php_q      = $is_windows ? '"' . str_replace('"', '""', $php_binary) . '"' : escapeshellarg($php_binary);
		$pcs_q      = $is_windows ? '"' . str_replace('"', '""', $phpcs_path) . '"' : escapeshellarg($phpcs_path);

		$parts = array(
			$php_q,
			$pcs_q,
			'--extensions=php',
			'--standard=PHPCompatibility',
			'--runtime-set testVersion ' . escapeshellarg($php_version),
			'--no-cache',
		);

		// Handle multiple files using --file-list to avoid command line length limits.
		if (count($paths) > 1) {
			$file_manager      = new FileManager();
			$file_list_content = implode("\n", $paths);
			$temp_file         = $file_manager->create_temp_file($file_list_content, 'filelist_');

			if ($temp_file) {
				$temp_file_ref       = $temp_file;
				$this->temp_file_ref = $temp_file;
				$parts[]             = '--file-list=' . ($is_windows ? '"' . str_replace('"', '""', $temp_file) . '"' : escapeshellarg($temp_file));
			} else {
				// Fallback to individual file arguments.
				foreach ($paths as $file_path) {
					$parts[] = escapeshellarg($file_path);
				}
			}
		} else {
			// Single file.
			$parts[] = escapeshellarg($paths[0]);
		}

		return implode(' ', $parts) . ' 2>&1';
	}

	/**
	 * Detect PHP binary path
	 *
	 * @return string PHP binary path.
	 */
	public function detect_php_binary()
	{
		$php = defined('PHP_BINARY') && PHP_BINARY ? PHP_BINARY : '';

		if (! $php || ! file_exists($php)) {
			$phpbindir = defined('PHP_BINDIR') ? PHP_BINDIR : '';
			if ($phpbindir) {
				$candidate = rtrim($phpbindir, '\\/') . DIRECTORY_SEPARATOR . 'php' . (stripos(PHP_OS, 'WIN') === 0 ? '.exe' : '');
				if (file_exists($candidate)) {
					$php = $candidate;
				}
			}
		}

		// If detected binary is php-cgi, try sibling php (CLI).
		if ($php && preg_match('/php-cgi(\.exe)?$/i', $php)) {
			$sibling = dirname($php) . DIRECTORY_SEPARATOR . 'php' . (stripos(PHP_OS, 'WIN') === 0 ? '.exe' : '');
			if (file_exists($sibling)) {
				$php = $sibling;
			}
		}

		if (! $php) {
			// Search PATH.
			$path = getenv('PATH');
			if ($path) {
				$segments = preg_split('/;|:/', $path);
				foreach ($segments as $dir) {
					$dir = trim($dir);
					if ('' === $dir) {
						continue;
					}
					$candidate = rtrim($dir, '\\/') . DIRECTORY_SEPARATOR . 'php' . (stripos(PHP_OS, 'WIN') === 0 ? '.exe' : '');
					if (file_exists($candidate)) {
						$php = $candidate;
						break;
					}
				}
			}
		}

		$php = $php ? $php : 'php';

		return $php;
	}

	/**
	 * Resolve phpcs script path
	 *
	 * @param string $plugin_dir Plugin directory path.
	 * @return string PHPCS script path.
	 */
	public function resolve_phpcs_path($plugin_dir)
	{
		$candidates = array(
			$plugin_dir . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'bin' . DIRECTORY_SEPARATOR . 'phpcs',
			$plugin_dir . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'squizlabs' . DIRECTORY_SEPARATOR . 'php_codesniffer' . DIRECTORY_SEPARATOR . 'bin' . DIRECTORY_SEPARATOR . 'phpcs',
		);

		foreach ($candidates as $candidate) {
			if (file_exists($candidate)) {
				return $candidate;
			}
		}

		return $candidates[0];
	}
}
