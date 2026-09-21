<?php

declare(strict_types=1);

namespace MotionKit\RestApi;

use MotionKit\Auth\JwtTokenManager;
use MotionKit\Common\AnimationResolver;
use MotionKit\Common\PageType;
use MotionKit\Common\ShareLinks;

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
        // The editor sends one list; storage keeps published and draft apart so only the published half ever reaches a visitor's HTML.
        $parts = AnimationResolver::partition_for_storage(is_array($data) ? $data : []);
        $this->persist_record($store_type, $option_key, $target_id, $parts['published']);
        $this->write_page_drafts($this->page_config($store_type, $option_key, $target_id), $parts['drafts']);
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
        $parts = AnimationResolver::partition_for_storage(is_array($data) ? $data : []);
        update_option(AnimationResolver::GLOBAL_PUBLISHED_OPTION, $parts['published']);
        if (empty($parts['drafts'])) {
          delete_option(AnimationResolver::GLOBAL_DRAFT_OPTION);
        } else {
          update_option(AnimationResolver::GLOBAL_DRAFT_OPTION, $parts['drafts']);
        }
        AnimationResolver::forget_globals();
        // A global animation's link lives on the page it was created for, so its copy can only be refreshed while the editor is still saying which page that is.
        if ($this->is_valid_page_type_config($configs)) {
          $this->sync_share_links($this->page_config($store_type, $option_key, $target_id));
        }
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
            // Stitched so the editor gets one list with working copies re-attached, the same shape it sent.
            'global_animation'  => AnimationResolver::global_for_editor(),
          ],
        ], 200);

      case 'create_share_link':
        if (!$this->is_valid_page_type_config($configs)) {
          return new \WP_REST_Response(['success' => false, 'error' => 'invalid_page_type_config'], 400);
        }
        $page_config = $this->page_config($store_type, $option_key, $target_id);
        // The records come from storage, never from the request — that is what keeps a share link unable to reveal anything the last save did not already write. A link covers the whole page, so the request names no ids either.
        $token = ShareLinks::create(
          $page_config,
          AnimationResolver::drafts_by_id($page_config),
          isset($payload['sharedVersion']) && is_string($payload['sharedVersion']) ? $payload['sharedVersion'] : ''
        );
        if ($token === null) {
          return new \WP_REST_Response(['success' => false, 'error' => 'share_link_failed'], 500);
        }
        // Only the token goes back; the editor already knows the page URL it is editing and builds the link itself.
        return new \WP_REST_Response([
          'success' => true,
          'data'    => ['token' => $token, 'param' => ShareLinks::QUERY_PARAM],
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
      $parts = AnimationResolver::partition_for_storage(is_array($page_animation) ? $page_animation : []);
      $this->persist_record($store_type, $option_key, $target_id, $parts['published']);
      $this->write_page_drafts($this->page_config($store_type, $option_key, $target_id), $parts['drafts']);
      $saved = true;
    }

    if ($global_animation !== null) {
      $parts = AnimationResolver::partition_for_storage(is_array($global_animation) ? $global_animation : []);
      update_option(AnimationResolver::GLOBAL_PUBLISHED_OPTION, $parts['published']);
      if (empty($parts['drafts'])) {
        delete_option(AnimationResolver::GLOBAL_DRAFT_OPTION);
      } else {
        update_option(AnimationResolver::GLOBAL_DRAFT_OPTION, $parts['drafts']);
      }
      AnimationResolver::forget_globals();
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
    PageType::write($this->page_config($store_type, $key, $id), $data);
  }

  /**
   * The request's storage target as the descriptor PageType and the resolver read.
   *
   * @param string $store_type
   * @param string $key
   * @param int    $id
   * @return array{store_type: string, option: string, id: int}
   */
  private function page_config(string $store_type, string $key, int $id): array
  {
    return ['store_type' => $store_type, 'option' => $key, 'id' => $id];
  }

  /**
   * Write the page's draft bucket, then bring its share link back in step.
   *
   * A save is the only moment the shared copy changes: it refreshes the records
   * of animations still under review, and drops the ones that just left it —
   * published or deleted, both look the same from here.
   *
   * @param array $page_config Descriptor for the page's animation key.
   * @param array $drafts      Draft entries to store.
   * @return void
   */
  private function write_page_drafts(array $page_config, array $drafts): void
  {
    $draft_config = AnimationResolver::draft_config($page_config);

    if (empty($drafts)) {
      PageType::delete($draft_config);
    } else {
      PageType::write($draft_config, $drafts);
    }

    $this->sync_share_links($page_config);
  }

  /**
   * Re-copy this page's share link from what storage now holds.
   *
   * Reads back rather than reusing the list just written, so page and global
   * working copies are reconciled together.
   *
   * @param array $page_config Descriptor for the page's animation key.
   * @return void
   */
  private function sync_share_links(array $page_config): void
  {
    ShareLinks::reconcile($page_config, AnimationResolver::drafts_by_id($page_config));
  }
}
