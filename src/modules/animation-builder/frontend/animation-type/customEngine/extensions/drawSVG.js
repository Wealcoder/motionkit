import { registerMethod } from "../registry.js";

export function registerDrawSVGMethod() {
  if (typeof DrawSVGPlugin === "undefined") return false;
  try {
    gsap.registerPlugin(DrawSVGPlugin);
  } catch (e) {
    /* noop */
  }

  registerMethod("drawSVG", (tl, step, vars) => {
    if (!step.itemClass || !vars) return;
    const method = vars.method || "from";
    if (method === "fromTo") {
      tl.fromTo(step.itemClass, vars.from || {}, vars.to || {});
      return;
    }
    const tweenVars = { ...vars };
    delete tweenVars.method;
    delete tweenVars.from;
    delete tweenVars.to;
    tl[method](step.itemClass, tweenVars);
  });

  return true;
}
