import { pickDeviceConfig } from "./merge.js";
import { isScrollTriggerActive } from "./filter.js";

export function findTimelineById(anim, id) {
  if (!id) return null;
  return (anim?.timelines || []).find((t) => t.id === id) || null;
}

// For on_scroll anims: returns [{ st, cfg, tl }] for every enabled scroll
// trigger whose per-device config routes to a real timeline.
export function findRoutedScrollTriggers(anim, deviceKey) {
  const out = [];
  for (const st of anim?.trigger?.scrollTrigger || []) {
    if (!isScrollTriggerActive(st)) continue;
    const cfg = pickDeviceConfig(st.devices, deviceKey);
    if (!cfg) continue;
    const tl = findTimelineById(anim, cfg.animation);
    if (!tl) continue;
    out.push({ st, cfg, tl });
  }
  return out;
}
