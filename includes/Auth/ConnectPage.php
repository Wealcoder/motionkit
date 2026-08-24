<?php

namespace MotionKit\Auth;

/**
 * Admin Dashboard Page
 *
 * WordPress admin page with tabbed layout: Connect, Tools. License status
 * renders inline inside the Connect tab.
 *
 * Menu: MotionKit
 * URL:  /wp-admin/admin.php?page=motionkit-connect
 *
 * @package MotionKit
 * @since 1.1.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

final class ConnectPage
{
  /**
   * @var OAuthHandler
   */
  private OAuthHandler $oauth;

  public function __construct(OAuthHandler $oauth)
  {
    $this->oauth = $oauth;
  }

  public function init(): void
  {
    add_action('admin_menu', [$this, 'register_menu']);
    add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_styles']);
    add_action('admin_enqueue_scripts', [$this, 'enqueue_menu_icon_style']);
    add_action('admin_init', [$this, 'handle_tools_actions']);
    add_action('admin_init', [$this, 'handle_connector_activate']);
    add_action('current_screen', [$this, 'suppress_foreign_admin_notices']);
    add_action('wp_ajax_motionkit_tools_list', [$this, 'ajax_tools_list']);
    add_action('wp_ajax_motionkit_tools_bulk_delete', [$this, 'ajax_tools_bulk_delete']);
  }

  /**
   * Keep the MotionKit admin page free of unrelated core/theme/plugin
   * notices (update nags, theme recommendations, survey banners, etc.)
   * so it never looks broken or cluttered to a first-time connector.
   */
  public function suppress_foreign_admin_notices(): void
  {
    $screen = get_current_screen();
    if (!$screen || $screen->id !== 'toplevel_page_motionkit-connect') {
      return;
    }

    remove_all_actions('admin_notices');
    remove_all_actions('all_admin_notices');
  }

  public function enqueue_admin_styles(string $hook): void
  {
    if ($hook !== 'toplevel_page_motionkit-connect') {
      return;
    }

    $version = defined('MOTIONKIT_VERSION') ? MOTIONKIT_VERSION : '1.0.0';

    wp_enqueue_style(
      'motionkit-admin',
      plugins_url('assets/build/admin.css', MOTIONKIT_PLUGIN_FILE),
      [],
      $version
    );

    wp_add_inline_style('motionkit-admin', $this->connector_cta_css());

    // Same nonce as the sidebar tab links (see render_page()) — mirrors its
    // fallback-to-default behavior so the enqueued CSS always matches what
    // render_page() actually draws.
    $tab_nonce_valid = isset($_GET['_wpnonce'])
      && wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_wpnonce'])), 'motionkit_tab_nav');
    $active_tab = ($tab_nonce_valid && isset($_GET['tab']))
      ? sanitize_text_field(wp_unslash($_GET['tab']))
      : 'connect';
    if ($active_tab === 'tools') {
      wp_enqueue_style(
        'motionkit-admin-tools',
        plugins_url('assets/build/admin-tools.css', MOTIONKIT_PLUGIN_FILE),
        ['motionkit-admin'],
        $version
      );

      wp_enqueue_script(
        'motionkit-admin-tools',
        plugins_url('assets/build/admin-tools.js', MOTIONKIT_PLUGIN_FILE),
        [],
        $version,
        true
      );

      wp_localize_script('motionkit-admin-tools', 'motionkitToolsData', [
        'ajaxUrl'     => admin_url('admin-ajax.php'),
        'nonce'       => wp_create_nonce('motionkit_tools_ajax'),
        'noticeNonce' => wp_create_nonce('motionkit_notice'),
        'redirectUrl' => admin_url('admin.php?page=motionkit-connect&tab=tools'),
        'strings'     => [
          'noResults' => __('No animation data found.', 'motionkit'),
          'edit'      => __('Edit', 'motionkit'),
          'preview'   => __('Preview', 'motionkit'),
          'del'       => __('Delete', 'motionkit'),
          'confirm'   => __('Delete this animation data?', 'motionkit'),
          'prev'      => __('Prev', 'motionkit'),
          'next'      => __('Next', 'motionkit'),
          'deleting'  => __('Deleting...', 'motionkit'),
          'done'      => __('Done!', 'motionkit'),
        ],
      ]);
    }
  }

  public function register_menu(): void
  {
    add_menu_page(
      __('MotionKit', 'motionkit'),
      __('MotionKit', 'motionkit'),
      'manage_options',
      'motionkit-connect',
      [$this, 'render_page'],
      $this->get_menu_icon(),
      59
    );

    add_submenu_page(
      'motionkit-connect',
      __('MotionKit Settings', 'motionkit'),
      __('Settings', 'motionkit'),
      'manage_options',
      'motionkit-connect',
      [$this, 'render_page']
    );
  }

  /**
   * Enqueue the top-level menu icon sizing CSS. Runs on every admin page
   * (unlike enqueue_admin_styles(), which is gated to our own settings
   * page) since the admin menu sidebar itself is global.
   */
  public function enqueue_menu_icon_style(): void
  {
    $version = defined('MOTIONKIT_VERSION') ? MOTIONKIT_VERSION : '1.0.0';

    wp_enqueue_style(
      'motionkit-admin-menu-icon',
      plugins_url('assets/build/admin-menu-icon.css', MOTIONKIT_PLUGIN_FILE),
      [],
      $version
    );
  }

  private function get_menu_icon(): string
  {
    return 'data:image/svg+xml;base64,' . base64_encode('<svg viewBox="0 0 245 245" xmlns="http://www.w3.org/2000/svg"><path d="M66.4 71.9c0-10.5 13.2-15.8 20.9-8.4l51.9 50.3c4.8 4.6 4.8 12.1 0 16.7l-51.9 50.3c-7.7 7.5-20.9 2.2-20.9-8.3V71.9z" fill="currentColor" opacity="0.6"/><path d="M157.5 63.5c7.5-7.5 20.2-2.2 20.2 8.4v100.6c0 10.6-12.8 15.8-20.2 8.4l-50.3-50.3c-4.6-4.6-4.6-12.1 0-16.8l50.3-50.3z" fill="currentColor"/></svg>');
  }

  private function get_editor_url(): string
  {
    $page_url = home_url('/');

    // Always attach a session JWT — even before the site is connected,
    // JwtTokenManager falls back to a local HMAC-signed token, so
    // is_editor_preview() can require a valid token unconditionally
    // instead of trusting ?action=motionkit-editor alone pre-connect.
    $query_args = [
      'site'            => $page_url,
      'platform'        => 'wordpress',
      'motionkit_token' => JwtTokenManager::generate($page_url),
    ];

    $base_url = apply_filters('motionkit/editor/url', 'https://editor.motionkit.io/');
    return add_query_arg($query_args, $base_url);
  }

  // ─── Render Page ─────────────────────────────────────────────

  public function render_page(): void
  {
    if (!current_user_can('manage_options')) {
      wp_die(esc_html__('You do not have permission to access this page.', 'motionkit'));
    }

    // The sidebar nonces this URL (see the tab loop below); a missing/expired
    // nonce (e.g. an old bookmark) just falls back to the default tab rather
    // than hard-failing, since nothing here changes state either way.
    $tab_nonce_valid = isset($_GET['_wpnonce'])
      && wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_wpnonce'])), 'motionkit_tab_nav');
    $active_tab = ($tab_nonce_valid && isset($_GET['tab']))
      ? sanitize_text_field(wp_unslash($_GET['tab']))
      : 'connect';
    $current_user = wp_get_current_user();
    $connection_info = OAuthHandler::get_connection_info();
    $user_email = !empty($connection_info['email']) ? $connection_info['email'] : $current_user->user_email;

    $tabs = [
      'connect' => ['label' => __('Connect', 'motionkit'), 'icon' => '&#128279;'],
      'tools'   => ['label' => __('Tools', 'motionkit'),   'icon' => '&#128295;'],
    ];

    ?>
    <div class="motionkit-page">

      <!-- Header -->
      <div class="motionkit-header">
        <div class="motionkit-header-left">
          <div class="motionkit-header-logo">
            <svg width="30" height="30" viewBox="0 0 245 245" fill="none">
              <path d="M2.7 87.7C2.7 40.7 40.7 2.7 87.7 2.7h69c47 0 85 38 85 85v69c0 47-38 85-85 85h-69c-47 0-85-38-85-85v-69z" fill="url(#motionkit_hdr_g)"/>
              <path d="M66.4 71.9c0-10.5 13.2-15.8 20.9-8.4l51.9 50.3c4.8 4.6 4.8 12.1 0 16.7l-51.9 50.3c-7.7 7.5-20.9 2.2-20.9-8.3V71.9z" fill="#BFD8FE" stroke="#5EA1EC" stroke-width=".7"/>
              <path d="M157.5 63.5c7.5-7.5 20.2-2.2 20.2 8.4v100.6c0 10.6-12.8 15.8-20.2 8.4l-50.3-50.3c-4.6-4.6-4.6-12.1 0-16.8l50.3-50.3z" fill="white" stroke="#5DA1EC" stroke-width=".7"/>
              <defs><radialGradient id="motionkit_hdr_g" cx="0" cy="0" r="1" gradientTransform="matrix(-62.2 127 -127 -62.2 122.2 122.2)" gradientUnits="userSpaceOnUse"><stop stop-color="#1C7E92"/><stop offset="1" stop-color="#599BFD"/></radialGradient></defs>
            </svg>
          </div>
          <span class="motionkit-header-title"><?php echo esc_html__('MotionKit','motionkit') ?></span>
        </div>
        <div class="motionkit-header-right">
          <span class="motionkit-header-email"><?php echo esc_html($user_email); ?></span>
          <div class="motionkit-header-avatar">
            <?php
            // get_avatar() already escapes every attribute it outputs; wp_kses_post()
            // here is defense-in-depth (keeps the <img> tag, unlike esc_html()) so the
            // output is explicitly passed through an escaping call for reviewers/scanners
            // that don't special-case get_avatar()'s built-in escaping.
            echo wp_kses_post(get_avatar($current_user->ID, 32, '', '', ['class' => 'motionkit-avatar-img']));
            ?>
          </div>
        </div>
      </div>

      <!-- Layout: Sidebar + Content -->
      <div class="motionkit-layout">

        <!-- Sidebar -->
        <div class="motionkit-sidebar">
          <nav class="motionkit-sidebar-nav">
            <?php foreach ($tabs as $tab_key => $tab): ?>
              <?php
              $tab_url = wp_nonce_url(
                admin_url('admin.php?page=motionkit-connect&tab=' . $tab_key),
                'motionkit_tab_nav'
              );
              ?>
              <a href="<?php echo esc_url($tab_url); ?>"
                 class="motionkit-sidebar-link <?php echo $active_tab === $tab_key ? 'motionkit-sidebar-link--active' : ''; ?>">
                <span class="motionkit-sidebar-icon"><?php echo wp_kses($tab['icon'], []); ?></span>
                <?php echo esc_html($tab['label']); ?>
              </a>
            <?php endforeach; ?>
          </nav>
        </div>

        <!-- Content -->
        <div class="motionkit-content">
          <?php $this->render_notices(); ?>

          <?php
          switch ($active_tab) {
            case 'tools':
              $this->render_tools_tab();
              break;
            case 'connect':
            default:
              $this->render_connect_tab($current_user);
              break;
          }
          ?>
        </div>

      </div>
    </div>

    <?php
  }

  // ─── Notices ─────────────────────────────────────────────────

  /**
   * Self-contained styling for the connector CTA. Kept inline (not in the
   * compiled admin.css) so the prompt can ship without a rebuild; scoped under
   * .motionkit-connector-cta so it can't leak into the rest of the page.
   *
   * @return string
   */
  private function connector_cta_css(): string
  {
    return <<<CSS
.motionkit-connector-cta{position:relative;margin:0 0 20px;border-radius:16px;padding:1px;background:linear-gradient(135deg,#2f7bf6 0%,#7c5cff 50%,#1ea4c4 100%);box-shadow:0 10px 30px -12px rgba(47,123,246,.45);overflow:hidden;isolation:isolate}
.motionkit-connector-cta__glow{position:absolute;inset:-40%;z-index:0;background:radial-gradient(closest-side,rgba(124,92,255,.35),transparent 70%);filter:blur(20px);animation:mkctaFloat 7s ease-in-out infinite}
@keyframes mkctaFloat{0%,100%{transform:translate(-8%,-6%)}50%{transform:translate(10%,8%)}}
.motionkit-connector-cta__body{position:relative;z-index:1;display:flex;align-items:center;gap:18px;padding:18px 22px;border-radius:15px;background:#0e1526;color:#eaf0ff}
.motionkit-connector-cta__icon{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:12px;color:#ffd873;background:linear-gradient(135deg,rgba(255,216,115,.16),rgba(255,216,115,.04));box-shadow:inset 0 0 0 1px rgba(255,216,115,.28)}
.motionkit-connector-cta__text{flex:1 1 auto;min-width:0}
.motionkit-connector-cta__badge{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#9fc0ff;background:rgba(47,123,246,.14);border:1px solid rgba(47,123,246,.3);padding:3px 9px;border-radius:999px;margin-bottom:8px}
.motionkit-connector-cta__title{margin:0 0 4px;font-size:16px;font-weight:700;line-height:1.25;color:#fff}
.motionkit-connector-cta__desc{margin:0;font-size:13px;line-height:1.5;color:#a9b6d4;max-width:62ch}
.motionkit-connector-cta__action{flex:0 0 auto}
.motionkit-connector-cta__btn{display:inline-flex;align-items:center;gap:8px;text-decoration:none;font-size:13.5px;font-weight:600;color:#fff;padding:11px 18px;border-radius:10px;background:linear-gradient(135deg,#2f7bf6,#6a5cff);box-shadow:0 6px 16px -6px rgba(47,123,246,.7);transition:transform .18s ease,box-shadow .18s ease,filter .18s ease}
.motionkit-connector-cta__btn:hover{transform:translateY(-1px);filter:brightness(1.08);box-shadow:0 10px 22px -6px rgba(106,92,255,.8);color:#fff}
.motionkit-connector-cta__btn:active{transform:translateY(0)}
.motionkit-connector-cta__btn svg{transition:transform .18s ease}
.motionkit-connector-cta__btn:hover svg{transform:translateY(2px)}
@media (max-width:640px){.motionkit-connector-cta__body{flex-direction:column;align-items:flex-start;gap:14px}.motionkit-connector-cta__action{width:100%}.motionkit-connector-cta__btn{width:100%;justify-content:center}}
@media (prefers-reduced-motion:reduce){.motionkit-connector-cta__glow{animation:none}}
CSS;
  }

  /**
   * Whether the MotionKit Connector engine plugin is active.
   *
   * The connector ships the animation engine, REST bridge, and runtime — the
   * editor cannot run anything on the live site without it. Used to swap the
   * "Launch MotionKit" button for a "Download Connector" prompt until it's
   * installed.
   *
   * The constant is the reliable signal (connector defines it on load). Fall
   * back to is_plugin_active() only after ensuring it's loaded — it lives in
   * wp-admin/includes/plugin.php and isn't always in scope on custom pages.
   *
   * @return bool
   */
  private function is_connector_active(): bool
  {
    if (defined('MOTIONKIT_CONNECTOR_LOADED')) {
      return true;
    }

    if (!function_exists('is_plugin_active')) {
      require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }

    return is_plugin_active($this->connector_basename());
  }

  /**
   * The connector's plugin basename among installed plugins. Matches the
   * expected basename first, then any plugin whose folder is the connector
   * slug (in case it was packaged under a differently-named top-level folder).
   *
   * @return string Basename like "motionkit-connector/motionkit-connector.php",
   *                or '' if the connector is not installed.
   */
  private function connector_basename(): string
  {
    $expected = 'motionkit-connector/motionkit-connector.php';

    if (!function_exists('get_plugins')) {
      require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }

    $all = get_plugins();

    if (isset($all[$expected])) {
      return $expected;
    }

    foreach (array_keys($all) as $basename) {
      if (strpos($basename, 'motionkit-connector/') === 0) {
        return $basename;
      }
    }

    return $expected;
  }

  /**
   * Connector install state: 'active' | 'inactive' | 'missing'.
   *
   *  - active:   plugin is running (nothing to prompt).
   *  - inactive: installed on disk but not activated → offer Activate.
   *  - missing:  not on disk → offer Download.
   *
   * @return string
   */
  private function connector_install_state(): string
  {
    if ($this->is_connector_active()) {
      return 'active';
    }

    if (!function_exists('get_plugins')) {
      require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }

    $all = get_plugins();

    $installed = isset($all['motionkit-connector/motionkit-connector.php']);
    if (!$installed) {
      foreach (array_keys($all) as $basename) {
        if (strpos($basename, 'motionkit-connector/') === 0) {
          $installed = true;
          break;
        }
      }
    }

    return $installed ? 'inactive' : 'missing';
  }

  /**
   * A nonced URL that activates the connector and returns to THIS page.
   *
   * Points at our own admin_init handler (handle_connector_activate) rather
   * than core's plugins.php?action=activate — because core always redirects
   * back to the plugins list, whereas we want the user to land right back on
   * this settings screen (now showing the connected/launch state).
   *
   * @return string
   */
  private function connector_activate_url(): string
  {
    return wp_nonce_url(
      admin_url('admin.php?page=motionkit-connect&motionkit_activate_connector=1'),
      'motionkit_activate_connector'
    );
  }

  /**
   * Activate the connector plugin, then redirect back to this settings page.
   * Triggered by the CTA's "Activate Connector" link.
   *
   * @return void
   */
  public function handle_connector_activate(): void
  {
    if (!isset($_GET['motionkit_activate_connector'])) {
      return;
    }

    if (!current_user_can('activate_plugins')) {
      wp_die(esc_html__('You do not have permission to activate plugins.', 'motionkit'));
    }

    $nonce = isset($_GET['_wpnonce']) ? sanitize_text_field(wp_unslash($_GET['_wpnonce'])) : '';
    if (!wp_verify_nonce($nonce, 'motionkit_activate_connector')) {
      wp_die(esc_html__('Security check failed. Please try again.', 'motionkit'));
    }

    if (!function_exists('activate_plugin')) {
      require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }

    $basename = $this->connector_basename();
    $error    = '';

    if (!$this->is_connector_active()) {
      // Silent activation — don't let a stray activation notice abort the
      // redirect. activate_plugin() returns a WP_Error on failure.
      $result = activate_plugin($basename, '', false, true);
      if (is_wp_error($result)) {
        $error = $result->get_error_code();
      }
    }

    $redirect = admin_url('admin.php?page=motionkit-connect&tab=connect');
    if ($error !== '') {
      $redirect = add_query_arg('error', rawurlencode($error), $redirect);
    }
    // Nonce-stamp so render_notices() shows any success/action flags; the error
    // path renders regardless of the nonce (see render_notices()).
    wp_safe_redirect(wp_nonce_url($redirect, 'motionkit_notice'));
    exit;
  }

  /**
   * Render the connector-install CTA (gradient card). Shown whenever the
   * connector engine isn't running, in two contexts:
   *
   *   - 'connected':    after connecting, before the editor can launch.
   *   - 'disconnected': before connecting, so the engine is ready first.
   *
   * State drives the button:
   *   - missing  → "Download Connector" (zip URL, new tab)
   *   - inactive → "Activate Connector"  (WP nonced activate link, same tab)
   *
   * Returns nothing and prints nothing when the connector is already active.
   *
   * @param string $context 'connected' | 'disconnected'.
   * @return void
   */
  private function render_connector_cta(string $context): void
  {
    $state = $this->connector_install_state();
    if ($state === 'active') {
      return;
    }

    $is_inactive = ($state === 'inactive');

    if ($is_inactive) {
      $cta_title = __('Activate the MotionKit Connector', 'motionkit');
      $cta_desc  = ($context === 'disconnected')
        ? __('The MotionKit Connector is installed but not active. Activate it to get the animation engine ready, then connect your account.', 'motionkit')
        : __('Your account is connected and the MotionKit Connector is installed — just activate it to run your animations, page transitions, and smooth scroll on the live site.', 'motionkit');
      $cta_label   = __('Activate Connector', 'motionkit');
      $cta_href    = $this->connector_activate_url();
      $cta_new_tab = false;
    } else {
      $cta_title = __('Install the MotionKit Connector', 'motionkit');
      $cta_desc  = ($context === 'disconnected')
        ? __('MotionKit needs its Connector engine to run animations, page transitions, and smooth scroll on your live site. Install it now, then connect your account below.', 'motionkit')
        : __('Your account is connected. Install the MotionKit Connector engine to run your animations, page transitions, and smooth scroll on the live site — then the editor launches from here.', 'motionkit');
      $cta_label   = __('Download Connector', 'motionkit');
      $cta_href    = $this->connector_download_url();
      $cta_new_tab = ('#' !== $cta_href);
    }

    $badge = ($context === 'disconnected')
      ? __('Recommended first step', 'motionkit')
      : __('One step left', 'motionkit');
    ?>
    <div class="motionkit-connector-cta">
      <div class="motionkit-connector-cta__glow" aria-hidden="true"></div>
      <div class="motionkit-connector-cta__body">
        <div class="motionkit-connector-cta__icon" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8z"
                  fill="currentColor" stroke="currentColor" stroke-width="1"
                  stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="motionkit-connector-cta__text">
          <span class="motionkit-connector-cta__badge"><?php echo esc_html($badge); ?></span>
          <h3 class="motionkit-connector-cta__title">
            <?php echo esc_html($cta_title); ?>
          </h3>
          <p class="motionkit-connector-cta__desc">
            <?php echo esc_html($cta_desc); ?>
          </p>
        </div>
        <div class="motionkit-connector-cta__action">
          <a class="motionkit-connector-cta__btn"
             href="<?php echo esc_url($cta_href); ?>"
             <?php echo $cta_new_tab ? 'target="_blank" rel="noopener"' : ''; ?>>
            <?php echo esc_html($cta_label); ?>
            <?php if ($is_inactive): ?>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12l5 5L20 6" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            <?php else: ?>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            <?php endif; ?>
          </a>
        </div>
      </div>
    </div>
    <?php
  }

  /**
   * The connector download URL. Defaults to our server; filterable so a
   * distributor can pin a different build without touching this file.
   *
   * @return string
   */
  private function connector_download_url(): string
  {
    $default = 'https://billing.motionkit.io/wp-content/uploads/2026/08/motionkit-connector.zip';
    $url = apply_filters('motionkit/connector_download_url', $default);
    return is_string($url) && $url !== '' ? $url : '#';
  }

  private function render_notices(): void
  {
    // These flags are appended by redirects this plugin controls (OAuth
    // callback, handle_tools_actions(), the bulk-delete JS) and are now
    // nonce-stamped via wp_nonce_url()/wp_create_nonce('motionkit_notice')
    // at every one of those redirect sites. A missing/invalid nonce (e.g. a
    // hand-crafted or stale URL) just shows no notice at all rather than
    // hard-failing — nothing here is destructive either way, so a silent
    // fallback is enough.
    $notice_nonce_valid = isset($_GET['_wpnonce'])
      && wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_wpnonce'])), 'motionkit_notice');

    $error = isset($_GET['error']) ? sanitize_text_field(wp_unslash($_GET['error'])) : '';

    // Error notices render regardless of the nonce. They are display-only and
    // non-destructive, and suppressing one leaves the user on a page that
    // still reads "Not Connected" with no stated reason — which is how a
    // failed connect (e.g. the site-limit 403 from /connect/token) came to
    // look like a silent no-op. A stale or missing nonce is exactly the case
    // where the user most needs to be told what happened.
    //
    // Success/action flags below stay nonce-gated: those assert something
    // happened, so a forged URL claiming "Connected Successfully" would be
    // misleading in a way an error message is not.
    if (!$notice_nonce_valid && !$error) {
      return;
    }
    // Every flag below asserts that an action succeeded, so all of them stay
    // behind the nonce — reaching this point with an invalid nonce means we
    // are here solely to render $error above.
    $just_connected = $notice_nonce_valid && isset($_GET['connected']) && is_string(sanitize_text_field(wp_unslash($_GET['connected'])));
    $just_disconnected = $notice_nonce_valid && isset($_GET['disconnected']) && is_string(sanitize_text_field(wp_unslash($_GET['disconnected'])));
    $license_refresh = $notice_nonce_valid && isset($_GET['license_refresh']) ? sanitize_key(wp_unslash($_GET['license_refresh'])) : '';
    $refresh_reason = $notice_nonce_valid && isset($_GET['reason']) ? sanitize_text_field(wp_unslash($_GET['reason'])) : '';
    $tools_deleted = $notice_nonce_valid && isset($_GET['tools_deleted']) ? (int) $_GET['tools_deleted'] : 0;
    $tools_all_deleted = $notice_nonce_valid && isset($_GET['tools_all_deleted']) ? (int) $_GET['tools_all_deleted'] : 0;
    $verify = $notice_nonce_valid && isset($_GET['verify']) ? sanitize_text_field(wp_unslash($_GET['verify'])) : '';
    $verify_reason = $notice_nonce_valid && isset($_GET['reason']) ? sanitize_text_field(wp_unslash($_GET['reason'])) : '';

    if ($error): ?>
      <div class="motionkit-notice motionkit-notice--error">
        <span class="motionkit-notice-icon">&#10060;</span>
        <?php echo esc_html($this->get_error_message($error)); ?>
        <button class="motionkit-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php endif;

    if ($just_connected): ?>
      <div class="motionkit-notice motionkit-notice--success">
        <span class="motionkit-notice-icon">&#10004;</span>
        <?php esc_html_e('Connected Successfully', 'motionkit'); ?>
        <button class="motionkit-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php endif;

    if ($just_disconnected): ?>
      <div class="motionkit-notice motionkit-notice--info">
        <span class="motionkit-notice-icon">&#8505;</span>
        <?php esc_html_e('Disconnected from MotionKit.', 'motionkit'); ?>
        <button class="motionkit-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php endif;

    if ($license_refresh === 'ok'): ?>
      <div class="motionkit-notice motionkit-notice--success">
        <span class="motionkit-notice-icon">&#10004;</span>
        <?php esc_html_e('License status updated from your MotionKit account.', 'motionkit'); ?>
        <button class="motionkit-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php elseif ($license_refresh === 'error' && $refresh_reason === 'site_not_launched'): ?>
      <div class="motionkit-notice motionkit-notice--info">
        <span class="motionkit-notice-icon">&#8505;</span>
        <?php esc_html_e('This site has not launched the MotionKit editor yet, so there is no license to check yet. Open the editor once (via "Launch MotionKit" or "Edit with MotionKit" on any page) to finish connecting this site.', 'motionkit'); ?>
        <button class="motionkit-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php elseif ($license_refresh === 'error'): ?>
      <div class="motionkit-notice motionkit-notice--error">
        <span class="motionkit-notice-icon">&#9888;</span>
        <?php
        echo esc_html(sprintf(
          /* translators: %s: machine-readable error code from the license check. */
          __('Could not check your license: %s. Your current status is unchanged.', 'motionkit'),
          $refresh_reason ?: 'unknown error'
        ));
        ?>
        <button class="motionkit-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php endif;

    if ($tools_deleted): ?>
      <div class="motionkit-notice motionkit-notice--success">
        <span class="motionkit-notice-icon">&#10004;</span>
        <?php esc_html_e('Animation data deleted.', 'motionkit'); ?>
        <button class="motionkit-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php endif;

    if ($tools_all_deleted): ?>
      <div class="motionkit-notice motionkit-notice--success">
        <span class="motionkit-notice-icon">&#10004;</span>
        <?php
        // translators: %d is the number of animation records deleted.
        echo esc_html(sprintf(_n('Deleted %d animation record.', 'Deleted %d animation records.', $tools_all_deleted, 'motionkit'), $tools_all_deleted));
        ?>
        <button class="motionkit-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php endif;

    if ($verify === 'valid'): ?>
      <div class="motionkit-notice motionkit-notice--success">
        <span class="motionkit-notice-icon">&#10004;</span>
        <?php esc_html_e('Token verified — your local token matches the MotionKit server.', 'motionkit'); ?>
        <button class="motionkit-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php elseif ($verify === 'invalid'): ?>
      <div class="motionkit-notice motionkit-notice--error">
        <span class="motionkit-notice-icon">&#10060;</span>
        <?php esc_html_e('Token mismatch — try disconnecting and reconnecting.', 'motionkit'); ?>
        <button class="motionkit-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php elseif ($verify === 'error'): ?>
      <div class="motionkit-notice motionkit-notice--error">
        <span class="motionkit-notice-icon">&#9888;</span>
        <?php
        // translators: %s is the reason the verification check failed.
        echo esc_html(sprintf(__('Verification failed: %s', 'motionkit'), $verify_reason ?: 'unknown error'));
        ?>
        <button class="motionkit-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php endif;
  }

  // ─── License Tab ─────────────────────────────────────────────

  /**
   * License state comes from the connected account, not from a key pasted
   * here — the connect handshake already established who this site belongs
   * to, and LicenseStatus keeps that account's entitlement mirrored locally.
   * So this tab reports; it doesn't activate.
   */
  private function render_license_tab(): void
  {
    if (!OAuthHandler::is_connected()) {
      return;
    }

    $state = LicenseStatus::get_state();
    $valid = LicenseStatus::is_valid();

    ?>
    <div class="motionkit-card">
      <div class="motionkit-card-body">
        <h3 class="motionkit-card-title">
          <span class="motionkit-title-icon">&#127881;</span>
          <?php esc_html_e('License', 'motionkit'); ?>
        </h3>

        <?php if (LicenseStatus::is_indeterminate()): ?>
          <p class="motionkit-card-desc">
            <?php esc_html_e('We could not reach the MotionKit server recently enough to confirm your license. Premium features stay available while we retry; use "Check again" to retry now.', 'motionkit'); ?>
          </p>
        <?php elseif ($valid): ?>
          <p class="motionkit-card-desc">
            <?php esc_html_e('Your license is active on this site. You have access to all pro features.', 'motionkit'); ?>
          </p>
        <?php elseif ($state['limit_exceeded']): ?>
          <p class="motionkit-card-desc">
            <?php esc_html_e('Your plan\'s site limit is full, so this site does not currently hold a slot. Remove another site from your MotionKit account, or upgrade your plan.', 'motionkit'); ?>
          </p>
        <?php elseif ('expired' === $state['status']): ?>
          <p class="motionkit-card-desc">
            <?php esc_html_e('Your license has expired. Renew it to keep using premium features.', 'motionkit'); ?>
          </p>
        <?php elseif ('disabled' === $state['status']): ?>
          <p class="motionkit-card-desc">
            <?php esc_html_e('Your license has been disabled. Please contact support.', 'motionkit'); ?>
          </p>
        <?php elseif ('inactive' === $state['status']): ?>
          <p class="motionkit-card-desc">
            <?php esc_html_e('Your license is not activated on this site yet. Reconnect the site, or activate it from your MotionKit account, to unlock premium features here.', 'motionkit'); ?>
          </p>
        <?php elseif (!$state['exists']): ?>
          <p class="motionkit-card-desc">
            <?php esc_html_e("You're on the Free plan. Upgrade anytime from your MotionKit account to unlock premium presets and pro features.", 'motionkit'); ?>
          </p>
        <?php else: ?>
          <p class="motionkit-card-desc">
            <?php esc_html_e('The connected account does not have an active MotionKit license.', 'motionkit'); ?>
          </p>
        <?php endif; ?>

        <table class="motionkit-license-details">
          <tbody>
            <tr>
              <th scope="row"><?php esc_html_e('Status', 'motionkit'); ?></th>
              <td>
                <span class="motionkit-badge <?php echo esc_attr($this->license_badge_class($state, $valid)); ?>">
                  &#9679; <?php echo esc_html($this->license_status_label($state)); ?>
                </span>
              </td>
            </tr>

            <?php if ($state['plan'] !== ''): ?>
            <tr>
              <th scope="row"><?php esc_html_e('Plan', 'motionkit'); ?></th>
              <td><?php echo esc_html($state['plan']); ?></td>
            </tr>
            <?php endif; ?>

            <?php if ($state['exists']): ?>
            <tr>
              <th scope="row"><?php esc_html_e('Sites', 'motionkit'); ?></th>
              <td>
                <?php
                if ($state['sites_limit'] > 0) {
                  echo esc_html(sprintf(
                    /* translators: 1: sites in use, 2: sites allowed by the plan. */
                    __('%1$d of %2$d used', 'motionkit'),
                    $state['sites_used'],
                    $state['sites_limit']
                  ));
                } else {
                  echo esc_html(sprintf(
                    /* translators: %d: number of sites in use on an unlimited plan. */
                    __('%d used (unlimited)', 'motionkit'),
                    $state['sites_used']
                  ));
                }
                ?>
              </td>
            </tr>
            <?php endif; ?>

            <?php if ($state['expires_at'] !== ''): ?>
            <tr>
              <th scope="row"><?php esc_html_e('Expires', 'motionkit'); ?></th>
              <td>
                <?php
                $expires_ts = strtotime($state['expires_at']);
                echo esc_html($expires_ts ? date_i18n(get_option('date_format'), $expires_ts) : $state['expires_at']);
                ?>
              </td>
            </tr>
            <?php endif; ?>

            <tr>
              <th scope="row"><?php esc_html_e('Last checked', 'motionkit'); ?></th>
              <td>
                <?php
                if ($state['checked_at']) {
                  echo esc_html(sprintf(
                    /* translators: %s: human-readable time difference, e.g. "5 mins". */
                    __('%s ago', 'motionkit'),
                    human_time_diff($state['checked_at'], time())
                  ));
                } else {
                  esc_html_e('Never', 'motionkit');
                }
                ?>
              </td>
            </tr>

            <?php if (!empty($state['stale']) && $state['exists']): ?>
            <tr>
              <th scope="row"></th>
              <td>
                <span style="color:#d97706;font-size:12px;">
                  &#9888;
                  <?php esc_html_e('Could not reach the MotionKit server recently — showing the last known status. Your features stay active in the meantime.', 'motionkit'); ?>
                </span>
              </td>
            </tr>
            <?php endif; ?>
          </tbody>
        </table>

        <div class="motionkit-form-actions">
          <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
            <?php wp_nonce_field('motionkit_refresh_license'); ?>
            <input type="hidden" name="action" value="motionkit_refresh_license">
            <button type="submit" class="motionkit-btn motionkit-btn--outline">
              <?php esc_html_e('Check again', 'motionkit'); ?>
            </button>
          </form>
        </div>
      </div>
    </div>
    <?php
  }

  /**
   * Human-readable label for the badge. "Site limit reached" wins over the
   * raw status because it's the actionable part — the license itself is
   * fine, this site just doesn't hold a slot.
   *
   * @param array $state Snapshot from LicenseStatus::get_state().
   * @return string
   */
  private function license_status_label(array $state): string
  {
    if ('unknown' === $state['status']) {
      return __('Unable to verify', 'motionkit');
    }

    if (!$state['exists']) {
      return __('Free plan', 'motionkit');
    }

    if (!empty($state['limit_exceeded'])) {
      return __('Site limit reached', 'motionkit');
    }

    switch ($state['status']) {
      case 'active':
        return __('Active', 'motionkit');
      case 'expired':
        return __('Expired', 'motionkit');
      case 'disabled':
        return __('Disabled', 'motionkit');
      default:
        return __('Inactive', 'motionkit');
    }
  }

  /**
   * Badge color for the license status. A site that simply never had a
   * license (free plan) is a normal, expected state — not a problem — so it
   * gets a neutral badge rather than the warning/error color used for a
   * license that used to be valid and no longer is (expired/disabled/over
   * its site limit).
   *
   * @param array $state Snapshot from LicenseStatus::get_state().
   * @param bool  $valid Whether the license is currently valid.
   * @return string
   */
  private function license_badge_class(array $state, bool $valid): string
  {
    if ($valid) {
      return 'motionkit-badge--success';
    }

    if (!$state['exists']) {
      return 'motionkit-badge--neutral';
    }

    return 'motionkit-badge--warning';
  }

  // ─── Connect Tab ─────────────────────────────────────────────

  private function render_connect_tab(\WP_User $current_user): void
  {
    $info = OAuthHandler::get_connection_info();

    if ($info['connected']) {
      $this->render_connected_state($info, $current_user);
      $this->render_license_tab();
    } else {
      $this->render_disconnected_state();
    }
  }

  private function render_connected_state(array $info, \WP_User $current_user): void
  {
    $disconnect_url = wp_nonce_url(
      admin_url('admin.php?page=motionkit-connect&tab=connect&motionkit_disconnect=1'),
      'motionkit_disconnect'
    );

    $verify_url = wp_nonce_url(
      admin_url('admin.php?page=motionkit-connect&tab=connect&motionkit_verify=1'),
      'motionkit_verify'
    );

    $switch_account_url = $this->oauth->get_authorize_url(true);

    $editor_url = $this->get_editor_url();

    ?>
    <!-- Status Card -->
    <div class="motionkit-card">
      <div class="motionkit-card-header">
        <div class="motionkit-card-header-left">
          <span class="motionkit-title-icon">&#128279;</span>
          <h3 class="motionkit-card-title"><?php esc_html_e('Connect your MotionKit Account', 'motionkit'); ?></h3>
        </div>
        <span class="motionkit-badge motionkit-badge--success">&#9679; <?php esc_html_e('Connected', 'motionkit'); ?></span>
      </div>

      <div class="motionkit-card-body">
        <div class="motionkit-info-row">
          <div class="motionkit-info-content">
            <span class="motionkit-info-label"><?php esc_html_e("You're connected as", 'motionkit'); ?></span>
            <strong class="motionkit-info-value"><?php echo esc_html($info['email'] ?: $current_user->user_email); ?></strong>
          </div>
          <a href="<?php echo esc_url($verify_url); ?>" class="motionkit-btn motionkit-btn--outline">
            <?php esc_html_e('My Account', 'motionkit'); ?>
          </a>
        </div>

        <div class="motionkit-info-row">
          <div class="motionkit-info-content">
            <span class="motionkit-info-label"><?php esc_html_e('Connected to the wrong account?', 'motionkit'); ?></span>
          </div>
          <a href="<?php echo esc_url($switch_account_url); ?>" class="motionkit-btn motionkit-btn--outline">
            <?php esc_html_e('Switch Account', 'motionkit'); ?>
          </a>
        </div>

        <div class="motionkit-info-row">
          <div class="motionkit-info-content">
            <span class="motionkit-info-label"><?php esc_html_e('Want to disconnect for any reason?', 'motionkit'); ?></span>
          </div>
          <a href="<?php echo esc_url($disconnect_url); ?>"
             class="motionkit-btn motionkit-btn--outline motionkit-btn--danger"
             onclick="return confirm('<?php echo esc_js(__('Are you sure you want to disconnect?', 'motionkit')); ?>');">
            <?php esc_html_e('Disconnect', 'motionkit'); ?>
          </a>
        </div>
      </div>
    </div>

    <!-- Open Editor Card -->
    <?php
    $connector_state = $this->connector_install_state();
    ?>
    <div class="motionkit-card">
      <div class="motionkit-card-header">
        <h3 class="motionkit-card-title">
          <span class="motionkit-title-icon">&#9889;</span>
          <?php esc_html_e('Open The Editor', 'motionkit'); ?>
        </h3>
      </div>
      <div class="motionkit-card-body">
        <?php if ($connector_state === 'active'): ?>
          <p class="motionkit-card-desc">
            <?php esc_html_e('Your site is connected. Open any post or page and click "Edit with MotionKit" - or use the button below to launch the editor directly.', 'motionkit'); ?>
          </p>
          <a href="<?php echo esc_url($editor_url); ?>"
             class="motionkit-btn motionkit-btn--primary motionkit-btn--split"
             target="_blank">
            <span class="motionkit-btn__text" data-text="<?php esc_attr_e('Launch Motionkit', 'motionkit'); ?>">
              <?php
                $text = __('Launch Motionkit', 'motionkit');
                $chars = preg_split('//u', $text, -1, PREG_SPLIT_NO_EMPTY);
                foreach ($chars as $i => $char) {
                  printf(
                    '<span class="motionkit-btn__char" style="transition-delay:%ss">%s</span>',
                    esc_attr(sprintf('%.2f', $i * 0.02)),
                    $char === ' ' ? '&nbsp;' : esc_html($char)
                  );
                }
              ?>
            </span>
          </a>
        <?php else:
          // Connected, but the engine plugin isn't running — launching the editor
          // would produce nothing on the live site without it. The shared CTA
          // offers Activate (installed-inactive) or Download (missing).
          $this->render_connector_cta('connected');
        endif; ?>
      </div>
    </div>
    <?php
  }

  private function render_disconnected_state(): void
  {
    $authorize_url = $this->oauth->get_authorize_url();

    // Prompt to get the Connector engine in place BEFORE connecting, so the
    // site is ready to run animations the moment the account is linked. Prints
    // nothing when the connector is already active.
    $this->render_connector_cta('disconnected');

    // Connecting is only useful once the engine is present — so the Connect
    // button is gated on the connector being active. Until then the CTA above
    // is the action, and here we show why Connect is held back.
    $connector_ready = ($this->connector_install_state() === 'active');
    ?>
    <div class="motionkit-card">
      <div class="motionkit-card-header">
        <div class="motionkit-card-header-left">
          <span class="motionkit-title-icon">&#128279;</span>
          <h3 class="motionkit-card-title"><?php esc_html_e('Connect your MotionKit Account', 'motionkit'); ?></h3>
        </div>
        <span class="motionkit-badge motionkit-badge--error">&#9679; <?php esc_html_e('Not Connected', 'motionkit'); ?></span>
      </div>
      <div class="motionkit-card-body">
        <p class="motionkit-card-desc">
          <?php esc_html_e('Gain access to the visual GSAP animation editor and connect your site to your MotionKit dashboard to start building stunning animations.', 'motionkit'); ?>
        </p>
        <?php if ($connector_ready): ?>
          <a href="<?php echo esc_url($authorize_url); ?>" class="motionkit-btn motionkit-btn--primary">
            <span>&#128279;</span>
            <?php esc_html_e('Connect To MotionKit', 'motionkit'); ?>
          </a>
        <?php else: ?>
          <span class="motionkit-btn motionkit-btn--primary" aria-disabled="true"
                style="opacity:.55;pointer-events:none;cursor:not-allowed;">
            <span>&#128279;</span>
            <?php esc_html_e('Connect To MotionKit', 'motionkit'); ?>
          </span>
          <p class="motionkit-card-desc" style="margin-top:10px;font-size:13px;">
            <?php esc_html_e('Install and activate the MotionKit Connector above first — then you can connect your account.', 'motionkit'); ?>
          </p>
        <?php endif; ?>
      </div>

      <div class="motionkit-card-footer">
        <h4 class="motionkit-footer-title"><?php esc_html_e('How It Works', 'motionkit'); ?></h4>
        <p class="motionkit-footer-desc">
          <?php esc_html_e('Clicking "Connect" will redirect you to motionkit.io to authorize this site. A secure token will be stored both in your WordPress database and our Supabase cloud - no passwords shared.', 'motionkit'); ?>
        </p>
      </div>
    </div>
    <?php
  }

  // ─── Helpers ─────────────────────────────────────────────────

  // Only ever called from render_notices(), which already verified the
  // 'motionkit_notice' nonce before reaching this — $error_message here is
  // a re-read of an already-verified request, not an independent one.
  // phpcs:disable WordPress.Security.NonceVerification.Recommended
  private function get_error_message(string $error): string
  {
    $messages = [
      'invalid_state'         => __('Security verification failed. Please try again.', 'motionkit'),
      'token_exchange_failed' => __('Could not complete the connection. Please try again.', 'motionkit'),
      'limit_exceeded'        => __('Site limit reached. Upgrade your plan to connect more sites.', 'motionkit'),
      'unauthorized'          => __('You do not have permission to perform this action.', 'motionkit'),
      'nonce_failed'          => __('Security check failed. Please try again.', 'motionkit'),
    ];

    // The server-provided message is richer than the static text above (it
    // names the actual count and cap), so prefer it — but only when the nonce
    // verified. Errors now render without a nonce so a failed connect always
    // states a reason, which means this value can be attacker-supplied; echoing
    // it unconditionally would let a crafted URL put arbitrary text into a
    // notice styled as official plugin output. Unverified requests fall back to
    // the trusted static message for the error code instead.
    $notice_nonce_valid = isset($_GET['_wpnonce'])
      && wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_wpnonce'])), 'motionkit_notice');

    if ($notice_nonce_valid) {
      $server_msg = isset($_GET['error_message']) ? sanitize_text_field(wp_unslash($_GET['error_message'])) : '';
      if ($server_msg) {
        return $server_msg;
      }
    }

    return $messages[$error] ?? __('An unknown error occurred. Please try again.', 'motionkit');
  }
  // phpcs:enable WordPress.Security.NonceVerification.Recommended

  // ─── Tools Tab ───────────────────────────────────────────────

  private const TOOLS_OPTION_PREFIX = 'motionkit_pg_animation_';
  private const TOOLS_SETTINGS_PREFIX = 'motionkit_pg_settings_';
  private const TOOLS_GLOBAL_SETTINGS_OPTION = 'motionkit_global_settings';
  private const TOOLS_GLOBAL_ANIMATIONS_OPTION = 'motionkit_global_animations';

  public function handle_tools_actions(): void
  {
    if (!isset($_POST['motionkit_tools_action'])) {
      return;
    }
    if (!current_user_can('manage_options')) {
      return;
    }
    $nonce = isset($_POST['_wpnonce']) ? sanitize_text_field(wp_unslash($_POST['_wpnonce'])) : '';
    if (!wp_verify_nonce($nonce, 'motionkit_tools_nonce')) {
      wp_safe_redirect(wp_nonce_url(
        admin_url('admin.php?page=motionkit-connect&tab=tools&error=nonce_failed'),
        'motionkit_notice'
      ));
      exit;
    }

    $action = sanitize_text_field(wp_unslash($_POST['motionkit_tools_action']));

    if ($action === 'delete_one') {
      $store = sanitize_text_field(wp_unslash($_POST['store_type'] ?? ''));
      $option = sanitize_text_field(wp_unslash($_POST['option_key'] ?? ''));
      $id = isset($_POST['object_id']) ? (int) $_POST['object_id'] : 0;
      $this->delete_animation_record($store, $option, $id);
      wp_safe_redirect(wp_nonce_url(
        admin_url('admin.php?page=motionkit-connect&tab=tools&tools_deleted=1'),
        'motionkit_notice'
      ));
      exit;
    }
  }

  public function ajax_tools_list(): void
  {
    if (!current_user_can('manage_options')) {
      wp_send_json_error(['message' => 'unauthorized'], 403);
    }
    check_ajax_referer('motionkit_tools_ajax', 'nonce');

    $search = isset($_POST['search']) ? sanitize_text_field(wp_unslash($_POST['search'])) : '';
    $page = max(1, isset($_POST['page']) ? (int) $_POST['page'] : 1);
    $per_page = 20;

    $all = $this->collect_animation_records($search);
    $total = count($all);
    $total_pages = max(1, (int) ceil($total / $per_page));
    $offset = ($page - 1) * $per_page;
    $rows = array_slice($all, $offset, $per_page);

    wp_send_json_success([
      'rows'        => array_map([$this, 'decorate_record'], $rows),
      'page'        => $page,
      'per_page'    => $per_page,
      'total'       => $total,
      'total_pages' => $total_pages,
    ]);
  }

  public function ajax_tools_bulk_delete(): void
  {
    if (!current_user_can('manage_options')) {
      wp_send_json_error(['message' => 'unauthorized'], 403);
    }
    check_ajax_referer('motionkit_tools_ajax', 'nonce');

    $offset = max(0, isset($_POST['offset']) ? (int) $_POST['offset'] : 0);
    $batch_size = 25;

    $all = $this->collect_animation_records('');
    $total = count($all);
    $slice = array_slice($all, $offset, $batch_size);

    $deleted = 0;
    foreach ($slice as $record) {
      if ($this->delete_animation_record($record['store_type'], $record['option'], $record['id'])) {
        $deleted++;
      }
    }

    // First batch: clear global keys + sweep any orphan settings rows that
    // have no matching animation record (so nothing is left behind).
    if ($offset === 0) {
      delete_option(self::TOOLS_GLOBAL_SETTINGS_OPTION);
      delete_option(self::TOOLS_GLOBAL_ANIMATIONS_OPTION);
      $this->delete_all_settings_records();
    }

    $processed = $offset + count($slice);
    $done = $processed >= $total;

    wp_send_json_success([
      'processed' => $processed,
      'deleted'   => $deleted,
      'total'     => $total,
      'done'      => $done,
      'next_offset' => $done ? $processed : $offset + $batch_size,
    ]);
  }

  // Defense-in-depth: both callers (handle_tools_actions, ajax_tools_bulk_delete)
  // already gate on manage_options, but this re-checks so the destructive
  // delete itself never fires without it, even if a future caller forgets.
  private function delete_animation_record(string $store_type, string $option, int $id = 0): bool
  {
    if (!current_user_can('manage_options')) {
      return false;
    }

    $deleted = $this->delete_keyed_record($store_type, $option, $id);

    // Cascade: when we remove motionkit_pg_animation_<type>, also remove the
    // matching motionkit_pg_settings_<type> on the same store/id. Settings are
    // orphaned once the animation row is gone — no UI points at them.
    if (strpos($option, self::TOOLS_OPTION_PREFIX) === 0) {
      $settings_key = preg_replace(
        '/^' . preg_quote(self::TOOLS_OPTION_PREFIX, '/') . '/',
        self::TOOLS_SETTINGS_PREFIX,
        $option
      );
      if ($settings_key !== null && $settings_key !== $option) {
        $this->delete_keyed_record($store_type, $settings_key, $id);
      }
    }

    return $deleted;
  }

  private function delete_keyed_record(string $store_type, string $option, int $id = 0): bool
  {
    switch ($store_type) {
      case 'post_meta':
        return (bool) delete_post_meta($id, $option);
      case 'term_meta':
        return (bool) delete_term_meta($id, $option);
      case 'option':
      default:
        return (bool) delete_option($option);
    }
  }

  // Wipe every motionkit_pg_settings_* row across post_meta/term_meta/options.
  // Used by bulk delete to catch orphans whose animation row was already gone.
  // Defense-in-depth: re-checks the capability here too, so this destructive,
  // site-wide sweep stays safe even if a future caller forgets to gate it.
  private function delete_all_settings_records(): void
  {
    if (!current_user_can('manage_options')) {
      return;
    }

    global $wpdb;
    $like = $wpdb->esc_like(self::TOOLS_SETTINGS_PREFIX) . '%';

    $post_rows = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT post_id AS id, meta_key AS `key` FROM {$wpdb->postmeta} WHERE meta_key LIKE %s",
        $like
      )
    );
    foreach ($post_rows as $r) {
      delete_post_meta((int) $r->id, $r->key);
    }

    $term_rows = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT term_id AS id, meta_key AS `key` FROM {$wpdb->termmeta} WHERE meta_key LIKE %s",
        $like
      )
    );
    foreach ($term_rows as $r) {
      delete_term_meta((int) $r->id, $r->key);
    }

    $opt_rows = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s",
        $like
      )
    );
    foreach ($opt_rows as $r) {
      delete_option($r->option_name);
    }
  }

  /**
   * Scan post_meta, term_meta, options for animation configs.
   *
   * @return array<int,array{store_type:string,option:string,id:int,title:string,type_label:string,modified:string,edit_url:string|null,permalink:string|null}>
   */
  private function collect_animation_records(string $search = ''): array
  {
    global $wpdb;
    $prefix = self::TOOLS_OPTION_PREFIX;
    $like = $wpdb->esc_like($prefix) . '%';
    $records = [];

    // post_meta rows
    $meta_rows = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT pm.post_id AS id, pm.meta_key AS `key`, p.post_title AS title, p.post_type AS type, p.post_modified_gmt AS modified
         FROM {$wpdb->postmeta} pm
         INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
         WHERE pm.meta_key LIKE %s",
        $like
      )
    );
    foreach ($meta_rows as $r) {
      $records[] = [
        'store_type' => 'post_meta',
        'option'     => $r->key,
        'id'         => (int) $r->id,
        'title'      => $r->title !== '' ? $r->title : '(no title)',
        'type_label' => $r->type,
        'modified'   => $r->modified,
      ];
    }

    // term_meta rows
    $term_rows = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT tm.term_id AS id, tm.meta_key AS `key`, t.name AS title, tt.taxonomy AS type
         FROM {$wpdb->termmeta} tm
         INNER JOIN {$wpdb->terms} t ON t.term_id = tm.term_id
         INNER JOIN {$wpdb->term_taxonomy} tt ON tt.term_id = tm.term_id
         WHERE tm.meta_key LIKE %s",
        $like
      )
    );
    foreach ($term_rows as $r) {
      $records[] = [
        'store_type' => 'term_meta',
        'option'     => $r->key,
        'id'         => (int) $r->id,
        'title'      => $r->title,
        'type_label' => 'term:' . $r->type,
        'modified'   => '',
      ];
    }

    // options rows
    $opt_rows = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s",
        $like
      )
    );
    foreach ($opt_rows as $r) {
      $records[] = [
        'store_type' => 'option',
        'option'     => $r->option_name,
        'id'         => 0,
        'title'      => $this->humanize_option_key($r->option_name),
        'type_label' => 'option',
        'modified'   => '',
      ];
    }

    if ($search !== '') {
      $needle = mb_strtolower($search);
      $records = array_values(array_filter($records, function ($rec) use ($needle) {
        return strpos(mb_strtolower($rec['title']), $needle) !== false
          || strpos(mb_strtolower($rec['option']), $needle) !== false;
      }));
    }

    usort($records, function ($a, $b) {
      return strcmp($b['modified'] ?? '', $a['modified'] ?? '');
    });

    return $records;
  }

  private function humanize_option_key(string $key): string
  {
    $suffix = substr($key, strlen(self::TOOLS_OPTION_PREFIX));
    return $suffix !== '' ? $suffix : $key;
  }

  /**
   * Add edit_url (editor.motionkit.io with token) + permalink to each record.
   */
  private function decorate_record(array $rec): array
  {
    $permalink = null;

    if ($rec['store_type'] === 'post_meta' && $rec['id']) {
      $permalink = get_permalink($rec['id']) ?: null;
    } elseif ($rec['store_type'] === 'term_meta' && $rec['id']) {
      $link = get_term_link($rec['id']);
      $permalink = is_wp_error($link) ? null : $link;
    } elseif ($rec['store_type'] === 'option') {
      $permalink = home_url('/');
    }

    $rec['permalink'] = $permalink;
    $rec['edit_url']  = $permalink ? $this->build_editor_url($permalink) : null;

    return $rec;
  }

  private function build_editor_url(string $page_url): string
  {
    // Always attach a session JWT — see get_editor_url() above.
    $query_args = [
      'site'            => $page_url,
      'platform'        => 'wordpress',
      'motionkit_token' => JwtTokenManager::generate($page_url),
    ];
    $base = apply_filters('motionkit/editor/url', 'https://editor.motionkit.io/');
    return add_query_arg($query_args, $base);
  }

  private function render_tools_tab(): void
  {
    ?>
    <!-- Danger Zone -->
    <div class="motionkit-card">
      <div class="motionkit-card-header">
        <div class="motionkit-card-header-left">
          <span class="motionkit-title-icon">&#9888;</span>
          <h3 class="motionkit-card-title"><?php esc_html_e('Danger Zone', 'motionkit'); ?></h3>
        </div>
      </div>
      <div class="motionkit-card-body">
        <p class="motionkit-card-desc">
          <?php esc_html_e('Delete ALL MotionKit animation data on this site — per-page configs, taxonomy configs, and global settings. This cannot be undone.', 'motionkit'); ?>
        </p>
        <button type="button" class="motionkit-btn motionkit-btn--outline motionkit-btn--danger" id="motionkit-tools-delete-all">
          <?php esc_html_e('Delete All Animation Data', 'motionkit'); ?>
        </button>
      </div>
    </div>

    <!-- Animation Pages Table -->
    <div class="motionkit-card">
      <div class="motionkit-card-header">
        <div class="motionkit-card-header-left">
          <span class="motionkit-title-icon">&#128196;</span>
          <h3 class="motionkit-card-title"><?php esc_html_e('Animation Pages', 'motionkit'); ?></h3>
        </div>
        <input type="search" class="motionkit-input motionkit-tools-search" id="motionkit-tools-search"
               placeholder="<?php esc_attr_e('Search by title or key...', 'motionkit'); ?>">
      </div>
      <div class="motionkit-card-body">
        <div class="motionkit-tools-table-wrap">
          <table class="motionkit-tools-table">
            <thead>
              <tr>
                <th><?php esc_html_e('Title', 'motionkit'); ?></th>
                <th><?php esc_html_e('Type', 'motionkit'); ?></th>
                <th><?php esc_html_e('Modified', 'motionkit'); ?></th>
                <th style="text-align:right;"><?php esc_html_e('Actions', 'motionkit'); ?></th>
              </tr>
            </thead>
            <tbody id="motionkit-tools-tbody">
              <tr><td colspan="4" class="motionkit-tools-empty"><?php esc_html_e('Loading...', 'motionkit'); ?></td></tr>
            </tbody>
          </table>
        </div>
        <div class="motionkit-tools-pagination" id="motionkit-tools-pagination"></div>
      </div>
    </div>

    <!-- Delete form (per-row, submitted by JS) -->
    <form id="motionkit-tools-delete-form" method="post" action="" style="display:none;">
      <?php wp_nonce_field('motionkit_tools_nonce'); ?>
      <input type="hidden" name="motionkit_tools_action" value="delete_one">
      <input type="hidden" name="store_type" value="">
      <input type="hidden" name="option_key" value="">
      <input type="hidden" name="object_id" value="0">
    </form>

    <!-- Delete-all confirm dialog -->
    <div class="motionkit-modal" id="motionkit-tools-confirm" hidden>
      <div class="motionkit-modal-backdrop"></div>
      <div class="motionkit-modal-box">
        <h3 class="motionkit-modal-title"><?php esc_html_e('Delete ALL animation data?', 'motionkit'); ?></h3>
        <p class="motionkit-modal-desc">
          <?php esc_html_e('This will permanently remove every MotionKit animation config on this site (pages, posts, terms, global settings). This action cannot be undone.', 'motionkit'); ?>
        </p>
        <div class="motionkit-modal-progress" id="motionkit-tools-progress" hidden>
          <div class="motionkit-progress-bar"><div class="motionkit-progress-fill" id="motionkit-progress-fill"></div></div>
          <div class="motionkit-progress-label" id="motionkit-progress-label">0 / 0</div>
        </div>
        <div class="motionkit-modal-actions">
          <button type="button" class="motionkit-btn motionkit-btn--outline" id="motionkit-tools-cancel"><?php esc_html_e('Cancel', 'motionkit'); ?></button>
          <button type="button" class="motionkit-btn motionkit-btn--primary motionkit-btn--danger" id="motionkit-tools-confirm-btn"><?php esc_html_e('Yes, Delete Everything', 'motionkit'); ?></button>
        </div>
      </div>
    </div>
    <?php
  }

}
