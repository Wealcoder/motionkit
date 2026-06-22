<?php

namespace WcfAnimationBuilder\Frontend;

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
 *     function that reads wcfanimb.all_settings.scrollSmother and creates,
 *     updates, or kills the ScrollSmoother instance.
 *
 * This runner targets the live WP frontend. Full-preview tabs skip it via the
 * mk_full_preview PHP guard; the editor iframe is driven by the editor's own
 * applyScrollSmoother module (src/lib/gsap/scrollSmoother.js) and never hooks
 * run_scroll_smoother in editor-preview mode.
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */
final class ScrollSmoother
{
  public function run_scroll_smoother(): void
  {
    // Skip the full-preview tab — the editor opens the WP site with its own
    // in-memory state and drives animation/smoother behavior directly.
    if (isset($_GET['mk_full_preview']) && $_GET['mk_full_preview'] === '1') {
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
          sentinel.className = 'wcf-ab-pin-end-selector-26';
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

          var w = window.innerWidth || 0;
          var sorted = list
            .map(function (d) { return { key: d.key, w: parseInt(d.viewWidth, 10) || 0 }; })
            .sort(function (a, b) { return b.w - a.w; });
          for (var j = 0; j < sorted.length; j++) {
            if (w >= sorted[j].w) return sorted[j].key;
          }
          return 'mobile';
        }

        function resolveSmootherValue() {
          var all = (window.wcfanimb && window.wcfanimb.all_settings) || {};
          var gs = (window.wcfanimb && window.wcfanimb.global_settings) || {};

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

          var devices = all.deviceConfig || (window.wcfanimb && window.wcfanimb.device_config) || [];
          var currentKey = resolveDeviceKey(devices);
          
          // scrollSmother has 4 buckets (desktop/laptop/tablet/mobile), deviceConfig has
          // 5 keys (adds tab_land and tab). Read the bucket directly — when the resolved
          // key is tab_land/tab and cfg has no matching entry, fall through to 'tablet'.
          var device = cfg[currentKey];
          
          if (!device && (currentKey === 'tab_land' || currentKey === 'tab')) {
            device = cfg.tablet;
          }
            
          if (!device || device.enable === false) return null;

          // Slider is 0-10 (see scrollSmother.js config). Map to GSAP smooth
          // seconds via /5 so the useful range 0-2s stays reachable without
          // an extra UI knob.
          var raw = Number(device.value);
          if (!isFinite(raw)) raw = 1;
          return Math.max(0, Math.min(2, raw / 5));
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

          ScrollSmoother.create({
            smooth: smooth,
            effects: false           
          });
        };

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', window.motionkitRebootSmoother);
        } else {
          window.motionkitRebootSmoother();
        }
      })();
    </script>
    <?php
  }
}
