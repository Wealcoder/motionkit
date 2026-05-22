const PRESET_KEY = "wcf-mk-scroll-parallax-pa";

export function scrollParallax() {
  const instances = new Map();

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function teardown(id) {
    const inst = instances.get(id);
    if (!inst) return;
    inst.timelines.forEach((tl) => {
      try { tl.revert(); tl.kill(); } catch (err) {
        console.warn("[scrollParallax] timeline teardown error:", err);
      }
    });
    inst.cleanups.forEach((fn) => {
      try { fn(); } catch (err) {
        console.warn("[scrollParallax] cleanup error:", err);
      }
    });
    instances.delete(id);
  }

  function teardownAll() {
    for (const id of [...instances.keys()]) teardown(id);
  }

  // ─── Detect current device from viewport width ────────────────────────────

  function getCurrentDevice() {
    const w = window.innerWidth;
    if (w >= 1200) return "desktop";
    if (w >= 992)  return "laptop";
    if (w >= 768)  return "tab_land";
    if (w >= 576)  return "tab";
    return "mobile";
  }

  // ─── Build timeline for a single parallax item ───────────────────────────────

  function buildItemTimeline(itemConfig, containerEl) {
    const { itemClass, devices = {} } = itemConfig;

    if (!itemClass) {
      console.warn("[scrollParallax] item missing itemClass, skipping.");
      return null;
    }

    // Read values from the correct device bucket
    const device      = getCurrentDevice();
    const bucket      = devices[device] ?? devices.desktop ?? {};
    const dataSpeed   = bucket.dataSpeed ?? 0.5;
    const dataLag     = bucket.dataLag   ?? 0;

    // Resolve target element
    let targetEl;
    try {
      targetEl = document.querySelector(itemClass);
    } catch (err) {
      console.warn(`[scrollParallax] invalid itemClass "${itemClass}":`, err.message);
      return null;
    }
    if (!targetEl) {
      console.warn(`[scrollParallax] element not found for "${itemClass}", skipping.`);
      return null;
    }

    targetEl.style.willChange = "transform";

    // Calculate travel distance
    const safeSpeed  = clamp(Number(dataSpeed), 0.1, 3.0);
    const travel     = -((1 - safeSpeed) * (containerEl.offsetHeight || 0));
    const scrubValue = dataLag > 0 ? dataLag : true;

    const tl = gsap.timeline({
      defaults: { duration: 1 },
      scrollTrigger: {
        trigger: containerEl,
        start: "top bottom",
        end: "bottom top",
        scrub: scrubValue,
        invalidateOnRefresh: true,
      },
    });

    tl.fromTo(targetEl, { y: 0 }, { y: travel, ease: "none" });

    const cleanup = () => { targetEl.style.willChange = ""; };

    return { timeline: tl, cleanup };
  }

  // ─── Main Handler ─────────────────────────────────────────────────────────────

  function handler(e) {
    const anim = e?.detail;

    if (!anim || anim.presetKey !== PRESET_KEY) return;
    if (anim.isPublished === false) return;

    const { id, containerClass } = anim;

    // parallaxItems lives at root of anim, not inside vars
    const parallaxItems = Array.isArray(anim.parallaxItems) && anim.parallaxItems.length > 0
      ? anim.parallaxItems
      : [];

    if (parallaxItems.length === 0) {
      console.warn("[scrollParallax] no parallaxItems found, skipping.");
      return;
    }

    teardown(id);

    const timelines = [];
    const cleanups  = [];

    parallaxItems.forEach((itemConfig) => {
      // Resolve container — use containerClass if given, else item's parent
      let containerEl = null;

      if (containerClass) {
        try {
          containerEl = document.querySelector(containerClass);
        } catch (err) {
          console.warn(`[scrollParallax] invalid containerClass "${containerClass}":`, err.message);
        }
      }

      if (!containerEl) {
        try {
          const el = document.querySelector(itemConfig.itemClass);
          containerEl = el?.parentElement || null;
        } catch (_) {}
      }

      if (!containerEl) {
        console.warn("[scrollParallax] no container found for item, skipping.");
        return;
      }

      containerEl.setAttribute("data-wcf-anim-id", id);

      const result = buildItemTimeline(itemConfig, containerEl);
      if (!result) return;

      timelines.push(result.timeline);
      cleanups.push(result.cleanup);
    });

    if (timelines.length === 0) return;

    instances.set(id, { timelines, cleanups });
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", teardownAll);

  return {
    destroy: () =>
      document.dispatchEvent(new CustomEvent("aae-reset-animation")),
  };
}

scrollParallax();