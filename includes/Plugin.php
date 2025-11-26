<?php

namespace WcfAnimationBuilder;

/**
 * Main Plugin Class
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

use WcfAnimationBuilder\Backend\Backend;
use WcfAnimationBuilder\Frontend\Frontend;
use WcfAnimationBuilder\Includes\Autoloader;
use WcfAnimationBuilder\Compatibility\Compatibility;
use WcfAnimationBuilder\Factory\ComponentFactory;
use WcfAnimationBuilder\Common\AnimationBuilderCore;

/**
 * Main Plugin Class
 *
 * Handles plugin initialization, activation, and deactivation.
 */
final class Plugin
{
    /**
     * Plugin version
     */
    public const VERSION = '1.0.0';

    /**
     * Plugin name
     */
    public const PLUGIN_NAME = 'GSAP Animation Builder for WordPress';

    /**
     * Plugin slug
     */
    public const PLUGIN_SLUG = 'gsap-animation-builder-for-wordpress';
    

    /**
     * Plugin instance
     *
     * @var Plugin|null
     */
    private static ?Plugin $instance = null;

    /**
     * Plugin file path
     *
     * @var string
     */
    private string $plugin_file;

    /**
     * Plugin directory path
     *
     * @var string
     */
    private string $plugin_dir;

    /**
     * Plugin URL
     *
     * @var string
     */
    private string $plugin_url;

    /**
     * Autoloader instance
     *
     * @var Autoloader
     */
    private Autoloader $autoloader;

    /**
     * Frontend instance
     *
     * @var Frontend|null
     */
    private ?Frontend $frontend = null;

    /**
     * Backend instance
     *
     * @var Backend|null
     */
    private ?Backend $backend = null;
    /**
     * AnimationBuilderCore instance
     *
     * @var AnimationBuilderCore|null
     */
    private ?AnimationBuilderCore $buildercore = null;

    /**
     * Compatibility instance
     *
     * @var Compatibility|null
     */
    private ?Compatibility $compatibility = null;

    /**
     * Constructor
     *
     * @param string $plugin_file The main plugin file path
     */
    private function __construct(string $plugin_file)
    {
        $this->plugin_file = $plugin_file;
        $this->plugin_dir = plugin_dir_path($plugin_file);
        $this->plugin_url = plugin_dir_url($plugin_file);

        $this->init_autoloader();
        $this->init_hooks();
    }

    /**
     * Get plugin instance
     *
     * @param string $plugin_file The main plugin file path
     * @return Plugin The plugin instance
     */
    public static function get_instance(string $plugin_file): Plugin
    {
        if (null === self::$instance) {
            self::$instance = new self($plugin_file);
        }

        return self::$instance;
    }

    /**
     * Initialize autoloader
     *
     * @return void
     */
    private function init_autoloader(): void
    {
        require_once $this->plugin_dir . 'includes/Autoloader.php';
        
        $this->autoloader = new Autoloader($this->plugin_dir . 'includes/');
        $this->autoloader->register();
    }

    /**
     * Initialize hooks
     *
     * @return void
     */
    private function init_hooks(): void
    {
        add_action('plugins_loaded', [$this, 'init'], 10);
        add_action('init', [$this, 'load_textdomain'], 10);
        
        register_activation_hook($this->plugin_file, [$this, 'activate']);
        register_deactivation_hook($this->plugin_file, [$this, 'deactivate']);
    }

    /**
     * Initialize plugin
     *
     * @return void
     */
    public function init(): void
    {
        // Performance optimization: Skip initialization on certain requests
        // if ($this->should_skip_init()) {
        //     return;
        // }
       
        // Initialize components (lazy loading)
        $this->init_compatibility();
        $this->init_frontend();
        $this->init_backend();

        $this->init_animation_builder_core();
        
        do_action('WCF_ANIMATION_BUILDER_LOADED');
    }

