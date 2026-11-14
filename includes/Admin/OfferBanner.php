<?php

namespace MotionKit\Admin;

/**
 * Seasonal offer banner.
 *
 * One image banner per campaign and audience: sites without an active
 * MotionKit license see the lifetime plan offer, licensed sites see the
 * Agency Bundle offer. It shows in two places:
 *
 * - as a notice on the WordPress Dashboard screen at most twice per
 *   administrator, at least 10 minutes apart, and on the Plugins screen on
 *   every visit. On both, the X drawn in the artwork hides it for 10 minutes,
 *   "Don't show again" for good;
 * - at the top of the MotionKit page (which removes every admin notice) on
 *   every visit while the campaign runs, dismissed or not. Its X only hides
 *   it until the page is opened again.
 *
 * Views, snooze and dismissal are kept per user in one user meta row
 * (`motionkit_offer_notice`, removed by uninstall.php).
 *
 * @package MotionKit
 * @since 2.0.3
 */

if (!defined('ABSPATH')) {
  exit;
}

final class OfferBanner
{
  private const META = 'motionkit_offer_notice';
  private const AJAX_ACTION = 'motionkit_offer_notice';
  private const SCREENS = ['dashboard', 'plugins'];
  private const LIMITED_SCREEN = 'dashboard';
  private const MAX_VIEWS = 2;
  private const VIEW_GAP = 10 * MINUTE_IN_SECONDS;
  private const SNOOZE = 10 * MINUTE_IN_SECONDS;

  public function init(): void
  {
    add_action('admin_notices', [$this, 'render_notice']);
    add_action('admin_enqueue_scripts', [$this, 'enqueue_notice_assets']);
    add_action('wp_ajax_' . self::AJAX_ACTION, [$this, 'handle_ajax']);
  }

  /**
   * Campaigns, newest last. 'start' and 'end' are inclusive dates (Y-m-d) in
   * the site's timezone. 'image' is a 1504x150 @2x PNG in
   * assets/images/notices/ with a close X drawn at its top right. Each
   * campaign has its own id, so dismissing one never hides the next.
   *
   * @return array<int, array<string, string>>
   */
  private static function campaigns(): array
  {
    return [
      [
        'id'       => 'bfcm_2026_free',
        'audience' => 'free',
        'start'    => '2026-11-14',
        'end'      => '2026-12-10',
        'image'    => 'bfcm-2026-free.png',
        'url'      => 'https://motionkit.io/pricing/?utm_source=plugin_dashboard&utm_medium=free_user_notice&utm_campaign=bfcm_2026&utm_content=get_lifetime_button',
        'alt'      => __('Black Friday: MotionKit lifetime plans from $53.40. Pay once, no renewals.', 'motionkit'),
      ],
      [
        'id'       => 'bfcm_2026_pro',
        'audience' => 'pro',
        'start'    => '2026-11-14',
        'end'      => '2026-12-10',
        'image'    => 'bfcm-2026-pro.png',
        'url'      => 'https://animation-addons.com/agency-bundle/?utm_source=Motionkit_plugin_dashboard&utm_medium=pro_user_notice&utm_campaign=bfcm_2026&utm_content=get_bundle_button',
        'alt'      => __('Agency Bundle lifetime at 70 percent off: Animation Addons Pro, MotionKit, BricksFly, Arolax and Axtra themes.', 'motionkit'),
      ],
    ];
  }

  /**
   * The campaign running today for this site's audience, or null.
   *
   * @return array<string, string>|null
   */
  public static function current_campaign(): ?array
  {
    if (!current_user_can('manage_options')) {
      return null;
    }

    $today = wp_date('Y-m-d');
    $running = array_filter(
      self::campaigns(),
      static function (array $campaign) use ($today): bool {
        return $today >= $campaign['start'] && $today <= $campaign['end'];
      }
    );
    if (!$running) {
      return null;
    }

    // Checked after the dates: the license state reads the connector's stored entitlement.
    $audience = function_exists('motionkit_has_active_license') && motionkit_has_active_license() ? 'pro' : 'free';

    foreach ($running as $campaign) {
      if ($campaign['audience'] === $audience) {
        return $campaign;
      }
    }
    return null;
  }

  /**
   * Banner for the top of the MotionKit page. Ignores the notice's view
   * limit, snooze and dismissal; its X is handled by admin.js and only
   * removes it from the page.
   */
  public static function render_page_banner(): void
  {
    $campaign = self::current_campaign();
    if (!$campaign) {
      return;
    }

    self::render_banner($campaign, 'motionkit-offer motionkit-offer--page', 'motionkit-offer__close');
  }

  public function render_notice(): void
  {
    $campaign = $this->notice_campaign();
    if (!$campaign) {
      return;
    }

    ?>
    <div class="notice motionkit-offer-notice" data-campaign="<?php echo esc_attr($campaign['id']); ?>" data-nonce="<?php echo esc_attr(wp_create_nonce(self::AJAX_ACTION)); ?>">
      <?php self::render_banner($campaign, 'motionkit-offer', 'motionkit-offer__close motionkit-offer__snooze'); ?>
      <p class="motionkit-offer-notice__actions">
        <button type="button" class="button-link motionkit-offer__dismiss"><?php esc_html_e("Don't show again", 'motionkit'); ?></button>
      </p>
    </div>
    <?php

    $screen = get_current_screen();
    if ($screen && $screen->id === self::LIMITED_SCREEN) {
      $this->count_view($campaign['id']);
    }
  }

