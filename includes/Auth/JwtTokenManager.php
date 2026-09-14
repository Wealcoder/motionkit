<?php

declare(strict_types=1);

namespace MotionKit\Auth;

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
  private const TOKEN_TTL = 86400; // 24 hours

  public static function get_secret(): string
  {
    $secret = get_option(self::SECRET_OPTION, '');
    if (!is_string($secret) || strlen($secret) < 32) {
      $secret = wp_generate_password(64, true, true);
      update_option(self::SECRET_OPTION, $secret);
    }
    return $secret;
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
    $expected_sig = hash_hmac('sha256', "{$head_b64}.{$body_b64}", self::get_secret(), true);
    $provided_sig = self::base64url_decode($sig_b64);

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
