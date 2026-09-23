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
    // This plugin owns the whole connect flow; the connector only reads the token. Priority 1 because other plugins treat any wp-admin URL carrying code + state as their own OAuth callback and wp_die() on it (CrawlWP SEO's Yandex handler at priority 10), so this one must consume the callback and exit first.
    add_action('admin_init', [$this, 'handle_oauth_callback'], 1);
    add_action('admin_init', [$this, 'handle_oauth_disconnect'], 5);
    add_action('admin_init', [$this, 'handle_verify'], 5);
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
    // motionkit_state asks the editor to answer with motionkit_code / motionkit_state, which no other plugin claims; the bare `state` beside it is what an editor build without the rename still reads.
    $query_args = [
      'site'            => home_url('/'),
      'platform'        => 'wordpress',
      'state'           => $state,
      'motionkit_state' => $state,
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
    $code = self::read_callback_param('code');
    $state = self::read_callback_param('state');
    if ($code === '' || $state === '') {
      return;
    }
    if (!current_user_can('manage_options')) {
      return;
    }

    $saved_state = self::stored_state();

    // No usable state: it expired or the connect was started before an update. Falling through here let WordPress answer with "The link you followed has expired."; the Connect tab's invalid_state error tells the user to retry instead.
    if ($saved_state === '' || !hash_equals($saved_state, $state)) {
      $this->redirect_with_notice(['error' => 'invalid_state']);
      return;
    }

    delete_option(self::OPT_STATE_TOKEN);
    $response = wp_remote_post(EditorEndpoint::url('connect/token'), [
      'timeout' => 15,
      // JSON, not an array body: WordPress form-encodes an array, and an editor build without a urlencoded parser answered that with a 500, leaving every site Not Connected. The connector already sends JSON.
      'headers' => ['Content-Type' => 'application/json'],
      // grant_type and redirect_uri are required by the editor's /connect/token — it 400s on anything but 'authorization_code', and the redirect_uri must be the same one the authorize step was given.
      'body'    => wp_json_encode([
        'grant_type'   => 'authorization_code',
        'code'         => $code,
        'site'         => home_url('/'),
        'platform'     => 'wordpress',
        'redirect_uri' => self::callback_url(),
      ]),
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

    // The connector refreshes the license (and with it the update key) on this, instead of waiting up to 12 hours for its next scheduled check.
    do_action('motionkit/oauth/connected');

    $this->redirect_with_notice(['connected' => '1']);
  }

  // "My Account": asks the editor whether this site's token is still live and reports it on the Connect tab (?verify=valid|invalid|error).
  public function handle_verify(): void
  {
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- nonce verified below
    if (!isset($_GET['page'], $_GET['motionkit_verify']) || $_GET['page'] !== 'motionkit-connect') {
      return;
    }
    if (!current_user_can('manage_options')) {
      return;
    }

    $nonce = isset($_GET['_wpnonce']) ? sanitize_text_field(wp_unslash($_GET['_wpnonce'])) : '';
    if (!wp_verify_nonce($nonce, 'motionkit_verify')) {
      $this->redirect_with_notice(['error' => 'nonce_failed']);
      return;
    }

    $token = self::readable_token();
    if ($token === '') {
      $this->redirect_with_notice(['verify' => 'error', 'reason' => 'no_token']);
      return;
    }

    $response = wp_remote_post(EditorEndpoint::url('connect/validate'), [
      'timeout' => 15,
      'headers' => ['Content-Type' => 'application/json'],
      'body'    => wp_json_encode([
        'site'       => home_url(),
        'token_hash' => hash('sha256', $token),
      ]),
    ]);

    if (is_wp_error($response)) {
      $this->redirect_with_notice(['verify' => 'error', 'reason' => 'server_unreachable']);
      return;
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    $this->redirect_with_notice(['verify' => !empty($body['valid']) ? 'valid' : 'invalid']);
  }

  // Namespaced spelling first, bare as the fallback an editor build without the rename still sends. CSRF for this callback is the server-issued state compared with hash_equals(), not a nonce.
  private static function read_callback_param(string $name): string
  {
    // phpcs:disable WordPress.Security.NonceVerification.Recommended
    foreach (['motionkit_' . $name, $name] as $key) {
      if (isset($_GET[$key]) && is_string($_GET[$key])) {
        return sanitize_text_field(wp_unslash($_GET[$key]));
      }
    }
    // phpcs:enable WordPress.Security.NonceVerification.Recommended

    return '';
  }

  // This plugin stores a bare string; an older connector build that ran the flow itself stored an array with an expiry, so a connect it started before the update still completes here.
  private static function stored_state(): string
  {
    $stored = get_option(self::OPT_STATE_TOKEN, '');

    if (is_string($stored)) {
      return $stored;
    }

    if (is_array($stored) && !empty($stored['state'])
      && (empty($stored['expires_at']) || time() <= (int) $stored['expires_at'])) {
      return (string) $stored['state'];
    }

    return '';
  }

  // A token written by an older connector build is in its own cipher format, which only the connector can read; its reader tries this plugin's format first, so asking it covers both.
  private static function readable_token(): string
  {
    if (class_exists('\MotionKitConnector\Auth\OAuthHandler')) {
      $token = \MotionKitConnector\Auth\OAuthHandler::get_access_token();
      return is_string($token) ? $token : '';
    }

    return self::get_access_token();
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

    $token = self::readable_token();
    if ($token !== '') {
      wp_remote_post(EditorEndpoint::url('connect/revoke'), [
        'timeout' => 5,
        'headers' => ['Content-Type' => 'application/json'],
        // The editor's /connect/revoke reads access_token; the old `token` key was ignored, so the server-side row stayed active after a disconnect.
        'body'    => wp_json_encode([
          'access_token' => $token,
          'site'         => home_url('/'),
        ]),
      ]);
    }

    delete_option(self::OPT_ACCESS_TOKEN);
    delete_option(self::OPT_CONNECTED_AT);
    delete_option(self::OPT_CONNECTED_EMAIL);

    // The connector clears its license state, update key and launch-token secrets on this.
    do_action('motionkit/oauth/disconnected');

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
