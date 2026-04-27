import { registerStandardMethods } from "./standard.js";
import { registerSplitTextMethod } from "./splitText.js";
import { registerDrawSVGMethod } from "./drawSVG.js";
import { registerScrollToPlugin } from "./scrollTo.js";

// Add future plugin registrations here. Each returns true if registered.
// Scaffolds to fill when editor wires them into step.method:
//   registerMotionPathMethod   (window.MotionPathPlugin)
//   registerFlipMethod         (window.Flip)
//   registerScrambleTextMethod (window.ScrambleTextPlugin)
//   registerMorphSVGMethod     (window.MorphSVGPlugin)
//   registerPhysics2DMethod    (window.Physics2DPlugin)
//   registerCustomEaseMethod   (window.CustomEase)
const EXTENSION_REGISTRARS = [
  registerSplitTextMethod,
  registerDrawSVGMethod,
  registerScrollToPlugin,
];

let done = false;

export function registerAllExtensions() {
  if (done) return;
  done = true;
  registerStandardMethods();
  EXTENSION_REGISTRARS.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn("[customEngine] extension registration failed:", e);
    }
  });
}
