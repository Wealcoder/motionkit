const PRESET_KEY = "motionkit-mk-cursor-cm-pa";

export function cursorHoverMoveAnim() {
  // id -> array of per-item teardown fns
  const instances = new Map();

  function toNumber(value, fallback) {
    if (value == null || value === "") return fallback;
    const num = parseFloat(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function teardown(id) {
    const fns = instances.get(id);
    if (!fns) return;
    fns.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.warn("[cursorMove] teardown error:", err);
      }
    });
    instances.delete(id);
  }

  function teardownAll() {
    for (const id of [...instances.keys()]) teardown(id);
  }

  function attachToItem({ id, itemEl, moveX, moveY, duration }) {
    // Tag so the global reset sweep runs clearProps on this node alongside
    // our local teardown.
    itemEl.setAttribute("data-motionkit-anim-id", id);
    itemEl.classList.add("motionkit-skip-selector-full");

    // One reusable tween per axis is MUCH cheaper than firing gsap.to() on
    // every mousemove event (which used to create ~60 fresh tweens/sec).
    const xTo = gsap.quickTo(itemEl, "x", {
      duration,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(itemEl, "y", {
      duration,
      ease: "power3.out",
    });

    const onMouseMove = (evt) => {
      // Read viewport size fresh each frame so resizes don't desync the basis.
      const xPercent = evt.clientX / window.innerWidth - 0.5;
      const yPercent = evt.clientY / window.innerHeight - 0.5;
      xTo(xPercent * moveX);
      yTo(yPercent * moveY);
    };

    const onMouseEnter = () => {
      itemEl.addEventListener("mousemove", onMouseMove);
    };

    const onMouseLeave = () => {
      itemEl.removeEventListener("mousemove", onMouseMove);
      // Ease back to the origin when the pointer leaves.
      xTo(0);
      yTo(0);
    };

    itemEl.addEventListener("mouseenter", onMouseEnter);
    itemEl.addEventListener("mouseleave", onMouseLeave);

    return () => {
      itemEl.removeEventListener("mouseenter", onMouseEnter);
      itemEl.removeEventListener("mouseleave", onMouseLeave);
      itemEl.removeEventListener("mousemove", onMouseMove);
      gsap.killTweensOf(itemEl);
      gsap.set(itemEl, { clearProps: "transform" });
      itemEl.classList.remove("motionkit-skip-selector-full");
    };
  }

  function handler(e) {
    const anim = e?.detail;
    if (!anim || anim.presetKey !== PRESET_KEY) return;
    if (anim.isPublished === false) return;
    if (!anim.itemClass) return;

    let items;
    try {
      items = document.querySelectorAll(anim.itemClass);
    } catch (err) {
      console.warn(
        `[cursorMove] invalid itemClass selector "${anim.itemClass}":`,
        err.message,
      );
      return;
    }
    if (!items.length) return;

    const { id, vars = {} } = anim;
    const moveX = toNumber(vars.moveX, 0);
    const moveY = toNumber(vars.moveY, 0);
    const duration = toNumber(vars.duration, 0.6);

    // Nothing to do if both axes are zero.
    if (moveX === 0 && moveY === 0) return;

    // Live-update safety: drop the prior setup for this id before rebuild.
    teardown(id);

    const teardowns = [];
    items.forEach((itemEl) => {
      teardowns.push(attachToItem({ id, itemEl, moveX, moveY, duration }));
    });

    instances.set(id, teardowns);
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", teardownAll);

  return {
    destroy: () =>
      document.dispatchEvent(new CustomEvent("aae-reset-animation")),
  };
}

cursorHoverMoveAnim();
