<?php

namespace WcfAnimationBuilder\Auth;

/**
 * Connect Page
 *
 * WordPress admin page for connecting/disconnecting the site
 * to/from the MotionKit editor service.
 *
 * Menu: MotionKit → Connect
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
  /**
   * OAuth handler instance
   *
   * @var OAuthHandler
   */
  private OAuthHandler $oauth;

  /**
   * Constructor
   *
   * @param OAuthHandler $oauth
   */
  public function __construct(OAuthHandler $oauth)
  {
    $this->oauth = $oauth;
  }

  /**
   * Initialize admin page hooks
   *
   * @return void
   */
  public function init(): void
  {
    add_action('admin_menu', [$this, 'register_menu']);
  }

  /**
   * Register the admin menu page
   *
   * @return void
   */
  public function register_menu(): void
  {
    add_menu_page(
      __('MotionKit Connect', 'motionkit'),
      __('MotionKit', 'motionkit'),
      'manage_options',
      'motionkit-connect',
      [$this, 'render_page'],
      $this->get_menu_icon(),
      59
    );

    add_submenu_page(
      'motionkit-connect',
      __('Connect Settings', 'motionkit'),
      __('Connect', 'motionkit'),
      'manage_options',
      'motionkit-connect',
      [$this, 'render_page']
    );
  }

  /**
   * Get the menu icon
   *
   * @return string
   */
  private function get_menu_icon(): string
  {
    return 'dashicons-admin-links';
  }

  /**
   * Build the editor URL for the home page.
   *
   * @return string
   */
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

  /**
   * Render the connect page
   *
   * @return void
   */
  public function render_page(): void
  {
    if (!current_user_can('manage_options')) {
      wp_die(esc_html__('You do not have permission to access this page.', 'motionkit'));
    }

    $info = OAuthHandler::get_connection_info();
    $error = isset($_GET['error']) ? sanitize_text_field(wp_unslash($_GET['error'])) : '';
    $just_connected = isset($_GET['connected']);
    $just_disconnected = isset($_GET['disconnected']);
    $verify = isset($_GET['verify']) ? sanitize_text_field(wp_unslash($_GET['verify'])) : '';
    $verify_reason = isset($_GET['reason']) ? sanitize_text_field(wp_unslash($_GET['reason'])) : '';

    $current_user = wp_get_current_user();
    $user_email = $current_user->user_email;

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

      <!-- Notices -->
      <?php if ($error): ?>
        <div class="mk-notice mk-notice--error">
          <span class="mk-notice-icon">&#10060;</span>
          <?php echo esc_html($this->get_error_message($error)); ?>
          <button class="mk-notice-close" onclick="this.parentElement.remove()">&times;</button>
        </div>
      <?php endif; ?>

      <?php if ($just_connected): ?>
        <div class="mk-notice mk-notice--success">
          <span class="mk-notice-icon">&#10004;</span>
          <?php esc_html_e('Connected Successfully', 'motionkit'); ?>
          <button class="mk-notice-close" onclick="this.parentElement.remove()">&times;</button>
        </div>
      <?php endif; ?>

      <?php if ($just_disconnected): ?>
        <div class="mk-notice mk-notice--info">
          <span class="mk-notice-icon">&#8505;</span>
          <?php esc_html_e('Disconnected from MotionKit.', 'motionkit'); ?>
          <button class="mk-notice-close" onclick="this.parentElement.remove()">&times;</button>
        </div>
      <?php endif; ?>

      <?php if ($verify === 'valid'): ?>
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
      <?php endif; ?>

      <!-- Content -->
      <?php if ($info['connected']): ?>
        <?php $this->render_connected_state($info, $current_user); ?>
      <?php else: ?>
        <?php $this->render_disconnected_state($current_user); ?>
      <?php endif; ?>

    </div>

    <?php $this->render_styles(); ?>
    <?php
  }

  /**
   * Render connected state UI
   *
   * @param array    $info         Connection info
   * @param \WP_User $current_user Current WP user
   * @return void
   */
  private function render_connected_state(array $info, \WP_User $current_user): void
  {
    $disconnect_url = wp_nonce_url(
      admin_url('admin.php?page=motionkit-connect&motionkit_disconnect=1'),
      'motionkit_disconnect'
    );

    $verify_url = wp_nonce_url(
      admin_url('admin.php?page=motionkit-connect&motionkit_verify=1'),
      'motionkit_verify'
    );

    $editor_url = $this->get_editor_url();

    ?>
    <!-- Status Card -->
    <div class="mk-card">
      <div class="mk-card-header">
        <h3 class="mk-card-title">Status</h3>
        <span class="mk-badge mk-badge--success">&#9679; Connected</span>
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

  /**
   * Render disconnected state UI
   *
   * @param \WP_User $current_user Current WP user
   * @return void
   */
  private function render_disconnected_state(\WP_User $current_user): void
  {
    $authorize_url = $this->oauth->get_authorize_url();
    $user_email = $current_user->user_email;

    ?>
    <!-- Connect Card -->
    <div class="mk-card">
      <div class="mk-card-header">
        <div class="mk-card-header-left">
          <span class="mk-title-icon">&#128279;</span>
          <h3 class="mk-card-title"><?php esc_html_e('Connect your MotionKit Account', 'motionkit'); ?></h3>
        </div>
        <span class="mk-badge mk-badge--error">&#9679; Not Connected</span>
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

  /**
   * Render page styles
   *
   * @return void
   */
  private function render_styles(): void
  {
    ?>
    <style>
      /* Reset WP admin styles within our page */
      .mk-page {
        max-width: 760px;
        margin: 28px 2px 20px 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      }

      /* ─── Header ─────────────────────────────────────── */
      .mk-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fff;
        padding: 16px 24px;
        border-bottom: 1px solid #e5e7eb;
        border-radius: 0 0 8px 8px;
        margin-bottom: 20px;
      }
      .mk-header-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .mk-header-title {
        font-size: 18px;
        font-weight: 700;
        color: #1e1e1e;
      }
      .mk-header-right {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .mk-header-email {
        font-size: 13px;
        color: #6b7280;
      }
      .mk-header-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
      }
      .mk-avatar-img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
      }

      /* ─── Notices ────────────────────────────────────── */
      .mk-notice {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 16px;
        position: relative;
      }
      .mk-notice--success {
        background: #22c55e;
        color: #fff;
      }
      .mk-notice--error {
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
      }
      .mk-notice--info {
        background: #eff6ff;
        color: #2563eb;
        border: 1px solid #bfdbfe;
      }
      .mk-notice-icon {
        font-size: 14px;
        flex-shrink: 0;
      }
      .mk-notice-close {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: inherit;
        opacity: 0.7;
        line-height: 1;
        padding: 0;
      }
      .mk-notice-close:hover {
        opacity: 1;
      }

      /* ─── Card ───────────────────────────────────────── */
      .mk-card {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        margin-bottom: 16px;
        overflow: hidden;
      }
      .mk-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid #f3f4f6;
      }
      .mk-card-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .mk-card-title {
        font-size: 16px;
        font-weight: 600;
        color: #1e1e1e;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .mk-title-icon {
        font-style: normal;
        font-size: 16px;
      }
      .mk-card-body {
        padding: 24px;
      }
      .mk-card-desc {
        font-size: 14px;
        color: #6b7280;
        line-height: 1.6;
        margin: 0 0 20px;
      }
      .mk-card-footer {
        padding: 20px 24px;
        background: #f9fafb;
        border-top: 1px solid #f3f4f6;
      }
      .mk-footer-title {
        font-size: 14px;
        font-weight: 600;
        color: #1e1e1e;
        margin: 0 0 6px;
      }
      .mk-footer-desc {
        font-size: 13px;
        color: #6b7280;
        line-height: 1.6;
        margin: 0;
      }

      /* ─── Info rows ──────────────────────────────────── */
      .mk-info-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 0;
        border-bottom: 1px solid #f3f4f6;
      }
      .mk-info-row:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      .mk-info-row:first-child {
        padding-top: 0;
      }
      .mk-info-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .mk-info-label {
        font-size: 13px;
        color: #6b7280;
      }
      .mk-info-value {
        font-size: 14px;
        color: #1e1e1e;
      }

      /* ─── Badge ──────────────────────────────────────── */
      .mk-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
      }
      .mk-badge--success {
        background: #f0fdf4;
        color: #16a34a;
        border: 1px solid #bbf7d0;
      }
      .mk-badge--error {
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
      }

      /* ─── Buttons ────────────────────────────────────── */
      .mk-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.15s ease;
        border: none;
        line-height: 1.4;
        font-family: inherit;
      }
      .mk-btn--primary {
        background: #3b82f6;
        color: #fff !important;
        box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
      }
      .mk-btn--primary:hover {
        background: #2563eb;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        color: #fff !important;
      }
      .mk-btn--outline {
        background: #fff;
        color: #374151 !important;
        border: 1px solid #d1d5db;
        padding: 8px 16px;
        font-size: 13px;
      }
      .mk-btn--outline:hover {
        background: #f9fafb;
        border-color: #9ca3af;
        color: #111827 !important;
      }
      .mk-btn--danger {
        color: #dc2626 !important;
        border-color: #fca5a5;
      }
      .mk-btn--danger:hover {
        background: #fef2f2;
        border-color: #f87171;
        color: #b91c1c !important;
      }
      .mk-btn--full {
        width: 100%;
        padding: 14px 24px;
        font-size: 15px;
      }
    </style>
    <?php
  }

  /**
   * Get human-readable error message
   *
   * @param string $error Error code
   * @return string
   */
  private function get_error_message(string $error): string
  {
    $messages = [
      'invalid_state'         => __('Security verification failed. Please try again.', 'motionkit'),
      'token_exchange_failed' => __('Could not complete the connection. Please try again.', 'motionkit'),
      'unauthorized'          => __('You do not have permission to perform this action.', 'motionkit'),
    ];

    return $messages[$error] ?? __('An unknown error occurred. Please try again.', 'motionkit');
  }
}
