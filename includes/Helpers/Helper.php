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
            // Use object cache if available for better performance
            self::$cached_options = Cache::remember(
                'wcf_animation_builder_options',
                fn() => get_option('wcf_animation_builder_options', []),
                3600 // Cache for 1 hour
            );
        }
        return self::$cached_options[$key] ?? $default;
    }

    public static function builder_body_class($cls = [])
    {
        $css_class = apply_filters('wcf_animation_builder_body_class', $cls);
        echo 'class="' . esc_attr(implode(' ', $css_class)) . '"';
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
        $result = update_option('wcf_animation_builder_options', self::$cached_options);
        return $result;
    }

    /**
     * Clear cached options (useful after bulk updates)
     *
     * @return void
     */
    public static function clear_options_cache(): void
    {
        self::$cached_options = null;
        Cache::delete('wcf_animation_builder_options');
    }  
   

    /**
     * Get plugin version
     *
     * @return string Plugin version
     */
    public static function get_plugin_version(): string
    {
        return WCF_ANIMATION_BUILDER_VERSION;
    }

    /**
     * Get plugin directory path
     *
     * @return string Plugin directory path
     */
    public static function get_plugin_dir(): string
    {
        return WCF_ANIMATION_BUILDER_PLUGIN_DIR;
    }

    /**
     * Get plugin URL
     *
     * @return string Plugin URL
     */
    public static function get_plugin_url(): string
    {
        return WCF_ANIMATION_BUILDER_PLUGIN_URL;
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

    /**
     * Get current user ID
     *
     * @return int User ID
     */
    public static function get_current_user_id(): int
    {
        return get_current_user_id();
    }

    /**
     * Check if user is logged in
     *
     * @return bool True if user is logged in, false otherwise
     */
    public static function is_user_logged_in(): bool
    {
        return is_user_logged_in();
    }

    /**
     * Get current page URL
     *
     * @return string Current page URL
     */
    public static function get_current_url(): string
    {
        global $wp;
        return home_url(add_query_arg([], $wp->request));
    }

    /**
     * Generate unique ID
     *
     * @return string Unique ID
     */
    public static function generate_unique_id(): string
    {
        return uniqid('gsap_', true);
    }

    /**
     * Validate email address
     *
     * @param string $email Email address
     * @return bool True if valid, false otherwise
     */
    public static function is_valid_email(string $email): bool
    {
        return is_email($email);
    }

    /**
     * Get file extension
     *
     * @param string $filename Filename
     * @return string File extension
     */
    public static function get_file_extension(string $filename): string
    {
        return strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    }

    /**
     * Check if file is image
     *
     * @param string $filename Filename
     * @return bool True if image, false otherwise
     */
    public static function is_image_file(string $filename): bool
    {
        $image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        $extension = self::get_file_extension($filename);
        
        return in_array($extension, $image_extensions, true);
    }

    /**
     * Get file size in human readable format
     *
     * @param int $bytes File size in bytes
     * @return string Human readable file size
     */
    public static function format_file_size(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Generate random string
     *
     * @param int $length String length
     * @return string Random string
     */
    public static function generate_random_string(int $length = 10): string
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $string = '';
        
        for ($i = 0; $i < $length; $i++) {
            $string .= $characters[wp_rand(0, strlen($characters) - 1)];
        }
        
        return $string;
    }
}

