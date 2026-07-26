import { buildTimeline } from "../mbuild/timeline.js";
import { buildStepTweens } from "../mbuild/tween.js";
import {
  buildScrollTriggerConfig,
  nonDefault,
} from "../mbuild/scrollTrigger.js";
import {
  findRoutedScrollTriggers,
  findRoutedStepTriggers,
} from "../select/find.js";
import { querySelectorAllCached } from "../scheduler.js";
import { withScrollLogger } from "../helper/logger.js";
import { detectDeviceKey } from "../helper/device.js";
import { isTimelineEnabledFor } from "../helper/guards.js";
import { isEditorPreviewMode } from "../customRegistry.js";
import { claimTargets, setAnims } from "../ownership.js";
import { collectAnimatedElements } from "../helper/interactionTargets.js";

// Register this scroll animation's built tweens/timelines as the initial
// owner of its animated elements. Without this, a click/hover animation
// sharing the same target (e.g. the same heading, split with a different
// SplitText config) never finds a previous owner to pause — its own build
// then reverts this scroll tween's still-live SplitText spans out from under
// it (see splitText.js's getSplit), and the still-ticking scroll tween keeps
// fighting the incoming one for the same properties every frame. That
// property/visual tug-of-war is what reads as flicker. Runtime-only: editor
// preview never triggers this (DevTools owns playback), matching
// ownership.js's own "only the interaction handlers claim" contract.
function registerScrollOwnership(anim, built) {
  if (isEditorPreviewMode()) return;
  setAnims(anim.id, built);
  claimTargets(collectAnimatedElements(anim), anim.id);
}

export function buildScrollAnim(anim) {
  const deviceKey = detectDeviceKey();

  if (!isTimelineEnabledFor(anim)) {
    const routedSteps = findRoutedStepTriggers(anim, deviceKey);
    if (!routedSteps.length) return null;
    const built = [];
    const stepCtx = gsap.context(() => {
      routedSteps.forEach(({ cfg, step }) => {
        // Scroll-driven tweens can't be scrubbed by time, so — like
        // timeline-mode scroll anims — they aren't registered with DevTools.
        // When the user left the trigger as default it resolves to itemClass,
        // and itemClass may match many elements. A single tween + one
        // ScrollTrigger over the whole set fires the entire group the moment
        // the FIRST element scrolls in. So with a default trigger we split the
        // step per matched element — each gets its own tween + ScrollTrigger
        // anchored to itself, so it animates when IT enters the viewport.
        // An explicit trigger keeps the group behavior: one trigger element
        // intentionally drives every matched element together.
        if (!nonDefault(cfg.trigger)) {
          querySelectorAllCached(step.itemClass).forEach((el) => {
            const scrollCfg = withScrollLogger(
              buildScrollTriggerConfig(cfg, el),
              {
                timelineId: null,
                timelineData: null,
                animationId: anim.id,
                animationData: anim,
              },
            );
            built.push(
              ...buildStepTweens(
                { ...step, itemClass: el },
                { scrollTrigger: scrollCfg },
                {
                  animationId: anim.id,
                  animationTitle: anim.title,
                },
              ),
            );
          });
          return;
        }

        const scrollCfg = withScrollLogger(
          buildScrollTriggerConfig(cfg, step.itemClass),
          {
            timelineId: null,
            timelineData: null,
            animationId: anim.id,
            animationData: anim,
          },
        );
        built.push(
          ...buildStepTweens(
            step,
            { scrollTrigger: scrollCfg },
            {
              animationId: anim.id,
              animationTitle: anim.title,
            },
          ),
        );
      });
    });
    registerScrollOwnership(anim, built);
    return { contexts: [stepCtx], listeners: [] };
  }

  const routed = findRoutedScrollTriggers(anim, deviceKey);
  if (!routed.length) return null;

  const built = [];
  const ctx = gsap.context(() => {
    routed.forEach(({ cfg, tl }) => {
      const fallbackTrigger = tl.animations?.[0]?.itemClass;
      const scrollCfg = withScrollLogger(
        buildScrollTriggerConfig(cfg, fallbackTrigger),
        {
          timelineId: tl.id,
          timelineData: tl,
          animationId: anim.id,
          animationData: anim,
        },
      );
      const tlBuilt = buildTimeline(
        tl,
        { scrollTrigger: scrollCfg },
        {
          animationId: anim.id,
          animationTitle: anim.title,
        },
      );
      // ScrollTrigger anims are scroll-driven; DevTools cannot scrub them
      // by time, so we don't register them with DevTools. They still render
      // in GSAP, and are registered with the ownership system below.
      if (tlBuilt) built.push(tlBuilt);
    });
  });

  registerScrollOwnership(anim, built);

  return { contexts: [ctx], listeners: [] };
}
