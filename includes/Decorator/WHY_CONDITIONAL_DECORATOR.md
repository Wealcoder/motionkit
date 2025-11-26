# Why ConditionalAssetLoaderDecorator?

## The Problem It Solves

Without conditional loading, you have two approaches:

### ❌ Approach 1: Load Assets Everywhere (Wasteful)

```php
public function enqueue_admin_assets($hook) {
    // This loads on ALL admin pages - wasteful!
    $this->asset_loader->enqueue_script('my-script', 'assets/js/preview.js');
    $this->asset_loader->enqueue_style('my-style', 'assets/css/admin.css');
}
```

**Problems:**
- Loads assets on pages where they're not needed
- Slows down all admin pages
- Wastes bandwidth and resources
- Poor performance

### ❌ Approach 2: Manual Condition Checks (Repetitive)

```php
public function enqueue_admin_assets($hook) {
    // Manual checks everywhere - repetitive!
    if ($hook === 'post.php' || $hook === 'post-new.php') {
        if ($post_type === 'product') {
            $this->asset_loader->enqueue_script('preview', 'assets/js/preview.js');
        }
    }
    
    if ($hook === 'post.php' || $hook === 'post-new.php') {
        if ($post_type === 'product') {
            $this->asset_loader->enqueue_style('admin', 'assets/css/admin.css');
        }
    }
    
    // Repeat conditions for every asset...
}
```

**Problems:**
- Repetitive condition code
- Hard to maintain
- Easy to make mistakes
- Conditions scattered everywhere

## ✅ Solution: ConditionalAssetLoaderDecorator

The decorator pattern solves this by **encapsulating the condition logic once** and applying it automatically:

```php
// Define condition ONCE
$conditional_loader = new ConditionalAssetLoaderDecorator(
    $base_loader,
    function() {
        global $pagenow, $post_type;
        return ($pagenow === 'post.php' || $pagenow === 'post-new.php') 
            && $post_type === 'product';
    }
);

// Use it - condition is automatically applied!
$conditional_loader->enqueue_script('preview', 'assets/js/preview.js');
$conditional_loader->enqueue_style('admin', 'assets/css/admin.css');
$conditional_loader->enqueue_script('tools', 'assets/js/tools.js');
// All assets automatically check the same condition!
```

## Key Benefits

### 1. **DRY Principle (Don't Repeat Yourself)**

```php
// ❌ Without decorator - repeat condition 3 times
if ($condition) { $loader->enqueue_script('a', 'a.js'); }
if ($condition) { $loader->enqueue_style('b', 'b.css'); }
if ($condition) { $loader->enqueue_script('c', 'c.js'); }

// ✅ With decorator - define condition once
$conditional = new ConditionalAssetLoaderDecorator($loader, $condition);
$conditional->enqueue_script('a', 'a.js'); // Auto-checks condition
$conditional->enqueue_style('b', 'b.css');  // Auto-checks condition
$conditional->enqueue_script('c', 'c.js');  // Auto-checks condition
```

### 2. **Separation of Concerns**

The decorator separates **WHAT** to load from **WHEN** to load it:

```php
// WHAT to load (business logic)
$loader->enqueue_script('preview', 'assets/js/preview.js');

// WHEN to load it (condition logic) - separated!
$conditional = new ConditionalAssetLoaderDecorator($loader, $when);
```

### 3. **Flexibility & Reusability**

Use different conditions for different contexts:

```php
// Condition 1: Only on product pages
$product_loader = new ConditionalAssetLoaderDecorator(
    $base_loader,
    fn() => get_post_type() === 'product'
);

// Condition 2: Only for administrators
$admin_loader = new ConditionalAssetLoaderDecorator(
    $base_loader,
    fn() => current_user_can('manage_options')
);

// Condition 3: Only on single posts
$single_loader = new ConditionalAssetLoaderDecorator(
    $base_loader,
    fn() => is_single()
);
```

### 4. **Easy to Test**

```php
// Easy to test with mock conditions
$always_load = new ConditionalAssetLoaderDecorator($loader, fn() => true);
$never_load = new ConditionalAssetLoaderDecorator($loader, fn() => false);
```

### 5. **Performance Optimization**

Automatically prevents unnecessary asset loading:

```php
// Assets are automatically skipped when condition is false
// No need to check condition in every enqueue call
```

## Real-World Use Cases

### Use Case 1: Different Loaders for Different Contexts

