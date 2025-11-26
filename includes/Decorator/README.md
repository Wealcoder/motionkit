# ConditionalAssetLoaderDecorator Usage

## Overview

`ConditionalAssetLoaderDecorator` is a **Decorator Pattern** implementation that wraps the `AssetLoader` class and adds conditional asset loading functionality. It only loads assets when a specified condition is met.

## Purpose

This decorator allows you to:
- Load assets conditionally based on page context
- Load assets only on specific post types
- Load assets based on user roles or capabilities
- Load assets based on custom conditions
- Avoid loading unnecessary assets for better performance

## How It Works

The decorator wraps an `AssetLoader` instance and intercepts `enqueue_style()` and `enqueue_script()` calls. Before enqueueing assets, it checks if the condition callback returns `true`. If the condition is met, the asset is loaded; otherwise, it's skipped.

## Usage Examples

### Example 1: Load assets only on single posts

```php
use WcfAnimationBuilder\Common\Assets\AssetLoader;
use WcfAnimationBuilder\Decorator\ConditionalAssetLoaderDecorator;
use WcfAnimationBuilder\Factory\ComponentFactory;

// Create base asset loader
$base_loader = ComponentFactory::create_asset_loader();

// Wrap with conditional decorator - only load on single posts
$conditional_loader = new ConditionalAssetLoaderDecorator(
    $base_loader,
    function() {
        return is_single();
    }
);

// Assets will only be loaded if is_single() returns true
$conditional_loader->enqueue_style('my-style', 'assets/style.css');
$conditional_loader->enqueue_script('my-script', 'assets/script.js');
```

### Example 2: Load assets only on product pages

```php
use WcfAnimationBuilder\Common\Assets\AssetLoader;
use WcfAnimationBuilder\Decorator\ConditionalAssetLoaderDecorator;

$base_loader = ComponentFactory::create_asset_loader();

// Only load on WooCommerce product pages
$product_loader = new ConditionalAssetLoaderDecorator(
    $base_loader,
    function() {
        return function_exists('is_product') && is_product();
    }
);

$product_loader->enqueue_style('product-animations', 'assets/product.css');
```

### Example 3: Load assets only for logged-in users

```php
$base_loader = ComponentFactory::create_asset_loader();

$logged_in_loader = new ConditionalAssetLoaderDecorator(
    $base_loader,
    fn() => is_user_logged_in()
);

$logged_in_loader->enqueue_script('user-script', 'assets/user.js');
```

### Example 4: Load assets based on post meta

```php
$base_loader = ComponentFactory::create_asset_loader();

$meta_loader = new ConditionalAssetLoaderDecorator(
    $base_loader,
    function() {
        if (!is_singular()) {
            return false;
        }
        $has_animation = get_post_meta(get_the_ID(), '_wcf_animation_data', true);
        return !empty($has_animation);
    }
);

$meta_loader->enqueue_style('animation-style', 'assets/animations.css');
```

### Example 5: Load assets only for administrators

```php
$base_loader = ComponentFactory::create_asset_loader();

$admin_loader = new ConditionalAssetLoaderDecorator(
    $base_loader,
    fn() => current_user_can('manage_options')
);

$admin_loader->enqueue_script('admin-tool', 'assets/admin.js');
```

### Example 6: Use in Backend class

```php
// In Backend.php
use WcfAnimationBuilder\Factory\ComponentFactory;
use WcfAnimationBuilder\Decorator\ConditionalAssetLoaderDecorator;

public function init(): void
{
    $base_loader = ComponentFactory::create_asset_loader();
    
    // Only load assets on product edit pages
    $this->asset_loader = new ConditionalAssetLoaderDecorator(
        $base_loader,
        function() {
            global $pagenow, $post_type;
            return ($pagenow === 'post.php' || $pagenow === 'post-new.php') 
                && $post_type === 'product';
        }
    );
    
    $this->init_hooks();
}

public function enqueue_admin_assets(string $hook): void
{
    // Assets will only load if condition is met
    $this->asset_loader->enqueue_style('admin-style', 'assets/admin.css');
    $this->asset_loader->enqueue_script('admin-script', 'assets/admin.js');
}
```

### Example 7: Use in Frontend class

```php
// In Frontend.php
use WcfAnimationBuilder\Factory\ComponentFactory;
use WcfAnimationBuilder\Decorator\ConditionalAssetLoaderDecorator;

public function init(): void
{
    $base_loader = ComponentFactory::create_asset_loader();
    
    // Only load on pages with animation enabled
    $this->asset_loader = new ConditionalAssetLoaderDecorator(
        $base_loader,
        function() {
            if (!is_singular()) {
                return false;
            }
            return get_post_meta(get_the_ID(), '_wcf_animation_enabled', true) === 'yes';
        }
    );
    
    $this->init_hooks();
}

public function enqueue_scripts(): void
{
    // Assets will only load if condition is met
    $this->asset_loader->enqueue_style('animation-style', 'assets/frontend.css');
    $this->asset_loader->enqueue_script('animation-script', 'assets/frontend.js');
}
```

## Benefits

1. **Performance**: Avoids loading unnecessary assets
2. **Flexibility**: Easy to add different conditions
3. **Separation of Concerns**: Condition logic is separate from asset loading
4. **Reusability**: Same decorator can be used with different conditions
5. **Maintainability**: Easy to modify conditions without changing core asset loading code

## Pattern Benefits

- **Decorator Pattern**: Adds functionality without modifying the original class
- **Open/Closed Principle**: Open for extension, closed for modification
- **Single Responsibility**: Each decorator has one specific responsibility

