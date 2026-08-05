import { isPreviewMode } from "@/utils/isPreviewMode";

const PRESET_KEY = "motionkit-mk-container-fade-pa";

// Register ScrollTrigger once so `scrollTrigger: {...}` on from/to/fromTo works.
if (typeof window !== "undefined" && window.gsap && window.ScrollTrigger) {
  window.gsap.registerPlugin(window.ScrollTrigger);
}

export function containerFadeAnimation() {
  const activeTweens = new Map();

  function calculateFadeAxis(direction, offset = 40) {
    switch (direction) {
      case "top":
        return { x: 0, y: -offset };
      case "right":
        return { x: offset, y: 0 };
      case "bottom":
        return { x: 0, y: offset };
      case "left":
        return { x: -offset, y: 0 };
      case "zoom":
      default:
        return { x: 0, y: 0 };
    }
  }

  // Browser hint: promote animated nodes to their own layer. Cleared on
  // completion so the layer doesn't stay resident forever.
  function setWillChange(target) {
    document.querySelectorAll(target).forEach((el) => {
      el.style.willChange = "transform, opacity";
    });
  }

  function clearWillChange(target) {
    document.querySelectorAll(target).forEach((el) => {
      el.style.willChange = "";
    });
  }

  function killScrollTrigger(id) {
    if (!id || !window.ScrollTrigger) return;
    const st = window.ScrollTrigger.getById(id);
    if (st) st.kill();
  }

  function killTween(id) {
    const tween = activeTweens.get(id);
    if (tween) {
      tween.kill();
      activeTweens.delete(id);
    }
  }

  function handleScrollAnimation({
    id,
    config,
    itemClass,
    triggerClass,
    start,
    end,
    markers,
  }) {
    killScrollTrigger(id);
    setWillChange(itemClass);
    // Pre-hide synchronously to avoid FOUC between HTML paint and tween setup.
    gsap.set(itemClass, {
      x: config.x,
      y: config.y,
      autoAlpha: 0,
      force3D: true,
    });
    // Animate TO the visible/natural state; using .to() (not .from()) so the
    // pre-hide above doesn't collapse the tween's start and end values.
    return gsap.to(itemClass, {
      x: 0,
      y: 0,
      autoAlpha: 1,
      delay: config.delay,
      duration: config.duration,
      stagger: config.stagger,
      ease: config.ease,
      force3D: true,
      scrollTrigger: {
        id,
        trigger: triggerClass || itemClass,
        toggleActions: "play none none none",
        start: start || "top 80%",
        end: end || "bottom 20%",
        markers: markers === true && isPreviewMode(),
      },
      onComplete: () => clearWillChange(itemClass),
    });
  }

  function handlePageLoadAnimation(_id, config, itemClass) {
    setWillChange(itemClass);
    gsap.set(itemClass, {
      x: config.x,
      y: config.y,
      autoAlpha: 0,
      force3D: true,
    });
    return gsap.to(itemClass, {
      ...config,
      x: 0,
      y: 0,
      autoAlpha: 1,
      force3D: true,
      onComplete: () => clearWillChange(itemClass),
    });
  }

  function handlePlayWithScroll({
    id,
    config,
    itemClass,
    triggerClass,
    start,
    end,
    markers,
  }) {
    killScrollTrigger(id);
    setWillChange(itemClass);
    return gsap.fromTo(
      itemClass,
      { x: config.x, y: config.y, autoAlpha: 0, force3D: true },
      {
        x: 0,
        y: 0,
        autoAlpha: 1,
        stagger: config.stagger,
        ease: "none",
        force3D: true,
        scrollTrigger: {
          id,
          trigger: triggerClass || itemClass,
          scrub: 1,
          start: start || "top bottom",
          end: end || "bottom top",
          markers,
        },
      },
    );
  }

  function handleHoverAnimation({ id, config, itemClass, triggerClass }) {
    console.log({ config });
    if (!triggerClass) {
      console.error("Container Fade Animation: Trigger class not found!");
      return;
    }
    const triggers = document.querySelectorAll(triggerClass);
    if (!triggers.length) return;

    gsap.set(itemClass, {
      x: config.x,
      y: config.y,
      autoAlpha: 0,
      force3D: true,
    });

    const enterVars = { ...config, x: 0, y: 0, autoAlpha: 1, force3D: true };

    triggers.forEach((original, index) => {
      const uniqueId = `${id}_hover_${index}`;
      // Clone to strip any prior listeners on re-setup.
      const el = original.cloneNode(true);
      original.parentNode.replaceChild(el, original);

      el.addEventListener("mouseenter", () => {
        killTween(uniqueId);
        setWillChange(itemClass);
        gsap.set(itemClass, {
          x: config.x,
          y: config.y,
          autoAlpha: 0,
          force3D: true,
        });
        activeTweens.set(uniqueId, gsap.to(itemClass, enterVars));
      });

      el.addEventListener("mouseleave", () => {
        killTween(uniqueId);
        activeTweens.set(uniqueId);
      });
    });
  }

  function handleClickAnimation({ id, config, itemClass, triggerClass }) {
    if (!triggerClass) {
      console.error("Container Fade Animation: Trigger class not found!");
      return;
    }
    const triggers = document.querySelectorAll(triggerClass);
    if (!triggers.length) return;

    gsap.set(itemClass, {
      x: config.x,
      y: config.y,
      autoAlpha: 0,
      force3D: true,
    });

    triggers.forEach((original, index) => {
      const uniqueId = `${id}_click_${index}`;
      const el = original.cloneNode(true);
      original.parentNode.replaceChild(el, original);

      el.addEventListener("click", () => {
        killTween(uniqueId);
        setWillChange(itemClass);
        gsap.set(itemClass, {
          x: config.x,
          y: config.y,
          autoAlpha: 0,
          force3D: true,
        });
        activeTweens.set(
          uniqueId,
          gsap.to(itemClass, {
            ...config,
            x: 0,
            y: 0,
            autoAlpha: 1,
            force3D: true,
            onComplete: () => clearWillChange(itemClass),
          }),
        );
      });
    });
  }

  function handler(e) {
    const anim = e?.detail;
    if (!anim || anim.presetKey !== PRESET_KEY) return;
    if (anim.isPublished === false) return;
    if (!anim.itemClass) return;
    try {
      if (!document.querySelector(anim.itemClass)) return;
    } catch (err) {
      console.warn(
        `[containerFade] invalid itemClass selector "${anim.itemClass}":`,
        err.message,
      );
      return;
    }

    const {
      id,
      itemClass,
      triggerClass,
      markers,
      trigger: { type: triggerType, selector: triggerSelector } = {},
      vars: {
        fadeDirection,
        fadeOffset,
        delay,
        duration,
        stagger,
        ease,
        start,
        end,
      } = {},
    } = anim;

    const resolvedTriggerClass = triggerSelector || triggerClass;

    // tag matched items so the global reset sweep can clear them
    document
      .querySelectorAll(itemClass)
      .forEach((el) => el.setAttribute("data-motionkit-anim-id", id));

    const { x, y } = calculateFadeAxis(fadeDirection, fadeOffset);

    const config = {
      x,
      y,
      delay: delay || 0,
      duration: duration || 1,
      stagger: stagger || 0.05,
      ease: ease || "power1.out",
      autoAlpha: 0,
    };

    killTween(id);

    let tween;
    switch (triggerType) {
      case "on_scroll":
        tween = handleScrollAnimation({
          id,
          config,
          itemClass,
          triggerClass: resolvedTriggerClass,
          start,
          end,
          markers,
        });
        break;
      case "page_load":
        tween = handlePageLoadAnimation(id, config, itemClass);
        break;
      case "play_with_scroll":
        tween = handlePlayWithScroll({
          id,
          config,
          itemClass,
          triggerClass: resolvedTriggerClass,
          start,
          end,
          markers,
        });
        break;
      case "hover":
        handleHoverAnimation({
          id,
          config,
          itemClass,
          triggerClass: resolvedTriggerClass,
        });
        break;
      case "click":
        handleClickAnimation({
          id,
          config,
          itemClass,
          triggerClass: resolvedTriggerClass,
        });
        break;
    }

    if (tween) activeTweens.set(id, tween);
  }

  // Reset is handled globally by lib/resetAllAnimations.js, which listens on
  // both the document "aae-reset-animation" event AND window messages. We
  // only need to drop our local tween refs when that happens.
  document.addEventListener("aae-reset-animation", () => activeTweens.clear());
  document.addEventListener("aae-animation-event", handler);

  return {
    destroy: () => {
      document.dispatchEvent(new CustomEvent("aae-reset-animation"));
    },
  };
}

containerFadeAnimation();
