<?php

namespace WcfAnimationBuilder\Frontend;

/**
 * Frontend Class
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

use WcfAnimationBuilder\Common\Assets\AssetLoader;
use WcfAnimationBuilder\Common\AnimationBuilderPageType;
use WcfAnimationBuilder\Auth\JwtTokenManager;
use WcfAnimationBuilder\Auth\OAuthHandler;
use WcfAnimationBuilder\Factory\ComponentFactory;
use WcfAnimationBuilder\Support\EditorSessionTrait;

/**
 * Frontend Class
 *
 * Handles frontend script loading and AJAX config handlers
 * for the MotionKit connector plugin.
 */
final class Frontend
{
  // Shared editor-connector helpers: verify_server_session(),
  // editor_allowed_origins(), settings_config().
  use EditorSessionTrait;

  /**
   * Asset loader instance
   *
   * @var AssetLoader
   */
  private AssetLoader $asset_loader;

  /**
   * Page type resolver
   *
   * @var AnimationBuilderPageType
   */
  private AnimationBuilderPageType $page_type;

  /**
   * ScrollSmoother manager
   *
   * @var ScrollSmoother
   */
  private ScrollSmoother $smoother;

  /**
   * Per-request memo for the page-transition option.
   *
   * Sentinel state: `false` = not yet read; `null` = read, no snippet;
   * `array{code:string, ...}` = read, has snippet. Three call sites read
   * this option per page load (head-force gate, head preload, footer inline
   * snippet). WP already caches the option value itself, but the memo skips
   * the `option_*` filter chain and shape validation on the 2nd/3rd hit.
   *
   * @var array|null|false
   */
  private $page_transition_cache = false;

  /**
   * Per-request memo for `motionkit_global_settings`.
   *
   * Read by both `register_gsap_libs` (CDN URL map) and `enqueue_page_scripts`
   * (settings merge). Sentinel `false` = not yet read.
   *
   * @var array|object|false
   */
  private $global_settings_cache = false;

  /**
   * Per-request memo for `motionkit_global_animations`.
   *
   * @var array|false
   */
  private $global_animations_cache = false;

  /**
   * Read + validate the page-transition snippet, memoized per request.
   *
   * @return array|null Validated stored payload, or null when no usable
   *                    snippet is configured.
   */
  private function get_page_transition()
  {
    if ($this->page_transition_cache !== false) {
      return $this->page_transition_cache;
    }

    $stored = get_option('motionkit-page-transition-code');
    if (!is_array($stored) || empty($stored['code']) || !is_string($stored['code'])) {
      return $this->page_transition_cache = null;
    }

    return $this->page_transition_cache = $stored;
  }

  /**
   * Read motionkit_global_settings, memoized per request.
   *
   * Returns the raw value (array or object) — callers normalize as needed.
   *
   * @return array|object
   */
  private function get_global_settings()
  {
    if ($this->global_settings_cache !== false) {
      return $this->global_settings_cache;
    }
    return $this->global_settings_cache = get_option('motionkit_global_settings', []);
  }

  /**
   * Read motionkit_global_animations, memoized per request.
   *
   * @return array
   */
  private function get_global_animations(): array
  {
    if ($this->global_animations_cache !== false) {
      return $this->global_animations_cache;
    }
    $raw = get_option('motionkit_global_animations', []);
    return $this->global_animations_cache = is_array($raw) ? $raw : [];
  }

  /**
   * Initialize frontend functionality
   *
   * @return void
   */
  public function init(): void
  {
    $this->asset_loader = ComponentFactory::create_asset_loader();
    $this->page_type = AnimationBuilderPageType::instance();
    $this->smoother = new ScrollSmoother();

    $this->init_hooks();
  }

  /**
   * Initialize hooks
   *
   * @return void
   */
  private function init_hooks(): void
  {
    // Allow the editor iframe to embed this site
    add_action('send_headers', [$this, 'allow_editor_iframe']);

    // Register GSAP CDN scripts via core deps filter
    add_filter('motionkit_core_lib_deps', [$this, 'register_gsap_libs']);

    // Frontend script enqueue — only on actual page loads (not admin/AJAX)
    if (!is_admin()) {
      add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_scripts'], 60);
      add_action('wp_head', [$this, 'print_gsap_preload'], 1);
      add_action('wp_head', [$this, 'print_page_transition_code'], 99);
    }

    // AJAX handlers — must register in admin context (admin-ajax.php)
    // All config endpoints require authentication (no nopriv)
    add_action('wp_ajax_motionkit_builder_pagetype_configs', [$this, 'ajax_configs_store']);
    add_action('wp_ajax_wcf_anim_builder_configs_delete', [$this, 'ajax_configs_delete']);
    add_action('wp_ajax_motionkit_builder_gl_configs_store', [$this, 'ajax_global_configs_store']);
    add_action('wp_ajax_wcf_anim_builder_gl_configs_delete', [$this, 'ajax_global_configs_delete']);
  }

