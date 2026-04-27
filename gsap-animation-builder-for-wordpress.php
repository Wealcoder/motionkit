<?php
/**
 * Plugin Name: Motionkit Connector for WordPress
 * Plugin URI: https://github.com/your-username/motionkit
 * Description: A WordPress plugin that integrates the GSAP Animation Builder (Motionkit) to create and manage animations directly from the WordPress admin dashboard.
 * Version: 1.1.5
 * Author: wealcoder
 * Author URI: https://profiles.wordpress.org/your-username/
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: motionkit
 * Domain Path: /languages
 * Requires at least: 6.7
 * Tested up to: 6.9
 * Requires PHP: 7.4
 * 
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('MOTIONKIT_VERSION', '1.1.5');
define('MOTIONKIT_PLUGIN_FILE', __FILE__);
define('MOTIONKIT_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('MOTIONKIT_PLUGIN_URL', plugin_dir_url(__FILE__));
define('MOTIONKIT_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Check if plugin is already loaded
if (defined('MOTIONKIT_LOADED')) {
    return;
}

define('MOTIONKIT_LOADED', true);

// Load the main plugin class
require_once MOTIONKIT_PLUGIN_DIR . 'includes/Plugin.php';

// Initialize the plugin
WcfAnimationBuilder\Plugin::get_instance(MOTIONKIT_PLUGIN_FILE);

