=== PHP Compatibility Scanner ===
Contributors: eliehanna
Donate link: 
Tags:  compatibility, testing, code-quality, phpcs, wordpress-development
Requires at least: 4.5
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A comprehensive WordPress plugin that scans your plugins and themes for PHP version compatibility issues using the  PHPCompatibility ruleset.

== Description ==

**⚠️ Important: Development Environment Only**

This plugin is designed for development environments like LocalWP, XAMPP, or self-hosted servers. It will **not work** on most managed hosting providers (WP Engine, Kinsta, SiteGround, etc.) due to security restrictions that disable the `exec()` function and limit access to PHP binaries.



**How It Works**

This plugin leverages [PHP_CodeSniffer](https://github.com/squizlabs/PHP_CodeSniffer) with the [PHPCompatibility](https://github.com/PHPCompatibility/PHPCompatibility) standard to perform deep static analysis of your PHP code.

**Core Components:**

1. **Dependency Management**: Uses Composer to install PHP_CodeSniffer and PHPCompatibility ruleset
2. **Batch Processing**: Scans files in configurable batches (10-100 files) to manage memory usage
3. **Command Execution**: Executes PHPCS via PHP's `exec()` function with specific parameters
4. **Server-Side State**: Stores file lists in WordPress options to optimize AJAX requests
5. **Progressive UI**: Real-time batch results with stop/start controls

**Scanning Process:**

1. User selects plugins/themes to scan
2. Plugin discovers all PHP files in selected directories
3. Files are divided into batches (avoiding command-line length limits)
4. Each batch is processed via: `phpcs --standard=PHPCompatibility [files]`
5. Results are parsed and displayed with error/warning counts
6. Temporary files are created in `wp-content/uploads/phpcompat-temp/`

**Why It Requires Development Environments**

* **`exec()` Function**: Required to run PHPCS binary - disabled on managed hosts
* **PHP Binary Access**: Needs access to PHP executable - restricted on shared hosting
* **Composer Dependencies**: Requires vendor directory with PHPCS installation
* **File System Access**: Creates temporary files for batch processing
* **Memory/Time Limits**: Long-running scans need relaxed execution limits

**Supported Environments**

* **LocalWP** (recommended)
* **XAMPP/MAMP**
* **Docker WordPress** setups
* **Self-hosted** VPS/dedicated servers
* **Development** environments with shell access

**Unsupported Environments**

* **WP Engine** (exec() disabled)
* **Kinsta** (security restrictions)
* **SiteGround** (managed hosting limitations)
* **GoDaddy Managed WordPress** (function restrictions)
* **WordPress.com** (no plugin uploads)
* Most **shared hosting** providers

== Installation ==

**Prerequisites**

* **Development Environment**: LocalWP, XAMPP, MAMP, or self-hosted server
* **PHP 7.4+**: Required for plugin operation
* **WordPress 4.5+**: Minimum WordPress version

**Setup Instructions**

1. **Download/Install** the plugin to your `wp-content/plugins/` directory
2. **Activate Plugin** in WordPress Admin → Plugins
3. **Access Tool** via WordPress Admin → Tools → PHP Compatibility

**Note**: All required dependencies (PHP_CodeSniffer and PHPCompatibility) are included with the plugin - no additional setup required!

== Frequently Asked Questions ==

= What is this plugin for? =

This plugin helps WordPress developers check if their custom code (plugins and themes) will work with different PHP versions. It's especially useful when planning to upgrade PHP on production servers or when developing for clients with specific PHP version requirements.

= Why won't it work on my hosting provider? =

Most managed hosting providers (WP Engine, Kinsta, SiteGround, etc.) disable the `exec()` function for security reasons. This plugin needs to run PHP commands to analyze your code, which requires this function to be enabled.

= What PHP versions can I test against? =

The plugin can test your code against PHP versions 7.4 through 8.4, helping you identify compatibility issues before upgrading.

= How accurate are the results? =

Very accurate! The plugin uses the official PHPCompatibility ruleset, which is the industry standard for PHP version compatibility testing. It catches both deprecated features and breaking changes.

= Can I scan multiple plugins at once? =

Yes! You can select multiple plugins and themes to scan simultaneously. The plugin processes them in batches to manage memory usage efficiently.

= What if the scan takes too long? =

The plugin includes stop/resume functionality. You can cancel a long-running scan at any time and resume it later. You can also adjust batch sizes to optimize performance.

= Are my files modified during scanning? =

No, your files are never modified. The plugin only reads your code to analyze it. Any temporary files created during scanning are automatically cleaned up.

== Screenshots ==

1. Main scanning interface showing plugin/theme selection and configuration options
2. Real-time progress display with batch processing status
3. Results view showing compatibility issues organized by file
4. Detailed error/warning display with line numbers and descriptions

== Changelog ==

= 1.0.0 =
* Initial release
* PHP compatibility scanning using PHPCompatibility standard
* Modern, responsive user interface
* Batch processing for large codebases
* Real-time progress updates
* Stop/resume functionality
* Vendor directory exclusion
* Support for PHP versions 7.4-8.4

== Upgrade Notice ==

= 1.0.0 =
Initial release with comprehensive PHP compatibility checking features. Perfect for WordPress developers working in development environments who need to ensure their code works across different PHP versions.

== Roadmap ==

**Upcoming Features**

* **Hosted Environment Support**: Explore implementing a pure PHP compatibility checker that doesn't require external binaries, enabling the plugin to work on managed hosting providers
* **CI/CD Integration**: Command-line interface for automated testing
* **Performance Optimization**: Further improvements to scanning speed and memory usage
* **Additional Standards**: Support for other coding standards beyond PHPCompatibility

== Contributing ==

This plugin is actively developed for WordPress development environments. Contributions are welcome, especially:

* Additional PHP version compatibility rules
* Performance optimizations
* UI/UX improvements
* Hosted environment compatibility solutions

== Technical Details ==

**Dependencies**

* **PHP_CodeSniffer**: ^3.13 (static analysis engine)
* **PHPCompatibility**: dev-develop (compatibility ruleset)

**License**

GPLv2 or later - same as WordPress core.