  // ─── GSAP Library Registration ──────────────────────────────────

  /**
   * Register all GSAP CDN scripts and return core dependency handles
   *
   * @param array $deps Existing deps from filter
   * @return array Merged dependency handles
   */
  public function register_gsap_libs(array $deps): array
  {
    // Handle list + dependency graph. URLs come from the DB (per wp.org
    // guidelines, the plugin doesn't ship hardcoded CDN URLs); this array
    // only defines which handles exist and how they depend on each other.
    $libs = [
      'gsap'           => ['deps' => []],
      'scrollTrigger'  => ['deps' => ['gsap']],
      'scrollSmoother' => ['deps' => ['gsap', 'scrollTrigger']],
      'scrollTo'       => ['deps' => ['gsap']],
      'splitText'      => ['deps' => ['gsap']],
      'drawSVG'        => ['deps' => ['gsap']],
      'morphSVG'       => ['deps' => ['gsap']],
      'motionPath'     => ['deps' => ['gsap']],
      'flip'           => ['deps' => ['gsap']],
      'physics2D'      => ['deps' => ['gsap']],

    ];

    // gsapPlugin lives in motionkit_global_settings (edited from the editor's
    // GSAP Plugin tab). It holds per-plugin enable toggles (scrollTo, morphSVG,
    // …) alongside a `cdns` URL map. Stored values may arrive as an associative
    // array or stdClass depending on how the option was saved — normalize to an
    // associative array.
    $global = $this->get_global_settings();
    $gsap_plugin = null;
    if (is_object($global) && isset($global->gsapPlugin)) {
      $gsap_plugin = $global->gsapPlugin;
    } elseif (is_array($global) && isset($global['gsapPlugin'])) {
      $gsap_plugin = $global['gsapPlugin'];
    }
    if ($gsap_plugin === null) {
      return [];
    }
    $gsap_plugin = (array) $gsap_plugin;
    $cdns = isset($gsap_plugin['cdns']) ? (array) $gsap_plugin['cdns'] : [];
    if (empty($cdns)) {
      return [];
    }

    // gsap core + ScrollTrigger + ScrollSmoother are the always-on baseline
    // runtime and register regardless of toggles. Every other handle is an
    // optional GSAP plugin gated by its boolean flag in gsapPlugin — register
    // it only when the admin explicitly enabled it in the editor.
    $always = [
      'gsap'           => true,
      'scrollTrigger'  => true,
      'scrollSmoother' => true,
    ];

    // gsap core loads in <head> for the page-transition inline snippet. It keeps an
    // empty deps array so presets and the snippet can list it as a dep without
    // causing circular conflicts. All other libs (ScrollTrigger, ScrollSmoother, etc.)
    // load in the footer — the page-transition snippet only needs window.gsap.
    foreach ($libs as $handle => $lib) {
      // Optional plugin → skip unless its gsapPlugin toggle is enabled.
      // filter_var handles both real booleans and "true"/"1" string forms.
      if (!isset($always[$handle])) {
        $enabled = isset($gsap_plugin[$handle]) && filter_var($gsap_plugin[$handle], FILTER_VALIDATE_BOOLEAN);
        if (!$enabled) {
          continue;
        }
      }

      $url = isset($cdns[$handle]) && is_string($cdns[$handle]) ? trim($cdns[$handle]) : '';

      // No URL configured → skip. Admin must set it from the editor's
      // GSAP Plugin → "GSAP Library URLs" section.
      if ($url === '') {
        continue;
      }

      if (wp_http_validate_url($url) === false) {
        continue;
      }

      // Admin-supplied URLs are expected to be already versioned, so pass
      // null to wp_register_script to avoid double-stamping ?ver=.
      if ($handle === 'gsap') {
        wp_register_script($handle, $url, [], null, false);

        // Force gsap into <head> only when a page-transition snippet is
        // stored — that snippet runs from wp_head priority 99 and assumes
        // `window.gsap` is already defined. Without this, `motionkit-frontend`
        // (footer) listing gsap as a dep makes WP propagate the footer group
        // up the dep chain and gsap drops to the footer too, breaking the
        // inline snippet. On pages without a transition we skip the enqueue
        // and let gsap load in the footer with everything else.
        if ($this->get_page_transition() !== null) {
          wp_enqueue_script($handle);
        }
        continue;
      }
      wp_register_script($handle, $url, $lib['deps'], null, true);
    }

    $core_deps = ['gsap', 'scrollSmoother'];

    return array_merge($deps, $core_deps);
  }

