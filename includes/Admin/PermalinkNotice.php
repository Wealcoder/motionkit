<?php

namespace MotionKit\Admin;

/**
 * Plain-permalink admin notice.
 *
 * When the site is on "Plain" permalinks, the REST API is reachable only
 * via /?rest_route=... which triggers CORS preflight that some hosts block.
 * This notice nudges admins to switch to pretty permalinks.
 *
 * @package MotionKit
 * @since 1.2.0
 */

if (!defined('ABSPATH')) {
  exit;
}

final class PermalinkNotice
{
  private const DISMISS_META = 'motionkit_dismissed_permalink_notice';

  public function init(): void
  {
    add_action('admin_notices', [$this, 'maybe_render']);
    add_action('admin_post_motionkit_dismiss_permalink_notice', [$this, 'handle_dismiss']);
  }

  public function maybe_render(): void
  {
    if (!current_user_can('manage_options')) {
      return;
    }

    if (get_user_meta(get_current_user_id(), self::DISMISS_META, true)) {
      return;
    }

    if (get_option('permalink_structure') !== '') {
      return;
    }

    $permalink_url = admin_url('options-permalink.php');
    $dismiss_url   = wp_nonce_url(
      admin_url('admin-post.php?action=motionkit_dismiss_permalink_notice'),
      'motionkit_dismiss_permalink_notice'
    );

    ?>
    <div class="notice notice-warning is-dismissible">
      <p>
        <strong><?php esc_html_e('MotionKit', 'motionkit'); ?>:</strong>
        <?php esc_html_e('Your site uses "Plain" permalinks. The MotionKit editor works best with pretty permalinks — we recommend changing to any other setting.', 'motionkit'); ?>
      </p>
      <p>
        <a class="button button-primary" href="<?php echo esc_url($permalink_url); ?>">
          <?php esc_html_e('Fix permalinks', 'motionkit'); ?>
        </a>
        <a class="button" href="<?php echo esc_url($dismiss_url); ?>">
          <?php esc_html_e('Dismiss', 'motionkit'); ?>
        </a>
      </p>
    </div>
    <?php
  }

  public function handle_dismiss(): void
  {

    if (!current_user_can('manage_options')) {
      wp_die(esc_html__('Permission denied.', 'motionkit'), '', ['response' => 403]);
    }
    
    check_admin_referer('motionkit_dismiss_permalink_notice');

    update_user_meta(get_current_user_id(), self::DISMISS_META, 1);

    $referer = wp_get_referer();
    wp_safe_redirect($referer ? $referer : admin_url());
    exit;
  }
}
