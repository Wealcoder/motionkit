<?php

namespace MotionKit;

/**
 * Main Plugin Class
 *
 * @package MotionKit
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

use MotionKit\Backend\Backend;
use MotionKit\Frontend\Frontend;
use MotionKit\RestApi\RestApi;
use MotionKit\Admin\PermalinkNotice;
use MotionKit\Auth\OAuthHandler;
use MotionKit\Auth\ConnectPage;
use MotionKit\Auth\LicenseStatus;
use MotionKit\Includes\Autoloader;
use MotionKit\Factory\ComponentFactory;


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
    public const VERSION = '1.1.7';

    /**
     * Plugin name
     */
    public const PLUGIN_NAME = 'MotionKit';

    /**
     * Plugin slug
     */
    public const PLUGIN_SLUG = 'motionkit';
    

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
     * REST API instance
     *
     * @var RestApi|null
     */
    private ?RestApi $rest_api = null;

    /**
     * OAuth handler instance
     *
     * @var OAuthHandler|null
     */
    private ?OAuthHandler $oauth = null;

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
        // One-shot autoload migration — flips legacy option rows that were
        // saved with autoload=no but are read on every frontend request, so
        // they join the alloptions cache instead of triggering a SELECT per
        // page load. Sentinel-guarded to run exactly once per install.
        add_action('admin_init', [$this, 'maybe_fix_autoload_flags'], 5);

        register_activation_hook($this->plugin_file, [$this, 'activate']);
        register_deactivation_hook($this->plugin_file, [$this, 'deactivate']);
    }

    /**
     * Flip autoload=yes on hot-path options that were originally written with
     * autoload=no. WP only honors the flag on first-create, so existing rows
     * stay autoload=no forever unless we update wp_options.autoload directly.
     *
     * Cheap: one indexed UPDATE against wp_options, gated by a sentinel.
     *
     * @return void
     */
    public function maybe_fix_autoload_flags(): void
    {
        if (get_option('motionkit_autoload_fixed_v1') === '1') {
            return;
        }

        global $wpdb;
        $hot_options = ['motionkit_page_settings_updated_at'];
        $placeholders = implode(',', array_fill(0, count($hot_options), '%s'));
        // Single UPDATE rather than per-option get/delete/add cycles.
        $wpdb->query(
            $wpdb->prepare(
                "UPDATE {$wpdb->options} SET autoload = 'yes'
                 WHERE option_name IN ({$placeholders}) AND autoload != 'yes'",
                ...$hot_options
            )
        );
        wp_cache_delete('alloptions', 'options');
        update_option('motionkit_autoload_fixed_v1', '1', true);
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
       
        // Send platform identification header for MotionKit detect-platform
        add_action('send_headers', [$this, 'send_platform_header']);

        // Initialize components (lazy loading)
        $this->init_auth();
        $this->init_frontend();
        $this->init_backend();
        $this->init_rest_api();
        $this->init_admin_notices();

        // Admin bar node only renders on the frontend (add_admin_bar_build_animation
        // bails on is_admin()), so its CSS only needs to load there too.
        add_action('admin_bar_menu', [$this, 'add_admin_bar_build_animation'], 100);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_admin_bar_css']);

        do_action('MOTIONKIT_LOADED');
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
            return !isset($_REQUEST['action']) || strpos(sanitize_text_field( wp_unslash($_REQUEST['action'] )), 'motionkit_') === false;
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
     * Runs in all contexts: Frontend handles its own context checks —
     * wp_enqueue_scripts only fires on page loads, AJAX handlers
     * fire in admin context (admin-ajax.php).
     *
     * @return void
     */
    private function init_frontend(): void
    {
        $this->frontend = ComponentFactory::create_frontend();
        $this->frontend->init();
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
     * Initialize authentication (OAuth + Connect page)
     *
     * @return void
     */
    private function init_auth(): void
    {
        // Override connect URLs for local development      

        $this->oauth = new OAuthHandler();
        $this->oauth->init();

        // Keeps the connected account's license / site-limit state mirrored
        // locally. Registered outside the is_admin() branch below so the
        // daily WP-Cron refresh still runs — cron is not admin context.
        (new LicenseStatus())->init();

        if (is_admin()) {
            $connect_page = new ConnectPage($this->oauth);
            $connect_page->init();
        }
    }

    /**
     * Initialize REST API endpoints
     *
     * @return void
     */
    private function init_rest_api(): void
    {
        $this->rest_api = new RestApi();
        $this->rest_api->init();
    }

    /**
     * Register admin notices (permalink nag, etc.).
     */
    private function init_admin_notices(): void
    {
        if (is_admin()) {
            (new PermalinkNotice())->init();
        }
    }

    /**
     * Send X-Motionkit-Platform header so the SaaS detect-platform endpoint
     * can instantly identify WordPress sites with MotionKit installed.
     *
     * @return void
     */
    public function send_platform_header(): void
    {
        if (!headers_sent()) {
            header('X-Motionkit-Platform: wordpress');
        }
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
        // Flush rewrite rules so REST routes (/wp-json/motionkit/v1/...) work
        flush_rewrite_rules();
        update_option('motionkit_version', self::VERSION);
        update_option('motionkit_creation_date', gmdate('Y-m-d H:i:s'));
        do_action('motionkit_activated');
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

        // Don't leave the daily license refresh scheduled on a deactivated plugin.
        LicenseStatus::unschedule_cron();

        do_action('motionkit_deactivated');
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
        $existing_options = get_option('motionkit_options', []);
        $options = array_merge($default_options, $existing_options);
        
        // Update options and clear cache
        update_option('motionkit_options', $options);
        \MotionKit\Helpers\Helper::clear_options_cache();
    }

    /**
     * Add "Build Animation" link to the admin bar on all frontend pages.
     */
    public function add_admin_bar_build_animation($wp_admin_bar): void
    {
        if (is_admin() || !current_user_can('manage_options') ) {
            return;
        }

        // Resolve current page URL for all page types
        if (is_singular()) {
            $page_url = get_permalink();
        } elseif (is_front_page() || is_home()) {
            $page_url = home_url('/');
        } elseif (is_category() || is_tag() || is_tax()) {
            $page_url = get_term_link(get_queried_object());
            if (is_wp_error($page_url)) {
                $page_url = home_url(sanitize_text_field(wp_unslash($_SERVER['REQUEST_URI'] ?? '/')));
            }
        } elseif (is_author()) {
            $page_url = get_author_posts_url(get_queried_object_id());
        } elseif (is_post_type_archive()) {
            $page_url = get_post_type_archive_link(get_queried_object()->name);
        } elseif (is_archive()) {
            $page_url = home_url(sanitize_text_field(wp_unslash($_SERVER['REQUEST_URI'] ?? '/')));
        } elseif (is_search()) {
            $page_url = home_url('/?s=' . rawurlencode(get_search_query()));
        } elseif (is_404()) {
            $page_url = home_url('/404');
        } else {
            $page_url = home_url(sanitize_text_field(wp_unslash($_SERVER['REQUEST_URI'] ?? '/')));
        }

        // Always attach a session JWT — even before the site is connected,
        // JwtTokenManager falls back to a local HMAC-signed token, so the
        // editor preview never has to be reachable without one. This keeps
        // is_editor_preview()'s token check unconditional (no anonymous
        // fallback), instead of trusting ?action=motionkit-editor alone.
        $query_args = [
            'site'            => $page_url,
            'platform'        => 'wordpress',
            'motionkit_token' => \MotionKit\Auth\JwtTokenManager::generate($page_url),
        ];

        $editor_url = apply_filters('motionkit/editor/url', add_query_arg($query_args, 'https://editor.motionkit.io/'));

        $icon = '<span class="motionkit-ab-icon"></span>';
        $title = $icon . '<span class="motionkit-ab-label">' . esc_html__('Build Animation', 'motionkit') . '</span>';

        $wp_admin_bar->add_node(array(
            'id'    => 'motionkit-build-animation',
            'title' => $title,
            'href'  => esc_url($editor_url),
            'meta'  => array(
                'target' => '_blank',
                'title'  => esc_html__('Motionkit Editor', 'motionkit'),
            ),
        ));
    }

    /**
     * Enqueue the admin bar icon's CSS (frontend only — the node itself
     * only renders there, see add_admin_bar_build_animation()).
     */
    public function enqueue_admin_bar_css(): void
    {
        if (!is_admin_bar_showing() || !current_user_can('manage_options')) {
            return;
        }

        $version = defined('MOTIONKIT_VERSION') ? MOTIONKIT_VERSION : '1.0.0';

        wp_enqueue_style(
            'motionkit-admin-bar',
            plugins_url('assets/build/admin-bar.css', MOTIONKIT_PLUGIN_FILE),
            [],
            $version
        );

        // The icon URL is the only per-request dynamic piece; pass it as a
        // CSS custom property rather than templating it into the file itself.
        wp_add_inline_style(
            'motionkit-admin-bar',
            ':root{--motionkit-ab-icon-url:url(' . esc_url(MOTIONKIT_PLUGIN_URL . 'assets/images/Logo.png') . ');}'
        );
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

