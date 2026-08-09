<?php

namespace MotionKit\Frontend;

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

/**
 * ScrollSmoother Manager
 *
 * Prints an inline script in wp_footer that:
 *  1. Injects #smooth-wrapper / #smooth-content around the existing body
 *     children (only if they don't already exist — safe against other plugins).
 *  2. Exposes window.motionkitRebootSmoother() — a settings-driven boot/kill
 *     function that reads motionkit.all_settings.scrollSmother and creates,
 *     updates, or kills the ScrollSmoother instance.
 *
 * This runner targets the live WP frontend. Full-preview tabs skip it via the
 * motionkit_full_preview PHP guard; the editor iframe is driven by the editor's own
 * applyScrollSmoother module (src/lib/gsap/scrollSmoother.js) and never hooks
 * run_scroll_smoother in editor-preview mode.
 *
 * @package MotionKit
 * @since 1.0.0
 */
final class ScrollSmoother
{
  /**
   * Should MotionKit drive the page smoother on THIS request?
   *
   * True only when the site is connected to the MotionKit editor (the
   * "Connector" — an access token is present) AND the ScrollSmoother is switched
   * on for the current page. This is the single source of truth: maybe_init_scroll_smoother()
   * gates on it, and AAE Pro reads the same method to decide whether to stand
   * down — so the two can never fight over the page's one ScrollSmoother.
   */
  public static function should_run(): bool
  {
    if (empty(get_option('motionkit_access_token'))) {
      return false;
    }

    return self::is_enabled_for_current_page();
  }

  /**
   * Is the ScrollSmoother switched on for the current page?
   *
   * Device-agnostic port of resolveSmootherValue() below (PHP has no matchMedia,
   * so "on for any device" counts). Mirrors the page/global merge in
   * Frontend.php: the page's scrollSmother replaces global's when present,
   * `allPage` always comes from global, a page override beats the all-page master
   * kill, and `value` 0 means off (the slider is 0-2).
   */
  public static function is_enabled_for_current_page(): bool
  {
    $page_ss = self::current_page_scroll_smoother();

    // Page override wins whole; otherwise the global baseline applies.
    return self::config_enables_smoother(!empty($page_ss) ? $page_ss : self::global_scroll_smoother());
  }

  /**
   * Is the ScrollSmoother switched on at the GLOBAL (all-page) level, ignoring any
   * per-page override? For admin/dashboard use, where there is no front-end page
   * to resolve a per-page setting against. AAE Pro reads this to tell the user, in
   * its own Scroll Smoother panel, that MotionKit is handling the smoother.
   */
  public static function is_enabled_globally(): bool
  {
    return self::config_enables_smoother(self::global_scroll_smoother());
  }

  /** The global scrollSmother config, or null. */
  private static function global_scroll_smoother()
  {
    $global = get_option('motionkit_global_settings');

    return (is_array($global) && isset($global['scrollSmother']) && is_array($global['scrollSmother']))
      ? $global['scrollSmother']
      : null;
  }

  /**
   * Does a scrollSmother config (page override or global) switch the smoother on
   * for any device? Device-agnostic — the runtime picks the device via matchMedia;
   * PHP can't, so "on for any device" is the answer, which is the safe direction.
   *
   * @param mixed $cfg
   */
  private static function config_enables_smoother($cfg): bool
  {
    if (!is_array($cfg)) {
      return false;
    }

    // The frontend runtime flattens scrollSmother.allPage -> scrollSmother
    // (enqueue_frontend_scripts()), so device buckets live inside allPage for the
    // global config. Read from the same place the runtime does.
    if (isset($cfg['allPage']) && is_array($cfg['allPage'])) {
      $cfg = $cfg['allPage'];
    }

    if (isset($cfg['enable']) && false === $cfg['enable']) {
      return false;
    }

    foreach (['desktop', 'laptop', 'tablet', 'mobile'] as $device) {
      $bucket = (isset($cfg[$device]) && is_array($cfg[$device])) ? $cfg[$device] : null;
      if ($bucket && false !== ($bucket['enable'] ?? true) && (float) ($bucket['value'] ?? 0) > 0) {
        return true;
      }
    }

    return false;
  }

