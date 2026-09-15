// GENERATED FILE — do not edit here.
// Source of truth: motionkit-editor/src/lib/motionkit-engine/waapiEngine/
// Re-sync with `npm run copy:wporg` in the editor repo.

/**
 * WAAPI Compiler — Native Keyframe generator
 * Translates x, y, scale, rotate, opacity, blur into browser-native keyframes.
 */

export function compileTransformString(props = {}) {
  const parts = [];

  const x = props.x ?? 0;
  const y = props.y ?? 0;
  const z = props.z ?? 0;
  const xPercent = props.xPercent ?? 0;
  const yPercent = props.yPercent ?? 0;

  if (xPercent !== 0 || yPercent !== 0) {
    parts.push(`translate(${xPercent}%, ${yPercent}%)`);
  }

  if (x !== 0 || y !== 0 || z !== 0) {
    const xUnit = typeof x === 'number' ? `${x}px` : x;
    const yUnit = typeof y === 'number' ? `${y}px` : y;
    const zUnit = typeof z === 'number' ? `${z}px` : z;
    parts.push(`translate3d(${xUnit}, ${yUnit}, ${zUnit})`);
  }

  const rotate = props.rotate ?? props.rotation ?? props.rotationZ;
  if (rotate !== undefined && rotate !== 0) {
    const rotVal = typeof rotate === 'number' ? `${rotate}deg` : rotate;
    parts.push(`rotate(${rotVal})`);
  }

  if (props.rotationX !== undefined && props.rotationX !== 0) {
    const rotX =
      typeof props.rotationX === 'number'
        ? `${props.rotationX}deg`
        : props.rotationX;
    parts.push(`rotateX(${rotX})`);
  }

  if (props.rotationY !== undefined && props.rotationY !== 0) {
    const rotY =
      typeof props.rotationY === 'number'
        ? `${props.rotationY}deg`
        : props.rotationY;
    parts.push(`rotateY(${rotY})`);
  }

  const scale = props.scale;
  const scaleX = props.scaleX;
  const scaleY = props.scaleY;

  if (scale !== undefined && scale !== 1) {
    parts.push(`scale(${scale})`);
  } else {
    if (scaleX !== undefined && scaleX !== 1) parts.push(`scaleX(${scaleX})`);
    if (scaleY !== undefined && scaleY !== 1) parts.push(`scaleY(${scaleY})`);
  }

  if (props.skewX !== undefined && props.skewX !== 0) {
    const sX =
      typeof props.skewX === 'number' ? `${props.skewX}deg` : props.skewX;
    parts.push(`skewX(${sX})`);
  }
  if (props.skewY !== undefined && props.skewY !== 0) {
    const sY =
      typeof props.skewY === 'number' ? `${props.skewY}deg` : props.skewY;
    parts.push(`skewY(${sY})`);
  }

  return parts.length > 0 ? parts.join(' ') : 'none';
}

// A bare number carries the unit the property implies; a string is already authored and passes through untouched.
function withUnit(value, unit) {
  return typeof value === 'number' ? `${value}${unit}` : value;
}

/* Every filter effect is a value of the SINGLE `filter` property, so they compose into one space-separated string rather than separate keyframe keys — writing them separately meant the last assignment won and the rest vanished with no error.

   An explicit `filter` string wins outright: it is the escape hatch for anything this list does not name. */
const FILTER_UNITS = {
  blur: 'px',
  grayscale: '%',
  brightness: '%',
  contrast: '%',
  saturate: '%',
  sepia: '%',
  invert: '%',
  hueRotate: 'deg',
};

const FILTER_NAMES = { hueRotate: 'hue-rotate' };

function compileFilterString(props = {}) {
  if (props.filter !== undefined && props.filter !== '') return props.filter;

  const parts = [];
  for (const [key, unit] of Object.entries(FILTER_UNITS)) {
    const value = props[key];
    if (value === undefined || value === '') continue;
    parts.push(`${FILTER_NAMES[key] || key}(${withUnit(value, unit)})`);
  }
  return parts.length > 0 ? parts.join(' ') : '';
}