```php
class Backend {
    public function init() {
        // Create different loaders for different contexts
        $this->post_editor_loader = new ConditionalAssetLoaderDecorator(
            ComponentFactory::create_asset_loader(),
            fn() => $this->is_post_edit_page()
        );
        
        $this->settings_loader = new ConditionalAssetLoaderDecorator(
            ComponentFactory::create_asset_loader(),
            fn() => $this->is_settings_page()
        );
    }
    
    public function enqueue_admin_assets($hook) {
        // Post editor assets (only load when editing posts)
        $this->post_editor_loader->enqueue_script('editor', 'assets/js/editor.js');
        $this->post_editor_loader->enqueue_style('editor', 'assets/css/editor.css');
        
        // Settings page assets (only load on settings page)
        $this->settings_loader->enqueue_script('settings', 'assets/js/settings.js');
        $this->settings_loader->enqueue_style('settings', 'assets/css/settings.css');
    }
}
```

### Use Case 2: Conditional Loading Based on Post Meta

```php
$animation_loader = new ConditionalAssetLoaderDecorator(
    $base_loader,
    function() {
        if (!is_singular()) return false;
        return get_post_meta(get_the_ID(), '_wcf_animation_enabled', true) === 'yes';
    }
);

// Only loads if post has animation enabled
$animation_loader->enqueue_script('animations', 'assets/js/animations.js');
```

### Use Case 3: User Role-Based Loading

```php
$premium_loader = new ConditionalAssetLoaderDecorator(
    $base_loader,
    fn() => current_user_can('manage_options') || user_has_premium_access()
);

// Only loads for premium users
$premium_loader->enqueue_script('premium-features', 'assets/js/premium.js');
```

## When to Use ConditionalAssetLoaderDecorator

### ✅ Use When:

1. **Multiple assets share the same condition**
   ```php
   // All these assets need the same condition
   $loader->enqueue_script('a', 'a.js');
   $loader->enqueue_style('b', 'b.css');
   $loader->enqueue_script('c', 'c.js');
   ```

2. **Condition logic is complex or reused**
   ```php
   // Complex condition used in multiple places
   $condition = fn() => is_single() && get_post_type() === 'product' && has_animation();
   ```

3. **You want clean, maintainable code**
   - Separate concerns
   - DRY principle
   - Easy to modify conditions

4. **Performance is important**
   - Automatic conditional loading
   - No repeated checks

### ❌ Don't Use When:

1. **Single asset with simple condition**
   ```php
   // Simple inline check is fine
   if (is_single()) {
       $loader->enqueue_script('single', 'single.js');
   }
   ```

2. **Each asset has different conditions**
   ```php
   // Each asset needs different conditions - use manual checks
   if ($condition1) { $loader->enqueue_script('a', 'a.js'); }
   if ($condition2) { $loader->enqueue_style('b', 'b.css'); }
   ```

3. **Condition is very simple**
   ```php
   // Too simple for decorator overhead
   if (is_admin()) { /* ... */ }
   ```

## Comparison: Manual vs Decorator

### Manual Approach
```php
public function enqueue_admin_assets($hook) {
    global $post_type;
    
    // Repeat condition for every asset
    if (($hook === 'post.php' || $hook === 'post-new.php') && $post_type === 'product') {
        $this->asset_loader->enqueue_script('preview', 'assets/js/preview.js');
    }
    
    if (($hook === 'post.php' || $hook === 'post-new.php') && $post_type === 'product') {
        $this->asset_loader->enqueue_style('admin', 'assets/css/admin.css');
    }
    
    if (($hook === 'post.php' || $hook === 'post-new.php') && $post_type === 'product') {
        $this->asset_loader->enqueue_script('tools', 'assets/js/tools.js');
    }
}
```

**Issues:**
- Condition repeated 3 times
- Hard to modify (change in 3 places)
- Easy to make mistakes
- Code duplication

### Decorator Approach
```php
public function init() {
    $base_loader = ComponentFactory::create_asset_loader();
    
    // Define condition ONCE
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

public function enqueue_admin_assets($hook) {
    // Condition automatically applied to all assets
    $this->asset_loader->enqueue_script('preview', 'assets/js/preview.js');
    $this->asset_loader->enqueue_style('admin', 'assets/css/admin.css');
    $this->asset_loader->enqueue_script('tools', 'assets/js/tools.js');
}
```

**Benefits:**
- Condition defined once
- Easy to modify (change in 1 place)
- No repetition
- Cleaner code

## Design Pattern Benefits

The decorator pattern provides:

1. **Open/Closed Principle** - Open for extension, closed for modification
2. **Single Responsibility** - Each decorator does one thing (adds condition)
3. **Composability** - Can combine multiple decorators
4. **Flexibility** - Easy to add/remove conditions

## Summary

**ConditionalAssetLoaderDecorator exists to:**
- ✅ Eliminate code duplication (DRY)
- ✅ Separate condition logic from asset loading
- ✅ Make code more maintainable
- ✅ Improve performance (automatic conditional loading)
- ✅ Provide flexibility and reusability
- ✅ Follow design patterns (Decorator pattern)

**It's especially useful when:**
- Multiple assets share the same condition
- Conditions are complex or reused
- You want clean, maintainable code
- Performance matters

**Use it when it makes sense, but don't over-engineer simple cases!**

