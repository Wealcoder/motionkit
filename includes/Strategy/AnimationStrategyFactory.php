<?php

namespace WcfAnimationBuilder\Strategy;

/**
 * Animation Strategy Factory
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Animation Strategy Factory
 *
 * Factory for creating animation strategy instances.
 */
final class AnimationStrategyFactory
{
    /**
     * Available strategies
     *
     * @var array<string, class-string>
     */
    private static array $strategies = [
        'fade' => FadeAnimationStrategy::class,
        'slide' => SlideAnimationStrategy::class,
    ];

    /**
     * Create strategy instance
     *
     * @param string $type Strategy type
     * @return AnimationStrategyInterface|null Strategy instance or null if not found
     */
    public static function create(string $type): ?AnimationStrategyInterface
    {
        if (!isset(self::$strategies[$type])) {
            return null;
        }

        $strategy_class = self::$strategies[$type];
        
        if (!class_exists($strategy_class)) {
            return null;
        }

        return new $strategy_class();
    }

    /**
     * Register new strategy
     *
     * @param string $type Strategy type
     * @param string $class Strategy class name
     * @return void
     */
    public static function register(string $type, string $class): void
    {
        if (is_subclass_of($class, AnimationStrategyInterface::class)) {
            self::$strategies[$type] = $class;
        }
    }

    /**
     * Get available strategy types
     *
     * @return array List of available strategy types
     */
    public static function get_available_types(): array
    {
        return array_keys(self::$strategies);
    }
}

