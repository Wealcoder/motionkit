# Why Performance.php Exists

## Purpose

The `Performance.php` helper class provides essential **performance monitoring and optimization utilities** for the plugin. It helps developers:

1. **Identify bottlenecks** - Find slow operations
2. **Optimize execution** - Defer non-critical tasks
3. **Monitor resources** - Track memory usage
4. **Improve efficiency** - Batch process large datasets

## Key Features & Benefits

### 1. Performance Timers ⏱️

**Problem:** Hard to identify slow code without measurement

**Solution:** Start/stop timers to measure execution time

```php
// Measure how long an operation takes
Performance::start_timer('database_query');
$posts = get_posts(['posts_per_page' => -1]);
$elapsed = Performance::stop_timer('database_query');

// Log slow operations
if ($elapsed > 1.0) {
    Helper::log("Slow query took {$elapsed}s", 'warning');
}
```

**Benefits:**
- Identify performance bottlenecks
- Monitor query execution times
- Debug slow page loads
- Optimize based on real data

---

### 2. Defer Execution 🚀

**Problem:** Non-critical operations slow down page load

**Solution:** Execute code at shutdown (after page is sent to user)

```php
// Instead of running immediately (blocks page load)
log_analytics(); // ❌ Blocks page

// Defer to shutdown (doesn't block page)
Performance::defer(function() {
    log_analytics(); // ✅ Runs after page is sent
}, 999);
```

**Benefits:**
- Faster page load times
- Better user experience
- Non-critical tasks don't block rendering

**Real-world example:**
```php
// Log user activity without slowing down page
Performance::defer(function() {
    update_user_meta(get_current_user_id(), 'last_seen', time());
}, 999);
```

---

### 3. Lazy Loading 🔄

**Problem:** Loading data that might not be needed

**Solution:** Only execute when condition is met

```php
// Only load expensive data when needed
$animation_data = Performance::lazy_load(
    function() {
        return expensive_database_query(); // Only runs if condition is true
    },
    function() {
        return is_single() && get_post_type() === 'product'; // Condition
    }
);
```

**Benefits:**
- Avoid unnecessary processing
- Reduce database queries
- Improve overall performance
- Conditional execution

**Real-world example:**
```php
// Only load animation data on product pages
$animations = Performance::lazy_load(
    fn() => get_post_meta(get_the_ID(), '_wcf_animation_data', true),
    fn() => is_single('product')
);
```

---

### 4. Batch Processing 📦

**Problem:** Processing thousands of items causes timeouts/memory issues

**Solution:** Process items in smaller batches

```php
// Process 1000 items at once - might timeout
foreach ($items as $item) {
    process($item); // ❌ Could timeout
}

// Process in batches of 100
$processed = Performance::batch_process(
    $items,
    fn($item) => process($item), // ✅ Processes in batches
    100
);
```

**Benefits:**
- Prevents timeouts
- Reduces memory usage
- Better for large datasets
- More reliable processing

**Real-world example:**
```php
// Update 10,000 products in batches
$products = get_posts(['post_type' => 'product', 'posts_per_page' => -1]);
Performance::batch_process(
    $products,
    function($product) {
        update_post_meta($product->ID, '_processed', time());
    },
    100 // Process 100 at a time
);
```

---

### 5. Request Type Checking 🔍

**Problem:** Running code unnecessarily on different request types

**Solution:** Check request type before execution

```php
// Skip expensive operations on admin/AJAX/cron
if (Performance::should_skip()) {
    return; // Don't run on admin/AJAX/cron
}

// Only run on frontend
if (!Performance::is_admin()) {
    load_frontend_assets();
}
```

**Benefits:**
- Avoid unnecessary processing
- Faster admin panel
- Better AJAX performance
- Context-aware execution

**Real-world example:**
```php
// Plugin already uses this in Plugin.php
if (Performance::should_skip()) {
    return; // Skip initialization on AJAX/cron
}
```

