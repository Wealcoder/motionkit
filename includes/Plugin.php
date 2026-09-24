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
use MotionKit\Common\AnimationResolver;
use MotionKit\Common\PageType;
use MotionKit\Common\ShareContext;
use MotionKit\Common\ShareLinks;
use MotionKit\Admin\PermalinkNotice;
use MotionKit\Admin\ConnectPage;
use MotionKit\Includes\Autoloader;
use MotionKit\Factory\ComponentFactory;
use MotionKit\Helpers\Helper;


/**
 * Main Plugin Class
 *
 * Handles plugin initialization, activation, and deactivation.
 */
final class Plugin
{
    /**
     * Plugin version — sourced from the plugin bootstrap constant so the header, constant, and class always agree on one number.
     */
    public const VERSION = MOTIONKIT_VERSION;

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
     * Per-request memo for the resolved share link.
     *
     * `false` means not resolved yet; null means resolved to no valid link.
     *
     * @var ShareContext|null|false
     */
    private $share_context_cache = false;

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
     * Backend instance
     *
     * @var Backend|null
     */
    private ?Backend $backend = null;

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
        // Send platform identification header for MotionKit detect-platform
        add_action('send_headers', [$this, 'send_platform_header']);

        // Initialize REST API & Editor Bridge
        (new \MotionKit\RestApi\RestApi())->init();
        (new \MotionKit\Frontend\EditorBridge())->init();

        // Initialize components (lazy loading)
        $this->init_auth();
        $this->init_backend();
        $this->init_admin_notices();

