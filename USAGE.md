# MotionKit Connector for WordPress — Usage Guide

## Overview

This plugin is the WordPress connector for **MotionKit** (motionkit.io). It handles:

1. **Animation script runner** — Conditionally enqueues GSAP animations on the frontend
2. **Page type detection** — Identifies the current WP page and resolves the correct storage key
3. **Config storage** — Saves/loads animation configs per page (post_meta, term_meta, or wp_option)
4. **AJAX endpoints** — Save/delete configs from the SaaS editor via postMessage bridge

The visual editor lives at **motionkit.io** — this plugin does NOT include any editor UI.

---

## Plugin Architecture

```
gsap-animation-builder-for-wordpress.php    <- Entry point, MOTIONKIT_* constants
|
+-- includes/
|   +-- Plugin.php                          <- Singleton orchestrator
|   +-- Autoloader.php                      <- PSR-4 autoloader (WcfAnimationBuilder\)
|   |
|   +-- Backend/
|   |   +-- Backend.php                     <- Admin: quick links on post/page rows
|   |
|   +-- Frontend/
|   |   +-- Frontend.php                    <- Script loading, AJAX handlers, preset resolution
|   |
|   +-- Common/
|   |   +-- MotionkitBuilderPageType.php    <- Page type detection + save/get/delete config
|   |   +-- Assets/
|   |   |   +-- AssetLoader.php             <- wp_enqueue wrapper with deduplication
|   |   +-- configs/
|   |       +-- animation-builder-assets.php   <- Preset asset registry (src, deps)
|   |       +-- animation-builder-device.php   <- Responsive breakpoints
|   |
|   +-- Factory/
|   |   +-- ComponentFactory.php            <- Static factory for component creation
|   |
|   +-- Helpers/
|       +-- Helper.php                      <- Options, version, debug log
|
+-- src/                                    <- JS source (webpack entry points)
|   +-- modules/animation-builder/
|       +-- frontend.js                     <- Main frontend runner
|       +-- lib/
|       |   +-- utils.js                    <- handleMediaQuery + editor utils
|       |   +-- animations/animations.js
|       |   +-- FreeAnimation/previewEventHelper.js  <- IntersectionObserver triggers
|       +-- frontend/animation-type/freePreset/      <- 9 free animation modules
|       +-- register/freeAnimClassMapping.js
|       +-- utils/
|   +-- css/freeAnim.css
|
+-- assets/build/                           <- Compiled output
    +-- modules/animation-builder/
        +-- frontend.js                     <- Bundled frontend runner
        +-- freeAnim.css                    <- Free animation styles
        +-- frontend/freePresets/           <- 9 compiled free preset scripts
```

---

## Init Flow

```
gsap-animation-builder-for-wordpress.php
  -> Plugin::get_instance()
    -> plugins_loaded hook
      -> Plugin::init()
        +-- init_frontend()         -> Frontend (all contexts)
        |   +-- wp_enqueue_scripts  -> Script loading (non-admin only)
        |   +-- wp_ajax_*           -> AJAX handlers (admin context)
        +-- init_backend()          -> Backend (admin only)
      -> do_action('MOTIONKIT_LOADED')
```

### Why Frontend initializes in all contexts

AJAX requests run through `admin-ajax.php` where `is_admin() = true`. Frontend registers:

- `wp_enqueue_scripts` — guarded with `!is_admin()`, only fires on page loads
- `wp_ajax_*` — fires in admin context for config save/delete operations

---

## Page Type Detection

`MotionkitBuilderPageType::getCurrentPageType()` returns a config array for any WordPress page:

