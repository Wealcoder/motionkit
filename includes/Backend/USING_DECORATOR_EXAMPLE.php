<?php
/**
 * Example: Using ConditionalAssetLoaderDecorator in Backend.php
 * 
 * This shows how you CAN use the decorator pattern if you want to.
 * Compare this with the current simple if-statement approach.
 */

namespace WcfAnimationBuilder\Backend;

use WcfAnimationBuilder\Common\Assets\AssetLoader;
use WcfAnimationBuilder\Factory\ComponentFactory;
use WcfAnimationBuilder\Decorator\ConditionalAssetLoaderDecorator;

final class Backend
{
    private AssetLoader $asset_loader;
    private AssetLoader $post_editor_loader; // Conditional loader for post editor
    private AssetLoader $product_loader;     // Conditional loader for products

    public function init(): void
    {
        $base_loader = ComponentFactory::create_asset_loader();
        
        // Create conditional loader for post editor pages
        $this->post_editor_loader = new ConditionalAssetLoaderDecorator(
            $base_loader,
            function() {
                global $pagenow;
                return in_array($pagenow, ['post.php', 'post-new.php'], true);
            }
        );

        // Create conditional loader for product pages only
        $this->product_loader = new ConditionalAssetLoaderDecorator(
            $base_loader,
            function() {
                global $post_type;
                return isset($post_type) && $post_type === 'product';
            }
        );

        // Base loader for always-loaded assets
        $this->asset_loader = $base_loader;
        
        $this->init_hooks();
    }

    public function enqueue_admin_assets(string $hook): void
    {
        // Always load backend.js on all admin pages
        $this->asset_loader->enqueue_script(
            'wcf-backend-script',
            'assets/js/backend.js',
            ['jquery'],
            true
        );

        // Use conditional loader - preview.js only loads on post edit pages
        $this->post_editor_loader->enqueue_script(
            'wcf-preview-script',
            'assets/js/preview.js',
            ['jquery', 'wcf-backend-script'],
            true
        );

        // Use conditional loader - product assets only load on product pages
        $this->product_loader->enqueue_style('wcf-product-style', 'assets/css/product.css');
        $this->product_loader->enqueue_script('wcf-product-script', 'assets/js/product.js', ['jquery'], true);
    }
}

