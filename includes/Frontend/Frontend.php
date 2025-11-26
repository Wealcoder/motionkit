<?php

namespace WcfAnimationBuilder\Frontend;

/**
 * Frontend Class
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
use WcfAnimationBuilder\Helpers\Helper;

/**
 * Frontend Class
 *
 * Handles all frontend functionality for the plugin.
 */
final class Frontend
{
    /**
     * Asset loader instance
     *
     * @var AssetLoader
     */
    private AssetLoader $asset_loader;

    /**
     * Initialize frontend functionality
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
        // Asset loading
        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);
        
        // Template handling      
        add_filter('body_class', [$this, 'add_body_classes']);
    }

    /**
     * Enqueue frontend scripts and styles
     *
     * @return void
     */
    public function enqueue_scripts(): void
    {
        // Enqueue frontend JavaScript
        $this->asset_loader->enqueue_style(
            'wcf-animbuilder-class-selector',
            'assets/css/animbuilder-copy.css',
            [],
            true
        );
       
        // // Localize script with data
        // $this->asset_loader->localize_script(
        //     'wcf-frontend-script',
        //     'wcfAnimationBuilder',
        //     [
        //         'ajaxUrl' => admin_url('admin-ajax.php'),
        //         'nonce' => Helper::create_nonce(),
        //         'version' => Helper::get_plugin_version(),
        //     ]
        // );
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
     * Add custom body classes
     *
     * @param array $classes Existing body classes
     * @return array Modified body classes
     */
    public function add_body_classes(array $classes): array
    {
        // Add custom body classes here if needed
        return $classes;
    }

    /**
     * AJAX handler for getting animation data
     *
     * @return void
     */
    public function ajax_get_animation_data(): void
    {
        // Verify nonce
        $nonce = isset($_REQUEST['wcf_animation_builder_nonce']) 
            ? sanitize_text_field(wp_unslash($_REQUEST['wcf_animation_builder_nonce'])) 
            : '';
        
        if (!wp_verify_nonce($nonce, 'wcf_animation_builder_nonce')) {
            wp_send_json_error(['message' => __('Security check failed.', 'gsap-animation-builder-for-wordpress')]);
        }

        // Get and sanitize data
        $post_id = absint($_GET['post_id'] ?? 0);

        if (empty($post_id)) {
            wp_send_json_error(['message' => __('Invalid post ID.', 'gsap-animation-builder-for-wordpress')]);
        }

        // Get animation data
        $animation_data = get_post_meta($post_id, '_wcf_animation_data', true);
        
        if (empty($animation_data)) {
            wp_send_json_error(['message' => __('No animation data found.', 'gsap-animation-builder-for-wordpress')]);
        }

        wp_send_json_success($animation_data);
    }

    /**
     * AJAX handler for saving animation
     *
     * @return void
     */
    public function ajax_save_animation(): void
    {
        // Verify nonce
        $nonce = isset($_REQUEST['wcf_animation_builder_nonce']) 
            ? sanitize_text_field(wp_unslash($_REQUEST['wcf_animation_builder_nonce'])) 
            : '';
        
        if (!wp_verify_nonce($nonce, 'wcf_animation_builder_nonce')) {
            wp_send_json_error(['message' => __('Security check failed.', 'gsap-animation-builder-for-wordpress')]);
        }

        // Get and sanitize data
        $post_id = absint($_POST['post_id'] ?? 0);
        $animation_data = isset($_POST['animation_data']) ? sanitize_text_field(wp_unslash($_POST['animation_data'])) : '';

        if (empty($post_id) || empty($animation_data)) {
            wp_send_json_error(['message' => __('Invalid data provided.', 'gsap-animation-builder-for-wordpress')]);
        }

        // Save animation data
        update_post_meta($post_id, '_wcf_animation_data', $animation_data);

        wp_send_json_success(['message' => __('Animation saved successfully.', 'gsap-animation-builder-for-wordpress')]);
    }

    /**
     * Sanitize array recursively
     *
     * @param array $data Array to sanitize
     * @return array Sanitized array
     */
    private function sanitize_array(array $data): array
    {
        $sanitized = [];
        foreach ($data as $key => $value) {
            $key = sanitize_key($key);
            if (is_array($value)) {
                $sanitized[$key] = $this->sanitize_array($value);
            } else {
                $sanitized[$key] = sanitize_text_field(wp_unslash($value));
            }
        }
        return $sanitized;
    }
}

