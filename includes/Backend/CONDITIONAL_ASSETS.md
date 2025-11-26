# Conditional Asset Loading in Admin

This guide shows different ways to conditionally load assets in the `enqueue_admin_assets()` method.

## Method 1: Simple Conditional Checks (Recommended)

Use simple `if` statements inside the method:

```php
public function enqueue_admin_assets(string $hook): void
{
    // Load on all admin pages
    $this->asset_loader->enqueue_script('wcf-backend-script', 'assets/js/backend.js', ['jquery'], true);

    // Only load on post edit pages
    if ($this->is_post_edit_page($hook)) {
        $this->asset_loader->enqueue_script('wcf-preview-script', 'assets/js/preview.js', ['jquery'], true);
    }

    // Only load on specific screens
    if ($this->is_screen($hook, 'product')) {
        $this->asset_loader->enqueue_style('wcf-product-style', 'assets/css/product.css');
    }
}
```

## Common Condition Examples

### 1. Load only on post edit pages

```php
if ($this->is_post_edit_page($hook)) {
    // Load assets
}
```

### 2. Load only on specific post types

```php
global $post_type;
if ($post_type === 'product') {
    // Load assets
}
```

### 3. Load only on specific admin screens

```php
$screen = get_current_screen();
if ($screen && $screen->id === 'product') {
    // Load assets
}

// Or use helper method
if ($this->is_screen($hook, 'product')) {
    // Load assets
}
```

### 4. Load only for specific admin pages

```php
// Check by hook
if ($hook === 'post.php' || $hook === 'post-new.php') {
    // Load assets
}

// Check by pagenow
global $pagenow;
if ($pagenow === 'post.php' || $pagenow === 'post-new.php') {
    // Load assets
}
```

### 5. Load only for administrators

```php
if (current_user_can('manage_options')) {
    // Load assets
}
```

### 6. Load only on plugin's own admin pages

```php
if (strpos($hook, 'wcf_animation_builder') !== false) {
    // Load assets
}
```

### 7. Multiple conditions

```php
global $post_type, $pagenow;
if (
    ($pagenow === 'post.php' || $pagenow === 'post-new.php') &&
    $post_type === 'product' &&
    current_user_can('edit_posts')
) {
    // Load assets
}
```

## Method 2: Using ConditionalAssetLoaderDecorator

For more advanced conditional loading, use the decorator pattern:

```php
use WcfAnimationBuilder\Decorator\ConditionalAssetLoaderDecorator;

public function init(): void
{
    $base_loader = ComponentFactory::create_asset_loader();
    
    // Create conditional loader
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
```

## Helper Methods Available

The Backend class includes helper methods:

### `is_post_edit_page($hook)`
Check if current page is post edit page (post.php or post-new.php)

```php
if ($this->is_post_edit_page($hook)) {
    // Load assets
}
```

### `is_specific_post_type($post_type)`
Check if current post type matches

```php
if ($this->is_specific_post_type('product')) {
    // Load assets
}
```

### `is_screen($hook, $screen_ids)`
Check if current screen matches

```php
// Single screen
if ($this->is_screen($hook, 'product')) {
    // Load assets
}

// Multiple screens
if ($this->is_screen($hook, ['product', 'page'])) {
    // Load assets
}
```

## Complete Example

```php
public function enqueue_admin_assets(string $hook): void
{
    // Always load backend.js
    $this->asset_loader->enqueue_script(
        'wcf-backend-script',
        'assets/js/backend.js',
        ['jquery'],
        true
    );

    // Only load preview.js on post edit pages
    if ($this->is_post_edit_page($hook)) {
        $this->asset_loader->enqueue_script(
            'wcf-preview-script',
            'assets/js/preview.js',
            ['jquery', 'wcf-backend-script'],
            true
        );
    }

    // Only load product assets on product pages
    global $post_type;
    if ($post_type === 'product') {
        $this->asset_loader->enqueue_style('wcf-product-style', 'assets/css/product.css');
        $this->asset_loader->enqueue_script('wcf-product-script', 'assets/js/product.js', ['jquery'], true);
    }

    // Only load for administrators
    if (current_user_can('manage_options')) {
        $this->asset_loader->enqueue_script('wcf-admin-tools', 'assets/js/admin-tools.js', ['jquery'], true);
    }

    // Only load on plugin's admin pages
    if (strpos($hook, 'wcf_animation_builder') !== false) {
        $this->asset_loader->enqueue_style('wcf-admin-style', 'assets/css/admin.css');
    }
}
```

## Best Practices

1. **Use simple conditions** - For most cases, simple `if` statements are clearer
2. **Early returns** - Return early if conditions aren't met
3. **Helper methods** - Create reusable helper methods for common checks
4. **Document conditions** - Add comments explaining when assets load
5. **Performance** - Avoid loading unnecessary assets

## Performance Tips

- Use early returns to skip unnecessary checks
- Cache condition results if checking multiple times
- Load assets only when absolutely needed
- Use conditional decorators for complex scenarios

