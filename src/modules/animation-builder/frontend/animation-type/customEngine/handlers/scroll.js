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

export function buildScrollAnim(anim) {
  const deviceKey = detectDeviceKey();

  if (!isTimelineEnabledFor(anim)) {
    const routedSteps = findRoutedStepTriggers(anim, deviceKey);
    if (!routedSteps.length) return null;
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
            buildStepTweens(
              { ...step, itemClass: el },
              { scrollTrigger: scrollCfg },
              {
                animationId: anim.id,
                animationTitle: anim.title,
              },
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
        buildStepTweens(
          step,
          { scrollTrigger: scrollCfg },
          {
            animationId: anim.id,
            animationTitle: anim.title,
          },
        );
      });
    });
    return { contexts: [stepCtx], listeners: [] };
  }

  const routed = findRoutedScrollTriggers(anim, deviceKey);
  if (!routed.length) return null;

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
      const built = buildTimeline(
        tl,
        { scrollTrigger: scrollCfg },
        {
          animationId: anim.id,
          animationTitle: anim.title,
        },
      );
      // ScrollTrigger anims are scroll-driven; DevTools cannot scrub them
      // by time, so we don't register them. They still render in GSAP.
      if (built) {
        // intentional no-op for registry
      }
    });
  });

  return { contexts: [ctx], listeners: [] };
}
