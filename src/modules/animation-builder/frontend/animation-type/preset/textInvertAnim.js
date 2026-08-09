import { isPreviewMode } from "@/utils/isPreviewMode";

const PRESET_KEY = "motionkit-mk-text-invert-pa";

export function textInvertAnim() {
  // id -> { timelines: [], splits: [] }
  const instances = new Map();

  function teardown(id) {
    const inst = instances.get(id);
    if (!inst) return;
    inst.timelines.forEach((tl) => {
      try {
        tl.revert();
        tl.kill();
      } catch (err) {
        console.warn("[textInvert] timeline teardown error:", err);
      }
    });
    inst.splits.forEach((split) => {
      try {
        split.revert();
      } catch (err) {
        console.warn("[textInvert] split revert error:", err);
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

    const {
      id,
      itemClass,
      trigger: { selector: triggerSelector } = {},
      vars: { start, startCustom, end, endCustom, markers } = {},
    } = anim;

    let elements;
    try {
      elements = document.querySelectorAll(itemClass);
    } catch (err) {
      console.warn(
        `[textInvert] invalid itemClass "${itemClass}":`,
        err.message,
      );
      return;
    }
    if (!elements.length) return;

    teardown(id);

    // Preview-one mode: tag the targets so the editor's inspector keeps its markers, then
    // bail before SplitText rewrites the DOM — only the previewed animation may build.
    if (anim.mkInert) {
      elements.forEach((el) => el.setAttribute("data-motionkit-anim-id", id));
      return;
    }

    const timelines = [];
    const splits = [];

    gsap.set(itemClass, { transition: "none" });
    if (triggerSelector) {
      try {
        gsap.set(triggerSelector, { transition: "none" });
      } catch (err) {
        /* selector may not match — safe to ignore */
      }
    }

    elements.forEach((element, index) => {
      element.setAttribute("data-motionkit-anim-id", id);

      const split = new SplitText(element, {
        type: "lines",
        linesClass: "invert-line",
      });
      splits.push(split);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerSelector || element,
          start: start === "custom" ? startCustom : start,
          end: end === "custom" ? endCustom : end,
          scrub: 1,
          markers: markers === true && isPreviewMode(),
        },
      });

      const lines = element.querySelectorAll(".invert-line");
      tl.from(lines, { opacity: 0.2, ease: "none", stagger: 0.1 });
      timelines.push(tl);
    });

    instances.set(id, { timelines, splits });
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", teardownAll);

  return {
    destroy: () =>
      document.dispatchEvent(new CustomEvent("aae-reset-animation")),
  };
}

textInvertAnim();
