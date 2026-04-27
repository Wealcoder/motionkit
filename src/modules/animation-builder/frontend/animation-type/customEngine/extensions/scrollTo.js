// ScrollToPlugin is loaded by the asset loader via the active-plugins broadcast;
// we just need to hand it to gsap so `scrollTo` vars resolve at tween time.
export function registerScrollToPlugin() {
  if (typeof ScrollToPlugin === "undefined") return false;
  try {
    gsap.registerPlugin(ScrollToPlugin);
  } catch (e) {
    /* noop */
  }
  return true;
}
