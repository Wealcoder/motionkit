import { pickDeviceConfig } from "./merge.js";
import { isScrollTriggerActive, isStepActive } from "./filter.js";

export function findTimelineById(anim, id) {
  if (!id) return null;
  return (anim?.timelines || []).find((t) => t.id === id) || null;
}

// Walk every timeline's animations to find a step by id. Used in no-timeline
// mode (anim.isTimelineEnabled === false), where a ScrollTrigger's `timeline`
// field routes to a step id rather than a timeline id.
export function findStepById(anim, id) {
  if (!id) return null;
  for (const tl of anim?.timelines || []) {
    for (const step of tl.animations || []) {
      if (step.id === id) return step;
    }
  }
  return null;
}

// For on_scroll anims: returns [{ st, cfg, tl }] for every enabled scroll
// trigger whose per-device config routes to a real timeline.
export function findRoutedScrollTriggers(anim, deviceKey) {
  const out = [];
  for (const st of anim?.trigger?.scrollTrigger || []) {
    if (!isScrollTriggerActive(st)) continue;
    const cfg = pickDeviceConfig(st.devices, deviceKey);
    if (!cfg) continue;
    const tl = findTimelineById(anim, cfg.timeline);
    if (!tl) continue;
    out.push({ st, cfg, tl });
  }
  return out;
}

// No-timeline counterpart of findRoutedScrollTriggers: each enabled scroll
// trigger's per-device cfg.timeline holds a STEP id, so we resolve to the step
// and the caller builds a standalone tween per routed step.
export function findRoutedStepTriggers(anim, deviceKey) {
  const out = [];
  for (const st of anim?.trigger?.scrollTrigger || []) {
    if (!isScrollTriggerActive(st)) continue;
    const cfg = pickDeviceConfig(st.devices, deviceKey);
    if (!cfg) continue;
    const step = findStepById(anim, cfg.animation);
    if (!step || !isStepActive(step)) continue;
    out.push({ st, cfg, step });
  }
  return out;
}
