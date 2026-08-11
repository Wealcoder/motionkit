const PRESET_KEY = "motionkit-mk-scroll-hor-pa";

export function horizontalScrollAnim() {
  // id -> { timelines: GSAPTimeline[] }
  const instances = new Map();

  function convertToPixels(value) {
    if (value == null || value === "") return 0;
    const str = String(value);
    if (str.endsWith("px")) return parseFloat(str);
    if (str.endsWith("vw")) return (parseFloat(str) / 100) * window.innerWidth;
    if (str.endsWith("%")) return (parseFloat(str) / 100) * window.innerWidth;
    const num = parseFloat(str);
    if (Number.isFinite(num)) return num;
    console.warn("[horizontalScroll] unsupported unit:", value);
    return 0;
  }

  function teardown(id) {
    const inst = instances.get(id);
    if (!inst) return;
    inst.timelines.forEach((tl) => {
      try {
        tl.revert();
        tl.kill();
      } catch (err) {
        console.warn("[horizontalScroll] timeline teardown error:", err);
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
    if (!anim.containerClass || !anim.itemClass) return;

    const { id, containerClass, itemClass, itemWidthType, vars = {} } = anim;
    const { containerHeight, itemWidth, itemsWidth } = vars;
    if (!containerHeight) return;

    let containerEl;
    try {
      containerEl = document.querySelector(containerClass);
    } catch (err) {
      console.warn(
        `[horizontalScroll] invalid containerClass "${containerClass}":`,
        err.message,
      );
      return;
    }
    if (!containerEl) return;

    let items;
    try {
      items = Array.from(containerEl.querySelectorAll(itemClass));
    } catch (err) {
      console.warn(
        `[horizontalScroll] invalid itemClass "${itemClass}":`,
        err.message,
      );
      return;
    }
    if (!items.length) return;

    teardown(id);

    containerEl.setAttribute("data-motionkit-anim-id", id);
    items.forEach((el) => el.setAttribute("data-motionkit-anim-id", id));

    // Preview-one mode: targets stay tagged above so the editor's inspector keeps
    // its markers, but nothing is built — only the previewed animation may play.
    if (anim.mkInert) return;

    let widthsPx;
    if (
      itemWidthType === "custom" &&
      Array.isArray(itemsWidth) &&
      itemsWidth.length
    ) {
      widthsPx = itemsWidth
        .slice(0, items.length)
        .map((w) => convertToPixels(w));
    } else {
      const def = convertToPixels(itemWidth);
      widthsPx = new Array(items.length).fill(def);
    }

    const totalWidth = widthsPx.reduce((sum, w) => sum + w, 0);
    const totalScrollPx = totalWidth - containerEl.offsetWidth;

    gsap.set(containerEl, { height: containerHeight, transition: "none" });
    items.forEach((el, i) =>
      gsap.set(el, { width: widthsPx[i], flexShrink: 0 }),
    );

    // Items fit (or only one item) — no horizontal scroll needed.
    if (totalScrollPx <= 0) {
      instances.set(id, { timelines: [] });
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerEl,
        pin: true,
        start: "top top",
        // Pin range = totalScrollPx (1:1 horizontal travel to vertical
        // scroll). Decoupling from `bottom bottom` means the animation
        // gets a sensible scroll length regardless of `containerHeight`.
        end: () => "+=" + totalScrollPx,
        // Smooth catch-up over 1 second instead of jumping with every
        // wheel-tick. Drop to 0.5 if it feels laggy, or back to `true` for
        // instant 1:1 mapping.
        scrub: 1,
        pinSpacing: true,
        invalidateOnRefresh: true,
      },
    });

    tl.to(items, {
      x: () => -totalScrollPx,
      ease: "none",
      force3D: true,
    });

    instances.set(id, { timelines: [tl] });
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", teardownAll);

  return {
    destroy: () =>
      document.dispatchEvent(new CustomEvent("aae-reset-animation")),
  };
}

horizontalScrollAnim();
