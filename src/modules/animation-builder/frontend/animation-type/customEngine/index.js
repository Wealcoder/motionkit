import { buildTimeline } from "./mbuild/timeline.js";
import { buildScrollTriggerConfig } from "./mbuild/scrollTrigger.js";
import { findRoutedScrollTriggers } from "./select/find.js";
import { querySelectorAllCached, requestRefresh } from "./scheduler.js";
import { setActive, getActive } from "./registry.js";
import { teardown, tagElement } from "./cleanup.js";

export function isCustomAnimation(anim) {
  return (
    anim != null &&
    typeof anim === "object" &&
    anim.group === "custom_animation" &&
    Array.isArray(anim.timelines)
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
  (anim.timelines || []).forEach((tlCfg) => {
    (tlCfg.animations || []).forEach((step) => {
      if (!step?.itemClass) return;
      querySelectorAllCached(step.itemClass).forEach((el) =>
        tagElement(el, anim.id),
      );
    });
  });
}

function buildScrollAnim(anim) {
  const deviceKey = detectDeviceKey();
  const routed = findRoutedScrollTriggers(anim, deviceKey);
  if (!routed.length) return null;

  const ctx = gsap.context(() => {
    routed.forEach(({ cfg, tl }) => {
      const fallbackTrigger = tl.animations?.[0]?.itemClass;
      const scrollCfg = buildScrollTriggerConfig(cfg, fallbackTrigger);
      buildTimeline(tl, { scrollTrigger: scrollCfg });
    });
  });

  return { contexts: [ctx], listeners: [] };
}

function buildPageloadAnim(anim) {
  const ctx = gsap.context(() => {
    (anim.timelines || []).forEach((tlCfg) => buildTimeline(tlCfg));
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
  (anim.timelines || []).forEach((tlCfg) => {
    (tlCfg.animations || []).forEach((step) => {
      if (!step?.itemClass) return;
      querySelectorAllCached(step.itemClass).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        out.push(el);
      });
    });
  });
  return out;
}

function timelineHasScrollTo(anim) {
  return (anim.timelines || []).some((tlCfg) =>
    (tlCfg.animations || []).some((step) => {
      if (step?.method === "scrollTo") return true;
      const v = step?.vars || {};
      return !!(v.to?.scrollTo || v.from?.scrollTo || v.set?.scrollTo);
    }),
  );
}

function buildInteractionAnim(anim, eventType) {
  const triggers = collectInteractionTargets(anim);
  if (!triggers.length) return null;

  const tls = [];
  const ctx = gsap.context(() => {
    (anim.timelines || []).forEach((tlCfg) => {
      // paused override — event drives playback regardless of tlCfg.vars.paused
      tls.push(buildTimeline(tlCfg, { paused: true }));
    });
  });

  const preventAnchorNav = timelineHasScrollTo(anim);

  const listeners = [];
  triggers.forEach((el) => {
    if (eventType === "click") {
      const onClick = (ev) => {
        if (preventAnchorNav && el.tagName === "A") ev.preventDefault();
        tls.forEach((t) => t.restart());
      };
      el.addEventListener("click", onClick);
      listeners.push(() => el.removeEventListener("click", onClick));
    } else if (eventType === "hover") {
      const onEnter = () => tls.forEach((t) => t.play());
      const onLeave = () => tls.forEach((t) => t.reverse());
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      listeners.push(() => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    }
  });

  return { contexts: [ctx], listeners };
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
