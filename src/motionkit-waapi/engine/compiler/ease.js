/* Ease name -> CSS timing function, and the bounce/elastic sampling path for curves a cubic-bezier cannot express. */

import { RESTING_VALUES } from '../../shared/catalogue.js';
import { compileStateToKeyframe } from './keyframe.js';

// GSAP ease name -> CSS timing function. Every entry the editor's easeTypes dropdown offers is here; a name present in the dropdown but missing here is invisible to the user, because the lookup falls back to power2.out rather than erroring — they pick Expo and watch a mild ease-out.
const EASE_MAP = {
  none: 'linear',
  linear: 'linear',
  'power1.in': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  'power1.out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  'power1.inout': 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  'power2.in': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  'power2.out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'power2.inout': 'cubic-bezier(0.77, 0, 0.175, 1)',
  'power3.in': 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  'power3.out': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  'power3.inout': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  'power4.in': 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
  'power4.out': 'cubic-bezier(0.19, 1, 0.22, 1)',
  'power4.inout': 'cubic-bezier(0.77, 0, 0.175, 1)',
  'back.in': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
  'back.out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'back.inout': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  'circ.in': 'cubic-bezier(0.55, 0, 1, 0.45)',
  'circ.out': 'cubic-bezier(0, 0.55, 0.45, 1)',
  'circ.inout': 'cubic-bezier(0.85, 0, 0.15, 1)',
  'expo.in': 'cubic-bezier(0.7, 0, 0.84, 0)',
  'expo.out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'expo.inout': 'cubic-bezier(0.87, 0, 0.13, 1)',
  'sine.in': 'cubic-bezier(0.12, 0, 0.39, 0)',
  'sine.out': 'cubic-bezier(0.39, 0.575, 0.565, 1)',
  'sine.inout': 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
  ease: 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
};

// Bounce and elastic overshoot and oscillate — the curve crosses the same output value several times, which a cubic-bezier cannot express at any control points. They are sampled into keyframes instead.
const KEYFRAME_EASES = new Set([
  'bounce.in',
  'bounce.out',
  'bounce.inout',
  'elastic.in',
  'elastic.out',
  'elastic.inout',
]);

const normalizeEase = (easeName) =>
  String(easeName ?? '')
    .toLowerCase()
    .trim();

export function needsKeyframeEase(easeName) {
  return KEYFRAME_EASES.has(normalizeEase(easeName));
}

// Whether the name resolves to a real curve, as opposed to landing on the fallback. Exported so a test can hold the editor's dropdown and this map together — they are separate lists, and drift between them is silent.
export function isKnownEase(easeName) {
  return Object.prototype.hasOwnProperty.call(
    EASE_MAP,
    normalizeEase(easeName),
  );
}

export function compileEaseToCss(easeName = 'power2.out') {
  return EASE_MAP[normalizeEase(easeName)] || EASE_MAP['power2.out'];
}

// GSAP's bounce: four decreasing arcs, the standard n1/d1 formulation.
function bounceOut(t) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

// GSAP's elastic defaults: amplitude 1, period 0.3.
function elasticOut(t) {
  if (t === 0 || t === 1) return t;
  const p = 0.3;
  return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
}

// Progress function for the eases that have to be sampled. Each returns eased progress 0..1 for linear input 0..1.
const EASE_FUNCTIONS = {
  'bounce.out': bounceOut,
  'bounce.in': (t) => 1 - bounceOut(1 - t),
  'bounce.inout': (t) =>
    t < 0.5 ? (1 - bounceOut(1 - 2 * t)) / 2 : (1 + bounceOut(2 * t - 1)) / 2,
  'elastic.out': elasticOut,
  'elastic.in': (t) => 1 - elasticOut(1 - t),
  'elastic.inout': (t) =>
    t < 0.5 ? (1 - elasticOut(1 - 2 * t)) / 2 : (1 + elasticOut(2 * t - 1)) / 2,
};

// Enough samples that the browser's linear interpolation between them is visually smooth: bounce's sharpest corner and elastic's fastest oscillation both land well inside one step at 60fps over a typical 0.6-1s duration.
const EASE_SAMPLES = 40;

// Numeric channels are interpolated per sample; everything else (transform strings, clip-path, colours) is carried as-is because it cannot be numerically blended here.
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/* Samples a from/to pair along an eased curve into an array of keyframes.

   Interpolates the RAW GSAP state (x: 40 -> x: 0), then compiles each sampled
   state through the normal keyframe compiler, so a sampled frame is built by
   exactly the same code path as an unsampled one.
*/
export function bakeEaseToKeyframes(fromState, toState, easeName) {
  const fn = EASE_FUNCTIONS[normalizeEase(easeName)];
  if (!fn) return null;

  const keys = new Set([...Object.keys(fromState), ...Object.keys(toState)]);
  const frames = [];

  for (let i = 0; i <= EASE_SAMPLES; i++) {
    const linear = i / EASE_SAMPLES;
    const eased = fn(linear);
    const state = {};

    for (const key of keys) {
      if (key === 'duration' || key === 'delay' || key === 'ease') continue;
      // A channel only one side declares still animates — the other end is that property's resting value, so a `from` tween lands on the element's natural state instead of holding its opening one.
      const a = fromState[key] ?? RESTING_VALUES[key];
      const b = toState[key] ?? RESTING_VALUES[key];
      if (typeof a === 'number' && typeof b === 'number') {
        state[key] = lerp(a, b, eased);
      } else {
        state[key] = eased < 1 ? (a ?? b) : (b ?? a);
      }
    }

    const frame = compileStateToKeyframe(state);
    frame.offset = linear;
    frames.push(frame);
  }

  return frames;
}
