<?php

namespace WcfAnimationBuilder\Compatibility;

/**
 * Compatibility Class
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Compatibility Class
 *
 * Handles compatibility with other plugins and themes.
 */
final class Compatibility
{
    /**
     * Initialize compatibility checks
     *
     * @return void
     */
    public function init(): void
    {
        $this->init_hooks();
        $this->check_compatibility();
    }

    /**
     * Initialize hooks
     *
     * @return void
     */
    private function init_hooks(): void
    {
        // Add compatibility hooks here
        add_action('plugins_loaded', [$this, 'load_compatibility_fixes'], 20);
    }

    /**
     * Check compatibility with other plugins/themes
     *
     * @return void
     */
    private function check_compatibility(): void
    {
        // Check for common compatibility issues
        $this->check_theme_compatibility();
        $this->check_plugin_compatibility();
    }

    /**
     * Check theme compatibility
     *
     * @return void
     */
    private function check_theme_compatibility(): void
    {
        // Add theme compatibility checks here
    }

    /**
     * Check plugin compatibility
     *
     * @return void
     */
    private function check_plugin_compatibility(): void
    {
        // Add plugin compatibility checks here
    }

    /**
     * Load compatibility fixes
     *
     * @return void
     */
    public function load_compatibility_fixes(): void
    {
        // Load compatibility fixes here
        $this->load_elementor_compatibility();
        $this->load_gutenberg_compatibility();
    }

    /**
     * Load Elementor compatibility
     *
     * @return void
     */
    private function load_elementor_compatibility(): void
    {
        if (!defined('ELEMENTOR_VERSION')) {
            return;
        }

        // Add Elementor compatibility fixes here
    }

    /**
     * Load Gutenberg compatibility
     *
     * @return void
     */
    private function load_gutenberg_compatibility(): void
    {
        if (!function_exists('register_block_type')) {
            return;
        }

        // Add Gutenberg compatibility fixes here
    }
}

