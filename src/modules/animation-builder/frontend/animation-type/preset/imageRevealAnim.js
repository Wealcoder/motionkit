const PRESET_KEY = "wcf-mk-image-reveal-fa";

export function imageRevealAnim() {
  // id -> { timelines: GSAPTimeline[] }
  const instances = new Map();

  function teardown(id) {
    const inst = instances.get(id);
    if (!inst) return;
    inst.timelines.forEach((tl) => {
      try {
        // revert() restores inline styles from the `from()` tweens, so the
        // container/item don't get stuck in their off-screen reveal state.
        tl.revert();
        tl.kill();
      } catch (err) {
        console.warn("[imageReveal] timeline teardown error:", err);
      }
    });
    instances.delete(id);
  }

  function teardownAll() {
    for (const id of [...instances.keys()]) teardown(id);
  }

  function handler(e) {
    const anim = e?.detail;
    if (!anim || anim.presetKey !== PRESET_KEY) return;
    if (anim.isPublished === false) return;
    if (!anim.itemClass) return;

    let items;
    try {
      items = document.querySelectorAll(anim.itemClass);
    } catch (err) {
      console.warn(
        `[imageReveal] invalid itemClass selector "${anim.itemClass}":`,
        err.message,
      );
      return;
    }
    if (!items.length) return;

    const {
      id,
      triggerClass,
      trigger: { type: triggerType, selector: triggerSelector } = {},
      vars: {
        animationTo,
        delay = 0,
        duration = 1,
        animationStart,
        animationCStart,
        ease,
      } = {},
    } = anim;

    // Prefer the new nested `trigger.selector`; fall back to the legacy
    // top-level `triggerClass` for backwards-compat.
    const resolvedTriggerClass = triggerSelector || triggerClass;
    const resolvedStart =
      animationStart === "custom" ? animationCStart : animationStart;

    // Live-update safety: tear down any prior setup for this id first.
    teardown(id);

    const timelines = [];

    items.forEach((itemEl) => {
      const containerEl = itemEl.parentElement;
      if (!containerEl) return;

      // Tag both nodes so the global reset sweep (lib/resetAllAnimations.js)
      // runs clearProps on each alongside our local teardown.
      containerEl.setAttribute("data-wcf-anim-id", id);
      itemEl.setAttribute("data-wcf-anim-id", id);

      gsap.set(containerEl, {
        autoAlpha: 1,
        overflow: "hidden",
        transition: "none",
      });
      gsap.set(itemEl, {
        overflow: "hidden",
        objectFit: "cover",
      });

      const tlConfig =
        triggerType === "page_load"
          ? { delay }
          : {
              delay,
              scrollTrigger: {
                trigger: resolvedTriggerClass || containerEl,
                start: resolvedStart,
                scrub: triggerType === "play_with_scroll",
              },
            };

      const tl = gsap.timeline(tlConfig);

      // Base duration of 1.5s + user-supplied duration, matching the
      // previous runtime's feel.
      const baseDuration = 1.5 + duration;
      const contentAnim = { ease, duration: baseDuration };
      const imageAnim = { scale: 1.3, ease, duration: baseDuration };

      switch (animationTo) {
        case "left":
          contentAnim.xPercent = -100;
          imageAnim.xPercent = 100;
          break;
        case "right":
          contentAnim.xPercent = 100;
          imageAnim.xPercent = -100;
          break;
        case "top":
          contentAnim.yPercent = -100;
          imageAnim.yPercent = 100;
          break;
        case "bottom":
          contentAnim.yPercent = 100;
          imageAnim.yPercent = -100;
          break;
      }

      // Container + image reveal run in parallel (`"<"` = align to the
      // previous tween's start). Replaces the negative-delay trick
      // (`delay: -1.5 - duration`) from the old runtime.
      tl.from(containerEl, contentAnim);
      tl.from(itemEl, imageAnim, "<");

      timelines.push(tl);
    });

    instances.set(id, { timelines });
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", teardownAll);

  return {
    destroy: () =>
      document.dispatchEvent(new CustomEvent("aae-reset-animation")),
  };
}

imageRevealAnim();
