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

  function getCurrentDevice() {
    const w = window.innerWidth;
    if (w >= 1200) return "desktop";
    if (w >= 992)  return "laptop";
    if (w >= 768)  return "tab_land";
    if (w >= 576)  return "tab";
    return "mobile";
  }

  function handler(e) {
    const anim = e?.detail;

    if (!anim || anim.presetKey !== PRESET_KEY) return;
    if (anim.isPublished === false) return;

    const { id, containerClass } = anim;

    const parallaxItems = Array.isArray(anim.parallaxItems) && anim.parallaxItems.length > 0
      ? anim.parallaxItems
      : [];

    if (parallaxItems.length === 0) {
      console.warn("[scrollParallax] no parallaxItems found, skipping.");
      return;
    }

    teardown(id);

    const device    = getCurrentDevice();
    const timelines = [];
    const cleanups  = [];

    parallaxItems.forEach((itemConfig) => {
      const { itemClass, devices = {} } = itemConfig;
      if (!itemClass) return;

      // ── Resolve target element ──
      let targetEl;
      try {
        targetEl = document.querySelector(itemClass);
      } catch (err) {
        console.warn(`[scrollParallax] invalid itemClass "${itemClass}":`, err.message);
        return;
      }
      if (!targetEl) {
        console.warn(`[scrollParallax] element not found for "${itemClass}", skipping.`);
        return;
      }

      // ── Resolve trigger element ──
      let triggerEl = null;
      if (containerClass) {
        try { triggerEl = document.querySelector(containerClass); } catch (_) {}
      }
      if (!triggerEl) triggerEl = targetEl.parentElement || targetEl;

      triggerEl.setAttribute("data-wcf-anim-id", id);

      // ── Device values ──
      const bucket     = devices[device] ?? devices.desktop ?? {};
      const dataSpeed  = clamp(Number(bucket.dataSpeed ?? 1), 0, 3.0);
      const dataLag    = bucket.dataLag ?? 0;
      const scrubValue = dataLag > 0 ? dataLag : true;

      targetEl.style.willChange = "transform";
      cleanups.push(() => { targetEl.style.willChange = ""; });

      // ── GSAP data-speed parallax ──
      // Exactly how GSAP ScrollSmoother applies data-speed:
      // yPercent: -100 * (1 - speed)
      //   speed 0.5 → yPercent: -50  → moves UP at half scroll speed
      //   speed 1.0 → yPercent:   0  → no movement (normal scroll)
      //   speed 1.5 → yPercent:  50  → moves DOWN faster than scroll
      const tl = gsap.timeline({
        defaults: { duration: 1 },
        scrollTrigger: {
          trigger: triggerEl,
          start: "top bottom",
          end: "bottom top",
          scrub: scrubValue,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(targetEl,
        { yPercent: 100 * (1 - dataSpeed) },
        { yPercent: -100 * (1 - dataSpeed), ease: "none" }
      );

      timelines.push(tl);
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