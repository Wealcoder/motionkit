<?php

/**
 * Plugin Name: Motionkit – Visual GSAP Animation for WordPress
 * Plugin URI: https://motionkit.io
 * Description: Connects your site to the Motionkit visual editor so you can build GSAP-powered scroll, hover, and page-transition animations without writing code.
 * Version: 0.5.2
 * Author: wealcoder
 * Author URI: https://profiles.wordpress.org/wealcoder/
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: motionkit
 * Domain Path: /languages
 * Requires at least: 6.7
 * Tested up to: 7.0
 * Requires PHP: 7.4
 *
 * @package MotionKit
 * @since 1.0.0
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants
define( 'MOTIONKIT_VERSION', '1.0.0' );
define( 'MOTIONKIT_PLUGIN_FILE', __FILE__ );
define( 'MOTIONKIT_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'MOTIONKIT_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'MOTIONKIT_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

// Check if plugin is already loaded
if ( defined( 'MOTIONKIT_LOADED' ) ) {
	return;
}

define( 'MOTIONKIT_LOADED', true );

// Public API for other plugins and themes. Loaded before the plugin class so
// the functions exist from the moment this file is included — an integration
// hooking 'plugins_loaded' at any priority can call them, rather than having
// to guess when MotionKit finished booting.
require_once MOTIONKIT_PLUGIN_DIR . 'includes/api-functions.php';

// Load the main plugin class
require_once MOTIONKIT_PLUGIN_DIR . 'includes/Plugin.php';

// Initialize the plugin
MotionKit\Plugin::get_instance( MOTIONKIT_PLUGIN_FILE );
