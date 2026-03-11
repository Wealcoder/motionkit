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

/**
 * Frontend Class
 *
 * Handles frontend script loading and AJAX config handlers
 * for the MotionKit connector plugin.
 */
final class Frontend
{
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
    $cdn = 'https://cdn.jsdelivr.net/npm/gsap@3.14/dist/';
    $ver = '3.14.0';

    $libs = [
      // Core
      'gsap'                => ['file' => 'gsap.min.js',                'deps' => []],

      // Scroll
      'ScrollTrigger'       => ['file' => 'ScrollTrigger.min.js',       'deps' => ['gsap']],
      'ScrollSmoother'      => ['file' => 'ScrollSmoother.min.js',      'deps' => ['gsap', 'ScrollTrigger']],
      'ScrollToPlugin'      => ['file' => 'ScrollToPlugin.min.js',      'deps' => ['gsap']],
      'Observer'            => ['file' => 'Observer.min.js',             'deps' => ['gsap']],

      // Text
      'SplitText'           => ['file' => 'SplitText.min.js',           'deps' => ['gsap']],
      'TextPlugin'          => ['file' => 'TextPlugin.min.js',          'deps' => ['gsap']],
      'ScrambleTextPlugin'  => ['file' => 'ScrambleTextPlugin.min.js',  'deps' => ['gsap']],

      // SVG / Path
      'DrawSVGPlugin'       => ['file' => 'DrawSVGPlugin.min.js',       'deps' => ['gsap']],
      'MorphSVGPlugin'      => ['file' => 'MorphSVGPlugin.min.js',      'deps' => ['gsap']],
      'MotionPathPlugin'    => ['file' => 'MotionPathPlugin.min.js',    'deps' => ['gsap']],
      'MotionPathHelper'    => ['file' => 'MotionPathHelper.min.js',    'deps' => ['gsap', 'MotionPathPlugin']],

      // UI
      'Flip'                => ['file' => 'Flip.min.js',                'deps' => ['gsap']],
      'Draggable'           => ['file' => 'Draggable.min.js',           'deps' => ['gsap']],
      'InertiaPlugin'       => ['file' => 'InertiaPlugin.min.js',       'deps' => ['gsap']],

      // Physics
      'Physics2DPlugin'     => ['file' => 'Physics2DPlugin.min.js',     'deps' => ['gsap']],
      'PhysicsPropsPlugin'  => ['file' => 'PhysicsPropsPlugin.min.js',  'deps' => ['gsap']],

      // Eases
      'CustomEase'          => ['file' => 'CustomEase.min.js',          'deps' => ['gsap']],
      'EasePack'            => ['file' => 'EasePack.min.js',            'deps' => ['gsap']],
      'CustomBounce'        => ['file' => 'CustomBounce.min.js',        'deps' => ['gsap', 'CustomEase']],
      'CustomWiggle'        => ['file' => 'CustomWiggle.min.js',        'deps' => ['gsap', 'CustomEase']],

      // Other
      'PixiPlugin'          => ['file' => 'PixiPlugin.min.js',          'deps' => ['gsap']],
      'EaselPlugin'         => ['file' => 'EaselPlugin.min.js',         'deps' => ['gsap']],
      'GSDevTools'          => ['file' => 'GSDevTools.min.js',          'deps' => ['gsap']],
    ];

    foreach ($libs as $handle => $lib) {
      wp_register_script($handle, $cdn . $lib['file'], $lib['deps'], $ver, true);
      if($this->is_editor_preview()) {
        wp_enqueue_script($handle);
      }
    }

