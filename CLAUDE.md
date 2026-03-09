# MotionKit WordPress Connector — Claude Instructions

You are working on **MotionKit**, a WordPress plugin that connects customer sites to the **motionkit.io** SaaS animation editor. The visual editor lives entirely at `editor.motionkit.io` — this plugin is the **WordPress-side connector only**.

---

## Project Identity

| Item | Value |
|---|---|
| Plugin slug | `motionkit` |
| PHP namespace root | `WcfAnimationBuilder\` |
| Text domain | `motionkit` |
| Main file | `gsap-animation-builder-for-wordpress.php` |
| Autoloader base | `WcfAnimationBuilder\` → `includes/` (PSR-4) |
| JS global | `wcfanimb` |
| Constants prefix | `MOTIONKIT_*` |
| Editor origin | `https://editor.motionkit.io` |

---

## File Structure

```
gsap-animation-builder-for-wordpress.php   ← Entry: constants + Plugin::get_instance()
│
includes/
├── Plugin.php                             ← Singleton: init_frontend() + init_backend() + init_rest_api()
├── Autoloader.php                         ← PSR-4 loader
│
├── RestApi/
│   └── RestApi.php                        ← WP REST API: motionkit/v1/* routes + CORS
│
├── Backend/
│   └── Backend.php                        ← Admin hooks (ConnectPage to be added here)
│
├── Frontend/
│   └── Frontend.php                       ← Script enqueue, AJAX handlers, wcfanimb localization
│
├── Common/
│   ├── AnimationBuilderPageType.php       ← Page type detection + saveConfig/getConfig/deleteConfig
│   ├── Assets/
│   │   └── AssetLoader.php                ← wp_enqueue wrapper with deduplication
│   └── configs/
│       ├── animation-builder-assets.php   ← Preset asset registry
│       └── animation-builder-device.php   ← Device breakpoints
│
├── Factory/
│   └── ComponentFactory.php               ← create_frontend(), create_backend(), create_asset_loader()
│
└── Helpers/
    └── Helper.php                         ← get_option(), update_option(), log()

src/modules/animation-builder/
├── frontend.js                            ← Main animation runner (gsap.matchMedia loop)
├── editor-bridge.js                       ← postMessage bridge + REST API save calls
└── ...                                    ← Animation modules, presets, helpers

assets/build/                              ← Webpack compiled output — never edit directly
```

---

## Init Flow

```
gsap-animation-builder-for-wordpress.php
  └─ Plugin::get_instance($file)
       └─ plugins_loaded → Plugin::init()
            ├─ init_frontend()     → Frontend::init()   [all contexts]
            ├─ init_backend()      → Backend::init()    [is_admin() only]
            ├─ init_rest_api()     → RestApi::init()    [all contexts]
            ├─ admin_bar_menu      → add_admin_bar_build_animation()
            └─ wp_head/admin_head  → admin_bar_inline_css()
```

`init_rest_api()` is called unconditionally — REST must work on all request contexts including frontend iframes.

---

## ⚠️ Key Changes vs Previous Session

### 1. AJAX → REST API (biggest change)

`editor-bridge.js` now uses **WP REST API** instead of `admin-ajax.php` for config saves.

**Old (AJAX):**
```js
fetch(wcfanimb.ajaxurl, { body: new URLSearchParams({ action: 'wcf_anim_builder_configs_store', wcf_nonce, ... }) })
```

**New (REST):**
```js
fetch(restUrl("configs"), {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-WP-Nonce": wcfanimb.rest_nonce },
  credentials: "include",
  body: JSON.stringify({ pageTypeConfigs, animationConfigs })
})
```

### 2. New class: `includes/RestApi/RestApi.php`

Full WP REST API class at `WcfAnimationBuilder\RestApi\RestApi`. See the REST API section below.

### 3. `Plugin.php` additions

- `use WcfAnimationBuilder\RestApi\RestApi`
- `private ?RestApi $rest_api` property
- `init_rest_api()` called in `init()`
- `add_admin_bar_build_animation()` — frontend admin bar link to editor
- `admin_bar_inline_css()` — icon styles

### 4. `wcfanimb` has 5 new fields

```php
'rest_url'        => rest_url('motionkit/v1/'),
'rest_nonce'      => wp_create_nonce('wp_rest'),
'base_domain'     => home_url(),
'global_settings' => get_option('motionkit_global_settings', []),
'platform'        => 'wordpress',
```

### 5. Global settings option key changed

| Old | New |
|---|---|
| `wcf_global_animation_builder_configs` | `motionkit_global_settings` |

