// The editor authors timings in GSAP seconds, but imported and hand-edited records sometimes carry milliseconds. Values at or below the threshold read as seconds, above it as already-millisecond: 20s is far longer than any real UI animation, so the ambiguous band is empty in practice.
const SECONDS_MAX = 20;
// Below this a millisecond reading would be under one frame at 60Hz — never a real intent — so values just past the seconds threshold are still treated as seconds rather than compiling to an invisible flicker.
const MIN_SANE_MS = 50;

export function toMs(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  if (n === 0) return 0;
  return n <= SECONDS_MAX || n < MIN_SANE_MS ? n * 1000 : n;
}

/* WAAPI's own looping, off the timing object. `repeat` follows GSAP's counting — replays AFTER the first pass, with -1 meaning forever — while WAAPI counts total runs, hence the +1.

   `yoyo` maps to direction 'alternate', which is what makes a loop read as motion: without it the element springs back to its opening state at the end of every pass instead of easing back. */
export function compileLoopOptions(fromRaw = {}, toRaw = {}) {
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
