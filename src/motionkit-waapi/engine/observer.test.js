// Covers the scroll-position maths behind scrub. GSAP's trigger syntax is two words — "<element edge> <viewport edge>" — and reading only one of them silently produces a nonsensical span: the animation then sits frozen at progress 0 through the entire scroll, which looks exactly like an element that never animates rather than like an error.

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

let dom;
let calculateProgress;

const WIN_H = 700;
const EL_H = 80;

beforeEach(async () => {
  dom = new JSDOM('<!doctype html><html><body></body></html>');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  dom.window.innerHeight = WIN_H;
  ({ calculateProgress } = await import(
    `./observer.js?t=${Date.now()}${Math.random()}`
  ));
});

afterEach(() => {
  delete globalThis.window;
  delete globalThis.document;
  dom.window.close();
});

// An element whose top sits `top` px below the viewport top.
const elementAt = (top) => ({
  getBoundingClientRect: () => ({
    top,
    bottom: top + EL_H,
    height: EL_H,
    left: 0,
    right: 100,
    width: 100,
  }),
});

describe('calculateProgress with the default trigger range', () => {
  const START = 'top 80%';
  const END = 'bottom top';

  test('should_be_zero_before_the_element_reaches_the_start_line', () => {
    // Far below the fold.
    assert.equal(calculateProgress(elementAt(WIN_H + 500), START, END), 0);
  });

  test('should_be_one_after_the_element_has_passed_the_end_line', () => {
    // Fully scrolled past the top of the viewport.
    assert.equal(calculateProgress(elementAt(-500), START, END), 1);
  });

  // The whole point of scrub: between the two lines the value has to MOVE. A frozen 0 here is the bug this file exists to catch.
  test('should_advance_as_the_element_travels_up_the_viewport', () => {
    const samples = [600, 450, 300, 150, 0, -80].map((top) =>
      calculateProgress(elementAt(top), START, END),
    );
    assert.ok(
      new Set(samples).size > 1,
      `progress never changed across the scroll: ${samples.join(', ')}`,
    );
    for (let i = 1; i < samples.length; i++) {
      assert.ok(
        samples[i] >= samples[i - 1],
        `progress went backwards: ${samples.join(', ')}`,
      );
    }
  });

  test('should_stay_within_zero_and_one', () => {
    for (const top of [2000, 600, 300, 0, -300, -2000]) {
      const v = calculateProgress(elementAt(top), START, END);
      assert.ok(v >= 0 && v <= 1, `out of range: ${v}`);
    }
  });
});

// "bottom top" and "bottom bottom" differ only in the SECOND word, so a parser that scans the whole string for "bottom" cannot tell them apart.
describe('calculateProgress reads both words of the range', () => {
  test('should_treat_bottom_top_differently_from_bottom_bottom', () => {
    const el = elementAt(300);
    assert.notEqual(
      calculateProgress(el, 'top 80%', 'bottom top'),
      calculateProgress(el, 'top 80%', 'bottom bottom'),
    );
  });

  test('should_treat_top_bottom_differently_from_top_top', () => {
    const el = elementAt(300);
    assert.notEqual(
      calculateProgress(el, 'top bottom', 'bottom top'),
      calculateProgress(el, 'top top', 'bottom top'),
    );
  });

  test('should_advance_for_the_top_bottom_start_line_too', () => {
    const samples = [WIN_H, 500, 250, 0, -EL_H].map((top) =>
      calculateProgress(elementAt(top), 'top bottom', 'bottom top'),
    );
    assert.ok(
      new Set(samples).size > 1,
      `progress never changed: ${samples.join(', ')}`,
    );
  });
});

// Smoothness is a property of WHEN the scrub updates, not of the maths. Driving it from the scroll event alone leaves the animation at whatever value the last event produced, and browsers coalesce those events — so the element visibly steps rather than glides. These lock the loop to animation frames instead.
describe('observeScrollScrub update cadence', () => {
  let observeScrollScrub;
  let rafQueue;
  let scrollHandlers;

  beforeEach(async () => {
    rafQueue = [];
    scrollHandlers = [];
    globalThis.requestAnimationFrame = (cb) => {
      rafQueue.push(cb);
      return rafQueue.length;
    };
    globalThis.cancelAnimationFrame = () => {};
    dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
    dom.window.cancelAnimationFrame = globalThis.cancelAnimationFrame;
    const origAdd = dom.window.addEventListener.bind(dom.window);
    dom.window.addEventListener = (type, fn, opts) => {
      if (type === 'scroll') scrollHandlers.push(fn);
      return origAdd(type, fn, opts);
    };
    ({ observeScrollScrub } = await import(
      `./observer.js?t=${Date.now()}${Math.random()}`
    ));
  });

  const fakeAnimation = () => ({
    currentTime: 0,
    paused: false,
    pause() {
      this.paused = true;
    },
    effect: { getTiming: () => ({ duration: 1000 }) },
  });

  // A scrubbed animation has to re-read scroll position every frame. Waiting for the next scroll event means the value is stale for however long the browser withholds one.
  test('should_keep_requesting_animation_frames_while_active', () => {
    const anim = fakeAnimation();
    observeScrollScrub(elementAt(300), anim, {
      start: 'top center',
      end: 'bottom top',
      scrub: 'true',
    });

    const before = rafQueue.length;
    assert.ok(before > 0, 'scrub should start a frame loop immediately');

    // Draining a frame must schedule the next one, with no scroll event in between.
    const cb = rafQueue.shift();
    cb();
    assert.ok(
      rafQueue.length > 0,
      'each frame must schedule the next, independent of scroll events',
    );
  });

  test('should_pause_the_animation_so_scroll_drives_it', () => {
    const anim = fakeAnimation();
    observeScrollScrub(elementAt(300), anim, { scrub: 'true' });
    assert.equal(anim.paused, true);
  });

  test('should_stop_the_frame_loop_on_cleanup', () => {
    const anim = fakeAnimation();
    const stop = observeScrollScrub(elementAt(300), anim, { scrub: 'true' });
    stop();
    const drained = rafQueue.length;
    rafQueue.splice(0).forEach((cb) => cb());
    assert.ok(
      rafQueue.length === 0,
      `cleanup must stop the loop; it queued ${rafQueue.length} more frames after ${drained}`,
    );
  });
});

