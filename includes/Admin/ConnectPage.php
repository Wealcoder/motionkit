<?php

namespace MotionKit\Admin;

use MotionKit\Common\PluginStatus;

/**
 * Admin Dashboard Page
 *
 * WordPress admin page with tabbed layout: Connect, Tools. License status
 * renders inline inside the Connect tab.
 *
 * Pure dashboard UI — the authentication layer (OAuth, tokens, license)
 * lives in the MotionKit Connector plugin, reached through the guarded
 * helpers below. With the connector absent, everything reads as
 * "not connected" and the page's only action is the connector-install CTA.
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
  // ─── Auth accessors ──────────────────────────────────────────

  // The connect flow is this plugin's own (MotionKit\Auth\OAuthHandler); the connector only reads the token it stores.
  private static function is_connected(): bool
  {
    return \MotionKit\Auth\OAuthHandler::is_connected();
  }

  private static function connection_info(): array
  {
    return \MotionKit\Auth\OAuthHandler::get_connection_info();
  }

  private static function authorize_url(bool $switch_account = false): string
  {
    return \MotionKit\Auth\OAuthHandler::get_authorize_url($switch_account);
  }

  // The Data tab (key `tools`) is UI-only here: its data layer (list/delete AJAX + delete_one POST) is registered by the connector's AnimationDataTools, so the tab only renders when that class is present.
  private static function tools_available(): bool
  {
    return class_exists('\MotionKitConnector\Admin\AnimationDataTools');
  }

  public function init(): void
  {
    add_action('admin_menu', [$this, 'register_menu']);
    add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_styles']);
    add_action('admin_enqueue_scripts', [$this, 'enqueue_menu_icon_style']);
    add_action('admin_init', [$this, 'handle_connector_activate']);
    add_action('current_screen', [$this, 'suppress_foreign_admin_notices']);
    add_action('current_screen', [$this, 'remove_admin_footer']);
  }

  /**
   * Drop wp-admin's footer ("Thank you for creating with WordPress" and the
   * version) on the MotionKit page only: it is a full-screen dashboard, and
   * the line read as part of it. Other screens keep theirs.
   */
  public function remove_admin_footer(): void
  {
    $screen = get_current_screen();
    if (!$screen || $screen->id !== 'toplevel_page_motionkit-connect') {
      return;
    }

    add_filter('admin_footer_text', '__return_empty_string', 99);
    // Core adds its version at priority 10, so this has to run after it.
    add_filter('update_footer', '__return_empty_string', 99);
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

  /**
   * Which tab this request draws.
   *
   * Both render_page() and enqueue_admin_styles() need the answer, and they
   * must agree — they used to compute it separately, so the page could enqueue
   * one tab's assets while drawing another. Connecting is the only useful
   * action on a disconnected site, so that is the default until a token is
   * stored, and the animations tab is unreachable until then.
   *
   * @return string One of 'animations', 'connect', 'tools'.
   */
  private static function resolve_active_tab(): string
  {
    $connected = !empty(self::connection_info()['connected']);
    $default_tab = self::default_tab($connected);

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only tab selection; an invalid nonce falls back to the default tab rather than failing.
    $nonce = isset($_GET['_wpnonce']) ? sanitize_text_field(wp_unslash($_GET['_wpnonce'])) : '';

    // The sidebar stamps motionkit_tab_nav; the OAuth callback and every other redirect_with_notice() redirect stamp motionkit_notice and name a tab too. That tab used to be ignored, so a site that had just connected landed on the empty Animations tab instead of the Connect tab it was sent to.
    $tab_nonce_valid = $nonce !== ''
      && (wp_verify_nonce($nonce, 'motionkit_tab_nav') || wp_verify_nonce($nonce, 'motionkit_notice'));

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Guarded by $tab_nonce_valid above.
    $tab = ($tab_nonce_valid && isset($_GET['tab']))
      ? sanitize_text_field(wp_unslash($_GET['tab']))
      : $default_tab;

    if ($tab === 'animations' && !$connected) {
      return $default_tab;
    }
    if ($tab === 'tools' && !self::tools_available()) {
      return $default_tab;
    }

    return in_array($tab, ['animations', 'connect', 'tools'], true) ? $tab : $default_tab;
  }

  /**
   * The tab the page opens on when the link names none.
   *
   * A site with nothing animated yet has only its account to look at, so it
   * opens there; once a page carries animation data, the pages are what the
   * owner comes for. The Animations tab is the fallback only when the
   * connector that provides the pages tab is missing.
   */
  private static function default_tab(bool $connected): string
  {
    if (!$connected || !self::has_animation_data()) {
      return 'connect';
    }

    return self::tools_available() ? 'tools' : 'animations';
  }

  /**
   * Whether any page, term or the site itself carries an animation record.
   *
   * An existence check rather than the full scan the Animations tab runs:
   * that scan signs an editor URL per animation, which is too much for a
   * question asked twice on every load of this page. Cached per request.
   */
  private static function has_animation_data(): bool
  {
    static $found = null;
    if ($found !== null) {
      return $found;
    }

    global $wpdb;
    $like = $wpdb->esc_like('motionkit_pg_animation_') . '%';

    // phpcs:disable WordPress.DB.DirectDatabaseQuery -- A LIKE on a meta key has no API; one row is enough, and the answer is cached above.
    $found = !empty(get_option('motionkit_global_animations'))
      || (bool) $wpdb->get_var($wpdb->prepare("SELECT 1 FROM {$wpdb->postmeta} WHERE meta_key LIKE %s LIMIT 1", $like))
      || (bool) $wpdb->get_var($wpdb->prepare("SELECT 1 FROM {$wpdb->termmeta} WHERE meta_key LIKE %s LIMIT 1", $like))
      || (bool) $wpdb->get_var($wpdb->prepare("SELECT 1 FROM {$wpdb->options} WHERE option_name LIKE %s LIMIT 1", $like));
    // phpcs:enable

    return $found;
  }

  /**
   * The cache-busting version for one built asset on this page.
   *
   * The plugin version alone only changes at a release, so between releases
   * a browser kept serving the stylesheet it had cached and a rebuilt file
   * never reached it. The file's modification time rides along, so every
   * rebuild is a new URL. Falls back to the plugin version when the file is missing.
   */
  private static function asset_version(string $relative_path): string
  {
    $version = defined('MOTIONKIT_VERSION') ? MOTIONKIT_VERSION : '1.0.0';
    $path = plugin_dir_path(MOTIONKIT_PLUGIN_FILE) . $relative_path;
    $modified = file_exists($path) ? (int) filemtime($path) : 0;

    return $modified > 0 ? $version . '.' . $modified : $version;
  }

  public function enqueue_admin_styles(string $hook): void
  {
    if ($hook !== 'toplevel_page_motionkit-connect') {
      return;
    }

    wp_enqueue_style(
      'motionkit-admin',
      plugins_url('assets/build/admin.css', MOTIONKIT_PLUGIN_FILE),
      [],
      self::asset_version('assets/build/admin.css')
    );

    // Delegated notice-dismiss / confirm handlers (no inline onclick attributes).
    wp_enqueue_script(
      'motionkit-admin',
      plugins_url('assets/build/admin.js', MOTIONKIT_PLUGIN_FILE),
      [],
      self::asset_version('assets/build/admin.js'),
      true
    );

    $active_tab = self::resolve_active_tab();

    if ($active_tab === 'animations') {
      wp_enqueue_style(
        'motionkit-admin-animations',
        plugins_url('assets/build/admin-animations.css', MOTIONKIT_PLUGIN_FILE),
        ['motionkit-admin'],
        self::asset_version('assets/build/admin-animations.css')
      );

      wp_enqueue_script(
        'motionkit-admin-animations',
        plugins_url('assets/build/admin-animations.js', MOTIONKIT_PLUGIN_FILE),
        [],
        self::asset_version('assets/build/admin-animations.js'),
        true
      );

      wp_localize_script('motionkit-admin-animations', 'motionkitAnimationsData', [
        'ajaxUrl'   => admin_url('admin-ajax.php'),
        'nonce'     => wp_create_nonce('motionkit_animations_ajax'),
        'editorUrl' => $this->get_editor_url(),
        'strings'   => [
          'onSite'        => __('Animations on this site:', 'motionkit'),
          'onPage'        => __('Animations on this page:', 'motionkit'),
          'live'          => __('live', 'motionkit'),
          'draft'         => __('draft', 'motionkit'),
          'typeFree'      => __('WAAPI', 'motionkit'),
          'typeGsap'      => __('GSAP', 'motionkit'),
          'allPages'      => __('All pages', 'motionkit'),
          'noAnimations'  => __('No animations found on this site. Open MotionKit Editor to create your first animation.', 'motionkit'),
          'noMatches'     => __('No animations match this filter.', 'motionkit'),
          'loading'       => __('Loading animations...', 'motionkit'),
          'actions'       => __('Actions', 'motionkit'),
          'statusActive'  => __('Active', 'motionkit'),
          'statusDraft'   => __('Draft', 'motionkit'),
          'toggleHint'    => __('Click to toggle status', 'motionkit'),
          'publish'       => __('Publish', 'motionkit'),
          'setDraft'      => __('Set as draft', 'motionkit'),
          'viewPage'      => __('View page', 'motionkit'),
          /* translators: 1: rows on the page, 2: rows in total */
          'showing'       => __('Showing %1$s of %2$s', 'motionkit'),
          'confirmDelete' => __('Are you sure you want to delete this animation?', 'motionkit'),
          'done'          => __('Done!', 'motionkit'),
          'failed'        => __('Action failed. Please try again.', 'motionkit'),
        ],
      ]);
    }

    if ($active_tab === 'tools' && self::tools_available()) {
      wp_enqueue_style(
        'motionkit-admin-tools',
        plugins_url('assets/build/admin-tools.css', MOTIONKIT_PLUGIN_FILE),
        ['motionkit-admin'],
        self::asset_version('assets/build/admin-tools.css')
      );

      wp_enqueue_script(
        'motionkit-admin-tools',
        plugins_url('assets/build/admin-tools.js', MOTIONKIT_PLUGIN_FILE),
        [],
        self::asset_version('assets/build/admin-tools.js'),
        true
      );

      // Where a row's Animations button goes: the Animations tab (stamped with the tab nonce it needs), which admin-tools.js narrows to the row's page. Empty while disconnected, when that tab does not exist.
      $animations_url = !empty(self::connection_info()['connected'])
        ? add_query_arg(['tab' => 'animations', '_wpnonce' => wp_create_nonce('motionkit_tab_nav')], admin_url('admin.php?page=motionkit-connect'))
        : '';

      wp_localize_script('motionkit-admin-tools', 'motionkitToolsData', [
        'ajaxUrl'       => admin_url('admin-ajax.php'),
        'nonce'         => wp_create_nonce('motionkit_tools_ajax'),
        'noticeNonce'   => wp_create_nonce('motionkit_notice'),
        'redirectUrl'   => admin_url('admin.php?page=motionkit-connect&tab=tools'),
        'animationsUrl' => $animations_url,
        'strings'       => [
          'noResults' => __('No animation data found.', 'motionkit'),
          'actions'   => __('Actions', 'motionkit'),
          'never'     => __('Not recorded', 'motionkit'),
          /* translators: 1: rows on the page, 2: rows in total */
          'showing'     => __('Showing %1$s of %2$s', 'motionkit'),
          'loadingMore' => __('Loading more...', 'motionkit'),
          'confirm'     => __('Delete this animation data?', 'motionkit'),
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

    // Always attach a session JWT — even before the site is connected, the connector's JwtTokenManager falls back to a local HMAC-signed token, so is_editor_preview() can require a valid token unconditionally instead of trusting ?action=motionkit-editor alone pre-connect.
    $query_args = [
      'site'            => $page_url,
      'platform'        => 'wordpress',
      'motionkit_token' => motionkit_editor_session_token($page_url),
    ];

    $default_editor_url = class_exists('\MotionKit\Common\EditorEndpoint')
      ? \MotionKit\Common\EditorEndpoint::url()
      : 'https://editor.motionkit.io/';
    $base_url = apply_filters('motionkit/editor/url', $default_editor_url);
    return add_query_arg($query_args, $base_url);
  }

  // ─── Render Page ─────────────────────────────────────────────

  public function render_page(): void
  {
    if (!current_user_can('manage_options')) {
      wp_die(esc_html__('You do not have permission to access this page.', 'motionkit'));
    }

    $connection_info = self::connection_info();
    $connected = !empty($connection_info['connected']);
    // The header names the MotionKit account only. It used to fall back to the WordPress admin's email and avatar, which read as "already connected" on a site that was not.
    $account_email = $connected ? (string) $connection_info['email'] : '';

    // Shared with enqueue_admin_styles() so the assets loaded always match the tab drawn.
    $active_tab = self::resolve_active_tab();

    $tabs = [];
    // The tab holds the account connection, the editor launch and the license, so it is named for the account; before a connection exists its one job is the connect step.
    $account_tab = [
      'label' => $connected ? __('Account', 'motionkit') : __('Connect', 'motionkit'),
      'icon'  => '&#128279;',
    ];
    // Animations is hidden rather than disabled while disconnected — there is no partial state worth showing, and the tab reappears the moment the OAuth callback stores a token.
    if ($connected) {
      $tabs['animations'] = ['label' => __('Animations', 'motionkit'), 'icon' => '&#10024;'];
    } else {
      // Connecting is the only thing to do on a disconnected site, so it leads.
      $tabs['connect'] = $account_tab;
    }
    if (self::tools_available()) {
      // Named for what the tab holds: the pages (and terms and site-wide records) that carry animation data, and how to remove it. "Tools" said nothing about either.
      $tabs['tools'] = ['label' => __('Animated Pages', 'motionkit'), 'icon' => '&#128295;'];
    }
    // Once connected the account is settings, not daily work, so it sits last, under the two animation tabs.
    if ($connected) {
      $tabs['connect'] = $account_tab;
    }

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
          <span class="motionkit-header-title"><?php echo esc_html__('MotionKit', 'motionkit'); ?></span>
        </div>
        <div class="motionkit-header-right">
          <?php if ($connected): ?>
            <span class="motionkit-header-account">
              <span class="motionkit-header-account-label"><?php esc_html_e('MotionKit account', 'motionkit'); ?></span>
              <span class="motionkit-header-email"><?php echo esc_html($account_email !== '' ? $account_email : __('Connected', 'motionkit')); ?></span>
            </span>
          <?php else: ?>
            <span class="motionkit-badge motionkit-badge--error">&#9679; <?php esc_html_e('Not connected', 'motionkit'); ?></span>
          <?php endif; ?>
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
                 class="motionkit-sidebar-link <?php echo esc_attr($active_tab === $tab_key ? 'motionkit-sidebar-link--active' : ''); ?>">
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
              $this->render_connect_tab();
              break;
            case 'animations':
              $this->render_animations_tab();
              break;
            // $active_tab is already validated against $tabs above, so anything reaching here is a tab that was removed from the list — render the connect step rather than the animations list, which is the one tab a disconnected site must never be shown.
            default:
              $this->render_connect_tab();
              break;
          }
          ?>
        </div>

      </div>

      <!-- Back to top: shown by admin.js once the page is scrolled past the first screen; the lists load as they are scrolled, so the top gets far away. -->
      <button type="button" class="motionkit-to-top" id="motionkit-to-top" aria-label="<?php esc_attr_e('Back to top', 'motionkit'); ?>" title="<?php esc_attr_e('Back to top', 'motionkit'); ?>">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <?php
  }

  // ─── Notices ─────────────────────────────────────────────────

  /**
   * Whether the MotionKit Connector engine plugin is active.
   *
   * The connector ships the animation engine, REST bridge, and runtime — the
   * editor cannot run anything on the live site without it. Used to swap the
   * "Launch MotionKit" button for a "Download Connector" prompt until it's
   * installed.
   *
   * @return bool
   */
  private function is_connector_active(): bool
  {
    return PluginStatus::connector_is_active();
  }

  /**
   * The connector's plugin basename among installed plugins.
   *
   * @return string Basename like "motionkit-connector/motionkit-connector.php".
   */
  private function connector_basename(): string
  {
    return PluginStatus::connector_basename();
  }

  /**
   * Connector install state: 'active' | 'deactivated' | 'inactive'.
   *
   *  - active:      plugin is running (nothing to prompt).
   *  - deactivated: installed on disk but not activated → offer Activate.
   *  - inactive:    not on disk → offer Download.
   *
   * @return string
   */
  private function connector_install_state(): string
  {
    if (PluginStatus::connector_is_active()) {
      return 'active';
    }

    // The editor is only told active/inactive; this page needs the middle case too, because "installed but off" is an Activate button and "not there" is a Download one.
    return PluginStatus::is_installed(PluginStatus::CONNECTOR) ? 'deactivated' : 'inactive';
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
   * Render the GSAP add-on CTA (gradient card) on the connected screen.
   *
   * This plugin connects the site and runs the free (WAAPI) animations on its
   * own; the MotionKit with GSAP add-on is only needed for GSAP animations
   * (Most Popular presets, custom timelines, the cloud library, page
   * transitions and smooth scroll). So the card offers the add-on once the
   * site is connected, and never stands in front of the Connect step.
   *
   * State drives the button:
   *   - missing  → "Download MotionKit with GSAP" (download page, new tab)
   *   - inactive → "Activate MotionKit with GSAP" (WP nonced activate link, same tab)
   *
   * Prints nothing when the add-on is already active.
   *
   * @return void
   */
  private function render_connector_cta(): void
  {
    $state = $this->connector_install_state();
    if ($state === 'active') {
      return;
    }

    $is_deactivated = ($state === 'deactivated');

    if ($is_deactivated) {
      $cta_title   = __('Activate MotionKit with GSAP', 'motionkit');
      $cta_desc    = __('The GSAP add-on is installed but not active. Activate it to run GSAP animations on this site: Most Popular presets, custom timelines, the cloud library, page transitions and smooth scroll.', 'motionkit');
      $cta_label   = __('Activate MotionKit with GSAP', 'motionkit');
      $cta_href    = $this->connector_activate_url();
      $cta_new_tab = false;
    } else {
      $cta_title   = __('Add GSAP animations', 'motionkit');
      $cta_desc    = __('Your site is connected and already runs MotionKit animations. Install the free MotionKit with GSAP add-on to also run Most Popular presets, custom timelines, the cloud library, page transitions and smooth scroll.', 'motionkit');
      $cta_label   = __('Download MotionKit with GSAP', 'motionkit');
      $cta_href    = $this->connector_download_url();
      $cta_new_tab = ('#' !== $cta_href);
    }

    $badge = __('Optional add-on', 'motionkit');
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
             <?php if ($cta_new_tab): ?>target="_blank" rel="noopener"<?php endif; ?>>
            <?php echo esc_html($cta_label); ?>
            <?php if ($is_deactivated): ?>
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
   * The connector download / landing page URL.
   *
   * @return string
   */
  private function connector_download_url(): string
  {
    return 'https://motionkit.io';
  }

  private function render_notices(): void
  {
    // These flags are appended by redirects under MotionKit's control (the connector's OAuth callback and AnimationDataTools delete handler, plus the bulk-delete JS) and are nonce-stamped via wp_nonce_url()/wp_create_nonce('motionkit_notice') at every one of those redirect sites. A missing/invalid nonce (e.g. a
    // hand-crafted or stale URL) just shows no notice at all rather than
    // hard-failing — nothing here is destructive either way, so a silent
    // fallback is enough.
    $notice_nonce_valid = isset($_GET['_wpnonce'])
      && wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_wpnonce'])), 'motionkit_notice');

    $error = isset($_GET['error']) ? sanitize_text_field(wp_unslash($_GET['error'])) : '';

    // Read once and cleared: the editor reported this site's connection gone (deleted from the MotionKit dashboard, or disconnected there), so the local one was cleared to match. It is stored state rather than a URL flag, so it needs no nonce, and it has to come before the return below: a visit from the admin menu carries no nonce, and that is the visit that must say why the site shows Connect again.
    // The same card as "Connected to MotionKit", without its editor button: there is no connection to open the editor with, and Agree and connect sits right below.
    if (\MotionKit\Auth\OAuthHandler::take_removed_notice()): ?>
      <div class="motionkit-notice motionkit-notice--success motionkit-notice--connected">
        <span class="motionkit-notice-icon">&#10004;</span>
        <div class="motionkit-notice-body">
          <strong class="motionkit-notice-title"><?php esc_html_e('This site was removed from your MotionKit dashboard', 'motionkit'); ?></strong>
          <span class="motionkit-notice-text"><?php esc_html_e('Connect again below to keep building animations.', 'motionkit'); ?></span>
        </div>
        <button type="button" class="motionkit-notice-close">&times;</button>
      </div>
    <?php endif;

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
    // A redirect's URL stays valid as long as its nonce, up to a day, so a refresh replays its flags. "Connected" and "Token verified" describe the connection as it stands, so they show only while it still does: a site deleted from the dashboard is cleared on that same refresh, and the "Connected to MotionKit" card used to sit above the Connect button.
    $still_connected = !empty(self::connection_info()['connected']);
    $just_connected = $still_connected && $notice_nonce_valid && isset($_GET['connected']) && is_string(sanitize_text_field(wp_unslash($_GET['connected'])));
    $just_disconnected = $notice_nonce_valid && isset($_GET['disconnected']) && is_string(sanitize_text_field(wp_unslash($_GET['disconnected'])));
    $license_refresh = $notice_nonce_valid && isset($_GET['license_refresh']) ? sanitize_key(wp_unslash($_GET['license_refresh'])) : '';
    $refresh_reason = $notice_nonce_valid && isset($_GET['reason']) ? sanitize_text_field(wp_unslash($_GET['reason'])) : '';
    $tools_deleted = $notice_nonce_valid && isset($_GET['tools_deleted']) ? (int) $_GET['tools_deleted'] : 0;
    $tools_all_deleted = $notice_nonce_valid && isset($_GET['tools_all_deleted']) ? (int) $_GET['tools_all_deleted'] : 0;
    $verify = $still_connected && $notice_nonce_valid && isset($_GET['verify']) ? sanitize_text_field(wp_unslash($_GET['verify'])) : '';
    $verify_reason = $notice_nonce_valid && isset($_GET['reason']) ? sanitize_text_field(wp_unslash($_GET['reason'])) : '';

    if ($error): ?>
      <div class="motionkit-notice motionkit-notice--error">
        <span class="motionkit-notice-icon">&#10060;</span>
        <?php echo esc_html($this->get_error_message($error)); ?>
        <button type="button" class="motionkit-notice-close">&times;</button>
      </div>
    <?php endif;

    if ($just_connected):
      // A card rather than a one-line strip: this is the first thing a new user sees after connecting, and it has to say who connected and what to do next.
      $connected_email = (string) self::connection_info()['email'];
      if ($connected_email !== '') {
        /* translators: %s: the MotionKit account email. */
        $connected_title = sprintf(__('Connected to MotionKit as %s', 'motionkit'), $connected_email);
      } else {
        $connected_title = __('Connected to MotionKit', 'motionkit');
      }
      ?>
      <div class="motionkit-notice motionkit-notice--success motionkit-notice--connected">
        <span class="motionkit-notice-icon">&#10004;</span>
        <div class="motionkit-notice-body">
          <strong class="motionkit-notice-title"><?php echo esc_html($connected_title); ?></strong>
          <span class="motionkit-notice-text"><?php esc_html_e('Animations you publish will play on this site. Open the editor on your homepage to build the first one.', 'motionkit'); ?></span>
        </div>
        <a href="<?php echo esc_url($this->get_editor_url()); ?>" class="motionkit-btn motionkit-btn--primary" target="_blank" rel="noopener">
          <?php esc_html_e('Open the editor on your homepage', 'motionkit'); ?>
        </a>
        <button type="button" class="motionkit-notice-close">&times;</button>
      </div>
    <?php endif;

    if ($just_disconnected): ?>
      <div class="motionkit-notice motionkit-notice--info">
        <span class="motionkit-notice-icon">&#8505;</span>
        <?php esc_html_e('Disconnected from MotionKit.', 'motionkit'); ?>
        <button type="button" class="motionkit-notice-close">&times;</button>
      </div>
    <?php endif;

    if ($license_refresh === 'ok'): ?>
      <div class="motionkit-notice motionkit-notice--success">
        <span class="motionkit-notice-icon">&#10004;</span>
        <?php esc_html_e('License status updated from your MotionKit account.', 'motionkit'); ?>
        <button type="button" class="motionkit-notice-close">&times;</button>
      </div>
    <?php elseif ($license_refresh === 'error' && $refresh_reason === 'site_not_launched'): ?>
      <div class="motionkit-notice motionkit-notice--info">
        <span class="motionkit-notice-icon">&#8505;</span>
        <?php esc_html_e('This site has not launched the MotionKit editor yet, so there is no license to check yet. Open the editor once (via "Launch MotionKit" or "Edit with MotionKit" on any page) to finish connecting this site.', 'motionkit'); ?>
        <button type="button" class="motionkit-notice-close">&times;</button>
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
        <button type="button" class="motionkit-notice-close">&times;</button>
      </div>
    <?php endif;

    if ($tools_deleted): ?>
      <div class="motionkit-notice motionkit-notice--success">
        <span class="motionkit-notice-icon">&#10004;</span>
        <?php esc_html_e('Animation data deleted.', 'motionkit'); ?>
        <button type="button" class="motionkit-notice-close">&times;</button>
      </div>
    <?php endif;

    if ($tools_all_deleted): ?>
      <div class="motionkit-notice motionkit-notice--success">
        <span class="motionkit-notice-icon">&#10004;</span>
        <?php
        // translators: %d is the number of animation records deleted.
        echo esc_html(sprintf(_n('Deleted %d animation record.', 'Deleted %d animation records.', $tools_all_deleted, 'motionkit'), $tools_all_deleted));
        ?>
        <button type="button" class="motionkit-notice-close">&times;</button>
      </div>
    <?php endif;

    if ($verify === 'valid'): ?>
      <div class="motionkit-notice motionkit-notice--success">
        <span class="motionkit-notice-icon">&#10004;</span>
        <?php esc_html_e('Token verified — your local token matches the MotionKit server.', 'motionkit'); ?>
        <button type="button" class="motionkit-notice-close">&times;</button>
      </div>
    <?php elseif ($verify === 'invalid'): ?>
      <div class="motionkit-notice motionkit-notice--error">
        <span class="motionkit-notice-icon">&#10060;</span>
        <?php esc_html_e('Token mismatch — try disconnecting and reconnecting.', 'motionkit'); ?>
        <button type="button" class="motionkit-notice-close">&times;</button>
      </div>
    <?php elseif ($verify === 'error'): ?>
      <div class="motionkit-notice motionkit-notice--error">
        <span class="motionkit-notice-icon">&#9888;</span>
        <?php
        // translators: %s is the reason the verification check failed.
        echo esc_html(sprintf(__('Verification failed: %s', 'motionkit'), $verify_reason ?: 'unknown error'));
        ?>
        <button type="button" class="motionkit-notice-close">&times;</button>
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
    // The explicit class_exists guard keeps the LicenseStatus calls below provably safe (and lets static analysis narrow the class) even though is_connected() is already false without the connector.
    if (!class_exists('\MotionKitConnector\Auth\LicenseStatus') || !self::is_connected()) {
      return;
    }

    $state = \MotionKitConnector\Auth\LicenseStatus::get_state();
    $valid = \MotionKitConnector\Auth\LicenseStatus::is_valid();

    ?>
    <div class="motionkit-card">
      <div class="motionkit-card-body">
        <h3 class="motionkit-card-title">
          <span class="motionkit-title-icon">&#127881;</span>
          <?php esc_html_e('License', 'motionkit'); ?>
        </h3>

        <?php if (\MotionKitConnector\Auth\LicenseStatus::is_indeterminate()): ?>
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

  private function render_connect_tab(): void
  {
    $info = self::connection_info();

    if ($info['connected']) {
      $this->render_connected_state($info);
      $this->render_license_tab();
    } else {
      $this->render_disconnected_state();
    }
  }

  private function render_connected_state(array $info): void
  {
    $disconnect_url = wp_nonce_url(
      admin_url('admin.php?page=motionkit-connect&tab=connect&motionkit_disconnect=1'),
      'motionkit_disconnect'
    );

    $verify_url = wp_nonce_url(
      admin_url('admin.php?page=motionkit-connect&tab=connect&motionkit_verify=1'),
      'motionkit_verify'
    );

    $switch_account_url = self::authorize_url(true);

    $editor_url = $this->get_editor_url();

    ?>
    <!-- Status Card -->
    <div class="motionkit-card">
      <div class="motionkit-card-header">
        <div class="motionkit-card-header-left">
          <span class="motionkit-title-icon">&#128279;</span>
          <h3 class="motionkit-card-title"><?php esc_html_e('Your MotionKit Account', 'motionkit'); ?></h3>
        </div>
        <span class="motionkit-badge motionkit-badge--success">&#9679; <?php esc_html_e('Connected', 'motionkit'); ?></span>
      </div>

      <div class="motionkit-card-body">
        <div class="motionkit-info-row">
          <div class="motionkit-info-content">
            <?php // A token response without an email names no account; the WordPress admin's email is not one, so nothing is shown rather than the wrong thing. ?>
            <span class="motionkit-info-label"><?php echo esc_html($info['email'] ? __("You're connected as", 'motionkit') : __("You're connected", 'motionkit')); ?></span>
            <?php if ($info['email']): ?>
              <strong class="motionkit-info-value"><?php echo esc_html($info['email']); ?></strong>
            <?php endif; ?>
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
             data-motionkit-confirm="<?php echo esc_attr__('Are you sure you want to disconnect?', 'motionkit'); ?>">
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
        <p class="motionkit-card-desc">
          <?php esc_html_e('Your site is connected. Open any post or page and click "Edit with MotionKit" - or use the button below to launch the editor directly.', 'motionkit'); ?>
        </p>
        <a href="<?php echo esc_url($editor_url); ?>"
           class="motionkit-btn motionkit-btn--primary motionkit-btn--split"
           target="_blank" rel="noopener">
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
      </div>
    </div>
    <?php
    if ($connector_state !== 'active') {
      $this->render_connector_cta();
    }
  }

  private function render_disconnected_state(): void
  {
    $authorize_url = self::authorize_url();
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
          <?php esc_html_e('Connect this WordPress site with the MotionKit visual editor to create, customize, and manage high-performance animations.', 'motionkit'); ?>
        </p>

        <!-- What connecting shares, in one line, with the detail a click away. The button is the consent: it says "Agree", and the editor's authorize page confirms the account before anything is stored. A checkbox used to gate a greyed-out button here without saying so, and it recorded nothing. -->
        <div class="motionkit-consent">
          <p class="motionkit-consent-line">
            <?php esc_html_e("MotionKit will save your animations in this site's database. No passwords are shared.", 'motionkit'); ?>
          </p>
          <details class="motionkit-consent-details">
            <summary><?php esc_html_e('What is shared?', 'motionkit'); ?></summary>
            <ul>
              <li><strong><?php esc_html_e('Your animations:', 'motionkit'); ?></strong> <?php esc_html_e('what you build in the editor is saved to this site, so it plays for visitors with nothing in between.', 'motionkit'); ?></li>
              <li><strong><?php esc_html_e('Page settings:', 'motionkit'); ?></strong> <?php esc_html_e('which pages have animations, and the triggers you set for them.', 'motionkit'); ?></li>
              <li><strong><?php esc_html_e('A preview key:', 'motionkit'); ?></strong> <?php esc_html_e('lets the editor show this site while you work. No admin password or user details are ever shared.', 'motionkit'); ?></li>
            </ul>
          </details>
        </div>

        <div class="motionkit-form-actions">
          <a href="<?php echo esc_url($authorize_url); ?>" id="motionkit-connect-btn" class="motionkit-btn motionkit-btn--primary">
            <span>&#128279;</span>
            <?php esc_html_e('Agree and connect', 'motionkit'); ?>
          </a>
        </div>
      </div>

      <div class="motionkit-card-footer">
        <h4 class="motionkit-footer-title"><?php esc_html_e('Safe & Private', 'motionkit'); ?></h4>
        <p class="motionkit-footer-desc">
          <?php esc_html_e('You can disconnect at any time, from this screen or from your MotionKit account.', 'motionkit'); ?>
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

  // ─── Animations Tab ─────────────────────────────────────────

  private function render_animations_tab(): void
  {
    $editor_url = $this->get_editor_url();
    ?>
    <div class="motionkit-animations-wrap">
      <!-- Top Action Bar -->
      <div class="motionkit-card motionkit-animations-header-card">
        <div class="motionkit-animations-header-content">
          <div>
            <h2 class="motionkit-animations-title">
              <span style="color:#f59e0b;">✨</span>
              <?php esc_html_e('Active Animations', 'motionkit'); ?>
            </h2>
            <p class="motionkit-card-desc" id="motionkit-animations-stat-summary">
              <?php esc_html_e('Every animation MotionKit runs on this site, with where it plays and whether it is live.', 'motionkit'); ?>
            </p>
          </div>
          <div class="motionkit-animations-top-actions">
            <a href="<?php echo esc_url($editor_url); ?>" target="_blank" rel="noopener" class="motionkit-btn motionkit-btn--primary">
              <span class="motionkit-btn-plus">+</span>
              <?php esc_html_e('Open MotionKit Editor', 'motionkit'); ?>
            </a>
          </div>
        </div>
      </div>

      <!-- Controls & Table Card -->
      <div class="motionkit-card">
        <div class="motionkit-card-header motionkit-animations-controls-header">
          <div class="motionkit-bulk-actions-wrap">
            <select id="motionkit-bulk-action-select" class="motionkit-select">
              <option value=""><?php esc_html_e('Bulk Actions', 'motionkit'); ?></option>
              <option value="publish"><?php esc_html_e('● Publish (Active)', 'motionkit'); ?></option>
              <option value="draft"><?php esc_html_e('○ Set as Draft', 'motionkit'); ?></option>
              <option value="toggle_status"><?php esc_html_e('⏻ Toggle Status (Active/Draft)', 'motionkit'); ?></option>
              <option value="delete"><?php esc_html_e('🗑️ Delete', 'motionkit'); ?></option>
            </select>
            <button type="button" id="motionkit-bulk-apply-btn" class="motionkit-btn motionkit-btn--outline motionkit-btn--sm" disabled>
              <?php esc_html_e('Apply', 'motionkit'); ?>
            </button>
          </div>

          <div class="motionkit-filter-search-wrap">
            <!-- Filled by admin-animations.js with every page that carries an animation, grouped by what the page is. -->
            <select id="motionkit-page-filter" class="motionkit-select" aria-label="<?php esc_attr_e('Page', 'motionkit'); ?>">
              <option value=""><?php esc_html_e('All pages', 'motionkit'); ?></option>
            </select>
          </div>
        </div>

        <div class="motionkit-card-body motionkit-card-body--flush">
          <div class="motionkit-animations-table-wrap motionkit-table-scroll" id="motionkit-animations-scroll">
            <table class="motionkit-animations-table">
              <thead>
                <tr>
                  <th class="motionkit-animations-col-check"><input type="checkbox" id="motionkit-select-all" aria-label="<?php esc_attr_e('Select All', 'motionkit'); ?>"></th>
                  <th><?php esc_html_e('Title', 'motionkit'); ?></th>
                  <th class="motionkit-animations-col-status"><?php esc_html_e('Status', 'motionkit'); ?></th>
                  <th class="motionkit-animations-col-actions"><?php esc_html_e('Actions', 'motionkit'); ?></th>
                </tr>
              </thead>
              <tbody id="motionkit-animations-tbody">
                <tr>
                  <td colspan="4" class="motionkit-animations-empty"><?php esc_html_e('Loading animations...', 'motionkit'); ?></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="motionkit-table-footer" id="motionkit-animations-footer" hidden>
            <span id="motionkit-animations-count"></span>
            <button type="button" class="motionkit-btn motionkit-btn--outline motionkit-btn--sm" id="motionkit-animations-more" hidden><?php esc_html_e('Load more', 'motionkit'); ?></button>
          </div>
        </div>
      </div>

      <!-- Details popup: one row's target, page and type, with its actions. Filled by admin-animations.js. -->
      <div class="motionkit-modal motionkit-details-modal" id="motionkit-anim-modal" hidden role="dialog" aria-modal="true" aria-labelledby="motionkit-anim-modal-title">
        <div class="motionkit-modal-backdrop" data-details-close></div>
        <div class="motionkit-modal-box motionkit-details-modal-box">
          <button type="button" class="motionkit-details-close" data-details-close aria-label="<?php esc_attr_e('Close', 'motionkit'); ?>">&times;</button>
          <h3 class="motionkit-modal-title" id="motionkit-anim-modal-title"></h3>
          <code class="motionkit-details-id" id="motionkit-anim-modal-id"></code>
          <dl class="motionkit-details">
            <dt><?php esc_html_e('Status', 'motionkit'); ?></dt>
            <dd id="motionkit-anim-modal-status"></dd>
            <dt><?php esc_html_e('Type', 'motionkit'); ?></dt>
            <dd id="motionkit-anim-modal-type"></dd>
            <dt><?php esc_html_e('Target element', 'motionkit'); ?></dt>
            <dd><code class="motionkit-details-code" id="motionkit-anim-modal-target"></code></dd>
            <dt><?php esc_html_e('Location', 'motionkit'); ?></dt>
            <dd id="motionkit-anim-modal-location"></dd>
          </dl>
          <div class="motionkit-modal-actions motionkit-details-actions">
            <button type="button" class="motionkit-btn motionkit-btn--outline motionkit-btn--danger motionkit-details-destructive" id="motionkit-anim-modal-delete"><?php esc_html_e('Delete', 'motionkit'); ?></button>
            <button type="button" class="motionkit-btn motionkit-btn--outline" id="motionkit-anim-modal-toggle"></button>
            <a class="motionkit-btn motionkit-btn--primary" id="motionkit-anim-modal-edit" href="#" target="_blank" rel="noopener"><?php esc_html_e('Edit in editor', 'motionkit'); ?></a>
          </div>
        </div>
      </div>
    </div>
    <?php
  }

  // ─── Tools Tab ───────────────────────────────────────────────

  private function render_tools_tab(): void
  {
    ?>
    <!-- Animated pages: one row per page, term or option that carries a bucket -->
    <div class="motionkit-card">
      <div class="motionkit-card-header motionkit-tools-card-header">
        <div class="motionkit-card-header-left">
          <span class="motionkit-title-icon">&#128196;</span>
          <h3 class="motionkit-card-title"><?php esc_html_e('Animated Pages', 'motionkit'); ?></h3>
        </div>
        <input type="search" class="motionkit-input motionkit-tools-search" id="motionkit-tools-search"
               placeholder="<?php esc_attr_e('Search by title or key...', 'motionkit'); ?>"
               aria-label="<?php esc_attr_e('Search by title or key', 'motionkit'); ?>">
      </div>
      <div class="motionkit-card-body motionkit-card-body--flush">
        <div class="motionkit-tools-table-wrap motionkit-table-scroll" id="motionkit-tools-scroll">
          <table class="motionkit-tools-table">
            <thead>
              <tr>
                <th><?php esc_html_e('Title', 'motionkit'); ?></th>
                <th class="motionkit-tools-col-type"><?php esc_html_e('Type', 'motionkit'); ?></th>
                <th class="motionkit-tools-col-actions"><?php esc_html_e('Actions', 'motionkit'); ?></th>
              </tr>
            </thead>
            <tbody id="motionkit-tools-tbody">
              <tr><td colspan="3" class="motionkit-tools-empty"><?php esc_html_e('Loading...', 'motionkit'); ?></td></tr>
            </tbody>
          </table>
        </div>
        <div class="motionkit-table-footer" id="motionkit-tools-footer" hidden>
          <span id="motionkit-tools-count"></span>
          <button type="button" class="motionkit-btn motionkit-btn--outline motionkit-btn--sm" id="motionkit-tools-more" hidden><?php esc_html_e('Load more', 'motionkit'); ?></button>
        </div>
      </div>
    </div>

    <!-- Danger Zone: last, under the list, where a destructive action belongs -->
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

    <!-- Details popup: one record's type, modified time and storage, with its actions. Filled by admin-tools.js. -->
    <div class="motionkit-modal motionkit-details-modal" id="motionkit-tools-modal" hidden role="dialog" aria-modal="true" aria-labelledby="motionkit-tools-modal-title">
      <div class="motionkit-modal-backdrop" data-details-close></div>
      <div class="motionkit-modal-box motionkit-details-modal-box">
        <button type="button" class="motionkit-details-close" data-details-close aria-label="<?php esc_attr_e('Close', 'motionkit'); ?>">&times;</button>
        <h3 class="motionkit-modal-title" id="motionkit-tools-modal-title"></h3>
        <code class="motionkit-details-id" id="motionkit-tools-modal-key"></code>
        <dl class="motionkit-details">
          <dt><?php esc_html_e('Type', 'motionkit'); ?></dt>
          <dd id="motionkit-tools-modal-type"></dd>
          <dt><?php esc_html_e('Modified', 'motionkit'); ?></dt>
          <dd id="motionkit-tools-modal-modified"></dd>
          <dt><?php esc_html_e('Stored as', 'motionkit'); ?></dt>
          <dd><code class="motionkit-details-code" id="motionkit-tools-modal-store"></code></dd>
        </dl>
        <div class="motionkit-modal-actions motionkit-details-actions">
          <button type="button" class="motionkit-btn motionkit-btn--outline motionkit-btn--danger motionkit-details-destructive" id="motionkit-tools-modal-delete"><?php esc_html_e('Delete data', 'motionkit'); ?></button>
          <a class="motionkit-btn motionkit-btn--outline" id="motionkit-tools-modal-animations" href="#"><?php esc_html_e('Animations', 'motionkit'); ?></a>
          <a class="motionkit-btn motionkit-btn--outline" id="motionkit-tools-modal-preview" href="#" target="_blank" rel="noopener"><?php esc_html_e('Preview', 'motionkit'); ?></a>
          <a class="motionkit-btn motionkit-btn--primary" id="motionkit-tools-modal-edit" href="#" target="_blank" rel="noopener"><?php esc_html_e('Edit in editor', 'motionkit'); ?></a>
        </div>
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