    $core_deps = ['gsap', 'ScrollSmoother' ];

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
   * Verify a server-generated editor session token via the SaaS API.
   *
   * Calls POST /connect/verify-session to check JWT signature,
   * expiry, and revocation status. Results are cached in a transient
   * for 5 minutes to avoid repeated HTTP calls on iframe reloads.
   *
   * @param string $token The JWT string
   * @return bool True if the session is valid
   */
  private function verify_server_session(string $token): bool
  {
    // Cache key based on token hash (avoid storing raw JWT in transient key)
    $cache_key = 'mk_session_' . substr(md5($token), 0, 16);
    $cached = get_transient($cache_key);

    if ($cached !== false) {
      return $cached === 'valid';
    }

    $verify_url = OAuthHandler::get_verify_session_url();

    $response = wp_remote_post($verify_url, [
      'timeout' => 10,
      'headers' => ['Content-Type' => 'application/json'],
      'body'    => wp_json_encode(['token' => $token]),
    ]);

    if (is_wp_error($response)) {
      return false;
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    $valid = isset($body['valid']) && $body['valid'] === true;

    // Cache result for 5 minutes
    set_transient($cache_key, $valid ? 'valid' : 'invalid', 300);

    return $valid;
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

    $allowed_origins = apply_filters('motionkit/editor/allowed_origins', [
      'https://editor.motionkit.io',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
    ]);

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
    if ($this->is_editor_preview()) {
      $this->enqueue_editor_preview_scripts();
      return;
    }

    $this->enqueue_page_scripts();
  }

  /**
   * Editor preview mode — load all CSS/JS for the SaaS editor iframe
   *
   * Enqueues frontend.js, all active free presets, and localizes with
   * ajaxurl + nonce + pageTypeConfigs so the editor can save/delete via AJAX.
   *
   * @return void
   */
  private function enqueue_editor_preview_scripts(): void
  {
   
    
    $this->maybe_init_scroll_smoother();
     
    $deps = apply_filters('motionkit_core_lib_deps', []);
    $deps = array_values(array_filter($deps, function ($dep) {
      return $dep !== 'wp-element';
    }));
  
    // Enqueue frontend runner
    wp_register_script(
      'motionkit-frontend',
      MOTIONKIT_PLUGIN_URL . 'assets/build/modules/animation-builder/frontend.js',
      $deps,
      MOTIONKIT_VERSION,
      true
    );
    wp_enqueue_script('motionkit-frontend');
   
    // Enqueue editor bridge — postMessage receiver for SaaS editor
    // No dependency on motionkit-frontend: the bridge only handles postMessage
    // and must load even if GSAP CDN scripts fail.
    wp_enqueue_script(
      'motionkit-editor-bridge',
      MOTIONKIT_PLUGIN_URL . 'assets/build/modules/animation-builder/editor-bridge.js',
      [],
      MOTIONKIT_VERSION,
      true
    );

    // Enqueue ALL free presets (not filtered by page config)
    $this->enqueue_all_free_presets();

    // Enqueue ALL premium presets
    $this->enqueue_all_presets($deps);

    // Always enqueue the smart animation engine in editor preview
    wp_enqueue_script(
      'motionkit-custom-animation',
      MOTIONKIT_PLUGIN_URL . 'assets/build/modules/animation-builder/frontend/customAnimation.js',
      ['motionkit-frontend'],
      MOTIONKIT_VERSION,
      true
    );

    // Load device breakpoints
    $devices = $this->get_sanitized_devices();

    // Get existing page config (may be empty for new pages)
    $page_configs = $this->page_type->getConfig();

    // Global animation configs (saved from editor, stored in wp_options)
    $global_settings = get_option('motionkit_global_settings', []);

    // mk_token is already validated by is_editor_preview() — safe to pass through
    $mk_token = isset($_GET['mk_token']) ? sanitize_text_field(wp_unslash($_GET['mk_token'])) : '';

    // Shared localized data for both frontend runner and editor bridge
    $localized_data = [
      'animation_config' => is_array($page_configs) ? $page_configs : [],
      'device_config'    => $devices,
      'ajaxurl'          => admin_url('admin-ajax.php'),
      'nonce'            => wp_create_nonce('wcf-admin-preview-nonce'),
      'rest_url'         => rest_url('motionkit/v1/'),
      'rest_nonce'       => wp_create_nonce('wp_rest'),
      'pageTypeConfigs'  => $this->page_type->getCurrentPageType(),
      'base_domain'      => home_url(),
      'global_settings'  => is_array($global_settings) ? $global_settings : [],
      'platform'         => 'wordpress',
      'mk_token'         => $mk_token,
    ];

    // Localize on the bridge (loads independently, no GSAP deps)
    wp_localize_script('motionkit-editor-bridge', 'wcfanimb', $localized_data);

    // Also localize on frontend runner (for GSAP-dependent code)
    wp_localize_script('motionkit-frontend', 'wcfanimb', $localized_data);

    // Allow Pro to enqueue premium preset scripts
    do_action('wcf_animation_builder/frontend/presets/enqueue_element_scripts', $deps, true, []);
  }

  /**
   * Normal frontend — conditional script loading based on saved page configs
   *
   * @return void
   */
  private function enqueue_page_scripts(): void
  {
    $page_configs = $this->page_type->getConfig();

    // Early return — no saved configs for this page
    if (empty($page_configs) || !is_array($page_configs)) {
      return;
    }

    // Page has configs — register ScrollSmoother wrapper for this page
    $this->maybe_init_scroll_smoother();

    // Determine which presets are active in the config
    $is_custom = false;
    $is_free = false;
    $active_presets = $this->get_active_presets($page_configs, $is_custom, $is_free);

    // Build deps — allow Pro to add gsap/ScrollTrigger via filter
    $deps = apply_filters('motionkit_core_lib_deps', []);
    $deps = array_values(array_filter($deps, function ($dep) {
      return $dep !== 'wp-element';
    }));

    // Enqueue main frontend runner
    wp_register_script(
      'motionkit-frontend',
      MOTIONKIT_PLUGIN_URL . 'assets/build/modules/animation-builder/frontend.js',
      $deps,
      MOTIONKIT_VERSION,
      true
    );
    wp_enqueue_script('motionkit-frontend');

    // Conditionally enqueue free preset scripts
    if ($is_free || $this->is_editor_preview()) {
      $this->enqueue_free_presets($active_presets);
    }

    // Enqueue premium preset scripts
    $this->enqueue_presets($active_presets, $deps);

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

    // Load device breakpoints and localize
    $devices = $this->get_sanitized_devices();

    wp_localize_script('motionkit-frontend', 'wcfanimb', [
      'animation_config' => $page_configs,
      'device_config'    => $devices,
    ]);

    // Allow Pro to enqueue premium preset scripts
    do_action('wcf_animation_builder/frontend/presets/enqueue_element_scripts', $deps, $is_custom, $active_presets);
  }

  /**
   * Enqueue active free preset scripts and CSS
   *
   * @param array $active_presets Active preset handles from page config
   * @return void
   */
  private function enqueue_free_presets(array $active_presets): void
  {
    $config_path = MOTIONKIT_PLUGIN_DIR . 'includes/Common/configs/animation-builder-assets.php';

    if (!file_exists($config_path)) {
      return;
    }

    $config = include $config_path;

    if (!is_array($config) || empty($config['freePresets'])) {
      return;
    }

    $active_elements = $this->get_active_element_keys('wcf_anim_builder_free_animation_settings');

    if (empty($active_elements)) {
      return;
    }

    // Enqueue free animation CSS
    wp_enqueue_style(
      'wcf-animation-builder-free-anim',
      MOTIONKIT_PLUGIN_URL . 'assets/build/modules/animation-builder/freeAnim.css',
      [],
      MOTIONKIT_VERSION
    );

    // Enqueue each active free preset script
    foreach ($active_elements as $key) {
      if (isset($config['freePresets'][$key]) && in_array($key, $active_presets, true)) {
        $element = $config['freePresets'][$key];
        wp_enqueue_script(
          $key,
          $element['src'],
          $element['deps'] ?? [],
          $element['version'] ?? MOTIONKIT_VERSION,
          true
        );
      }
    }
  }

  /**
   * Enqueue ALL free presets (editor preview mode)
   *
   * Loads every free preset from the config — no active_elements
   * or page config filtering. The SaaS editor needs all presets available.
   *
   * @return void
   */
  private function enqueue_all_free_presets(): void
  {
    $config_path = MOTIONKIT_PLUGIN_DIR . 'includes/Common/configs/animation-builder-assets.php';

    if (!file_exists($config_path)) {
      return;
    }

    $config = include $config_path;

    if (!is_array($config) || empty($config['freePresets'])) {
      return;
    }

    // Enqueue free animation CSS
    wp_enqueue_style(
      'wcf-animation-builder-free-anim',
      MOTIONKIT_PLUGIN_URL . 'assets/build/modules/animation-builder/freeAnim.css',
      [],
      MOTIONKIT_VERSION
    );

    // Enqueue every free preset script
    foreach ($config['freePresets'] as $key => $element) {
      wp_enqueue_script(
        $key,
        $element['src'],
        $element['deps'] ?? [],
        $element['version'] ?? MOTIONKIT_VERSION,
        true
      );
    }
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

    if (!is_array($config) || empty($config['presets'])) {
      return;
    }    
  

    $active_elements = $this->get_active_element_keys('aae_anim_builder_settings');

    foreach ($active_presets as $key) {
      if (!isset($config['presets'][$key])) {
        continue;
      }

      // If element settings exist, respect the active toggle
      if (!empty($active_elements) && !in_array($key, $active_elements, true)) {
        continue;
      }

      $element = $config['presets'][$key];
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
   * Enqueue ALL premium presets (editor preview mode)
   *
   * @param array $deps Script dependencies (gsap, ScrollTrigger, etc.)
   * @return void
   */
  private function enqueue_all_presets(array $deps = []): void
  {
    $config_path = MOTIONKIT_PLUGIN_DIR . 'includes/Common/configs/animation-builder-assets.php';
  
    if (!file_exists($config_path)) {
      return;
    }

    $config = include $config_path;
   
    if (!is_array($config) || empty($config['presets'])) {
      return;
    }
 
    foreach ($config['presets'] as $key => $element) {
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
   * Recursively find active preset handles from page animation config
   *
   * Walks the nested config structure to find all enabled preset entries.
   * Sets $is_custom and $is_free flags by reference.
   *
   * @param array $data     Page animation config
   * @param bool  &$is_custom Set to true if custom animations found
   * @param bool  &$is_free   Set to true if free animations found
   * @return array Unique array of active preset handles
   */
  private function get_active_presets(array $data, bool &$is_custom, bool &$is_free): array
  {
    $presets = [];

    $iterator = function (array $array) use (&$iterator, &$presets, &$is_custom, &$is_free): void {
      foreach ($array as $value) {
        if (!is_array($value)) {
          continue;
        }

        // Check for enabled animation entries
        if (isset($value['type'], $value['enable']) && (int) $value['enable'] === 1) {
          if ($value['type'] === 'preset' && isset($value['preset'])) {
            $presets[] = $value['preset'];
          } elseif ($value['type'] === 'free_animation' && isset($value['preset'])) {
            $presets[] = $value['preset'];
            $is_free = true;
          } elseif ($value['type'] === 'custom') {
            $is_custom = true;
          }
        }

        // Recurse into nested arrays
        $iterator($value);
      }
    };

    $iterator($data);

    return array_values(array_unique($presets));
  }

  /**
   * Get keys of active free animation elements from WP option
   *
   * Reads a JSON-encoded option containing element activation state.
   *
   * @param string $option_name WP option name
   * @return array Active element keys
   */
  private function get_active_element_keys(string $option_name): array
  {
    $raw = get_option($option_name);

    if (!is_string($raw) || $raw === '') {
      return [];
    }

    $data = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data) || !isset($data['elements'])) {
      return [];
    }

    $active_keys = [];

    foreach ($data['elements'] as $group) {
      if (!isset($group['elements']) || !is_array($group['elements'])) {
        continue;
      }
      foreach ($group['elements'] as $key => $element) {
        if (!empty($element['is_active'])) {
          $active_keys[] = $key;
        }
      }
    }

    return $active_keys;
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
