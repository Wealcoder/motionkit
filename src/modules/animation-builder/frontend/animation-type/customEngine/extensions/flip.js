import { registerMethod } from "../registry.js";

// Editor emits vars flat (matches Flip.from API):
//   { duration, ease, absolute, scale, fade, spin, toggleClass, targets, props, ... }
// targets/toggleClass are consumed here for DOM mutation; everything else
// passes through to Flip.from.
export function registerFlipMethod() {
  if (typeof Flip === "undefined") return false;
  try {
    gsap.registerPlugin(Flip);
  } catch (e) {
    /* noop */
  }

  registerMethod("flip", (tl, step, vars, overlap) => {
    if (!step.itemClass || !vars) return;
    const selector = vars.targets || step.itemClass;
    const toggleClass = vars.toggleClass;
    const stateProps = vars.props;

    // strip targets/toggleClass — handled manually so we can capture state
    // pre-mutation. `props` stays on flipVars (Flip.from accepts it too).
    const flipVars = { ...vars };
    delete flipVars.targets;
    delete flipVars.toggleClass;

    console.log({ flipVars, tl });

    // Flip needs DOM-state diff: capture → mutate → animate, all at exec time.
    // The Flip.from tween runs independently of `tl` — subsequent timeline
    // steps don't wait for it (matches splitText/drawSVG behavior).

    const elements = gsap.utils.toArray(selector);
    if (!elements.length) return;

    const state = Flip.getState(
      elements,
      stateProps ? { props: stateProps } : undefined,
    );

    if (toggleClass) {
      elements.forEach((el) => el.classList.toggle(toggleClass));
    }

    console.log({ flipVars, state });

    tl.add(Flip.from(state, flipVars), overlap);
  });

  return true;
}
