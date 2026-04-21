const PRESET_KEY = "wcf-mk-image-scale-pa";

export function imageScaleAnim() {
  // id -> { timelines: GSAPTimeline[] }
  const instances = new Map();

  function isTruthyFlag(value) {
    // Accept both real booleans and the string form the old switch emitted.
    return value === true || value === "true";
  }

  function teardown(id) {
    const inst = instances.get(id);
    if (!inst) return;
    inst.timelines.forEach((tl) => {
      try {
        tl.revert();
        tl.kill();
      } catch (err) {
        console.warn("[imageScale] timeline teardown error:", err);
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
    if (!anim.itemClass || !anim.containerClass) return;

    const { id, containerClass, itemClass, vars = {} } = anim;
    const {
      containerHeight,
      scale,
      transformOrigin,
      animationStart,
      animationCStart,
      animationEnd,
      animationCEnd,
      ease,
      playOnScroll,
    } = vars;

    if (!containerHeight) return;

    let containerEl;
    try {
      containerEl = document.querySelector(containerClass);
    } catch (err) {
      console.warn(
        `[imageScale] invalid containerClass selector "${containerClass}":`,
        err.message,
      );
      return;
    }
    if (!containerEl) return;

    let items;
    try {
      items = document.querySelectorAll(itemClass);
    } catch (err) {
      console.warn(
        `[imageScale] invalid itemClass selector "${itemClass}":`,
        err.message,
      );
      return;
    }
    if (!items.length) return;

    teardown(id);

    // Tag both layers so the global reset sweep runs clearProps on them.
    containerEl.setAttribute("data-wcf-anim-id", id);
    items.forEach((el) => el.setAttribute("data-wcf-anim-id", id));

    gsap.set(containerEl, {
      height: containerHeight,
      transition: "none",
    });
    gsap.set(itemClass, {
      maxHeight: "100vh",
      objectFit: "cover",
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerEl,
        pin: true,
        start: animationStart === "custom" ? animationCStart : animationStart,
        end: animationEnd === "custom" ? animationCEnd : animationEnd,
        scrub: isTruthyFlag(playOnScroll),
        pinSpacing: false,
      },
    });

    tl.from(itemClass, { scale, transformOrigin, ease });

    instances.set(id, { timelines: [tl] });
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", teardownAll);

  return {
    destroy: () =>
      document.dispatchEvent(new CustomEvent("aae-reset-animation")),
  };
}

imageScaleAnim();
