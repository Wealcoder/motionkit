# MotionKit WordPress Connector — Claude Instructions

You are working on **MotionKit**, a WordPress plugin that connects customer sites to the **motionkit.io** SaaS animation editor. The visual editor lives entirely at `editor.motionkit.io` — this plugin is the **WordPress-side connector only**.

Preparing this plugin for wp.org submission? Read `WPORG-SUBMISSION.md` first —
it tracks the plugin directory's rules and this codebase's live audit findings
(open blockers, verified-OK items, pre-submission checklist).

---

## Project Identity

| Item | Value |
|---|---|
| Plugin slug | `motionkit` |
| PHP namespace root | `MotionKit\` |
| Text domain | `motionkit` |
| Main file | `motionkit.php` |
| Autoloader base | `MotionKit\` → `includes/` (PSR-4) |
| JS global | `motionkitData` |
| Constants prefix | `MOTIONKIT_*` |
| Editor origin | `https://editor.motionkit.io` |

---

## File Structure

```
motionkit.php                              ← Entry: constants + Plugin::get_instance()
uninstall.php                              ← Cleanup wp_options + user_meta on delete
│
includes/
├── Plugin.php                             ← Singleton: init_auth/frontend/backend/rest_api/admin_notices
├── Autoloader.php                         ← PSR-4 loader
│
├── RestApi/
│   └── RestApi.php                        ← motionkit/v1/save + /pages (CORS simple request)
│
├── Auth/
│   ├── JwtTokenManager.php                ← Mint + validate editor session JWTs
│   ├── OAuthHandler.php                   ← OAuth connect/disconnect to motionkit.io
│   └── ConnectPage.php                    ← Admin "MotionKit" menu (Connect/Tools tabs)
│
├── Admin/
│   └── PermalinkNotice.php                ← Plain-permalinks nag notice
│
├── Backend/
│   └── Backend.php                        ← Admin hooks
│
├── Frontend/
│   └── Frontend.php                       ← Script enqueue, no-cache headers, motionkitData localization
│
├── Common/
│   ├── MotionkitBuilderPageType.php       ← Page type detection + saveConfig/getConfig/deleteConfig
│   ├── Assets/AssetLoader.php             ← wp_enqueue wrapper with deduplication
│   └── configs/
│       ├── animation-builder-assets.php   ← Preset asset registry
│       └── animation-builder-device.php   ← Device breakpoints
│
├── Factory/
│   └── ComponentFactory.php               ← create_frontend(), create_backend()
│
└── Helpers/
    └── Helper.php                         ← get_option(), update_option(), log()

src/modules/animation-builder/
├── frontend.js                            ← Main animation runner (gsap.matchMedia loop)
├── editor-bridge.js                       ← postMessage bridge + REST calls to /save
└── ...                                    ← Animation modules, presets, helpers

assets/build/                              ← Webpack compiled output — never edit directly
```

---

## Init Flow

```
motionkit.php
  └─ Plugin::get_instance($file)
       └─ plugins_loaded → Plugin::init()
            ├─ init_auth()            → OAuthHandler + (is_admin) ConnectPage
            ├─ init_frontend()        → Frontend::init()     [all contexts]
            ├─ init_backend()         → Backend::init()      [is_admin() only]
            ├─ init_rest_api()        → RestApi::init()      [all contexts]
            ├─ init_admin_notices()   → PermalinkNotice [is_admin]
            ├─ admin_bar_menu         → add_admin_bar_build_animation()
            └─ wp_enqueue_scripts     → enqueue_admin_bar_css()
```

`init_rest_api()` runs unconditionally — REST must serve requests from frontend iframes
and the external editor.

---

## REST API — `includes/RestApi/RestApi.php`

**Namespace:** `motionkit/v1`

Only two endpoints; `/save` is a single dispatcher for all write/read actions.

| Method | Route | Handler | Description |
|---|---|---|---|
| POST | `/save` | `dispatch_simple()` | Unified dispatcher for all save/delete/get actions |
| GET  | `/pages` | `search_pages()` | Search animatable pages |

### `/save` — CORS simple request pattern

Uses `Content-Type: text/plain;charset=UTF-8` with JSON-as-body, and the JWT inside the
body (not `Authorization` header). This keeps the request in the CORS "simple" category
so browsers skip the OPTIONS preflight entirely — no server config, `.htaccess`, WAF, or
Cloudflare policy can 405 us.

**Request body:**
```json
{
  "token": "<editor session JWT>",
  "action": "save_global_settings"
          | "save_global_animation"
          | "save_current_page_settings"
          | "save_current_page_animation"
          | "delete_global_settings"
          | "delete_current_page_settings"
          | "get_settings",
  "payload": {
    "pageTypeConfigs": { "store_type": "post_meta", "id": 42, "option": "motionkit_pg_animation_page" },
    "animationConfigs": { ... }
  }
}
```

