const PRESET_KEY = "wcf-mk-sticky-hs-pa";

export function headerStickyAnim() {
  // id -> { timelines, cleanups, wrapper, item, clone }
  const instances = new Map();

  function convertToPixels(value) {
    if (value == null || value === "") return 0;
    if (typeof value === "number") return value;
    if (/^-?\d+(\.\d+)?$/.test(value)) return parseFloat(value);
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.visibility = "hidden";
    el.style.height = value;
    document.body.appendChild(el);
    const px = el.offsetHeight;
    document.body.removeChild(el);
    return px;
  }

  function isScrollSmootherActive() {
    return (
      typeof window.ScrollSmoother !== "undefined" &&
      !!window.ScrollSmoother.get?.()
    );
  }

  function teardown(id) {
    const inst = instances.get(id);
    if (!inst) return;
    inst.cleanups.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.warn("[headerSticky] cleanup error:", err);
      }
    });
    inst.timelines.forEach((tl) => {
      try {
        tl.scrollTrigger?.kill();
        tl.revert();
        tl.kill();
      } catch (err) {
        console.warn("[headerSticky] timeline teardown error:", err);
      }
    });
    // Restore original item back to where the wrapper lived.
    if (inst.wrapper && inst.item && inst.wrapper.parentNode) {
      inst.wrapper.parentNode.insertBefore(inst.item, inst.wrapper);
      inst.wrapper.parentNode.removeChild(inst.wrapper);
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
      endClass: endClassRaw,
      styleClass,
      vars = {},
    } = anim;
    const {
      startPosition = 0,
      zIndex = 9999,
      upScroll = false,
      ease,
      duration,
    } = vars;

    let item;
    try {
      item = document.querySelector(itemClass);
    } catch (err) {
      console.warn(
        `[headerSticky] invalid itemClass "${itemClass}":`,
        err.message,
      );
      return;
    }
    if (!item) return;

    teardown(id);

    const defaultTop = 0;
    const calculatedPosition = convertToPixels(startPosition);
    const calculateItemPosition = isScrollSmootherActive()
      ? calculatedPosition
      : 0;
    const endClass =
      endClassRaw && endClassRaw !== ""
        ? endClassRaw
        : ".wcf-ab-pin-end-selector-26";

    // Clone the item — the clone is what GSAP animates.
    const itemClone = item.cloneNode(true);
    if (styleClass && typeof styleClass === "string") {
      itemClone.classList.add(styleClass.replace(/^[.#]/, ""));
    }

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.width = "100%";
    wrapper.style.zIndex = zIndex;

    item.parentNode.insertBefore(wrapper, item);
    wrapper.appendChild(item);
    wrapper.appendChild(itemClone);

    item.setAttribute("data-wcf-anim-id", id);
    itemClone.setAttribute("data-wcf-anim-id", id);
    wrapper.setAttribute("data-wcf-anim-id", id);

    gsap.set(itemClone, {
      position: "absolute",
      width: "100%",
      top: 0,
      left: 0,
      right: 0,
      zIndex,
      opacity: 0,
      y: defaultTop,
      transition: "none",
      willChange: "transform, opacity",
    });

    const cleanups = [];
    const timelines = [];

    const showClone = () => {
      gsap.killTweensOf(itemClone);
      gsap.to(itemClone, {
        y: calculateItemPosition,
        opacity: 1,
        duration,
        ease,
        overwrite: true,
      });
      gsap.to(item, { opacity: 0 });
    };

    const hideClone = () => {
      gsap.killTweensOf(itemClone);
      gsap.to(itemClone, {
        y: defaultTop,
        opacity: 0,
        duration,
        ease,
        overwrite: true,
      });
      gsap.to(item, { opacity: 1 });
    };

    if (upScroll) {
      const state = {
        lastScrollY: window.scrollY,
        isVisible: false,
        isInRange: false,
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          endTrigger: endClass,
          pin: wrapper,
          start: `top+=${calculatedPosition} top`,
          end: "bottom bottom-=600",
          pinSpacing: false,
          invalidateOnRefresh: true,
          onEnter: () => {
            state.isInRange = true;
            state.lastScrollY = window.scrollY;
            gsap.to(item, { opacity: 0 });
          },
          onLeave: () => {
            state.isInRange = false;
            state.isVisible = false;
            hideClone();
          },
          onEnterBack: () => {
            state.isInRange = true;
            state.lastScrollY = window.scrollY;
            gsap.to(item, { opacity: 0 });
          },
          onLeaveBack: () => {
            state.isInRange = false;
            state.isVisible = false;
            hideClone();
          },
        },
      });
      timelines.push(tl);

      const onScroll = () => {
        if (!state.isInRange) return;
        const diff = window.scrollY - state.lastScrollY;
        if (diff < -5 && !state.isVisible) {
          showClone();
          state.isVisible = true;
        } else if (diff > 5 && state.isVisible) {
          hideClone();
          state.isVisible = false;
        }
        state.lastScrollY = window.scrollY;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    } else {
      let lastScrollY = window.scrollY;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          endTrigger: endClass,
          pin: wrapper,
          pinType: "transform",
          anticipatePin: 1,
          start: `top+=${calculatedPosition} top`,
          end: "bottom bottom-=600",
          pinSpacing: false,
          invalidateOnRefresh: true,
          onEnter: showClone,
          onLeave: hideClone,
          onEnterBack: showClone,
          onLeaveBack: hideClone,
        },
      });
      timelines.push(tl);

      const onScroll = () => {
        const diff = window.scrollY - lastScrollY;
        if (diff > 5) gsap.to(itemClone, { y: calculateItemPosition });
        lastScrollY = window.scrollY;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    instances.set(id, { timelines, cleanups, wrapper, item, clone: itemClone });
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", teardownAll);

  return {
    destroy: () =>
      document.dispatchEvent(new CustomEvent("aae-reset-animation")),
  };
}

headerStickyAnim();
