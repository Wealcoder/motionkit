<?php

namespace WcfAnimationBuilder\Helpers;

/**
 * Helper Functions Class
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Helper Functions Class
 *
 * Provides utility functions for the plugin.
 */
final class Helper
{

    /**
     * Cached options to avoid duplicate queries
     *
     * @var array|null
     */
    private static ?array $cached_options = null;

    /**
     * Get plugin option
     *
     * @param string $key Option key
     * @param mixed $default Default value
     * @return mixed Option value
     */
    public static function get_option(string $key, $default = null)
    {
        if (null === self::$cached_options) {
            self::$cached_options = get_option('wcf_animation_builder_options', []);
        }
        return self::$cached_options[$key] ?? $default;
    }

    /**
     * Update plugin option
     *
     * @param string $key Option key
     * @param mixed $value Option value
     * @return bool True if option was updated, false otherwise
     */
    public static function update_option(string $key, $value): bool
    {
        if (null === self::$cached_options) {
            self::$cached_options = get_option('wcf_animation_builder_options', []);
        }
        self::$cached_options[$key] = $value;
        return update_option('wcf_animation_builder_options', self::$cached_options);
    }

    /**
     * Clear cached options
     *
     * @return void
     */
    public static function clear_options_cache(): void
    {
        self::$cached_options = null;
    }

    /**
     * Get plugin version
     *
     * @return string Plugin version
     */
    public static function get_plugin_version(): string
    {
        return MOTIONKIT_VERSION;
    }

    /**
     * Log debug message
     *
     * @param string $message Debug message
     * @param string $level Log level
     * @return void
     */
    public static function log(string $message, string $level = 'info'): void
    {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log(sprintf('[GSAP Animation Builder] %s: %s', strtoupper($level), $message));
        }
    }
}
