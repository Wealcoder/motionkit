import { buildTimeline } from "./mbuild/timeline.js";
import { buildStepTweens } from "./mbuild/tween.js";
import {
  buildScrollTriggerConfig,
  nonDefault,
} from "./mbuild/scrollTrigger.js";
import {
  findRoutedScrollTriggers,
  findRoutedStepTriggers,
} from "./select/find.js";
import { querySelectorAllCached, requestRefresh } from "./scheduler.js";
import { setActive, getActive } from "./registry.js";
import { teardown, tagElement } from "./cleanup.js";
import { registerTimeline, isEditorPreviewMode } from "./customRegistry.js";

/* global __MKIT_DEVTOOLS__ */

export function isCustomAnimation(anim) {
  return (
    anim != null &&
    typeof anim === "object" &&
    anim.group === "custom_animation" &&
    anim.timeline != null &&
    typeof anim.timeline === "object"
  );
}

function detectDeviceKey() {
  const devices = Object.values(window.wcfanimb?.device_config || {});
  for (const d of devices) {
    if (!d?.mediaQuery) continue;
    try {
      if (window.matchMedia(d.mediaQuery).matches) return d.key;
    } catch (e) {
      /* invalid mq */
    }
  }
  return devices[0]?.key || "desktop";
}

// Tag every animated element so the global reset sweep clears inline styles
// on device-switch without us tracking DOM refs individually.
function tagAllTargets(anim) {
  (anim.timeline?.animations || []).forEach((step) => {
    if (!step?.itemClass) return;
    querySelectorAllCached(step.itemClass).forEach((el) =>
      tagElement(el, anim.id),
    );
  });
}

// In editor preview mode, custom anims build paused so DevTools owns playback.
// Public site builds remain auto-play (extraConfig undefined).
function pageloadExtraConfig() {
  return isEditorPreviewMode() ? { paused: true } : undefined;
}

// isTimelineEnabled gates the build strategy. Absent (legacy animations) or
// true → shared-timeline mode (current behavior): all steps share one timeline
// and a single ScrollTrigger routes by timeline id. Explicit false → each step
// builds as its own standalone tween and ScrollTriggers route by step id.
function isTimelineEnabledFor(anim) {
  return anim.isTimelineEnabled !== false;
}

function buildScrollAnim(anim) {
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
            const scrollCfg = buildScrollTriggerConfig(cfg, el);
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

        const scrollCfg = buildScrollTriggerConfig(cfg, step.itemClass);
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
      const scrollCfg = buildScrollTriggerConfig(cfg, fallbackTrigger);
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

function buildPageloadAnim(anim) {
  const editorMode = isEditorPreviewMode();
  const timelineEnabled = isTimelineEnabledFor(anim);
  const tlCfg = anim.timeline;
  const ctx = gsap.context(() => {
    if (!tlCfg) return;
    const extra = editorMode ? { paused: true } : pageloadExtraConfig();

    if (timelineEnabled) {
      const tl = buildTimeline(tlCfg, extra, {
        animationId: anim.id,
        animationTitle: anim.title,
      });
      if (editorMode && tl) {
        registerTimeline(anim.id, tl);
      }
      return;
    }

    (tlCfg.animations || []).forEach((step) => {
      const tweens = buildStepTweens(step, extra, {
        animationId: anim.id,
        animationTitle: anim.title,
      });
      if (editorMode) {
        tweens.forEach((t) => registerTimeline(anim.id, t));
      }
    });
  });
  return { contexts: [ctx], listeners: [] };
}

// trigger.selector is authoritative when set; otherwise the click/hover target
// falls back to the union of step itemClass selectors so a button driving its
// own scrollTo (no separate trigger element) just works.
function collectInteractionTargets(anim) {
  const sel = anim.trigger?.selector;
  if (sel) return querySelectorAllCached(sel);
  const seen = new Set();
  const out = [];
  (anim.timeline?.animations || []).forEach((step) => {
    if (!step?.itemClass) return;
    querySelectorAllCached(step.itemClass).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      out.push(el);
    });
  });
  return out;
}