  /** The current page's scrollSmother override (motionkit_pg_settings_<type>), or null. */
  private static function current_page_scroll_smoother()
  {
    if (!class_exists('\MotionKit\Common\MotionkitBuilderPageType')) {
      return null;
    }

    try {
      $pt  = \MotionKit\Common\MotionkitBuilderPageType::instance();
      $cfg = $pt->getCurrentPageType();

      if (!is_array($cfg) || empty($cfg['option'])) {
        return null;
      }

      // getCurrentPageType() returns the ANIMATION key; settings live under the
      // motionkit_pg_settings_ prefix (same swap settings_config() does).
      $cfg['option'] = str_replace('motionkit_pg_animation_', 'motionkit_pg_settings_', $cfg['option']);
      $settings      = $pt->getConfig($cfg);
    } catch (\Throwable $e) {
      return null;
    }

    return (is_array($settings) && isset($settings['scrollSmother']) && is_array($settings['scrollSmother']))
      ? $settings['scrollSmother']
      : null;
  }

  public function run_scroll_smoother(): void
  {
    // Skip the full-preview tab — the editor opens the WP site with its own
    // in-memory state and drives animation/smoother behavior directly.
    if (isset($_GET['motionkit_full_preview']) && $_GET['motionkit_full_preview'] === '1') {
      return;
    }
    ?>
    <script>
      (function () {
        function ensureWrapper() {
          var wrapper = document.getElementById('smooth-wrapper');
          if (wrapper) return wrapper;

          wrapper = document.createElement('div');
          wrapper.id = 'smooth-wrapper';

          var content = document.createElement('div');
          content.id = 'smooth-content';

          while (document.body.firstChild) {
            content.appendChild(document.body.firstChild);
          }

          wrapper.appendChild(content);
          document.body.appendChild(wrapper);

          // Sentinel for pin-end detection used elsewhere in the suite.
          var sentinel = document.createElement('div');
          sentinel.className = 'motionkit-pin-end-selector-26';
          sentinel.hidden = true;
          wrapper.appendChild(sentinel);

          return wrapper;
        }

        // Resolve the current device key from deviceConfig using viewWidth
        // as descending thresholds against window.innerWidth. Handles both
        // shapes: flat array OR editor-object ({ desktop: {...}, laptop: {...},
        // tab_land: {...}, tab: {...}, mobile: {...} }).
        function resolveDeviceKey(deviceConfig) {
          var list;
          if (Array.isArray(deviceConfig)) {
            list = deviceConfig;
          } else if (deviceConfig && typeof deviceConfig === 'object') {
            var order = ['desktop', 'laptop', 'tab_land', 'tab', 'mobile'];
            list = [];
            for (var o = 0; o < order.length; o++) {
              var entry = deviceConfig[order[o]];
              if (entry) list.push(entry);
            }
          } else {
            return 'desktop';
          }

          // Match by the device's own mediaQuery — same detection the animation runner uses (frontend.js detectCurrentDevice) — so the smoother lands on the same device bucket the animations do. Do NOT threshold on viewWidth: that is a canvas size (desktop = 1920px), not a breakpoint, so a normal sub-1920 desktop window would wrongly resolve to laptop/tablet and read the wrong scrollSmother bucket.
          for (var i = 0; i < list.length; i++) {
            var d = list[i];
            if (d && d.mediaQuery) {
              try {
                if (window.matchMedia(d.mediaQuery).matches) return d.key;
              } catch (e) {}
            }
          }
          return (list[0] && list[0].key) || 'desktop';
        }

        function resolveSmootherValue() {
          var all = (window.motionkitData && window.motionkitData.all_settings) || {};
          var gs = (window.motionkitData && window.motionkitData.global_settings) || {};

          // Per-page override wins whole — when the page has an explicit enable
          // flag it takes full precedence, even over an all-page OFF master switch,
          // so a single page can re-enable smoother while it's globally disabled.
          // Only apply the master kill when the page has no override. Mirrors
          // resolveScrollSmoother.js so editor preview and live site agree.
          var allPage = gs.scrollSmother && gs.scrollSmother.allPage;
          var cfg = all.scrollSmother || null;
          var hasPageOverride = cfg && typeof cfg.enable !== 'undefined';

          if (!hasPageOverride && allPage && allPage.enable === false) return null;

          if (!cfg || cfg.enable === false) return null;

          var devices = all.deviceConfig || (window.motionkitData && window.motionkitData.device_config) || [];
          var currentKey = resolveDeviceKey(devices);
          
          // scrollSmother has 4 buckets (desktop/laptop/tablet/mobile), deviceConfig has
          // 5 keys (adds tab_land and tab). Read the bucket directly — when the resolved
          // key is tab_land/tab and cfg has no matching entry, fall through to 'tablet'.
          var device = cfg[currentKey];
          
          if (!device && (currentKey === 'tab_land' || currentKey === 'tab')) {
            device = cfg.tablet;
          }
            
          if (!device || device.enable === false) return null;

          // Slider is 0-2 (see scrollSmother.js: min 0, max 2) and maps straight to GSAP smooth seconds — no /5. Must match the editor's resolveSmoothSeconds (src/lib/gsap/scrollSmoother.js) so the live site and editor preview feel identical.
          var raw = Number(device.value);
          if (!isFinite(raw)) raw = 1;
          var smooth = Math.max(0, Math.min(2, raw));
          // value 0 means no smoothing — return null so motionkitRebootSmoother kills/skips the smoother and native scrolling stays. A ScrollSmoother created with smooth:0 still hijacks the scroll container but applies zero lerp, which freezes scrolling.
          return smooth > 0 ? smooth : null;
        }

        window.motionkitRebootSmoother = function () {
          if (typeof window.gsap === 'undefined' || typeof window.ScrollSmoother === 'undefined') {
            return;
          }

          gsap.registerPlugin(ScrollSmoother);
          var existing = ScrollSmoother.get();
          var smooth = resolveSmootherValue();

          if (smooth === null) {
            if (existing) existing.kill();
            return;
          }

          ensureWrapper();

          if (existing) {
            existing.smooth(smooth);
            return;
          }

          // normalizeScroll:true is required for ScrollSmoother to smooth on touch/mobile devices — without it the smoother is a no-op there (native touch scroll). Mirror the editor's create options (src/lib/gsap/scrollSmoother.js) so all devices behave identically.
          ScrollSmoother.create({
            smooth: smooth,
            effects: false,
            normalizeScroll: true,
            ignoreMobileResize: false
          });
        };

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', window.motionkitRebootSmoother);
        } else {
          window.motionkitRebootSmoother();
        }

        // The device bucket is resolved from the live viewport (matchMedia), so resizing across a breakpoint or rotating a device must re-resolve and boot/kill the smoother. Without this, a visitor who loads at desktop width (or with desktop disabled) and then narrows to tablet/mobile keeps the desktop resolution and the other buckets never take effect. Debounced so a resize drag doesn't thrash create/kill.
        var _mkSmootherResizeTimer;
        function _mkRebootSmootherDebounced() {
          clearTimeout(_mkSmootherResizeTimer);
          _mkSmootherResizeTimer = setTimeout(window.motionkitRebootSmoother, 200);
        }
        window.addEventListener('resize', _mkRebootSmootherDebounced);
        window.addEventListener('orientationchange', _mkRebootSmootherDebounced);
      })();
    </script>
    <?php
  }
}
