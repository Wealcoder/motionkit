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
     * Editor session token, minted once per request
     *
     * @var string|null
     */
    private static ?string $session_token = null;

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

    /**
     * Where a "Build Animation" click should land.
     *
     * An unconnected site has no account behind its session token, so opening
     * the editor put the user on a screen with nothing to edit and no way to
     * tell why. They go to the Connect page instead, which is the step they are
     * actually missing.
     *
     * The link is deliberately still shown rather than hidden: an action that
     * silently disappears reads as a broken plugin, while one that explains
     * itself does not. Callers pair this with is_editor_reachable() to decide
     * whether to open a new tab — the editor is external, the Connect page is
     * not.
     *
     * Nothing is minted for an unconnected site either, which matters on a list
     * screen: this runs once per row, and on a connected site each call reaches
     * JwtTokenManager::generate().
     *
     * @param string $page_url Permalink of the page being edited.
     * @return string
     */
    public static function editor_launch_url(string $page_url): string
    {
        if (!self::is_editor_reachable()) {
            return admin_url('admin.php?page=motionkit-connect&tab=connect');
        }

        // Always attach a session JWT, so Frontend::is_editor_preview() can require a valid token rather than trusting ?action=motionkit-editor on its own. The page being opened travels in `site`, not in the token.
        $query_args = [
            'site'            => $page_url,
            'platform'        => 'wordpress',
            'motionkit_token' => self::session_token(),
        ];

        return apply_filters('motionkit/editor/url', add_query_arg($query_args, 'https://editor.motionkit.io/'));
    }

    /**
     * Editor session token for this request, minted once.
     *
     * The token is site-scoped, not page-scoped. `/connect/launch` does sign the
     * page URL into a `site` claim, but `/connect/verify-session` only checks
     * the signature, the jti's status and expiry — never that claim. So one
     * token opens any page, and the page actually being edited travels in the
     * `site` query argument beside it.
     *
     * Minting per call was costly in a way that only showed on a connected site:
     * JwtTokenManager::generate() does a wp_remote_post to /connect/launch
     * whenever an access token exists, and these links are built one per row, so
     * a 20-row Pages list fired 20 serial HTTP round trips on every single load.
     * AnimationDataTools already collapses the same list-screen problem this way.
     *
     * @return string Empty when the connector is absent.
     */
    private static function session_token(): string
    {
        if (null !== self::$session_token) {
            return self::$session_token;
        }

        if (!function_exists('motionkit_editor_session_token')) {
            return self::$session_token = '';
        }

        return self::$session_token = motionkit_editor_session_token(home_url('/'));
    }

    /**
     * Can this site open the editor at all?
     *
     * False when the connector is missing or the OAuth handshake has not been
     * completed. Says nothing about entitlement — an expired license still
     * reaches the editor, which is where that gets explained.
     *
     * @return bool
     */
    public static function is_editor_reachable(): bool
    {
        return function_exists('motionkit_is_connected') && motionkit_is_connected();
    }
}
