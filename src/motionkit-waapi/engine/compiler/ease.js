/* Ease name -> CSS timing function, and the bounce/elastic sampling path for curves a cubic-bezier cannot express. */

import { RESTING_VALUES } from '../../shared/catalogue.js';
import { compileStateToKeyframe } from './keyframe.js';

// GSAP ease name -> CSS timing function. Every entry the editor's easeTypes dropdown offers is here; a name present in the dropdown but missing here is invisible to the user, because the lookup falls back to power2.out rather than erroring — they pick Expo and watch a mild ease-out.
const EASE_MAP = {
  none: 'linear',
  linear: 'linear',
  /* Fitted to GSAP's own curves, not copied from a published "easeInCubic" table. Copying is what
     went wrong before: powerN is t raised to N+1, so power1 is quad and power2 cubic, and the
     borrowed names were off by one — Power1.in was actually cubic, Power2.out was the expo curve,
     and Power4.inOut was the same string as Power2.inOut, which made two dropdown entries do the
     same thing.

     GSAP's curves carry two symmetries and the fit is constrained to keep them: an .out is the
     exact mirror of its .in, and an .inOut is point-symmetric about (0.5, 0.5), so its second half
     is the mirror of its first. Fitting the three independently drifts off both for no accuracy
     gain — that drift is what left Sine.out three times further from GSAP than Sine.in.

     Quad and cubic ARE cubic beziers, so power1 and power2 are written exactly rather than fitted.
     Quart and quint are not, and neither is a piecewise inOut: one cubic segment cannot follow two,
     which is why the inOut entries carry the largest error in the table — 0.030 at worst, on
     Power4.inOut. Every other entry is within 0.020, and most within 0.008. */
  'power1.in': 'cubic-bezier(0.333, 0, 0.667, 0.333)',
  'power1.out': 'cubic-bezier(0.333, 0.667, 0.667, 1)',
  'power1.inout': 'cubic-bezier(0.484, 0.042, 0.516, 0.958)',
  'power2.in': 'cubic-bezier(0.333, 0, 0.667, 0)',
  'power2.out': 'cubic-bezier(0.333, 1, 0.667, 1)',
  'power2.inout': 'cubic-bezier(0.66, 0, 0.34, 1)',
  'power3.in': 'cubic-bezier(0.51, 0, 0.743, 0)',
  'power3.out': 'cubic-bezier(0.257, 1, 0.49, 1)',
  'power3.inout': 'cubic-bezier(0.775, 0, 0.225, 1)',
  'power4.in': 'cubic-bezier(0.641, 0, 0.785, 0)',
  'power4.out': 'cubic-bezier(0.215, 1, 0.359, 1)',
  'power4.inout': 'cubic-bezier(0.843, 0, 0.157, 1)',
  'back.in': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
  'back.out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'back.inout': 'cubic-bezier(0.72, -0.334, 0.28, 1.334)',
  'circ.in': 'cubic-bezier(0.55, 0, 1, 0.45)',
  'circ.out': 'cubic-bezier(0, 0.55, 0.45, 1)',
  'circ.inout': 'cubic-bezier(0.937, 0.204, 0.063, 0.796)',
  'expo.in': 'cubic-bezier(0.7, 0, 0.84, 0)',
  'expo.out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'expo.inout': 'cubic-bezier(0.896, 0, 0.104, 1)',
  'sine.in': 'cubic-bezier(0.362, 0, 0.674, 0.487)',
  'sine.out': 'cubic-bezier(0.326, 0.513, 0.638, 1)',
  'sine.inout': 'cubic-bezier(0.364, 0, 0.636, 1)',
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

/* GSAP's elastic, amplitude 1. The period is NOT one constant: configElastic reads
   `period || (type ? 0.3 : 0.45)`, and the inOut variant is the one built with no type, so it
   oscillates at 0.45 while in and out use 0.3. Composing inOut out of the 0.3 curve — the obvious
   thing to do — put our elastic.inOut 0.168 away from GSAP's at its worst, and overshooting past 1
   in the middle of the tween where GSAP is still climbing. Checked against gsap.parseEase in the
   browser: at 0.45 the difference is exactly zero. */
function elasticOut(t, p = 0.3) {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
}

const ELASTIC_INOUT_PERIOD = 0.45;

// Progress function for the eases that have to be sampled. Each returns eased progress 0..1 for linear input 0..1.
const EASE_FUNCTIONS = {
  'bounce.out': bounceOut,
  'bounce.in': (t) => 1 - bounceOut(1 - t),
  'bounce.inout': (t) =>
    t < 0.5 ? (1 - bounceOut(1 - 2 * t)) / 2 : (1 + bounceOut(2 * t - 1)) / 2,
  'elastic.out': (t) => elasticOut(t),
  'elastic.in': (t) => 1 - elasticOut(1 - t),
  'elastic.inout': (t) =>
    t < 0.5
      ? (1 - elasticOut(1 - 2 * t, ELASTIC_INOUT_PERIOD)) / 2
      : (1 + elasticOut(2 * t - 1, ELASTIC_INOUT_PERIOD)) / 2,
};

// Enough samples that the browser's linear interpolation between them is visually smooth: bounce's sharpest corner and elastic's fastest oscillation both land well inside one step at 60fps over a typical 0.6-1s duration.
const EASE_SAMPLES = 40;

// Timing lives in the same bag as the motion but is not a channel to sample — it is already on the animation's own options.
const TIMING_KEYS = new Set(['duration', 'delay', 'ease', 'repeat', 'yoyo']);

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
      if (TIMING_KEYS.has(key)) continue;

      // A channel only one side declares still animates — the other end is that property's resting value, so a `from` tween lands on the element's natural state instead of holding its opening one.
      const a = fromState[key] ?? RESTING_VALUES[key];
      const b = toState[key] ?? RESTING_VALUES[key];

      if (typeof a === 'number' && typeof b === 'number') {
        state[key] = lerp(a, b, eased);
        continue;
      }

      /* Not a pair of numbers, so there is nothing to blend per sample — a colour, a clip-path, a
         length carrying a unit, or a property with no resting value whose far end is genuinely
         unknown here. Named once at each end instead, leaving the browser to interpolate between
         them: natively for a colour or a clip-path, and from the element's own computed style when
         only one end is known, which is the same resolution the unsampled path relies on.

         That end travels linearly rather than along the sampled curve. Deciding it per sample
         instead — `eased < 1 ? a : b` — read as a discrete switch, and elastic crosses 1 seven
         times on the way out, so a bounced or elastic colour flipped back and forth between its two
         values seven times before settling. Naming the SAME value on all forty-one frames, the
         version before that, could not move at all. */
      if (a !== undefined && i === 0) state[key] = a;
      if (b !== undefined && i === EASE_SAMPLES) state[key] = b;
    }

    const frame = compileStateToKeyframe(state);
    frame.offset = linear;
    frames.push(frame);
  }

  return frames;
}
