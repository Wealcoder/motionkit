import { handleCustomAnimation, isCustomAnimation } from "./customEngine/index.js";
import { registerAllExtensions } from "./customEngine/extensions/index.js";

/* global __MKIT_DEVTOOLS__ */

if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

registerAllExtensions();

// Stash every custom-animation config we receive so DevTools can show
// disabled steps (which never enter gsap.globalTimeline) by reading the
// authoritative editor config. Production builds skip this entirely —
// the __MKIT_DEVTOOLS__ guard lets the minifier drop both the stash
// function and its caller branch.
function rememberConfig(anim) {
  if (!__MKIT_DEVTOOLS__) return;
  if (typeof window === "undefined") return;
  if (!window.__mkitAnims) window.__mkitAnims = new Map();
  window.__mkitAnims.set(anim.id, anim);
}

document.addEventListener("aae-animation-event", (e) => {
  const anim = e?.detail;
  if (!isCustomAnimation(anim)) return;
  if (__MKIT_DEVTOOLS__) rememberConfig(anim);
  handleCustomAnimation(anim);
});

// Clear the stash on a global reset so deleted animations don't linger
// in window.__mkitAnims after the editor pushes a fresh config without
// them.
if (__MKIT_DEVTOOLS__) {
  document.addEventListener("aae-reset-animation", () => {
    if (typeof window !== "undefined" && window.__mkitAnims) {
      try { window.__mkitAnims.clear(); } catch (_) { /* ignore */ }
    }
  });
}
