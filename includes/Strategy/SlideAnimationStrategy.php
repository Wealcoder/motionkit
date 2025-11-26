<?php

namespace WcfAnimationBuilder\Strategy;

/**
 * Slide Animation Strategy
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Slide Animation Strategy
 *
 * Implements slide animation strategy.
 */
final class SlideAnimationStrategy implements AnimationStrategyInterface
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
        $direction = $config['direction'] ?? 'left';
        
        switch ($direction) {
            case 'left':
                $transform = 'x: -100';
                $axis = 'x';
                break;
            case 'right':
                $transform = 'x: 100';
                $axis = 'x';
                break;
            case 'up':
                $transform = 'y: -100';
                $axis = 'y';
                break;
            case 'down':
                $transform = 'y: 100';
                $axis = 'y';
                break;
            default:
                $transform = 'x: -100';
                $axis = 'x';
        }
        
        return sprintf(
            'gsap.fromTo(element, {%s}, {duration: %s, %s: 0, ease: "%s"})',
            $transform,
            $duration,
            $axis,
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
        return 'slide';
    }

    /**
     * Validate configuration
     *
     * @param array $config Animation configuration
     * @return bool True if valid, false otherwise
     */
    public function validate_config(array $config): bool
    {
        $valid_directions = ['left', 'right', 'up', 'down'];
        $direction = $config['direction'] ?? 'left';
        
        return isset($config['duration']) 
            && is_numeric($config['duration'])
            && in_array($direction, $valid_directions, true);
    }
}

