/**
 * WAAPI Viewport Observer Manager
 * Scroll trigger geometry: when an element reaches its start line, and how far it has travelled
 * between start and end. Both read the same lines out of shared/scrollPositions.js.
 */

import { triggerLines } from '../shared/scrollPositions.js';

/* One watcher list for every waiting trigger, measured on scroll and resize rather than from a
   permanent frame loop: a trigger only has to be right by the time the user can see it, so at rest
   this costs nothing at all. Reads are batched into a single animation frame, so a burst of scroll
   events still measures once.

   This replaced an IntersectionObserver per element. The observer could only express its start as a
   percentage rootMargin, which cannot say WHICH edge of the element is meant — and its 5% threshold
   silently never fired for an element more than twenty times the trigger region, so a very long
   section simply never animated. */
const viewportWatchers = new Set();
let watcherFrame = null;
let watcherListening = false;

function measureWatchers() {
  watcherFrame = null;
  // Copied first: a watcher that fires with `once` removes itself from the set while this runs.
  for (const measure of [...viewportWatchers]) measure();
}

function scheduleWatchers() {
  if (watcherFrame !== null || typeof requestAnimationFrame !== 'function') return;
  watcherFrame = requestAnimationFrame(measureWatchers);
}

function startWatching() {
  if (watcherListening || typeof window === 'undefined') return;
  watcherListening = true;
  // Capture, because a scroll inside a nested scrolling container does not bubble to the window.
  window.addEventListener('scroll', scheduleWatchers, {
    passive: true,
    capture: true,
  });
  window.addEventListener('resize', scheduleWatchers, { passive: true });
}

function stopWatching() {
  // The pending frame goes with the listeners: leaving it scheduled makes the next scheduleWatchers see a frame already in flight and never ask for one of its own.
  if (watcherFrame !== null) {
    if (typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(watcherFrame);
    }
    watcherFrame = null;
  }
  if (!watcherListening || typeof window === 'undefined') return;
  watcherListening = false;
  window.removeEventListener('scroll', scheduleWatchers, { capture: true });
  window.removeEventListener('resize', scheduleWatchers);
}

const viewportHeight = () =>
  (typeof window !== 'undefined' && window.innerHeight) ||
  (typeof document !== 'undefined' &&
    document.documentElement?.clientHeight) ||
  800;

/**
 * Watches an element and calls back when it reaches its start line.
 *
 * The line is the one triggerLines() gives, so it is the same position the scrub path and the
 * editor's markers use — "bottom center" really does wait for the element's BOTTOM to reach the
 * middle of the screen, on an element of any height.
 *
 * `end` only matters when the trigger replays: a `once: false` animation is re-armed once the
 * element has travelled past it, so the End control finally does something on this path. An end
 * that does not sit after the start is ignored rather than obeyed, since obeying it would mean an
 * animation that can never run.
 *
 * @param {HTMLElement} element
 * @param {Object} options
 * @param {string} [options.start='top center']
 * @param {string} [options.end='bottom top']
 * @param {boolean} [options.once=true]
 * @param {Function} options.onEnter
 * @param {Function} [options.onLeave]
 * @returns {Function} cleanup function
 */
export function observeViewport(
  element,
  { start = 'top center', end = 'bottom top', once = true, onEnter, onLeave },
) {
  if (!element || typeof onEnter !== 'function') return () => {};

  let inside = false;
  let finished = false;

  const measure = () => {
    if (finished) return;

    const rect = element.getBoundingClientRect();
    const { startY, endY } = triggerLines({
      rect,
      winH: viewportHeight(),
      start,
      end,
    });

    const hasRange = endY < startY;
    const active = rect.top <= startY && (!hasRange || rect.top > endY);
    if (active === inside) return;
    inside = active;

    if (!active) {
      if (typeof onLeave === 'function') onLeave(element);
      return;
    }

    onEnter(element);
    if (once) {
      finished = true;
      viewportWatchers.delete(measure);
      if (viewportWatchers.size === 0) stopWatching();
    }
  };

  viewportWatchers.add(measure);
  startWatching();
  // An element already past its start line on load has no scroll event coming, so the first measure is scheduled rather than waited for.
  scheduleWatchers();

  return () => {
    finished = true;
    viewportWatchers.delete(measure);
    if (viewportWatchers.size === 0) stopWatching();
  };
}

// Active scroll scrub listeners registry for teardown
const activeScrubCleanups = new Set();

