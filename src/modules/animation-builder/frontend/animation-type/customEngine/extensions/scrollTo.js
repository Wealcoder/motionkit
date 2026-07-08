// ScrollToPlugin is loaded by the asset loader via the active-plugins broadcast;
// we just need to hand it to gsap so `scrollTo` vars resolve at tween time.
//
// scrollTo has no standalone step method — the editor emits it as a PROPERTY on
// a from/to bucket ({ scrollTo: { y, x, offsetY, offsetX, autoKill }, duration,
// ... }) which standard.js targets at `window`. So there's nothing to register
// beyond the plugin itself (mirrors drawSVG).
export function registerScrollToMethod() {
  if (typeof ScrollToPlugin === "undefined") return false;
  try {
    gsap.registerPlugin(ScrollToPlugin);
  } catch (e) {
    /* noop */
  }

  return true;
}