    /**
     * Check if initialization should be skipped
     *
     * @return bool True if should skip, false otherwise
     */
    private function should_skip_init(): bool
    {
        // Skip on AJAX requests unless it's our AJAX
        if (defined('DOING_AJAX') && DOING_AJAX) {
            return !isset($_REQUEST['action']) || strpos(sanitize_text_field( wp_unslash($_REQUEST['action'] )), 'wcf_animation_builder') === false;
        }

        // Skip on cron requests
        if (defined('DOING_CRON') && DOING_CRON) {
            return true;
        }

        return false;
    }

    /**
     * Initialize frontend functionality
     *
     * @return void
     */
    private function init_frontend(): void
    {
        // Only initialize frontend on frontend requests
        if (is_admin()) {
            return;
        }

        $this->frontend = ComponentFactory::create_frontend();
        $this->frontend->init();
    }

    /**
     * Initialize animation builder core
     *
     * @return void
     */
    private function init_animation_builder_core(): void
    {
        $this->buildercore = AnimationBuilderCore::instance();
        $this->buildercore->init();
    }

    /**
     * Initialize backend functionality
     *
     * @return void
     */
    private function init_backend(): void
    {
        if (is_admin()) {
            $this->backend = ComponentFactory::create_backend();
            $this->backend->init();
        }
    }

    /**
     * Initialize compatibility
     *
     * @return void
     */
    private function init_compatibility(): void
    {
        $this->compatibility = ComponentFactory::create_compatibility();
        $this->compatibility->init();
    }

    /**
     * Load plugin textdomain
     *
     * @return void
     */
    public function load_textdomain(): void
    {  
        
        //load_textdomain($domain, $mo_file);
    }

    /**
     * Plugin activation
     *
     * @return void
     */
    public function activate(): void
    {
        // Set default options
        $this->set_default_options();
        
        // Flush rewrite rules
        flush_rewrite_rules();
        update_option('wcf_animation_builder_version', self::VERSION);
        update_option('wcf_animation_builder_creation_date', gmdate('Y-m-d H:i:s'));
        do_action('wcf_animation_builder_activated');
    }

    /**
     * Plugin deactivation
     *
     * @return void
     */
    public function deactivate(): void
    {
        // Flush rewrite rules
        flush_rewrite_rules();
        
        do_action('wcf_animation_builder_deactivated');
    }

    /**
     * Set default options
     *
     * @return void
     */
    private function set_default_options(): void
    {
        $default_options = [
            'enable_animation_builder' => 'yes',
            'default_animation_style' => 'fade',
            'enable_custom_animations' => 'yes',
        ];

        // Get existing options directly to merge with defaults
        $existing_options = get_option('wcf_animation_builder_options', []);
        $options = array_merge($default_options, $existing_options);
        
        // Update options and clear cache
        update_option('wcf_animation_builder_options', $options);
        \WcfAnimationBuilder\Helpers\Helper::clear_options_cache();
    }

    /**
     * Get plugin file path
     *
     * @return string The plugin file path
     */
    public function get_plugin_file(): string
    {
        return $this->plugin_file;
    }

    /**
     * Get plugin directory path
     *
     * @return string The plugin directory path
     */
    public function get_plugin_dir(): string
    {
        return $this->plugin_dir;
    }

    /**
     * Get plugin URL
     *
     * @return string The plugin URL
     */
    public function get_plugin_url(): string
    {
        return $this->plugin_url;
    }

    /**
     * Get frontend instance
     *
     * @return Frontend|null The frontend instance
     */
    public function get_frontend(): ?Frontend
    {
        return $this->frontend;
    }

    /**
     * Get backend instance
     *
     * @return Backend|null The backend instance
     */
    public function get_backend(): ?Backend
    {
        return $this->backend;
    }

    /**
     * Prevent cloning of the instance (Singleton pattern)
     *
     * @return void
     */
    private function __clone() {}

    /**
     * Prevent unserialization of the instance (Singleton pattern)
     *
     * @return void
     */
    public function __wakeup()
    {
        throw new \Exception('Cannot unserialize singleton');
    }
}