  // ─── Frontend Script Loading ─────────────────────────────────────

  /**
   * Check if the current request is a SaaS editor preview.
   *
   * When the site is connected (has an access token), a valid JWT
   * must be present in the mk_token query param. Supports two token types:
   * - WP-generated JWTs (iss = site URL, validated locally)
   * - Server-generated JWTs (iss = motionkit-server, validated via SaaS API)
   *
   * @return bool
   */
  private function is_editor_preview(): bool
  {

    if (!isset($_GET['action']) || sanitize_text_field(wp_unslash($_GET['action'])) !== 'motionkit-editor') {
      return false;
    }

    // If site is connected, require a valid JWT
    if (OAuthHandler::is_connected()) {
      $token = isset($_GET['mk_token']) ? sanitize_text_field(wp_unslash($_GET['mk_token'])) : '';
      if (empty($token)) {
        return false;
      }

      // Try WP-generated token first (local validation, no HTTP call)
      $payload = JwtTokenManager::validate_reusable($token);
      if ($payload !== false) {
        return true;
      }

      // Not a WP token — try server-generated token via SaaS API
      return $this->verify_server_session($token);
    }

    return true;
  }

  /**
   * Remove X-Frame-Options for editor preview so the SaaS iframe can embed the page.
   *
   * @return void
   */
  public function allow_editor_iframe(): void
  {

    if (!$this->is_editor_preview()) {
      return;
    }

    $allowed_origins = $this->editor_allowed_origins(true);

    header_remove('X-Frame-Options');
    header('Content-Security-Policy: frame-ancestors ' . implode(' ', $allowed_origins));
  }

  /**
   * Register ScrollSmoother boot script (once only, when scripts will actually load).
   * Skip if WCF Addons Pro is active — it handles the wrapper itself.
   *
   * @return void
   */
  private function maybe_init_scroll_smoother(): void
  {
    if (defined('WCF_ADDONS_PRO_VERSION')) {
      return;
    }

    add_action('wp_footer', [$this->smoother, 'run_scroll_smoother']);
  }

  /**
   * Print the saved page-transition code in wp_footer.
   *
   * The editor persists the exported snippet to option `motionkit-page-transition-code`
   * via the /save REST dispatcher. The snippet is a self-contained IIFE that boots
   * GSAP-driven page transitions — it assumes gsap is available on window.
   *
   * Skipped in the editor preview + full-preview contexts so the editor runtime
   * (which injects its own preview scripts) doesn't double-execute it.
   *
   * @since 1.1.0
   * @return void
   */
  public function print_gsap_preload(): void
  {
    if ($this->is_editor_preview() || $this->is_full_preview()) {
      return;
    }

    // Only preload when a page-transition snippet is actually stored — otherwise
    // gsap may not be needed in the head at all on this page.
    if ($this->get_page_transition() === null) {
      return;
    }

    $cdn  = 'https://cdn.jsdelivr.net/npm/gsap@3.15/dist/';
    $ver  = '3.15.0';
    $href = esc_url($cdn . 'gsap.min.js?ver=' . $ver);

    // dns-prefetch + preconnect cut TLS/DNS round-trips before the preload fires.
    // crossorigin on the preload must match the eventual <script> request (anonymous)
    // so the browser reuses the preloaded response instead of fetching twice.
    echo "<link rel='dns-prefetch' href='https://cdn.jsdelivr.net'>\n";
    echo "<link rel='preconnect' href='https://cdn.jsdelivr.net' crossorigin>\n";
    echo "<link rel='preload' as='script' href='{$href}' crossorigin>\n";
  }

  public function print_page_transition_code(): void
  {
    if ($this->is_editor_preview() || $this->is_full_preview()) {
      return;
    }

    $stored = $this->get_page_transition();
    if ($stored === null) {
      return;
    }

    /**
     * Filters the page-transition JS snippet before it is printed.
     *
     * @since 1.1.0
     *
     * @param string $code  The raw JS snippet as authored in the editor.
     * @param array  $meta  Stored metadata (presetKey, presetLabel, updated_at).
     */
    $code = (string) apply_filters(
      'motionkit/page_transition/code',
      $stored['code'],
      $stored
    );

    if ('' === trim($code)) {
      return;
    }

    $label = isset($stored['presetLabel']) ? (string) $stored['presetLabel'] : '';
    $key   = isset($stored['presetKey']) ? (string) $stored['presetKey'] : '';
    $tag   = trim($label . ('' !== $key ? " ({$key})" : ''));
    if ('' === $tag) {
      $tag = 'custom';
    }

    printf(
      "\n<!-- MotionKit Page Transition: %s -->\n",
      esc_html($tag)
    );

    wp_print_inline_script_tag(
      $code,
      array('id' => 'motionkit-page-transition-code')
    );
  }

