<?php

namespace WcfAnimationBuilder\Auth;

/**
 * Admin Dashboard Page
 *
 * WordPress admin page with tabbed layout: Connect, Tools, License, Help.
 *
 * Menu: MotionKit
 * URL:  /wp-admin/admin.php?page=motionkit-connect
 *
 * @package WcfAnimationBuilder
 * @since 1.1.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

final class ConnectPage
{
  private const LICENSE_OPTION = 'motionkit_license_key';
  private const LICENSE_STATUS_OPTION = 'motionkit_license_status';

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
    add_action('admin_init', [$this, 'handle_license_activation']);
    add_action('admin_init', [$this, 'handle_tools_actions']);
    add_action('wp_ajax_motionkit_tools_list', [$this, 'ajax_tools_list']);
    add_action('wp_ajax_motionkit_tools_bulk_delete', [$this, 'ajax_tools_bulk_delete']);
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
    $query_args = ['site' => $page_url, 'platform' => 'wordpress'];

    if (OAuthHandler::is_connected()) {
      $query_args['token'] = JwtTokenManager::generate($page_url);
    }

    $base_url = apply_filters('motionkit/editor/url', 'https://editor.motionkit.io/');
    return add_query_arg($query_args, $base_url);
  }

  // ─── License Activation Handler ──────────────────────────────

  public function handle_license_activation(): void
  {
    if (!isset($_POST['motionkit_license_action'])) {
      return;
    }

    if (!current_user_can('manage_options')) {
      return;
    }

    if (!wp_verify_nonce($_POST['_wpnonce'] ?? '', 'motionkit_license_nonce')) {
      wp_safe_redirect(admin_url('admin.php?page=motionkit-connect&tab=license&error=nonce_failed'));
      exit;
    }

    $action = sanitize_text_field($_POST['motionkit_license_action']);

    if ($action === 'activate') {
      $license_key = sanitize_text_field(wp_unslash($_POST['license_key'] ?? ''));

      if (empty($license_key)) {
        wp_safe_redirect(admin_url('admin.php?page=motionkit-connect&tab=license&error=empty_key'));
        exit;
      }

      update_option(self::LICENSE_OPTION, $license_key);
      update_option(self::LICENSE_STATUS_OPTION, 'active');

      wp_safe_redirect(admin_url('admin.php?page=motionkit-connect&tab=license&license_activated=1'));
      exit;
    }

    if ($action === 'deactivate') {
      delete_option(self::LICENSE_OPTION);
      delete_option(self::LICENSE_STATUS_OPTION);

      wp_safe_redirect(admin_url('admin.php?page=motionkit-connect&tab=license&license_deactivated=1'));
      exit;
    }
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
      'license' => ['label' => __('License', 'motionkit'), 'icon' => '&#128196;'],
      'tools'   => ['label' => __('Tools', 'motionkit'),   'icon' => '&#128295;'],
    ];

    $tabs['help'] = ['label' => __('Help', 'motionkit'), 'icon' => '&#9432;'];

    ?>
    <div class="mk-page">

      <!-- Header -->
      <div class="mk-header">
        <div class="mk-header-left">
          <div class="mk-header-logo">
            <svg width="30" height="30" viewBox="0 0 245 245" fill="none">
              <path d="M2.7 87.7C2.7 40.7 40.7 2.7 87.7 2.7h69c47 0 85 38 85 85v69c0 47-38 85-85 85h-69c-47 0-85-38-85-85v-69z" fill="url(#mk_hdr_g)"/>
              <path d="M66.4 71.9c0-10.5 13.2-15.8 20.9-8.4l51.9 50.3c4.8 4.6 4.8 12.1 0 16.7l-51.9 50.3c-7.7 7.5-20.9 2.2-20.9-8.3V71.9z" fill="#BFD8FE" stroke="#5EA1EC" stroke-width=".7"/>
              <path d="M157.5 63.5c7.5-7.5 20.2-2.2 20.2 8.4v100.6c0 10.6-12.8 15.8-20.2 8.4l-50.3-50.3c-4.6-4.6-4.6-12.1 0-16.8l50.3-50.3z" fill="white" stroke="#5DA1EC" stroke-width=".7"/>
              <defs><radialGradient id="mk_hdr_g" cx="0" cy="0" r="1" gradientTransform="matrix(-62.2 127 -127 -62.2 122.2 122.2)" gradientUnits="userSpaceOnUse"><stop stop-color="#1C7E92"/><stop offset="1" stop-color="#599BFD"/></radialGradient></defs>
            </svg>
          </div>
          <span class="mk-header-title">MotionKit</span>
        </div>
        <div class="mk-header-right">
          <span class="mk-header-email"><?php echo esc_html($user_email); ?></span>
          <div class="mk-header-avatar">
            <?php echo get_avatar($current_user->ID, 32, '', '', ['class' => 'mk-avatar-img']); ?>
          </div>
        </div>
      </div>

      <!-- Layout: Sidebar + Content -->
      <div class="mk-layout">

        <!-- Sidebar -->
        <div class="mk-sidebar">
          <nav class="mk-sidebar-nav">
            <?php foreach ($tabs as $tab_key => $tab): ?>
              <a href="<?php echo esc_url(admin_url('admin.php?page=motionkit-connect&tab=' . $tab_key)); ?>"
                 class="mk-sidebar-link <?php echo $active_tab === $tab_key ? 'mk-sidebar-link--active' : ''; ?>">
                <span class="mk-sidebar-icon"><?php echo $tab['icon']; ?></span>
                <?php echo esc_html($tab['label']); ?>
              </a>
            <?php endforeach; ?>
          </nav>
        </div>

        <!-- Content -->
        <div class="mk-content">
          <?php $this->render_notices(); ?>

          <?php
          switch ($active_tab) {
            case 'tools':
              $this->render_tools_tab();
              break;
            case 'license':
              $this->render_license_tab();
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
    $license_activated = isset($_GET['license_activated']);
    $license_deactivated = isset($_GET['license_deactivated']);
    $tools_deleted = isset($_GET['tools_deleted']) ? (int) $_GET['tools_deleted'] : 0;
    $tools_all_deleted = isset($_GET['tools_all_deleted']) ? (int) $_GET['tools_all_deleted'] : 0;
    $verify = isset($_GET['verify']) ? sanitize_text_field(wp_unslash($_GET['verify'])) : '';
    $verify_reason = isset($_GET['reason']) ? sanitize_text_field(wp_unslash($_GET['reason'])) : '';

    if ($error): ?>
      <div class="mk-notice mk-notice--error">
        <span class="mk-notice-icon">&#10060;</span>
        <?php echo esc_html($this->get_error_message($error)); ?>
        <button class="mk-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php endif;

    if ($just_connected): ?>
      <div class="mk-notice mk-notice--success">
        <span class="mk-notice-icon">&#10004;</span>
        <?php esc_html_e('Connected Successfully', 'motionkit'); ?>
        <button class="mk-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php endif;

    if ($just_disconnected): ?>
      <div class="mk-notice mk-notice--info">
        <span class="mk-notice-icon">&#8505;</span>
        <?php esc_html_e('Disconnected from MotionKit.', 'motionkit'); ?>
        <button class="mk-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php endif;

    if ($license_activated): ?>
      <div class="mk-notice mk-notice--success">
        <span class="mk-notice-icon">&#10004;</span>
        <?php esc_html_e('License activated successfully.', 'motionkit'); ?>
        <button class="mk-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php endif;

    if ($license_deactivated): ?>
      <div class="mk-notice mk-notice--info">
        <span class="mk-notice-icon">&#8505;</span>
        <?php esc_html_e('License deactivated.', 'motionkit'); ?>
        <button class="mk-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php endif;

    if ($tools_deleted): ?>
      <div class="mk-notice mk-notice--success">
        <span class="mk-notice-icon">&#10004;</span>
        <?php esc_html_e('Animation data deleted.', 'motionkit'); ?>
        <button class="mk-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php endif;

    if ($tools_all_deleted): ?>
      <div class="mk-notice mk-notice--success">
        <span class="mk-notice-icon">&#10004;</span>
        <?php echo esc_html(sprintf(_n('Deleted %d animation record.', 'Deleted %d animation records.', $tools_all_deleted, 'motionkit'), $tools_all_deleted)); ?>
        <button class="mk-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php endif;

    if ($verify === 'valid'): ?>
      <div class="mk-notice mk-notice--success">
        <span class="mk-notice-icon">&#10004;</span>
        <?php esc_html_e('Token verified — your local token matches the MotionKit server.', 'motionkit'); ?>
        <button class="mk-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php elseif ($verify === 'invalid'): ?>
      <div class="mk-notice mk-notice--error">
        <span class="mk-notice-icon">&#10060;</span>
        <?php esc_html_e('Token mismatch — try disconnecting and reconnecting.', 'motionkit'); ?>
        <button class="mk-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php elseif ($verify === 'error'): ?>
      <div class="mk-notice mk-notice--error">
        <span class="mk-notice-icon">&#9888;</span>
        <?php echo esc_html(sprintf(__('Verification failed: %s', 'motionkit'), $verify_reason ?: 'unknown error')); ?>
        <button class="mk-notice-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    <?php endif;
  }

  // ─── License Tab ─────────────────────────────────────────────

  private function render_license_tab(): void
  {
    $license_key = get_option(self::LICENSE_OPTION, '');
    $license_status = get_option(self::LICENSE_STATUS_OPTION, '');
    $has_license = !empty($license_key) && $license_status === 'active';
    $authorize_url = $this->oauth->get_authorize_url();

    ?>
    <div class="mk-card">
      <div class="mk-card-body">
        <?php if ($has_license): ?>
          <!-- Active License -->
          <div class="mk-license-active">
            <h3 class="mk-card-title">
              <span class="mk-title-icon">&#127881;</span>
              <?php esc_html_e('Activate License', 'motionkit'); ?>
            </h3>
            <p class="mk-card-desc"><?php esc_html_e('Your license is active. You have access to all pro features.', 'motionkit'); ?></p>

            <div class="mk-license-key-display">
              <span class="mk-license-key-value"><?php echo esc_html($this->mask_license_key($license_key)); ?></span>
              <span class="mk-badge mk-badge--success">&#9679; <?php esc_html_e('Active', 'motionkit'); ?></span>
            </div>

            <form method="post" action="">
              <?php wp_nonce_field('motionkit_license_nonce'); ?>
              <input type="hidden" name="motionkit_license_action" value="deactivate">
              <button type="submit" class="mk-btn mk-btn--outline mk-btn--danger">
                <?php esc_html_e('Deactivate', 'motionkit'); ?>
              </button>
            </form>
          </div>
        <?php else: ?>
          <!-- No License -->
          <h3 class="mk-card-title">
            <span class="mk-title-icon">&#127881;</span>
            <?php esc_html_e('Activate License', 'motionkit'); ?>
          </h3>
          <p class="mk-card-desc">
            <?php esc_html_e('Enter your license key to activate Animation Addons Pro. If you need guidance please go to the instructions guideline for help.', 'motionkit'); ?>
          </p>

          <form method="post" action="">
            <?php wp_nonce_field('motionkit_license_nonce'); ?>
            <input type="hidden" name="motionkit_license_action" value="activate">

            <div class="mk-form-group">
              <input type="text"
                     name="license_key"
                     class="mk-input license_key"
                     placeholder="<?php esc_attr_e('license key', 'motionkit'); ?>"
                     value=""
                     autocomplete="off">
            </div>

            <div class="mk-form-actions">
              <button type="submit" class="mk-btn mk-btn--primary">
                <?php esc_html_e('Activate', 'motionkit'); ?>
              </button>
              <a href="<?php echo esc_url($authorize_url); ?>" class="mk-btn mk-btn--outline">
                <?php esc_html_e('Connect', 'motionkit'); ?>
              </a>
            </div>
          </form>
        <?php endif; ?>
      </div>
    </div>
    <?php
  }

  // ─── Connect Tab ─────────────────────────────────────────────

  private function render_connect_tab(\WP_User $current_user): void
  {
    $info = OAuthHandler::get_connection_info();

    if ($info['connected']) {
      $this->render_connected_state($info, $current_user);
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

    $editor_url = $this->get_editor_url();

    ?>
    <!-- Status Card -->
    <div class="mk-card">
      <div class="mk-card-header">
        <div class="mk-card-header-left">
          <span class="mk-title-icon">&#128279;</span>
          <h3 class="mk-card-title"><?php esc_html_e('Connect your MotionKit Account', 'motionkit'); ?></h3>
        </div>
        <span class="mk-badge mk-badge--success">&#9679; <?php esc_html_e('Connected', 'motionkit'); ?></span>
      </div>

      <div class="mk-card-body">
        <div class="mk-info-row">
          <div class="mk-info-content">
            <span class="mk-info-label"><?php esc_html_e("You're connected as", 'motionkit'); ?></span>
            <strong class="mk-info-value"><?php echo esc_html($info['email'] ?: $current_user->user_email); ?></strong>
          </div>
          <a href="<?php echo esc_url($verify_url); ?>" class="mk-btn mk-btn--outline">
            <?php esc_html_e('My Account', 'motionkit'); ?>
          </a>
        </div>

        <div class="mk-info-row">
          <div class="mk-info-content">
            <span class="mk-info-label"><?php esc_html_e('Want to disconnect for any reason?', 'motionkit'); ?></span>
          </div>
          <a href="<?php echo esc_url($disconnect_url); ?>"
             class="mk-btn mk-btn--outline mk-btn--danger"
             onclick="return confirm('<?php echo esc_js(__('Are you sure you want to disconnect?', 'motionkit')); ?>');">
            <?php esc_html_e('Disconnect', 'motionkit'); ?>
          </a>
        </div>
      </div>
    </div>

    <!-- Open Editor Card -->
    <div class="mk-card">
      <div class="mk-card-header">
        <h3 class="mk-card-title">
          <span class="mk-title-icon">&#9889;</span>
          <?php esc_html_e('Open The Editor', 'motionkit'); ?>
        </h3>
      </div>
      <div class="mk-card-body">
        <p class="mk-card-desc">
          <?php esc_html_e('Your site is connected. Open any post or page and click "Edit with MotionKit" - or use the button below to launch the editor directly.', 'motionkit'); ?>
        </p>
        <a href="<?php echo esc_url($editor_url); ?>"
           class="mk-btn mk-btn--primary mk-btn--split"
           target="_blank">
          <span class="mk-btn__text" data-text="<?php esc_attr_e('Launch Motionkit', 'motionkit'); ?>">
            <?php
              $text = __('Launch Motionkit', 'motionkit');
              $chars = preg_split('//u', $text, -1, PREG_SPLIT_NO_EMPTY);
              foreach ($chars as $i => $char) {
                $c = $char === ' ' ? '&nbsp;' : esc_html($char);
                printf('<span class="mk-btn__char" style="transition-delay:%.2fs">%s</span>', $i * 0.02, $c);
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
    <div class="mk-card">
      <div class="mk-card-header">
        <div class="mk-card-header-left">
          <span class="mk-title-icon">&#128279;</span>
          <h3 class="mk-card-title"><?php esc_html_e('Connect your MotionKit Account', 'motionkit'); ?></h3>
        </div>
        <span class="mk-badge mk-badge--error">&#9679; <?php esc_html_e('Not Connected', 'motionkit'); ?></span>
      </div>
      <div class="mk-card-body">
        <p class="mk-card-desc">
          <?php esc_html_e('Gain access to the visual GSAP animation editor and connect your site to your MotionKit dashboard to start building stunning animations.', 'motionkit'); ?>
        </p>
        <a href="<?php echo esc_url($authorize_url); ?>" class="mk-btn mk-btn--primary">
          <span>&#128279;</span>
          <?php esc_html_e('Connect To MotionKit', 'motionkit'); ?>
        </a>
      </div>

      <div class="mk-card-footer">
        <h4 class="mk-footer-title"><?php esc_html_e('How It Works', 'motionkit'); ?></h4>
        <p class="mk-footer-desc">
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
    <div class="mk-support-banner">
      <div class="mk-support-banner-content">
        <h3 class="mk-support-banner-title">
          <span>&#9889;</span> <?php esc_html_e('Support', 'motionkit'); ?>
        </h3>
        <p class="mk-support-banner-desc">
          <?php esc_html_e('Get quick assistance from our dedicated support team', 'motionkit'); ?>
        </p>
      </div>
      <a href="https://motionkit.io/support" target="_blank" class="mk-btn mk-btn--primary">
        <?php esc_html_e('Get Support', 'motionkit'); ?>
      </a>
    </div>

    <!-- Community + Documentation cards -->
    <div class="mk-help-grid">
      <div class="mk-help-card">
        <div class="mk-help-card-img">
          <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
            <circle cx="35" cy="40" r="16" fill="#BFDBFE"/>
            <circle cx="60" cy="35" r="18" fill="#93C5FD"/>
            <circle cx="85" cy="40" r="16" fill="#BFDBFE"/>
            <circle cx="48" cy="50" r="14" fill="#DBEAFE"/>
            <circle cx="72" cy="50" r="14" fill="#DBEAFE"/>
          </svg>
        </div>
        <h4 class="mk-help-card-title"><?php esc_html_e('Community', 'motionkit'); ?></h4>
        <p class="mk-help-card-desc">
          <?php esc_html_e('Get quick assistance from our dedicated support team whenever you need help', 'motionkit'); ?>
        </p>
        <a href="https://motionkit.io/community" target="_blank" class="mk-btn mk-btn--primary">
          <?php esc_html_e('Join Community', 'motionkit'); ?>
        </a>
      </div>

      <div class="mk-help-card">
        <div class="mk-help-card-img">
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
        <h4 class="mk-help-card-title"><?php esc_html_e('Documentation', 'motionkit'); ?></h4>
        <p class="mk-help-card-desc">
          <?php esc_html_e('Explore step by step guides and tutorials to get the most out of the plugin', 'motionkit'); ?>
        </p>
        <a href="https://motionkit.io/docs" target="_blank" class="mk-btn mk-btn--primary">
          <?php esc_html_e('Read Documents', 'motionkit'); ?>
        </a>
      </div>
    </div>

    <?php
  }


  // ─── Helpers ─────────────────────────────────────────────────

  private function mask_license_key(string $key): string
  {
    if (strlen($key) <= 8) {
      return str_repeat('*', strlen($key));
    }
    return substr($key, 0, 4) . str_repeat('*', strlen($key) - 8) . substr($key, -4);
  }

  private function get_error_message(string $error): string
  {
    $messages = [
      'invalid_state'         => __('Security verification failed. Please try again.', 'motionkit'),
      'token_exchange_failed' => __('Could not complete the connection. Please try again.', 'motionkit'),
      'limit_exceeded'        => __('Site limit reached. Upgrade your plan to connect more sites.', 'motionkit'),
      'unauthorized'          => __('You do not have permission to perform this action.', 'motionkit'),
      'nonce_failed'          => __('Security check failed. Please try again.', 'motionkit'),
      'empty_key'             => __('Please enter a license key.', 'motionkit'),
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
  private const TOOLS_GLOBAL_SETTINGS_OPTION = 'motionkit_global_settings';

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

    // Also clear global settings on the very first batch.
    if ($offset === 0) {
      delete_option(self::TOOLS_GLOBAL_SETTINGS_OPTION);
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
    $query_args = ['site' => $page_url, 'platform' => 'wordpress'];
    if (OAuthHandler::is_connected()) {
      $query_args['token'] = JwtTokenManager::generate($page_url);
    }
    $base = apply_filters('motionkit/editor/url', 'https://editor.motionkit.io/');
    return add_query_arg($query_args, $base);
  }

  private function render_tools_tab(): void
  {
    $ajax_nonce = wp_create_nonce('motionkit_tools_ajax');
    $ajax_url = admin_url('admin-ajax.php');
    ?>
    <!-- Danger Zone -->
    <div class="mk-card">
      <div class="mk-card-header">
        <div class="mk-card-header-left">
          <span class="mk-title-icon">&#9888;</span>
          <h3 class="mk-card-title"><?php esc_html_e('Danger Zone', 'motionkit'); ?></h3>
        </div>
      </div>
      <div class="mk-card-body">
        <p class="mk-card-desc">
          <?php esc_html_e('Delete ALL MotionKit animation data on this site — per-page configs, taxonomy configs, and global settings. This cannot be undone.', 'motionkit'); ?>
        </p>
        <button type="button" class="mk-btn mk-btn--outline mk-btn--danger" id="mk-tools-delete-all">
          <?php esc_html_e('Delete All Animation Data', 'motionkit'); ?>
        </button>
      </div>
    </div>

    <!-- Animation Pages Table -->
    <div class="mk-card">
      <div class="mk-card-header">
        <div class="mk-card-header-left">
          <span class="mk-title-icon">&#128196;</span>
          <h3 class="mk-card-title"><?php esc_html_e('Animation Pages', 'motionkit'); ?></h3>
        </div>
        <input type="search" class="mk-input mk-tools-search" id="mk-tools-search"
               placeholder="<?php esc_attr_e('Search by title or key...', 'motionkit'); ?>">
      </div>
      <div class="mk-card-body">
        <div class="mk-tools-table-wrap">
          <table class="mk-tools-table">
            <thead>
              <tr>
                <th><?php esc_html_e('Title', 'motionkit'); ?></th>
                <th><?php esc_html_e('Type', 'motionkit'); ?></th>
                <th><?php esc_html_e('Modified', 'motionkit'); ?></th>
                <th style="text-align:right;"><?php esc_html_e('Actions', 'motionkit'); ?></th>
              </tr>
            </thead>
            <tbody id="mk-tools-tbody">
              <tr><td colspan="4" class="mk-tools-empty"><?php esc_html_e('Loading...', 'motionkit'); ?></td></tr>
            </tbody>
          </table>
        </div>
        <div class="mk-tools-pagination" id="mk-tools-pagination"></div>
      </div>
    </div>

    <!-- Delete form (per-row, submitted by JS) -->
    <form id="mk-tools-delete-form" method="post" action="" style="display:none;">
      <?php wp_nonce_field('motionkit_tools_nonce'); ?>
      <input type="hidden" name="motionkit_tools_action" value="delete_one">
      <input type="hidden" name="store_type" value="">
      <input type="hidden" name="option_key" value="">
      <input type="hidden" name="object_id" value="0">
    </form>

    <!-- Delete-all confirm dialog -->
    <div class="mk-modal" id="mk-tools-confirm" hidden>
      <div class="mk-modal-backdrop"></div>
      <div class="mk-modal-box">
        <h3 class="mk-modal-title"><?php esc_html_e('Delete ALL animation data?', 'motionkit'); ?></h3>
        <p class="mk-modal-desc">
          <?php esc_html_e('This will permanently remove every MotionKit animation config on this site (pages, posts, terms, global settings). This action cannot be undone.', 'motionkit'); ?>
        </p>
        <div class="mk-modal-progress" id="mk-tools-progress" hidden>
          <div class="mk-progress-bar"><div class="mk-progress-fill" id="mk-progress-fill"></div></div>
          <div class="mk-progress-label" id="mk-progress-label">0 / 0</div>
        </div>
        <div class="mk-modal-actions">
          <button type="button" class="mk-btn mk-btn--outline" id="mk-tools-cancel"><?php esc_html_e('Cancel', 'motionkit'); ?></button>
          <button type="button" class="mk-btn mk-btn--primary mk-btn--danger" id="mk-tools-confirm-btn"><?php esc_html_e('Yes, Delete Everything', 'motionkit'); ?></button>
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
        const tbody = document.getElementById('mk-tools-tbody');
        if (!data.rows.length) {
          tbody.innerHTML = '<tr><td colspan="4" class="mk-tools-empty">'+esc(strings.noResults)+'</td></tr>';
        } else {
          tbody.innerHTML = data.rows.map(r=>{
            const edit = r.edit_url ? '<a href="'+esc(r.edit_url)+'" target="_blank" class="mk-btn mk-btn--primary mk-btn--sm">'+esc(strings.edit)+'</a>' : '';
            const del  = '<button type="button" class="mk-btn mk-btn--outline mk-btn--danger mk-btn--sm mk-del-row" data-store="'+esc(r.store_type)+'" data-option="'+esc(r.option)+'" data-id="'+esc(r.id)+'">'+esc(strings.del)+'</button>';
            return '<tr>'+
              '<td><strong>'+esc(r.title)+'</strong><br><small style="color:#6b7280;">'+esc(r.option)+'</small></td>'+
              '<td><span class="mk-tools-type">'+esc(r.type_label)+'</span></td>'+
              '<td>'+esc(r.modified || '—')+'</td>'+
              '<td><div class="mk-tools-actions">'+edit+del+'</div></td>'+
            '</tr>';
          }).join('');
        }
        // pagination
        const pg = document.getElementById('mk-tools-pagination');
        if (data.total_pages <= 1) { pg.innerHTML = ''; return; }
        let html = '';
        html += '<button class="mk-page-btn" '+(data.page<=1?'disabled':'')+' data-page="'+(data.page-1)+'">'+esc(strings.prev)+'</button>';
        for (let i=1;i<=data.total_pages;i++){
          if (i===1 || i===data.total_pages || Math.abs(i-data.page)<=2){
            html += '<button class="mk-page-btn '+(i===data.page?'mk-page-btn--active':'')+'" data-page="'+i+'">'+i+'</button>';
          } else if (Math.abs(i-data.page)===3){
            html += '<span class="mk-page-btn" style="border:0;background:transparent;">…</span>';
          }
        }
        html += '<button class="mk-page-btn" '+(data.page>=data.total_pages?'disabled':'')+' data-page="'+(data.page+1)+'">'+esc(strings.next)+'</button>';
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
      const searchInput = document.getElementById('mk-tools-search');
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
        const pbtn = e.target.closest('.mk-page-btn[data-page]');
        if (pbtn && !pbtn.disabled) { state.page = parseInt(pbtn.dataset.page,10)||1; fetchList(); return; }

        const drow = e.target.closest('.mk-del-row');
        if (drow) {
          if (!confirm(strings.confirm)) return;
          const f = document.getElementById('mk-tools-delete-form');
          f.querySelector('[name=store_type]').value = drow.dataset.store;
          f.querySelector('[name=option_key]').value = drow.dataset.option;
          f.querySelector('[name=object_id]').value  = drow.dataset.id;
          f.submit();
        }
      });

      // delete all flow
      const modal = document.getElementById('mk-tools-confirm');
      const progress = document.getElementById('mk-tools-progress');
      const fill = document.getElementById('mk-progress-fill');
      const label = document.getElementById('mk-progress-label');
      const confirmBtn = document.getElementById('mk-tools-confirm-btn');
      const cancelBtn = document.getElementById('mk-tools-cancel');

      document.getElementById('mk-tools-delete-all').addEventListener('click', ()=>{
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