        // Admin bar node only renders on the frontend (add_admin_bar_build_animation
        // bails on is_admin()), so its CSS only needs to load there too.
        add_action('admin_bar_menu', [$this, 'add_admin_bar_build_animation'], 100);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_admin_bar_css']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_waapi_runtime']);

        // Cache bypass is decided from the query string alone, before anything is resolved — a full-page cache writes its entry long before wp_enqueue_scripts runs, so deciding later would let a share response be stored and then served to ordinary visitors.
        $this->block_page_cache_for_share();

        // Lowercase per WP hook conventions; the uppercase name is the double-load guard constant, not this hook.
        do_action('motionkit_loaded');
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
     * Initialize the Connect dashboard page and authentication handler.
     *
     * @return void
     */
    private function init_auth(): void
    {
        if (is_admin()) {
            (new \MotionKit\Auth\OAuthHandler())->init();

            $connect_page = new ConnectPage();
            $connect_page->init();

            (new \MotionKit\Admin\AnimationsDataHandler())->init();
        }
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

        // The daily license-refresh cron is owned (scheduled, run, and unscheduled) by the connector plugin — deactivating this UI plugin must not stop the still-active connector's refresh.

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

        // An unconnected site is sent to the Connect page instead of the editor, which is the step it is actually missing — see Helper::editor_launch_url().
        $reachable = Helper::is_editor_reachable();
        $editor_url = Helper::editor_launch_url($page_url);

        $icon = '<span class="motionkit-ab-icon"></span>';
        $title = $icon . '<span class="motionkit-ab-label">' . esc_html__('Build Animation', 'motionkit') . '</span>';

        $wp_admin_bar->add_node(array(
            'id'    => 'motionkit-build-animation',
            'title' => $title,
            'href'  => esc_url($editor_url),
            'meta'  => $reachable
                ? array(
                    'target' => '_blank',
                    'title'  => esc_html__('Motionkit Editor', 'motionkit'),
                )
                : array(
                    'title'  => esc_html__('Connect this site to MotionKit first', 'motionkit'),
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
     * Enqueue the lightweight native WAAPI runtime for Free animations on the frontend.
     *
     * Adheres to WordPress.org standards:
     * - Unique prefix for script handle: 'motionkit-waapi'
     * - Unique prefix for localized object: 'motionkitWaapiData'
     * - Unique prefix for filters: 'motionkit_waapi_animations'
     * - Zero external CDN dependencies, 100% native Web Animations API.
     *
     * @return void
     */
    public function enqueue_waapi_runtime(): void
    {
        if (is_admin()) {
            return;
        }

        $file_path = $this->plugin_dir . 'assets/build/motionkit-waapi.js';
        if (!file_exists($file_path)) {
            return;
        }

        // Only the free animations reach this runtime. A page whose animations are all GSAP would otherwise enqueue the bundle and localize every record for it, and the browser would then filter them all away and play nothing — a script and a payload for no work.
        $animations = \MotionKit\Common\AnimationEngine::filter_waapi(
            $this->get_frontend_animations()
        );

        /**
         * Filter frontend animations to be handled by the MotionKit WAAPI engine.
         *
         * @param array $animations Resolved list of animations.
         */
        $animations = apply_filters('motionkit_waapi_animations', $animations);

        // Read-only query flags for frontend preview detection.
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        $is_preview = isset($_GET['motionkit_preview']) || isset($_GET['motionkit_editor']) || isset($_GET['aae_preview']);
        if (empty($animations) && !$is_preview) {
            return;
        }

        $version = defined('MOTIONKIT_VERSION') ? MOTIONKIT_VERSION : '1.0.0';

        wp_register_script(
            'motionkit-waapi',
            plugins_url('assets/build/motionkit-waapi.js', $this->plugin_file),
            [],
            $version,
            true
        );

        $payload = [
            'animations' => $animations,
            'isRtl'      => is_rtl(),
            'debug'      => defined('WP_DEBUG') && WP_DEBUG,
        ];

        wp_localize_script('motionkit-waapi', 'motionkitWaapiData', $payload);
        wp_enqueue_script('motionkit-waapi');
    }

    /**
     * Retrieve the animations the current frontend request renders.
     *
     * Published only — the draft half of each bucket never reaches a visitor.
     * A valid share token swaps in the link's own copies of saved records;
     * everything else on the page stays exactly what a visitor sees, and an
     * absent or dead token falls through to published.
     *
     * @return array List of animation objects.
     */
    public function get_frontend_animations(): array
    {
        // Read from the same slot the editor saved to: the front page is a post of type "page" but is stored under "front_page", and archives, search and 404 have no post at all.
        $page_type_config = PageType::current();

        $share = $this->share_context($page_type_config);

        return $share === null
            ? AnimationResolver::published($page_type_config)
            : AnimationResolver::for_share($page_type_config, $share);
    }

    /**
     * Whether this request carries a share token, valid or not.
     *
     * Deliberately shape-blind — cache decisions are made from this, and a bad
     * token skipping the cache costs one uncached response while a good token
     * landing in the cache would leak a draft to everyone.
     *
     * @return bool
     */
    private function is_share_preview(): bool
    {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        $key = isset($_GET['motionkit_share']) ? 'motionkit_share' : ShareLinks::QUERY_PARAM;
        return isset($_GET[$key])
            && is_string($_GET[$key])
            && $_GET[$key] !== '';
    }

    /**
     * Keep share responses out of every cache layer we can reach.
     *
     * The connector blocks the same way on a site running both plugins; the
     * constant and the headers are idempotent, so doing it twice costs nothing.
     *
     * @return void
     */
    private function block_page_cache_for_share(): void
    {
        if (!$this->is_share_preview()) {
            return;
        }

        // The constant is what LiteSpeed, WP Rocket, W3TC and friends look for; it has to be set before they decide to buffer the response.
        if (!defined('DONOTCACHEPAGE')) {
            define('DONOTCACHEPAGE', true);
        }

        add_action('send_headers', [$this, 'send_share_nocache_headers']);
    }

    /**
     * No-store headers for a share response.
     *
     * @return void
     */
    public function send_share_nocache_headers(): void
    {
        if (!$this->is_share_preview() || headers_sent()) {
            return;
        }

        nocache_headers();
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
    }

    /**
     * Resolve the share token against this page's rows, memoized per request.
     *
     * @param array $page_type_config Descriptor from PageType::current().
     * @return ShareContext|null
     */
    private function share_context(array $page_type_config): ?ShareContext
    {
        if ($this->share_context_cache !== false) {
            return $this->share_context_cache;
        }

        if (!$this->is_share_preview()) {
            return $this->share_context_cache = null;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        $key = isset($_GET['motionkit_share']) ? 'motionkit_share' : ShareLinks::QUERY_PARAM;
        $token = isset($_GET[$key]) ? sanitize_text_field(wp_unslash($_GET[$key])) : '';

        return $this->share_context_cache = ShareLinks::resolve($page_type_config, $token);
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