### 6. `check_permission()` is an open placeholder — must fix

```php
// CURRENT STATE — insecure:
public function check_permission() { return true; }
```

This is the #1 priority before going to production.

---

## REST API — `includes/RestApi/RestApi.php`

**Namespace:** `motionkit/v1`

| Method | Route | Handler | Description |
|---|---|---|---|
| POST | `/configs` | `store_configs()` | Save page animation config |
| DELETE | `/configs` | `delete_configs()` | Delete page animation config |
| POST | `/global-settings` | `store_global_settings()` | Save global settings |
| DELETE | `/global-settings` | `delete_global_settings()` | Delete global settings |
| GET | `/settings` | `get_settings()` | Get global settings |

**Request body (JSON):**
```json
// POST /configs
{ "pageTypeConfigs": { "store_type": "post_meta", "id": 42, "option": "cfanim_build_config_42" },
  "animationConfigs": { "desktop": [...], "laptop": [...], "mobile": [...] } }

// POST /global-settings
{ "animationConfigs": { ... } }
```

**Response:**
```json
{ "success": true, "data": { "msg": "Configurations saved", "configs": {...} } }
```

**CORS** (`add_cors_headers()`):
- Filter: `motionkit/editor/allowed_origins`
- Current allowed: `https://editor.motionkit.io`, `localhost:5173/5174/3000`, `*`
- ⚠️ Remove `*` before production

---

## Where to Put the OAuth / JWT Code

### `includes/Auth/JwtTokenManager.php` ← create new file

```
Namespace: WcfAnimationBuilder\Auth\JwtTokenManager
File:      includes/Auth/JwtTokenManager.php
```

PSR-4 autoloader resolves it automatically — no registration needed.

Key methods (all static):
- `generate(int $ttl = 300): string` — HMAC-SHA256, claims: iss/sub/iat/exp/jti
- `validate(string $token): array|WP_Error` — sig + expiry + sub + single-use jti
- `get_secret(): string` — lazy-creates 32-byte hex in `wp_options('motionkit_jwt_secret')`
- `get_api_key(): string` — lazy-creates in `wp_options('motionkit_api_key')`
- `rotate_secret(): string` — invalidates all active tokens

### `includes/Backend/ConnectPage.php` ← create new file

```
Namespace: WcfAnimationBuilder\Backend\ConnectPage
File:      includes/Backend/ConnectPage.php
```

Call `ConnectPage::register()` from `Backend::init()`.

Key methods:
- `register()` — registers all admin hooks
- `register_menu()` — top-level "MotionKit" admin menu
- `render_page()` — shows connect status / connected UI
- `handle_connect()` — generates state token + redirects to motionkit.io/authorize
- `handle_oauth_callback()` — validates state, exchanges code, saves token
- `handle_launch()` — generates JWT + redirects to editor
- `add_row_action()` — adds "Edit with MotionKit" to post/page row actions

### Fix `RestApi::check_permission()` ← edit existing file

Replace the `return true` placeholder:

```php
public function check_permission(\WP_REST_Request $request): bool|\WP_Error {
    // Path 1: WP session — iframe loaded after JWT validation by Frontend.php
    if (current_user_can('manage_options')) {
        return true;
    }

    // Path 2: Bearer JWT — for external / SaaS-initiated requests
    $auth_header = $request->get_header('Authorization');
    if ($auth_header && str_starts_with($auth_header, 'Bearer ')) {
        $token = substr($auth_header, 7);
        $result = \WcfAnimationBuilder\Auth\JwtTokenManager::validate($token);
        if (!is_wp_error($result)) {
            return true;
        }
        return new \WP_Error('rest_forbidden', 'Invalid token', ['status' => 403]);
    }

    return new \WP_Error('rest_forbidden', 'Authentication required', ['status' => 401]);
}
```

### Update `Frontend::enqueue_editor_preview_scripts()` ← edit existing file

Current check is WP-session only. Add JWT path:

```php
private function enqueue_editor_preview_scripts(): void {
    $mk_token = isset($_GET['mk_token']) ? sanitize_text_field(wp_unslash($_GET['mk_token'])) : '';

    if ($mk_token) {
        $result = \WcfAnimationBuilder\Auth\JwtTokenManager::validate($mk_token);
        if (is_wp_error($result)) {
            wp_localize_script('motionkit-frontend', 'wcfanimb', ['auth_error' => $result->get_error_message()]);
            return;
        }
    } elseif (!is_user_logged_in() || !current_user_can('manage_options')) {
        return;
    }
    // ... rest of the method unchanged
}
```

