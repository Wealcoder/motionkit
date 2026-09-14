<?php

declare(strict_types=1);

namespace MotionKit\RestApi;

use MotionKit\Auth\JwtTokenManager;

/**
 * MotionKit WordPress Plugin — Minimal REST API for Editor Sync.
 *
 * Exposes /save and /pages endpoints so the MotionKit visual editor
 * can save Free Animation JSON definitions and query pages.
 *
 * @package MotionKit
 * @since 1.2.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

final class RestApi
{
  private const NAMESPACE = 'motionkit/v1';

  public function init(): void
  {
    add_action('rest_api_init', [$this, 'register_routes']);
    add_filter('rest_pre_serve_request', [$this, 'add_cors_headers'], 10, 4);
  }

  /**
   * The REST namespace both plugins use. Exposed so the duplicate-route
   * decision is greppable from one place rather than inferred from a constant.
   */
  public static function rest_namespace(): string
  {
    return self::NAMESPACE;
  }

  /**
   * Whether the MotionKit Connector is handling the REST API instead.
   *
   * Both plugins register motionkit/v1/save and /pages. WordPress does not warn
   * on a duplicate route — the last registration silently wins — so with both
   * active the winner depends on plugin load order. The connector's handler is
   * the richer one (drafts, share links, its own page-type routing), so this
   * plugin stands down rather than shadowing it.
   *
   * The constant is the reliable signal: the connector defines it when its
   * plugin file loads, which is before rest_api_init fires.
   *
   * @return bool
   */
  private function connector_owns_rest(): bool
  {
    return defined('MOTIONKIT_CONNECTOR_LOADED');
  }

  public function register_routes(): void
  {
    if ($this->connector_owns_rest()) {
      return;
    }

    register_rest_route(self::NAMESPACE, '/save', [
      'methods'             => \WP_REST_Server::CREATABLE,
      'callback'            => [$this, 'save_data'],
      'permission_callback' => [$this, 'check_jwt_permission'],
    ]);

    register_rest_route(self::NAMESPACE, '/pages', [
      'methods'             => \WP_REST_Server::READABLE,
      'callback'            => [$this, 'search_pages'],
      'permission_callback' => [$this, 'check_jwt_permission'],
    ]);
  }

  /**
   * Decodes the request body.
   *
   * The editor bridge posts as Content-Type: text/plain so the request stays a
   * CORS "simple request" and skips the OPTIONS preflight, which no host config
   * or WAF can then 405. WP_REST_Request::get_json_params() only parses bodies
   * declared as JSON, so it returns null here and every field read off it was
   * silently empty — the save answered 200 "No data to save" and wrote nothing.
   *
   * @param \WP_REST_Request $request
   * @return array Decoded body, or an empty array when it is not valid JSON.
   */
  private function read_body(\WP_REST_Request $request): array
  {
    $body = $request->get_json_params();
    if (is_array($body) && $body !== []) {
      return $body;
    }

    $decoded = json_decode((string) $request->get_body(), true);
    return is_array($decoded) ? $decoded : [];
  }

  public function check_jwt_permission(\WP_REST_Request $request): bool
  {
    // Try token from query param, Authorization header, or body
    $token = $request->get_param('token') ?: $request->get_header('Authorization');
    if (!$token) {
      $body = $this->read_body($request);
      if (!empty($body['token'])) {
        $token = $body['token'];
      }
    }

    if (is_string($token) && strpos($token, 'Bearer ') === 0) {
      $token = substr($token, 7);
    }

    if (is_string($token) && JwtTokenManager::validate_reusable($token, home_url('/'))) {
      return true;
    }

    // Fallback: logged-in administrator with manage_options capability
    return current_user_can('manage_options');
  }

  public function save_data(\WP_REST_Request $request): \WP_REST_Response
  {
    $body = $this->read_body($request);
    if ($body === []) {
      return new \WP_REST_Response(['error' => 'invalid_json'], 400);
    }

    // The bridge sends one bucket per request as { token, action, payload }, where payload is { animationConfigs, pageTypeConfigs }. The action names which bucket it is: there is no other way to tell a page animation from a global one, because both arrive under the same key.
    $action = isset($body['action']) ? sanitize_key($body['action']) : '';
    $payload = isset($body['payload']) && is_array($body['payload']) ? $body['payload'] : [];

    // Older editor builds posted the buckets as top-level keys with no action. Reading those first keeps them working against this plugin.
    $legacy = $this->save_legacy_shape($body);
    if ($legacy !== null) {
      return $legacy;
    }

    if ($action === '') {
      return new \WP_REST_Response(['error' => 'missing_action'], 400);
    }

    $configs = isset($payload['pageTypeConfigs']) && is_array($payload['pageTypeConfigs'])
      ? $payload['pageTypeConfigs']
      : [];
    $data = $payload['animationConfigs'] ?? null;

    $store_type = isset($configs['store_type']) ? sanitize_key($configs['store_type']) : 'post_meta';
    $target_id = isset($configs['id']) ? (int) $configs['id'] : 0;
    $option_key = isset($configs['option']) ? sanitize_key($configs['option']) : 'motionkit_pg_animation_page';

    // Backstop for the actions that do not go through is_valid_page_type_config(); `motionkit_pg_` rather than `motionkit_`, which was broad enough to reach this plugin's own settings keys.
    if (strpos($option_key, 'motionkit_pg_') !== 0) {
      $option_key = 'motionkit_pg_animation_page';
    }

    $settings_key = str_replace('motionkit_pg_animation_', 'motionkit_pg_settings_', $option_key);
    $saved = false;

    switch ($action) {
      // The two page-scoped writes are the only ones that take a caller-supplied target, so they are the only ones that need the config validated; the rest write fixed option names.
      case 'save_current_page_animation':
        if (!$this->is_valid_page_type_config($configs)) {
          return new \WP_REST_Response(['success' => false, 'error' => 'invalid_page_type_config'], 400);
        }
        $this->persist_record($store_type, $option_key, $target_id, $data);
        $saved = true;
        break;

      case 'save_current_page_settings':
        if (!$this->is_valid_page_type_config($configs)) {
          return new \WP_REST_Response(['success' => false, 'error' => 'invalid_page_type_config'], 400);
        }
        $this->persist_record($store_type, $settings_key, $target_id, $data);
        $saved = true;
        break;

      case 'save_global_animation':
        update_option('motionkit_global_animations', $data);
        $saved = true;
        break;

      case 'save_global_settings':
        update_option('motionkit_global_settings', $data);
        $saved = true;
        break;

      case 'save_animation_folders':
        update_option('motionkit_animation_folders', $data);
        $saved = true;
        break;

      case 'save_favourite_cloud_animation':
        update_option('motionkit_favourite_cloud_animations', $data);
        $saved = true;
        break;

      case 'delete_global_settings':
        delete_option('motionkit_global_settings');
        $saved = true;
        break;

      case 'delete_current_page_settings':
        $this->persist_record($store_type, $settings_key, $target_id, []);
        $saved = true;
        break;

      case 'get_settings':
        return new \WP_REST_Response([
          'success' => true,
          'data'    => [
            'global_settings'   => get_option('motionkit_global_settings', []),
            'global_animation'  => get_option('motionkit_global_animations', []),
          ],
        ], 200);

      default:
        return new \WP_REST_Response([
          'success' => false,
          'error'   => 'unknown_action',
          'action'  => $action,
        ], 400);
    }

    return new \WP_REST_Response([
      'success' => $saved,
      'saved'   => $saved,
      'action'  => $action,
      'message' => $saved ? 'Animation saved successfully.' : 'No data to save.',
    ], 200);
  }

  /**
   * Handles the pre-action payload shape, where each bucket arrived as its own
   * top-level key rather than being named by an action.
   *
   * @param array $body Decoded request body.
   * @return \WP_REST_Response|null Response when this shape was recognised, null otherwise.
   */
  private function save_legacy_shape(array $body): ?\WP_REST_Response
  {
    $page_animation = $body['pageAnimation'] ?? $body['page_animation'] ?? null;
    $global_animation = $body['globalAnimation'] ?? $body['global_animation'] ?? null;
    $page_settings = $body['currentPageSettings'] ?? $body['current_page_settings'] ?? null;
    $global_settings = $body['globalSettings'] ?? $body['global_settings'] ?? null;

    if ($page_animation === null && $global_animation === null
      && $page_settings === null && $global_settings === null) {
      return null;
    }

    $configs = isset($body['pageTypeConfigs']) && is_array($body['pageTypeConfigs'])
      ? $body['pageTypeConfigs']
      : [];
    $store_type = isset($configs['store_type']) ? sanitize_key($configs['store_type']) : 'post_meta';
    $target_id = isset($configs['id']) ? (int) $configs['id'] : 0;
    $option_key = isset($configs['option']) ? sanitize_key($configs['option']) : 'motionkit_pg_animation_page';

    if (strpos($option_key, 'motionkit_') !== 0) {
      $option_key = 'motionkit_pg_animation_page';
    }

    $saved = false;

    if ($page_animation !== null) {
      $this->persist_record($store_type, $option_key, $target_id, $page_animation);
      $saved = true;
    }

    if ($global_animation !== null) {
      update_option('motionkit_global_animations', $global_animation);
      $saved = true;
    }

    if ($page_settings !== null) {
      $settings_key = str_replace('motionkit_pg_animation_', 'motionkit_pg_settings_', $option_key);
      $this->persist_record($store_type, $settings_key, $target_id, $page_settings);
      $saved = true;
    }

    if ($global_settings !== null) {
      update_option('motionkit_global_settings', $global_settings);
      $saved = true;
    }

    return new \WP_REST_Response([
      'success' => $saved,
      'saved'   => $saved,
      'message' => $saved ? 'Animation saved successfully.' : 'No data to save.',
    ], 200);
  }

  public function search_pages(\WP_REST_Request $request): \WP_REST_Response
  {
    $query    = sanitize_text_field((string) $request->get_param('s'));
    $page     = max(1, (int) $request->get_param('page'));
    $per_page = min(50, max(1, (int) ($request->get_param('per_page') ?: 10)));

    $query_args = [
      's'              => $query,
      'post_type'      => ['page', 'post'],
      'post_status'    => 'publish',
      'posts_per_page' => $per_page,
      'paged'          => $page,
    ];

    $wp_query = new \WP_Query($query_args);
    $total    = (int) $wp_query->found_posts;
    $results  = [];

    foreach ($wp_query->posts as $post) {
      $permalink = get_permalink($post->ID);
      $results[] = [
        'id'    => $post->ID,
        'title' => $post->post_title ?: '(no title)',
        'type'  => $post->post_type,
        'group' => ucfirst($post->post_type),
        'url'   => $permalink,
      ];
    }

    return new \WP_REST_Response([
      'success'  => true,
      'data'     => $results,
      'page'     => $page,
      'per_page' => $per_page,
      'total'    => $total,
      'has_more' => $total > ($page * $per_page),
    ], 200);
  }

  public function add_cors_headers($value, $result, $request, $server)
  {
    // The connector sets the same headers for the routes it owns. header() replaces rather than appends so this would not duplicate them, but running both filters is work for nothing and leaves two places to change the allow-list.
    if ($this->connector_owns_rest()) {
      return $value;
    }

    $origin = get_http_origin();
    if ($origin && (strpos($origin, 'motionkit.io') !== false || strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false)) {
      header('Access-Control-Allow-Origin: ' . esc_url_raw($origin));
      header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
      header('Access-Control-Allow-Credentials: true');
      header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
    }
    return $value;
  }

  /**
   * Whether a pageTypeConfigs bag may be written to.
   *
   * Mirrors MotionKitConnector\Support\EditorSessionTrait::is_valid_page_type_config()
   * so a save behaves the same whichever plugin answers /save. The connector's
   * copy carries a note that a weaker duplicate once shadowed it and let a
   * token holder write arbitrary wp_options keys; this plugin had the same
   * weakness independently — a `motionkit_` prefix test (not `motionkit_pg_`)
   * and no existence check on the post/term id.
   *
   * @param array $config The pageTypeConfigs bag from the request payload.
   * @return bool
   */
  private function is_valid_page_type_config(array $config): bool
  {
    $store_type = isset($config['store_type']) ? $config['store_type'] : '';
    $option = isset($config['option']) ? $config['option'] : '';

    if (!in_array($store_type, ['post_meta', 'term_meta', 'option'], true)) {
      return false;
    }

    if (!is_string($option) || strpos($option, 'motionkit_pg_') !== 0) {
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

  private function persist_record(string $store_type, string $key, int $id, $data): void
  {
    switch ($store_type) {
      case 'post_meta':
        if ($id > 0) {
          update_post_meta($id, $key, $data);
        }
        break;
      case 'term_meta':
        if ($id > 0) {
          update_term_meta($id, $key, $data);
        }
        break;
      default:
        update_option($key, $data);
        break;
    }
  }
}
