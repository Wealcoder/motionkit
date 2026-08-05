import { handleCustomAnimation, isCustomAnimation } from "./customEngine/index.js";
import { registerAllExtensions } from "./customEngine/extensions/index.js";

/* global __MOTIONKIT_DEVTOOLS__ */

if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

registerAllExtensions();

// Stash every custom-animation config we receive so DevTools can show
// disabled steps (which never enter gsap.globalTimeline) by reading the
// authoritative editor config. Production builds skip this entirely —
// the __MOTIONKIT_DEVTOOLS__ guard lets the minifier drop both the stash
// function and its caller branch.
function rememberConfig(anim) {
  if (!__MOTIONKIT_DEVTOOLS__) return;
  if (typeof window === "undefined") return;
  if (!window.__motionkitAnims) window.__motionkitAnims = new Map();
  window.__motionkitAnims.set(anim.id, anim);
}

document.addEventListener("aae-animation-event", (e) => {
  const anim = e?.detail;
  if (!isCustomAnimation(anim)) return;
  if (__MOTIONKIT_DEVTOOLS__) rememberConfig(anim);
  handleCustomAnimation(anim);
});

// Clear the stash on a global reset so deleted animations don't linger
// in window.__motionkitAnims after the editor pushes a fresh config without
// them.
if (__MOTIONKIT_DEVTOOLS__) {
  document.addEventListener("aae-reset-animation", () => {
    if (typeof window !== "undefined" && window.__motionkitAnims) {
      try { window.__motionkitAnims.clear(); } catch (_) { /* ignore */ }
    }
  });
}
