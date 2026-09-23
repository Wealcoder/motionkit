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
  }

  /**
   * Determine if current request is a validated editor preview session.
   *
   * @return bool
   */
  public static function is_editor_preview(): bool
  {
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    if (!isset($_GET['action']) || $_GET['action'] !== 'motionkit-editor') {
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
