import { handleCustomAnimation, isCustomAnimation } from "./customEngine/index.js";
import { registerAllExtensions } from "./customEngine/extensions/index.js";

if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

registerAllExtensions();

// Stash every custom-animation config we receive so DevTools can show
// disabled steps (which never enter gsap.globalTimeline) by reading the
// authoritative editor config.
function rememberConfig(anim) {
  if (typeof window === "undefined") return;
  if (!window.__mkitAnims) window.__mkitAnims = new Map();
  window.__mkitAnims.set(anim.id, anim);
}

document.addEventListener("aae-animation-event", (e) => {
  const anim = e?.detail;
  if (!isCustomAnimation(anim)) return;
  rememberConfig(anim);
  handleCustomAnimation(anim);
});
