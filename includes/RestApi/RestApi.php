<?php

namespace WcfAnimationBuilder\RestApi;

/**
 * REST API Class
 *
 * Registers WP REST API endpoints for MotionKit config operations.
 * Mirrors the existing AJAX handlers in Frontend with proper REST conventions.
 *
 * @package WcfAnimationBuilder
 * @since 1.1.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

use WcfAnimationBuilder\Common\AnimationBuilderPageType;

final class RestApi
{
  /**
   * REST namespace
   */
  private const NAMESPACE = 'motionkit/v1';

  /**
   * Page type resolver
   *
   * @var AnimationBuilderPageType
   */
  private AnimationBuilderPageType $page_type;

  /**
   * Initialize REST API
   *
   * @return void
   */
  public function init(): void
  {
    $this->page_type = AnimationBuilderPageType::instance();

    add_action('rest_api_init', [$this, 'register_routes']);
    add_filter('rest_pre_serve_request', [$this, 'add_cors_headers'], 10, 4);
  }

  /**
   * Register REST routes
   *
   * @return void
   */
  public function register_routes(): void
  {
    // POST /motionkit/v1/configs — save page configs
    register_rest_route(self::NAMESPACE, '/configs', [
      'methods'             => ['POST', 'GET'],
      'callback'            => [$this, 'store_configs'],
      'permission_callback' => [$this, 'check_permission'],
      'args'                => [
        'pageTypeConfigs'  => [
          'required'          => true,
          'validate_callback' => [$this, 'validate_json_object'],
        ],
        'animationConfigs' => [
          'required'          => true,
          'validate_callback' => [$this, 'validate_json_object'],
        ],
      ],
    ]);

    // DELETE /motionkit/v1/configs — delete page configs
    register_rest_route(self::NAMESPACE, '/configs', [
      'methods'             => \WP_REST_Server::DELETABLE,
      'callback'            => [$this, 'delete_configs'],
      'permission_callback' => [$this, 'check_permission'],
      'args'                => [
        'pageTypeConfigs' => [
          'required'          => true,
          'validate_callback' => [$this, 'validate_json_object'],
        ],
      ],
    ]);

    // POST /motionkit/v1/global-settings — save global settings
    register_rest_route(self::NAMESPACE, '/global-settings', [
      'methods'             => \WP_REST_Server::CREATABLE,
      'callback'            => [$this, 'store_global_settings'],
      'permission_callback' => [$this, 'check_permission'],
      'args'                => [
        'animationConfigs' => [
          'required'          => true,
          'validate_callback' => [$this, 'validate_json_object'],
        ],
      ],
    ]);

    // DELETE /motionkit/v1/global-settings — delete global settings
    register_rest_route(self::NAMESPACE, '/global-settings', [
      'methods'             => \WP_REST_Server::DELETABLE,
      'callback'            => [$this, 'delete_global_settings'],
      'permission_callback' => [$this, 'check_permission'],
    ]);

    // GET /motionkit/v1/settings — get all settings (global + page)
    register_rest_route(self::NAMESPACE, '/settings', [
      'methods'             => \WP_REST_Server::READABLE,
      'callback'            => [$this, 'get_settings'],
      'permission_callback' => [$this, 'check_permission'],
    ]);
  }

  // ─── Permission ─────────────────────────────────────────────────

  /**
   * Check if user has permission to access endpoints
   *
   * @return bool|\WP_Error
   */
  public function check_permission()
  {
    // token-based auth can be implemented here if needed
    // check nonces, user capabilities, etc. For now, allow if user can edit posts.
       
    
    return true;
  }

  // ─── CORS ──────────────────────────────────────────────────────

  /**
   * Add CORS headers for motionkit REST routes only.
   * Restricts Access-Control-Allow-Origin to known editor origins.
   *
   * @param bool              $served  Whether the request has been served.
   * @param \WP_HTTP_Response $result  Response object.
   * @param \WP_REST_Request  $request Request object.
   * @param \WP_REST_Server   $server  Server instance.
   * @return bool
   */
  public function add_cors_headers($served, $result, $request, $server)
  {
    $route = $request->get_route();

    // Only apply to our namespace
    if (strpos($route, '/' . self::NAMESPACE) !== 0) {
      return $served;
    }

    $origin = isset($_SERVER['HTTP_ORIGIN']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_ORIGIN'])) : '';

    $allowed_origins = apply_filters('motionkit/editor/allowed_origins', [
      'https://editor.motionkit.io',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      '*'
    ]);

    if (in_array($origin, $allowed_origins, true)) {
      header('Access-Control-Allow-Origin: ' . $origin);
      header('Access-Control-Allow-Credentials: true');
      header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
      header('Access-Control-Allow-Headers: Content-Type, X-WP-Nonce, Authorization');
    }

    return $served;
  }

  // ─── Validators ─────────────────────────────────────────────────

  /**
   * Validate that a param is a JSON-decodable object/array
   *
   * @param mixed            $value   The parameter value.
   * @param \WP_REST_Request $request The request object.
   * @param string           $param   The parameter name.
   * @return bool|\WP_Error
   */
  public function validate_json_object($value, $request, $param)
  {
    if (is_array($value) || is_object($value)) {
      return true;
    }

    if (is_string($value)) {
      $decoded = json_decode($value, true);
      if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        return true;
      }
    }

    return new \WP_Error(
      'rest_invalid_param',
      sprintf(
        /* translators: %s: parameter name */
        esc_html__('%s must be a valid JSON object', 'motionkit'),
        $param
      ),
      ['status' => 400]
    );
  }

  // ─── Helpers ────────────────────────────────────────────────────

  /**
   * Parse a param that can be either a JSON string or already-decoded array
   *
   * @param mixed $value Raw parameter value
   * @return array
   */
  private function parse_json_param($value): array
  {
    if (is_array($value)) {
      return $value;
    }

    if (is_string($value)) {
      return json_decode($value, true) ?: [];
    }

    return [];
  }

  // ─── Endpoint Handlers ──────────────────────────────────────────

  /**
   * Store page-level animation configs
   *
   * @param \WP_REST_Request $request
   * @return \WP_REST_Response
   */
  public function store_configs(\WP_REST_Request $request): \WP_REST_Response
  {
    // token  
    
    $page_type_configs = $this->parse_json_param($request->get_param('pageTypeConfigs'));
    $animation_configs = $this->parse_json_param($request->get_param('animationConfigs'));

    $this->page_type->saveConfig($page_type_configs, $animation_configs);

    return new \WP_REST_Response([
      'success' => true,
      'data'    => [
        'msg'     => esc_html__('Configurations saved', 'motionkit'),
        'configs' => $animation_configs,
      ],
    ], 200);
  }

  /**
   * Delete page-level animation configs
   *
   * @param \WP_REST_Request $request
   * @return \WP_REST_Response
   */
  public function delete_configs(\WP_REST_Request $request): \WP_REST_Response
  {
    $page_type_configs = $this->parse_json_param($request->get_param('pageTypeConfigs'));

    $this->page_type->deleteConfig($page_type_configs);

    return new \WP_REST_Response([
      'success' => true,
      'data'    => [
        'msg' => esc_html__('Configurations deleted', 'motionkit'),
      ],
    ], 200);
  }

  /**
   * Store global animation settings
   *
   * @param \WP_REST_Request $request
   * @return \WP_REST_Response
   */
  public function store_global_settings(\WP_REST_Request $request): \WP_REST_Response
  {
    
    $animation_configs = $this->parse_json_param($request->get_param('animationConfigs'));    
    update_option('motionkit_global_settings', $animation_configs);

    return new \WP_REST_Response([
      'success' => true,
      'data'    => [
        'msg'     => esc_html__('Global configurations saved', 'motionkit'),
        'configs' => $animation_configs,
      ],
    ], 200);
  }

  /**
   * Delete global animation settings
   *
   * @param \WP_REST_Request $request
   * @return \WP_REST_Response
   */
  public function delete_global_settings(\WP_REST_Request $request): \WP_REST_Response
  {
    delete_option('motionkit_global_settings');

    return new \WP_REST_Response([
      'success' => true,
      'data'    => [
        'msg' => esc_html__('Global configurations deleted', 'motionkit'),
      ],
    ], 200);
  }

  /**
   * Get all settings (global + current page)
   *
   * @param \WP_REST_Request $request
   * @return \WP_REST_Response
   */
  public function get_settings(\WP_REST_Request $request): \WP_REST_Response
  {
    $global_settings = get_option('motionkit_global_settings', []);

    return new \WP_REST_Response([
      'success' => true,
      'data'    => [
        'globalSettings' => is_array($global_settings) ? $global_settings : [],
      ],
    ], 200);
  }
}
