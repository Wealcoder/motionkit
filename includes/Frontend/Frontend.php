<?php

namespace MotionKit\Frontend;

/**
 * Frontend Class
 *
 * @package MotionKit
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

use MotionKit\Common\Assets\AssetLoader;
use MotionKit\Common\MotionkitBuilderPageType;
use MotionKit\Auth\JwtTokenManager;
use MotionKit\Factory\ComponentFactory;
use MotionKit\Support\EditorSessionTrait;
use MotionKit\Helpers\Helper;

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
   * Maps get_active_plugins()'s animation-schema keys to their registered
   * WP script handle, for the handles where the two diverge (the schema
   * key mirrors GSAP's own tween-vars/step-method name, e.g. `scrollTo`,
   * while the handle is renamed to match the sibling "Animation Addons for
   * Elementor" plugin's PascalCase convention, e.g. `ScrollToPlugin`, so the
   * two plugins dedupe the same GSAP library instead of double-loading it).
   * Handles not listed here use the same string for both.
   *
   * @var array<string,string>
   */
  private const GSAP_SCHEMA_TO_HANDLE = [
    'scrollTo'   => 'ScrollToPlugin',
    'drawSVG'    => 'DrawSVGPlugin',
    'morphSVG'   => 'MorphSVGPlugin',
    'motionPath' => 'MotionPathPlugin',
    'splitText'  => 'SplitText',
  ];

  /**
   * Asset loader instance
   *
   * @var AssetLoader
   */
  private AssetLoader $asset_loader;

  /**
   * Page type resolver
   *
   * @var MotionkitBuilderPageType
   */
  private MotionkitBuilderPageType $page_type;

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
   * Read by both `register_required_script` (CDN URL map) and `enqueue_page_scripts`
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
   * GSAP handles that actually registered this request.
   *
   * Populated by register_required_script() — a handle lands here only when its
   * gsapPlugin toggle is on AND it has a valid CDN URL (the always-on gsap /
   * ScrollTrigger / ScrollSmoother baseline is included too). enqueue_page_scripts()
   * reads this so it never declares a script dependency on an unregistered
   * handle (which triggers WP_Scripts' "unregistered dependency" notice).
   *
   * @var array<string,bool>
   */
  private array $registered_gsap_handles = [];

  /**
   * Optional GSAP plugin handles requested by config but NOT registered —
   * toggle disabled, or missing/invalid CDN URL.
   *
   * Used to (a) skip animations that need a plugin the admin turned off and
   * (b) skip premium presets that depend on one, so the rest still run.
   *
   * @var array<string,bool>
   */
  private array $unavailable_gsap_handles = [];

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
    $this->page_type = MotionkitBuilderPageType::instance();
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
    add_filter('motionkit_core_lib_deps', [$this, 'register_required_script']);

    // Stand-down signal for another plugin's page smoother. A page has exactly
    // one ScrollSmoother, and MotionKit takes priority whenever it owns one
    // (see maybe_init_scroll_smoother()), so BricksFly's predicate is filtered
    // to false rather than letting two instances fight over the page. AAE Pro
    // resolves the same conflict by pulling ScrollSmoother::should_run()
    // itself; BricksFly exposes a filter, so we push the answer there instead.
    add_filter('bricksfly_smooth_scroller_is_active', [$this, 'veto_third_party_smoother']);

    // Frontend script enqueue — only on actual page loads (not admin/AJAX)
    if (!is_admin()) {
      add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_scripts'], 60);
      add_action('wp_head', [$this, 'print_gsap_preload'], 1);
      add_action('wp_head', [$this, 'print_page_transition_code'], 99);
    }

    // AJAX handlers — must register in admin context (admin-ajax.php)
    // All config endpoints require authentication (no nopriv)
    add_action('wp_ajax_motionkit_builder_pagetype_configs', [$this, 'ajax_configs_store']);
    add_action('wp_ajax_motionkit_configs_delete', [$this, 'ajax_configs_delete']);
    add_action('wp_ajax_motionkit_builder_gl_configs_store', [$this, 'ajax_global_configs_store']);
    add_action('wp_ajax_motionkit_gl_configs_delete', [$this, 'ajax_global_configs_delete']);
  }

  // ─── GSAP Library Registration ──────────────────────────────────

  /**
   * Register all GSAP CDN scripts and return core dependency handles
   *
   * @param array $deps Existing deps from filter
   * @return array Merged dependency handles
   */
  /**
   * Register every GSAP handle the editor has configured.
   *
   * Fully DB-driven: the editor saves each handle's {url, deps, version}
   * into motionkit_global_settings.gsapPlugin.cdns[$handle], and this method
   * just iterates whatever is there and calls wp_register_script() with it.
   * Adding a new GSAP plugin (or bumping the pinned GSAP version) is purely
   * an editor-side change — this method never needs a code change to learn
   * about a new handle.
   *
   * @param array $deps Existing deps from filter
   * @return array Merged dependency handles
   */
  public function register_required_script(array $deps): array
  {
    // Reset per-request state — the filter can run more than once per request.
    $this->registered_gsap_handles = [];
    $this->unavailable_gsap_handles = [];

    // gsapPlugin lives in motionkit_global_settings (edited from the editor's
    // GSAP Plugin tab). It holds per-plugin enable toggles (scrollTo, morphSVG,
    // …) alongside a `cdns` map of { url, deps, version } per handle. Stored
    // values may arrive as an associative array or stdClass depending on how
    // the option was saved — normalize to an associative array.
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
    // it only when the admin explicitly enabled it in the editor. This
    // allowlist is a WP-plugin policy decision (which handles form the
    // required baseline), not something the editor's data should dictate.
    //
    // 'scrollSmoother' (old lowercase-first spelling) stays listed alongside
    // 'ScrollSmoother' until the editor's cdns key rename has propagated to
    // every site via its next Global Settings save — otherwise an
    // un-migrated site's still-lowercase cdns entry falls through to the
    // optional-plugin gate, finds no matching gsapPlugin toggle, and silently
    // never registers ScrollSmoother at all.
    $always = [
      'gsap'           => true,
      'ScrollTrigger'  => true,
      'ScrollSmoother' => true,
      'scrollSmoother' => true,
    ];

    // gsap core loads in <head> for the page-transition inline snippet. All
    // other libs (ScrollTrigger, ScrollSmoother, etc.) load in the footer —
    // the page-transition snippet only needs window.gsap.
    foreach ($cdns as $handle => $entry) {
      $handle = (string) $handle;
      $is_optional = !isset($always[$handle]);

      // Back-compat: sites saved before the editor switched cdns entries
      // from a bare URL string to {url, deps, version} still have a plain
      // string here until the next Global Settings save. Normalize so
      // those sites keep working (deps default to ['gsap'], no version)
      // instead of silently losing every GSAP handle until re-saved.
      if (is_string($entry)) {
        $entry = ['url' => $entry];
      } else {
        $entry = (array) $entry;
      }

      // Optional plugin → skip unless its gsapPlugin toggle is enabled.
      // filter_var handles both real booleans and "true"/"1" string forms.
      if ($is_optional) {
        $enabled = isset($gsap_plugin[$handle]) && filter_var($gsap_plugin[$handle], FILTER_VALIDATE_BOOLEAN);
        if (!$enabled) {
          // Admin turned this plugin off — record it so the enqueue pass drops
          // animations/presets that need it instead of depending on a handle
          // that will never register.
          $this->unavailable_gsap_handles[$handle] = true;
          continue;
        }
      }

      $url = isset($entry['url']) && is_string($entry['url']) ? trim($entry['url']) : '';

      // No URL configured → skip. Admin must set it from the editor's
      // GSAP Plugin → "GSAP Library URLs" section.
      if ($url === '' || wp_http_validate_url($url) === false) {
        if ($is_optional) {
          $this->unavailable_gsap_handles[$handle] = true;
        }
        continue;
      }

      // gsap itself must never depend on anything else by construction —
      // hardcode that guard rather than trusting DB-supplied deps for the
      // root handle. Every other handle's deps come from the editor.
      if ($handle === 'gsap') {
        $handle_deps = [];
      } else {
        // GSAP handles are mixed-case (ScrollTrigger, ScrollSmoother, …) — sanitize_key()
        // would lowercase them and silently break the dependency, since the
        // handle itself registers under its original case. Script handles are
        // just arbitrary identifiers to WP, so a conservative allowlist
        // (alphanumeric, underscore, hyphen) is sufficient sanitization
        // without touching case.
        $handle_deps = isset($entry['deps']) && is_array($entry['deps'])
          ? array_values(array_filter(array_map(
              static function ($dep) {
                $dep = is_string($dep) ? preg_replace('/[^A-Za-z0-9_-]/', '', $dep) : '';
                return $dep !== '' ? $dep : null;
              },
              $entry['deps']
            )))
          : ['gsap'];
      }

      $version = isset($entry['version']) && is_string($entry['version']) && $entry['version'] !== ''
        ? sanitize_text_field($entry['version'])
        : null;

      if ($handle === 'gsap') {
        wp_register_script($handle, $url, $handle_deps, $version, false);
        $this->registered_gsap_handles[$handle] = true;

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

      wp_register_script($handle, $url, $handle_deps, $version, true);
      $this->registered_gsap_handles[$handle] = true;
    }

    // Only declare gsap/ScrollSmoother as a dep if it actually registered under
    // that exact handle. Sites that saved gsapPlugin.cdns before the editor's
    // handle-name rename still register the smoother under the old lowercase
    // `scrollSmoother` key until their next save — check for either spelling
    // so this site's real handle is used instead of a name nothing registered
    // under (which trips WP_Scripts' "not registered" notice) or omitting the
    // dependency entirely (which silently drops ScrollSmoother from the page).
    $core_deps = [];
    if (isset($this->registered_gsap_handles['gsap'])) {
      $core_deps[] = 'gsap';
    }
    foreach (['ScrollSmoother', 'scrollSmoother'] as $smoother_handle) {
      if (isset($this->registered_gsap_handles[$smoother_handle])) {
        $core_deps[] = $smoother_handle;
        break;
      }
    }

    return array_merge($deps, $core_deps);
  }

  // ─── Frontend Script Loading ─────────────────────────────────────

  /**
   * Check if the current request is a SaaS editor preview.
   *
   * A valid JWT must always be present in the motionkit_token query param —
   * connected or not. JwtTokenManager falls back to a locally-signed
   * token when the site has no access token yet, so every link this
   * plugin generates (admin bar, Connect page, editor launch) always
   * carries one. Without this, ?action=motionkit-editor alone would let
   * any anonymous visitor load the full motionkitData snapshot on a
   * not-yet-connected site. Supports two token types:
   * - WP-generated JWTs (iss = site URL, validated locally)
   * - Server-generated JWTs (iss = motionkit-server, validated via SaaS API)
   *
   * @return bool
   */
  // This is a read-only mode-detection check gated by JWT validation
  // (validate_reusable()/verify_server_session() below), which authenticates
  // the request far more strongly than a WP nonce could — a nonce would need
  // to be embedded in every editor-launch link and still wouldn't verify
  // *who* is loading it, whereas the JWT does. Not a state change either way.
  // See readme.txt's "Why don't all requests use a WordPress nonce?" FAQ
  // for the user-facing explanation of this same reasoning.
  // phpcs:disable WordPress.Security.NonceVerification.Recommended
  private function is_editor_preview(): bool
  {

    if (!isset($_GET['action']) || sanitize_text_field(wp_unslash($_GET['action'])) !== 'motionkit-editor') {
      return false;
    }

    $token = isset($_GET['motionkit_token']) ? sanitize_text_field(wp_unslash($_GET['motionkit_token'])) : '';
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
  // phpcs:enable WordPress.Security.NonceVerification.Recommended

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
   *
   * Runs only when MotionKit actually owns the page smoother — connected to the
   * editor and switched on for this page (ScrollSmoother::should_run()). This
   * used to stand down for WCF Addons Pro unconditionally; that is reversed —
   * MotionKit has priority, and AAE Pro reads the SAME should_run() to stand
   * down instead. Gating on the real answer (rather than always hooking) also
   * stops MotionKit's disabled runner from killing another plugin's smoother:
   * run_scroll_smoother() calls ScrollSmoother.get().kill() when its own value
   * resolves to null, so it must not run at all when MotionKit is off.
   *
   * @return void
   */
  private function maybe_init_scroll_smoother(): void
  {
    if (!ScrollSmoother::should_run()) {
      return;
    }

    add_action('wp_footer', [$this->smoother, 'run_scroll_smoother']);
  }

  /**
   * Switch off BricksFly's page smoother when MotionKit owns it.
   *
   * Filter callback for `bricksfly_smooth_scroller_is_active` (BricksFly free,
   * includes/helper.php) — returning false there suppresses both its
   * #smooth-wrapper / #smooth-content markup and the ScrollSmoother its
   * frontend script would otherwise create.
   *
   * Evaluated lazily, at filter time rather than at hook registration:
   * should_run() reads the per-page scrollSmother override, which needs the
   * resolved query. When MotionKit is NOT driving the smoother this returns
   * BricksFly's own answer untouched, so its setting keeps working normally.
   *
   * @param bool $active BricksFly's own resolved state.
   * @return bool
   */
  public function veto_third_party_smoother($active): bool
  {
    return ScrollSmoother::should_run() ? false : (bool) $active;
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

    // Preload from wherever register_required_script() actually registered the
    // 'gsap' handle from (motionkit_global_settings.gsapPlugin.cdns.gsap) —
    // preloading a different URL than the one the <script> tag requests
    // defeats the preload (browser fetches twice) or preloads a resource
    // that's never used.
    $gsap_src = wp_scripts()->registered['gsap']->src ?? '';
    if ($gsap_src === '') {
      return;
    }

    $host = wp_parse_url($gsap_src, PHP_URL_HOST);
    if (empty($host)) {
      return;
    }
    $origin = 'https://' . $host;

    // dns-prefetch + preconnect cut TLS/DNS round-trips before the preload fires.
    // crossorigin on the preload must match the eventual <script> request (anonymous)
    // so the browser reuses the preloaded response instead of fetching twice.
    // Escaped inline at the point of output (not earlier) so a scanner can verify it.
    printf("<link rel='dns-prefetch' href='%s'>\n", esc_url($origin));
    printf("<link rel='preconnect' href='%s' crossorigin>\n", esc_url($origin));
    printf("<link rel='preload' as='script' href='%s' crossorigin>\n", esc_url($gsap_src));
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
    // duplicate libraries and stale motionkit data.
    if ($this->is_full_preview()) {
      nocache_headers();
      header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
      header('Pragma: no-cache');
      return;
    }

    if ($this->is_editor_preview()) {
      // Force fresh response — page caches and CDNs would otherwise serve
      // a stale snapshot, leaving the editor with outdated motionkit data.
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
  // Read-only boolean flag (present/absent, '1' or not) that only decides
  // which scripts get enqueued — no state change, so no nonce needed.
  // phpcs:disable WordPress.Security.NonceVerification.Recommended
  private function is_full_preview(): bool
  {
    return isset($_GET['motionkit_full_preview']) && $_GET['motionkit_full_preview'] === '1';
  }
  // phpcs:enable WordPress.Security.NonceVerification.Recommended

  /**
   * Editor preview mode — load all CSS/JS for the SaaS editor iframe
   *
   * Enqueues frontend.js, all active presets, and localizes with
   * ajaxurl + nonce + pageTypeConfigs so the editor can save/delete via AJAX.
   *
   * @return void
   */
  // Only ever called from within an is_editor_preview() === true branch
  // (see the call site above), so motionkit_token here is a re-read of a
  // value that's already been JWT-validated earlier in this same request —
  // not a fresh unauthenticated read.
  // phpcs:disable WordPress.Security.NonceVerification.Recommended
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

    // Page settings live under motionkit_pg_settings_<type> (separate key from animations).
    $settings_config = $this->settings_config($page_type_config);
    $page_configs = $this->page_type->getConfig($settings_config);

    // Global settings + global animations (wp_options).
    // Read through memos so we don't re-fetch options that register_required_script
    // already pulled earlier in this same request.
    $global_settings  = $this->get_global_settings();
    $global_animation = $this->get_global_animations();

    // Page-level animation list — original key (motionkit_pg_animation_<type>).
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


    $motionkit_token = isset($_GET['motionkit_token']) ? sanitize_text_field(wp_unslash($_GET['motionkit_token'])) : '';

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
      'nonce'             => wp_create_nonce('motionkit-admin-preview-nonce'),
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
      'motionkit_token'   => $motionkit_token,
      'all_animations'    => $merged_animation,
      'all_settings'      => $merged_settings,
    ];


    // Localize on the bridge (loads independently, no GSAP deps)
    wp_localize_script('motionkit-editor-bridge', 'motionkitData', $localized_data);
  }
  // phpcs:enable WordPress.Security.NonceVerification.Recommended

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
    // hooks (register_required_script already pulled global_settings earlier in
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

    // Page settings live under motionkit_pg_settings_<type> — separate from animations.
    $settings_config = $this->settings_config($page_type_config);

    $page_settings = $this->page_type->getConfig($settings_config);
    // Scan the merged animation tree for the GSAP plugins it references. We
    // do this inside a 3-hour window after the last page-settings save (to
    // wire enabled plugin scripts into the deps) OR whenever an optional
    // plugin is disabled (so we can drop the animations that need it). The
    // timestamp option is written by RestApi::dispatch_simple on every save.
    $settings_updated_at = get_option('motionkit_page_settings_updated_at', false);

    // 3 hours in seconds — inline literal to avoid analyzer noise on HOUR_IN_SECONDS.
    $within_window = ($settings_updated_at !== false && (time() - (int) $settings_updated_at) <= 10800);

    $animation_plugins = [];
    if ($within_window || !empty($this->unavailable_gsap_handles)) {
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
    }

    if (!empty($animation_plugins)) {
      // get_active_plugins() returns animation-schema keys (scrollTo, drawSVG,
      // …) which don't all match their registered WP script handle (ScrollToPlugin,
      // DrawSVGPlugin, …) — translate before comparing against registered_gsap_handles.
      $animation_plugins_by_handle = [];
      foreach ($animation_plugins as $schema_key => $v) {
        $animation_plugins_by_handle[self::GSAP_SCHEMA_TO_HANDLE[$schema_key] ?? $schema_key] = $schema_key;
      }

      // Only depend on plugin handles that register_required_script actually
      // registered. A plugin the admin disabled (or left without a valid CDN
      // URL) has no handle — listing it here makes WP_Scripts warn about an
      // "unregistered dependency" and skip loading motionkit-frontend.
      $usable = array_intersect_key($animation_plugins_by_handle, $this->registered_gsap_handles);
      if (!empty($usable)) {
        $deps = array_merge($deps, array_keys($usable));
      }

      // Any referenced plugin with no registered handle is unavailable — drop
      // the animations that need it so the rest of the page still animates
      // instead of the whole gsap.matchMedia batch throwing on a missing lib.
      // Map back to schema keys since reject_animations_needing_plugins()
      // compares against get_active_plugins()'s schema-key output.
      $missing_by_handle = array_diff_key($animation_plugins_by_handle, $this->registered_gsap_handles);
      if (!empty($missing_by_handle)) {
        $missing = array_fill_keys(array_values($missing_by_handle), true);
        $merged_animation = $this->reject_animations_needing_plugins($merged_animation, $missing);
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

    wp_localize_script('motionkit-frontend', 'motionkitData', [
      'all_animations' => $merged_animation,
      'all_settings'   => $merged_settings,
      // Runtime customEngine log switch, read from .env each request (dev only).
      'dev_log'        => Helper::is_dev_log()
    ]);

    // Allow Pro to enqueue premium preset scripts
    do_action('motionkit/frontend/presets/enqueue_element_scripts', $deps, $is_custom, $active_presets);
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
      $element_deps = $element['deps'] ?? $deps;

      // Skip a preset whose GSAP plugin dependency is unavailable (toggle off
      // or no CDN URL). Enqueuing it would declare an unregistered dependency,
      // and the preset can't run without its plugin anyway.
      if (
        !empty($this->unavailable_gsap_handles)
        && is_array($element_deps)
        && array_intersect_key(array_flip($element_deps), $this->unavailable_gsap_handles)
      ) {
        continue;
      }

      wp_enqueue_script(
        $key,
        $element['src'],
        $element_deps,
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
   * Drop top-level animations that reference any unavailable GSAP plugin.
   *
   * Used when a plugin an animation needs isn't available (toggle off or no
   * CDN URL). Removing the whole animation entry keeps its missing-lib error
   * from tearing down the rest of the gsap.matchMedia batch — every animation
   * that doesn't touch an unavailable plugin still runs.
   *
   * @param array $animations Merged animation list (global + page).
   * @param array $missing    Map of unavailable plugin keys (key => true).
   * @return array Re-indexed list with offending animations removed.
   */
  private function reject_animations_needing_plugins(array $animations, array $missing): array
  {
    $kept = [];
    foreach ($animations as $anim) {
      if (is_array($anim) && !empty(array_intersect_key($this->get_active_plugins($anim), $missing))) {
        continue;
      }
      $kept[] = $anim;
    }
    return $kept;
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
          if ($value['group'] === 'most_popular_animation' && isset($value['presetKey'])) {
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
    check_ajax_referer('motionkit-admin-preview-nonce', 'motionkit_nonce');

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
    check_ajax_referer('motionkit-admin-preview-nonce', 'motionkit_nonce');

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
    check_ajax_referer('motionkit-admin-preview-nonce', 'motionkit_nonce');

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
    check_ajax_referer('motionkit-admin-preview-nonce', 'motionkit_nonce');

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
   * @return MotionkitBuilderPageType Page type instance
   */
  public function get_page_type(): MotionkitBuilderPageType
  {
    return $this->page_type;
  }
}
