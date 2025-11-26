# Traits Directory

This directory contains PHP traits that provide reusable functionality across multiple classes.

## What are Traits?

Traits are a mechanism for code reuse in single inheritance languages like PHP. They allow you to share methods across multiple classes without inheritance.

## Available Traits

### AnimationBuilderTrait

**Location:** `AnimationBuilderTrait.php`

**Purpose:** Provides reusable methods for animation builder functionality.

**Methods:**

- `get_active_element_keys()` - Get keys of all active elements in animation builder data
- `get_active_presets(array $data, bool &$custom)` - Get active presets from animation data
- `get_animation_builder_settings()` - Get animation builder settings
- `update_animation_builder_settings(array $settings)` - Update animation builder settings
- `is_animation_builder_enabled()` - Check if animation builder is enabled

## Usage Example

```php
namespace WcfAnimationBuilder\Backend;

use WcfAnimationBuilder\Traits\AnimationBuilderTrait;

class AnimationBuilder
{
    use AnimationBuilderTrait;

    public function get_active_animations(): array
    {
        $settings = $this->get_animation_builder_settings();
        $custom = false;
        $presets = $this->get_active_presets($settings, $custom);
        
        return [
            'presets' => $presets,
            'has_custom' => $custom,
        ];
    }
}
```

## Best Practices

1. **Use traits for horizontal code reuse** - When multiple classes need the same functionality
2. **Keep traits focused** - Each trait should have a single, clear purpose
3. **Document methods** - All trait methods should be well-documented
4. **Namespace properly** - Traits should be in their own namespace

## Creating New Traits

When creating a new trait:

1. Place it in this `Traits/` directory
2. Use proper namespace: `WcfAnimationBuilder\Traits`
3. Follow naming convention: `{Purpose}Trait.php`
4. Add security check (`ABSPATH` check)
5. Add PHPDoc comments
6. Follow WordPress coding standards

## Example: Creating a New Trait

```php
<?php

namespace WcfAnimationBuilder\Traits;

/**
 * My New Trait
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

trait MyNewTrait
{
    /**
     * Example method
     *
     * @return string
     */
    protected function example_method(): string
    {
        return 'Hello World';
    }
}
```

