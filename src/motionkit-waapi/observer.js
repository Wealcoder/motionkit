// GENERATED FILE — do not edit here.
// Source of truth: motionkit-editor/src/lib/motionkit-engine/waapiEngine/
// Re-sync with `npm run copy:wporg` in the editor repo.

/**
 * WAAPI Viewport Observer Manager
 * Pure browser native IntersectionObserver handling for Scroll Triggers.
 */

// Active observers registry for teardown
const activeObservers = new Set();

/**
 * Parses a start string (e.g. 'top 80%', 'top center', 'top 50%') into a CSS rootMargin.
 * @param {string} startStr
 * @returns {string}
 */
export function parseStartToRootMargin(startStr = 'top 80%') {
  if (!startStr || typeof startStr !== 'string') return '0px 0px -15% 0px';

  const lower = startStr.toLowerCase().trim();

  if (lower.includes('center') || lower.includes('50%')) {
    return '0px 0px -50% 0px';
  }

  // Parse percentages like 'top 80%', 'top 70%'
  const percentMatch = lower.match(/(\d+)%/);
  if (percentMatch) {
    const p = parseInt(percentMatch[1], 10);
    const bottomInset = 100 - p;
    return `0px 0px -${bottomInset}% 0px`;
  }

  if (lower.includes('top') && lower.includes('bottom')) {
    return '0px 0px 0% 0px';
  }

  return '0px 0px -20% 0px';
}

/**
 * Observes an element and triggers the callback when it enters the viewport.
 *
 * @param {HTMLElement} element
 * @param {Object} options
 * @param {string} [options.start='top 80%']
 * @param {boolean} [options.once=true]
 * @param {Function} options.onEnter
 * @param {Function} [options.onLeave]
 * @returns {Function} cleanup function to unobserve
 */
export function observeViewport(
  element,
  { start = 'top 80%', once = true, onEnter, onLeave },
) {
  if (!element || typeof onEnter !== 'function') return () => {};

  // If IntersectionObserver is not supported (ancient browsers), trigger immediately
  if (typeof IntersectionObserver === 'undefined') {
    onEnter(element);
    return () => {};
  }

  const rootMargin = parseStartToRootMargin(start);

  let hasTriggered = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          hasTriggered = true;
          onEnter(element);
          if (once) {
            observer.unobserve(element);
            activeObservers.delete(observer);
          }
        } else {
          if (!once && hasTriggered) {
            if (typeof onLeave === 'function') {
              onLeave(element);
            }
          }
        }
      });
    },
    {
      root: null,
      rootMargin,
      threshold: 0.05,
    },
  );

  observer.observe(element);
  activeObservers.add(observer);

  return () => {
    observer.unobserve(element);
    activeObservers.delete(observer);
  };
}

// Active scroll scrub listeners registry for teardown
const activeScrubCleanups = new Set();

/* A trigger position is two words, GSAP's syntax: "<element edge> <viewport edge>".
   "top 80%"     -> element's TOP    meets a line 80% down the viewport
   "bottom top"  -> element's BOTTOM meets the viewport's TOP
   Reading only one word cannot tell "bottom top" from "bottom bottom", which is how the default range ended up spanning a negative distance and pinning every scrubbed animation at progress 0. */

// How far down the viewport a named edge sits, in px from the viewport top.
function viewportEdgeOffset(word, winH, fallback) {
  if (!word) return fallback;
  if (word === 'top') return 0;
  if (word === 'center') return winH * 0.5;
  if (word === 'bottom') return winH;
  const pct = word.match(/^(\d+(?:\.\d+)?)%$/);
  if (pct) return (parseFloat(pct[1]) / 100) * winH;
  return fallback;
}

// Offset from the element's own top to the named edge — what has to line up with the viewport edge.
function elementEdgeOffset(word, height) {
  if (word === 'bottom') return height;
  if (word === 'center') return height * 0.5;
  return 0;
}

// Splits "bottom top" into its element half and viewport half. A single word names the VIEWPORT edge, with the element's top implied, matching how GSAP reads a bare value.
function parseTriggerPosition(value, fallback) {
  const words = String(value ?? '')
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return fallback;
  if (words.length === 1) return { element: 'top', viewport: words[0] };
  return { element: words[0], viewport: words[1] };
}

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
  const winH =
    window.innerHeight || document.documentElement.clientHeight || 800;

  const startPos = parseTriggerPosition(startStr, {
    element: 'top',
    viewport: '80%',
  });
  const endPos = parseTriggerPosition(endStr, {
    element: 'bottom',
    viewport: 'top',
  });

  // Both expressed as the element's TOP position at which the condition holds, so the two are directly comparable.
  const startY =
    viewportEdgeOffset(startPos.viewport, winH, winH * 0.8) -
    elementEdgeOffset(startPos.element, rect.height);
  const endY =
    viewportEdgeOffset(endPos.viewport, winH, 0) -
    elementEdgeOffset(endPos.element, rect.height);

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
 * @returns {Function} cleanup function
 */
export function observeScrollScrub(
  element,
  animation,
  { start = 'top center', end = 'bottom top', scrub = true },
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

    try {
      animation.currentTime =
        Math.min(Math.max(currentProgress, 0), 1) * duration;
    } catch {
      /* ignore */
    }

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  const cleanup = () => {
    isRunning = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    activeScrubCleanups.delete(cleanup);
  };

  activeScrubCleanups.add(cleanup);
  return cleanup;
}

/**
 * Disconnects and cleans up all active viewport observers and scrub listeners.
 */
export function disconnectAllObservers() {
  activeObservers.forEach((obs) => {
    try {
      obs.disconnect();
    } catch {
      /* ignore */
    }
  });
  activeObservers.clear();

  activeScrubCleanups.forEach((cleanup) => {
    try {
      cleanup();
    } catch {
      /* ignore */
    }
  });
  activeScrubCleanups.clear();
}