// `once` is the user-facing promise that an animation plays a single time. On the non-scrub path the watcher honours it by dropping the element after it fires; on the scrub path the frame loop runs forever, so scrolling back up rewinds the animation and the switch does nothing. These pin the completed state down.
describe('observeScrollScrub with once', () => {
  let observeScrollScrub;
  let rafQueue;

  beforeEach(async () => {
    rafQueue = [];
    globalThis.requestAnimationFrame = (cb) => {
      rafQueue.push(cb);
      return rafQueue.length;
    };
    globalThis.cancelAnimationFrame = () => {};
    dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
    dom.window.cancelAnimationFrame = globalThis.cancelAnimationFrame;
    ({ observeScrollScrub } = await import(
      `./observer.js?t=${Date.now()}${Math.random()}`
    ));
  });

  const fakeAnimation = () => ({
    currentTime: 0,
    paused: false,
    pause() {
      this.paused = true;
    },
    effect: { getTiming: () => ({ duration: 1000 }) },
  });

  // An element that can be scrolled between frames, unlike the fixed `elementAt` helper.
  const movableElement = (top) => {
    const state = { top };
    return {
      scrollTo(next) {
        state.top = next;
      },
      getBoundingClientRect: () => ({
        top: state.top,
        bottom: state.top + EL_H,
        height: EL_H,
        left: 0,
        right: 100,
        width: 100,
      }),
    };
  };

  // Drains the frames queued right now; each drained frame may queue one more, which a later call picks up.
  const drainFrames = (n = 1) => {
    for (let i = 0; i < n; i += 1) {
      const cb = rafQueue.shift();
      if (!cb) return;
      cb();
    }
  };

  test('should_stop_the_frame_loop_once_progress_reaches_the_end', () => {
    const el = movableElement(WIN_H);
    const anim = fakeAnimation();
    observeScrollScrub(el, anim, {
      start: 'top center',
      end: 'bottom top',
      scrub: 'true',
      once: true,
    });

    // Scrolled past the end line, so progress is 1 and there is nothing left to drive.
    el.scrollTo(-(EL_H + 200));
    drainFrames(3);
    rafQueue.splice(0).forEach((cb) => cb());

    assert.equal(
      rafQueue.length,
      0,
      'a completed once-scrub must stop requesting frames',
    );
  });

  test('should_hold_the_final_state_when_the_user_scrolls_back_up', () => {
    const el = movableElement(WIN_H);
    const anim = fakeAnimation();
    observeScrollScrub(el, anim, {
      start: 'top center',
      end: 'bottom top',
      scrub: 'true',
      once: true,
    });

    el.scrollTo(-(EL_H + 200));
    drainFrames(3);
    assert.equal(anim.currentTime, 1000, 'should have reached the end first');

    // Back down the page: without the once guard the loop recomputes progress and rewinds.
    el.scrollTo(WIN_H);
    rafQueue.splice(0).forEach((cb) => cb());
    assert.equal(
      anim.currentTime,
      1000,
      'once should leave the animation at its finished state',
    );
  });

  test('should_keep_scrubbing_both_ways_when_once_is_off', () => {
    const el = movableElement(WIN_H);
    const anim = fakeAnimation();
    observeScrollScrub(el, anim, {
      start: 'top center',
      end: 'bottom top',
      scrub: 'true',
      once: false,
    });

    el.scrollTo(-(EL_H + 200));
    drainFrames(3);
    assert.equal(anim.currentTime, 1000);

    el.scrollTo(WIN_H);
    drainFrames(2);
    assert.ok(
      anim.currentTime < 1000,
      `without once the scrub must rewind, stayed at ${anim.currentTime}`,
    );
  });
});
