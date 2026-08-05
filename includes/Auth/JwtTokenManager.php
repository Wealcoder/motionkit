<?php

namespace MotionKit\Auth;

/**
 * JWT Token Manager
 *
 * Generates and validates HMAC-SHA256 JSON Web Tokens for editor sessions.
 * Tokens are single-use (jti tracked) with a configurable TTL.
 *
 * @package MotionKit
 * @since 1.1.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

final class JwtTokenManager
{
  /**
   * Token TTL in seconds (8 hours — covers a full editor session)
   */
  private const TTL = 28800;

  /**
   * WP option key for used jti values
   */
  private const JTI_OPTION = 'motionkit_used_jtis';

  /**
   * Generate a signed JWT by calling the MotionKit server's /connect/launch endpoint.
   * The server is the single source of truth for token generation.
   *
   * @param string $site_url The WordPress site URL being edited
   * @return string The JWT token, or empty string on failure
   */
  public static function generate(string $site_url): string
  {
    // Get editor base URL from filter (supports dev override).
    $editor_url = apply_filters('motionkit/editor/url', 'https://editor.motionkit.io/');
    $editor_url = rtrim($editor_url, '/');

    // Get the access token for server auth.
    $access_token = OAuthHandler::get_access_token();
    if (empty($access_token)) {
      return self::generate_local($site_url);
    }

    $response = wp_remote_post(
      $editor_url . '/connect/launch',
      [
        'headers' => [
          'Content-Type'  => 'application/json',
          'Authorization' => 'Bearer ' . $access_token,
        ],
        'body'    => wp_json_encode([
          'site'     => home_url('/'),
          'page_url' => $site_url,
        ]),
        'timeout' => 15,
      ]
    );

    if (!is_wp_error($response)) {
      $code = wp_remote_retrieve_response_code($response);
      $body = json_decode(wp_remote_retrieve_body($response), true);

      if ($code === 200 && !empty($body['token'])) {
        return $body['token'];
      }
    }

    // Fallback to local generation if server is unreachable.
    return self::generate_local($site_url);
  }

  /**
   * Fallback: generate a JWT locally (used when server is unreachable).
   *
   * @param string $site_url
   * @return string
   */
  private static function generate_local(string $site_url): string
  {
    $secret = self::get_secret();
    $now = time();
    $jti = bin2hex(random_bytes(16));

    $header = self::base64url_encode(wp_json_encode([
      'alg' => 'HS256',
      'typ' => 'JWT',
    ]));

    $payload = self::base64url_encode(wp_json_encode([
      'iss'  => home_url(),
      'sub'  => get_current_user_id(),
      'site' => $site_url,
      'iat'  => $now,
      'exp'  => $now + self::TTL,
      'jti'  => $jti,
    ]));

    $signature = self::base64url_encode(
      hash_hmac('sha256', "$header.$payload", $secret, true)
    );

    return "$header.$payload.$signature";
  }

  /**
   * Validate a JWT and return the decoded payload.
   *
   * Checks: structure, signature, expiry, single-use jti.
   *
   * @param string $token The JWT string
   * @return array|false Decoded payload on success, false on failure
   */
  public static function validate(string $token)
  {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
      return false;
    }

    [$header, $payload, $signature] = $parts;

    // Verify signature
    $secret = self::get_secret();
    $expected_sig = self::base64url_encode(
      hash_hmac('sha256', "$header.$payload", $secret, true)
    );

    if (!hash_equals($expected_sig, $signature)) {
      return false;
    }

    // Decode payload
    $data = json_decode(self::base64url_decode($payload), true);
    if (!is_array($data)) {
      return false;
    }

    // Check expiry
    if (!isset($data['exp']) || $data['exp'] < time()) {
      return false;
    }

    // Check issuer matches this site
    if (!isset($data['iss']) || $data['iss'] !== home_url()) {
      return false;
    }

    // Check single-use jti
    if (!isset($data['jti']) || self::is_jti_used($data['jti'])) {
      return false;
    }

    // Mark jti as used
    self::mark_jti_used($data['jti'], $data['exp']);

    return $data;
  }

  /**
   * Validate a JWT without consuming it (no jti check).
   * Used for REST API requests where the same token may be sent multiple times.
   *
   * @param string $token The JWT string
   * @return array|false Decoded payload on success, false on failure
   */
  public static function validate_reusable(string $token)
  {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
      return false;
    }

    [$header, $payload, $signature] = $parts;

    $secret = self::get_secret();
    $expected_sig = self::base64url_encode(
      hash_hmac('sha256', "$header.$payload", $secret, true)
    );

    if (!hash_equals($expected_sig, $signature)) {
      return false;
    }

    $data = json_decode(self::base64url_decode($payload), true);
    if (!is_array($data)) {
      return false;
    }

    if (!isset($data['exp']) || $data['exp'] < time()) {
      return false;
    }

    if (!isset($data['iss']) || $data['iss'] !== home_url()) {
      return false;
    }

    return $data;
  }

  /**
   * Get the HMAC secret key.
   *
   * Priority:
   *  1. Cached in wp_options (motionkit_jwt_secret) — fastest
   *  2. Fetched from MotionKit server's mk_settings table via connect API
   *  3. Generate locally and save (fallback)
   *
   * The server's token_secret is the source of truth. When a site connects,
   * the secret is synced from the server and cached in wp_options.
   *
   * @return string The secret key
   */
  private static function get_secret(): string
  {
    $secret = get_option('motionkit_jwt_secret');

    if (!empty($secret)) {
      return $secret;
    }

    // Try to fetch from MotionKit server.
    $editor_url = get_option('motionkit_editor_url', '');
    $api_key = get_option('motionkit_api_key', '');

    if ($editor_url && $api_key) {
      $response = wp_remote_get(
        rtrim($editor_url, '/') . '/connect/token-secret',
        [
          'headers' => ['Authorization' => 'Bearer ' . $api_key],
          'timeout' => 10,
        ]
      );

      if (!is_wp_error($response)) {
        $body = json_decode(wp_remote_retrieve_body($response), true);
        if (!empty($body['token_secret'])) {
          $secret = $body['token_secret'];
          update_option('motionkit_jwt_secret', $secret, false);
          return $secret;
        }
      }
    }

    // Fallback: generate locally.
    $secret = bin2hex(random_bytes(32));
    update_option('motionkit_jwt_secret', $secret, false);

    return $secret;
  }

  /**
   * Check if a jti has already been used.
   *
   * @param string $jti The JWT ID
   * @return bool
   */
  private static function is_jti_used(string $jti): bool
  {
    $used = get_option(self::JTI_OPTION, []);
    return isset($used[$jti]);
  }

  /**
   * Mark a jti as used and clean up expired entries.
   *
   * @param string $jti The JWT ID
   * @param int    $exp The token expiry timestamp
   * @return void
   */
  private static function mark_jti_used(string $jti, int $exp): void
  {
    $used = get_option(self::JTI_OPTION, []);

    // Clean expired entries
    $now = time();
    $used = array_filter($used, function ($expiry) use ($now) {
      return $expiry > $now;
    });

    $used[$jti] = $exp;
    update_option(self::JTI_OPTION, $used, false);
  }

  /**
   * Base64url encode (no padding, URL-safe)
   *
   * @param string $data
   * @return string
   */
  private static function base64url_encode(string $data): string
  {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
  }

  /**
   * Base64url decode
   *
   * @param string $data
   * @return string
   */
  private static function base64url_decode(string $data): string
  {
    $remainder = strlen($data) % 4;
    if ($remainder) {
      $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($data, '-_', '+/'));
  }
}
