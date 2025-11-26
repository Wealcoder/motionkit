<?php

namespace WcfAnimationBuilder\Decorator;

/**
 * Asset Loader Decorator Base Class
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

use WcfAnimationBuilder\Common\Assets\AssetLoader;

/**
 * Asset Loader Decorator Base Class
 *
 * Decorator pattern base class for extending AssetLoader functionality.
 */
abstract class AssetLoaderDecorator
{
    /**
     * Wrapped asset loader instance
     *
     * @var AssetLoader
     */
    protected AssetLoader $asset_loader;

    /**
     * Constructor
     *
     * @param AssetLoader $asset_loader Asset loader to decorate
     */
    public function __construct(AssetLoader $asset_loader)
    {
        $this->asset_loader = $asset_loader;
    }

    /**
     * Enqueue common CSS file
     *
     * @param string $handle Asset handle
     * @param string $file_path Relative path to the CSS file from plugin root
     * @param array $dependencies Dependencies array
     * @return void
     */
    public function enqueue_style(string $handle, string $file_path, array $dependencies = []): void
    {
        $this->asset_loader->enqueue_style($handle, $file_path, $dependencies);
    }

    /**
     * Enqueue common JavaScript file
     *
     * @param string $handle Asset handle
     * @param string $file_path Relative path to the JS file from plugin root
     * @param array $dependencies Dependencies array
     * @param bool $in_footer Whether to load in footer
     * @return void
     */
    public function enqueue_script(string $handle, string $file_path, array $dependencies = [], bool $in_footer = true): void
    {
        $this->asset_loader->enqueue_script($handle, $file_path, $dependencies, $in_footer);
    }

    /**
     * Localize script with data
     *
     * @param string $handle Script handle
     * @param string $object_name JavaScript object name
     * @param array $data Data to localize
     * @return void
     */
    public function localize_script(string $handle, string $object_name, array $data): void
    {
        $this->asset_loader->localize_script($handle, $object_name, $data);
    }

    /**
     * Register script
     *
     * @param string $handle Asset handle
     * @param string $file_path Relative path to the JS file from plugin root
     * @param array $dependencies Dependencies array
     * @param bool $in_footer Whether to load in footer
     * @return void
     */
    public function register_script(string $handle, string $file_path, array $dependencies = [], bool $in_footer = true): void
    {
        $this->asset_loader->register_script($handle, $file_path, $dependencies, $in_footer);
    }

    /**
     * Register style
     *
     * @param string $handle Asset handle
     * @param string $file_path Relative path to the CSS file from plugin root
     * @param array $dependencies Dependencies array
     * @return void
     */
    public function register_style(string $handle, string $file_path, array $dependencies = []): void
    {
        $this->asset_loader->register_style($handle, $file_path, $dependencies);
    }

    /**
     * Get plugin instance
     *
     * @return \WcfAnimationBuilder\Plugin Plugin instance
     */
    public function get_plugin(): \WcfAnimationBuilder\Plugin
    {
        return $this->asset_loader->get_plugin();
    }

    /**
     * Get asset version
     *
     * @return string Asset version
     */
    public function get_version(): string
    {
        return $this->asset_loader->get_version();
    }
}

