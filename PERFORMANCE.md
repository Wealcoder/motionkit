# Performance Optimization Guide

This document outlines the performance optimizations implemented in the GSAP Animation Builder plugin and best practices for maintaining optimal performance.

## Overview

The plugin has been optimized with the following performance enhancements:

1. **Caching System** - Object caching for options and expensive operations
2. **Lazy Loading** - Components loaded only when needed
3. **Conditional Asset Loading** - Assets loaded based on context
4. **Duplicate Prevention** - Prevents duplicate asset enqueueing
5. **Request Optimization** - Skips initialization on unnecessary requests

## Caching

### Option Caching

Plugin options are automatically cached to avoid duplicate database queries:

```php
use WcfAnimationBuilder\Helpers\Helper;

// Automatically uses cache
$option = Helper::get_option('my_key', 'default');

// Clear cache when updating
Helper::update_option('my_key', 'new_value');
Helper::clear_options_cache();
```

### Object Cache

Use the Cache helper for expensive operations:

```php
use WcfAnimationBuilder\Helpers\Cache;

// Cache expensive query (1 hour expiration)
$products = Cache::remember('all_products', function() {
    return get_posts([
        'post_type' => 'product',
        'posts_per_page' => -1,
        'post_status' => 'publish'
    ]);
}, 3600);

// Get from cache
$value = Cache::get('my_key', 'default');

// Set cache
Cache::set('my_key', $value, 3600);

// Delete cache
Cache::delete('my_key');

// Flush all plugin cache
Cache::flush();
```

### Cache Best Practices

1. **Set Appropriate Expiration Times**
   - Short-lived data: 300 seconds (5 minutes)
   - Medium-lived data: 3600 seconds (1 hour)
   - Long-lived data: 86400 seconds (24 hours)

2. **Invalidate Cache on Updates**
   ```php
   add_action('save_post', function($post_id) {
       if (get_post_type($post_id) === 'product') {
           Cache::delete('all_products');
       }
   });
   ```

3. **Use Remember Pattern**
   ```php
   // Automatically handles cache get/set
   $data = Cache::remember('key', function() {
       return expensive_operation();
   }, 3600);
   ```

## Lazy Loading

### Component Initialization

Components are loaded only when needed:

```php
// Frontend only loads on frontend
if (!is_admin()) {
    $frontend = ComponentFactory::create_frontend();
}

// Backend only loads in admin
if (is_admin()) {
    $backend = ComponentFactory::create_backend();
}
```

### Skip Unnecessary Initialization

The plugin automatically skips initialization on:
- AJAX requests (unless plugin's AJAX)
- Cron requests
- REST API requests (when not needed)

## Conditional Asset Loading

### Using ConditionalAssetLoaderDecorator

Load assets only when needed:

```php
use WcfAnimationBuilder\Decorator\ConditionalAssetLoaderDecorator;
use WcfAnimationBuilder\Factory\ComponentFactory;

// Create base loader
$base_loader = ComponentFactory::create_asset_loader();

// Load only on single posts
$loader = new ConditionalAssetLoaderDecorator(
    $base_loader,
    fn() => is_single()
);

// Assets only load if condition is true
$loader->enqueue_style('style', 'assets/style.css');
```

### Common Conditions

```php
// Load on product pages only
fn() => function_exists('is_product') && is_product()

// Load for logged-in users only
fn() => is_user_logged_in()

// Load for administrators only
fn() => current_user_can('manage_options')

// Load on specific post types
fn() => is_singular('product')

// Load when post has animation data
fn() => !empty(get_post_meta(get_the_ID(), '_wcf_animation_data', true))
```

## Duplicate Prevention

### Asset Handle Registry

The AssetLoader automatically prevents duplicate enqueueing:

```php
// First call - asset is enqueued
$loader->enqueue_style('my-style', 'assets/style.css');

// Second call - skipped (already registered)
$loader->enqueue_style('my-style', 'assets/style.css');
```

## Performance Monitoring

### Performance Helper

Monitor performance with the Performance helper:

```php
use WcfAnimationBuilder\Helpers\Performance;

// Start timer
Performance::start_timer('operation');

// ... do something ...

// Stop timer and get elapsed time
$elapsed = Performance::stop_timer('operation');

// Defer execution to shutdown
Performance::defer(function() {
    // Runs at shutdown (lower priority)
}, 999);

// Lazy load with condition
$result = Performance::lazy_load(
    fn() => expensive_operation(),
    fn() => is_single() // condition
);

// Batch process items
$processed = Performance::batch_process(
    $items,
    fn($item) => process_item($item),
    100 // batch size
);
```

### Memory Monitoring

```php
// Get current memory usage
$memory = Performance::get_memory_usage();

// Get peak memory usage
$peak = Performance::get_peak_memory_usage();
```

## Best Practices

### 1. Always Cache Expensive Operations

```php
// ✅ Good
$data = Cache::remember('expensive', fn() => expensive_query(), 3600);

// ❌ Bad
$data = expensive_query();
```

### 2. Use Conditional Loading

```php
// ✅ Good
$loader = new ConditionalAssetLoaderDecorator($base_loader, fn() => is_single());

// ❌ Bad - Always loads
$base_loader->enqueue_style('style', 'style.css');
```

### 3. Defer Non-Critical Operations

```php
// ✅ Good - Defer to shutdown
Performance::defer(fn() => log_analytics(), 999);

// ❌ Bad - Runs immediately
log_analytics();
```

### 4. Batch Process Large Datasets

```php
// ✅ Good - Process in batches
Performance::batch_process($items, $processor, 100);

// ❌ Bad - Process all at once
foreach ($items as $item) {
    process($item);
}
```

### 5. Monitor Performance

```php
// ✅ Good - Monitor timing
Performance::start_timer('query');
$results = get_posts(...);
$elapsed = Performance::stop_timer('query');
if ($elapsed > 1.0) {
    Helper::log("Slow query: {$elapsed}s", 'warning');
}
```

## Performance Checklist

- [ ] Options are cached using `Helper::get_option()`
- [ ] Expensive operations use `Cache::remember()`
- [ ] Assets are loaded conditionally using decorators
- [ ] Components are lazy loaded
- [ ] Duplicate asset enqueueing is prevented
- [ ] Non-critical operations are deferred
- [ ] Large datasets are processed in batches
- [ ] Performance is monitored for bottlenecks
- [ ] Cache is invalidated on data updates

## Troubleshooting Performance Issues

### Identify Slow Operations

```php
// Add performance monitoring
Performance::start_timer('my_operation');
// ... your code ...
$elapsed = Performance::stop_timer('my_operation');
Helper::log("Operation took: {$elapsed}s", 'info');
```

### Check Memory Usage

```php
$memory = Performance::get_memory_usage();
Helper::log("Memory: " . size_format($memory), 'info');
```

### Clear Cache

```php
// Clear specific cache
Cache::delete('my_key');

// Clear all plugin cache
Cache::flush();

// Clear options cache
Helper::clear_options_cache();
```

## Additional Resources

- [WordPress Object Cache](https://developer.wordpress.org/reference/classes/wp_object_cache/)
- [WordPress Performance Best Practices](https://developer.wordpress.org/advanced-administration/performance/)
- [Plugin Performance Guide](https://developer.wordpress.org/plugins/plugin-basics/best-practices/)

