<?php

namespace MotionKit\Support;

/**
 * Editor Session Trait
 *
 * Shared helpers for the MotionKit editor connector — server-session
 * verification, the CORS / frame-ancestors origin list, and the settings
 * option-key derivation. Mixed into both RestApi and Frontend so the logic
 * lives in one place.
 *
 * @package MotionKit
 * @since 1.1.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

use MotionKit\Auth\OAuthHandler;

trait EditorSessionTrait
{
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
    $cache_key = 'motionkit_session_' . substr(md5($token), 0, 16);
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
   * Editor origins allowed to embed the site / read REST responses.
   *
   * The base list is filtered through motionkit/editor/allowed_origins. The
   * wildcard is appended (before filtering) only for the frame-ancestors CSP
   * in Frontend — CORS must never allow '*'.
   *
   * @param bool $include_wildcard Append '*' to the base list before filtering.
   * @return array
   */
  private function editor_allowed_origins(bool $include_wildcard = false): array
  {
    $origins = [
      'https://editor.motionkit.io',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'http://localhost:3000',
    ];

    if ($include_wildcard) {
      $origins[] = '*';
    }

    return apply_filters('motionkit/editor/allowed_origins', $origins);
  }

  /**
   * Derive the page-settings config from the page-animation config by
   * swapping the option key prefix. Animations use motionkit_pg_animation_*,
   * settings use motionkit_pg_settings_* — same store_type and id.
   *
   * @param array $animation_config
   * @return array
   */
  private function settings_config(array $animation_config): array
  {
    $cfg = $animation_config;
    if (!empty($cfg['option']) && is_string($cfg['option'])) {
      $cfg['option'] = preg_replace(
        '/^motionkit_pg_animation_/',
        'motionkit_pg_settings_',
        $cfg['option']
      );
    }
    return $cfg;
  }

  /**
   * Validate a client-supplied pageTypeConfigs envelope before it's used to
   * read/write post_meta, term_meta, or an option.
   *
   * A valid editor session JWT only proves the caller has an active session
   * for THIS site — it says nothing about which post/term the caller was
   * actually editing. Without this check a valid token could target any
   * post_id/term_id/option name on the site by simply changing the payload.
   * This confines writes to MotionKit's own known key shape and to objects
   * that actually exist.
   *
   * @param array $config
   * @return bool
   */
  private function is_valid_page_type_config(array $config): bool
  {
    $store_type = $config['store_type'] ?? '';
    $option     = $config['option'] ?? '';

    if (!in_array($store_type, ['post_meta', 'term_meta', 'option'], true)) {
      return false;
    }

    // Every MotionKit-managed key — animation or settings, any store_type —
    // uses this prefix. Reject anything else so a payload can never target
    // an unrelated option/post_meta/term_meta key on the site.
    if (!is_string($option) || strpos($option, 'mkit_pg_') !== 0) {
      return false;
    }

    if ($store_type === 'post_meta') {
      $id = isset($config['id']) ? (int) $config['id'] : 0;
      if ($id <= 0 || !get_post($id)) {
        return false;
      }
    }

    if ($store_type === 'term_meta') {
      $id = isset($config['id']) ? (int) $config['id'] : 0;
      if ($id <= 0 || !get_term($id)) {
        return false;
      }
    }

    return true;
  }
}
