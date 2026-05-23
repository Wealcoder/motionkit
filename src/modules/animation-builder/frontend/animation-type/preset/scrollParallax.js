const PRESET_KEY = "wcf-mk-scroll-parallax-pa";

export function scrollParallax() {
  const instances = new Map();

  function teardown(id) {
    const inst = instances.get(id);
    if (!inst) return;
    inst.effects.forEach((ef) => {
      try {
        ef.kill();
      } catch (err) {
        console.warn("[scrollParallax] effect teardown error:", err);
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
    if (w >= 992) return "laptop";
    if (w >= 768) return "tab_land";
    if (w >= 576) return "tab";
    return "mobile";
  }

  function handler(e) {
    const anim = e?.detail;

    if (!anim || anim.presetKey !== PRESET_KEY) return;
    if (anim.isPublished === false) return;

    const { id } = anim;

    const parallaxItems =
      Array.isArray(anim.parallaxItems) && anim.parallaxItems.length > 0
        ? anim.parallaxItems
        : [];

    if (parallaxItems.length === 0) {
      console.warn("[scrollParallax] no parallaxItems found, skipping.");
      return;
    }

    // ── Get ScrollSmoother instance ──
    const smoother = ScrollSmoother.get();
    if (!smoother) {
      console.warn("[scrollParallax] ScrollSmoother is not initialized.");
      return;
    }
    console.log({ parallaxItems, smoother });

    teardown(id);

    const device = getCurrentDevice();
    const effects = [];

    parallaxItems.forEach((itemConfig) => {
      const { itemClass, devices = {} } = itemConfig;
      if (!itemClass) return;

      // ── Resolve element ──
      let targetEl;
      try {
        targetEl = document.querySelector(itemClass);
      } catch (err) {
        console.warn(
          `[scrollParallax] invalid itemClass "${itemClass}":`,
          err.message,
        );
        return;
      }
      if (!targetEl) {
        console.warn(
          `[scrollParallax] element not found for "${itemClass}", skipping.`,
        );
        return;
      }

      // ── Read device values ──
      const bucket = devices[device] ?? devices.desktop ?? {};
      const speed = Number(bucket.dataSpeed ?? 1);
      const lag = Number(bucket.dataLag ?? 0);

      // ── Apply via ScrollSmoother effects API ──
      // This is all we need — ScrollSmoother handles everything internally.
      const effect = smoother.effects(targetEl, { speed, lag });
      effects.push(effect);
    });

    if (effects.length === 0) return;

    instances.set(id, { effects });
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", teardownAll);

  return {
    destroy: () =>
      document.dispatchEvent(new CustomEvent("aae-reset-animation")),
  };
}

scrollParallax();
