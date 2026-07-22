import { buildTimeline } from "../mbuild/timeline.js";
import { buildStepTweens } from "../mbuild/tween.js";
import { isStepActive } from "../select/filter.js";
import {
  buildFlip,
  stepUsesFlip,
  flipVarsForStep,
} from "../extensions/flip.js";
import { attachPlayLogger } from "../helper/logger.js";
import { registerTimeline, isEditorPreviewMode } from "../customRegistry.js";
import { isTimelineEnabledFor } from "../helper/guards.js";
import {
  collectInteractionTargets,
  collectAnimatedElements,
  timelineHasScrollTo,
} from "../helper/interactionTargets.js";
import { claimTargets, setAnims } from "../ownership.js";

// Adapt a flip step to the play/reverse/restart interface the interaction
// listeners expect. Each call runs a FRESH capture → toggle → Flip.from via
// buildFlip, so click becomes a real toggle (class flips on/off every click)
// and hover re-diffs the live layout on every enter/leave. Built through
// ctx.add so the event-time Flip.from tweens are tracked for teardown revert.
function makeLiveFlip(step, ctx) {
  const vars = flipVarsForStep(step);
  const run = () => {
    if (!vars) return;
    ctx.add(() => buildFlip(step, vars));
  };
  return { play: run, reverse: run, restart: run };
}

export function buildInteractionAnim(anim, eventType) {
  const triggers = collectInteractionTargets(anim);
  if (!triggers.length) return null;

  const editorMode = isEditorPreviewMode();
  const timelineEnabled = isTimelineEnabledFor(anim);

  // Both modes yield an array of paused GSAP animations (timelines or tweens);
  // the listeners below drive them identically via play/reverse/restart.
  const tlCfg = anim.timeline;

  // Flip can't be baked into a paused tween and replayed: each event needs a fresh getState → mutate → Flip.from against the CURRENT layout, or the class toggles at load, never reverses, and never re-diffs. On the public site we pull flip steps out of the built timeline and drive them live per event (makeLiveFlip). Editor preview keeps the build-time path so DevTools can own playback.
  const liveFlipSteps =
    editorMode || !tlCfg
      ? []
      : (tlCfg.animations || []).filter(
          (s) => isStepActive(s) && stepUsesFlip(s),
        );
  const liveFlipIds = new Set(liveFlipSteps.map((s) => s.id));
  const buildCfg =
    liveFlipIds.size && tlCfg
      ? {
          ...tlCfg,
          animations: (tlCfg.animations || []).filter(
            (s) => !liveFlipIds.has(s.id),
          ),
        }
      : tlCfg;

  const anims = [];
  const ctx = gsap.context(() => {
    if (!buildCfg) return;
    // paused override — event drives playback regardless of tlCfg.vars.paused
    if (timelineEnabled) {
      // Skip building an empty timeline when every step was pulled out for live flip — otherwise buildTimeline yields an inert 0-child timeline.
      const hasSteps = (buildCfg.animations || []).length > 0;
      const tl = hasSteps
        ? buildTimeline(
            buildCfg,
            { paused: true },
            {
              animationId: anim.id,
              animationTitle: anim.title,
            },
          )
        : null;
      if (tl) {
        anims.push(tl);
        if (editorMode) registerTimeline(anim.id, tl);
      }
    } else {
      (buildCfg.animations || []).forEach((step) => {
        buildStepTweens(
          step,
          { paused: true },
          {
            animationId: anim.id,
            animationTitle: anim.title,
          },
        ).forEach((t) => {
          anims.push(t);
          if (editorMode) registerTimeline(anim.id, t);
        });
      });
    }
  });

  anims.forEach((a) =>
    attachPlayLogger(a, {
      timelineId: timelineEnabled ? tlCfg.id : null,
      timelineData: timelineEnabled ? tlCfg : null,
      animationId: anim.id,
      animationData: anim,
    }),
  );

  // Live flip wrappers go in after the play-logger pass — they aren't real gsap
  // animations, so the logger would choke on them; the listeners drive them all
  // the same. (editorMode returns early below, so this only runs public-site.)
  liveFlipSteps.forEach((step) => anims.push(makeLiveFlip(step, ctx)));

  // In editor preview mode, DevTools owns playback for click/hover anims —
  // attaching live listeners here would let user interaction call play()/
  // reverse()/restart() on a child timeline that is already nested inside
  // DevTools' master. With smoothChildTiming the child ticking against a
  // paused master pushes master.time() forward, which makes the playhead
  // ruler drift right indefinitely. Skip listeners and let DevTools drive.
  if (editorMode) {
    return { contexts: [ctx], listeners: [] };
  }

  // Element-exclusive playback: a single animated element (e.g. one heading) can be the target of several click/hover anims. Register this anim's built animations so that when another anim later claims the same element it can pause+rewind these, and collect the animated targets the listeners reset.
  setAnims(anim.id, anims);
  const animatedEls = collectAnimatedElements(anim);

  const preventAnchorNav = timelineHasScrollTo(anim);
  const listeners = attachInteractionListeners(
    triggers,
    eventType,
    anims,
    preventAnchorNav,
    animatedEls,
    anim.id,
  );

  return { contexts: [ctx], listeners };
}

// Wire click / hover DOM listeners to drive a set of paused GSAP animations.
// Returns teardown thunks. Works for both timelines and raw tweens since both
// expose restart()/play()/reverse().
//
// Before playing, claimTargets resets any of animatedEls currently owned by a
// DIFFERENT animation back to the author's original styles (element-exclusive,
// last-trigger-wins). It returns true when it actually displaced another owner
// — only then do we invalidate() so from/fromTo tweens re-read the clean origin
// instead of a value cached against the previous animation's leftover styles.
function attachInteractionListeners(
  triggers,
  eventType,
  anims,
  preventAnchorNav,
  animatedEls,
  animId,
) {
  const listeners = [];
  triggers.forEach((el) => {
    if (eventType === "click") {
      const onClick = (ev) => {
        if (preventAnchorNav && el.tagName === "A") ev.preventDefault();
        const switched = claimTargets(animatedEls, animId);
        anims.forEach((t) => {
          if (switched) t.invalidate?.();
          // restart() re-renders the "from" values synchronously — for a
          // staggered reveal that's still mid-flight, every target (at
          // whatever opacity it individually happened to reach) snaps back
          // to invisible in the same instant, reading as a broken flash
          // rather than a replay. Let an in-flight play finish undisturbed;
          // only a click that lands after it's at rest replays it.
          if (t.isActive?.()) return;
          t.restart();
        });
      };
      el.addEventListener("click", onClick);
      listeners.push(() => el.removeEventListener("click", onClick));
    } else if (eventType === "hover") {
      const onEnter = () => {
        const switched = claimTargets(animatedEls, animId);
        anims.forEach((t) => {
          if (switched) t.invalidate?.();
          t.play();
        });
      };
      const onLeave = () => anims.forEach((t) => t.reverse());
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      listeners.push(() => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    }
  });
  return listeners;
}
