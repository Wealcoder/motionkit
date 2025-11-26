<?php

namespace WcfAnimationBuilder\Backend;

/**
 * Backend Class
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

use WcfAnimationBuilder\Common\Assets\AssetLoader;
use WcfAnimationBuilder\Factory\ComponentFactory;

/**
 * Backend Class
 *
 * Handles all admin functionality for the plugin.
 */
final class Backend
{
    /**
     * Asset loader instance
     *
     * @var AssetLoader
     */
    private AssetLoader $asset_loader;

    /**
     * Initialize backend functionality
     *
     * @return void
     */
    public function init(): void
    {
        $this->asset_loader = ComponentFactory::create_asset_loader();
        $this->init_hooks();
    }

    /**
     * Initialize hooks
     *
     * @return void
     */
    private function init_hooks(): void
    {
        // Add admin hooks here
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('admin_menu', [$this, 'add_admin_menu']);
    }

    /**
     * Enqueue admin scripts and styles
     *
     * @param string $hook The current admin page hook
     * @return void
     */
    public function enqueue_admin_assets(string $hook): void
    {
        // Load backend.js on all admin pages
        $this->asset_loader->enqueue_script(
            'wcf-backend-script',
            'assets/js/backend.js',
            ['jquery'],
            true
        );

        // Localize backend script with data
        $this->asset_loader->localize_script(
            'wcf-backend-script',
            'wcfAnimationBuilderAdmin',
            [
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => \WcfAnimationBuilder\Helpers\Helper::create_nonce(),
                'version' => \WcfAnimationBuilder\Helpers\Helper::get_plugin_version(),
                'hook' => $hook,
            ]
        );

        // Condition: Only load preview.js on post edit pages (post.php or post-new.php)
        if ($this->is_post_edit_page($hook)) {
            $this->asset_loader->enqueue_script(
                'wcf-preview-script',
                'assets/js/preview.js',
                ['jquery', 'wcf-backend-script'],
                true
            );

            // Localize preview script with data
            $this->asset_loader->localize_script(
                'wcf-preview-script',
                'wcfAnimationBuilderPreview',
                [
                    'ajaxUrl' => admin_url('admin-ajax.php'),
                    'nonce' => \WcfAnimationBuilder\Helpers\Helper::create_nonce(),
                ]
            );
        }

        // Condition: Load assets only on specific post types
        // if ($this->is_specific_post_type('product')) {
        //     $this->asset_loader->enqueue_style('wcf-product-style', 'assets/css/product.css');
        // }
    }

    /**
     * Check if current page is post edit page
     *
     * @param string $hook The current admin page hook
     * @return bool True if post edit page, false otherwise
     */
    private function is_post_edit_page(string $hook): bool
    {
        global $pagenow;
        return in_array($pagenow, ['post.php', 'post-new.php'], true);
    }

    /**
     * Check if current page is for specific post type
     *
     * @param string $check_post_type Post type to check
     * @return bool True if current post type matches, false otherwise
     */
    private function is_specific_post_type(string $check_post_type): bool
    {
        global $post_type;
        return isset($post_type) && $post_type === $check_post_type;
    }

    /**
     * Check if current admin page is specific screen
     *
     * @param string $hook The current admin page hook
     * @param string|array $screen_ids Screen ID(s) to check
     * @return bool True if matches, false otherwise
     */
    private function is_screen(string $hook, $screen_ids): bool
    {
        $screen = get_current_screen();
        if (!$screen) {
            return false;
        }

        $screen_ids = is_array($screen_ids) ? $screen_ids : [$screen_ids];
        return in_array($screen->id, $screen_ids, true) || in_array($hook, $screen_ids, true);
    }
    
    /**
     * Get asset loader instance
     *
     * @return AssetLoader Asset loader instance
     */
    public function get_asset_loader(): AssetLoader
    {
        return $this->asset_loader;
    }

    /**
     * Add admin menu
     *
     * @return void
     */
    public function add_admin_menu(): void
    {
        // Add admin menu items here
    }
}

