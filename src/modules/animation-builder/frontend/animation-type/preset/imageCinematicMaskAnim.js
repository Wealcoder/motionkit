const PRESET_KEY = "wcf-mk-image-cm-pa";

// Baked-in look values — deliberately kept out of the UI so the preset stays
// simple. Power users who need to tune these use a custom animation instead.
const END_SCALE = 1; // image settles back to full size
const IMAGE_SHIFT = 12; // % parallax drift of the image inside the frame
const FRAME_TRAVEL = 72; // px the frame slides in from
const TILT = 8; // deg 3D tilt as the frame settles
const SHADE_OPACITY = 0.22; // resting opacity of the cinematic shade

// Directional clip-path masks. Start states hide the frame from one edge (or
// pinched-in for centerOut); the timeline reveals to inset(0).
function directionClip(direction) {
  const clips = {
    topToBottom: "inset(0% 0% 100% 0%)",
    bottomToTop: "inset(100% 0% 0% 0%)",
    leftToRight: "inset(0% 100% 0% 0%)",
    rightToLeft: "inset(0% 0% 0% 100%)",
    centerOut: "inset(42% 42% 42% 42%)",
  };
  return clips[direction] || clips.bottomToTop;
}

// Returns a GSAP offset object for a direction. `unit: "pixel"` drives x/y (px);
// otherwise xPercent/yPercent (percent). Unused axis keys stay 0 so the object
// is safe to spread straight into gsap.set().
function directionOffset(direction, amount, unit) {
  const offset = { x: 0, y: 0, xPercent: 0, yPercent: 0 };
  const xKey = unit === "pixel" ? "x" : "xPercent";
  const yKey = unit === "pixel" ? "y" : "yPercent";

  if (direction === "topToBottom") offset[yKey] = -amount;
  else if (direction === "bottomToTop") offset[yKey] = amount;
  else if (direction === "leftToRight") offset[xKey] = -amount;
  else if (direction === "rightToLeft") offset[xKey] = amount;

  return offset;
}

// Build the cinematic overlays (shade + sweep) as children of the frame, only
// for the layers that are enabled. Styles are inline so no stylesheet needs to
// ship with the preset. Returns nulls when nothing is needed.
function buildOverlays(containerEl, { withShade, withSweep }) {
  if (!withShade && !withSweep) return { wrap: null, shade: null, sweep: null };

  const wrap = document.createElement("div");
  wrap.setAttribute("data-mk-cm-overlay", "");
  Object.assign(wrap.style, {
    position: "absolute",
    inset: "0",
    pointerEvents: "none",
    borderRadius: "inherit",
    overflow: "hidden",
    zIndex: "2",
  });

  let shade = null;
  if (withShade) {
    shade = document.createElement("div");
    Object.assign(shade.style, {
      position: "absolute",
      inset: "0",
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.22), transparent 34%), linear-gradient(to top, rgba(0,0,0,0.45), transparent 42%)",
      mixBlendMode: "overlay",
      opacity: "0",
    });
    wrap.appendChild(shade);
  }

  let sweep = null;
  if (withSweep) {
    sweep = document.createElement("div");
    Object.assign(sweep.style, {
      position: "absolute",
      top: "0",
      bottom: "0",
      width: "42%",
      left: "-58%",
      background:
        "linear-gradient(90deg, transparent, rgba(255,255,255,0.64), transparent)",
      mixBlendMode: "overlay",
      transform: "skewX(-18deg)",
      opacity: "0",
    });
    wrap.appendChild(sweep);
  }

  containerEl.appendChild(wrap);
  return { wrap, shade, sweep };
}