  /**
   * Conditionally enqueue frontend animation scripts
   *
   * Two modes:
   * 1. Editor preview (?action=motionkit-editor) — loads all scripts + enriched localized data
   * 2. Normal frontend — only loads scripts when the page has saved animation configs
   *
   * @return void
   */
  public function enqueue_frontend_scripts(): void
  {

    // Full Preview mode — SaaS proxy injects its own GSAP + presets + frontend.js
    // seeded from the editor's in-memory state. WP must enqueue NOTHING to avoid
    // duplicate libraries and stale wcfanimb data.
    if ($this->is_full_preview()) {
      nocache_headers();
      header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
      header('Pragma: no-cache');
      return;
    }

    if ($this->is_editor_preview()) {
      // Force fresh response — page caches and CDNs would otherwise serve
      // a stale snapshot, leaving the editor with outdated wcfanimb data.
      nocache_headers();
      header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
      header('Pragma: no-cache');
      $this->enqueue_editor_preview_scripts();
      return;
    }

    $this->enqueue_page_scripts();
  }

  /**
   * Detect Full Preview mode — SaaS editor opening the site in a new tab
   * with all animation runtime injected by the proxy.
   *
   * @return bool
   */
  private function is_full_preview(): bool
  {
    return isset($_GET['mk_full_preview']) && $_GET['mk_full_preview'] === '1';
  }

  /**
   * Editor preview mode — load all CSS/JS for the SaaS editor iframe
   *
   * Enqueues frontend.js, all active presets, and localizes with
   * ajaxurl + nonce + pageTypeConfigs so the editor can save/delete via AJAX.
   *
   * @return void
   */
  private function enqueue_editor_preview_scripts(): void
  {
    // Editor preview mode: only load the bridge script for postMessage communication.
    // GSAP, animation engine, and presets are NOT loaded — the editor handles
    // animation rendering via its own runtime. This keeps the iframe lightweight
    // and avoids conflicts with the editor's GSAP instance.

    // Enqueue ONLY the editor bridge — postMessage receiver for SaaS editor.
    wp_enqueue_script(
      'motionkit-editor-bridge',
      MOTIONKIT_PLUGIN_URL . 'assets/build/modules/animation-builder/editor-bridge.js',
      [],
      MOTIONKIT_VERSION,
      true
    );

    // ScrollSmoother in editor-iframe mode is owned entirely by the editor
    // (see src/lib/gsap/scrollSmoother.js). The WP inline script short-circuits
    // on ?action=motionkit-editor anyway, so we skip hooking it here to avoid
    // printing dead code.

    // Load device breakpoints
    $devices = $this->get_sanitized_devices();

    // Page-type descriptor (store_type, id, option) — used for both reads + writes.
    $page_type_config = $this->page_type->getCurrentPageType();

    // Page settings live under mkit_pg_settings_<type> (separate key from animations).
    $settings_config = $this->settings_config($page_type_config);
    $page_configs = $this->page_type->getConfig($settings_config);

    // Global settings + global animations (wp_options).
    // Read through memos so we don't re-fetch options that register_gsap_libs
    // already pulled earlier in this same request.
    $global_settings  = $this->get_global_settings();
    $global_animation = $this->get_global_animations();

    // Page-level animation list — original key (mkit_pg_animation_<type>).
    $page_animation = $this->page_type->getConfig($page_type_config);

    // Merge global and page animation lists — not override
    $merged_animation = array_merge(
      is_array($global_animation) ? $global_animation : [],
      is_array($page_animation) ? $page_animation : []
    );

    // Merge global settings with current page settings on specific keys.
    // Page-level values override global when present.
    $global_settings_arr = is_array($global_settings) ? $global_settings : (array) $global_settings;
    $page_settings_arr   = is_array($page_configs) ? $page_configs : [];

    $default_settings = [
      'deviceConfig' => $devices,
    ];

    $merged_settings = array_merge($default_settings, $global_settings_arr);
    foreach (['pageTransition', 'scrollSmother', 'preloader'] as $key) {
      if (!empty($page_settings_arr[$key]) && is_array($page_settings_arr[$key])) {
        $merged_settings[$key] = $page_settings_arr[$key];
      }
    }


    $mk_token = isset($_GET['mk_token']) ? sanitize_text_field(wp_unslash($_GET['mk_token'])) : '';

    // Favourited cloud-animation ids — hydrated into the editor's cloud slice on load.
    $favourite_cloud_animation = get_option('motionkit_favourite_cloud_animation', []);

    // Animation folder definitions — hydrated into the editor's animation slice on load.
    // Falls back to the legacy nested location (global_settings.animationFolders) so
    // folders saved before the split still show up until the next folder save relocates them.
    $animation_folders = get_option('motionkit_animation_folders', null);
    if (!is_array($animation_folders)) {
      $animation_folders = (is_array($global_settings) && isset($global_settings['animationFolders']) && is_array($global_settings['animationFolders']))
        ? $global_settings['animationFolders']
        : [];
    }

    // Shared localized data for both frontend runner and editor bridge
    $localized_data = [
      'currentPageSettings'  => $page_configs ? $page_configs : json_decode('{}'),
      'device_config'     => $devices,
      'ajaxurl'           => admin_url('admin-ajax.php'),
      'nonce'             => wp_create_nonce('wcf-admin-preview-nonce'),
      'rest_url'          => add_query_arg('rest_route', '/motionkit/v1/', home_url('/')),
      'rest_nonce'        => wp_create_nonce('wp_rest'),
      'pageTypeConfigs'   => $page_type_config,
      'base_domain'       => home_url(),
      'global_settings'   => $global_settings,
      'global_animation'  => is_array($global_animation) ? $global_animation : [],
      'page_animation'    => is_array($page_animation) ? $page_animation : [],
      'favourite_cloud_animation' => is_array($favourite_cloud_animation) ? $favourite_cloud_animation : [],
      'animation_folders' => $animation_folders,
      'platform'          => 'wordpress',
      'mk_token'          => $mk_token,
      'all_animations'    => $merged_animation,
      'all_settings'      => $merged_settings,
    ];


    // Localize on the bridge (loads independently, no GSAP deps)
    wp_localize_script('motionkit-editor-bridge', 'wcfanimb', $localized_data);
  }

