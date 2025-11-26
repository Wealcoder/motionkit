<?php

namespace WcfAnimationBuilder\Helpers;

/**
 * Cache Helper Class
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Cache Helper Class
 *
 * Provides caching functionality for improved performance.
 */
final class Cache
{
    /**
     * Cache group name
     */
    private const CACHE_GROUP = 'wcf_animation_builder';

    /**
     * Cache expiration time (in seconds)
     */
    private const CACHE_EXPIRATION = 3600; // 1 hour

    /**
     * Get cached value
     *
     * @param string $key Cache key
     * @param mixed $default Default value if cache miss
     * @return mixed Cached value or default
     */
    public static function get(string $key, $default = false)
    {
        return wp_cache_get($key, self::CACHE_GROUP) ?: $default;
    }

    /**
     * Set cache value
     *
     * @param string $key Cache key
     * @param mixed $value Value to cache
     * @param int $expiration Expiration time in seconds
     * @return bool True on success, false on failure
     */
    public static function set(string $key, $value, int $expiration = null): bool
    {
        $expiration = $expiration ?? self::CACHE_EXPIRATION;
        return wp_cache_set($key, $value, self::CACHE_GROUP, $expiration);
    }

    /**
     * Delete cache value
     *
     * @param string $key Cache key
     * @return bool True on success, false on failure
     */
    public static function delete(string $key): bool
    {
        return wp_cache_delete($key, self::CACHE_GROUP);
    }

    /**
     * Flush all cache for this group
     *
     * @return bool True on success, false on failure
     */
    public static function flush(): bool
    {
        return wp_cache_flush_group(self::CACHE_GROUP);
    }

    /**
     * Get or set cache (lazy loading)
     *
     * @param string $key Cache key
     * @param callable $callback Callback to generate value if cache miss
     * @param int $expiration Expiration time in seconds
     * @return mixed Cached or generated value
     */
    public static function remember(string $key, callable $callback, int $expiration = null)
    {
        $cached = self::get($key);
        
        if (false !== $cached) {
            return $cached;
        }

        $value = $callback();
        self::set($key, $value, $expiration);
        
        return $value;
    }

    /**
     * Generate cache key from array
     *
     * @param array $data Data to generate key from
     * @param string $prefix Key prefix
     * @return string Generated cache key
     */
    public static function generate_key(array $data, string $prefix = ''): string
    {
        $key = $prefix . '_' . md5(serialize($data));
        return sanitize_key($key);
    }
}

