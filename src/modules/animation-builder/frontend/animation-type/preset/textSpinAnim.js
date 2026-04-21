import { isPreviewMode } from "@/utils/isPreviewMode";

const PRESET_KEY = "wcf-mk-text-spin-pa";

export function textSpinAnim() {
  // id -> { timelines: [], splits: [], wrappers: [{wrapper, item, clone}], cleanups: [] }
  const instances = new Map();

  function teardown(id) {
    const inst = instances.get(id);
    if (!inst) return;
    inst.timelines.forEach((tl) => {
      try {
        tl.kill();
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
    inst.wrappers.forEach(({ wrapper, item }) => {
      try {
        if (wrapper?.parentNode && wrapper.contains(item)) {
          wrapper.parentNode.insertBefore(item, wrapper);
          wrapper.parentNode.removeChild(wrapper);
        }
      } catch {}
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
      trigger: { type: triggerType, selector: triggerSelector } = {},
      vars: {
        start,
        startCustom,
        end,
        endCustom,
        delay = 0,
        duration = 0.8,
        stagger = 0.03,
        ease = "power2.out",
        markers,
      } = {},
    } = anim;

    let elements;
    try {
      elements = Array.from(document.querySelectorAll(itemClass));
    } catch (err) {
      console.warn(`[textSpin] invalid itemClass "${itemClass}":`, err.message);
      return;
    }
    if (!elements.length) return;

    teardown(id);

    const timelines = [];
    const splits = [];
    const wrappers = [];
    const cleanups = [];
    const previewMarkers = markers === true && isPreviewMode();

    gsap.set(itemClass, { transition: "none" });
    if (triggerSelector) {
      try {
        gsap.set(triggerSelector, { transition: "none" });
      } catch {}
    }

    elements.forEach((originalItem, idx) => {
      const key = `${id}_${idx}`;
      const cs = getComputedStyle(originalItem);
      const isInline = cs.display?.includes("inline");

      const wrapper = document.createElement(isInline ? "span" : "div");
      wrapper.className = "aae-text-spin-wrapper";
      wrapper.style.display = isInline
        ? "inline-block"
        : cs.display || "inline-block";
      wrapper.style.position = "relative";
      wrapper.style.verticalAlign = cs.verticalAlign || "baseline";
      wrapper.style.lineHeight = cs.lineHeight || "normal";
      wrapper.style.perspective = cs.perspective || "600px";

      originalItem.parentNode.insertBefore(wrapper, originalItem);
      wrapper.appendChild(originalItem);

      const clonedItem = originalItem.cloneNode(true);
      clonedItem.classList.add("aae-text-spin-clone");
      clonedItem.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: visible;
        z-index: 2;
        white-space: ${cs.whiteSpace || "normal"};
      `;
      wrapper.appendChild(clonedItem);

      wrapper.setAttribute("data-wcf-anim-id", id);
      originalItem.setAttribute("data-wcf-anim-id", id);
      clonedItem.setAttribute("data-wcf-anim-id", id);

      let originalSplit, cloneSplit;
      try {
        originalSplit = new SplitText(originalItem, { type: "chars" });
        cloneSplit = new SplitText(clonedItem, { type: "chars" });
      } catch (err) {
        console.error("[textSpin] SplitText failed:", err);
        wrapper.parentNode?.insertBefore(originalItem, wrapper);
        wrapper.parentNode?.removeChild(wrapper);
        return;
      }
      splits.push(originalSplit, cloneSplit);
      wrappers.push({ wrapper, item: originalItem, clone: clonedItem });

      gsap.set(originalSplit.chars, {
        opacity: 1,
        rotationX: 0,
        transformPerspective: 600,
      });
      gsap.set(cloneSplit.chars, {
        opacity: 0,
        rotationX: -90,
        transformPerspective: 600,
      });

      // After two rAFs the chars are laid out — mirror clone char positions
      // onto original char positions before animating.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const wrapperRect = wrapper.getBoundingClientRect();
          originalSplit.chars.forEach((char, i) => {
            const cloneChar = cloneSplit.chars[i];
            if (!char || !cloneChar) return;
            char.style.display = "inline-block";
            char.style.position = "relative";
            char.style.backfaceVisibility = "hidden";
            const charRect = char.getBoundingClientRect();
            const left = Math.round(charRect.left - wrapperRect.left);
            const top = Math.round(charRect.top - wrapperRect.top);
            cloneChar.style.cssText = `
            position: absolute;
            left: ${left}px;
            top: ${top}px;
            width: ${Math.round(charRect.width)}px;
            height: ${Math.round(charRect.height)}px;
            display: inline-block;
            pointer-events: none;
            backface-visibility: hidden;
            color: ${window.getComputedStyle(char).color};
          `;
            if (char.textContent.trim() === "") cloneChar.innerHTML = "&nbsp;";
            const h = Math.max(1, Math.round(charRect.height || 20));
            gsap.set([char, cloneChar], {
              transformOrigin: `50% 50% -${Math.round(h / 2)}px`,
            });
          });

          const half = duration / 2;
          const staggerOpts = { each: stagger, from: "start" };

          const buildSpinForward = (tl, at = 0) => {
            tl.to(
              originalSplit.chars,
              {
                duration: half,
                rotationX: 90,
                opacity: 0,
                stagger: staggerOpts,
                ease: "power2.in",
              },
              at,
            );
            tl.to(
              cloneSplit.chars,
              {
                duration: half,
                rotationX: 0,
                opacity: 1,
                stagger: staggerOpts,
                ease: "power2.out",
              },
              at + half,
            );
          };

          const buildScrubForward = (tl) => {
            gsap.set(originalSplit.chars, { rotationX: 0, opacity: 1 });
            gsap.set(cloneSplit.chars, { rotationX: -90, opacity: 0 });
            tl.to(
              originalSplit.chars,
              {
                rotationX: 90,
                opacity: 0,
                stagger: staggerOpts,
                ease: "none",
                duration: 1,
              },
              0,
            );
            tl.to(
              cloneSplit.chars,
              {
                rotationX: 0,
                opacity: 1,
                stagger: staggerOpts,
                ease: "none",
                duration: 1,
              },
              0,
            );
          };

          const buildScrollTriggerAnim = () => {
            const tl = gsap.timeline({ paused: true });
            buildSpinForward(tl);
            const stConfig = {
              id: key,
              trigger: triggerSelector || wrapper,
              start: start === "custom" ? startCustom : start || "top 80%",
              end: end === "custom" ? endCustom : end || "bottom 20%",
              once: true,
              markers: previewMarkers,
            };
            tl.scrollTrigger = window.ScrollTrigger?.create({
              ...stConfig,
              animation: tl,
            });
            timelines.push(tl);
          };

          const buildScrubbedAnim = () => {
            const tl = gsap.timeline();
            buildScrubForward(tl);
            const stConfig = {
              id: key,
              trigger: triggerSelector || wrapper,
              start: start === "custom" ? startCustom : start || "top bottom",
              end: end === "custom" ? endCustom : end || "bottom top",
              scrub: true,
              markers: previewMarkers,
            };
            tl.scrollTrigger = window.ScrollTrigger?.create({
              ...stConfig,
              animation: tl,
            });
            timelines.push(tl);
          };

          const buildPageLoad = () => {
            gsap.set(originalSplit.chars, { rotationX: 0, opacity: 1 });
            gsap.set(cloneSplit.chars, { rotationX: -90, opacity: 0 });
            const tl = gsap.timeline();
            buildSpinForward(tl, delay);
            timelines.push(tl);
          };

          const attachHover = () => {
            const triggers = triggerSelector
              ? Array.from(document.querySelectorAll(triggerSelector))
              : [wrapper];
            triggers.forEach((trig) => {
              let tl = null;
              const onEnter = () => {
                if (tl) {
                  try {
                    tl.kill();
                  } catch {}
                }
                tl = gsap.timeline();
                buildSpinForward(tl, delay);
                timelines.push(tl);
              };
              const onLeave = () => {
                if (tl) tl.reverse();
              };
              trig.addEventListener("mouseenter", onEnter);
              trig.addEventListener("mouseleave", onLeave);
              cleanups.push(() => {
                trig.removeEventListener("mouseenter", onEnter);
                trig.removeEventListener("mouseleave", onLeave);
              });
            });
          };

          const attachClick = () => {
            const triggers = triggerSelector
              ? Array.from(document.querySelectorAll(triggerSelector))
              : [wrapper];
            triggers.forEach((trig) => {
              const onClick = () => {
                gsap.set(originalSplit.chars, { rotationX: 0, opacity: 1 });
                gsap.set(cloneSplit.chars, { rotationX: -90, opacity: 0 });
                const tl = gsap.timeline();
                buildSpinForward(tl, delay);
                timelines.push(tl);
              };
              trig.addEventListener("click", onClick);
              cleanups.push(() => trig.removeEventListener("click", onClick));
            });
          };

          switch (triggerType) {
            case "on_scroll":
              buildScrollTriggerAnim();
              break;
            case "play_with_scroll":
              buildScrubbedAnim();
              break;
            case "page_load":
              buildPageLoad();
              break;
            case "hover":
              attachHover();
              break;
            case "click":
              attachClick();
              break;
            default: {
              const tl = gsap.timeline();
              buildSpinForward(tl, delay);
              timelines.push(tl);
            }
          }
        }),
      );
    });

    instances.set(id, { timelines, splits, wrappers, cleanups });
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", teardownAll);

  return {
    destroy: () =>
      document.dispatchEvent(new CustomEvent("aae-reset-animation")),
  };
}

textSpinAnim();
