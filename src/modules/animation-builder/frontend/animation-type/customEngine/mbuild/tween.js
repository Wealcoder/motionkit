import { applyStep } from "./step.js";

// No-timeline build path (anim.isTimelineEnabled === false). Each animation
// step becomes its own standalone gsap tween instead of being added to a
// shared timeline. `extraVars` is merged into every tween's vars — it carries
// the routed ScrollTrigger for on_scroll, or { paused: true } for click/hover
// and editor-preview page_load — mirroring buildTimeline's extraConfig.
//
// We reuse applyStep (and therefore every registered step handler) by handing
// it a timeline-shaped "sink" whose from/to/fromTo/set/call/add create
// standalone tweens and stash them. The timeline POSITION (overlap) argument
// has no meaning without a timeline, so the sink ignores its trailing arg.
//
// flip and call don't map cleanly onto a single scroll-driven tween: flip's
// Flip.from tween is collected via add() and call becomes a zero-delay
// delayedCall. extraVars can't be merged into an already-built child, but
// `paused` is applied post-hoc in add() so click/hover children stay paused
// until the event drives them; a ScrollTrigger passed to them is still dropped.
function createTweenSink(extraVars, dataCtx) {
  const withExtra = (vars) =>
    extraVars ? { ...(vars || {}), ...extraVars } : vars;
  const tweens = [];
  return {
    tweens,
    // step.js::buildStampedVars reads tl.vars?.data to inherit anim identity.
    vars: { data: dataCtx },
    from(target, vars) {
      const t = gsap.from(target, withExtra(vars));
      tweens.push(t);
      return t;
    },
    to(target, vars) {
      const t = gsap.to(target, withExtra(vars));
      tweens.push(t);
      return t;
    },
    fromTo(target, fromVars, toVars) {
      // ScrollTrigger / paused belong on the `to` vars for fromTo.
      const t = gsap.fromTo(target, fromVars, withExtra(toVars));
      tweens.push(t);
      return t;
    },
    set(target, vars) {
      const t = gsap.set(target, withExtra(vars));
      tweens.push(t);
      return t;
    },
    call(fn, args) {
      const t = gsap.delayedCall(0, fn, args || []);
      tweens.push(t);
      return t;
    },
    add(child) {
      // Children (e.g. flip's Flip.from) are built already, so extraVars can't
      // be merged in — but honor `paused` so they don't auto-play at load in
      // click/hover / editor-preview mode. ScrollTrigger stays intentionally dropped.
      if (extraVars?.paused) child?.paused?.(true);
      tweens.push(child);
      return child;
    },
  };
}

// Build the standalone tween(s) for a single step. Returns the created tweens
// (usually one; flip/splitText may differ). timelineId/Title are null since no
// timeline exists in this mode.
export function buildStepTweens(step, extraVars, animContext = {}) {
  const dataCtx = {
    animationId: animContext.animationId || null,
    animationTitle: animContext.animationTitle || null,
    timelineId: null,
    timelineTitle: null,
  };
  const sink = createTweenSink(extraVars, dataCtx);
  applyStep(sink, step);
  return sink.tweens;
}