**Response:**
```json
{ "success": true, "data": { "msg": "page_config_saved" } }
```

**Auth:** `permission_callback => '__return_true'`; real auth happens inside
`dispatch_simple()` via `JwtTokenManager::validate_reusable($token)`.

### `/pages` — page search

JWT via `?token=` query param (so it stays a CORS-simple GET with no Authorization header).
Falls back to `Authorization: Bearer` and same-origin admin cookie.
Permission callback: `check_permission_query_token`.

### CORS

- `add_cors_headers` filter on `rest_pre_serve_request` attaches
  `Access-Control-Allow-Origin` for whitelisted editor origins so the browser lets
  JS read the response body.
- No OPTIONS preflight handler needed — `/save` never triggers one.
- Filter hook: `motionkit/editor/allowed_origins`

### Storage Keys (post-v1.1.0)

**Settings and animations are split into two separate option keys** so settings can't
overwrite animations (or vice versa):

| What                              | Key                             | Store                     |
|-----------------------------------|---------------------------------|---------------------------|
| Page animations (timeline list)   | `motionkit_pg_animation_<type>` | post_meta/term_meta/option |
| Page settings (scroll smoother…)  | `motionkit_pg_settings_<type>`  | post_meta/term_meta/option |
| Global settings                   | `motionkit_global_settings`     | option                    |
| Global animations                 | `motionkit_global_animations`   | option                    |

`<type>` examples: `page` (post/CPT), `category_<term_id>`, `front`, `search`, `404`.

`save_current_page_settings` and `save_current_page_animation` share the same
`pageTypeConfigs` envelope but the dispatcher rewrites the `option` prefix for
settings via `settings_config()` helper.

`delete_current_page_settings` clears BOTH keys.

---

## Auth & Connect UI (already implemented)

- `includes/Auth/JwtTokenManager.php` — mints and validates editor session JWTs
  (HMAC-SHA256 using `motionkit_jwt_secret`). Exposes `generate()`, `validate_reusable()`,
  `get_secret()`, `rotate_secret()`.
- `includes/Auth/OAuthHandler.php` — OAuth connect/disconnect flow to motionkit.io.
  Fires `do_action('motionkit/oauth/connected')` on successful connect.
- `includes/Auth/ConnectPage.php` — top-level admin menu ("MotionKit") with tabs:
  Connect / Tools. Render-methods per tab. License status renders inline inside
  the Connect tab (`render_license_tab()` is a private method embedded in
  `render_connect_tab()`, not a separate navigable tab).

### Permission model (RestApi.php)

- `/save`: permission_callback `__return_true`; real auth happens inside
  `dispatch_simple()` via `JwtTokenManager::validate_reusable()` on the body's `token` field.
- `/pages`: `check_permission_query_token` accepts `?token=` query param
  OR `Authorization: Bearer` header OR same-origin admin cookie.
- No `current_user_can` gate for the editor session — the JWT IS the session.

---

## `motionkitData` JS Global — Editor Preview Shape

Set via `wp_localize_script` in `Frontend.php::enqueue_editor_preview_scripts()`:

```js
motionkitData = {
  // REST endpoint base (supports both pretty + plain permalinks)
  rest_url:             'https://yoursite.com/wp-json/motionkit/v1/',
  rest_nonce:           'xyz789',   // wp_rest nonce (legacy; /save uses JWT body)

  // Editor session JWT — bridge forwards this in /save body
  motionkit_token:       '<JWT>',

  // Page identity
  pageTypeConfigs:      { store_type: 'post_meta', id: 42, option: 'motionkit_pg_animation_page' },
  base_domain:          'https://yoursite.com',
  platform:             'wordpress',

  // Fresh data snapshots read on every editor-preview page load
  currentPageSettings:  { ... },   // from motionkit_pg_settings_<type>
  page_animation:       [ ... ],   // from motionkit_pg_animation_<type>
  global_settings:      { ... },   // from motionkit_global_settings
  global_animation:     [ ... ],   // from motionkit_global_animations
  device_config:        [{ key, title, viewWidth, mediaQuery }, ...],

  // Legacy (not used by editor saves, kept for admin tools)
  ajaxurl:              'https://yoursite.com/wp-admin/admin-ajax.php',
  nonce:                'abc123',  // motionkit-admin-preview-nonce
}
```

**No-cache headers** are set on any `?action=motionkit-editor` request so page caches
(LiteSpeed, WP Rocket, Cloudflare APO) can't serve a stale `motionkitData` snapshot:

```
Cache-Control: no-store, no-cache, must-revalidate, max-age=0
Pragma: no-cache
```

---

## postMessage Contract