/* A trigger position is two words, GSAP's syntax: "<element edge> <viewport edge>".
   "top 80%"     -> element's TOP    meets a line 80% down the viewport
   "bottom top"  -> element's BOTTOM meets the viewport's TOP
   Reading only one word cannot tell "bottom top" from "bottom bottom", which is how the default range ended up spanning a negative distance and pinning every scrubbed animation at progress 0. */

/**
 * Scroll progress of an element between a start and an end trigger position.
 *
 * @param {HTMLElement} element
 * @param {string} startStr e.g. 'top 80%', 'top center'
 * @param {string} endStr e.g. 'bottom top', 'bottom center'
 * @returns {number} progress between 0 and 1
 */
export function calculateProgress(
  element,
  startStr = 'top 80%',
  endStr = 'bottom top',
) {
  const rect = element.getBoundingClientRect();
  const { startY, endY } = triggerLines({
    rect,
    winH: viewportHeight(),
    start: startStr,
    end: endStr,
  });

  const totalSpan = startY - endY;
  if (totalSpan <= 0) return 0;

  const progress = (startY - rect.top) / totalSpan;
  return Math.min(Math.max(progress, 0), 1);
}

/**
 * Connects an animation's currentTime to user's scroll position (Native WAAPI Scrub).
 *
 * @param {HTMLElement} element
 * @param {Animation} animation
 * @param {Object} options
 * @param {string} [options.start='top 80%']
 * @param {string} [options.end='bottom top']
 * @param {number|boolean|string} [options.scrub=true]
 * @param {boolean} [options.once=false]
 * @returns {Function} cleanup function
 */
export function observeScrollScrub(
  element,
  animation,
  { start = 'top center', end = 'bottom top', scrub = true, once = false },
) {
  if (!element || !animation) return () => {};

  animation.pause();
  const duration =
    typeof animation.effect?.getTiming?.()?.duration === 'number'
      ? animation.effect.getTiming().duration
      : 1000;

  // A numeric scrub is a smoothing time in seconds; `true` means track scroll exactly. parseFloat('true') is NaN, which falls through to 1 — no smoothing — and that is the intended reading rather than an accident.
  const scrubNum = typeof scrub === 'string' ? parseFloat(scrub) : scrub;
  const lag =
    typeof scrubNum === 'number' && scrubNum > 0
      ? Math.min(1 / (scrubNum * 10), 0.5)
      : 1;

  let currentProgress = calculateProgress(element, start, end);
  let targetProgress = currentProgress;
  animation.currentTime = currentProgress * duration;

  let rafId = null;
  let isRunning = true;

  /* The loop runs every frame for as long as the scrub is alive, rather than
     being started by each scroll event and stopping once it catches up.

     Browsers coalesce scroll events: during a fast scroll they fire far less
     often than the display refreshes, so an event-driven scrub leaves the
     element sitting at a stale value between them and then jumps. Measured on a
     real page that was 61% of frames carrying an update and single-frame jumps
     of ~18px — visible stepping rather than motion. Reading scroll position
     once per frame costs one getBoundingClientRect and removes the stepping. */
  function tick() {
    if (!isRunning) return;

    targetProgress = calculateProgress(element, start, end);

    if (lag < 1) {
      currentProgress += (targetProgress - currentProgress) * lag;
      if (Math.abs(targetProgress - currentProgress) < 0.001) {
        currentProgress = targetProgress;
      }
    } else {
      currentProgress = targetProgress;
    }

    const clamped = Math.min(Math.max(currentProgress, 0), 1);

    try {
      animation.currentTime = clamped * duration;
    } catch {
      /* ignore */
    }

    // `once` means the animation plays a single time, so at the end line the scrub hands the element its finished state and lets go: the loop stops and scrolling back up no longer rewinds it. Without this the switch was accepted in the UI and ignored here, since only the IntersectionObserver path ever read it.
    if (once && clamped >= 1) {
      cleanup();
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  const cleanup = () => {
    isRunning = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    activeScrubCleanups.delete(cleanup);
  };

  activeScrubCleanups.add(cleanup);
  rafId = requestAnimationFrame(tick);
  return cleanup;
}

/**
 * Disconnects and cleans up all active viewport observers and scrub listeners.
 */
export function disconnectAllObservers() {
  viewportWatchers.clear();
  stopWatching();

  activeScrubCleanups.forEach((cleanup) => {
    try {
      cleanup();
    } catch {
      /* ignore */
    }
  });
  activeScrubCleanups.clear();
}
