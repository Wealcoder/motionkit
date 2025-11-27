# Developer Documentation - GSAP Animation Builder for WordPress

## Table of Contents

1. [Plugin Architecture](#plugin-architecture)
2. [Design Patterns](#design-patterns)
3. [Performance Optimization](#performance-optimization)
4. [Hooks & Filters](#hooks--filters)
5. [API Reference](#api-reference)
6. [Code Examples](#code-examples)
7. [Best Practices](#best-practices)

---

## Plugin Architecture

### Directory Structure

```
gsap-animation-builder-for-wordpress/
├── includes/
│   ├── Autoloader.php          # PSR-4 autoloader
│   ├── Plugin.php              # Main plugin class (Singleton)
│   ├── Backend/                # Admin functionality
│   ├── Frontend/               # Frontend functionality
│   ├── Common/                 # Shared components
│   │   └── Assets/            # Asset loader (used by Backend & Frontend)
│   ├── Factory/                # Factory pattern implementations
│   ├── Strategy/               # Strategy pattern implementations
│   ├── Decorator/              # Decorator pattern implementations
│   ├── Helpers/                # Helper utilities
│   │   ├── Helper.php         # Main helper functions
│   │   ├── Tools.php          # Additional utility tools
│   │   ├── Cache.php          # Caching utilities
│   │   └── Performance.php    # Performance monitoring
│   └── Compatibility/          # Compatibility layer
├── gsap-animation-builder-for-wordpress.php  # Main plugin file
└── index.php                   # Security file
```

### Core Components

#### 1. Plugin Class (Singleton Pattern)
**Location:** `includes/Plugin.php`

Main plugin class that handles initialization, activation, and deactivation.

```php
// Get plugin instance
$plugin = \WcfAnimationBuilder\Plugin::get_instance(WCF_ANIMATION_BUILDER_PLUGIN_FILE);

// Access plugin properties
$plugin_dir = $plugin->get_plugin_dir();
$plugin_url = $plugin->get_plugin_url();
```

#### 2. Autoloader
**Location:** `includes/Autoloader.php`

PSR-4 compliant autoloader for automatic class loading.

**Namespace:** `WcfAnimationBuilder\`

#### 3. Factory Pattern
**Location:** `includes/Factory/ComponentFactory.php`

Creates plugin component instances.

```php
use WcfAnimationBuilder\Factory\ComponentFactory;

// Create components
$backend = ComponentFactory::create_backend();
$frontend = ComponentFactory::create_frontend();
$asset_loader = ComponentFactory::create_asset_loader();
```

#### 4. Strategy Pattern
**Location:** `includes/Strategy/`

Implements different animation strategies.

```php
use WcfAnimationBuilder\Strategy\AnimationStrategyFactory;

// Create animation strategy
$strategy = AnimationStrategyFactory::create('fade');
$animation_code = $strategy->execute($config);

// Register custom strategy
AnimationStrategyFactory::register('custom', MyCustomStrategy::class);
```

#### 5. Decorator Pattern
**Location:** `includes/Decorator/`

Extends asset loader functionality without modifying the original class.

```php
use WcfAnimationBuilder\Decorator\ConditionalAssetLoaderDecorator;

// Conditional asset loading
$conditional_loader = new ConditionalAssetLoaderDecorator(
    $base_loader,
    fn() => is_single()
);

$conditional_loader->enqueue_style('my-style', 'assets/style.css');
```

---

## Design Patterns

### 1. Singleton Pattern

**Purpose:** Ensure only one instance of the Plugin class exists.

**Implementation:**
- Private constructor
- Static `get_instance()` method
- Prevents cloning (`__clone()`)
- Prevents unserialization (`__wakeup()`)

**Usage:**
```php
// Always use get_instance(), never 'new Plugin()'
$plugin = \WcfAnimationBuilder\Plugin::get_instance(WCF_ANIMATION_BUILDER_PLUGIN_FILE);
```

### 2. Factory Pattern

**Purpose:** Centralize object creation logic.

**Classes:**
- `ComponentFactory` - Creates Backend, Frontend, Compatibility, AssetLoader
- `AnimationStrategyFactory` - Creates animation strategy instances

**Usage:**
```php
// Component Factory
$backend = ComponentFactory::create_backend();

// Strategy Factory
$fade_strategy = AnimationStrategyFactory::create('fade');
```

### 3. Strategy Pattern

**Purpose:** Encapsulate different animation algorithms.

**Interface:** `AnimationStrategyInterface`
**Implementations:** `FadeAnimationStrategy`, `SlideAnimationStrategy`

**Usage:**
```php
// Create strategy based on type
$strategy = AnimationStrategyFactory::create('fade');

// Execute animation
$config = ['duration' => 1, 'ease' => 'power2.out'];
$animation_code = $strategy->execute($config);

// Validate config
if ($strategy->validate_config($config)) {
    // Use animation
}
```

### 4. Decorator Pattern

**Purpose:** Add functionality to AssetLoader dynamically.

**Classes:**
- `AssetLoaderDecorator` - Base decorator class
- `ConditionalAssetLoaderDecorator` - Conditional asset loading

**Usage:**
```php
// Base loader
$base_loader = ComponentFactory::create_asset_loader();

// Decorate with condition
$conditional_loader = new ConditionalAssetLoaderDecorator(
    $base_loader,
    function() {
        return is_single() && get_post_type() === 'product';
    }
);

// Assets only load if condition is true
$conditional_loader->enqueue_style('product-style', 'assets/product.css');
```

---

## Performance Optimization

### Caching

**Cache Helper:** `includes/Helpers/Cache.php`

```php
use WcfAnimationBuilder\Helpers\Cache;

// Get cached value
$value = Cache::get('my_key', 'default');

// Set cache
Cache::set('my_key', $value, 3600); // 1 hour

// Remember pattern (get or compute)
$data = Cache::remember('expensive_data', function() {
    return expensive_operation();
}, 3600);

// Delete cache
Cache::delete('my_key');

// Flush all plugin cache
Cache::flush();
```

### Performance Monitoring

**Performance Helper:** `includes/Helpers/Performance.php`

```php
use WcfAnimationBuilder\Helpers\Performance;

// Timer usage
Performance::start_timer('operation');
// ... do something ...
$elapsed = Performance::stop_timer('operation');

// Defer execution
Performance::defer(function() {
    // Run at shutdown
}, 999);

// Lazy loading
$result = Performance::lazy_load(
    fn() => expensive_operation(),
    fn() => is_single() // condition
);

// Batch processing
$processed = Performance::batch_process($items, $processor, 100);
```

### Option Caching

Options are automatically cached to avoid duplicate database queries:

```php
use WcfAnimationBuilder\Helpers\Helper;

// Automatically uses cache
$value = Helper::get_option('my_key', 'default');

// Clear cache after update
Helper::update_option('my_key', 'new_value');
Helper::clear_options_cache();
```

### Conditional Loading

The plugin automatically skips initialization on:
- AJAX requests (unless plugin's AJAX)
- Cron requests
- Admin-only contexts

---

## Hooks & Filters

### Actions

#### Plugin Initialization
```php
do_action('WCF_ANIMATION_BUILDER_LOADED');
```
Fired after plugin is fully initialized.

#### Plugin Activation
```php
do_action('wcf_animation_builder_activated');
```
Fired on plugin activation.

#### Plugin Deactivation
```php
do_action('wcf_animation_builder_deactivated');
```
Fired on plugin deactivation.

### Filters

No filters are currently defined. You can add them as needed.

---

## API Reference

### Helper Class

**Location:** `includes/Helpers/Helper.php`

#### Data Sanitization
```php
// Use WordPress native sanitization functions
sanitize_text_field($data)          // For strings
wp_unslash($data)                   // Remove slashes
sanitize_array($data)              // Custom recursive sanitization (if needed)
       // Allowed HTML tags
       // Escape output
```

#### Options Management
```php
Helper::get_option($key, $default)  // Get option (cached)
Helper::update_option($key, $value) // Update option
Helper::clear_options_cache()       // Clear cache
```

#### Security
```php
wp_verify_nonce($nonce, 'action')  // Verify nonce (WordPress native)
Helper::create_nonce()              // Create nonce
```

#### Utilities
```php
Helper::get_plugin_version()        // Get version
Helper::get_plugin_dir()            // Get directory
Helper::get_plugin_url()            // Get URL
Helper::log($message, $level)       // Log debug message
Helper::generate_unique_id()        // Generate unique ID
```

### Tools Class

**Location:** `includes/Helpers/Tools.php`

```php
Tools::sanitizeDeep($var)                    // Deep sanitization
Tools::getEditedPostId()                     // Get edited post ID
Tools::builder_setting_option($key, $default) // Get builder setting
Tools::settingOption($key, $default)         // Get setting
Tools::renderView($filePath, $vars)          // Render view
Tools::allowedHtml()                         // Allowed HTML
Tools::validateJson($json)                   // Validate JSON
```

### Cache Class

**Location:** `includes/Helpers/Cache.php`

```php
Cache::get($key, $default)           // Get from cache
Cache::set($key, $value, $expiration) // Set cache
Cache::delete($key)                  // Delete cache
Cache::remember($key, $callback)     // Get or compute
Cache::flush()                       // Flush all
Cache::generate_key($data, $prefix)  // Generate key
```

### AssetLoader Class

**Location:** `includes/Common/Assets/AssetLoader.php`

```php
$loader->enqueue_style($handle, $path, $deps)
$loader->enqueue_script($handle, $path, $deps, $footer)
$loader->register_style($handle, $path, $deps)
$loader->register_script($handle, $path, $deps, $footer)
$loader->localize_script($handle, $object, $data)
$loader->add_inline_style($handle, $css)
$loader->get_plugin()                // Get plugin instance
$loader->get_version()               // Get version
```

---

## Code Examples

### Example 1: Creating a Custom Animation Strategy

```php
namespace WcfAnimationBuilder\Strategy;

class RotateAnimationStrategy implements AnimationStrategyInterface
{
    public function execute(array $config): string
    {
        $duration = $config['duration'] ?? 1;
        $degrees = $config['degrees'] ?? 360;
        
        return sprintf(
            'gsap.to(element, {duration: %s, rotation: %s, ease: "power2.out"})',
            $duration,
            $degrees
        );
    }

    public function get_name(): string
    {
        return 'rotate';
    }

    public function validate_config(array $config): bool
    {
        return isset($config['duration']) && is_numeric($config['duration']);
    }
}

// Register the strategy
\WcfAnimationBuilder\Strategy\AnimationStrategyFactory::register(
    'rotate',
    \WcfAnimationBuilder\Strategy\RotateAnimationStrategy::class
);
```

### Example 2: Conditional Asset Loading in Backend

```php
// In Backend.php
use WcfAnimationBuilder\Decorator\ConditionalAssetLoaderDecorator;

public function init(): void
{
    $base_loader = ComponentFactory::create_asset_loader();
    
    // Only load assets on specific admin pages
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

### Example 3: Using Cache for Expensive Operations

```php
use WcfAnimationBuilder\Helpers\Cache;

// Cache expensive query
$products = Cache::remember('all_products', function() {
    return get_posts([
        'post_type' => 'product',
        'posts_per_page' => -1,
        'post_status' => 'publish'
    ]);
}, 3600); // Cache for 1 hour

// Invalidate cache when needed
add_action('save_post', function($post_id) {
    if (get_post_type($post_id) === 'product') {
        Cache::delete('all_products');
    }
});
```

### Example 4: Extending Frontend with Custom Functionality

```php
// In your custom plugin or theme
add_action('WCF_ANIMATION_BUILDER_LOADED', function() {
    $plugin = \WcfAnimationBuilder\Plugin::get_instance(WCF_ANIMATION_BUILDER_PLUGIN_FILE);
    $frontend = $plugin->get_frontend();
    
    if ($frontend) {
        $asset_loader = $frontend->get_asset_loader();
        
        // Add custom assets
        add_action('wp_enqueue_scripts', function() use ($asset_loader) {
            $asset_loader->enqueue_style('custom-style', 'assets/custom.css');
        }, 20);
    }
});
```

### Example 5: Creating a Custom Decorator

```php
namespace WcfAnimationBuilder\Decorator;

class MinifiedAssetLoaderDecorator extends AssetLoaderDecorator
{
    private bool $minify;

    public function __construct(AssetLoader $asset_loader, bool $minify = true)
    {
        parent::__construct($asset_loader);
        $this->minify = $minify;
    }

    public function enqueue_script(string $handle, string $file_path, array $dependencies = [], bool $in_footer = true): void
    {
        if ($this->minify) {
            $file_path = str_replace('.js', '.min.js', $file_path);
        }
        $this->asset_loader->enqueue_script($handle, $file_path, $dependencies, $in_footer);
    }
}
```

---

## Best Practices

### 1. Always Use Factory Pattern
```php
// ✅ Good
$backend = ComponentFactory::create_backend();

// ❌ Bad
$backend = new \WcfAnimationBuilder\Backend\Backend();
```

### 2. Use Caching for Expensive Operations
```php
// ✅ Good - Uses cache
$value = Cache::remember('key', fn() => expensive_operation(), 3600);

// ❌ Bad - No caching
$value = expensive_operation();
```

### 3. Conditional Asset Loading
```php
// ✅ Good - Conditional loading
$loader = new ConditionalAssetLoaderDecorator(
    $base_loader,
    fn() => is_single()
);

// ❌ Bad - Always loads
$base_loader->enqueue_style('style', 'style.css');
```

### 4. Use Helper Methods
```php
// ✅ Good - Uses helper with caching
$option = Helper::get_option('my_key');

// ❌ Bad - Direct database query
$option = get_option('wcf_animation_builder_options')['my_key'];
```

### 5. Sanitize All Input
```php
// ✅ Good
// Sanitize data using WordPress native functions
$data = isset($_POST['data']) ? wp_unslash($_POST['data']) : '';
$data = sanitize_text_field($data);
$nonce = isset($_REQUEST['wcf_animation_builder_nonce']) ? sanitize_text_field(wp_unslash($_REQUEST['wcf_animation_builder_nonce'])) : '';
$nonce_valid = wp_verify_nonce($nonce, 'wcf_animation_builder_nonce');

// ❌ Bad
$data = $_POST['data'];
```

### 6. Performance Monitoring
```php
// ✅ Good - Monitor performance
Performance::start_timer('operation');
// ... code ...
$elapsed = Performance::stop_timer('operation');
```

---

## Constants Reference

### Plugin Constants
- `WCF_ANIMATION_BUILDER_VERSION` - Plugin version
- `WCF_ANIMATION_BUILDER_PLUGIN_FILE` - Main plugin file path
- `WCF_ANIMATION_BUILDER_PLUGIN_DIR` - Plugin directory path
- `WCF_ANIMATION_BUILDER_PLUGIN_URL` - Plugin URL
- `WCF_ANIMATION_BUILDER_PLUGIN_BASENAME` - Plugin basename
- `WCF_ANIMATION_BUILDER_LOADED` - Loaded flag

### Option Names
- `wcf_animation_builder_options` - Main options array
- `wcf_animation_builder_version` - Stored version
- `wcf_animation_builder_creation_date` - Creation date

### Post Meta Keys
- `_wcf_animation_data` - Animation data meta key

---

## Extension Points

### Adding Custom Animation Strategies

1. Create strategy class implementing `AnimationStrategyInterface`
2. Register with `AnimationStrategyFactory::register()`
3. Use with `AnimationStrategyFactory::create()`

### Adding Custom Decorators

1. Extend `AssetLoaderDecorator` class
2. Override methods to add functionality
3. Wrap existing loader instance

### Hooking into Plugin Lifecycle

```php
// After plugin loads
add_action('WCF_ANIMATION_BUILDER_LOADED', function() {
    // Your code here
});

// On activation
add_action('wcf_animation_builder_activated', function() {
    // Your code here
});

// On deactivation
add_action('wcf_animation_builder_deactivated', function() {
    // Your code here
});
```

---

## Performance Tips

1. **Use Cache:** Always cache expensive operations
2. **Lazy Loading:** Load components only when needed
3. **Conditional Loading:** Use decorators for conditional assets
4. **Batch Operations:** Process items in batches
5. **Defer Execution:** Use `Performance::defer()` for non-critical operations
6. **Monitor Performance:** Use timers to identify bottlenecks

---

## Troubleshooting

### Common Issues

1. **Classes not found:** Check namespace and autoloader
2. **Cache issues:** Clear cache with `Helper::clear_options_cache()`
3. **Performance issues:** Enable performance monitoring
4. **Asset loading:** Check conditions in decorators

### Debug Mode

```php
// Enable debug logging
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);

// Helper will log to debug.log
Helper::log('Debug message', 'error');
```

---

## Support

For issues, questions, or contributions, please refer to the plugin repository or contact the development team.