| Page Type               | store_type  | option key pattern                         |
| ----------------------- | ----------- | ------------------------------------------ |
| Static front page       | `option`    | `motionkit_pg_animation_front_{page_id}`      |
| Blog homepage           | `option`    | `motionkit_pg_animation_blog`                 |
| Single post/page        | `post_meta` | `motionkit_pg_animation_{post_type}`          |
| Category/Tag (global)   | `option`    | `motionkit_pg_animation_{taxonomy}`           |
| Category/Tag (specific) | `term_meta` | `motionkit_pg_animation_{taxonomy}_{term_id}` |
| Custom taxonomy         | `option`    | `motionkit_pg_animation_{taxonomy}`           |
| Author archive          | `option`    | `motionkit_pg_animation_author`               |
| 404 page                | `option`    | `motionkit_pg_animation_404`                  |
| Search page             | `option`    | `motionkit_pg_animation_search`               |
| Archive                 | `option`    | `motionkit_pg_animation_{path}`               |
| Unknown URL             | `option`    | `motionkit_pg_animation_{path}`               |

Config array shape:

```php
[
    'type'       => 'post',          // page category
    'store_type' => 'post_meta',     // storage backend: option | post_meta | term_meta
    'id'         => 123,             // post/term ID (when applicable)
    'option'     => 'motionkit_pg_animation_post',  // storage key
    'taxonomy'   => 'category',      // taxonomy slug (when applicable)
]
```

---

## Frontend Script Loading

**File**: `Frontend.php::enqueue_frontend_scripts()`

### Conditional loading flow

```
1. page_type->getConfig()
   |-- empty/not array? -> EARLY RETURN (no scripts loaded)
   |
2. get_active_presets(config) -> find enabled presets, set $is_custom, $is_free flags
   |
3. Register + enqueue frontend.js (deps via filter, wp-element removed)
   |
4. If $is_free -> enqueue_free_presets()
   |   |-- Load animation-builder-assets.php config
   |   |-- get_active_element_keys() from WP option
   |   |-- Enqueue freeAnim.css + matching free preset scripts
   |
5. Load + sanitize device breakpoints
   |
6. wp_localize_script('motionkit-frontend', 'wcfanimb', ...)
   |
7. do_action('wcf_animation_builder/frontend/presets/enqueue_element_scripts', ...)
```

### Performance guards

- **No config = no scripts** — early return before any file inclusion
- **Config files loaded only when needed** — `include` happens after the config check
- **Free preset scripts are surgical** — only scripts matching both active elements AND page config are enqueued
- **Deduplication** — preset handles are unique, array_unique prevents double-enqueue

### Global object: `wcfanimb`

```js
wcfanimb = {
    animation_config: { desktop: [...], laptop: [...], ... },
    device_config: [
        { key: 'desktop', mediaQuery: '(min-width: 1441px)', ... },
        { key: 'laptop',  mediaQuery: '(min-width: 1200px) and (max-width: 1440px)', ... },
        ...
    ]
}
```

### Execution flow (frontend.js)

1. On `window.load`, initializes `gsap.matchMedia()`
2. Iterates `device_config` breakpoints
3. For each breakpoint, collects enabled animations by type: `preset`, `custom`, `free_animation`
4. Dispatches `CustomEvent("aae-animation-event")` with collected animation map
5. Individual preset scripts listen for this event and run their animations

---

## AJAX Endpoints

All endpoints require:

- Nonce: `wcf-admin-preview-nonce` (via `wcf_nonce` field)
- Capability: `manage_options`

| Action                               | Method | POST params                                         | Description                 |
| ------------------------------------ | ------ | --------------------------------------------------- | --------------------------- |
| `motionkit_builder_pagetype_configs` | POST   | `pageTypeConfigs` (JSON), `animationConfigs` (JSON) | Save page-specific config   |
| `wcf_anim_builder_configs_delete`    | POST   | `pageTypeConfigs` (JSON)                            | Delete page-specific config |
| `motionkit_builder_gl_configs_store` | POST   | `animationConfigs` (JSON)                           | Save global config          |
| `wcf_anim_builder_gl_configs_delete` | POST   | —                                                   | Delete global config        |

### Error handling

- Missing fields -> 400 with descriptive message
- Invalid JSON -> 400
- Non-array after decode -> 400
- Insufficient permissions -> 403

---

## Responsive Breakpoints

