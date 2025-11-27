<?php

namespace WcfAnimationBuilder\Factory;

/**
 * Component Factory Class
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

use WcfAnimationBuilder\Backend\Backend;
use WcfAnimationBuilder\Frontend\Frontend;
use WcfAnimationBuilder\Compatibility\Compatibility;
use WcfAnimationBuilder\Common\Assets\AssetLoader;

/**
 * Component Factory Class
 *
 * Factory pattern for creating plugin components.
 */
final class ComponentFactory
{
    /**
     * Create backend instance
     *
     * @return Backend Backend instance
     */
    public static function create_backend(): Backend
    {
        return new Backend();
    }

    /**
     * Create frontend instance
     *
     * @return Frontend Frontend instance
     */
    public static function create_frontend(): Frontend
    {
        return new Frontend();
    }

    /**
     * Create compatibility instance
     *
     * @return Compatibility Compatibility instance
     */
    public static function create_compatibility(): Compatibility
    {
        return new Compatibility();
    }

    /**
     * Create asset loader instance
     *
     * @return AssetLoader Asset loader instance
     */
    public static function create_asset_loader(): AssetLoader
    {
        return new AssetLoader();
    }
   
}

