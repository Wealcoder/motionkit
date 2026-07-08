import { registerStandardMethods } from "./standard.js";
import { registerSplitTextMethod } from "./splitText.js";
import { registerDrawSVGMethod } from "./drawSVG.js";
import { registerScrollToMethod } from "./scrollTo.js";
import { registerFlipMethod } from "./flip.js";
import { registerMotionPathMethod } from "./motionPath.js";
import { registerMorphSVGMethod } from "./morphSVG.js";
import { registerPhysics2DMethod } from "./physics2D.js";

// Add future plugin registrations here. Each returns true if registered.
// Scaffolds to fill when editor wires them into step.method:
//   registerScrambleTextMethod (window.ScrambleTextPlugin)
//   registerCustomEaseMethod   (window.CustomEase)
const EXTENSION_REGISTRARS = [
  registerSplitTextMethod,
  registerDrawSVGMethod,
  registerScrollToMethod,
  registerFlipMethod,
  registerMotionPathMethod,
  registerMorphSVGMethod,
  registerPhysics2DMethod,
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
