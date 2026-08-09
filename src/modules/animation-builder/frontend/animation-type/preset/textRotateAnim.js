import { isPreviewMode } from "@/utils/isPreviewMode";

const PRESET_KEY = "motionkit-mk-text-rotate-pa";

export function textRotateAnim() {
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
        delay = 0,
        duration = 1,
        stagger = 0.05,
        rotationX,
        rotationY,
        transformOrigin,
        ease,
        markers,
      } = {},
    } = anim;

    let items;
    try {
      items = document.querySelectorAll(itemClass);
    } catch (err) {
      console.warn(
        `[textRotate] invalid itemClass "${itemClass}":`,
        err.message,
      );
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

    gsap.set(itemClass, { transition: "none" });
    if (triggerSelector) {
      try {
        gsap.set(triggerSelector, { transition: "none" });
      } catch {}
    }

    let splitInstance;
    try {
      splitInstance = new SplitText(itemClass, { type: "lines" });
    } catch (err) {
      console.error("[textRotate] SplitText failed:", err);
      return;
    }
    splits.push(splitInstance);
    const target = splitInstance.lines;
    if (!target?.length) return;

    items.forEach((el) => el.setAttribute("data-motionkit-anim-id", id));

    const config = {
      rotationX: rotationX || 0,
      rotationY: rotationY || 0,
      transformOrigin,
      autoAlpha: 0,
      delay,
      duration,
      stagger,
      ease,
      force3D: true,
    };

    const previewMarkers = markers === true && isPreviewMode();

    const runScroll = () => {
      gsap.set(target, {
        rotationX: config.rotationX,
        rotationY: config.rotationY,
        autoAlpha: 0,
      });
      const tween = gsap.to(target, {
        rotationX: 0,
        rotationY: 0,
        autoAlpha: 1,
        force3D: true,
        transformOrigin,
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
      });
      tweens.push(tween);
    };

    const runPlayWithScroll = () => {
      const tween = gsap.fromTo(
        target,
        {
          rotationX: config.rotationX,
          rotationY: config.rotationY,
          autoAlpha: 0,
        },
        {
          rotationX: 0,
          rotationY: 0,
          autoAlpha: 1,
          force3D: true,
          transformOrigin,
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
        },
      );
      tweens.push(tween);
    };

    const runPageLoad = () => {
      gsap.set(target, {
        rotationX: config.rotationX,
        rotationY: config.rotationY,
        autoAlpha: 0,
      });
      const tween = gsap.to(target, {
        rotationX: 0,
        rotationY: 0,
        autoAlpha: 1,
        force3D: true,
        transformOrigin,
        delay,
        duration,
        stagger,
        ease,
      });
      tweens.push(tween);
    };

    const attachHover = () => {
      if (!triggerSelector) return;
      gsap.set(target, {
        rotationX: config.rotationX,
        rotationY: config.rotationY,
        autoAlpha: 0,
      });
      let triggers;
      try {
        triggers = document.querySelectorAll(triggerSelector);
      } catch (err) {
        return;
      }
      triggers.forEach((el) => {
        const onEnter = () => {
          tweens.push(
            gsap.to(target, {
              rotationX: 0,
              rotationY: 0,
              autoAlpha: 1,
              force3D: true,
              transformOrigin,
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
              rotationX: config.rotationX,
              rotationY: config.rotationY,
              autoAlpha: 0,
              force3D: true,
              transformOrigin,
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
      gsap.set(target, {
        rotationX: config.rotationX,
        rotationY: config.rotationY,
        autoAlpha: 0,
      });
      let triggers;
      try {
        triggers = document.querySelectorAll(triggerSelector);
      } catch (err) {
        return;
      }
      triggers.forEach((el) => {
        const onClick = () => {
          gsap.set(target, {
            rotationX: config.rotationX,
            rotationY: config.rotationY,
            autoAlpha: 0,
          });
          tweens.push(
            gsap.to(target, {
              rotationX: 0,
              rotationY: 0,
              autoAlpha: 1,
              force3D: true,
              transformOrigin,
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

textRotateAnim();
