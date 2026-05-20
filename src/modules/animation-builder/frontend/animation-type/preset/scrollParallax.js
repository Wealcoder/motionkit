const PRESET_KEY = "wcf-mk-scroll-parallax-pa";

export function scrollParallax() {
  // id -> { timelines: GSAPTimeline[], cleanups: Array<() => void> }
  const instances = new Map();
  /**
   * Clamp a number between min and max.
   */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Kill and revert all timelines + run cleanups for a given animation ID.
   */
  function teardown(id) {
    const inst = instances.get(id);
    if (!inst) return;

    inst.timelines.forEach((tl) => {
      try {
        tl.revert();
        tl.kill();
      } catch (err) {
        console.warn("[scrollParallax] timeline teardown error:", err);
      }
    });

    inst.cleanups.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.warn("[scrollParallax] cleanup error:", err);
      }
    });

    instances.delete(id);
  }

  /**
   * Tear down every active parallax instance (used on reset event).
   */
  function teardownAll() {
    for (const id of [...instances.keys()]) teardown(id);
  }

  // ─── Main Handler ────────────────────────────────────────────────────────────

  function handler(e) {
    const anim = e?.detail;

    // ── Guard: only handle our preset key ──
    if (!anim || anim.presetKey !== PRESET_KEY) return;

    // ── Guard: skip unpublished (editor preview) ──
    if (anim.isPublished === false) return;

    // ── Guard: require selectors ──
    if (!anim.containerClass || !anim.itemClass) return;

    const { id, containerClass, itemClass, vars = {} } = anim;

    const {
      speed = 0.5,
      direction = "vertical",
      scrub: scrubCfg,
      start = "top bottom",
      end = "bottom top",
      offset = 0,
      willChange = true,
    } = vars;

    // ── Resolve container element ──
    let containerEl;
    try {
      containerEl = document.querySelector(containerClass);
    } catch (err) {
      console.warn(
        `[scrollParallax] invalid containerClass "${containerClass}":`,
        err.message
      );
      return;
    }
    if (!containerEl) return;

    // ── Resolve target element ──
    let targetEl;
    try {
      targetEl = document.querySelector(itemClass);
    } catch (err) {
      console.warn(
        `[scrollParallax] invalid itemClass "${itemClass}":`,
        err.message
      );
      return;
    }
    if (!targetEl) return;

    // ── Teardown any existing instance for this ID before re-creating ──
    teardown(id);

    // ── Tag elements with animation ID for debugging ──
    containerEl.setAttribute("data-wcf-anim-id", id);
    targetEl.setAttribute("data-wcf-anim-id", id);

    // ── Performance hint: GPU compositing layer ──
    if (willChange) {
      targetEl.style.willChange = "transform";
    }

    // ── Calculate parallax travel distance ──
    // The element's height is used as the base travel unit.
    // speed < 1 → less travel than container height  (feels far/background)
    // speed > 1 → more travel than container height  (feels close/foreground)
    // We clamp speed to a safe range to prevent runaway values.
    const safeSpeed = clamp(Number(speed), 0.1, 3.0);

    // Travel = how many px the element shifts over the full scroll range.
    // Formula: (1 - speed) * containerHeight
    //   speed 0.5 on a 600px container → (1 - 0.5) * 600 = 300px upward shift
    //   speed 1.5 on a 600px container → (1 - 1.5) * 600 = -300px (downward shift)
    const containerHeight = containerEl.offsetHeight || 0;
    const containerWidth = containerEl.offsetWidth || 0;

    const isVertical = direction !== "horizontal";
    const baseDimension = isVertical ? containerHeight : containerWidth;
    const travel = (1 - safeSpeed) * baseDimension + Number(offset);

    // ── Build GSAP fromTo values based on direction ──
    const fromVars = isVertical
      ? { yPercent: 0, y: 0 }
      : { xPercent: 0, x: 0 };

    const toVars = isVertical
      ? { y: travel, ease: "none" }
      : { x: travel, ease: "none" };

    // ── Scrub value: numeric = smoothed, true = instant ──
    const scrubValue = typeof scrubCfg === "number" ? scrubCfg : true;

    // ── Build the ScrollTrigger timeline ──
    const tl = gsap.timeline({
      defaults: { duration: 1 },
      scrollTrigger: {
        trigger: containerEl,     // watches the container for scroll position
        start,                    // e.g. "top bottom"
        end,                      // e.g. "bottom top"
        scrub: scrubValue,        // ties animation progress directly to scroll
        invalidateOnRefresh: true, // recalculates on window resize
      },
    });

    tl.fromTo(targetEl, fromVars, toVars);

    // ── Cleanups: remove will-change on teardown to free GPU memory ──
    const cleanups = [
      () => {
        if (willChange) {
          targetEl.style.willChange = "";
        }
      },
    ];

    instances.set(id, { timelines: [tl], cleanups });
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", teardownAll);

  return {
    destroy: () =>
      document.dispatchEvent(new CustomEvent("aae-reset-animation")),
  };
}

//scrollParallax();