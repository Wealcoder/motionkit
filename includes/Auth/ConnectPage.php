<?php

namespace WcfAnimationBuilder\Auth;

/**
 * Admin Dashboard Page
 *
 * WordPress admin page with tabbed layout: License, Connect, Help.
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
    add_action('admin_init', [$this, 'handle_license_activation']);
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
      defined('MOTIONKIT_VERSION') ? MOTIONKIT_VERSION : '1.0.0'
    );
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

  private function get_menu_icon(): string
  {
    return 'dashicons-admin-links';
  }

  private function get_editor_url(): string
  {
    $page_url = home_url('/');
    $query_args = ['site' => $page_url];

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

    $active_tab = isset($_GET['tab']) ? sanitize_text_field(wp_unslash($_GET['tab'])) : 'license';
    $current_user = wp_get_current_user();
    $connection_info = OAuthHandler::get_connection_info();
    $user_email = !empty($connection_info['email']) ? $connection_info['email'] : $current_user->user_email;

    $tabs = [
      'license' => ['label' => __('License', 'motionkit'), 'icon' => '&#128196;'],
      'connect' => ['label' => __('Connect', 'motionkit'), 'icon' => '&#128279;'],
      'help'    => ['label' => __('Help', 'motionkit'),    'icon' => '&#9432;'],
    ];

    ?>
    <div class="mk-page">

      <!-- Header -->
      <div class="mk-header">
        <div class="mk-header-left">
          <div class="mk-header-logo">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <circle cx="12" cy="24" r="6" fill="#FF6B6B"/>
              <circle cx="24" cy="16" r="6" fill="#4ECDC4"/>
              <circle cx="36" cy="24" r="6" fill="#45B7D1"/>
              <circle cx="24" cy="32" r="6" fill="#F9CA24"/>
            </svg>
          </div>
          <span class="mk-header-title">Motionkit</span>
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
            case 'connect':
              $this->render_connect_tab($current_user);
              break;
            case 'help':
              $this->render_help_tab();
              break;
            case 'license':
            default:
              $this->render_license_tab();
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
           class="mk-btn mk-btn--primary"
           target="_blank">
          <?php esc_html_e('Launch Motionkit', 'motionkit'); ?>
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
      'unauthorized'          => __('You do not have permission to perform this action.', 'motionkit'),
      'nonce_failed'          => __('Security check failed. Please try again.', 'motionkit'),
      'empty_key'             => __('Please enter a license key.', 'motionkit'),
    ];

    return $messages[$error] ?? __('An unknown error occurred. Please try again.', 'motionkit');
  }

}
