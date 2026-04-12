<?php

namespace WcfAnimationBuilder\Auth;

/**
 * OAuth Handler
 *
 * Manages the OAuth connect flow between WordPress and motionkit.io:
 * - State token generation (CSRF protection)
 * - Redirect to motionkit.io authorize page
 * - Callback handling (code → access token exchange)
 * - Token storage (AES-256 encrypted in wp_options)
 * - Disconnect / token revocation
 *
 * @package WcfAnimationBuilder
 * @since 1.1.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

final class OAuthHandler
{
  /**
   * MotionKit authorize endpoint
   */
  private const AUTHORIZE_URL = 'https://editor.motionkit.io/connect/authorize';

  /**
   * MotionKit token exchange endpoint
   */
  private const TOKEN_URL = 'https://editor.motionkit.io/connect/token';

  /**
   * MotionKit revoke endpoint
   */
  private const REVOKE_URL = 'https://editor.motionkit.io/connect/revoke';

  /**
   * Get the authorize URL (filterable for dev environments).
   *
   * @return string
   */
  private static function get_authorize_base_url(): string
  {
    return apply_filters('motionkit/connect/authorize_url', self::AUTHORIZE_URL);
  }

  /**
   * Get the token exchange URL (filterable for dev environments).
   *
   * @return string
   */
  private static function get_token_url(): string
  {
    return apply_filters('motionkit/connect/token_url', self::TOKEN_URL);
  }

  /**
   * Get the revoke URL (filterable for dev environments).
   *
   * @return string
   */
  private static function get_revoke_url(): string
  {
    return apply_filters('motionkit/connect/revoke_url', self::REVOKE_URL);
  }

  /**
   * Get the validate URL (filterable for dev environments).
   *
   * @return string
   */
  private static function get_validate_url(): string
  {
    return apply_filters('motionkit/connect/validate_url', 'https://editor.motionkit.io/connect/validate');
  }

  /**
   * Get the verify-session URL (filterable for dev environments).
   * Used to validate server-generated editor session JWTs.
   *
   * @return string
   */
  public static function get_verify_session_url(): string
  {
    return apply_filters('motionkit/connect/verify_session_url', 'https://editor.motionkit.io/connect/verify-session');
  }

  /**
   * WP option keys
   */
  private const OPT_ACCESS_TOKEN = 'motionkit_access_token';
  private const OPT_CONNECTED_AT = 'motionkit_connected_at';
  private const OPT_CONNECTED_EMAIL = 'motionkit_connected_email';
  private const OPT_STATE_TOKEN = 'motionkit_oauth_state';

  /**
   * Initialize OAuth hooks
   *
   * @return void
   */
  public function init(): void
  {
    // Handle OAuth callback
    add_action('admin_init', [$this, 'handle_callback']);

    // Handle disconnect action
    add_action('admin_init', [$this, 'handle_disconnect']);

    // Handle verify action
    add_action('admin_init', [$this, 'handle_verify']);
  }

  /**
   * Check if the site is connected to MotionKit.
   *
   * @return bool
   */
  public static function is_connected(): bool
  {
    $token = get_option(self::OPT_ACCESS_TOKEN);
    return !empty($token);
  }

  /**
   * Get connection info for display.
   *
   * @return array{connected: bool, email: string, connected_at: string}
   */
  public static function get_connection_info(): array
  {
    return [
      'connected'    => self::is_connected(),
      'email'        => get_option(self::OPT_CONNECTED_EMAIL, ''),
      'connected_at' => get_option(self::OPT_CONNECTED_AT, ''),
    ];
  }

  /**
   * Get the stored access token (decrypted).
   *
   * @return string|false
   */
  public static function get_access_token()
  {
    $encrypted = get_option(self::OPT_ACCESS_TOKEN);
    if (empty($encrypted)) {
      return false;
    }
    return self::decrypt($encrypted);
  }

  /**
   * Build the authorize URL and store state token.
   *
   * @return string The full authorize URL to redirect to
   */
  public function get_authorize_url(): string
  {
    // Generate CSRF state token
    $state = bin2hex(random_bytes(32));

    // Store state token (expires in 10 minutes)
    set_transient(self::OPT_STATE_TOKEN, $state, 600);

    $params = [
      'state'         => $state,
      'site'          => home_url(),
      'response_type' => 'code',
      'redirect_uri'  => $this->get_callback_url(),
    ];

    return add_query_arg($params, self::get_authorize_base_url());
  }

  /**
   * Get the OAuth callback URL (WP admin page).
   *
   * @return string
   */
  private function get_callback_url(): string
  {
    return admin_url('admin.php?page=motionkit-connect');
  }

  /**
   * Handle the OAuth callback from motionkit.io.
   * Validates state token, exchanges code for access token, stores token.
   *
   * @return void
   */
  public function handle_callback(): void
  {
    if (!isset($_GET['page'], $_GET['code'], $_GET['state'])) {
      return;
    }

    if ($_GET['page'] !== 'motionkit-connect') {
      return;
    }

    if (!current_user_can('manage_options')) {
      return;
    }

    $code = sanitize_text_field(wp_unslash($_GET['code']));
    $state = sanitize_text_field(wp_unslash($_GET['state']));

    // Verify CSRF state token
    $stored_state = get_transient(self::OPT_STATE_TOKEN);
    if (!$stored_state || !hash_equals($stored_state, $state)) {
      wp_safe_redirect(admin_url('admin.php?page=motionkit-connect&tab=connect&error=invalid_state'));
      exit;
    }

    // Delete state token (single-use)
    delete_transient(self::OPT_STATE_TOKEN);

    // Exchange auth code for access token
    $result = $this->exchange_code_for_token($code);
   
    if (is_wp_error($result)) {
      $redirect = admin_url('admin.php?page=motionkit-connect&tab=connect&error=' . $result->get_error_code());
      if ($result->get_error_message()) {
        $redirect = add_query_arg('error_message', rawurlencode($result->get_error_message()), $redirect);
      }
      wp_safe_redirect($redirect);
      exit;
    }

    // Store encrypted token
    $encrypted = self::encrypt($result['access_token']);
    update_option(self::OPT_ACCESS_TOKEN, $encrypted, false);
    update_option(self::OPT_CONNECTED_AT, current_time('mysql'), false);

    if (!empty($result['email'])) {
      update_option(self::OPT_CONNECTED_EMAIL, sanitize_email($result['email']), false);
    }

    wp_safe_redirect(admin_url('admin.php?page=motionkit-connect&tab=connect&connected=1'));
    exit;
  }

  /**
   * Exchange authorization code for access token via motionkit.io API.
   *
   * @param string $code The authorization code
   * @return array|\WP_Error Token data on success, WP_Error on failure
   */
  private function exchange_code_for_token(string $code)
  {
    $response = wp_remote_post(self::get_token_url(), [
      'timeout' => 30,
      'headers' => [
        'Content-Type' => 'application/json',
      ],
      'body' => wp_json_encode([
        'code'         => $code,
        'site'         => home_url(),
        'redirect_uri' => $this->get_callback_url(),
        'grant_type'   => 'authorization_code',
      ]),
    ]);

    if (is_wp_error($response)) {
      return new \WP_Error('token_exchange_failed', $response->get_error_message());
    }

    $status = wp_remote_retrieve_response_code($response);
    $body = json_decode(wp_remote_retrieve_body($response), true);

    if ($status !== 200 || empty($body['access_token'])) {
      $error_code = !empty($body['limit_exceeded']) ? 'limit_exceeded' : 'token_exchange_failed';
      $error_msg  = $body['message'] ?? $body['error'] ?? 'Failed to exchange authorization code';
      return new \WP_Error($error_code, $error_msg);
    }

    return $body;
  }

  /**
   * Handle verify action — check if the local token matches the server.
   *
   * @return void
   */
  public function handle_verify(): void
  {
    if (!isset($_GET['motionkit_verify'])) {
      return;
    }

    if (!current_user_can('manage_options')) {
      return;
    }

    if (!isset($_GET['_wpnonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_wpnonce'])), 'motionkit_verify')) {
      return;
    }

    $result = $this->verify_token_with_server();

    if (is_wp_error($result)) {
      wp_safe_redirect(admin_url('admin.php?page=motionkit-connect&verify=error&reason=' . $result->get_error_code()));
      exit;
    }

    $status = $result ? 'valid' : 'invalid';
    wp_safe_redirect(admin_url('admin.php?page=motionkit-connect&verify=' . $status));
    exit;
  }

  /**
   * Verify the stored token against the MotionKit server.
   *
   * @return bool|\WP_Error True if valid, false if mismatch, WP_Error on failure
   */
  public function verify_token_with_server()
  {
    $token = self::get_access_token();
    if (!$token) {
      return new \WP_Error('no_token', 'No access token stored locally');
    }

    $token_hash = hash('sha256', $token);

    $response = wp_remote_post(self::get_validate_url(), [
      'timeout' => 15,
      'headers' => ['Content-Type' => 'application/json'],
      'body'    => wp_json_encode([
        'site'       => home_url(),
        'token_hash' => $token_hash,
      ]),
    ]);

    if (is_wp_error($response)) {
      return new \WP_Error('server_unreachable', $response->get_error_message());
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    return !empty($body['valid']);
  }

  /**
   * Handle disconnect action.
   *
   * @return void
   */
  public function handle_disconnect(): void
  {
    if (!isset($_GET['motionkit_disconnect'])) {
      return;
    }

    if (!current_user_can('manage_options')) {
      return;
    }

    // Verify nonce
    if (!isset($_GET['_wpnonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_wpnonce'])), 'motionkit_disconnect')) {
      return;
    }

    // Attempt to revoke token on motionkit.io and get disconnect token.
    $token = self::get_access_token();
    $disconnect_token = '';
    if ($token) {
      $response = wp_remote_post(self::get_revoke_url(), [
        'timeout' => 10,
        'headers' => ['Content-Type' => 'application/json'],
        'body'    => wp_json_encode(['access_token' => $token, 'site' => home_url()]),
      ]);
      if (!is_wp_error($response)) {
        $body = json_decode(wp_remote_retrieve_body($response), true);
        $disconnect_token = $body['disconnect_token'] ?? '';
      }
    }

    // Clean up local storage
    delete_option(self::OPT_ACCESS_TOKEN);
    delete_option(self::OPT_CONNECTED_AT);
    delete_option(self::OPT_CONNECTED_EMAIL);
    delete_option('motionkit_jwt_secret');
    delete_option('motionkit_used_jtis');

    wp_safe_redirect(admin_url('admin.php?page=motionkit-connect&tab=connect&disconnected=1'));
    exit;
  }

  /**
   * Encrypt a value using AES-256-CBC.
   *
   * @param string $value Plain text value
   * @return string Base64-encoded encrypted value
   */
  private static function encrypt(string $value): string
  {
    $key = self::get_encryption_key();
    $iv = random_bytes(16);
    $encrypted = openssl_encrypt($value, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);

    return base64_encode($iv . $encrypted);
  }

  /**
   * Decrypt an AES-256-CBC encrypted value.
   *
   * @param string $encrypted Base64-encoded encrypted value
   * @return string|false Decrypted value, or false on failure
   */
  private static function decrypt(string $encrypted)
  {
    $key = self::get_encryption_key();
    $data = base64_decode($encrypted);

    if ($data === false || strlen($data) < 17) {
      return false;
    }

    $iv = substr($data, 0, 16);
    $ciphertext = substr($data, 16);

    return openssl_decrypt($ciphertext, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);
  }

  /**
   * Get the encryption key derived from WordPress salts.
   *
   * @return string 32-byte key
   */
  private static function get_encryption_key(): string
  {
    // Use WordPress AUTH_KEY + SECURE_AUTH_KEY as key material
    $material = (defined('AUTH_KEY') ? AUTH_KEY : 'default-key') .
                (defined('SECURE_AUTH_KEY') ? SECURE_AUTH_KEY : 'default-secure-key');

    return hash('sha256', $material, true);
  }
}
