// The editor draws its scroll-trigger markers from these functions and the engine fires from them, so a drift here shows up as a marker line that lies about where the animation starts. Both paths read triggerLines, and the cases below pin it against GSAP's own reading of a two-word position.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  elementEdgeOffset,
  parseTriggerPosition,
  scrollMarkerGeometry,
  triggerLines,
  viewportEdgeOffset,
} from './scrollPositions.js';

const rect = { top: 200, height: 300 };
const WIN_H = 1000;

/* A trigger position names an ELEMENT edge and a VIEWPORT edge, and both halves matter. The engine
   used to read only the viewport half on the non-scrub path, so "bottom center" waited for the
   element's TOP to reach the middle of the screen — 95px early on a 100px element and 380px early
   on a 400px one. These pin the element half in place. */
describe('triggerLines', () => {
  const linesFor = (height, start, end) =>
    triggerLines({ rect: { top: 0, height }, winH: WIN_H, start, end });

  test('should_place_a_top_edge_start_on_the_viewport_line_itself', () => {
    assert.equal(linesFor(300, 'top center', 'bottom top').startY, 500);
    assert.equal(linesFor(300, 'top bottom', 'bottom top').startY, 1000);
    assert.equal(linesFor(300, 'top top', 'bottom top').startY, 0);
  });

  // The element's own height is what separates these from the 'top ...' cases — reading the viewport half alone cannot tell them apart.
  test('should_lift_a_bottom_edge_start_by_the_element_height', () => {
    assert.equal(linesFor(300, 'bottom center', 'bottom top').startY, 200);
    assert.equal(linesFor(600, 'bottom center', 'bottom top').startY, -100);
    assert.equal(linesFor(300, 'bottom bottom', 'bottom top').startY, 700);
  });

  test('should_read_a_percentage_viewport_edge', () => {
    assert.equal(linesFor(300, 'top 80%', 'bottom top').startY, 800);
    assert.equal(linesFor(300, 'top 25%', 'bottom top').startY, 250);
  });

  test('should_place_the_end_the_same_way', () => {
    assert.equal(linesFor(300, 'top center', 'bottom top').endY, -300);
    assert.equal(linesFor(300, 'top center', 'top top').endY, 0);
  });

  // Scrolling down lowers rect.top, so an end that is not below the start spans nothing and the scrub path holds at 0 rather than dividing by it.
  test('should_leave_an_inverted_range_detectable', () => {
    const { startY, endY } = linesFor(300, 'bottom top', 'bottom top');
    assert.ok(endY >= startY, 'this pair spans nothing and must be visible as such');
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
  // Scrub off has a start line and nothing running after it, so a drawn end would be fiction: both end values are null and the caller can tell the difference.
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
