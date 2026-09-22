/* WAAPI Compiler — the public entry point. Assembles a from/to keyframe pair (or a sampled bounce/elastic sequence) from a GSAP-shaped effect record.

   The actual per-property work lives in the sibling modules — this file is the orchestrator only:
     ./keyframe.js   state -> one keyframe (catalogue-driven)
     ./ease.js       ease name -> CSS timing function, or a sampled keyframe sequence
     ./timing.js     duration/delay/loop parsing

   Re-exports every name the rest of the engine and its tests import, so `from '../compiler/index.js'` (or the folder import `'../compiler'`) is the one path anything outside this folder needs. */

import { compileStateToKeyframe } from './keyframe.js';
import {
  needsKeyframeEase,
  isKnownEase,
  compileEaseToCss,
  bakeEaseToKeyframes,
} from './ease.js';
import { toMs, compileLoopOptions } from './timing.js';

export {
  compileTransformString,
  compileStateToKeyframe,
} from './keyframe.js';
export { needsKeyframeEase, isKnownEase, compileEaseToCss } from './ease.js';

export function compileEffectToWaapi(effect = {}, device = 'desktop') {
  const method = effect.method || 'from';
  // Two callers, two shapes. The editor and connector dispatch through resolveAnimations, which flattens the per-device bag into `vars` for the active device and deletes `devices`. The WordPress plugin localizes the stored record as-is, so `devices` is still there and the runtime picks the device itself. Reading `vars` first keeps both paths on one compiler.
  const devData =
    effect.vars || effect.devices?.[device] || effect.devices?.desktop || {};

  const fromRaw = devData.from || {};
  const toRaw = devData.to || {};

  let fromKeyframe = {};
  let toKeyframe = {};

  /* Keyword constants the animated side needs but the synthetic side would not carry. They are not interpolable, so they have to be present on BOTH keyframes or the browser drops the property for the whole animation — border-style is what makes an animated border-width paint at all. */
  const carryKeywords = (target, source) => {
    if (source.borderStyle) target.borderStyle = source.borderStyle;
    if (source.outlineStyle) target.outlineStyle = source.outlineStyle;
    return target;
  };

  /* Forward, a property the synthetic keyframe does not name is filled from the element's own computed style — which is the resting look, exactly right. Reversed, that same frame is the ENDPOINT, and the browser resolves it against what the element computes mid-animation: its own fill. A reverted border width climbed 1px → 2px → 3px over successive hovers because of it.

     Only properties with a resting value that is universally true get one. An element's padding is whatever its stylesheet says, so naming 0 there would collapse it on the way in instead of growing from where it sits. */
  const REST_ON_SYNTHETIC = { borderWidth: '0px', outlineWidth: '0px' };

  const carryRestingValues = (target, source) => {
    for (const [prop, rest] of Object.entries(REST_ON_SYNTHETIC)) {
      if (source[prop] !== undefined) target[prop] = rest;
    }
    return target;
  };

  if (method === 'from') {
    fromKeyframe = compileStateToKeyframe(fromRaw);
    toKeyframe = carryRestingValues(
      carryKeywords({ transform: 'none', opacity: 1 }, fromKeyframe),
      fromKeyframe,
    );
    if (fromKeyframe.filter) toKeyframe.filter = 'none';
    // inset(0%), not 'none': the keyword is not an interpolable clip-path value, so a wipe held its opening shape to the halfway point and then snapped open. A fully-open inset is the same visible result and the browser can tween to it.
    if (fromKeyframe.clipPath) toKeyframe.clipPath = 'inset(0%)';
  } else if (method === 'to') {
    toKeyframe = compileStateToKeyframe(toRaw);
    fromKeyframe = carryRestingValues(
      carryKeywords({ transform: 'none', opacity: 1 }, toKeyframe),
      toKeyframe,
    );
  } else {
    fromKeyframe = compileStateToKeyframe(fromRaw);
    toKeyframe = compileStateToKeyframe(toRaw);
  }

  /* Timing and loop come from the method's LEADING half first — `to` for a 'to' effect, `from`
     otherwise — because that is the half the editor's card writes them to (halvesOf(method)[0] in
     the components library). Reading `from` first for every method meant a 'to' preset that
     happened to carry a timing-only `from` bag, which the five Button presets and Hover Style did,
     shadowed every edit: the user set Duration to 3s on the card, the record held it under `to`,
     and the compiler went on playing the 1.2s under `from`. */
  const lead = method === 'to' ? toRaw : fromRaw;
  const trail = method === 'to' ? fromRaw : toRaw;

  const rawDuration = lead.duration ?? trail.duration ?? 0.8;
  const rawDelay = lead.delay ?? trail.delay ?? 0;
  const rawEase = lead.ease ?? trail.ease ?? 'power2.out';

  const durationMs = toMs(rawDuration, 800);
  const delayMs = toMs(rawDelay, 0);
  const loop = compileLoopOptions(lead, trail);

  /* The synthetic side of a one-ended tween, in RAW terms — the sampler interpolates raw state, so
     the rules the two keyframes above get through carryKeywords/carryRestingValues have to reach it
     in that vocabulary or a sampled ease quietly behaves differently from every other ease.
     Properties with a catalogue resting value need nothing here; the sampler already fills those. */
  const syntheticRaw = (source) => {
    const out = carryRestingValues(carryKeywords({}, source), source);
    // inset(0%), not 'none', for the same reason as above: a wipe under a sampled ease resolved its
    // far end from the element's computed clip-path, which is the non-interpolable keyword, so the
    // browser flipped it halfway instead of wiping.
    if (source.clipPath) out.clipPath = 'inset(0%)';
    return out;
  };

  // Bounce and elastic are sampled into many keyframes rather than expressed as a timing function, so the browser must interpolate them linearly — any easing on top would re-shape a curve that already carries its own shape.
  if (needsKeyframeEase(rawEase)) {
    const fromState = method === 'to' ? syntheticRaw(toRaw) : fromRaw;
    const toState = method === 'from' ? syntheticRaw(fromRaw) : toRaw;
    const baked = bakeEaseToKeyframes(fromState, toState, rawEase);
    if (baked) {
      return {
        keyframes: baked,
        options: {
          duration: durationMs,
          delay: delayMs,
          easing: 'linear',
          fill: 'both',
          ...loop,
        },
      };
    }
  }

  return {
    keyframes: [fromKeyframe, toKeyframe],
    options: {
      duration: durationMs,
      delay: delayMs,
      easing: compileEaseToCss(rawEase),
      fill: 'both',
      ...loop,
    },
  };
}