  /**
   * Normal frontend — conditional script loading based on saved page configs
   *
   * @return void
   */
  private function enqueue_page_scripts(): void
  {

    if ($this->is_editor_preview()) {
      return;
    }

    $page_configs = $this->page_type->getConfig();

    if (!is_array($page_configs)) {
      $page_configs = [];
    }

    // Register ScrollSmoother wrapper when page configs exist
    $this->maybe_init_scroll_smoother();

    // Determine which presets are active in the config
    $is_custom = false;
    $global_settings  = $this->get_global_settings();
    $global_animation = $this->get_global_animations();
    $page_configs = array_merge($page_configs, $global_animation);
    $active_presets = $this->get_active_presets($page_configs, $is_custom);

    // Build deps — allow Pro to add gsap/ScrollTrigger via filter
    $deps = apply_filters('motionkit_core_lib_deps', []);

    if (empty($deps)) {
      return;
    }

    if (isset($active_presets['premium']) && !empty($active_presets['premium'])) {
      $this->enqueue_presets($active_presets['premium'], $deps);
    }

    // Global settings + global animations (saved by editor to wp_options).
    // Read through memos so the same option isn't re-fetched on subsequent
    // hooks (register_gsap_libs already pulled global_settings earlier in
    // this same request).


    // Page-level animation bucket (separate from currentPageSettings)
    $page_type_config = $this->page_type->getCurrentPageType();
    $page_anim_config = $page_type_config;
    $page_animation = $this->page_type->getConfig($page_anim_config);
    // Merge global and page animation lists — not override
    $merged_animation = array_merge(
      is_array($global_animation) ? $global_animation : [],
      is_array($page_animation) ? $page_animation : []
    );

    // Page settings live under mkit_pg_settings_<type> — separate from animations.
    $settings_config = $this->settings_config($page_type_config);

    $page_settings = $this->page_type->getConfig($settings_config);
    // Scan the merged animation tree only inside a 3-hour window after the
    // last page-settings save. Outside that window we trust the persisted
    // `activePlugins` and skip the walk to keep the frontend cheap. The
    // option is written by RestApi::dispatch_simple on every save.
    $settings_updated_at = get_option('motionkit_page_settings_updated_at', false);

    // 3 hours in seconds — inline literal to avoid analyzer noise on HOUR_IN_SECONDS.
    if ($settings_updated_at !== false && (time() - (int) $settings_updated_at) <= 10800) {
      // Cache the scan result keyed by the save timestamp — any save bumps
      // the timestamp, which auto-invalidates this entry without manual flush.
      // Free per-request; with an external object cache (Redis/Memcached) it
      // skips the walk on every subsequent page load too.


      $page_key  = isset($page_type_config['option']) && is_string($page_type_config['option'])
        ? $page_type_config['option']
        : 'global';
      $cache_key = 'mkit_active_plugins_' . md5($page_key . '|' . $settings_updated_at);
      $animation_plugins = wp_cache_get($cache_key, 'motionkit');

      if ($animation_plugins === false) {
        // Substring pre-check — for pages that use only fade/slide/preset
        // animations (the common case), encoding to JSON once and running
        // 9 strpos calls is much cheaper than recursing the whole tree.
        $haystack = wp_json_encode($merged_animation);
        $has_any  = false;
        if (is_string($haystack) && $haystack !== '') {
          static $plugin_needles = [
            'scrollTo',
            'motionPath',
            'drawSVG',
            'morphSVG',
            'splitText',
            'physics2D',
            'physicsProps',
            'scrambleText',
            'flip',
          ];
          foreach ($plugin_needles as $needle) {
            if (strpos($haystack, $needle) !== false) {
              $has_any = true;
              break;
            }
          }
        }

        $animation_plugins = $has_any ? $this->get_active_plugins($merged_animation) : [];
        wp_cache_set($cache_key, $animation_plugins, 'motionkit', 3600);
      }

      if (!empty($animation_plugins)) {
        $deps = array_merge($deps, array_keys($animation_plugins));
      }
    }

    // Merge global settings with current page settings on specific keys.
    // Page-level values override global when present.
    $global_settings_arr = is_array($global_settings) ? $global_settings : (array) $global_settings;
    $page_settings_arr   = is_array($page_settings) ? $page_settings : [];


    // Default settings baseline — always present so the frontend runtime has
    // sane initial state (device breakpoints, etc.) even when the editor
    // never saved anything. User-saved settings overlay on top.
    $default_settings = [
      'deviceConfig' => $this->get_sanitized_devices(),
    ];

    $merged_settings = array_merge($default_settings, $global_settings_arr);

    // Enqueue main frontend runner
    wp_register_script(
      'motionkit-frontend',
      MOTIONKIT_PLUGIN_URL . 'assets/build/modules/animation-builder/frontend.js',
      $deps,
      MOTIONKIT_VERSION,
      true
    );

    wp_enqueue_script('motionkit-frontend');
    // Enqueue smart animation engine when custom animations are present

    if ($is_custom) {

      wp_enqueue_script(
        'motionkit-custom-animation',
        MOTIONKIT_PLUGIN_URL . 'assets/build/modules/animation-builder/frontend/customAnimation.js',
        ['motionkit-frontend'],
        MOTIONKIT_VERSION,
        true
      );
    }
    // Flatten scrollSmother.allPage -> scrollSmother so the frontend runtime
    // reads a single shape (global baseline, used only if current page has none).
    if (!empty($merged_settings['scrollSmother']['allPage']) && is_array($merged_settings['scrollSmother']['allPage'])) {
      $merged_settings['scrollSmother'] = $merged_settings['scrollSmother']['allPage'];
    }

    // Current page settings fully replace the global baseline for these keys.
    foreach (['pageTransition', 'scrollSmother', 'preloader'] as $key) {
      if (!empty($page_settings_arr[$key]) && is_array($page_settings_arr[$key])) {
        $merged_settings[$key] = $page_settings_arr[$key];
      }
    }

    if (isset($merged_settings['pageTransition'])) {
      unset($merged_settings['pageTransition']);
    }

    if (isset($merged_settings['gsapPlugin']['cdns'])) {
      unset($merged_settings['gsapPlugin']['cdns']);
    }

    wp_localize_script('motionkit-frontend', 'wcfanimb', [
      'all_animations' => $merged_animation,
      'all_settings'   => $merged_settings
    ]);

    // Allow Pro to enqueue premium preset scripts
    do_action('wcf_animation_builder/frontend/presets/enqueue_element_scripts', $deps, $is_custom, $active_presets);
  }