| Key        | Title            | Media Query                                   |
| ---------- | ---------------- | --------------------------------------------- |
| `desktop`  | Desktop          | `(min-width: 1441px)`                         |
| `laptop`   | Laptop           | `(min-width: 1200px) and (max-width: 1440px)` |
| `tab_land` | Tablet Landscape | `(min-width: 1024px) and (max-width: 1199px)` |
| `tab`      | Tablet           | `(min-width: 768px) and (max-width: 1023px)`  |
| `mobile`   | Mobile           | `(max-width: 767px)`                          |

---

## Animation Config Shape

Each animation entry in the config:

```json
{
  "id": "unique-id",
  "type": "preset | custom | free_animation",
  "preset": "wcf-text-split-animation",
  "enable": 1,
  "selector": ".my-element",
  "...": "animation-specific properties"
}
```

---

## WordPress Options

| Option Key                                 | Purpose                             |
| ------------------------------------------ | ----------------------------------- |
| `wcf_animation_builder_options`            | Plugin settings (enable flags)      |
| `wcf_animation_builder_version`            | Installed version                   |
| `wcf_animation_builder_creation_date`      | Install date                        |
| `aae_anim_builder_settings`                | Premium preset toggle states (JSON) |
| `wcf_anim_builder_free_animation_settings` | Free animation toggle states (JSON) |
| `motionkit_global_settings`                | Global animation configs (JSON)     |
| `motionkit_pg_animation_*`                    | Per-page animation configs          |

---

## Available Presets

### Premium Presets (require GSAP + ScrollTrigger)

- `wcf-scroll-video-animation`
- `wcf-horizontal-scroll-animation`
- `wcf-cube-scroll-reveal-animation`
- `wcf-image-reveal-animation`
- `wcf-image-hover-reveal-animation`
- `wcf-cursor-hover-reveal-animation`
- `wcf-cursor-hover-move-animation`
- `wcf-image-stretch-animation`
- `wcf-image-scale-animation`
- `wcf-text-split-animation`
- `wcf-text-rotate-animation`
- `wcf-text-scale-animation`
- `wcf-text-invert-animation`
- `wcf-text-spin-animation`
- `wcf-popup-media-animation`
- `wcf-container-fade-animation`
- `wcf-header-sticky-animation`

### Free Presets (no GSAP dependency)

- `wcf-ab-gen-sil-fa` — General Space In Left
- `wcf-general-sir-free-animation` — General Space In Right
- `wcf-general-swap-free-animation` — General Swap
- `wcf-general-tid-free-animation` — General Twister In Down
- `wcf-image-swash-in-free-animation` — Image Swash In
- `wcf-image-vanish-in-free-animation` — Image Vanish In
- `wcf-text-clip-reveal-free-animation` — Text Clip Reveal
- `wcf-text-clip-slide-up-free-animation` — Text Clip Slide Up
- `wcf-text-clip-slide-right-free-animation` — Text Clip Slide Right

---

## Constants

| Constant                    | Value                         |
| --------------------------- | ----------------------------- |
| `MOTIONKIT_VERSION`         | `'1.0.0'`                     |
| `MOTIONKIT_PLUGIN_FILE`     | Main plugin file path         |
| `MOTIONKIT_PLUGIN_DIR`      | Plugin directory path         |
| `MOTIONKIT_PLUGIN_URL`      | Plugin URL                    |
| `MOTIONKIT_PLUGIN_BASENAME` | Plugin basename               |
| `MOTIONKIT_LOADED`          | `true` (duplicate load guard) |

---

## Hooks & Filters

### Actions

- `MOTIONKIT_LOADED` — Fired after plugin init
- `wcf_animation_builder_activated` — Fired on plugin activation
- `wcf_animation_builder_deactivated` — Fired on plugin deactivation
- `wcf_animation_builder/frontend/presets/enqueue_element_scripts` — Extend frontend preset enqueue (used by Pro)

### Filters

- `motionkit_core_lib_deps` — Modify core JS dependencies (default: `[]`, Pro adds gsap/ScrollTrigger)

---

## Build

```bash
npm run build    # Production build
npm run start    # Development watch
```

Webpack config: `@wordpress/scripts` base with custom entry points for frontend and free presets.
