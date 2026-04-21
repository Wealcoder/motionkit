import { isPreviewMode } from "@/utils/isPreviewMode";

const PRESET_KEY = "wcf-mk-text-split-pa";

export function textSplitAnim() {
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
      splitType = "chars",
      trigger: { type: triggerType, selector: triggerSelector } = {},
      vars: {
        start,
        startCustom,
        end,
        endCustom,
        delay = 0,
        duration = 1,
        stagger = 0.05,
        x,
        y,
        ease,
        markers,
      } = {},
    } = anim;

    let items;
    try {
      items = document.querySelectorAll(itemClass);
    } catch (err) {
      console.warn(
        `[textSplit] invalid itemClass "${itemClass}":`,
        err.message,
      );
      return;
    }
    if (!items.length) return;

    teardown(id);

    const tweens = [];
    const splits = [];
    const cleanups = [];

    gsap.set(itemClass, { transition: "none" });
    if (triggerSelector) {
      try {
        gsap.set(triggerSelector, { transition: "none" });
      } catch {}
    }

    let splitInstance;
    try {
      splitInstance = new SplitText(itemClass, { type: "chars, words, lines" });
    } catch (err) {
      console.error("[textSplit] SplitText failed:", err);
      return;
    }
    splits.push(splitInstance);
    const target = splitInstance[splitType];
    if (!target?.length) {
      console.warn("[textSplit] no split targets for", splitType);
      return;
    }

    items.forEach((el) => el.setAttribute("data-wcf-anim-id", id));

    const fromVars = { x: x || 0, y: y || 0, autoAlpha: 0 };
    const previewMarkers = markers === true && isPreviewMode();

    const runScroll = () => {
      gsap.set(target, fromVars);
      tweens.push(
        gsap.to(target, {
          x: 0,
          y: 0,
          autoAlpha: 1,
          delay,
          duration,
          stagger,
          ease,
          scrollTrigger: {
            id,
            trigger: triggerSelector || itemClass,
            start: start === "custom" ? startCustom : start || "top 80%",
            end: end === "custom" ? endCustom : end || "bottom 20%",
            markers: previewMarkers,
          },
        }),
      );
    };

    const runPlayWithScroll = () => {
      tweens.push(
        gsap.fromTo(target, fromVars, {
          x: 0,
          y: 0,
          autoAlpha: 1,
          stagger,
          duration: 1,
          ease: "none",
          scrollTrigger: {
            id,
            trigger: triggerSelector || itemClass,
            start: start === "custom" ? startCustom : start || "top bottom",
            end: end === "custom" ? endCustom : end || "bottom top",
            scrub: 1,
            markers: previewMarkers,
          },
        }),
      );
    };

    const runPageLoad = () => {
      gsap.set(target, fromVars);
      tweens.push(
        gsap.to(target, {
          x: 0,
          y: 0,
          autoAlpha: 1,
          delay,
          duration,
          stagger,
          ease,
        }),
      );
    };

    const attachHover = () => {
      if (!triggerSelector) return;
      gsap.set(target, fromVars);
      let triggers;
      try {
        triggers = document.querySelectorAll(triggerSelector);
      } catch {
        return;
      }
      triggers.forEach((el) => {
        const onEnter = () => {
          tweens.push(
            gsap.to(target, {
              x: 0,
              y: 0,
              autoAlpha: 1,
              delay,
              duration,
              stagger,
              ease,
            }),
          );
        };
        const onLeave = () => {
          tweens.push(
            gsap.to(target, {
              ...fromVars,
              duration: duration * 0.6,
              stagger: stagger * 0.5,
              ease,
            }),
          );
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
      gsap.set(target, fromVars);
      let triggers;
      try {
        triggers = document.querySelectorAll(triggerSelector);
      } catch {
        return;
      }
      triggers.forEach((el) => {
        const onClick = () => {
          gsap.set(target, fromVars);
          tweens.push(
            gsap.to(target, {
              x: 0,
              y: 0,
              autoAlpha: 1,
              delay,
              duration,
              stagger,
              ease,
            }),
          );
        };
        el.addEventListener("click", onClick);
        cleanups.push(() => el.removeEventListener("click", onClick));
      });
    };

    switch (triggerType) {
      case "on_scroll":
        runScroll();
        break;
      case "play_with_scroll":
        runPlayWithScroll();
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

textSplitAnim();