export function compileStateToKeyframe(stateProps = {}) {
  const keyframe = {};
  const transform = compileTransformString(stateProps);

  if (transform !== 'none') {
    keyframe.transform = transform;
  }

  if (stateProps.opacity !== undefined) {
    keyframe.opacity = Number(stateProps.opacity);
  }

  const filter = compileFilterString(stateProps);
  if (filter) keyframe.filter = filter;

  if (stateProps.transformOrigin)
    keyframe.transformOrigin = stateProps.transformOrigin;
  if (stateProps.clipPath) keyframe.clipPath = stateProps.clipPath;
  if (stateProps.color) keyframe.color = stateProps.color;
  if (stateProps.backgroundColor)
    keyframe.backgroundColor = stateProps.backgroundColor;

  // Plain animatable CSS the browser interpolates on its own — they only needed emitting. A bare number takes the unit the user meant rather than making them type it; a string passes through, so '50%' and 'center' still work.
  if (stateProps.boxShadow) keyframe.boxShadow = stateProps.boxShadow;
  if (stateProps.borderColor) keyframe.borderColor = stateProps.borderColor;
  if (stateProps.borderRadius !== undefined && stateProps.borderRadius !== '')
    keyframe.borderRadius = withUnit(stateProps.borderRadius, 'px');
  if (stateProps.letterSpacing !== undefined && stateProps.letterSpacing !== '')
    keyframe.letterSpacing = withUnit(stateProps.letterSpacing, 'px');
  if (stateProps.wordSpacing !== undefined && stateProps.wordSpacing !== '')
    keyframe.wordSpacing = withUnit(stateProps.wordSpacing, 'px');
  if (stateProps.width !== undefined && stateProps.width !== '')
    keyframe.width = withUnit(stateProps.width, 'px');
  if (stateProps.height !== undefined && stateProps.height !== '')
    keyframe.height = withUnit(stateProps.height, 'px');
  if (stateProps.backgroundSize)
    keyframe.backgroundSize = stateProps.backgroundSize;

  // Typography and box metrics, all verified to interpolate in Chromium. Numbers take the unit the property implies so a user types 24 rather than '24px'; fontWeight and lineHeight are unitless and pass through as-is.
  if (stateProps.fontSize !== undefined && stateProps.fontSize !== '')
    keyframe.fontSize = withUnit(stateProps.fontSize, 'px');
  if (stateProps.fontWeight !== undefined && stateProps.fontWeight !== '')
    keyframe.fontWeight = stateProps.fontWeight;
  if (stateProps.lineHeight !== undefined && stateProps.lineHeight !== '')
    keyframe.lineHeight = stateProps.lineHeight;
  if (stateProps.padding !== undefined && stateProps.padding !== '')
    keyframe.padding = withUnit(stateProps.padding, 'px');
  if (stateProps.margin !== undefined && stateProps.margin !== '')
    keyframe.margin = withUnit(stateProps.margin, 'px');
  if (stateProps.borderWidth !== undefined && stateProps.borderWidth !== '')
    keyframe.borderWidth = withUnit(stateProps.borderWidth, 'px');
  if (stateProps.textShadow) keyframe.textShadow = stateProps.textShadow;

  /* text-decoration-line is NOT interpolable — 'none' to 'underline' snaps at the midpoint the way clip-path's keyword does, so an underline that grows has to be drawn as a background gradient instead and swept with backgroundSize. Colour and thickness DO interpolate, so they are emitted for presets that underline an already-underlined element. */
  if (stateProps.textDecorationColor)
    keyframe.textDecorationColor = stateProps.textDecorationColor;
  if (
    stateProps.textDecorationThickness !== undefined &&
    stateProps.textDecorationThickness !== ''
  )
    keyframe.textDecorationThickness = withUnit(
      stateProps.textDecorationThickness,
      'px',
    );

  // The underline-sweep seed: a preset sets these once so backgroundSize has a gradient to reveal. They are not animated themselves, they just have to be present on the element.
  if (stateProps.backgroundImage)
    keyframe.backgroundImage = stateProps.backgroundImage;
  if (stateProps.backgroundRepeat)
    keyframe.backgroundRepeat = stateProps.backgroundRepeat;

  if (stateProps.outlineWidth !== undefined && stateProps.outlineWidth !== '')
    keyframe.outlineWidth = withUnit(stateProps.outlineWidth, 'px');
  if (stateProps.outlineOffset !== undefined && stateProps.outlineOffset !== '')
    keyframe.outlineOffset = withUnit(stateProps.outlineOffset, 'px');
  if (stateProps.outlineColor) keyframe.outlineColor = stateProps.outlineColor;
  if (stateProps.backgroundPosition)
    keyframe.backgroundPosition = stateProps.backgroundPosition;

  return keyframe;
}

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

// The value each property settles at when it is not being animated — what the two-keyframe path expresses as `transform: 'none', opacity: 1`. A sampled tween has to name them per property, because it interpolates the raw GSAP state rather than the compiled CSS: a `from` tween whose destination was left empty would read undefined on the far side and hold its opening value, ending invisible.
const RESTING_VALUES = {
  x: 0,
  y: 0,
  z: 0,
  xPercent: 0,
  yPercent: 0,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  rotate: 0,
  rotation: 0,
  rotationX: 0,
  rotationY: 0,
  skewX: 0,
  skewY: 0,
  opacity: 1,
  blur: 0,
  // Filter percentages rest at their identity, which is 100% for the ones that scale an existing quality and 0% for the ones that add an effect — brightness(100%) is the untouched image, grayscale(0%) likewise.
  grayscale: 0,
  sepia: 0,
  invert: 0,
  hueRotate: 0,
  brightness: 100,
  contrast: 100,
  saturate: 100,
  borderRadius: 0,
  letterSpacing: 0,
  wordSpacing: 0,
  // No resting value for fontSize, padding, margin or borderWidth: unlike a transform, their neutral state is whatever the stylesheet already says, and guessing 0 would make a baked ease collapse the element to nothing on the first frame.
  fontWeight: 400,
  outlineWidth: 0,
  outlineOffset: 0,
  textDecorationThickness: 0,
};

