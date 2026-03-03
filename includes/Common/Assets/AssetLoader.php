<?php

namespace WcfAnimationBuilder\Common\Assets;

/**
 * Common Asset Loader Class
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Common Asset Loader Class
 *
 * Handles loading of common assets (CSS, JS) that can be used by both backend and frontend.
 */
class AssetLoader
{
    /**
     * Plugin instance
     *
     * @var \WcfAnimationBuilder\Plugin|null
     */
    private ?\WcfAnimationBuilder\Plugin $plugin = null;

    /**
     * Asset version
     *
     * @var string
     */
    private string $version;

    /**
     * Asset handles registry (prevent duplicates)
     *
     * @var array<string, bool>
     */
    private static array $registered_handles = [];

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->version = MOTIONKIT_VERSION;
    }
    
    /**
     * Get plugin instance
     *
     * @return \WcfAnimationBuilder\Plugin Plugin instance
     */
    private function get_plugin_instance(): \WcfAnimationBuilder\Plugin
    {
        if (null === $this->plugin) {
            $this->plugin = \WcfAnimationBuilder\Plugin::get_instance(MOTIONKIT_PLUGIN_FILE);
        }
        return $this->plugin;
    }

    /**
     * Enqueue common CSS file
     *
     * @param string $handle Asset handle
     * @param string $file_path Relative path to the CSS file from plugin root
     * @param array $dependencies Dependencies array
     * @return void
     */
    public function enqueue_style(string $handle, string $file_path, array $dependencies = []): void
    {
        // Prevent duplicate enqueueing
        if (isset(self::$registered_handles[$handle])) {
            return;
        }

        wp_enqueue_style(
            $handle,
            $this->get_plugin_instance()->get_plugin_url() . $file_path,
            $dependencies,
            $this->version
        );

        self::$registered_handles[$handle] = true;
    }

    /**
     * Enqueue common JavaScript file
     *
     * @param string $handle Asset handle
     * @param string $file_path Relative path to the JS file from plugin root
     * @param array $dependencies Dependencies array
     * @param bool $in_footer Whether to load in footer
     * @return void
     */
    public function enqueue_script(string $handle, string $file_path, array $dependencies = [], bool $in_footer = true): void
    {
        // Prevent duplicate enqueueing
        if (isset(self::$registered_handles[$handle])) {
            return;
        }

        wp_enqueue_script(
            $handle,
            $this->get_plugin_instance()->get_plugin_url() . $file_path,
            $dependencies,
            $this->version,
            $in_footer
        );

        self::$registered_handles[$handle] = true;
    }

    /**
     * Localize script with data
     *
     * @param string $handle Script handle
     * @param string $object_name JavaScript object name
     * @param array $data Data to localize
     * @return void
     */
    public function localize_script(string $handle, string $object_name, array $data): void
    {
        wp_localize_script($handle, $object_name, $data);
    }

    /**
     * Add inline CSS
     *
     * @param string $handle Style handle
     * @param string $css CSS code
     * @return void
     */
    public function add_inline_style(string $handle, string $css): void
    {
        wp_add_inline_style($handle, $css);
    }

    /**
     * Register script (without enqueueing)
     *
     * @param string $handle Asset handle
     * @param string $file_path Relative path to the JS file from plugin root
     * @param array $dependencies Dependencies array
     * @param bool $in_footer Whether to load in footer
     * @return void
     */
    public function register_script(string $handle, string $file_path, array $dependencies = [], bool $in_footer = true): void
    {
        wp_register_script(
            $handle,
            $this->get_plugin_instance()->get_plugin_url() . $file_path,
            $dependencies,
            $this->version,
            $in_footer
        );
    }

    /**
     * Register style (without enqueueing)
     *
     * @param string $handle Asset handle
     * @param string $file_path Relative path to the CSS file from plugin root
     * @param array $dependencies Dependencies array
     * @return void
     */
    public function register_style(string $handle, string $file_path, array $dependencies = []): void
    {
        wp_register_style(
            $handle,
            $this->get_plugin_instance()->get_plugin_url() . $file_path,
            $dependencies,
            $this->version
        );
    }

    /**
     * Get plugin instance
     *
     * @return \WcfAnimationBuilder\Plugin Plugin instance
     */
    public function get_plugin(): \WcfAnimationBuilder\Plugin
    {
        return $this->get_plugin_instance();
    }

    /**
     * Get asset version
     *
     * @return string Asset version
     */
    public function get_version(): string
    {
        return $this->version;
    }
}

