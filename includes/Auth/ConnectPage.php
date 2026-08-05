<?php

namespace MotionKit\Auth;

/**
 * Admin Dashboard Page
 *
 * WordPress admin page with tabbed layout: Connect, Tools, License, Help.
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
    add_action('admin_head', [$this, 'print_menu_icon_style']);
    add_action('admin_init', [$this, 'handle_tools_actions']);
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

    $active_tab = isset($_GET['tab']) ? sanitize_text_field(wp_unslash($_GET['tab'])) : 'connect';
    if ($active_tab === 'tools') {
      wp_enqueue_style(
        'motionkit-admin-tools',
        plugins_url('assets/build/admin-tools.css', MOTIONKIT_PLUGIN_FILE),
        ['motionkit-admin'],
        $version
      );
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

  public function print_menu_icon_style(): void
  {
    echo '<style>#adminmenu #toplevel_page_motionkit-connect .wp-menu-image img{width:23px;height:23px;padding:7px 0 0;}</style>';
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

    $active_tab = isset($_GET['tab']) ? sanitize_text_field(wp_unslash($_GET['tab'])) : 'connect';
    $current_user = wp_get_current_user();
    $connection_info = OAuthHandler::get_connection_info();
    $user_email = !empty($connection_info['email']) ? $connection_info['email'] : $current_user->user_email;

    $tabs = [
      'connect' => ['label' => __('Connect', 'motionkit'), 'icon' => '&#128279;'],
      'tools'   => ['label' => __('Tools', 'motionkit'),   'icon' => '&#128295;'],
    ];

    $tabs['help'] = ['label' => __('Help', 'motionkit'), 'icon' => '&#9432;'];

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
          <span class="motionkit-header-title">MotionKit</span>
        </div>
        <div class="motionkit-header-right">
          <span class="motionkit-header-email"><?php echo esc_html($user_email); ?></span>
          <div class="motionkit-header-avatar">
            <?php echo get_avatar($current_user->ID, 32, '', '', ['class' => 'motionkit-avatar-img']); ?>
          </div>
        </div>
      </div>

      <!-- Layout: Sidebar + Content -->
      <div class="motionkit-layout">

        <!-- Sidebar -->
        <div class="motionkit-sidebar">
          <nav class="motionkit-sidebar-nav">
            <?php foreach ($tabs as $tab_key => $tab): ?>
              <a href="<?php echo esc_url(admin_url('admin.php?page=motionkit-connect&tab=' . $tab_key)); ?>"
                 class="motionkit-sidebar-link <?php echo $active_tab === $tab_key ? 'motionkit-sidebar-link--active' : ''; ?>">
                <span class="motionkit-sidebar-icon"><?php echo $tab['icon']; ?></span>
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
            case 'help':
              $this->render_help_tab();
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

  private function render_notices(): void
  {
    $error = isset($_GET['error']) ? sanitize_text_field(wp_unslash($_GET['error'])) : '';
    $just_connected = isset($_GET['connected']);
    $just_disconnected = isset($_GET['disconnected']);
    $license_refresh = isset($_GET['license_refresh']) ? sanitize_key(wp_unslash($_GET['license_refresh'])) : '';
    $refresh_reason = isset($_GET['reason']) ? sanitize_text_field(wp_unslash($_GET['reason'])) : '';
    $tools_deleted = isset($_GET['tools_deleted']) ? (int) $_GET['tools_deleted'] : 0;
    $tools_all_deleted = isset($_GET['tools_all_deleted']) ? (int) $_GET['tools_all_deleted'] : 0;
    $verify = isset($_GET['verify']) ? sanitize_text_field(wp_unslash($_GET['verify'])) : '';
    $verify_reason = isset($_GET['reason']) ? sanitize_text_field(wp_unslash($_GET['reason'])) : '';

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
        <?php echo esc_html(sprintf(_n('Deleted %d animation record.', 'Deleted %d animation records.', $tools_all_deleted, 'motionkit'), $tools_all_deleted)); ?>
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
        <?php echo esc_html(sprintf(__('Verification failed: %s', 'motionkit'), $verify_reason ?: 'unknown error')); ?>
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
      $this->render_disconnected_state($current_user);
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
           target="_blank">
          <span class="motionkit-btn__text" data-text="<?php esc_attr_e('Launch Motionkit', 'motionkit'); ?>">
            <?php
              $text = __('Launch Motionkit', 'motionkit');
              $chars = preg_split('//u', $text, -1, PREG_SPLIT_NO_EMPTY);
              foreach ($chars as $i => $char) {
                $c = $char === ' ' ? '&nbsp;' : esc_html($char);
                printf('<span class="motionkit-btn__char" style="transition-delay:%.2fs">%s</span>', $i * 0.02, $c);
              }
            ?>
          </span>
        </a>
      </div>
    </div>
    <?php
  }

  private function render_disconnected_state(\WP_User $current_user): void
  {
    $authorize_url = $this->oauth->get_authorize_url();

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
        <a href="<?php echo esc_url($authorize_url); ?>" class="motionkit-btn motionkit-btn--primary">
          <span>&#128279;</span>
          <?php esc_html_e('Connect To MotionKit', 'motionkit'); ?>
        </a>
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

  // ─── Help Tab ────────────────────────────────────────────────

  private function render_help_tab(): void
  {
    ?>
    <!-- Support Banner -->
    <div class="motionkit-support-banner">
      <div class="motionkit-support-banner-content">
        <h3 class="motionkit-support-banner-title">
          <span>&#9889;</span> <?php esc_html_e('Support', 'motionkit'); ?>
        </h3>
        <p class="motionkit-support-banner-desc">
          <?php esc_html_e('Get quick assistance from our dedicated support team', 'motionkit'); ?>
        </p>
      </div>
      <a href="https://motionkit.io/support" target="_blank" class="motionkit-btn motionkit-btn--primary">
        <?php esc_html_e('Get Support', 'motionkit'); ?>
      </a>
    </div>

    <!-- Community + Documentation cards -->
    <div class="motionkit-help-grid">
      <div class="motionkit-help-card">
        <div class="motionkit-help-card-img">
          <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
            <circle cx="35" cy="40" r="16" fill="#BFDBFE"/>
            <circle cx="60" cy="35" r="18" fill="#93C5FD"/>
            <circle cx="85" cy="40" r="16" fill="#BFDBFE"/>
            <circle cx="48" cy="50" r="14" fill="#DBEAFE"/>
            <circle cx="72" cy="50" r="14" fill="#DBEAFE"/>
          </svg>
        </div>
        <h4 class="motionkit-help-card-title"><?php esc_html_e('Community', 'motionkit'); ?></h4>
        <p class="motionkit-help-card-desc">
          <?php esc_html_e('Get quick assistance from our dedicated support team whenever you need help', 'motionkit'); ?>
        </p>
        <a href="https://motionkit.io/community" target="_blank" class="motionkit-btn motionkit-btn--primary">
          <?php esc_html_e('Join Community', 'motionkit'); ?>
        </a>
      </div>

      <div class="motionkit-help-card">
        <div class="motionkit-help-card-img">
          <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
            <rect x="30" y="10" width="50" height="60" rx="4" fill="#FDE68A" stroke="#F59E0B" stroke-width="1.5"/>
            <rect x="40" y="15" width="50" height="60" rx="4" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
            <line x1="48" y1="30" x2="82" y2="30" stroke="#F59E0B" stroke-width="1.5"/>
            <line x1="48" y1="40" x2="75" y2="40" stroke="#FCD34D" stroke-width="1.5"/>
            <line x1="48" y1="50" x2="78" y2="50" stroke="#FCD34D" stroke-width="1.5"/>
            <circle cx="80" cy="60" r="10" fill="#34D399" stroke="#fff" stroke-width="2"/>
            <polyline points="76,60 79,63 85,57" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h4 class="motionkit-help-card-title"><?php esc_html_e('Documentation', 'motionkit'); ?></h4>
        <p class="motionkit-help-card-desc">
          <?php esc_html_e('Explore step by step guides and tutorials to get the most out of the plugin', 'motionkit'); ?>
        </p>
        <a href="https://motionkit.io/docs" target="_blank" class="motionkit-btn motionkit-btn--primary">
          <?php esc_html_e('Read Documents', 'motionkit'); ?>
        </a>
      </div>
    </div>

    <?php
  }


  // ─── Helpers ─────────────────────────────────────────────────

  private function get_error_message(string $error): string
  {
    $messages = [
      'invalid_state'         => __('Security verification failed. Please try again.', 'motionkit'),
      'token_exchange_failed' => __('Could not complete the connection. Please try again.', 'motionkit'),
      'limit_exceeded'        => __('Site limit reached. Upgrade your plan to connect more sites.', 'motionkit'),
      'unauthorized'          => __('You do not have permission to perform this action.', 'motionkit'),
      'nonce_failed'          => __('Security check failed. Please try again.', 'motionkit'),
    ];

    // Check for server-provided message in the URL.
    $server_msg = isset($_GET['error_message']) ? sanitize_text_field(wp_unslash($_GET['error_message'])) : '';
    if ($server_msg) {
      return $server_msg;
    }

    return $messages[$error] ?? __('An unknown error occurred. Please try again.', 'motionkit');
  }

  // ─── Tools Tab ───────────────────────────────────────────────

  private const TOOLS_OPTION_PREFIX = 'mkit_pg_animation_';
  private const TOOLS_SETTINGS_PREFIX = 'mkit_pg_settings_';
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
    if (!wp_verify_nonce($_POST['_wpnonce'] ?? '', 'motionkit_tools_nonce')) {
      wp_safe_redirect(admin_url('admin.php?page=motionkit-connect&tab=tools&error=nonce_failed'));
      exit;
    }

    $action = sanitize_text_field(wp_unslash($_POST['motionkit_tools_action']));

    if ($action === 'delete_one') {
      $store = sanitize_text_field(wp_unslash($_POST['store_type'] ?? ''));
      $option = sanitize_text_field(wp_unslash($_POST['option_key'] ?? ''));
      $id = isset($_POST['object_id']) ? (int) $_POST['object_id'] : 0;
      $this->delete_animation_record($store, $option, $id);
      wp_safe_redirect(admin_url('admin.php?page=motionkit-connect&tab=tools&tools_deleted=1'));
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

  private function delete_animation_record(string $store_type, string $option, int $id = 0): bool
  {
    $deleted = $this->delete_keyed_record($store_type, $option, $id);

    // Cascade: when we remove mkit_pg_animation_<type>, also remove the
    // matching mkit_pg_settings_<type> on the same store/id. Settings are
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

  // Wipe every mkit_pg_settings_* row across post_meta/term_meta/options.
  // Used by bulk delete to catch orphans whose animation row was already gone.
  private function delete_all_settings_records(): void
  {
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
    $ajax_nonce = wp_create_nonce('motionkit_tools_ajax');
    $ajax_url = admin_url('admin-ajax.php');
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

    <script>
    (function(){
      const ajaxUrl = <?php echo wp_json_encode($ajax_url); ?>;
      const nonce   = <?php echo wp_json_encode($ajax_nonce); ?>;
      const strings = {
        noResults: <?php echo wp_json_encode(__('No animation data found.', 'motionkit')); ?>,
        edit:      <?php echo wp_json_encode(__('Edit', 'motionkit')); ?>,
        preview:   <?php echo wp_json_encode(__('Preview', 'motionkit')); ?>,
        del:       <?php echo wp_json_encode(__('Delete', 'motionkit')); ?>,
        confirm:   <?php echo wp_json_encode(__('Delete this animation data?', 'motionkit')); ?>,
        prev:      <?php echo wp_json_encode(__('Prev', 'motionkit')); ?>,
        next:      <?php echo wp_json_encode(__('Next', 'motionkit')); ?>,
        deleting:  <?php echo wp_json_encode(__('Deleting...', 'motionkit')); ?>,
        done:      <?php echo wp_json_encode(__('Done!', 'motionkit')); ?>,
      };

      let state = { page: 1, search: '', debounce: null };

      function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

      function render(data){
        const tbody = document.getElementById('motionkit-tools-tbody');
        if (!data.rows.length) {
          tbody.innerHTML = '<tr><td colspan="4" class="motionkit-tools-empty">'+esc(strings.noResults)+'</td></tr>';
        } else {
          tbody.innerHTML = data.rows.map(r=>{
            const edit = r.edit_url ? '<a href="'+esc(r.edit_url)+'" target="_blank" class="motionkit-btn motionkit-btn--primary motionkit-btn--sm">'+esc(strings.edit)+'</a>' : '';
            const preview = r.permalink ? '<a href="'+esc(r.permalink)+'" target="_blank" rel="noopener" class="motionkit-btn motionkit-btn--outline motionkit-btn--sm">'+esc(strings.preview)+'</a>' : '';
            const del  = '<button type="button" class="motionkit-btn motionkit-btn--outline motionkit-btn--danger motionkit-btn--sm motionkit-del-row" data-store="'+esc(r.store_type)+'" data-option="'+esc(r.option)+'" data-id="'+esc(r.id)+'">'+esc(strings.del)+'</button>';
            return '<tr>'+
              '<td><strong>'+esc(r.title)+'</strong><br><small style="color:#6b7280;">'+esc(r.option)+'</small></td>'+
              '<td><span class="motionkit-tools-type">'+esc(r.type_label)+'</span></td>'+
              '<td>'+esc(r.modified || '—')+'</td>'+
              '<td><div class="motionkit-tools-actions">'+edit+preview+del+'</div></td>'+
            '</tr>';
          }).join('');
        }
        // pagination
        const pg = document.getElementById('motionkit-tools-pagination');
        if (data.total_pages <= 1) { pg.innerHTML = ''; return; }
        let html = '';
        html += '<button class="motionkit-page-btn" '+(data.page<=1?'disabled':'')+' data-page="'+(data.page-1)+'">'+esc(strings.prev)+'</button>';
        for (let i=1;i<=data.total_pages;i++){
          if (i===1 || i===data.total_pages || Math.abs(i-data.page)<=2){
            html += '<button class="motionkit-page-btn '+(i===data.page?'motionkit-page-btn--active':'')+'" data-page="'+i+'">'+i+'</button>';
          } else if (Math.abs(i-data.page)===3){
            html += '<span class="motionkit-page-btn" style="border:0;background:transparent;">…</span>';
          }
        }
        html += '<button class="motionkit-page-btn" '+(data.page>=data.total_pages?'disabled':'')+' data-page="'+(data.page+1)+'">'+esc(strings.next)+'</button>';
        pg.innerHTML = html;
      }

      function fetchList(){
        const fd = new FormData();
        fd.append('action','motionkit_tools_list');
        fd.append('nonce', nonce);
        fd.append('page', state.page);
        fd.append('search', state.search);
        fetch(ajaxUrl,{method:'POST',credentials:'same-origin',body:fd})
          .then(r=>r.json()).then(j=>{ if(j && j.success) render(j.data); });
      }

      // search — handle typing, clearing via "x", and Escape
      const searchInput = document.getElementById('motionkit-tools-search');
      const runSearch = (value, immediate) => {
        clearTimeout(state.debounce);
        const apply = () => { state.search = value; state.page = 1; fetchList(); };
        if (immediate) apply(); else state.debounce = setTimeout(apply, 300);
      };
      searchInput.addEventListener('input', e => runSearch(e.target.value, false));
      searchInput.addEventListener('search', e => runSearch(e.target.value, true));
      searchInput.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.target.value = ''; runSearch('', true); }
      });

      // pagination + per-row delete (delegated)
      document.addEventListener('click', e=>{
        const pbtn = e.target.closest('.motionkit-page-btn[data-page]');
        if (pbtn && !pbtn.disabled) { state.page = parseInt(pbtn.dataset.page,10)||1; fetchList(); return; }

        const drow = e.target.closest('.motionkit-del-row');
        if (drow) {
          if (!confirm(strings.confirm)) return;
          const f = document.getElementById('motionkit-tools-delete-form');
          f.querySelector('[name=store_type]').value = drow.dataset.store;
          f.querySelector('[name=option_key]').value = drow.dataset.option;
          f.querySelector('[name=object_id]').value  = drow.dataset.id;
          f.submit();
        }
      });

      // delete all flow
      const modal = document.getElementById('motionkit-tools-confirm');
      const progress = document.getElementById('motionkit-tools-progress');
      const fill = document.getElementById('motionkit-progress-fill');
      const label = document.getElementById('motionkit-progress-label');
      const confirmBtn = document.getElementById('motionkit-tools-confirm-btn');
      const cancelBtn = document.getElementById('motionkit-tools-cancel');

      document.getElementById('motionkit-tools-delete-all').addEventListener('click', ()=>{
        progress.hidden = true;
        fill.style.width = '0%';
        label.textContent = '0 / 0';
        confirmBtn.disabled = false;
        cancelBtn.disabled = false;
        modal.hidden = false;
      });
      cancelBtn.addEventListener('click', ()=>{ modal.hidden = true; });

      async function runBulk(){
        confirmBtn.disabled = true;
        cancelBtn.disabled = true;
        progress.hidden = false;
        let offset = 0;
        let totalDeleted = 0;
        let total = 0;
        while (true) {
          const fd = new FormData();
          fd.append('action','motionkit_tools_bulk_delete');
          fd.append('nonce', nonce);
          fd.append('offset', offset);
          const r = await fetch(ajaxUrl,{method:'POST',credentials:'same-origin',body:fd});
          const j = await r.json();
          if (!j || !j.success) { label.textContent = 'Error'; return; }
          totalDeleted += j.data.deleted;
          total = j.data.total;
          const pct = total ? Math.min(100, Math.round((j.data.processed/total)*100)) : 100;
          fill.style.width = pct + '%';
          label.textContent = j.data.processed + ' / ' + total;
          if (j.data.done) break;
          offset = j.data.next_offset;
        }
        label.textContent = strings.done + ' (' + totalDeleted + ')';
        setTimeout(()=>{
          window.location.href = <?php echo wp_json_encode(admin_url('admin.php?page=motionkit-connect&tab=tools')); ?> + '&tools_all_deleted=' + totalDeleted;
        }, 600);
      }
      confirmBtn.addEventListener('click', runBulk);

      // initial load
      fetchList();
    })();
    </script>
    <?php
  }

}