  /**
   * Enqueue active premium preset scripts
   *
   * @param array $active_presets Active preset handles from page config
   * @param array $deps           Script dependencies (gsap, ScrollTrigger, etc.)
   * @return void
   */
  private function enqueue_presets(array $active_presets, array $deps = []): void
  {
    $config_path = MOTIONKIT_PLUGIN_DIR . 'includes/Common/configs/animation-builder-assets.php';

    if (!file_exists($config_path)) {
      return;
    }

    $config = include $config_path;

    if (!is_array($config) || empty($config['premiumPresets'])) {
      return;
    }



    foreach ($active_presets as $key) {

      if (!isset($config['premiumPresets'][$key])) {
        continue;
      }

      $element = $config['premiumPresets'][$key];

      wp_enqueue_script(
        $key,
        $element['src'],
        $element['deps'] ?? $deps,
        $element['version'] ?? MOTIONKIT_VERSION,
        true
      );
    }
  }

  /**
   * Load and sanitize device breakpoint config
   *
   * @return array Sanitized device breakpoints
   */
  private function get_sanitized_devices(): array
  {
    $config_path = MOTIONKIT_PLUGIN_DIR . 'includes/Common/configs/animation-builder-device.php';

    if (!file_exists($config_path)) {
      return [];
    }

    $config = include $config_path;

    if (!is_array($config)) {
      return [];
    }

    return array_map(function ($d) {
      return [
        'key'        => sanitize_key($d['key'] ?? ''),
        'title'      => wp_strip_all_tags($d['title'] ?? ''),
        'viewWidth'  => esc_attr($d['viewWidth'] ?? ''),
        'mediaQuery' => wp_strip_all_tags($d['mediaQuery'] ?? ''),
      ];
    }, $config);
  }

