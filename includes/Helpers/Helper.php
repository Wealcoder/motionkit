<?php

namespace MotionKit\Helpers;

/**
 * Helper Functions Class
 *
 * @package MotionKit
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
            self::$cached_options = get_option('motionkit_options', []);
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
            self::$cached_options = get_option('motionkit_options', []);
        }
        self::$cached_options[$key] = $value;
        return update_option('motionkit_options', self::$cached_options);
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
     * Cached .env pairs, parsed once per request
     *
     * @var array|null
     */
    private static ?array $cached_env = null;

    /**
     * Read a MOTIONKIT_* value from the plugin-root .env
     *
     * .env is gitignored and absent from releases, so this returns $default on
     * every customer install — the dev flags below are dev-machine only.
     *
     * @param string $key Env key
     * @param mixed $default Value when .env is missing or the key is unset
     * @return mixed Env value
     */
    public static function get_env(string $key, $default = null)
    {
        if (null === self::$cached_env) {
            self::$cached_env = self::parse_env_file(MOTIONKIT_PLUGIN_DIR . '.env');
        }
        return self::$cached_env[$key] ?? $default;
    }

    /**
     * Parse a KEY=value .env file
     *
     * Mirrors the loaders in webpack.config.js and scripts/copy-to-editor.js so
     * build-time and runtime read the same file identically.
     *
     * @param string $file Absolute path to the .env file
     * @return array Parsed key/value pairs, empty when unreadable
     */
    private static function parse_env_file(string $file): array
    {
        if (!is_readable($file)) {
            return [];
        }

        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if (false === $lines) {
            return [];
        }

        $vars = [];
        foreach ($lines as $raw) {
            $line = trim($raw);
            if ('' === $line || 0 === strpos($line, '#')) {
                continue;
            }

            $eq = strpos($line, '=');
            if (false === $eq) {
                continue;
            }

            $key = trim(substr($line, 0, $eq));
            $val = trim(substr($line, $eq + 1));

            // Strip a matching pair of surrounding quotes.
            $first = substr($val, 0, 1);
            if (strlen($val) > 1 && ('"' === $first || "'" === $first) && substr($val, -1) === $first) {
                $val = substr($val, 1, -1);
            }

            $vars[$key] = $val;
        }

        return $vars;
    }

    /**
     * Whether verbose customEngine console logging is on
     *
     * Runtime counterpart to the __MKIT_DEV_LOG__ build flag — toggling
     * MOTIONKIT_DEV_LOG in .env takes effect on the next request, no rebuild.
     *
     * @return bool True when MOTIONKIT_DEV_LOG=true
     */
    public static function is_dev_log(): bool
    {
        return 'true' === strtolower((string) self::get_env('MOTIONKIT_DEV_LOG', ''));
    }
        
}
