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
  scrub off   The element's start edge is matched against a viewport edge, and the animation fires
              when it arrives. An end exists too, but only to decide when a replaying trigger
              re-arms; nothing runs between the two.
  scrub on    The same two lines, with progress running between them.

  Both paths ask triggerLines() for those positions. They did not always: the observer path used to
  sniff the start string for the words 'center', 'top' and 'bottom' and turn it into a percentage
  rootMargin, which threw the ELEMENT half of the position away. Four of the six named starts landed
  on the wrong line — 'top top' fired 635px early on an 800px viewport, and 'bottom top' was off by
  895px — and every start drifted further the taller the element got.
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

/**
 * Where a trigger's start and end sit, as the element-top positions at which each condition holds.
 *
 * One function for all three consumers — the observer path, the scrub path and the editor's markers
 * — so none of them can describe a line the others do not use. Expressed against the element's TOP
 * because that is what a rect gives directly, which makes the two comparable: the element is past
 * the start once `rect.top <= startY`, and past the end once `rect.top <= endY`.
 *
 * @param {Object} args
 * @param {{ top: number, height: number }} args.rect
 * @param {number} args.winH - viewport height
 * @param {string} args.start
 * @param {string} args.end
 * @returns {{ startY: number, endY: number }}
 */
export function triggerLines({
  rect,
  winH,
  start = 'top center',
  end = 'bottom top',
}) {
  const height = rect?.height ?? 0;
  const startPos = parseTriggerPosition(start, {
    element: 'top',
    viewport: '80%',
  });
  const endPos = parseTriggerPosition(end, {
    element: 'bottom',
    viewport: 'top',
  });

  return {
    startY:
      viewportEdgeOffset(startPos.viewport, winH, winH * 0.8) -
      elementEdgeOffset(startPos.element, height),
    endY:
      viewportEdgeOffset(endPos.viewport, winH, 0) -
      elementEdgeOffset(endPos.element, height),
  };
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

  const startPos = parseTriggerPosition(start, {
    element: 'top',
    viewport: '80%',
  });
  const endPos = parseTriggerPosition(end, {
    element: 'bottom',
    viewport: 'top',
  });

  const scrollerStart = viewportEdgeOffset(startPos.viewport, winH, winH * 0.8);
  const elementStart = rect.top + elementEdgeOffset(startPos.element, rect.height);

  // Nothing runs between the lines without scrub, so drawing an end there would be fiction.
  if (!isScrub) {
    return {
      isScrub: false,
      scrollerStart,
      scrollerEnd: null,
      elementStart,
      elementEnd: null,
    };
  }

  return {
    isScrub: true,
    scrollerStart,
    scrollerEnd: viewportEdgeOffset(endPos.viewport, winH, 0),
    elementStart,
    elementEnd: rect.top + elementEdgeOffset(endPos.element, rect.height),
  };
}
