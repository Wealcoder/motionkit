<?php

namespace WcfAnimationBuilder\Strategy;

/**
 * Animation Strategy Interface
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Animation Strategy Interface
 *
 * Strategy pattern interface for different animation implementations.
 */
interface AnimationStrategyInterface
{
    /**
     * Execute animation
     *
     * @param array $config Animation configuration
     * @return string Animation output
     */
    public function execute(array $config): string;

    /**
     * Get strategy name
     *
     * @return string Strategy name
     */
    public function get_name(): string;

    /**
     * Validate configuration
     *
     * @param array $config Animation configuration
     * @return bool True if valid, false otherwise
     */
    public function validate_config(array $config): bool;
}

