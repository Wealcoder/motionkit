<?php

declare(strict_types=1);

namespace MotionKit\Auth;

use MotionKit\Common\EditorEndpoint;

/**
 * MotionKit WordPress Plugin — Editor Session JWT Token Manager.
 *
 * Mints and verifies HMAC-SHA256 signed JWT tokens for secure
 * editor iframe previews and REST API saves without passwords.
 *
 * @package MotionKit
 * @since 1.2.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

final class JwtTokenManager
{
  private const SECRET_OPTION = 'motionkit_jwt_secret';
  private const SECRET_SOURCE_OPTION = 'motionkit_jwt_secret_source';
  private const SYNC_LOCK_TRANSIENT = 'motionkit_jwt_secret_sync_lock';
  // One lock, two durations: a call that failed is retried soon, a key the editor rejected is not asked about again for a while.
  private const SYNC_RETRY_SECONDS = 30;
  private const SYNC_REJECTED_SECONDS = 300;
  private const TOKEN_TTL = 86400; // 24 hours

  // Set once a fetch in this request has brought the editor's current secret, so a signature that still does not match is not answered with a second call.
  private static bool $synced_this_request = false;

  public static function get_secret(): string
  {
    $secret = get_option(self::SECRET_OPTION, '');
    $usable = is_string($secret) && strlen($secret) >= 32;

    if ($usable && get_option(self::SECRET_SOURCE_OPTION, '') === 'editor') {
      return $secret;
    }

    // The editor signs the tokens its own dashboard hands out, and a connected site can ask for that signing secret. Without it a launch from the dashboard arrives carrying a token this site cannot verify, so is_editor_preview() refuses the request, no bridge is enqueued, and the editor sits at "Detecting MotionKit plugin" forever. Same exchange the connector has always done.
    $from_editor = self::fetch_editor_secret();
    if ($from_editor !== '') {
      update_option(self::SECRET_OPTION, $from_editor, false);
      update_option(self::SECRET_SOURCE_OPTION, 'editor', false);
      return $from_editor;
    }

    if ($usable) {
      return $secret;
    }

    // Local fallback so the tokens this site mints for its own launches work before it is ever connected. Recorded as local, so the editor's secret replaces it on a later request rather than this value sticking for good.
    $secret = wp_generate_password(64, true, true);
    update_option(self::SECRET_OPTION, $secret, false);
    update_option(self::SECRET_SOURCE_OPTION, 'local', false);

    return $secret;
  }

  /**
   * Drop a secret synced from the editor, so the next connect fetches afresh.
   *
   * @return void
   */
  public static function forget_synced_secret(): void
  {
    delete_option(self::SECRET_OPTION);
    delete_option(self::SECRET_SOURCE_OPTION);
    delete_transient(self::SYNC_LOCK_TRANSIENT);
  }

  /**
   * The editor's own signing secret, or '' when it cannot be had right now.
   *
   * @return string
   */
  private static function fetch_editor_secret(): string
  {
    if (!OAuthHandler::is_connected()) {
      return '';
    }

    // get_secret() runs on ordinary front-end requests, so the editor is never asked twice in quick succession. The lock is taken for the short retry window first; only an answer saying the key itself is wrong extends it. It used to be five minutes on every attempt, so one slow or failed call cost five minutes of launches this site could not validate, with Retry unable to help.
    if (get_transient(self::SYNC_LOCK_TRANSIENT)) {
      return '';
    }
    set_transient(self::SYNC_LOCK_TRANSIENT, 1, self::SYNC_RETRY_SECONDS);

    // The connect access token is what /connect/token-secret authenticates with: it hashes the bearer and matches it against the site's own row.
    $api_key = OAuthHandler::get_access_token();
    if ($api_key === '') {
      return '';
    }

    $response = wp_remote_get(EditorEndpoint::url('connect/token-secret'), [
      'headers' => ['Authorization' => 'Bearer ' . $api_key],
      'timeout' => 10,
    ]);

    if (is_wp_error($response)) {
      return '';
    }

    $code = (int) wp_remote_retrieve_response_code($response);

    // 401 or 403 is the editor saying this site's key is not one it knows. Asking again sooner changes nothing, and a reconnect clears the lock anyway (forget_synced_secret).
    if ($code === 401 || $code === 403) {
      set_transient(self::SYNC_LOCK_TRANSIENT, 1, self::SYNC_REJECTED_SECONDS);
      return '';
    }

    if ($code !== 200) {
      return '';
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    $secret = is_array($body) && !empty($body['token_secret']) ? (string) $body['token_secret'] : '';
    if (strlen($secret) < 32) {
      return '';
    }

    // A good answer frees the lock: the next caller that needs a fresh secret — a signature that stopped matching after the editor re-issued it — may ask at once.
    delete_transient(self::SYNC_LOCK_TRANSIENT);
    self::$synced_this_request = true;

    return $secret;
  }

  // Whether the payload says the editor signed it: iss is motionkit-server and it has not expired. Read before the signature is trusted, so it decides only whether a re-fetch is worth making, never whether the token is valid.
  private static function claims_editor_issuer(string $body_b64): bool
  {
    $payload = json_decode(self::base64url_decode($body_b64), true);
    if (!is_array($payload) || ($payload['iss'] ?? '') !== 'motionkit-server') {
      return false;
    }
    return isset($payload['exp']) && time() < (int) $payload['exp'];
  }

  public static function generate(string $site_url): string
  {
    $header = [
      'alg' => 'HS256',
      'typ' => 'JWT',
    ];

    $now = time();
    // iss is rtrim'd for the same reason `site` already was: callers pass home_url('/'), but the connector's validator compares iss against home_url() — no trailing slash — and rejects the token outright. With both plugins active the connector owns /save, so every save from a token minted here came back 401 invalid_token.
    $payload = [
      'iss'  => rtrim($site_url, '/'),
      'sub'  => 'motionkit_editor',
      'iat'  => $now,
      'exp'  => $now + self::TOKEN_TTL,
      'site' => rtrim($site_url, '/'),
    ];

    $head_b64 = self::base64url_encode((string) wp_json_encode($header));
    $body_b64 = self::base64url_encode((string) wp_json_encode($payload));
    $sig = hash_hmac('sha256', "{$head_b64}.{$body_b64}", self::get_secret(), true);
    $sig_b64 = self::base64url_encode($sig);

    return "{$head_b64}.{$body_b64}.{$sig_b64}";
  }

  public static function validate_reusable(?string $token, string $expected_site = ''): bool
  {
    if (!is_string($token) || $token === '') {
      return false;
    }

    $parts = explode('.', $token);
    if (count($parts) !== 3) {
      return false;
    }

    [$head_b64, $body_b64, $sig_b64] = $parts;
    $signed = "{$head_b64}.{$body_b64}";
    $secret = self::get_secret();
    $expected_sig = hash_hmac('sha256', $signed, $secret, true);
    $provided_sig = self::base64url_decode($sig_b64);

    // A token the editor signed with a secret this site no longer holds: the editor re-issued it, or another connection fetched it since. One lock-gated fetch settles whether the site is behind rather than the token wrong — but only for a token that claims to be the editor's, so a stray or forged one never costs an outbound call.
    if (!hash_equals($expected_sig, $provided_sig) && !self::$synced_this_request && self::claims_editor_issuer($body_b64)) {
      $fresh = self::fetch_editor_secret();
      if ($fresh !== '' && $fresh !== $secret) {
        update_option(self::SECRET_OPTION, $fresh, false);
        update_option(self::SECRET_SOURCE_OPTION, 'editor', false);
        $expected_sig = hash_hmac('sha256', $signed, $fresh, true);
      }
    }

    if (!hash_equals($expected_sig, $provided_sig)) {
      return false;
    }

    $payload_json = self::base64url_decode($body_b64);
    $payload = json_decode($payload_json, true);
    if (!is_array($payload)) {
      return false;
    }

    // Check expiration
    if (!isset($payload['exp']) || time() >= (int) $payload['exp']) {
      return false;
    }

    // Optional site check
    if ($expected_site !== '' && isset($payload['site'])) {
      if (rtrim($payload['site'], '/') !== rtrim($expected_site, '/')) {
        return false;
      }
    }

    return true;
  }

  private static function base64url_encode(string $data): string
  {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
  }

  private static function base64url_decode(string $data): string
  {
    $remainder = strlen($data) % 4;
    if ($remainder) {
      $data .= str_repeat('=', 4 - $remainder);
    }
    return (string) base64_decode(strtr($data, '-_', '+/'));
  }
}
