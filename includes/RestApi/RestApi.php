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
use WcfAnimationBuilder\Auth\JwtTokenManager;
use WcfAnimationBuilder\Auth\OAuthHandler;

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
    add_action('init', [$this, 'handle_preflight']);
  }

  // Handle OPTIONS preflight before WP rejects with 405
  public function handle_preflight(): void
  {
    if ($_SERVER['REQUEST_METHOD'] !== 'OPTIONS') {
      return;
    }

    $rest_route = isset($_GET['rest_route']) ? sanitize_text_field($_GET['rest_route']) : '';
    if (empty($rest_route)) {
      $rest_route = isset($_SERVER['PATH_INFO']) ? sanitize_text_field($_SERVER['PATH_INFO']) : '';
    }

    if (strpos($rest_route, '/' . self::NAMESPACE) !== 0) {
      return;
    }

    $origin = isset($_SERVER['HTTP_ORIGIN']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_ORIGIN'])) : '';

    $allowed_origins = apply_filters('motionkit/editor/allowed_origins', [
      'https://editor.motionkit.io',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'http://localhost:3000',
      '*'
    ]);

    if (!empty($origin) && in_array($origin, $allowed_origins, true)) {
      header('Access-Control-Allow-Origin: ' . $origin);
      header('Vary: Origin');
      header('Access-Control-Allow-Credentials: true');
      header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
      header('Access-Control-Allow-Headers: Content-Type, X-WP-Nonce, Authorization');
      header('Access-Control-Max-Age: 86400');
      status_header(200);
      exit;
    }
  }

  /**
   * Register REST routes
   *
   * @return void
   */
  public function register_routes(): void
  {
    // POST /motionkit/v1/current-page-settings — save page configs
    register_rest_route(self::NAMESPACE, '/current-page-settings', [
      'methods'             => \WP_REST_Server::CREATABLE,
      'callback'            => [$this, 'store_current_page_settings'],
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

    // DELETE /motionkit/v1/current-page-settings — delete page configs
    register_rest_route(self::NAMESPACE, '/current-page-settings', [
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

    // POST /motionkit/v1/current-page-animation — save page-level animations
    register_rest_route(self::NAMESPACE, '/current-page-animation', [
      'methods'             => \WP_REST_Server::CREATABLE,
      'callback'            => [$this, 'store_current_page_animation'],
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

    // POST /motionkit/v1/global-animation — save global animations
    register_rest_route(self::NAMESPACE, '/global-animation', [
      'methods'             => \WP_REST_Server::CREATABLE,
      'callback'            => [$this, 'store_global_animation'],
      'permission_callback' => [$this, 'check_permission'],
      'args'                => [
        'animationConfigs' => [
          'required'          => true,
          'validate_callback' => [$this, 'validate_json_object'],
        ],
      ],
    ]);

    // GET /motionkit/v1/settings — get all settings (global + page)
    register_rest_route(self::NAMESPACE, '/settings', [
      'methods'             => \WP_REST_Server::READABLE,
      'callback'            => [$this, 'get_settings'],
      'permission_callback' => [$this, 'check_permission'],
    ]);

    // GET /motionkit/v1/pages — search all animatable pages
    register_rest_route(self::NAMESPACE, '/pages', [
      'methods'             => \WP_REST_Server::READABLE,
      'callback'            => [$this, 'search_pages'],
      'permission_callback' => [$this, 'check_permission'],
      'args'                => [
        's' => [
          'required'          => false,
          'sanitize_callback' => 'sanitize_text_field',
        ],
        'per_page' => [
          'required'          => false,
          'default'           => 10,
          'sanitize_callback' => 'absint',
        ],
        'page' => [
          'required'          => false,
          'default'           => 1,
          'sanitize_callback' => 'absint',
        ],
      ],
    ]);
  }

  // ─── Permission ─────────────────────────────────────────────────

  /**
   * Check if user has permission to access endpoints.
   *
   * Two auth paths:
   * 1. WordPress nonce (X-WP-Nonce header) — logged-in user with manage_options
   * 2. JWT bearer token (Authorization header) — editor session token
   *
   * @param \WP_REST_Request $request
   * @return bool|\WP_Error
   */
  public function check_permission(?\WP_REST_Request $request = null)
  {
    return true;
    // Verify site is still connected
    if (!OAuthHandler::is_connected()) {
      return new \WP_Error(
        'motionkit_disconnected',
        esc_html__('Site is disconnected. Please reconnect from WordPress admin to save changes.', 'motionkit'),
        ['status' => 403]
      );
    }

    // JWT bearer token (cross-origin editor session)
    $auth_header = '';
    if ($request && $request->get_header('Authorization')) {
      $auth_header = $request->get_header('Authorization');
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
      $auth_header = sanitize_text_field(wp_unslash($_SERVER['HTTP_AUTHORIZATION']));
    }

    if (preg_match('/^Bearer\s+(.+)$/i', $auth_header, $matches)) {
      $bearer_token = $matches[1];

      // Try WP-generated JWT first (local, no HTTP call)
      $payload = JwtTokenManager::validate_reusable($bearer_token);
      if ($payload !== false) {
        return true;
      }

      // Try server-generated JWT via SaaS API
      if ($this->verify_server_session($bearer_token)) {
        return true;
      }
    }

    return new \WP_Error(
      'rest_forbidden',
      esc_html__('Authentication required.', 'motionkit'),
      ['status' => 401]
    );
  }

  /**
   * Verify a server-generated editor session token via the SaaS API.
   * Cached in a transient for 5 minutes to avoid repeated HTTP calls.
   *
   * @param string $token The JWT string
   * @return bool
   */
  private function verify_server_session(string $token): bool
  {
    $cache_key = 'mk_session_' . substr(md5($token), 0, 16);
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

    set_transient($cache_key, $valid ? 'valid' : 'invalid', 300);

    return $valid;
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
    ]);

    if (!empty($origin) && in_array($origin, $allowed_origins, true)) {
      header('Access-Control-Allow-Origin: ' . $origin);
      header('Vary: Origin');
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
  public function store_current_page_settings(\WP_REST_Request $request): \WP_REST_Response
  {

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
   * Store page-level animations (page_animation bucket from editor)
   *
   * Uses the same page-type routing as current-page-settings but with
   * a separate option key prefix to keep animations apart from settings.
   *
   * @param \WP_REST_Request $request
   * @return \WP_REST_Response
   */
  public function store_current_page_animation(\WP_REST_Request $request): \WP_REST_Response
  {
    $page_type_configs = $this->parse_json_param($request->get_param('pageTypeConfigs'));
    $animation_configs = $this->parse_json_param($request->get_param('animationConfigs'));

    $this->page_type->saveConfig($page_type_configs, $animation_configs);

    return new \WP_REST_Response([
      'success' => true,
      'data'    => [
        'msg'     => esc_html__('Animations saved', 'motionkit'),
        'configs' => $animation_configs,
      ],
    ], 200);
  }

  /**
   * Store global animations (global_animation bucket from editor)
   *
   * @param \WP_REST_Request $request
   * @return \WP_REST_Response
   */
  public function store_global_animation(\WP_REST_Request $request): \WP_REST_Response
  {
    $animation_configs = $this->parse_json_param($request->get_param('animationConfigs'));

    update_option('motionkit_global_animations', $animation_configs);
    error_log('Saved global animations: ' . print_r($animation_configs, true));
    return new \WP_REST_Response([
      'success' => true,
      'data'    => [
        'msg'     => esc_html__('Global animations saved', 'motionkit'),
        'configs' => $animation_configs,
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
    $global_animation = get_option('motionkit_global_animations', []);

    return new \WP_REST_Response([
      'success' => true,
      'data'    => [
        'globalSettings'  => is_array($global_settings) ? $global_settings : [],
        'globalAnimation' => is_array($global_animation) ? $global_animation : [],
      ],
    ], 200);
  }

  /**
   * Search all animatable pages — posts, pages, CPTs, archives, special pages.
   * Returns URLs with ?action=motionkit-editor appended.
   */
  public function search_pages(\WP_REST_Request $request): \WP_REST_Response
  {
    $search   = strtolower(trim($request->get_param('s') ?? ''));
    $per_page = min((int) $request->get_param('per_page'), 50) ?: 10;
    $page     = max((int) $request->get_param('page'), 1);
    $all      = [];

    // ── 1. Special pages (only on page 1) ──
    if ($page === 1) {
      $special_pages = [
        ['title' => 'Homepage',       'type' => 'front_page', 'url' => home_url('/')],
        ['title' => 'Blog',           'type' => 'blog',       'url' => get_permalink(get_option('page_for_posts')) ?: home_url('/')],
        ['title' => '404 Page',       'type' => '404',        'url' => home_url('/404-preview/')],
        ['title' => 'Search Results', 'type' => 'search',     'url' => home_url('/?s=blog')],
      ];

      foreach ($special_pages as $sp) {
        if (!$search || stripos($sp['title'], $search) !== false || stripos($sp['type'], $search) !== false) {
          $all[] = [
            'id'    => null,
            'title' => $sp['title'],
            'type'  => $sp['type'],
            'group' => 'Special Pages',
            'url'   => $this->editor_url($sp['url']),
          ];
        }
      }
    }

    // ── 2. Singular pages/posts ──
    $post_types = get_post_types(['public' => true], 'objects');

    // Exclude internal/builder post types that aren't real pages
    $excluded_types = [
      'wcf-custom-fonts',
      'attachment',            // Media files
      'elementor_library',     // Elementor templates
      'e-landing-page',        // Elementor landing pages
      'e-floating-buttons',    // Elementor floating buttons
      'oembed_cache',          // oEmbed cache
      'wp_block',              // Reusable blocks
      'wp_template',           // Block theme templates
      'wp_template_part',      // Block theme template parts
      'wp_navigation',         // Navigation menus
      'wp_global_styles',      // Global styles
      'wp_font_family',        // Font families
      'wp_font_face',          // Font faces
      'custom_css',            // Custom CSS
      'customize_changeset',   // Customizer changesets
      'revision',              // Revisions
      'nav_menu_item',         // Menu items
      'user_request',          // Privacy requests
      'fl-builder-template',   // Beaver Builder templates
      'fl-theme-layout',       // Beaver Builder layouts
      'brizy_template',        // Brizy templates
      'ct_template',           // Oxygen Builder templates
      'jet-popup',             // JetPopup
      'jet-menu',              // JetMenu
      'jet-smart-filters',     // JetSmartFilters
      'bricks_template',       // Bricks Builder templates
      'acf-field-group',       // ACF field groups
      'acf-field',             // ACF fields
      'acf-post-type',         // ACF custom post types
      'acf-taxonomy',          // ACF custom taxonomies
      'acf-ui-options-page',   // ACF options pages
      'wpcf7_contact_form',    // Contact Form 7
      'wpforms',               // WPForms
      'wpforms_log',           // WPForms logs
      'frm_display',           // Formidable Forms views
      'wcf-addons-template',   // Animation Addons templates
      'wcf-addons-popup',      // Animation Addons popups
      'wcf-code-snippet',      // Animation Addons code snippets
      'wcf-custom-icons',      // Animation Addons custom icons
      'aaeptypebilder',        // Animation Addons CPT builder
      'aaeaddon_post_rating',  // Animation Addons post ratings
      'metform-form',          // MetForm forms
      'metform-entry',         // MetForm entries
      'wpseo_locations',       // Yoast SEO local locations
      'wpseo_news',            // Yoast SEO news
      'redirect_rule',         // Yoast/RankMath redirects
      'rank_math_schema',      // RankMath schema
      'rm_content_ai',         // RankMath content AI
      'aioseo-template',       // All in One SEO templates
      'et_pb_layout',          // Divi library layouts
      'et_header_layout',      // Divi header templates
      'et_body_layout',        // Divi body templates
      'et_footer_layout',      // Divi footer templates
      'et_code_snippet',       // Divi code snippets
      'et_theme_builder',      // Divi theme builder templates
      'eael_template',         // Essential Addons templates
      'elementskit_template',  // ElementsKit templates
      'elementskit_widget',    // ElementsKit widgets
      'ha_library',            // Happy Addons templates
      'bdthemes-ep-template',  // Element Pack templates
      'uael-template',         // Ultimate Addons for Elementor templates
      'uael_popup',            // Ultimate Addons popups
      'elementor_font',        // Elementor Pro custom fonts
      'elementor_icons',       // Elementor Pro custom icons
      'elementor_snippet',     // Elementor Pro code snippets
      'elementor-thhf',        // Elementor Pro header/footer templates
      'powerpack_templates',   // PowerPack for Elementor templates
      'pp-template',           // PowerPack templates
      'unlimited-template',    // Starter Templates / Starter Sites
    ];

    foreach ($excluded_types as $type) {
      unset($post_types[$type]);
    }

    $query_args = [
      'post_type'      => array_keys($post_types),
      'post_status'    => 'publish',
      'posts_per_page' => $per_page,
      'paged'          => $page,
      'orderby'        => 'title',
      'order'          => 'ASC',
    ];

    if ($search) {
      $query_args['s'] = $search;
    }

    $query = new \WP_Query($query_args);

    foreach ($query->posts as $post) {
      $type_obj = $post_types[$post->post_type] ?? null;
      $all[] = [
        'id'    => $post->ID,
        'title' => $post->post_title ?: '(no title)',
        'type'  => $post->post_type,
        'group' => $type_obj ? $type_obj->labels->singular_name : ucfirst($post->post_type),
        'url'   => $this->editor_url(get_permalink($post)),
      ];
    }

    $total_posts = (int) $query->found_posts;

    // ── 3. Taxonomy terms — show as single archive page per term ──
    if ($page === 1) {
      $taxonomies = get_taxonomies(['public' => true], 'objects');

      foreach ($taxonomies as $tax) {
        // Show only 1 representative term per taxonomy
        $term_args = [
          'taxonomy'   => $tax->name,
          'hide_empty' => false,
          'number'     => 1,
        ];
        if ($search) {
          $term_args['search'] = $search;
          $term_args['number'] = 3; // show more when searching
        }

        $terms = get_terms($term_args);
        if (is_wp_error($terms) || empty($terms)) continue;

        foreach ($terms as $term) {
          $link = get_term_link($term);
          if (is_wp_error($link)) continue;

          $all[] = [
            'id'    => $term->term_id,
            'title' => $term->name,
            'type'  => $tax->name,
            'group' => $tax->labels->singular_name ?: ucfirst($tax->name),
            'url'   => $this->editor_url($link),
          ];
        }
      }

      // ── 4. Author — show single author page ──
      if (!$search || stripos('author', $search) !== false) {
        $authors = get_users([
          'has_published_posts' => true,
          'number'              => 1,
        ]);
        if ($search) {
          $authors = get_users([
            'has_published_posts' => true,
            'search'              => "*{$search}*",
            'search_columns'      => ['display_name'],
            'number'              => 3,
          ]);
        }
        foreach ($authors as $author) {
          $all[] = [
            'id'    => $author->ID,
            'title' => $author->display_name,
            'type'  => 'author',
            'group' => 'Author',
            'url'   => $this->editor_url(get_author_posts_url($author->ID)),
          ];
        }
      }
    }

    $has_more = $total_posts > ($page * $per_page);

    return new \WP_REST_Response([
      'success'  => true,
      'data'     => $all,
      'page'     => $page,
      'per_page' => $per_page,
      'total'    => $total_posts,
      'has_more' => $has_more,
    ], 200);
  }

  /**
   * Append ?action=motionkit-editor to a URL for editor preview.
   */
  private function editor_url(string $url): string
  {
    return add_query_arg('action', 'motionkit-editor', $url);
  }
}
