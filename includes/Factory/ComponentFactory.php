<?php

namespace MotionKit\Factory;

/**
 * Component Factory Class
 *
 * @package MotionKit
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

use MotionKit\Backend\Backend;
use MotionKit\Frontend\Frontend;
use MotionKit\Common\Assets\AssetLoader;

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
     * Create asset loader instance
     *
     * @return AssetLoader Asset loader instance
     */
    public static function create_asset_loader(): AssetLoader
    {
        return new AssetLoader();
    }
   
}

