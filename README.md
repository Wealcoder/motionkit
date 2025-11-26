# GSAP Animation Builder for WordPress

A powerful and customizable GSAP animation builder plugin for WordPress that allows you to create stunning animations with ease.

## Features

- 🎨 **Easy Animation Creation** - Build animations with a visual interface
- ⚡ **Performance Optimized** - Lazy loading, caching, and conditional asset loading
- 🏗️ **Modern Architecture** - Built with design patterns (Factory, Strategy, Decorator, Singleton)
- 🔒 **Secure** - Comprehensive security measures and data sanitization
- 🌐 **Extensible** - Easy to extend with custom strategies and decorators
- 📚 **Well Documented** - Comprehensive developer documentation

## Requirements

- WordPress 6.7+
- PHP 7.4+
- GSAP Library (loaded separately or included)

## Installation

1. Upload the plugin folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Configure settings as needed

## Quick Start

### Basic Usage

```php
// Get plugin instance
$plugin = \WcfAnimationBuilder\Plugin::get_instance(WCF_ANIMATION_BUILDER_PLUGIN_FILE);

// Access helpers
$option = \WcfAnimationBuilder\Helpers\Helper::get_option('my_key', 'default');
```

### Using Animation Strategies

```php
use WcfAnimationBuilder\Strategy\AnimationStrategyFactory;

// Create fade animation
$fade_strategy = AnimationStrategyFactory::create('fade');
$config = ['duration' => 1, 'ease' => 'power2.out'];
$animation_code = $fade_strategy->execute($config);

// Create slide animation
$slide_strategy = AnimationStrategyFactory::create('slide');
$config = ['duration' => 1, 'direction' => 'left'];
$animation_code = $slide_strategy->execute($config);
```

### Conditional Asset Loading

```php
use WcfAnimationBuilder\Decorator\ConditionalAssetLoaderDecorator;
use WcfAnimationBuilder\Factory\ComponentFactory;

$base_loader = ComponentFactory::create_asset_loader();
$conditional_loader = new ConditionalAssetLoaderDecorator(
    $base_loader,
    fn() => is_single()
);

$conditional_loader->enqueue_style('my-style', 'assets/style.css');
```

## Performance Optimizations

The plugin includes several performance optimizations:

- **Caching System** - Object caching for options and expensive operations
- **Lazy Loading** - Components loaded only when needed
- **Conditional Loading** - Assets loaded based on context
- **Duplicate Prevention** - Prevents duplicate asset enqueueing
- **Skip Unnecessary Requests** - Skips initialization on AJAX/cron requests

### Using Cache

```php
use WcfAnimationBuilder\Helpers\Cache;

// Cache expensive operation
$data = Cache::remember('key', function() {
    return expensive_operation();
}, 3600);

// Get/Set cache
Cache::set('key', $value, 3600);
$value = Cache::get('key', 'default');
```

## Developer Documentation

For detailed developer documentation, see [DEVELOPER.md](./DEVELOPER.md)

## Hooks & Filters

### Actions

- `WCF_ANIMATION_BUILDER_LOADED` - Fired after plugin initialization
- `wcf_animation_builder_activated` - Fired on activation
- `wcf_animation_builder_deactivated` - Fired on deactivation

### Usage Example

```php
add_action('WCF_ANIMATION_BUILDER_LOADED', function() {
    // Your code here
});
```

## Constants

- `WCF_ANIMATION_BUILDER_VERSION` - Plugin version
- `WCF_ANIMATION_BUILDER_PLUGIN_DIR` - Plugin directory path
- `WCF_ANIMATION_BUILDER_PLUGIN_URL` - Plugin URL
- `WCF_ANIMATION_BUILDER_PLUGIN_FILE` - Main plugin file

## Support

For support, feature requests, or bug reports, please visit the plugin repository.

## License

GPL v2 or later

## Credits

Built with modern PHP practices and WordPress coding standards.

