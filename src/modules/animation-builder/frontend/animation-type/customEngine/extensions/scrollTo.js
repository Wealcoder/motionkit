import { registerMethod } from "../registry.js";

// ScrollToPlugin is loaded by the asset loader via the active-plugins broadcast;
// we just need to hand it to gsap so `scrollTo` vars resolve at tween time.
//
// Editor emits vars as:
//   { scrollTo: { y, x, offsetY, offsetX, autoKill }, duration, delay, ... }
// where the inner `scrollTo` is ScrollToPlugin's config and the rest are
// regular tween options. Window is always the target — ScrollToPlugin scrolls
// the tween's target, and we want to scroll the page itself.

export function registerScrollToMethod() {
  if (typeof ScrollToPlugin === "undefined") return false;
  try {
    gsap.registerPlugin(ScrollToPlugin);
  } catch (e) {
    /* noop */
  }

  registerMethod("scrollTo", (tl, _step, vars, overlap) => {
    if (!vars) return;
    const { offsetX = 0, offsetY = 0, autoKill = false, ...rest } = vars;
    const updatedVars = {
      scrollTo: { offsetX, offsetY, autoKill, y: _step.itemClass },
      rest,
    };
    console.log({ updatedVars });
    tl.to(window, updatedVars, overlap);
  });

  return true;
}