export function imageCinematicMaskAnim() {
  // id -> { timelines, elements: [{ containerEl, itemEl, overlay, restorePosition }] }
  const instances = new Map();

  function teardown(id) {
    const inst = instances.get(id);
    if (!inst) return;

    inst.timelines.forEach((tl) => {
      try {
        tl.revert();
        tl.kill();
      } catch (err) {
        console.warn("[imageCinematicMask] timeline teardown error:", err);
      }
    });

    inst.elements.forEach(({ containerEl, itemEl, overlay, restorePosition }) => {
      try {
        // Remove the injected shade/sweep layer.
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);

        // clip-path / transforms / filter are applied via bare gsap.set() at
        // time 0, so tl.revert() can't restore them — clear them explicitly.
        gsap.set(containerEl, {
          clearProps: "transform,opacity,visibility,clipPath,overflow,perspective",
        });
        gsap.set(itemEl, {
          clearProps: "transform,opacity,visibility,filter,transformOrigin",
        });

        if (restorePosition) containerEl.style.position = "";
      } catch (err) {
        console.warn("[imageCinematicMask] element cleanup error:", err);
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

    let items;
    try {
      items = document.querySelectorAll(anim.itemClass);
    } catch (err) {
      console.warn(
        `[imageCinematicMask] invalid itemClass selector "${anim.itemClass}":`,
        err.message,
      );
      return;
    }
    if (!items.length) return;

    const {
      id,
      triggerClass,
      trigger: { type: triggerType, selector: triggerSelector } = {},
      vars: {
        direction = "bottomToTop",
        startScale = 1.28,
        shade = true,
        sweep = true,
        delay = 0,
        duration = 1.25,
        animationStart,
        animationCStart,
        ease = "expo.inOut",
      } = {},
    } = anim;

    const resolvedTriggerClass = triggerSelector || triggerClass;
    const resolvedStart =
      animationStart === "custom" ? animationCStart : animationStart;

    // Live-update safety: tear down any prior setup for this id first.
    teardown(id);

    const timelines = [];
    const elements = [];

    items.forEach((itemEl) => {
      const containerEl = itemEl.parentElement;
      if (!containerEl) return;

      // Tag both nodes so the global reset sweep (lib/resetAllAnimations.js)
      // runs clearProps on each alongside our local teardown.
      containerEl.setAttribute("data-wcf-anim-id", id);
      itemEl.setAttribute("data-wcf-anim-id", id);

      const withShade = shade === true || shade === "true";
      const withSweep = sweep === true || sweep === "true";

      // Absolutely-positioned overlays need a positioned frame.
      let restorePosition = false;
      if (
        (withShade || withSweep) &&
        getComputedStyle(containerEl).position === "static"
      ) {
        containerEl.style.position = "relative";
        restorePosition = true;
      }

      const {
        wrap: overlay,
        shade: shadeEl,
        sweep: sweepEl,
      } = buildOverlays(containerEl, { withShade, withSweep });

      const frameOffset = directionOffset(direction, FRAME_TRAVEL, "pixel");
      const imageOffset = directionOffset(direction, IMAGE_SHIFT);

      const tlConfig =
        triggerType === "page_load"
          ? { delay }
          : {
              delay,
              scrollTrigger: {
                trigger: resolvedTriggerClass || containerEl,
                start: resolvedStart,
                scrub: triggerType === "play_with_scroll",
              },
            };

      const tl = gsap.timeline(tlConfig);

      tl.set(containerEl, {
        ...frameOffset,
        rotationX: TILT,
        scale: 0.94,
        overflow: "hidden",
        transformPerspective: 1400,
        clipPath: directionClip(direction),
      })
        .set(itemEl, {
          ...imageOffset,
          scale: startScale,
          transformOrigin: "50% 50%",
          filter: "saturate(0.8) contrast(1.14)",
        })
        .to(
          containerEl,
          {
            x: 0,
            y: 0,
            rotationX: 0,
            scale: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            duration,
            ease,
          },
          0,
        )
        .to(
          itemEl,
          {
            xPercent: 0,
            yPercent: 0,
            scale: END_SCALE,
            filter: "saturate(1) contrast(1)",
            duration: duration * 1.08,
            ease: "power3.out",
          },
          0,
        );

      // Cinematic shade: flash up, then settle to the resting opacity.
      if (shadeEl) {
        tl.to(shadeEl, { autoAlpha: 0.9, duration: duration * 0.32 }, 0.12).to(
          shadeEl,
          { autoAlpha: SHADE_OPACITY, duration: duration * 0.55 },
          duration * 0.56,
        );
      }

      // Light sweep across the frame.
      if (sweepEl) {
        const at = duration * 0.28;
        tl.fromTo(
          sweepEl,
          { autoAlpha: 0, xPercent: 0 },
          {
            autoAlpha: 0.85,
            xPercent: 390,
            duration: Math.min(0.95, duration),
            ease: "power2.inOut",
          },
          at,
        ).to(
          sweepEl,
          { autoAlpha: 0, duration: 0.22 },
          at + Math.min(0.74, duration * 0.65),
        );
      }

      timelines.push(tl);
      elements.push({ containerEl, itemEl, overlay, restorePosition });
    });

    instances.set(id, { timelines, elements });
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", teardownAll);

  return {
    destroy: () =>
      document.dispatchEvent(new CustomEvent("aae-reset-animation")),
  };
}

imageCinematicMaskAnim();