---

### 6. Memory Monitoring 💾

**Problem:** Plugin causing memory issues

**Solution:** Monitor memory usage

```php
$memory_before = Performance::get_memory_usage();

// Do something
load_large_data();

$memory_after = Performance::get_memory_usage();
$memory_used = $memory_after - $memory_before;

if ($memory_used > 10 * 1024 * 1024) { // More than 10MB
    Helper::log("High memory usage: " . size_format($memory_used), 'warning');
}
```

**Benefits:**
- Identify memory leaks
- Monitor resource usage
- Debug memory issues
- Optimize data handling

---

## Real-World Usage Examples

### Example 1: Monitoring Animation Loading

```php
// In Frontend.php
public function enqueue_scripts(): void
{
    Performance::start_timer('animation_load');
    
    $animation_data = get_post_meta(get_the_ID(), '_wcf_animation_data', true);
    
    $elapsed = Performance::stop_timer('animation_load');
    if ($elapsed > 0.5) {
        Helper::log("Slow animation load: {$elapsed}s", 'warning');
    }
}
```

### Example 2: Deferring Analytics

```php
// Track page views without blocking
Performance::defer(function() {
    // This runs after page is sent to user
    $analytics = [
        'page' => get_permalink(),
        'time' => time(),
        'user' => get_current_user_id()
    ];
    // Send to analytics service
}, 999);
```

### Example 3: Conditional Animation Loading

```php
// Only load animations when needed
$animations = Performance::lazy_load(
    function() {
        return $this->get_all_animations(); // Expensive operation
    },
    function() {
        return is_single() 
            && get_post_meta(get_the_ID(), '_wcf_animation_enabled', true) === 'yes';
    }
);
```

### Example 4: Batch Processing Products

```php
// Process products in batches to avoid timeout
$products = get_posts(['post_type' => 'product', 'posts_per_page' => -1]);
Performance::batch_process(
    $products,
    function($product) {
        // Update each product
        $animation_data = generate_animation($product);
        update_post_meta($product->ID, '_wcf_animation_data', $animation_data);
    },
    50 // Process 50 at a time
);
```

---

## Performance Impact

### Without Performance Helper

```php
// ❌ Slow - blocks page load
$data = expensive_query(); // Takes 2 seconds
log_analytics(); // Takes 0.5 seconds
process_1000_items(); // Takes 5 seconds, might timeout

// Total: 7.5 seconds page load!
```

### With Performance Helper

```php
// ✅ Fast - optimized
$data = Cache::remember('data', fn() => expensive_query(), 3600); // Cached
Performance::defer(fn() => log_analytics(), 999); // Deferred
Performance::batch_process($items, $processor, 100); // Batched

// Total: 0.2 seconds page load!
```

---

## When to Use Performance Helper

### ✅ Use Performance Helper When:

1. **Monitoring slow operations** - Use timers
2. **Deferring non-critical tasks** - Use `defer()`
3. **Conditional loading** - Use `lazy_load()`
4. **Processing large datasets** - Use `batch_process()`
5. **Checking request type** - Use `is_admin()`, `is_ajax()`, etc.
6. **Monitoring memory** - Use memory functions

### ❌ Don't Use Performance Helper For:

- Simple operations (< 0.01 seconds)
- Critical synchronous operations
- Operations that must complete immediately

---

## Summary

The `Performance.php` helper exists to:

1. **Make the plugin faster** - Defer, lazy load, batch process
2. **Identify bottlenecks** - Monitor with timers
3. **Prevent issues** - Batch processing prevents timeouts
4. **Better UX** - Non-blocking operations
5. **Development tool** - Debug and optimize easily

**Without it:** Harder to optimize, slower plugin, more memory issues  
**With it:** Easy optimization, faster plugin, better performance monitoring

This is a **developer tool** that helps you build a faster, more efficient plugin! 🚀

