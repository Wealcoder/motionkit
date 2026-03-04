<?php

namespace WcfAnimationBuilder\Frontend;

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

/**
 * ScrollSmoother Manager
 *
 * Outputs the #smooth-wrapper / #smooth-content divs required by GSAP's
 * ScrollSmoother plugin, and boots the plugin via an inline script.
 * Wrapper printing is idempotent — only runs once per request.
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */
final class ScrollSmoother
{
  /** @var bool Whether the opening wrapper has been output */
  private bool $started = false;

  /** @var bool Whether the closing wrapper has been output */
  private bool $ended = false;

  /**
   * Output the opening wrapper markup (once only).
   *
   * @return void
   */
  public function start_wrapper(): void
  {
    if ($this->started) {
      return;
    }

    echo '<div id="smooth-wrapper"><div id="smooth-content">';
    $this->started = true;
  }

  /**
   * Output the closing wrapper markup (once only).
   *
   * @return void
   */
  public function end_wrapper(): void
  {
    if ($this->ended) {
      return;
    }

    echo '</div></div>';
    $this->ended = true;
  }

  /**
   * Print the inline script that boots ScrollSmoother.
   *
   * @return void
   */
  public function run_scroll_smoother(): void
  {
    ?>
    <script>
      document.addEventListener("DOMContentLoaded", () => {
        const smootherWrapper = document.getElementById("smooth-wrapper");
        if (smootherWrapper) {
          const sentinel = document.createElement("div");
          sentinel.className = "wcf-ab-pin-end-selector-26";
          sentinel.hidden = true;
          smootherWrapper.appendChild(sentinel);
        }

        if (typeof window.gsap === "undefined") {
          console.warn("[MotionKit] GSAP is not loaded — ScrollSmoother skipped.");
          return;
        }

        if (typeof window.ScrollSmoother === "undefined") {
          console.warn("[MotionKit] ScrollSmoother is not loaded — ScrollSmoother skipped.");
          return;
        }

        gsap.registerPlugin(ScrollSmoother);

        ScrollSmoother.create({
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
