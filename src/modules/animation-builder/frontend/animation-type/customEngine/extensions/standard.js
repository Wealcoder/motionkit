import { registerMethod } from "../registry.js";

export function registerStandardMethods() {
  registerMethod("from", (tl, step, vars) => {
    if (step.itemClass) tl.from(step.itemClass, vars);
  });

  registerMethod("to", (tl, step, vars) => {
    if (step.itemClass) tl.to(step.itemClass, vars);
  });

  registerMethod("fromTo", (tl, step, vars) => {
    if (step.itemClass) tl.fromTo(step.itemClass, vars.from, vars.to);
  });

  registerMethod("set", (tl, step, vars) => {
    if (step.itemClass) tl.set(step.itemClass, vars);
  });

  registerMethod("call", (tl, step, vars) => {
    const raw = vars || {};
    const fn = typeof raw === "function" ? raw : raw.fn;
    const args = raw.args || [];
    if (typeof fn === "function") {
      tl.call(fn, args);
    } else if (typeof fn === "string") {
      tl.call(() => {
        try {
          new Function("args", fn)(args);
        } catch (e) {
          console.error("[customEngine] call error:", e);
        }
      });
    }
  });
}
