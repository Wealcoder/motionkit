import { isPreviewMode } from "@/utils/isPreviewMode";

const PRESET_KEY = "motionkit-mk-text-wave-pa";

export function textWaveAnim() {
  // id -> { tweens: [], splits: [], cleanups: [] }
  const instances = new Map();

  function teardown(id) {
    const inst = instances.get(id);
    if (!inst) return;
    inst.tweens.forEach((t) => {
      try {
        t.kill();
      } catch {}
    });
    inst.splits.forEach((s) => {
      try {
        s.revert();
      } catch {}
    });
    inst.cleanups.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
    if (window.ScrollTrigger) {
      const st = window.ScrollTrigger.getById(id);
      if (st) {
        try {
          st.kill();
        } catch {}
      }
    }
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
      trigger: { type: triggerType, selector: triggerSelector } = {},
      vars: {
        start,
        startCustom,
        end,
        endCustom,
        intensity = 2,
        yOffset = -25,
        stagger = 0.05,
        duration = 0.8,
        ease = "sine.inOut",
        markers,
      } = {},
    } = anim;

    let items;
    try {
      items = document.querySelectorAll(itemClass);
    } catch (err) {
      console.warn(`[textWave] invalid itemClass "${itemClass}":`, err.message);
      return;
    }
    if (!items.length) return;

    teardown(id);

    // Preview-one mode: tag the targets so the editor's inspector keeps its markers, then
    // bail before SplitText rewrites the DOM — only the previewed animation may build.
    if (anim.mkInert) {
      items.forEach((el) => el.setAttribute("data-motionkit-anim-id", id));
      return;
    }

    const tweens = [];
    const splits = [];
    const cleanups = [];

    let splitInstance;
    try {
      splitInstance = new SplitText(itemClass, {
        type: "chars",
        smartWrap: true,
      });
    } catch (err) {
      console.error("[textWave] SplitText failed:", err);
      return;
    }
    splits.push(splitInstance);
    const chars = splitInstance.chars;
    if (!chars?.length) return;

    items.forEach((el) => el.setAttribute("data-motionkit-anim-id", id));

    const previewMarkers = markers === true && isPreviewMode();

    // Each character's rotationZ is a linear function of its position in the
    // string — near 0deg at the middle, growing toward the two ends — so the
    // text reads as a gentle tilt-gradient rather than every character
    // rotating the same amount. Nesting repeat/yoyo inside `stagger` (rather
    // than on the tween itself) makes each character loop independently,
    // phase-offset by `stagger`, which is what reads as a wave traveling
    // across the text instead of every character bobbing in sync.
    const buildLoop = () =>
      gsap.to(chars, {
        y: yOffset,
        rotationZ: (i, el, arr) => (i - arr.length / 2) * intensity,
        duration,
        ease,
        stagger: { each: stagger, repeat: -1, yoyo: true },
      });

    const runScroll = () => {
      const tween = buildLoop();
      tween.pause();
      const st = window.ScrollTrigger?.create({
        id,
        trigger: triggerSelector || itemClass,
        start: start === "custom" ? startCustom : start || "top 80%",
        end: end === "custom" ? endCustom : end || "bottom 20%",
        once: true,
        markers: previewMarkers,
        onEnter: () => tween.play(),
      });
      tweens.push(tween);
      cleanups.push(() => {
        try {
          st?.kill();
        } catch {}
      });
    };

    const runPageLoad = () => {
      tweens.push(buildLoop());
    };

    const attachHover = () => {
      if (!triggerSelector) return;
      let triggers;
      try {
        triggers = document.querySelectorAll(triggerSelector);
      } catch (err) {
        return;
      }
      triggers.forEach((el) => {
        let tween = null;
        const onEnter = () => {
          if (!tween) {
            tween = buildLoop();
            tweens.push(tween);
          } else {
            tween.play();
          }
        };
        const onLeave = () => {
          tween?.pause();
        };
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          el.removeEventListener("mouseenter", onEnter);
          el.removeEventListener("mouseleave", onLeave);
        });
      });
    };

    const attachClick = () => {
      if (!triggerSelector) return;
      let triggers;
      try {
        triggers = document.querySelectorAll(triggerSelector);
      } catch (err) {
        return;
      }
      let tween = null;
      triggers.forEach((el) => {
        const onClick = () => {
          if (!tween) {
            tween = buildLoop();
            tweens.push(tween);
          } else if (tween.paused()) {
            tween.play();
          } else {
            tween.pause();
          }
        };
        el.addEventListener("click", onClick);
        cleanups.push(() => el.removeEventListener("click", onClick));
      });
    };

    switch (triggerType) {
      case "on_scroll":
        runScroll();
        break;
      case "page_load":
        runPageLoad();
        break;
      case "hover":
        attachHover();
        break;
      case "click":
        attachClick();
        break;
      default:
        break;
    }

    instances.set(id, { tweens, splits, cleanups });
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", teardownAll);

  return {
    destroy: () =>
      document.dispatchEvent(new CustomEvent("aae-reset-animation")),
  };
}

textWaveAnim();
