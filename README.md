# PHP Compatibility Checker for WordPress

A comprehensive WordPress plugin that scans your plugins and themes for PHP version compatibility issues using the industry-standard PHPCompatibility ruleset.

## ⚠️ Important: Development Environment Only

**This plugin is designed for development environments like LocalWP, XAMPP, or self-hosted servers.** It will **not work** on most managed hosting providers (WP Engine, Kinsta, SiteGround, etc.) due to security restrictions that disable the `exec()` function and limit access to PHP binaries.

## How It Works

### Technical Overview

This plugin leverages [PHP_CodeSniffer](https://github.com/squizlabs/PHP_CodeSniffer) with the [PHPCompatibility](https://github.com/PHPCompatibility/PHPCompatibility) standard to perform deep static analysis of your PHP code.

**Core Components:**

1. **Dependency Management**: Uses Composer to install PHP_CodeSniffer and PHPCompatibility ruleset
2. **Batch Processing**: Scans files in configurable batches (10-100 files) to manage memory usage
3. **Command Execution**: Executes PHPCS via PHP's `exec()` function with specific parameters
4. **Server-Side State**: Stores file lists in WordPress options to optimize AJAX requests
5. **Progressive UI**: Real-time batch results with stop/start controls

**Scanning Process:**

```
1. User selects plugins/themes to scan
2. Plugin discovers all PHP files in selected directories
3. Files are divided into batches (avoiding command-line length limits)
4. Each batch is processed via: phpcs --standard=PHPCompatibility [files]
5. Results are parsed and displayed with error/warning counts
6. Temporary files are created in wp-content/uploads/phpcompat-temp/
```

### Why It Requires Development Environments

-   **`exec()` Function**: Required to run PHPCS binary - disabled on managed hosts
-   **PHP Binary Access**: Needs access to PHP executable - restricted on shared hosting
-   **Composer Dependencies**: Requires vendor directory with PHPCS installation
-   **File System Access**: Creates temporary files for batch processing
-   **Memory/Time Limits**: Long-running scans need relaxed execution limits

## Installation

### Prerequisites

-   **Development Environment**: LocalWP, XAMPP, MAMP, or self-hosted server
-   **PHP 7.4+**: Required for plugin operation
-   **WordPress 4.5+**: Minimum WordPress version

### Setup Instructions

1. **Download/Install** the plugin to your `wp-content/plugins/` directory

2. **Activate Plugin** in WordPress Admin → Plugins

3. **Access Tool** via WordPress Admin → Tools → PHP Compatibility

**Note**: All required dependencies (PHP_CodeSniffer and PHPCompatibility) are included with the plugin - no additional setup required!

## Usage

### Basic Scanning

1. **Navigate** to Tools → PHP Compatibility in WordPress Admin
2. **Configure Options**:
    - **Target PHP Version**: Select the PHP version you want to test against (7.4 - 8.4)
    - **Batch Size**: Choose how many files to process per batch (50 recommended)
    - **Skip Vendor Directory**: Keep checked to exclude third-party dependencies
3. **Select Targets**: Check the plugins/themes you want to scan
4. **Start Scan**: Click "Start Scan" and monitor progress
5. **Review Results**: Each target shows error/warning counts with detailed file-by-file results

### Understanding Results

-   **✅ No issues found**: Code is compatible with target PHP version
-   **⚠️ X warnings**: Deprecated features that still work but should be updated
-   **❌ X errors**: Breaking changes that will cause failures in target PHP version

### Advanced Features

-   **Batch Processing**: Handles large codebases without memory issues
-   **Progressive Results**: See results as each batch completes
-   **Stop/Resume**: Cancel long-running scans at any time
-   **Vendor Exclusion**: Skip third-party code to focus on your custom code
-   **Server-Side Optimization**: Efficient state management for better performance

## System Requirements

### Supported Environments

-   **LocalWP** (recommended)
-   **XAMPP/MAMP**
-   **Docker WordPress** setups
-   **Self-hosted** VPS/dedicated servers
-   **Development** environments with shell access

### Unsupported Environments

-   **WP Engine** (exec() disabled)
-   **Kinsta** (security restrictions)
-   **SiteGround** (managed hosting limitations)
-   **GoDaddy Managed WordPress** (function restrictions)
-   **WordPress.com** (no plugin uploads)
-   Most **shared hosting** providers

## Troubleshooting

### "phpcs command not found"

-   Verify the plugin was installed correctly with all files intact
-   Check that `vendor/bin/phpcs` exists in the plugin directory
-   Ensure your development environment allows execution of PHP binaries

### "No PHP compatibility issues found" (when you expect issues)

-   Verify the target directory contains PHP files
-   Check that vendor exclusion is configured correctly
-   Ensure PHPCS has proper file permissions

### Scan Timeouts

-   Reduce batch size (try 25 or 10 files)
-   Enable vendor directory skipping
-   Scan smaller targets (individual plugins vs. all at once)

## Roadmap

### Upcoming Features

-   **Hosted Environment Support**: Explore implementing a pure PHP compatibility checker that doesn't require external binaries, enabling the plugin to work on managed hosting providers like WP Engine, Kinsta, and other restricted environments
-   **CI/CD Integration**: Command-line interface for automated testing
-   **Performance Optimization**: Further improvements to scanning speed and memory usage

## Contributing

This plugin is actively developed for WordPress development environments. Contributions are welcome, especially:

-   Additional PHP version compatibility rules
-   Performance optimizations
-   UI/UX improvements
-   Hosted environment compatibility solutions

## Technical Details

### Dependencies

-   **PHP_CodeSniffer**: ^3.13 (static analysis engine)
-   **PHPCompatibility**: dev-develop (compatibility ruleset)

### License

GPLv2 or later - same as WordPress core.