  public function enqueue_notice_assets(): void
  {
    if (!$this->notice_campaign()) {
      return;
    }

    wp_register_style('motionkit-offer-notice', false, [], MOTIONKIT_VERSION);
    wp_enqueue_style('motionkit-offer-notice');
    wp_add_inline_style(
      'motionkit-offer-notice',
      '.notice.motionkit-offer-notice{border:0;background:none;box-shadow:none;padding:0;margin:15px 0}'
      . '.motionkit-offer{position:relative;max-width:1100px}'
      . '.motionkit-offer__link{display:block;border-radius:10px;overflow:hidden;line-height:0}'
      . '.motionkit-offer__link img{display:block;width:100%;height:auto}'
      . '.motionkit-offer__close{position:absolute;left:97.6%;top:20%;width:3.2%;min-width:24px;aspect-ratio:1;transform:translate(-50%,-50%);padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer}'
      . '.motionkit-offer__close:focus-visible{outline:2px solid #5ea1ec;outline-offset:2px}'
      . '.motionkit-offer-notice__actions{margin:6px 0 0}'
      . '.motionkit-offer-notice__actions .button-link{color:#646970;font-size:12px}'
    );

    wp_register_script('motionkit-offer-notice', false, [], MOTIONKIT_VERSION, true);
    wp_enqueue_script('motionkit-offer-notice');
    wp_add_inline_script(
      'motionkit-offer-notice',
      '(function(){document.addEventListener("click",function(e){'
      . 'var b=e.target.closest(".motionkit-offer-notice .motionkit-offer__snooze,.motionkit-offer-notice .motionkit-offer__dismiss");if(!b)return;'
      . 'var n=b.closest(".motionkit-offer-notice"),d=new FormData();'
      . 'd.append("action",' . wp_json_encode(self::AJAX_ACTION) . ');d.append("nonce",n.dataset.nonce);d.append("campaign",n.dataset.campaign);'
      . 'd.append("mode",b.classList.contains("motionkit-offer__dismiss")?"dismiss":"snooze");'
      . 'n.remove();fetch(' . wp_json_encode(admin_url('admin-ajax.php')) . ',{method:"POST",credentials:"same-origin",body:d});'
      . '});})();'
    );
  }

  public function handle_ajax(): void
  {
    if (!check_ajax_referer(self::AJAX_ACTION, 'nonce', false) || !current_user_can('manage_options')) {
      wp_send_json_error(null, 403);
    }

    $id = isset($_POST['campaign']) ? sanitize_key(wp_unslash($_POST['campaign'])) : '';
    $mode = isset($_POST['mode']) ? sanitize_key(wp_unslash($_POST['mode'])) : '';
    if (!in_array($id, array_column(self::campaigns(), 'id'), true)) {
      wp_send_json_error(null, 400);
    }

    $state = $this->get_state($id);
    if ($mode === 'dismiss') {
      $state['dismissed'] = 1;
    } else {
      $state['snoozed_until'] = time() + self::SNOOZE;
    }
    $this->save_state($id, $state);

    wp_send_json_success();
  }

  /**
   * The campaign the notice shows on this screen for this user, or null.
   *
   * @return array<string, string>|null
   */
  private function notice_campaign(): ?array
  {
    $screen = function_exists('get_current_screen') ? get_current_screen() : null;
    if (!$screen || !in_array($screen->id, self::SCREENS, true)) {
      return null;
    }

    $campaign = self::current_campaign();
    if (!$campaign) {
      return null;
    }

    $state = $this->get_state($campaign['id']);
    $now = time();
    if (!empty($state['dismissed']) || $state['snoozed_until'] > $now) {
      return null;
    }

    // The view limit and gap apply on the Dashboard only; the Plugins screen shows it until it is dismissed.
    if ($screen->id === self::LIMITED_SCREEN
      && ($state['views'] >= self::MAX_VIEWS || ($state['last'] && $now - $state['last'] < self::VIEW_GAP))) {
      return null;
    }

    return $campaign;
  }

  private function count_view(string $id): void
  {
    $state = $this->get_state($id);
    $state['views']++;
    $state['last'] = time();
    $this->save_state($id, $state);
  }

  /**
   * @return array{views: int, last: int, snoozed_until: int, dismissed: int}
   */
  private function get_state(string $id): array
  {
    $all = get_user_meta(get_current_user_id(), self::META, true);
    $state = is_array($all) && isset($all[$id]) && is_array($all[$id]) ? $all[$id] : [];

    return [
      'views'         => absint($state['views'] ?? 0),
      'last'          => absint($state['last'] ?? 0),
      'snoozed_until' => absint($state['snoozed_until'] ?? 0),
      'dismissed'     => absint($state['dismissed'] ?? 0),
    ];
  }

  /**
   * Only the running campaigns are kept, so the row never grows past them.
   *
   * @param array<string, int> $state
   */
  private function save_state(string $id, array $state): void
  {
    $user_id = get_current_user_id();
    $all = get_user_meta($user_id, self::META, true);
    $all = is_array($all) ? array_intersect_key($all, array_flip(array_column(self::campaigns(), 'id'))) : [];
    $all[$id] = $state;
    update_user_meta($user_id, self::META, $all);
  }

  /**
   * @param array<string, string> $campaign
   */
  private static function render_banner(array $campaign, string $class, string $close_class): void
  {
    ?>
    <div class="<?php echo esc_attr($class); ?>">
      <a class="motionkit-offer__link" href="<?php echo esc_url($campaign['url']); ?>" target="_blank" rel="noopener">
        <img src="<?php echo esc_url(MOTIONKIT_PLUGIN_URL . 'assets/images/notices/' . $campaign['image']); ?>" width="1504" height="150" alt="<?php echo esc_attr($campaign['alt']); ?>">
      </a>
      <button type="button" class="<?php echo esc_attr($close_class); ?>">
        <span class="screen-reader-text"><?php esc_html_e('Close', 'motionkit'); ?></span>
      </button>
    </div>
    <?php
  }
}