| Message                         | Direction     | Payload                                                  |
|---------------------------------|---------------|----------------------------------------------------------|
| `motionkit-ready`               | iframe → editor | `{ platform, base_domain, rest_url }` — lifecycle only |
| `motionkit-request`             | editor → iframe | `{ request: 'get-data', sessionNonce }`                |
| `motionkit-response`            | iframe → editor | Full payload from `buildResponsePayload()` (motionkitData.*) |
| `motionkit-auth`                | editor → iframe | `{ mk_token, sessionNonce }` — forwarded after ready   |
| `motionkit-settings`            | editor → iframe | `{ data: { globalSettings?, currentPageSettings?, globalAnimation?, pageAnimation? }, saveId }` |
| `motionkit-save-success`        | iframe → editor | `{ endpoint, action, saveId }` — per-part ack          |
| `motionkit-save-error`          | iframe → editor | `{ endpoint, action, saveId, error, code, status }`    |
| `motionkit-page-search`         | editor → iframe | `{ query, page, per_page }`                            |
| `motionkit-page-search-result`  | iframe → editor | `{ data, query, page, has_more, total }`               |
| `motionkit-animation-config`    | editor → iframe | Animation config per device (preview)                  |
| `motionkit-animation-config-reset` | editor → iframe | (empty)                                             |

### ⚠️ Listener timing
`editor-bridge.js` calls `receivePageConfig()` **synchronously at script-execute time**
(NOT on `window.load`) so the early `motionkit-request` from the editor isn't missed on
heavy WP pages where assets block `window.load`.

### ⚠️ Ready is not "connected"
`motionkit-ready` is a lifecycle signal — it carries NO data. The editor responds to
`ready` by (a) forwarding `motionkit-auth` and (b) calling `sendRequest()` to trigger
`motionkit-request`. ONLY `motionkit-response` marks the session as connected. Older
behavior incorrectly treated `ready` as connected and silently dropped requests.

### Allowed origins
```
https://editor.motionkit.io
http://localhost:5173  http://127.0.0.1:5173
http://localhost:5174  http://127.0.0.1:5174
http://localhost:3000
```
Filter hook: `motionkit/editor/allowed_origins`

---

## wp_options Keys

| Key                                   | Set by                                  | Contains                                     |
|---------------------------------------|-----------------------------------------|----------------------------------------------|
| `motionkit_global_settings`           | `RestApi::dispatch_simple()`            | Global settings (scroll smoother, etc.)      |
| `motionkit_global_animations`         | `RestApi::dispatch_simple()`            | Global animation list                        |
| `motionkit_pg_animation_<type>`       | `MotionkitBuilderPageType::saveConfig()` | Per-page animation list (option store_type) |
| `motionkit_pg_settings_<type>`        | `MotionkitBuilderPageType::saveConfig()` | Per-page settings (option store_type)       |
| `motionkit_jwt_secret`                | `JwtTokenManager::get_secret()`         | HMAC secret                                  |
| `motionkit_api_key`                   | OAuth flow                              | REST token endpoint key                      |
| `motionkit_access_token`              | `OAuthHandler::handle_oauth_callback()` | Encrypted OAuth token                        |
| `motionkit_connected_at`              | `OAuthHandler`                          | Connect timestamp                            |
| `motionkit_connected_email`           | `OAuthHandler`                          | Connected user email                         |
| `motionkit_options`                   | `Plugin::set_default_options()`         | General plugin options                       |
| `motionkit_version`                   | `Plugin::activate()`                    | Last activated version                       |
| `motionkit_creation_date`             | `Plugin::activate()`                    | First-activation timestamp                   |

`uninstall.php` removes all of these plus transients (`_transient_mk_session_*`) and
user meta (`motionkit_dismissed_permalink_notice`).

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
| `motionkit_activated` | action | Plugin activation |
| `motionkit_deactivated` | action | Plugin deactivation |
| `motionkit/frontend/presets/enqueue_element_scripts` | action | Editor preview enqueue (Pro) |
| `motionkit_core_lib_deps` | filter | Add GSAP handles as script deps |
| `motionkit_jwt_ttl` | filter | Override JWT TTL (default 300s) |
| `motionkit/editor/url` | filter | Override editor base URL |
| `motionkit/editor/allowed_origins` | filter | CORS + postMessage allowed origins |

---

## Security Rules — Always Follow

- JWT validate order: signature → expiry → `sub` claim → single-use `jti` transient
- OAuth `state` transient must be verified before processing callback
- Sanitize all input: `sanitize_text_field()`, `wp_unslash()`, `json_decode()` with
  `json_last_error()`
- Escape all output: `esc_html()`, `esc_url()`, `esc_attr()`
- Never store raw access tokens — always AES-256 encrypt (handled by `OAuthHandler::encrypt()`)
- CORS `allowed_origins` must NOT include `'*'` — the current list is explicit
- Page settings and animations must go to their own keys (`motionkit_pg_settings_*`
  vs `motionkit_pg_animation_*`) — never collapse back into a single key

---

## Build

```bash
npm run build    # Production build → assets/build/
npm run start    # Dev watch
```

Webpack alias: `@` → `src/modules/animation-builder/`
Never edit `assets/build/` files directly.
