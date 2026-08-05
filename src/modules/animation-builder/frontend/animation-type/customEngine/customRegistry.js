// Registry of custom-animation timelines, keyed by anim id.
//
// In editor preview mode, custom anims are built with `paused: true` and
// registered here so DevTools can compose them into its own master timeline
// for scoped playback (one timeline / all timelines / solo).
//
// Public site builds do NOT go through this registry — anims auto-play as
// they always have. The __MOTIONKIT_DEVTOOLS__ DefinePlugin flag strips this
// entire module's body in production so the bundle stays slim.

/* global __MOTIONKIT_DEVTOOLS__ */

const byAnimId = __MOTIONKIT_DEVTOOLS__ ? new Map() : null; // animId → gsap.Timeline[]

export function registerTimeline(animId, tl) {
  if (!__MOTIONKIT_DEVTOOLS__) return;
  if (!animId || !tl) return;
  const list = byAnimId.get(animId) || [];
  list.push(tl);
  byAnimId.set(animId, list);
}

export function unregisterAnimation(animId) {
  if (!__MOTIONKIT_DEVTOOLS__) return;
  byAnimId.delete(animId);
}

export function getTimelines(animId) {
  if (!__MOTIONKIT_DEVTOOLS__) return [];
  return byAnimId.get(animId) || [];
}

export function getAllTimelines() {
  if (!__MOTIONKIT_DEVTOOLS__) return [];
  const out = [];
  for (const list of byAnimId.values()) out.push(...list);
  return out;
}

export function findTimelineById(timelineId) {
  if (!__MOTIONKIT_DEVTOOLS__) return null;
  for (const list of byAnimId.values()) {
    for (const tl of list) {
      if (tl?.vars?.id === timelineId) return tl;
    }
  }
  return null;
}

export function clearAll() {
  if (!__MOTIONKIT_DEVTOOLS__) return;
  byAnimId.clear();
}

// Expose a read-only snapshot of the registry on window so the DevTools
// Web Component (loaded in the same iframe) can build its master timeline
// without importing this module directly. Editor preview only.
if (__MOTIONKIT_DEVTOOLS__ && typeof window !== "undefined") {
  window.__motionkitCustomRegistry = {
    getAllTimelines,
    findTimelineById,
    getTimelines,
  };
}

// "Editor preview mode" specifically means: a live DevTools instance is
// taking control of custom-animation playback. Production bundles return
// false unconditionally so the minifier eliminates every `if(editorMode)`
// branch in callers; editor bundles use the runtime flag set by the WC
// element's connectedCallback.
export function isEditorPreviewMode() {
  if (!__MOTIONKIT_DEVTOOLS__) return false;
  if (typeof window === "undefined") return false;
  return window.__motionkitDevToolsLoaded === true;
}
