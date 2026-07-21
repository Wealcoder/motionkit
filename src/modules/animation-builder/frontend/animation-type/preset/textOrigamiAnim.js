import { isPreviewMode } from "@/utils/isPreviewMode";

const PRESET_KEY = "wcf-mk-text-origami-pa";

export function textOrigamiAnim() {
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
        duration = 0.8,
        stagger = 0.05,
        foldAngle = 90,
        distance = 30,
        ease = "power2.out",
        markers,
      } = {},
    } = anim;

    let items;
    try {
      items = document.querySelectorAll(itemClass);
    } catch (err) {
      console.warn(
        `[textOrigami] invalid itemClass "${itemClass}":`,
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
      splitInstance = new SplitText(itemClass, {
        type: "chars",
        smartWrap: true,
      });
    } catch (err) {
      console.error("[textOrigami] SplitText failed:", err);
      return;
    }
    splits.push(splitInstance);
    const chars = splitInstance.chars;
    if (!chars?.length) return;

    items.forEach((el) => el.setAttribute("data-wcf-anim-id", id));

    gsap.set(chars, {
      transformPerspective: 600,
      transformOrigin: "50% 50%",
    });

    // Even characters fold down from above, odd characters fold up from
    // below — same angle/distance, opposite sign — so the sequence reads as
    // an alternating top/bottom origami fold rather than every character
    // arriving from the same direction.
    const foldFrom = {
      y: (i) => (i % 2 === 0 ? -distance : distance),
      rotationX: (i) => (i % 2 === 0 ? -foldAngle : foldAngle),
      autoAlpha: 0,
    };

    const previewMarkers = markers === true && isPreviewMode();

    const runScroll = () => {
      gsap.set(chars, foldFrom);
      const tween = gsap.to(chars, {
        y: 0,
        rotationX: 0,
        autoAlpha: 1,
        force3D: true,
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
      const tween = gsap.fromTo(chars, foldFrom, {
        y: 0,
        rotationX: 0,
        autoAlpha: 1,
        force3D: true,
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
      });
      tweens.push(tween);
    };

    const runPageLoad = () => {
      gsap.set(chars, foldFrom);
      const tween = gsap.to(chars, {
        y: 0,
        rotationX: 0,
        autoAlpha: 1,
        force3D: true,
        delay,
        duration,
        stagger,
        ease,
      });
      tweens.push(tween);
    };

    const attachHover = () => {
      if (!triggerSelector) return;
      gsap.set(chars, foldFrom);
      let triggers;
      try {
        triggers = document.querySelectorAll(triggerSelector);
      } catch (err) {
        return;
      }
      triggers.forEach((el) => {
        const onEnter = () => {
          tweens.push(
            gsap.to(chars, {
              y: 0,
              rotationX: 0,
              autoAlpha: 1,
              force3D: true,
              delay,
              duration,
              stagger,
              ease,
            }),
          );
        };
        const onLeave = () => {
          tweens.push(
            gsap.to(chars, {
              ...foldFrom,
              force3D: true,
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
      gsap.set(chars, foldFrom);
      let triggers;
      try {
        triggers = document.querySelectorAll(triggerSelector);
      } catch (err) {
        return;
      }
      triggers.forEach((el) => {
        const onClick = () => {
          gsap.set(chars, foldFrom);
          tweens.push(
            gsap.to(chars, {
              y: 0,
              rotationX: 0,
              autoAlpha: 1,
              force3D: true,
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

textOrigamiAnim();
