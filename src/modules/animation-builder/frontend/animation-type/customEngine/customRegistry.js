// Registry of custom-animation timelines, keyed by anim id.
//
// In editor preview mode, custom anims are built with `paused: true` and
// registered here so DevTools can compose them into its own master timeline
// for scoped playback (one timeline / all timelines / solo).
//
// Public site builds do NOT go through this registry — anims auto-play as
// they always have. The registry is empty unless `isEditorPreviewMode()`
// returned true at build time.

const byAnimId = new Map(); // animId → gsap.Timeline[]

export function registerTimeline(animId, tl) {
  if (!animId || !tl) return;
  const list = byAnimId.get(animId) || [];
  list.push(tl);
  byAnimId.set(animId, list);
}

export function unregisterAnimation(animId) {
  byAnimId.delete(animId);
}

export function getTimelines(animId) {
  return byAnimId.get(animId) || [];
}

export function getAllTimelines() {
  const out = [];
  for (const list of byAnimId.values()) out.push(...list);
  return out;
}

export function findTimelineById(timelineId) {
  for (const list of byAnimId.values()) {
    for (const tl of list) {
      if (tl?.vars?.id === timelineId) return tl;
    }
  }
  return null;
}

export function clearAll() {
  byAnimId.clear();
}

// Expose a read-only snapshot of the registry on window so the DevTools
// Web Component (loaded in the same iframe) can build its master timeline
// without importing this module directly. Editor preview only.
if (typeof window !== "undefined") {
  window.__mkitCustomRegistry = {
    getAllTimelines,
    findTimelineById,
    getTimelines,
  };
}

// Detect editor preview mode at runtime. Editor preview is signaled by either
// the `?action=motionkit-editor` query param (set by the editor when loading
// the iframe) or `wcfanimb.editorMode` (set by PHP for explicit cases).
export function isEditorPreviewMode() {
  try {
    if (typeof window === "undefined") return false;
    if (window.wcfanimb?.editorMode === true) return true;
    const params = new URLSearchParams(window.location.search);
    return params.get("action") === "motionkit-editor";
  } catch (e) {
    return false;
  }
}
