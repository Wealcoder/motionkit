// ScrambleTextPlugin is loaded by the asset loader via the active-plugins broadcast.
// scrambleText rides as a native GSAP tween var (on a normal from/to bucket), so
// there's no interception — we just register the plugin so gsap resolves the
// `scrambleText` var at tween time instead of silently dropping it (mirrors drawSVG).
//
// The editor emits either shape GSAP accepts: the string shorthand
// ({ scrambleText: "NEW TEXT" }) or the options object ({ scrambleText: { text,
// chars, speed, revealDelay, tweenLength, delimiter, rightToLeft, newClass,
// oldClass } }). Both are passed straight through — no normalizing here.
export function registerScrambleTextMethod() {
  if (typeof ScrambleTextPlugin === "undefined") return false;
  try {
    gsap.registerPlugin(ScrambleTextPlugin);
  } catch (e) {
    /* noop */
  }

  return true;
}