// Numeric channels are interpolated per sample; everything else (transform strings, clip-path, colours) is carried as-is because it cannot be numerically blended here.
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/* Samples a from/to pair along an eased curve into an array of keyframes.

   Interpolates the RAW GSAP state (x: 40 -> x: 0), then compiles each sampled
   state through the normal keyframe compiler, so a sampled frame is built by
   exactly the same code path as an unsampled one.
*/
function bakeEaseToKeyframes(fromState, toState, easeName) {
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

// The editor authors timings in GSAP seconds, but imported and hand-edited records sometimes carry milliseconds. Values at or below the threshold read as seconds, above it as already-millisecond: 20s is far longer than any real UI animation, so the ambiguous band is empty in practice.
const SECONDS_MAX = 20;
// Below this a millisecond reading would be under one frame at 60Hz — never a real intent — so values just past the seconds threshold are still treated as seconds rather than compiling to an invisible flicker.
const MIN_SANE_MS = 50;

function toMs(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  if (n === 0) return 0;
  return n <= SECONDS_MAX || n < MIN_SANE_MS ? n * 1000 : n;
}

/* WAAPI's own looping, off the timing object. `repeat` follows GSAP's counting — replays AFTER the first pass, with -1 meaning forever — while WAAPI counts total runs, hence the +1.

   `yoyo` maps to direction 'alternate', which is what makes a loop read as motion: without it the element springs back to its opening state at the end of every pass instead of easing back. */
function compileLoopOptions(fromRaw = {}, toRaw = {}) {
  const repeat = fromRaw.repeat ?? toRaw.repeat;
  const yoyo = fromRaw.yoyo ?? toRaw.yoyo;
  if (repeat === undefined || repeat === '' || Number(repeat) === 0) return {};

  const count = Number(repeat);
  const options = {
    iterations: count < 0 ? Infinity : count + 1,
  };
  if (yoyo === true || yoyo === 'true') options.direction = 'alternate';
  return options;
}

export function compileEffectToWaapi(effect = {}, device = 'desktop') {
  const method = effect.method || 'from';
  // Two callers, two shapes. The editor and connector dispatch through resolveAnimations, which flattens the per-device bag into `vars` for the active device and deletes `devices`. The WordPress plugin localizes the stored record as-is, so `devices` is still there and the runtime picks the device itself. Reading `vars` first keeps both paths on one compiler.
  const devData =
    effect.vars || effect.devices?.[device] || effect.devices?.desktop || {};

  const fromRaw = devData.from || {};
  const toRaw = devData.to || {};

  let fromKeyframe = {};
  let toKeyframe = {};

  if (method === 'from') {
    fromKeyframe = compileStateToKeyframe(fromRaw);
    toKeyframe = { transform: 'none', opacity: 1 };
    if (fromKeyframe.filter) toKeyframe.filter = 'none';
    // inset(0%), not 'none': the keyword is not an interpolable clip-path value, so a wipe held its opening shape to the halfway point and then snapped open. A fully-open inset is the same visible result and the browser can tween to it.
    if (fromKeyframe.clipPath) toKeyframe.clipPath = 'inset(0%)';
  } else if (method === 'to') {
    fromKeyframe = { transform: 'none', opacity: 1 };
    toKeyframe = compileStateToKeyframe(toRaw);
  } else {
    fromKeyframe = compileStateToKeyframe(fromRaw);
    toKeyframe = compileStateToKeyframe(toRaw);
  }

  const rawDuration = fromRaw.duration ?? toRaw.duration ?? 0.8;
  const rawDelay = fromRaw.delay ?? toRaw.delay ?? 0;
  const rawEase = fromRaw.ease ?? toRaw.ease ?? 'power2.out';

  const durationMs = toMs(rawDuration, 800);
  const delayMs = toMs(rawDelay, 0);
  const loop = compileLoopOptions(fromRaw, toRaw);

  // Bounce and elastic are sampled into many keyframes rather than expressed as a timing function, so the browser must interpolate them linearly — any easing on top would re-shape a curve that already carries its own shape.
  if (needsKeyframeEase(rawEase)) {
    const fromState = method === 'to' ? {} : fromRaw;
    const toState = method === 'from' ? {} : toRaw;
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
