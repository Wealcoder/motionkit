<?php

namespace WcfAnimationBuilder\Decorator;

/**
 * Conditional Asset Loader Decorator
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Conditional Asset Loader Decorator
 *
 * Decorator that conditionally loads assets based on callbacks.
 */
final class ConditionalAssetLoaderDecorator extends AssetLoaderDecorator
{
    /**
     * Condition callback
     *
     * @var callable
     */
    private $condition;

    /**
     * Constructor
     *
     * @param AssetLoader $asset_loader Asset loader to decorate
     * @param callable $condition Condition callback that returns bool
     */
    public function __construct(AssetLoader $asset_loader, callable $condition)
    {
        parent::__construct($asset_loader);
        $this->condition = $condition;
    }

    /**
     * Enqueue common CSS file (with condition check)
     *
     * @param string $handle Asset handle
     * @param string $file_path Relative path to the CSS file from plugin root
     * @param array $dependencies Dependencies array
     * @return void
     */
    public function enqueue_style(string $handle, string $file_path, array $dependencies = []): void
    {
        if (($this->condition)()) {
            $this->asset_loader->enqueue_style($handle, $file_path, $dependencies);
        }
    }

    /**
     * Enqueue common JavaScript file (with condition check)
     *
     * @param string $handle Asset handle
     * @param string $file_path Relative path to the JS file from plugin root
     * @param array $dependencies Dependencies array
     * @param bool $in_footer Whether to load in footer
     * @return void
     */
    public function enqueue_script(string $handle, string $file_path, array $dependencies = [], bool $in_footer = true): void
    {
        if (($this->condition)()) {
            $this->asset_loader->enqueue_script($handle, $file_path, $dependencies, $in_footer);
        }
    }
}

