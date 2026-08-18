<?php

/**
 * Public API — global functions for other plugins and themes.
 *
 * The methods behind these live on namespaced classes that only exist once
 * MotionKit's autoloader has run, so a third-party integration cannot call
 * them directly without risking a fatal error when MotionKit is deactivated,
 * updated, or not installed at all. Every function here is safe to call
 * unconditionally: each guards on class_exists() and answers false rather
 * than throwing.
 *
 * These names are a stable contract. Callers outside the plugin depend on
 * them, so treat a rename or a signature change as a breaking change.
 *
 * @package MotionKit
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

if (!function_exists('motionkit_is_scroll_smoother_active')) {
  /**
   * Is MotionKit driving the page smoother on THIS request?
   *
   * The one function another smooth-scroll plugin should call before creating
   * its own ScrollSmoother. A page has exactly one smoother, and MotionKit
   * takes it whenever this returns true — so a caller that sees true must
   * stand down rather than fight for the same scroll container.
   *
   * True requires BOTH: the site is connected to the MotionKit editor, and
   * the smoother is switched on for the current page (a per-page override
   * wins outright; otherwise the global all-page setting applies).
   *
   * Timing: this resolves the CURRENT page, so it needs the main query. Call
   * it on 'wp' or later (wp_enqueue_scripts, template_redirect, wp_footer).
   * Calling it on 'plugins_loaded' or 'init' answers for no particular page
   * and will read the global setting only — use
   * motionkit_is_scroll_smoother_enabled_globally() if that is what you want.
   *
   * @since 1.0.0
   *
   * @return bool True when MotionKit owns the page smoother right now.
   */
  function motionkit_is_scroll_smoother_active(): bool
  {
    if (!class_exists('\MotionKit\Frontend\ScrollSmoother')) {
      return false;
    }

    return \MotionKit\Frontend\ScrollSmoother::should_run();
  }
}

if (!function_exists('motionkit_is_scroll_smoother_enabled_for_current_page')) {
  /**
   * Is the smoother switched on for the current page, ignoring whether the
   * site is connected?
   *
   * Almost every caller wants motionkit_is_scroll_smoother_active() instead —
   * a setting that is switched on but has no connected editor behind it does
   * NOT produce a smoother on the page. This exists for UI that needs to
   * report the setting itself (e.g. "smoother is on for this page, but the
   * site is disconnected").
   *
   * Same timing requirement as motionkit_is_scroll_smoother_active(): call on
   * 'wp' or later.
   *
   * @since 1.0.0
   *
   * @return bool True when the page/global settings switch the smoother on.
   */
  function motionkit_is_scroll_smoother_enabled_for_current_page(): bool
  {
    if (!class_exists('\MotionKit\Frontend\ScrollSmoother')) {
      return false;
    }

    return \MotionKit\Frontend\ScrollSmoother::is_enabled_for_current_page();
  }
}

if (!function_exists('motionkit_is_scroll_smoother_enabled_globally')) {
  /**
   * Is the smoother switched on at the GLOBAL (all-page) level, ignoring any
   * per-page override?
   *
   * For admin screens and any other context with no front-end page to resolve
   * a per-page setting against — there, the per-page half of the answer is
   * meaningless, so asking for the global baseline is the honest question.
   * Safe to call at any hook, since it reads a single option.
   *
   * Note this can differ from what a given visitor gets: a page override beats
   * the global setting in both directions.
   *
   * @since 1.0.0
   *
   * @return bool True when the global setting switches the smoother on.
   */
  function motionkit_is_scroll_smoother_enabled_globally(): bool
  {
    if (!class_exists('\MotionKit\Frontend\ScrollSmoother')) {
      return false;
    }

    return \MotionKit\Frontend\ScrollSmoother::is_enabled_globally();
  }
}

if (!function_exists('motionkit_is_connected')) {
  /**
   * Is this site connected to a MotionKit account?
   *
   * A connected site has completed the OAuth handshake and holds an access
   * token. Nothing about entitlement is implied — see
   * motionkit_has_active_license() for that.
   *
   * @since 1.0.0
   *
   * @return bool True when an access token is stored.
   */
  function motionkit_is_connected(): bool
  {
    if (!class_exists('\MotionKit\Auth\OAuthHandler')) {
      return false;
    }

    return \MotionKit\Auth\OAuthHandler::is_connected();
  }
}

if (!function_exists('motionkit_has_active_license')) {
  /**
   * Does this site currently hold a valid MotionKit license slot?
   *
   * Deliberately conservative: an expired, disabled, or over-limit license
   * reads as false, and so does a license the plugin has not been able to
   * verify recently enough to be sure about.
   *
   * Do NOT use this to gate animation playback. A site whose license lapses
   * keeps rendering the animations it already saved — that is the plugin's
   * own policy, and third-party integrations should not undercut it.
   *
   * @since 1.0.0
   *
   * @return bool True when a license exists, is active, and this site is
   *              within the plan's site limit.
   */
  function motionkit_has_active_license(): bool
  {
    if (!class_exists('\MotionKit\Auth\LicenseStatus')) {
      return false;
    }

    return \MotionKit\Auth\LicenseStatus::is_valid();
  }
}
