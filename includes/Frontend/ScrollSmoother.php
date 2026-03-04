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
 *  2. Boots GSAP's ScrollSmoother plugin.
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */
final class ScrollSmoother
{
  /**
   * Print the inline script that injects the wrapper and boots ScrollSmoother.
   *
   * @return void
   */
  public function run_scroll_smoother(): void
  {
    ?>
    <script>
      document.addEventListener("DOMContentLoaded", () => {
       
        // ── 1. Inject wrapper if not already present ──────────────────
        let smootherWrapper = document.getElementById("smooth-wrapper");
        
        if (!smootherWrapper) {
          smootherWrapper = document.createElement("div");
          smootherWrapper.id = "smooth-wrapper";

          const smootherContent = document.createElement("div");
          smootherContent.id = "smooth-content";

          // Move all existing body children into #smooth-content
          while (document.body.firstChild) {
            smootherContent.appendChild(document.body.firstChild);
          }

          smootherWrapper.appendChild(smootherContent);
          document.body.appendChild(smootherWrapper);
        }

        // ── 2. Add sentinel for pin-end detection ─────────────────────
        const sentinel = document.createElement("div");
        sentinel.className = "wcf-ab-pin-end-selector-26";
        sentinel.hidden = true;
        smootherWrapper.appendChild(sentinel);

        // ── 3. Boot ScrollSmoother ────────────────────────────────────
        if (typeof window.gsap === "undefined") {
          console.warn("[MotionKit] GSAP is not loaded — ScrollSmoother skipped.");
          return;
        }

        if (typeof window.ScrollSmoother === "undefined") {
          console.warn("[MotionKit] ScrollSmoother is not loaded — ScrollSmoother skipped.");
          return;
        }

        gsap.registerPlugin(ScrollSmoother);
        const existing = ScrollSmoother.get();
        const motionkit_smoother = existing || ScrollSmoother.create({
          smooth: 1.35,
          effects: true,
          smoothTouch: 0.1,
          normalizeScroll: false,
          ignoreMobileResize: false,
        });

      });
    </script>
    <?php
  }
}
