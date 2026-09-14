<?php

declare(strict_types=1);

namespace MotionKit\Auth;

use MotionKit\Common\EditorEndpoint;

/**
 * MotionKit WordPress Plugin — OAuth Handler.
 *
 * Manages OAuth connection flow with motionkit.io:
 * - State token generation (CSRF protection)
 * - Redirect to motionkit.io authorize page
 * - Callback handling (authorization code -> encrypted access token)
 * - Token storage (AES-256-CBC encrypted in wp_options)
 * - Disconnect & revocation
 *
 * @package MotionKit
 * @since 1.2.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

final class OAuthHandler
{
  private const OPT_ACCESS_TOKEN = 'motionkit_access_token';
  private const OPT_CONNECTED_AT = 'motionkit_connected_at';
  private const OPT_CONNECTED_EMAIL = 'motionkit_connected_email';
  private const OPT_STATE_TOKEN = 'motionkit_oauth_state';

  public function init(): void
  {
    // Priority 5, ahead of the connector's default-10 callback. ConnectPage::authorize_url() prefers this handler, so the state token for any connect started from that page lives in OUR option — but the connector's callback also fires on this page+code+state and, finding nothing in ITS transient, redirects with error=invalid_state and exits before we ever run. Going first means the handler that owns the state is the one that gets to answer.
    add_action('admin_init', [$this, 'handle_oauth_callback'], 5);
    add_action('admin_init', [$this, 'handle_oauth_disconnect'], 5);
  }

  public static function is_connected(): bool
  {
    $token = get_option(self::OPT_ACCESS_TOKEN, '');
    return is_string($token) && $token !== '';
  }

  public static function get_connection_info(): array
  {
    $connected = self::is_connected();
    return [
      'connected'    => $connected,
      'email'        => $connected ? (string) get_option(self::OPT_CONNECTED_EMAIL, '') : '',
      'connected_at' => $connected ? (string) get_option(self::OPT_CONNECTED_AT, '') : '',
    ];
  }

  /**
   * Where the editor sends the browser back after consent.
   *
   * One definition because /connect/token requires the exact redirect_uri the
   * authorize step was given — two literals would eventually disagree and the
   * exchange would fail with nothing to point at.
   */
  private static function callback_url(): string
  {
    return admin_url('admin.php?page=motionkit-connect&tab=connect');
  }

  public static function get_authorize_url(bool $switch_account = false): string
  {
    $state = wp_generate_password(32, false);
    update_option(self::OPT_STATE_TOKEN, $state);

    // Parameter names are the editor's contract, not ours: src/pages/connect/AuthorizePage.jsx reads state, site, redirect_uri and response_type, and refuses to mint a code if any of the first three is missing. This used to send `return_url` with no `response_type`, so the authorize page showed its missing-parameters state and never redirected back with ?code — the plugin then stayed "Not Connected" forever with nothing logged.
    // rawurlencode because add_query_arg does NOT encode the values it is handed, and this one contains its own `&`. Unencoded, the `&tab=connect` split off as a top-level param of the authorize URL and redirect_uri arrived truncated to `...?page=motionkit-connect` — the editor then posted that truncated value to /connect/authorize, and the callback never carried the code back here.
    $query_args = [
      'site'          => home_url('/'),
      'platform'      => 'wordpress',
      'state'         => $state,
      'response_type' => 'code',
      'redirect_uri'  => rawurlencode(self::callback_url()),
    ];

    if ($switch_account) {
      $query_args['switch_account'] = '1';
    }

    return add_query_arg($query_args, EditorEndpoint::url('connect/authorize'));
  }

  public static function get_access_token(): string
  {
    $stored = get_option(self::OPT_ACCESS_TOKEN, '');
    if (!is_string($stored) || $stored === '') {
      return '';
    }
    return self::decrypt($stored);
  }

  public function handle_oauth_callback(): void
  {
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only page check
    if (!isset($_GET['page']) || $_GET['page'] !== 'motionkit-connect') {
      return;
    }
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- External OAuth callback verified via state token below
    if (!isset($_GET['code']) || !isset($_GET['state'])) {
      return;
    }
    if (!current_user_can('manage_options')) {
      return;
    }

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Validated via hash_equals against saved state token
    $state = sanitize_text_field(wp_unslash($_GET['state']));
    $saved_state = (string) get_option(self::OPT_STATE_TOKEN, '');

    // Nothing stored means this connect was not started here — with both plugins active the connector's callback fires on the same page+code+state, and it keeps its own state in a transient. Stand down rather than answering for it; the state is deliberately left in place so the handler that owns it can still match.
    if ($saved_state === '') {
      return;
    }

    // Consumed only once we know the callback is ours: deleting before the compare meant a connector-started connect burned this plugin's unrelated state on its way past, so the next genuine connect from here failed with invalid_state.
    if ($state === '' || !hash_equals($saved_state, $state)) {
      return;
    }

    delete_option(self::OPT_STATE_TOKEN);

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- OAuth authorization code exchanged with SaaS token endpoint
    $code = sanitize_text_field(wp_unslash($_GET['code']));
    $response = wp_remote_post(EditorEndpoint::url('connect/token'), [
      'timeout' => 15,
      // grant_type and redirect_uri are required by the editor's /connect/token — it 400s on anything but 'authorization_code', and the redirect_uri must be the same one the authorize step was given.
      'body'    => [
        'grant_type'   => 'authorization_code',
        'code'         => $code,
        'site'         => home_url('/'),
        'platform'     => 'wordpress',
        'redirect_uri' => self::callback_url(),
      ],
    ]);

    if (is_wp_error($response)) {
      // The transport reason (DNS, refused connection, TLS) is the whole diagnosis and is otherwise thrown away — 'token_exchange_failed' alone cannot distinguish "could not reach the editor" from "the editor said no".
      if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('[motionkit] token exchange transport error: ' . $response->get_error_message());
      }
      $this->redirect_with_notice(['error' => 'token_exchange_failed']);
      return;
    }

    $code_res = wp_remote_retrieve_response_code($response);
    $raw_body = wp_remote_retrieve_body($response);
    $body = json_decode($raw_body, true);

    if ($code_res !== 200 || !is_array($body) || empty($body['access_token'])) {
      if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('[motionkit] token exchange HTTP ' . $code_res . ': ' . substr((string) $raw_body, 0, 500));
      }
      $err = is_array($body) && !empty($body['error']) ? $body['error'] : 'token_exchange_failed';
      $this->redirect_with_notice(['error' => sanitize_key((string) $err)]);
      return;
    }

    // Encrypt access token before storing at rest
    $encrypted = self::encrypt((string) $body['access_token']);
    update_option(self::OPT_ACCESS_TOKEN, $encrypted);
    update_option(self::OPT_CONNECTED_AT, gmdate('Y-m-d H:i:s'));
    if (!empty($body['email'])) {
      update_option(self::OPT_CONNECTED_EMAIL, sanitize_email((string) $body['email']));
    }

    $this->redirect_with_notice(['connected' => '1']);
  }

  public function handle_oauth_disconnect(): void
  {
    if (!isset($_GET['page']) || $_GET['page'] !== 'motionkit-connect') {
      return;
    }
    if (!isset($_GET['motionkit_disconnect'])) {
      return;
    }
    if (!current_user_can('manage_options')) {
      return;
    }

    $nonce = isset($_GET['_wpnonce']) ? sanitize_text_field(wp_unslash($_GET['_wpnonce'])) : '';
    if (!wp_verify_nonce($nonce, 'motionkit_disconnect')) {
      $this->redirect_with_notice(['error' => 'nonce_failed']);
      return;
    }

    $token = self::get_access_token();
    if ($token !== '') {
      wp_remote_post(EditorEndpoint::url('connect/revoke'), [
        'timeout' => 5,
        'body'    => [
          'token' => $token,
          'site'  => home_url('/'),
        ],
      ]);
    }

    delete_option(self::OPT_ACCESS_TOKEN);
    delete_option(self::OPT_CONNECTED_AT);
    delete_option(self::OPT_CONNECTED_EMAIL);

    $this->redirect_with_notice(['disconnected' => '1']);
  }

  private function redirect_with_notice(array $args): void
  {
    $url = add_query_arg(array_merge(['page' => 'motionkit-connect', 'tab' => 'connect'], $args), admin_url('admin.php'));
    wp_safe_redirect(wp_nonce_url($url, 'motionkit_notice'));
    exit;
  }

  private static function encrypt(string $plain): string
  {
    $key = hash('sha256', wp_salt('auth'), true);
    $iv = openssl_random_pseudo_bytes(16);
    $cipher = openssl_encrypt($plain, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
    $hmac = hash_hmac('sha256', $iv . $cipher, $key, true);
    return base64_encode($iv . $hmac . $cipher);
  }

  private static function decrypt(string $encoded): string
  {
    $data = base64_decode($encoded, true);
    if ($data === false || strlen($data) < 48) {
      return '';
    }

    $key = hash('sha256', wp_salt('auth'), true);
    $iv = substr($data, 0, 16);
    $hmac = substr($data, 16, 32);
    $cipher = substr($data, 48);

    $calculated = hash_hmac('sha256', $iv . $cipher, $key, true);
    if (!hash_equals($hmac, $calculated)) {
      return '';
    }

    $decrypted = openssl_decrypt($cipher, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
    return is_string($decrypted) ? $decrypted : '';
  }
}
