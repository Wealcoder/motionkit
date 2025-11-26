<?php

namespace WcfAnimationBuilder\Helpers;

/**
 * Performance Helper Class
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Performance Helper Class
 *
 * Provides performance monitoring and optimization utilities.
 */
final class Performance
{
    /**
     * Start time tracker
     *
     * @var array<string, float>
     */
    private static array $timers = [];

    /**
     * Start performance timer
     *
     * @param string $name Timer name
     * @return void
     */
    public static function start_timer(string $name): void
    {
        self::$timers[$name] = microtime(true);
    }

    /**
     * Stop performance timer and get elapsed time
     *
     * @param string $name Timer name
     * @return float Elapsed time in seconds
     */
    public static function stop_timer(string $name): float
    {
        if (!isset(self::$timers[$name])) {
            return 0.0;
        }

        $elapsed = microtime(true) - self::$timers[$name];
        unset(self::$timers[$name]);

        return $elapsed;
    }

    /**
     * Defer script execution
     *
     * @param callable $callback Callback to execute
     * @param int $priority Priority (higher = later)
     * @return void
     */
    public static function defer(callable $callback, int $priority = 999): void
    {
        add_action('shutdown', $callback, $priority);
    }

    /**
     * Lazy load callback
     *
     * @param callable $callback Callback to execute
     * @param callable|null $condition Condition to check before execution
     * @return mixed Callback result or null
     */
    public static function lazy_load(callable $callback, ?callable $condition = null)
    {
        if (null !== $condition && !$condition()) {
            return null;
        }

        return $callback();
    }

    /**
     * Batch process items
     *
     * @param array $items Items to process
     * @param callable $processor Processor callback
     * @param int $batch_size Batch size
     * @return array Processed items
     */
    public static function batch_process(array $items, callable $processor, int $batch_size = 100): array
    {
        $results = [];
        $batches = array_chunk($items, $batch_size);

        foreach ($batches as $batch) {
            foreach ($batch as $item) {
                $results[] = $processor($item);
            }
        }

        return $results;
    }

    /**
     * Check if current request is admin
     *
     * @return bool True if admin, false otherwise
     */
    public static function is_admin(): bool
    {
        return is_admin();
    }

    /**
     * Check if current request is AJAX
     *
     * @return bool True if AJAX, false otherwise
     */
    public static function is_ajax(): bool
    {
        return defined('DOING_AJAX') && DOING_AJAX;
    }

    /**
     * Check if current request is cron
     *
     * @return bool True if cron, false otherwise
     */
    public static function is_cron(): bool
    {
        return defined('DOING_CRON') && DOING_CRON;
    }

    /**
     * Check if we should skip optimization
     *
     * @return bool True if should skip, false otherwise
     */
    public static function should_skip(): bool
    {
        return self::is_admin() || self::is_ajax() || self::is_cron();
    }

    /**
     * Get memory usage
     *
     * @return int Memory usage in bytes
     */
    public static function get_memory_usage(): int
    {
        return memory_get_usage(true);
    }

    /**
     * Get peak memory usage
     *
     * @return int Peak memory usage in bytes
     */
    public static function get_peak_memory_usage(): int
    {
        return memory_get_peak_usage(true);
    }
}