function timelineHasScrollTo(anim) {
  return (anim.timeline?.animations || []).some((step) => {
    if (step?.method === "scrollTo") return true;
    const v = step?.vars || {};
    return !!(v.to?.scrollTo || v.from?.scrollTo || v.set?.scrollTo);
  });
}

function buildInteractionAnim(anim, eventType) {
  const triggers = collectInteractionTargets(anim);
  if (!triggers.length) return null;

  const editorMode = isEditorPreviewMode();
  const timelineEnabled = isTimelineEnabledFor(anim);

  // Both modes yield an array of paused GSAP animations (timelines or tweens);
  // the listeners below drive them identically via play/reverse/restart.
  const tlCfg = anim.timeline;
  const anims = [];
  const ctx = gsap.context(() => {
    if (!tlCfg) return;
    // paused override — event drives playback regardless of tlCfg.vars.paused
    if (timelineEnabled) {
      const tl = buildTimeline(
        tlCfg,
        { paused: true },
        {
          animationId: anim.id,
          animationTitle: anim.title,
        },
      );
      if (tl) {
        anims.push(tl);
        if (editorMode) registerTimeline(anim.id, tl);
      }
    } else {
      (tlCfg.animations || []).forEach((step) => {
        buildStepTweens(
          step,
          { paused: true },
          {
            animationId: anim.id,
            animationTitle: anim.title,
          },
        ).forEach((t) => {
          anims.push(t);
          if (editorMode) registerTimeline(anim.id, t);
        });
      });
    }
  });

  // In editor preview mode, DevTools owns playback for click/hover anims —
  // attaching live listeners here would let user interaction call play()/
  // reverse()/restart() on a child timeline that is already nested inside
  // DevTools' master. With smoothChildTiming the child ticking against a
  // paused master pushes master.time() forward, which makes the playhead
  // ruler drift right indefinitely. Skip listeners and let DevTools drive.
  if (editorMode) {
    return { contexts: [ctx], listeners: [] };
  }

  const preventAnchorNav = timelineHasScrollTo(anim);
  const listeners = attachInteractionListeners(
    triggers,
    eventType,
    anims,
    preventAnchorNav,
  );

  return { contexts: [ctx], listeners };
}

// Wire click / hover DOM listeners to drive a set of paused GSAP animations.
// Returns teardown thunks. Works for both timelines and raw tweens since both
// expose restart()/play()/reverse().
function attachInteractionListeners(
  triggers,
  eventType,
  anims,
  preventAnchorNav,
) {
  const listeners = [];
  triggers.forEach((el) => {
    if (eventType === "click") {
      const onClick = (ev) => {
        if (preventAnchorNav && el.tagName === "A") ev.preventDefault();
        anims.forEach((t) => t.restart());
      };
      el.addEventListener("click", onClick);
      listeners.push(() => el.removeEventListener("click", onClick));
    } else if (eventType === "hover") {
      const onEnter = () => anims.forEach((t) => t.play());
      const onLeave = () => anims.forEach((t) => t.reverse());
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      listeners.push(() => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    }
  });
  return listeners;
}

function buildHandle(anim) {
  switch (anim.trigger?.type) {
    case "on_scroll":
      return buildScrollAnim(anim);
    case "click":
      return buildInteractionAnim(anim, "click");
    case "hover":
      return buildInteractionAnim(anim, "hover");
    case "page_load":
    default:
      return buildPageloadAnim(anim);
  }
}

export function handleCustomAnimation(anim) {
  if (!isCustomAnimation(anim)) return;

  // Live-update safety — editor re-dispatches on every edit.
  if (getActive(anim.id)) teardown(anim.id);

  tagAllTargets(anim);

  const handle = buildHandle(anim);
  if (!handle) return;

  setActive(anim.id, handle);
  requestRefresh();
}
