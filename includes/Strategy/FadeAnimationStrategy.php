<?php

namespace WcfAnimationBuilder\Strategy;

/**
 * Fade Animation Strategy
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Fade Animation Strategy
 *
 * Implements fade animation strategy.
 */
final class FadeAnimationStrategy implements AnimationStrategyInterface
{
    /**
     * Execute animation
     *
     * @param array $config Animation configuration
     * @return string Animation output
     */
    public function execute(array $config): string
    {
        $duration = $config['duration'] ?? 1;
        $ease = $config['ease'] ?? 'power2.out';
        
        return sprintf(
            'gsap.to(element, {duration: %s, opacity: %s, ease: "%s"})',
            $duration,
            $config['to_opacity'] ?? 1,
            $ease
        );
    }

    /**
     * Get strategy name
     *
     * @return string Strategy name
     */
    public function get_name(): string
    {
        return 'fade';
    }

    /**
     * Validate configuration
     *
     * @param array $config Animation configuration
     * @return bool True if valid, false otherwise
     */
    public function validate_config(array $config): bool
    {
        return isset($config['duration']) && is_numeric($config['duration']);
    }
}

