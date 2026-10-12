<?php

declare(strict_types=1);

namespace MotionKit\Frontend;

use MotionKit\Auth\JwtTokenManager;
use MotionKit\Common\AnimationResolver;
use MotionKit\Common\PluginStatus;

/**
 * MotionKit WordPress Plugin — Editor Bridge & Preview Loader.
 *
 * Enqueues postMessage communication bridge and runtime snapshot
 * when the page is loaded inside the MotionKit visual editor iframe.
 *
 * @package MotionKit
 * @since 1.2.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

final class EditorBridge
{
  /**
   * Initialize bridge hooks
   *
   * @return void
   */
  public function init(): void
  {
    add_action('send_headers', [$this, 'send_editor_headers']);
    add_action('wp_enqueue_scripts', [$this, 'enqueue_editor_bridge'], 999);

    // Optimizer plugins defer, delay or rewrite scripts; inside the editor iframe the bridge has to run on load, unprompted. Decided from the query string alone, with no token check: switching optimizers off for one request gives nothing away, and WP Rocket and LiteSpeed read the constants long before a token could be verified.
    $this->disable_optimizers_for_preview();
    add_filter('script_loader_tag', [$this, 'exempt_script_from_optimizers'], 20, 2);
    add_filter('wp_inline_script_attributes', [$this, 'exempt_inline_script_from_optimizers']);
  }

  // What each optimizer looks for to leave a script alone: WP Rocket (nowprocket), LiteSpeed and FlyingPress (data-no-optimize/-defer/-minify), Autoptimize (data-noptimize), Cloudflare Rocket Loader (data-cfasync), Jetpack Boost. Mirrors the connector's list.
  private const OPTIMIZER_EXEMPT_ATTRIBUTES = [
    'nowprocket'         => true,
    'data-no-optimize'   => '1',
    'data-no-defer'      => '1',
    'data-no-minify'     => '1',
    'data-noptimize'     => '1',
    'data-cfasync'       => 'false',
    'data-jetpack-boost' => 'ignore',
  ];

  // The editor-preview request by its query string only; is_editor_preview() verifies the token on top. `motionkit=editor` is the editor's flag, the one its other connectors always used. `action=motionkit-editor` is what it sent WordPress before the rename and what an older editor build still sends; it stays accepted, though `action` is a name other front-end plugins read and act on, which is why it was retired.
  private static function wants_editor_preview(): bool
  {
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    if (isset($_GET['motionkit']) && $_GET['motionkit'] === 'editor') {
      return true;
    }

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    return isset($_GET['action']) && $_GET['action'] === 'motionkit-editor';
  }

  /**
   * Request-level switches the cache and optimizer plugins honour on an editor preview.
   *
   * Each is idempotent and a no-op when that plugin is absent; the connector sets the same ones on a site running both. A delay-until-interaction optimizer inside the preview iframe waits for a click that never comes, so the bridge never announces itself and the editor reads the silence as "plugin not detected".
   *
   * @return void
   */
  public function disable_optimizers_for_preview(): void
  {
    if (!self::wants_editor_preview()) {
      return;
    }

    // Page caches, W3 Total Cache, WP Rocket (all file optimisation, delay JS included), LiteSpeed Cache.
    foreach (['DONOTCACHEPAGE', 'DONOTMINIFY', 'DONOTROCKETOPTIMIZE', 'LITESPEED_DISABLE_ALL'] as $constant) {
      if (!defined($constant)) {
        define($constant, true);
      }
    }

    // LiteSpeed's own API for the same switch, fired once its listener exists; Autoptimize and Perfmatters only offer filters.
    add_action('wp', static function (): void {
      do_action('litespeed_disable_all', 'MotionKit editor preview');
    });
    add_filter('autoptimize_filter_noptimize', '__return_true');
    add_filter('perfmatters_delay_js', '__return_false');
    add_filter('perfmatters_defer_js', '__return_false');
  }

  /**
   * Mark this plugin's own script tags so no optimizer defers, delays, minifies or rewrites them on a preview.
   *
   * @param string $tag    The <script> tag WordPress is about to print.
   * @param string $handle The script handle.
   * @return string
   */
  public function exempt_script_from_optimizers(string $tag, string $handle): string
  {
    if (strpos($handle, 'motionkit') !== 0 || !self::wants_editor_preview()) {
      return $tag;
    }

    // Already marked by the connector on a site running both.
    if (strpos($tag, 'data-cfasync=') !== false) {
      return $tag;
    }

    return (string) preg_replace('/<script\b/', '<script ' . self::optimizer_exempt_attribute_string(), $tag, 1);
  }

  /**
   * The same exemption for the inline tags WordPress prints beside those handles — the localized motionkitData above all, which the bridge cannot run without.
   *
   * @param array $attributes Attributes of the inline <script> about to be printed.
   * @return array
   */
  public function exempt_inline_script_from_optimizers(array $attributes): array
  {
    $id = isset($attributes['id']) && is_string($attributes['id']) ? $attributes['id'] : '';
    if (strpos($id, 'motionkit') !== 0 || !self::wants_editor_preview()) {
      return $attributes;
    }

    return array_merge($attributes, self::OPTIMIZER_EXEMPT_ATTRIBUTES);
  }

  private static function optimizer_exempt_attribute_string(): string
  {
    $parts = [];
    foreach (self::OPTIMIZER_EXEMPT_ATTRIBUTES as $name => $value) {
      $parts[] = $value === true ? $name : $name . '="' . esc_attr((string) $value) . '"';
    }
    return implode(' ', $parts);
  }

  /**
   * Determine if current request is a validated editor preview session.
   *
   * @return bool
   */
  public static function is_editor_preview(): bool
  {
    if (!self::wants_editor_preview()) {
      return false;
    }

    // Token-based validation or logged-in administrator
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    $token = isset($_GET['motionkit_token']) ? sanitize_text_field(wp_unslash($_GET['motionkit_token'])) : '';
    if ($token !== '' && JwtTokenManager::validate_reusable($token, home_url('/'))) {
      return true;
    }

    return current_user_can('manage_options');
  }

  /**
   * Configure headers for iframe embedding and no-cache.
   *
   * @return void
   */
  public function send_editor_headers(): void
  {
    if (!self::is_editor_preview()) {
      return;
    }

    nocache_headers();

    // Remove X-Frame-Options to allow embedding in MotionKit editor iframe
    if (!headers_sent()) {
      header_remove('X-Frame-Options');
    }
  }

  /**
   * Enqueue editor bridge script and localize motionkitData.
   *
   * @return void
   */
  public function enqueue_editor_bridge(): void
  {
    if (!self::is_editor_preview()) {
      return;
    }

    // The connector enqueues its own bridge under this same handle, and wp_enqueue_script silently ignores a second registration of a handle that already exists — so with both plugins active one plugin's bridge would load carrying the other's localized data. The connector's is the fuller one, so this plugin stands down. Same rule as RestApi::connector_owns_rest().
    if (defined('MOTIONKIT_CONNECTOR_LOADED')) {
      return;
    }

    $bridge_script = 'assets/build/modules/editor-bridge.js';
    if (!file_exists(MOTIONKIT_PLUGIN_DIR . $bridge_script)) {
      return;
    }

    $version = defined('MOTIONKIT_VERSION') ? MOTIONKIT_VERSION : '1.0.0';

    wp_enqueue_script(
      'motionkit-editor-bridge',
      plugins_url($bridge_script, MOTIONKIT_PLUGIN_FILE),
      [],
      $version,
      true
    );

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    $token = isset($_GET['motionkit_token']) ? sanitize_text_field(wp_unslash($_GET['motionkit_token'])) : '';
    // Shared with the frontend reader: a save under one key and a read under another is invisible data loss, so both sides resolve the slot in one place.
    $page_type_config = \MotionKit\Common\PageType::current();
    $page_settings = $this->get_current_page_settings($page_type_config);
    // The editor works with one list per bucket, working copies stitched back onto their published records — the same shape it sent on save. A visitor only ever gets the published half.
    $editor_buckets = AnimationResolver::for_editor($page_type_config);
    $page_animation = $editor_buckets['page'];
    $global_animation = $editor_buckets['global'];
    $global_settings = get_option('motionkit_global_settings', []);

    $runtime_data = [
      'platform'                  => 'wordpress',
      'plugins'                   => PluginStatus::snapshot(),
      'ajax_url'                  => admin_url('admin-ajax.php'),
      'nonce'                     => wp_create_nonce('motionkit_frontend_nonce'),
      'rest_url'                  => rest_url('motionkit/v1/'),
      'site_url'                  => home_url('/'),
      'base_domain'               => home_url('/'),
      'motionkit_token'           => $token,
      'pageTypeConfigs'           => $page_type_config,
      'currentPageSettings'       => $page_settings,
      'globalSettings'            => is_array($global_settings) ? $global_settings : [],
      'global_settings'           => is_array($global_settings) ? $global_settings : [],
      'globalAnimation'           => $global_animation,
      'global_animation'          => $global_animation,
      'pageAnimation'             => $page_animation,
      'page_animation'            => $page_animation,
      'device_config'             => ['desktop', 'tablet', 'mobile'],
      'deviceConfig'              => ['desktop', 'tablet', 'mobile'],
      'isEditor'                  => true,
    ];

    wp_localize_script('motionkit-editor-bridge', 'motionkitData', $runtime_data);
  }

  /**
   * Retrieve page settings for current page.
   *
   * @param array $config Page type configuration.
   * @return array
   */
  private function get_current_page_settings(array $config): array
  {
    $type = $config['type'] ?? 'page';
    $id = (int) ($config['id'] ?? 0);
    $store_type = $config['store_type'] ?? 'post_meta';
    $settings_key = 'motionkit_pg_settings_' . $type;

    if ($store_type === 'post_meta' && $id > 0) {
      $meta = get_post_meta($id, $settings_key, true);
      if (empty($meta)) {
        $meta = get_post_meta($id, '_motionkit_pg_settings', true);
      }
      return is_array($meta) ? $meta : [];
    }

    if ($store_type === 'term_meta' && $id > 0) {
      $meta = get_term_meta($id, $settings_key, true);
      return is_array($meta) ? $meta : [];
    }

    $option = get_option($settings_key, []);
    return is_array($option) ? $option : [];
  }
}