---

## `wcfanimb` JS Global — Full Shape (Editor Preview)

```js
wcfanimb = {
  // Animation data
  animation_config:  { desktop: [], laptop: [], tab_land: [], tab: [], mobile: [] },
  device_config:     [{ key, title, viewWidth, mediaQuery }, ...],
  pageTypeConfigs:   { store_type: 'post_meta', id: 42, option: 'cfanim_build_config_42' },
  global_settings:   { ... },

  // Legacy AJAX (still registered, not used by editor-bridge for saves)
  ajaxurl:           'https://yoursite.com/wp-admin/admin-ajax.php',
  nonce:             'abc123',          // wcf-admin-preview-nonce

  // REST API (used by editor-bridge.js)
  rest_url:          'https://yoursite.com/wp-json/motionkit/v1/',
  rest_nonce:        'xyz789',          // wp_rest nonce

  // Meta
  base_domain:       'https://yoursite.com',
  base_path:         'https://yoursite.com/wp-content/plugins/motionkit/',
  platform:          'wordpress',

  // Only present on JWT auth failure:
  auth_error:        'Token expired'
}
```

---

## postMessage Contract

| Message | Direction | Payload |
|---|---|---|
| `mk-ready` | iframe → editor | `{ type, nonce, ajaxurl, siteData: { animation_config, device_config, pageTypeConfigs, base_path } }` |
| `mk-auth-error` | iframe → editor | `{ type, error: string }` |
| `wcf-animation-config` | editor → iframe | animation config per device |
| `wcf-animation-config-reset` | editor → iframe | (empty) |

Allowed postMessage origins:
```js
["https://editor.motionkit.io", "http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]
```

---

## wp_options Keys

| Key | Set by | Contains |
|---|---|---|
| `motionkit_global_settings` | `RestApi::store_global_settings()` | Global animation config |
| `cfanim_build_config_{id}` | `AnimationBuilderPageType::saveConfig()` | Per-page config (option store_type) |
| `motionkit_jwt_secret` | `JwtTokenManager::get_secret()` | HMAC secret |
| `motionkit_api_key` | `JwtTokenManager::get_api_key()` | REST token endpoint key |
| `mk_access_token` | `ConnectPage::handle_oauth_callback()` | Encrypted OAuth token |
| `mk_user_email` | `ConnectPage::handle_oauth_callback()` | Connected user email |
| `wcf_animation_builder_options` | `Plugin::set_default_options()` | General plugin options |

---

## Device Breakpoints

| key | mediaQuery |
|---|---|
| `desktop` | `(min-width: 1441px)` |
| `laptop` | `(min-width: 1200px) and (max-width: 1440px)` |
| `tab_land` | `(min-width: 1024px) and (max-width: 1199px)` |
| `tab` | `(min-width: 768px) and (max-width: 1023px)` |
| `mobile` | `(max-width: 767px)` |

---

## Hooks & Filters

| Hook | Type | Purpose |
|---|---|---|
| `MOTIONKIT_LOADED` | action | After `Plugin::init()` completes |
| `wcf_animation_builder_activated` | action | Plugin activation |
| `wcf_animation_builder_deactivated` | action | Plugin deactivation |
| `wcf_animation_builder/frontend/presets/enqueue_element_scripts` | action | Editor preview enqueue (Pro) |
| `motionkit_core_lib_deps` | filter | Add GSAP handles as script deps |
| `motionkit_jwt_ttl` | filter | Override JWT TTL (default 300s) |
| `motionkit/editor/url` | filter | Override editor base URL |
| `motionkit/editor/allowed_origins` | filter | CORS + postMessage allowed origins |

---

## Security Rules — Always Follow

- `check_permission()` must **never return `true` unconditionally** in production
- Every AJAX handler needs `check_ajax_referer()` + `current_user_can('manage_options')`
- JWT validate order: signature → expiry → `sub` claim → single-use `jti` transient
- OAuth `state` transient must be verified before processing callback
- Sanitize all input: `sanitize_text_field()`, `wp_unslash()`, `json_decode()` with `json_last_error()`
- Escape all output: `esc_html()`, `esc_url()`, `esc_attr()`
- Remove `'*'` from CORS `allowed_origins` before production
- Never store raw access tokens — always AES-256 encrypt

---

## Build

```bash
npm run build    # Production build → assets/build/
npm run start    # Dev watch
```

Webpack alias: `@` → `src/modules/animation-builder/`
Never edit `assets/build/` files directly.