  // ─── Preset Resolution ───────────────────────────────────────────

  /**
   * Detect GSAP plugins referenced inside an animation payload.
   *
   * Mirrors GSAP_PLUGIN_VAR_KEYS / collectPlugins in
   * src/modules/animation-builder/frontend.js — walks the merged animation
   * tree (presets + custom timelines + per-device vars bags) and returns a
   * map of plugin keys whose vars appear anywhere in the payload.
   *
   * @param array $animations Merged animation list (global + page).
   * @return array<string,bool> e.g. ['scrollTo' => true, 'morphSVG' => true]
   */
  private function get_active_plugins(array $animations): array
  {
    static $plugin_keys = [
      'scrollTo'      => true,
      'motionPath'    => true,
      'drawSVG'       => true,
      'morphSVG'      => true,
      'splitText'     => true,
      'physics2D'     => true,
      'physicsProps'  => true,
      'scrambleText'  => true,
      // Flip has no dedicated tween var; detected by presence of `flip` key.
      'flip'          => true,
    ];

    // Skip GSAP/ScrollTrigger runtime back-references and lifecycle callbacks
    // so we don't walk into a tween's `parent`, the ScrollTrigger instance,
    // or the DOM scroller — and don't false-match `onComplete: scrollTo(...)`.
    static $internal_keys = [
      'parent'            => true,
      'scrollTrigger'     => true,
      'scroller'          => true,
      'targets'           => true,
      'callbackScope'     => true,
      'onComplete'        => true,
      'onStart'           => true,
      'onUpdate'          => true,
      'onRepeat'          => true,
      'onReverseComplete' => true,
    ];

    // Depth cap is generous because PHP receives the raw saved tree (root list →
    // animation → timelines → [i] → animations → [j] → devices → <key> → from →
    // <plugin>), unlike the JS path which scans the post-flatten `vars` bag.
    $found      = [];
    $target_len = count($plugin_keys);
    $walk = function ($node, int $depth) use (&$walk, &$found, $plugin_keys, $internal_keys, $target_len): void {
      // Short-circuit once every plugin key has been seen — further walking
      // can't change the result and on a heavy tree this saves a lot.
      if (!is_array($node) || $depth > 12 || count($found) >= $target_len) {
        return;
      }
      foreach ($node as $k => $v) {
        if (is_string($k) && isset($internal_keys[$k])) {
          continue;
        }
        if (is_string($k) && isset($plugin_keys[$k]) && $v !== null) {
          $found[$k] = true;
          if (count($found) >= $target_len) {
            return;
          }
        }
        if (is_array($v)) {
          $walk($v, $depth + 1);
        }
      }
    };

    $walk($animations, 0);
    return $found;
  }

  /**
   * Recursively find active preset handles from page animation config
   *
   * Walks the nested config structure to find all enabled preset entries.
   * Sets $is_custom by reference when a custom or cloud animation is found.
   *
   * @param array $data      Page animation config
   * @param bool  &$is_custom Set to true if custom/cloud animations found
   * @return array Unique array of active preset handles
   */
  private function get_active_presets(array $data, bool &$is_custom): array
  {
    $premium_preset = [];

    $iterator = function (array $array) use (&$iterator, &$is_custom, &$premium_preset): void {
      foreach ($array as $value) {
        if (!is_array($value)) {
          continue;
        }
        // Check for enabled animation entries
        if (isset($value['group'], $value['isPublished']) && (int) $value['isPublished'] === 1) {
          if ($value['group'] === 'most_popular' && isset($value['presetKey'])) {
            $premium_preset[] = $value['presetKey'];
          } elseif ($value['group'] === 'custom_animation' || $value['group'] === 'cloud_trigger') {
            // customEngine runs both custom and cloud animations
            $is_custom = true;
          }
        }

        // Recurse into nested arrays
        $iterator($value);
      }
    };

    $iterator($data);

    return ['premium' => array_unique($premium_preset)];
  }

