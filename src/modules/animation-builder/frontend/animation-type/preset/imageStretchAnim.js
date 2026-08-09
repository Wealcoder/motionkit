import { isPreviewMode } from "@/utils/isPreviewMode";

const PRESET_KEY = "motionkit-mk-image-stretch-pa";

export function imageStretchAnim() {
  // id -> { timelines: GSAPTimeline[] }
  const instances = new Map();

  function teardown(id) {
    const inst = instances.get(id);
    if (!inst) return;
    inst.timelines.forEach((tl) => {
      try {
        tl.revert();
        tl.kill();
      } catch (err) {
        console.warn("[imageStretch] timeline teardown error:", err);
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
      itemMaxWidth,
      itemMinWidth,
      itemHeight,
      start,
      startCustom,
      end,
      endCustom,
      objectFit,
      markers,
    } = vars;

    if (!containerHeight) return;

    let containerEl;
    try {
      containerEl = document.querySelector(containerClass);
    } catch (err) {
      console.warn(
        `[imageStretch] invalid containerClass selector "${containerClass}":`,
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
        `[imageStretch] invalid itemClass selector "${itemClass}":`,
        err.message,
      );
      return;
    }
    if (!items.length) return;

    teardown(id);

    // Tag both layers so the global reset sweep runs clearProps on them.
    containerEl.setAttribute("data-motionkit-anim-id", id);
    items.forEach((el) => el.setAttribute("data-motionkit-anim-id", id));

    // Preview-one mode: targets stay tagged above so the editor's inspector keeps
    // its markers, but nothing is built — only the previewed animation may play.
    if (anim.mkInert) return;

    gsap.set(containerEl, {
      height: containerHeight,
      transition: "none",
    });
    gsap.set(itemClass, {
      objectFit,
      width: itemMinWidth,
      height: itemHeight,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerEl,
        pin: true,
        start: start === "custom" ? startCustom : start || "top top",
        end: end === "custom" ? endCustom : end || "bottom bottom",
        scrub: true,
        pinSpacing: false,
        // Markers are editor-only — gate on isPreviewMode so they never
        // render on the public frontend.
        markers: markers === true && isPreviewMode(),
      },
    });

    tl.to(itemClass, { width: itemMaxWidth ?? "100%" });

    instances.set(id, { timelines: [tl] });
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", teardownAll);

  return {
    destroy: () =>
      document.dispatchEvent(new CustomEvent("aae-reset-animation")),
  };
}

imageStretchAnim();
