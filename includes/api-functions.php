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
   * @since 1.0.0
   *
   * @return bool True when MotionKit or MotionKit Extension owns the page smoother right now.
   */
  function motionkit_is_scroll_smoother_active(): bool
  {
    if (class_exists('\MotionKitConnector\Frontend\ScrollSmoother')) {
      return \MotionKitConnector\Frontend\ScrollSmoother::should_run();
    }

    return false;
  }
}

if (!function_exists('motionkit_is_scroll_smoother_enabled_for_current_page')) {
  /**
   * Is the smoother switched on for the current page?
   *
   * @since 1.0.0
   *
   * @return bool True when the page/global settings switch the smoother on.
   */
  function motionkit_is_scroll_smoother_enabled_for_current_page(): bool
  {
    if (class_exists('\MotionKitConnector\Frontend\ScrollSmoother')) {
      return \MotionKitConnector\Frontend\ScrollSmoother::is_enabled_for_current_page();
    }

    return false;
  }
}

if (!function_exists('motionkit_is_scroll_smoother_enabled_globally')) {
  /**
   * Is the smoother switched on at the GLOBAL (all-page) level?
   *
   * @since 1.0.0
   *
   * @return bool True when the global setting switches the smoother on.
   */
  function motionkit_is_scroll_smoother_enabled_globally(): bool
  {
    if (class_exists('\MotionKitConnector\Frontend\ScrollSmoother')) {
      return \MotionKitConnector\Frontend\ScrollSmoother::is_enabled_globally();
    }

    return false;
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
