<?php

namespace MotionKit\Auth;

/**
 * License Status
 *
 * Keeps the connected account's entitlement (does a license exist, is it
 * still valid, and is this site inside the plan's site limit) mirrored on
 * the WordPress site.
 *
 * The connect handshake in OAuthHandler already proves WHO the site belongs
 * to. What it does not do is stay current: `limit_exceeded` is only ever
 * evaluated once, at token-exchange time, so a license that later expires,
 * gets refunded, or has its site limit reduced is invisible to a site that
 * connected before the change. This class is the ongoing half of that.
 *
 * Pull model, not push: the site asks editor.motionkit.io for its own
 * status and caches the answer. No shared secret or signature layer is
 * needed because this is a read authenticated by the site's own access
 * token — nothing here accepts unsolicited input from the network.
 *
 * Failure policy: a remote outage must never revoke a paying customer's
 * features. A failed refresh keeps the last known answer for up to
 * GRACE_WINDOW; only after that does the state degrade to 'unknown'.
 * Frontend animation playback is never gated by any of this — a site whose
 * license lapses keeps rendering what it already saved.
 *
 * @package MotionKit
 * @since 1.2.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

final class LicenseStatus
{
  /**
   * Stored entitlement snapshot: the normalized payload plus checked_at.
   */
  private const OPT_STATE = 'motionkit_license_state';

  /**
   * Freshness marker. Presence means "checked recently, don't re-ask".
   * Kept separate from OPT_STATE so an expired cache still leaves the last
   * answer readable for the grace window.
   */
  private const TRANSIENT_FRESH = 'motionkit_license_fresh';

  /**
   * Short-lived stampede guard — stops a cron tick and an admin page load
   * landing in the same window from both hitting the remote.
   */
  private const TRANSIENT_LOCK = 'motionkit_license_lock';

  /**
   * Cron hook for the daily background refresh.
   */
  public const CRON_HOOK = 'motionkit_license_refresh';

  /**
   * How long a successful check stays fresh before the next refresh.
   */
  private const FRESH_WINDOW = 12 * HOUR_IN_SECONDS;

  /**
   * How long a successful check keeps being honoured with NO stale marker at
   * all — beyond this, the last known answer is still fully trusted for
   * every feature gate (there is no hard expiry — see get_state()), but
   * `stale: true` starts showing up for admin-facing UI, so a genuinely
   * long-running outage stays visible without ever costing the customer
   * their features.
   */
  private const GRACE_WINDOW = 72 * HOUR_IN_SECONDS;

  /**
   * Statuses the remote is allowed to report. Anything else is coerced to
   * 'unknown' rather than stored verbatim — this option is read by every
   * gate, so it must never hold an arbitrary string.
   *
   * 'inactive' is EDD's own wording for a license that has been paid for but
   * is not activated on any site yet. Leaving it out of this list coerced it
   * to 'unknown', which reads as "Unable to verify" and, with exists still
   * false, showed a paying customer the Free plan badge. It is listed here so
   * the real state survives; it is deliberately NOT valid (see is_valid()),
   * because entitlement follows activation, not purchase.
   */
  private const KNOWN_STATUSES = ['active', 'inactive', 'expired', 'disabled', 'none', 'unknown'];

  /**
   * Register hooks.
   *
   * @return void
   */
  public function init(): void
  {
    add_action(self::CRON_HOOK, [__CLASS__, 'run_scheduled_refresh']);
    add_action('admin_init', [__CLASS__, 'ensure_cron_scheduled']);

    // Lazy refresh: whenever an admin loads a page and the cached answer has
    // gone stale, top it up. Covers sites where WP-Cron never fires.
    add_action('admin_init', [__CLASS__, 'maybe_refresh'], 20);

    add_action('admin_post_motionkit_refresh_license', [__CLASS__, 'handle_manual_refresh']);
    add_action('admin_notices', [__CLASS__, 'render_admin_notice']);

    // Connecting and disconnecting both invalidate whatever we knew.
    add_action('motionkit/oauth/connected', [__CLASS__, 'on_connected']);
    add_action('motionkit/oauth/disconnected', [__CLASS__, 'clear']);
  }

  // ─── Public API (use these to gate features) ──────────────────

  /**
   * The connected account owns a license for this product.
   *
   * @return bool
   */
  public static function has_license(): bool
  {
    return !empty(self::get_state()['exists']);
  }

  /**
   * This site is beyond the plan's activation limit — the account has a
   * license, but this particular site does not hold a slot.
   *
   * @return bool
   */
  public static function limit_exceeded(): bool
  {
    return !empty(self::get_state()['limit_exceeded']);
  }

  /**
   * The site is entitled to premium features right now: a license exists,
   * its status is active, and this site is within the limit.
   *
   * An 'unknown' status (remote unreachable past the grace window) reads as
   * NOT valid — but see is_indeterminate() before showing the user an error,
   * since "we could not check" is a different message from "you have no
   * license".
   *
   * @return bool
   */
  public static function is_valid(): bool
  {
    $state = self::get_state();

    return !empty($state['exists'])
      && 'active' === $state['status']
      && empty($state['limit_exceeded']);
  }

  /**
   * The remote could not be reached recently enough to say anything. Use
   * this to soften UI copy — never to grant access.
   *
   * @return bool
   */
  public static function is_indeterminate(): bool
  {
    return 'unknown' === self::get_state()['status'];
  }

  /**
   * Per-feature boolean flags from the plan (`features` in the remote
   * payload) — free-tier accounts included, since the remote sends free
   * defaults even when no license exists. A missing key, or a non-empty
   * license that failed validation (expired/disabled/over its site limit),
   * reads as not included.
   *
   * For a numeric/text/list-typed limitation (e.g. a template quota), use
   * get_feature_value() instead — this always returns a bool.
   *
   * @param string $feature Feature slug, e.g. 'premium_presets'.
   * @return bool
   */
  public static function can_use(string $feature): bool
  {
    $state = self::get_state();

    // A license exists but isn't currently valid (expired/disabled/over
    // limit) — never fall back to free defaults for it; that would let a
    // lapsed paid account keep free-tier features indefinitely.
    if (!empty($state['exists']) && !self::is_valid()) {
      return false;
    }

    return !empty($state['features'][$feature]);
  }

  /**
   * The raw typed value of a plan feature/limitation (number, string, list,
   * or bool) — free-tier accounts included. Returns null when the key is
   * absent, or when a non-empty license exists but isn't currently valid.
   *
   * @param string $feature Feature slug, e.g. 'template_access'.
   * @return mixed|null
   */
  public static function get_feature_value(string $feature)
  {
    $state = self::get_state();

    if (!empty($state['exists']) && !self::is_valid()) {
      return null;
    }

    return $state['features'][$feature] ?? null;
  }

  /**
   * The full normalized snapshot, always with every key present.
   *
   * @return array{
   *   exists: bool, status: string, plan: string, expires_at: string,
   *   sites_limit: int, sites_used: int, limit_exceeded: bool,
   *   features: array<string,bool>, checked_at: int, stale: bool
   * }
   */
  public static function get_state(): array
  {
    $stored = get_option(self::OPT_STATE);

    if (!is_array($stored) || empty($stored['checked_at'])) {
      // Never successfully checked. This is NOT the same as "checked, and the
      // account has no license" — but empty_state()'s 'none' status is what
      // the Connect page renders as the "Free plan" badge, so a connected
      // site that has not managed a single successful check yet would tell a
      // paying customer they are on the free tier. Report it as
      // indeterminate instead; is_valid() is false either way, so this grants
      // nothing — it only changes a confident wrong claim into an honest one.
      $unchecked = self::empty_state();

      if (OAuthHandler::is_connected()) {
        $unchecked['status'] = 'unknown';
      }

      return $unchecked;
    }

    $age = time() - (int) $stored['checked_at'];

    // No hard expiry on the last known answer: a paying customer's features
    // must never silently disappear because our own server (or the network
    // between this site and it) was down for a few days — that reads as a
    // bug to the customer and turns into a support ticket, not a security
    // outcome anyone wants. `maybe_refresh()`/the daily cron keep retrying
    // in the background for as long as it takes; the moment a check
    // succeeds again, this naturally picks up an expired/disabled/limit-
    // exceeded answer if that's what's true. `stale` past GRACE_WINDOW is
    // purely a signal for admin-facing UI ("last verified N days ago") —
    // it must never be read as a reason to degrade access.
    $stored['stale'] = $age > self::GRACE_WINDOW;

    return $stored;
  }

  // ─── Refresh ─────────────────────────────────────────────────

  /**
   * Fetch the current entitlement from editor.motionkit.io and store it.
   *
   * @param bool $force Ignore the freshness marker and the lock.
   * @return array|\WP_Error The new state, or WP_Error if the remote failed
   *                         (the previously stored state is left untouched).
   */
  public static function refresh(bool $force = false)
  {
    if (!OAuthHandler::is_connected()) {
      self::clear();
      return new \WP_Error('not_connected', __('This site is not connected to MotionKit.', 'motionkit'));
    }

    if (!$force && get_transient(self::TRANSIENT_LOCK)) {
      return new \WP_Error('locked', __('A license check is already in progress.', 'motionkit'));
    }

    $token = OAuthHandler::get_access_token();

    if (!$token) {
      return new \WP_Error('no_token', __('No access token stored locally.', 'motionkit'));
    }

    set_transient(self::TRANSIENT_LOCK, 1, MINUTE_IN_SECONDS);

    $args = [
      'timeout'    => 15,
      'user-agent' => 'MotionKit-WP/' . \MotionKit\Plugin::VERSION . '; ' . home_url(),
      'headers'    => ['Content-Type' => 'application/json'],
      'body'       => wp_json_encode([
        'site'       => home_url(),
        'token_hash' => hash('sha256', $token),
        'version'    => \MotionKit\Plugin::VERSION,
      ]),
    ];

    $response = self::post_with_retry(self::get_status_url(), $args);

    delete_transient(self::TRANSIENT_LOCK);

    if (is_wp_error($response)) {
      return new \WP_Error('server_unreachable', $response->get_error_message());
    }

    $code = (int) wp_remote_retrieve_response_code($response);
    $body = json_decode(wp_remote_retrieve_body($response), true);

    // A 404 here means "this site has never launched the editor" (no
    // matching row in the connected-sites table yet) — a real, expected
    // state for an account that only completed the OAuth connect step, not
    // a server error. Store it as a normal "none" answer (so checked_at
    // advances and the UI stops reading "Never" forever) instead of falling
    // through to the generic bad_response branch below, which would leave
    // the state untouched and give a misleading error on every check.
    if (404 === $code) {
      self::store(self::normalize(['exists' => false, 'status' => 'none']));

      return new \WP_Error(
        'site_not_launched',
        __('This site has not launched the MotionKit editor yet, so there is no license to check. Open the editor once (via "Launch MotionKit" or "Edit with MotionKit" on any page) to finish connecting this site.', 'motionkit')
      );
    }

    if (200 !== $code || !is_array($body)) {
      return new \WP_Error(
        'bad_response',
        sprintf(
          /* translators: %d: HTTP status code returned by the MotionKit server. */
          __('Unexpected response from the MotionKit server (HTTP %d).', 'motionkit'),
          $code
        )
      );
    }

    // A definitive "this token is no longer recognised" is the one remote
    // answer that must NOT be softened by the grace window — the site has
    // been disconnected server-side, so keeping its old entitlement alive
    // for another 72 hours would defeat the revocation.
    if (isset($body['valid']) && false === $body['valid']) {
      self::store(self::empty_state());

      return self::get_state();
    }

    self::store(self::normalize($body));

    return self::get_state();
  }

  /**
   * POST with a short retry — billing.local / editor.motionkit.io can have
   * an occasional cold-start or transient network blip, and a single failed
   * request here would otherwise cost a customer their status for the rest
   * of FRESH_WINDOW. Only retries a network-level failure (is_wp_error) or a
   * 5xx response; a 4xx (404 "not connected", etc.) is a real, meaningful
   * answer and must not be retried.
   *
   * @param string $url  Request URL.
   * @param array  $args wp_remote_post() args.
   * @return array|\WP_Error Same return shape as wp_remote_post().
   */
  private static function post_with_retry(string $url, array $args)
  {
    $delays_ms = [300, 900]; // between attempts 1->2 and 2->3
    $max_attempts = count($delays_ms) + 1;
    $response = null;

    for ($attempt = 1; $attempt <= $max_attempts; $attempt++) {
      $response = wp_remote_post($url, $args);

      if (!is_wp_error($response)) {
        $code = (int) wp_remote_retrieve_response_code($response);
        if ($code < 500) {
          return $response;
        }
      }

      if ($attempt < $max_attempts) {
        usleep($delays_ms[$attempt - 1] * 1000);
      }
    }

    return $response;
  }

  /**
   * Refresh only if the cached answer has gone stale. Safe to call on every
   * admin request — it is a single transient read in the common case.
   *
   * @return void
   */
  public static function maybe_refresh(): void
  {
    if (wp_doing_ajax() || !OAuthHandler::is_connected()) {
      return;
    }

    if (get_transient(self::TRANSIENT_FRESH)) {
      return;
    }

    self::refresh();
  }

  /**
   * Daily cron callback.
   *
   * @return void
   */
  public static function run_scheduled_refresh(): void
  {
    if (!OAuthHandler::is_connected()) {
      return;
    }

    self::refresh(true);
  }

  /**
   * Refresh immediately after a successful connect, so the License tab has
   * a real answer on the very first page load rather than after the first
   * lazy check.
   *
   * @return void
   */
  public static function on_connected(): void
  {
    delete_transient(self::TRANSIENT_FRESH);
    self::refresh(true);
  }

  /**
   * Admin-triggered "Check again" button.
   *
   * @return void
   */
  public static function handle_manual_refresh(): void
  {
    if (!current_user_can('manage_options')) {
      wp_die(esc_html__('You do not have permission to perform this action.', 'motionkit'));
    }

    check_admin_referer('motionkit_refresh_license');

    $result = self::refresh(true);

    $args = is_wp_error($result)
      ? ['license_refresh' => 'error', 'reason' => $result->get_error_code()]
      : ['license_refresh' => 'ok'];

    wp_safe_redirect(add_query_arg($args, admin_url('admin.php?page=motionkit-connect&tab=connect')));
    exit;
  }

  /**
   * Wipe the stored entitlement — on disconnect, or when the remote says
   * the token is no longer valid.
   *
   * @return void
   */
  public static function clear(): void
  {
    delete_option(self::OPT_STATE);
    delete_transient(self::TRANSIENT_FRESH);
    delete_transient(self::TRANSIENT_LOCK);
  }

  // ─── Internals ───────────────────────────────────────────────

  /**
   * Cast one feature value to a JSON-storable scalar/list, preserving its
   * type instead of collapsing everything to bool. Mirrors the value shapes
   * wc-edd-license-extend can send: boolean, number, text, or a comma list
   * (already an array by the time it reaches here from the JSON payload).
   *
   * @param mixed $value Raw value from the remote payload.
   * @return bool|int|float|string|array<int,string>
   */
  private static function cast_feature_value($value)
  {
    if (is_bool($value)) {
      return $value;
    }

    if (is_int($value) || is_float($value)) {
      return $value;
    }

    if (is_array($value)) {
      return array_values(array_map('sanitize_text_field', array_map('strval', $value)));
    }

    // Numeric strings ("10") arrive intact from JSON in practice, but stay
    // defensive in case a caller passes one through.
    if (is_string($value) && is_numeric($value)) {
      return 0 + $value;
    }

    return sanitize_text_field((string) $value);
  }

  /**
   * Coerce whatever the remote sent into the fixed shape every caller
   * expects. Accepts the entitlement either at the top level or nested
   * under a `license` key, so the server side can evolve without breaking
   * older plugin builds.
   *
   * @param array $body Decoded response body.
   * @return array
   */
  private static function normalize(array $body): array
  {
    $license = isset($body['license']) && is_array($body['license']) ? $body['license'] : $body;

    $status = sanitize_key((string) ($license['status'] ?? ''));
    if (!in_array($status, self::KNOWN_STATUSES, true)) {
      $status = 'unknown';
    }

    $sites_limit = isset($license['sites_limit']) ? (int) $license['sites_limit'] : -1;
    $sites_used  = isset($license['sites_used']) ? (int) $license['sites_used'] : 0;

    // Trust an explicit flag from the server when it sends one; otherwise
    // derive it. sites_limit of -1 means unlimited (the shared convention
    // used everywhere else in the stack), never "zero allowed".
    $limit_exceeded = isset($license['limit_exceeded'])
      ? (bool) $license['limit_exceeded']
      : ($sites_limit !== -1 && $sites_used > $sites_limit);

    $features = [];
    if (isset($license['features']) && is_array($license['features'])) {
      foreach ($license['features'] as $key => $value) {
        $features[sanitize_key((string) $key)] = self::cast_feature_value($value);
      }
    }

    $exists = isset($license['exists'])
      ? (bool) $license['exists']
      : ('none' !== $status && 'unknown' !== $status);

    return [
      'exists'         => $exists,
      'status'         => $status,
      'plan'           => sanitize_text_field((string) ($license['plan'] ?? '')),
      'expires_at'     => sanitize_text_field((string) ($license['expires_at'] ?? '')),
      'sites_limit'    => $sites_limit,
      'sites_used'     => $sites_used,
      'limit_exceeded' => $limit_exceeded,
      'features'       => $features,
      'checked_at'     => time(),
      'stale'          => false,
    ];
  }

  /**
   * Persist a snapshot and mark it fresh.
   *
   * @param array $state Normalized state.
   * @return void
   */
  private static function store(array $state): void
  {
    update_option(self::OPT_STATE, $state, false);
    set_transient(self::TRANSIENT_FRESH, 1, self::FRESH_WINDOW);
  }

  /**
   * The "we know nothing" snapshot — also what a disconnected site reads.
   *
   * @return array
   */
  private static function empty_state(): array
  {
    return [
      'exists'         => false,
      'status'         => 'none',
      'plan'           => '',
      'expires_at'     => '',
      'sites_limit'    => -1,
      'sites_used'     => 0,
      'limit_exceeded' => false,
      'features'       => [],
      'checked_at'     => 0,
      'stale'          => false,
    ];
  }

  /**
   * Status endpoint (filterable for dev environments, matching the other
   * connect URLs in OAuthHandler).
   *
   * @return string
   */
  private static function get_status_url(): string
  {
    return apply_filters('motionkit/connect/status_url', 'https://editor.motionkit.io/connect/status');
  }

  /**
   * Make sure the daily refresh is scheduled.
   *
   * @return void
   */
  public static function ensure_cron_scheduled(): void
  {
    if (!wp_next_scheduled(self::CRON_HOOK)) {
      wp_schedule_event(time() + HOUR_IN_SECONDS, 'daily', self::CRON_HOOK);
    }
  }

  /**
   * Remove the scheduled refresh (called on plugin deactivation).
   *
   * @return void
   */
  public static function unschedule_cron(): void
  {
    wp_clear_scheduled_hook(self::CRON_HOOK);
  }

  // ─── Admin notice ────────────────────────────────────────────

  /**
   * Warn about the two states the user can actually act on: no license on
   * the connected account, and this site being over the plan's site limit.
   *
   * Silent for 'unknown' — a transient outage is our problem, not something
   * to nag the customer about.
   *
   * @return void
   */
  public static function render_admin_notice(): void
  {
    if (!current_user_can('manage_options') || !OAuthHandler::is_connected()) {
      return;
    }

    $screen = function_exists('get_current_screen') ? get_current_screen() : null;
    if ($screen && false !== strpos((string) $screen->id, 'motionkit-connect')) {
      return; // The License tab already says this in full.
    }

    $state = self::get_state();

    // A site that simply never had a license (free plan) is a normal,
    // expected state — nothing to warn about. Only a license that used to
    // be valid and no longer is (expired/disabled/over its site limit)
    // deserves a sitewide nudge.
    if ('unknown' === $state['status'] || self::is_valid() || !$state['exists']) {
      return;
    }

    if ($state['limit_exceeded']) {
      $message = sprintf(
        /* translators: 1: sites in use, 2: sites allowed by the plan. */
        __('This site is outside your MotionKit plan\'s site limit (%1$d of %2$d used). Free a slot or upgrade to keep using premium features here.', 'motionkit'),
        $state['sites_used'],
        $state['sites_limit']
      );
    } elseif ('expired' === $state['status']) {
      $message = __('Your MotionKit license has expired. Renew it to keep using premium features.', 'motionkit');
    } elseif ('disabled' === $state['status']) {
      $message = __('Your MotionKit license has been disabled. Please contact support.', 'motionkit');
    } elseif ('inactive' === $state['status']) {
      $message = __('Your MotionKit license is not activated on this site yet. Reconnect the site, or activate it from your MotionKit account, to unlock premium features here.', 'motionkit');
    } else {
      $message = __('The connected MotionKit account has no active license. Premium features are unavailable on this site.', 'motionkit');
    }
    ?>
    <div class="notice notice-warning">
      <p>
        <strong><?php esc_html_e('MotionKit:', 'motionkit'); ?></strong>
        <?php echo esc_html($message); ?>
        <a href="<?php echo esc_url(admin_url('admin.php?page=motionkit-connect&tab=connect')); ?>">
          <?php esc_html_e('View license', 'motionkit'); ?>
        </a>
      </p>
    </div>
    <?php
  }
}
