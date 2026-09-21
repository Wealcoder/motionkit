/**
 * Where a free scroll trigger's start and end actually sit.
 *
 * Shared because two consumers must agree on it: the engine, which uses these to decide WHEN an
 * animation fires, and the editor, which draws its scroll-trigger markers from the very same
 * functions (synced out as source by scripts/copy-to-editor.js, like catalogue.js). A marker that
 * disagrees with the engine is worse than no marker — it teaches the user a position that is not
 * the one the animation will use.
 */

// There are two trigger paths and they do NOT share a model, which is the whole reason this file exists rather than a single formula — anything drawing markers has to ask which path is live and use that path's geometry.

/*
  scrub off   IntersectionObserver with a rootMargin. Only a start exists, expressed as an inset
              from the viewport BOTTOM: the element enters when its top crosses that line, and
              nothing ends it.
  scrub on    The element's own edge is matched against a viewport edge, at both ends, and
              progress runs between them.
*/

// How far down the viewport a named edge sits, in px from the viewport top.
export function viewportEdgeOffset(word, winH, fallback) {
  if (!word) return fallback;
  if (word === 'top') return 0;
  if (word === 'center') return winH * 0.5;
  if (word === 'bottom') return winH;
  const pct = word.match(/^(\d+(?:\.\d+)?)%$/);
  if (pct) return (parseFloat(pct[1]) / 100) * winH;
  return fallback;
}

// Offset from the element's own top to the named edge — what has to line up with the viewport edge.
export function elementEdgeOffset(word, height) {
  if (word === 'bottom') return height;
  if (word === 'center') return height * 0.5;
  return 0;
}

// Splits "bottom top" into its element half and viewport half. A single word names the VIEWPORT edge, with the element's top implied, matching how GSAP reads a bare value.
export function parseTriggerPosition(value, fallback) {
  const words = String(value ?? '')
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return fallback;
  if (words.length === 1) return { element: 'top', viewport: words[0] };
  return { element: words[0], viewport: words[1] };
}

// The observer path's start, as a fraction of the viewport inset from its BOTTOM edge: 0.5 means the element enters when its top reaches the middle of the screen. Split out from the rootMargin string so a marker can be placed at the same line without re-parsing CSS.
export function startInsetRatio(startStr = 'top 80%') {
  if (!startStr || typeof startStr !== 'string') return 0.15;

  const lower = startStr.toLowerCase().trim();

  if (lower.includes('center') || lower.includes('50%')) return 0.5;

  const percentMatch = lower.match(/(\d+)%/);
  if (percentMatch) return (100 - parseInt(percentMatch[1], 10)) / 100;

  if (lower.includes('top') && lower.includes('bottom')) return 0;

  return 0.2;
}

/**
 * Parses a start string (e.g. 'top 80%', 'top center', 'top 50%') into a CSS rootMargin.
 * @param {string} startStr
 * @returns {string}
 */
export function parseStartToRootMargin(startStr = 'top 80%') {
  const ratio = startInsetRatio(startStr);
  // A zero inset is written without the sign, the way it always has been — the observer treats them alike, but the string is what tests and debuggers read.
  if (ratio === 0) return '0px 0px 0% 0px';
  return `0px 0px -${ratio * 100}% 0px`;
}

/**
 * The lines a scroll trigger's markers should be drawn on, in viewport pixels from the top.
 *
 * `scroller*` are fixed screen lines; `element*` move with the element and are only meaningful
 * while it is on screen. On the observer path there is no end of any kind, so both end values are
 * null rather than a guess — a drawn end line there would be fiction.
 *
 * @param {Object} args
 * @param {{ top: number, height: number }} args.rect - the element's bounding rect
 * @param {number} args.winH - viewport height
 * @param {string} args.start
 * @param {string} args.end
 * @param {boolean} args.isScrub - whether the scrub path is the live one
 */
export function scrollMarkerGeometry({
  rect,
  winH,
  start = 'top center',
  end = 'bottom top',
  isScrub = false,
}) {
  if (!rect || !winH) return null;

  if (!isScrub) {
    return {
      isScrub: false,
      scrollerStart: winH - startInsetRatio(start) * winH,
      scrollerEnd: null,
      elementStart: rect.top,
      elementEnd: null,
    };
  }

  const startPos = parseTriggerPosition(start, {
    element: 'top',
    viewport: '80%',
  });
  const endPos = parseTriggerPosition(end, {
    element: 'bottom',
    viewport: 'top',
  });

  return {
    isScrub: true,
    scrollerStart: viewportEdgeOffset(startPos.viewport, winH, winH * 0.8),
    scrollerEnd: viewportEdgeOffset(endPos.viewport, winH, 0),
    elementStart: rect.top + elementEdgeOffset(startPos.element, rect.height),
    elementEnd: rect.top + elementEdgeOffset(endPos.element, rect.height),
  };
}
