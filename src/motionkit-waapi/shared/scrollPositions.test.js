// The editor draws its scroll-trigger markers from these functions and the engine fires from them, so a drift here shows up as a marker line that lies about where the animation starts. The geometry cases below pin both paths, and the rootMargin cases pin the strings the observer has always produced.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  elementEdgeOffset,
  parseStartToRootMargin,
  parseTriggerPosition,
  scrollMarkerGeometry,
  startInsetRatio,
  viewportEdgeOffset,
} from './scrollPositions.js';

const rect = { top: 200, height: 300 };
const WIN_H = 1000;

describe('startInsetRatio', () => {
  test('should_read_centre_as_half_the_viewport', () => {
    assert.equal(startInsetRatio('top center'), 0.5);
  });

  test('should_read_a_percentage_as_the_remainder', () => {
    assert.equal(startInsetRatio('top 80%'), 0.2);
    assert.equal(startInsetRatio('top 25%'), 0.75);
  });

  test('should_read_top_bottom_as_no_inset', () => {
    assert.equal(startInsetRatio('top bottom'), 0);
  });

  // Two different fallbacks, and the difference is deliberate: an omitted value takes the documented 'top 80%' default, while a present-but-unusable one (empty string, a number) is treated as broken input and gets the conservative 15%.
  test('should_fall_back_on_an_unusable_value', () => {
    assert.equal(startInsetRatio(''), 0.15);
    assert.equal(startInsetRatio(42), 0.15);
  });

  test('should_use_the_documented_default_when_omitted', () => {
    assert.equal(startInsetRatio(undefined), startInsetRatio('top 80%'));
  });
});

// The refactor that moved these out of observer.js must not have changed a single string — the observer has always emitted these exact values.
describe('parseStartToRootMargin', () => {
  test('should_keep_the_strings_the_observer_has_always_produced', () => {
    assert.equal(parseStartToRootMargin('top center'), '0px 0px -50% 0px');
    assert.equal(parseStartToRootMargin('top 80%'), '0px 0px -20% 0px');
    assert.equal(parseStartToRootMargin('top bottom'), '0px 0px 0% 0px');
    assert.equal(parseStartToRootMargin(''), '0px 0px -15% 0px');
  });

  // One representation, two readings: the marker line is placed from the ratio, the observer from the string, so they have to describe the same line.
  test('should_agree_with_the_inset_ratio', () => {
    for (const start of ['top center', 'top 80%', 'top 25%', 'top bottom']) {
      const fromString = parseStartToRootMargin(start).match(/(-?\d+(?:\.\d+)?)%/);
      const pct = Math.abs(parseFloat(fromString[1]));
      assert.equal(pct / 100, startInsetRatio(start), start);
    }
  });
});

describe('edge helpers', () => {
  test('should_place_named_viewport_edges', () => {
    assert.equal(viewportEdgeOffset('top', WIN_H, 0), 0);
    assert.equal(viewportEdgeOffset('center', WIN_H, 0), 500);
    assert.equal(viewportEdgeOffset('bottom', WIN_H, 0), 1000);
    assert.equal(viewportEdgeOffset('65%', WIN_H, 0), 650);
  });

  test('should_place_named_element_edges', () => {
    assert.equal(elementEdgeOffset('top', rect.height), 0);
    assert.equal(elementEdgeOffset('center', rect.height), 150);
    assert.equal(elementEdgeOffset('bottom', rect.height), 300);
  });

  test('should_read_a_bare_word_as_the_viewport_edge', () => {
    assert.deepEqual(parseTriggerPosition('center', {}), {
      element: 'top',
      viewport: 'center',
    });
  });
});

describe('scrollMarkerGeometry', () => {
  // Scrub off is an IntersectionObserver: a start line and nothing else. A drawn end there would be fiction, so both end values are null and the caller can tell the difference.
  test('should_give_the_observer_path_a_start_and_no_end', () => {
    const g = scrollMarkerGeometry({
      rect,
      winH: WIN_H,
      start: 'top center',
      end: 'bottom top',
      isScrub: false,
    });
    assert.equal(g.isScrub, false);
    assert.equal(g.scrollerStart, 500);
    assert.equal(g.scrollerEnd, null);
    assert.equal(g.elementStart, 200);
    assert.equal(g.elementEnd, null);
  });

  test('should_move_the_observer_start_line_with_the_start_value', () => {
    const g = scrollMarkerGeometry({
      rect,
      winH: WIN_H,
      start: 'top 25%',
      isScrub: false,
    });
    assert.equal(g.scrollerStart, 250);
  });

  test('should_give_the_scrub_path_all_four_lines', () => {
    const g = scrollMarkerGeometry({
      rect,
      winH: WIN_H,
      start: 'top center',
      end: 'bottom top',
      isScrub: true,
    });
    assert.equal(g.isScrub, true);
    assert.equal(g.scrollerStart, 500);
    assert.equal(g.scrollerEnd, 0);
    assert.equal(g.elementStart, 200);
    assert.equal(g.elementEnd, 500);
  });

  test('should_follow_the_element_as_it_scrolls', () => {
    const moved = scrollMarkerGeometry({
      rect: { top: -100, height: 300 },
      winH: WIN_H,
      start: 'top center',
      end: 'bottom top',
      isScrub: true,
    });
    assert.equal(moved.elementStart, -100);
    assert.equal(moved.elementEnd, 200);
  });

  test('should_return_nothing_without_a_rect_or_a_viewport', () => {
    assert.equal(scrollMarkerGeometry({ rect: null, winH: WIN_H }), null);
    assert.equal(scrollMarkerGeometry({ rect, winH: 0 }), null);
  });
});