  // ─── AJAX Handlers ───────────────────────────────────────────────

  /**
   * AJAX: Save pagetype configs
   *
   * @return void
   */
  public function ajax_configs_store(): void
  {
    check_ajax_referer('wcf-admin-preview-nonce', 'wcf_nonce');

    if (!current_user_can('manage_options')) {
      wp_send_json_error(['msg' => esc_html__('Unauthorized access', 'motionkit')], 403);
    }

    $page_type_raw = isset($_POST['pageTypeConfigs']) ? sanitize_text_field(wp_unslash($_POST['pageTypeConfigs'])) : '';
    $anim_raw = isset($_POST['animationConfigs']) ? sanitize_text_field(wp_unslash($_POST['animationConfigs'])) : '';

    if ($page_type_raw === '' || $anim_raw === '') {
      wp_send_json_error(['msg' => esc_html__('Missing configuration data', 'motionkit')], 400);
    }

    $page_type_configs = json_decode($page_type_raw, true);
    $animation_configs = json_decode($anim_raw, true);

    if (json_last_error() !== JSON_ERROR_NONE || !is_array($page_type_configs) || !is_array($animation_configs)) {
      wp_send_json_error(['msg' => esc_html__('Invalid configuration data', 'motionkit')], 400);
    }

    $this->page_type->saveConfig($page_type_configs, $animation_configs);

    wp_send_json_success([
      'msg'     => esc_html__('Configurations saved', 'motionkit'),
      'configs' => $animation_configs,
    ]);
  }

  /**
   * AJAX: Delete page-specific animation configs
   *
   * @return void
   */
  public function ajax_configs_delete(): void
  {
    check_ajax_referer('wcf-admin-preview-nonce', 'wcf_nonce');

    if (!current_user_can('manage_options')) {
      wp_send_json_error(['msg' => esc_html__('Unauthorized access', 'motionkit')], 403);
    }

    $raw = isset($_POST['pageTypeConfigs']) ? sanitize_text_field(wp_unslash($_POST['pageTypeConfigs'])) : '';

    if ($raw === '') {
      wp_send_json_error(['msg' => esc_html__('Missing configuration data', 'motionkit')], 400);
    }

    $page_type_configs = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE || !is_array($page_type_configs)) {
      wp_send_json_error(['msg' => esc_html__('Invalid configuration data', 'motionkit')], 400);
    }

    $this->page_type->deleteConfig($page_type_configs);

    wp_send_json_success(['msg' => esc_html__('Configurations deleted', 'motionkit')]);
  }

  /**
   * AJAX: Save global animation configs
   *
   * @return void
   */
  public function ajax_global_configs_store(): void
  {
    check_ajax_referer('wcf-admin-preview-nonce', 'wcf_nonce');

    if (!current_user_can('manage_options')) {
      wp_send_json_error(['msg' => esc_html__('Unauthorized access', 'motionkit')], 403);
    }

    $raw = isset($_POST['animationConfigs']) ? sanitize_text_field(wp_unslash($_POST['animationConfigs'])) : '';

    if ($raw === '') {
      wp_send_json_error(['msg' => esc_html__('Missing configuration data', 'motionkit')], 400);
    }

    $animation_configs = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE || !is_array($animation_configs)) {
      wp_send_json_error(['msg' => esc_html__('Invalid configuration data', 'motionkit')], 400);
    }

    update_option('motionkit_global_settings', $animation_configs);

    wp_send_json_success([
      'msg'     => esc_html__('Global configurations saved', 'motionkit'),
      'configs' => $animation_configs,
    ]);
  }

  /**
   * AJAX: Delete global animation configs
   *
   * @return void
   */
  public function ajax_global_configs_delete(): void
  {
    check_ajax_referer('wcf-admin-preview-nonce', 'wcf_nonce');

    if (!current_user_can('manage_options')) {
      wp_send_json_error(['msg' => esc_html__('Unauthorized access', 'motionkit')], 403);
    }

    delete_option('motionkit_global_settings');

    wp_send_json_success(['msg' => esc_html__('Global configurations deleted', 'motionkit')]);
  }

  // ─── Accessors ───────────────────────────────────────────────────

  /**
   * Get asset loader instance
   *
   * @return AssetLoader Asset loader instance
   */
  public function get_asset_loader(): AssetLoader
  {
    return $this->asset_loader;
  }

  /**
   * Get page type resolver
   *
   * @return AnimationBuilderPageType Page type instance
   */
  public function get_page_type(): AnimationBuilderPageType
  {
    return $this->page_type;
  }
}
