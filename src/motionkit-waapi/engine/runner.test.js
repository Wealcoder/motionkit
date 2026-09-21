// Covers the two lifecycle guarantees the free engine has to make: every Animation it starts is cancellable by teardown, and a scroll element is pinned to its opening keyframe before it is ever painted. Both were broken in ways that are invisible in a unit test of the compiler — the animations still played, they just never stopped, and the page flashed on the way down.

// jsdom implements no Web Animations API, so Element.prototype.animate is stubbed. That is what makes the counting possible: the stub records every animation the engine creates and whether it was cancelled.

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

let dom;
let created;
let observed;
let runWaapiAnimation;
let teardownWaapi;

function installDom() {
  dom = new JSDOM('<!doctype html><html><body></body></html>', {
    pretendToBeVisual: true,
  });
  created = [];

  dom.window.Element.prototype.animate = function (keyframes, options) {
    const record = {
      element: this,
      keyframes,
      options,
      cancelled: false,
      paused: false,
      currentTime: 0,
      // Real animations report this, and the runner reads it to decide whether a previous gesture is still mid-flight. Without it on the stub the guard was never exercised at all.
      playState: 'running',
      effect: { getTiming: () => ({ duration: options?.duration ?? 0 }) },
      cancel() {
        this.cancelled = true;
        this.playState = 'idle';
      },
      finish() {
        this.playState = 'finished';
        this.onfinish?.();
      },
      pause() {
        this.paused = true;
      },
      onfinish: null,
    };
    created.push(record);
    return record;
  };

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;

  // A real stub rather than `undefined`: observeViewport treats a missing IntersectionObserver as "ancient browser" and fires onEnter immediately, which would mask the start-state hold this file exists to verify. Nothing here auto-fires, so the element stays out of view until a test says otherwise.
  observed = [];
  globalThis.IntersectionObserver = class {
    constructor(cb, options) {
      this.cb = cb;
      // Recorded so a test can read the rootMargin the runner derived from its start position.
      this.options = options;
    }
    observe(el) {
      observed.push({ el, cb: this.cb, observer: this, options: this.options });
    }
    unobserve() {}
    disconnect() {}
  };
  dom.window.IntersectionObserver = globalThis.IntersectionObserver;
  globalThis.requestAnimationFrame = (cb) => dom.window.setTimeout(cb, 0);
  globalThis.cancelAnimationFrame = (id) => dom.window.clearTimeout(id);
}

function teardownDom() {
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.IntersectionObserver;
  delete globalThis.requestAnimationFrame;
  delete globalThis.cancelAnimationFrame;
  dom?.window?.close();
}

// A minimal free animation record in the shape resolveAnimations produces.
function record(triggerType, selector = '.target') {
  return {
    id: 'a1',
    group: 'free_animation',
    engine: 'waapi',
    trigger: { type: triggerType, selector },
    timeline: {
      animations: [
        {
          itemClass: selector,
          method: 'from',
          devices: { desktop: { from: { opacity: 0, duration: 0.4 } } },
        },
      ],
    },
  };
}

describe('WAAPI runner lifecycle', () => {
  beforeEach(async () => {
    installDom();
    // Imported fresh per test so the runner's module-level registries start empty.
    const mod = await import(`./runner.js?t=${Date.now()}${Math.random()}`);
    runWaapiAnimation = mod.runWaapiAnimation;
    teardownWaapi = mod.teardownWaapi;
  });

  afterEach(() => {
    teardownDom();
  });

  test('should_cancel_a_page_load_animation_on_teardown', () => {
    document.body.innerHTML = '<div class="target"></div>';

    runWaapiAnimation(record('page_load'), document);
    assert.equal(created.length, 1);

    teardownWaapi();
    assert.equal(created[0].cancelled, true);
  });

  // Hover animations use fill:'forwards'. An untracked one survives teardown and stays pinned to its end state for the life of the page — the element simply never comes back.
  test('should_cancel_a_hover_animation_on_teardown', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(record('hover'), document);

    document
      .querySelector('.target')
      .dispatchEvent(new window.Event('mouseenter'));
    assert.ok(created.length > 0, 'hover should have started an animation');

    teardownWaapi();
    assert.ok(
      created.every((a) => a.cancelled),
      'every hover animation should be cancelled by teardown',
    );
  });

  test('should_cancel_a_click_animation_on_teardown', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(record('click'), document);

    document.querySelector('.target').dispatchEvent(new window.Event('click'));
    assert.ok(created.length > 0, 'click should have started an animation');

    teardownWaapi();
    assert.ok(
      created.every((a) => a.cancelled),
      'every click animation should be cancelled by teardown',
    );
  });

  test('should_detach_hover_listeners_on_teardown', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(record('hover'), document);
    teardownWaapi();

    const before = created.length;
    document
      .querySelector('.target')
      .dispatchEvent(new window.Event('mouseenter'));

    assert.equal(
      created.length,
      before,
      'a torn-down hover must not still respond to the pointer',
    );
  });

  // Without a start-state hold the element renders in its natural state until the observer fires, so a Fade In is fully visible on the way down the page and then snaps to opacity 0.
  test('should_hold_a_scroll_element_at_its_opening_keyframe_before_it_enters_view', () => {
    document.body.innerHTML = '<div class="target"></div>';

    runWaapiAnimation(record('on_scroll'), document);

    assert.equal(
      created.length,
      1,
      'the start state should be applied at once',
    );
    const holder = created[0];
    assert.equal(holder.paused, true, 'the holder must not play on its own');
    assert.equal(
      holder.keyframes[0].opacity,
      0,
      'the holder should pin the opening keyframe',
    );
    assert.equal(holder.options.fill, 'both');
  });

  test('should_swap_the_hold_for_the_real_animation_when_the_element_enters_view', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(record('on_scroll'), document);

    const holder = created[0];
    // Drive the observer the way the browser would when the element scrolls in.
    observed[0].cb([{ isIntersecting: true, target: observed[0].el }]);

    assert.equal(holder.cancelled, true, 'the hold should be released');
    assert.equal(created.length, 2, 'the real animation should now be running');
    assert.equal(created[1].paused, false);
  });

  test('should_release_the_scroll_hold_on_teardown', () => {
    document.body.innerHTML = '<div class="target"></div>';

    runWaapiAnimation(record('on_scroll'), document);
    teardownWaapi();

    assert.ok(
      created.every((a) => a.cancelled),
      'the start-state hold must not outlive teardown',
    );
  });

  test('should_ignore_a_record_disabled_for_the_current_device', () => {
    document.body.innerHTML = '<div class="target"></div>';

    const anim = record('page_load');
    // jsdom reports a 1024px viewport, which the runner buckets as tab_land.
    anim.responsive = { tab_land: false };
    runWaapiAnimation(anim, document);

    assert.equal(created.length, 0);
  });

  test('should_do_nothing_when_the_selector_matches_no_element', () => {
    document.body.innerHTML = '<div class="other"></div>';

    runWaapiAnimation(record('page_load'), document);

    assert.equal(created.length, 0);
  });
});

// Split text retargets an effect from the matched elements onto the spans it generates, so the parts become the animated units the stagger walks over. The risks are that the generated markup outlives the engine, and that click/hover binds its listener to a single character instead of the whole element.
describe('WAAPI runner split text', () => {
  beforeEach(async () => {
    installDom();
    const mod = await import(`./runner.js?t=${Date.now()}${Math.random()}`);
    runWaapiAnimation = mod.runWaapiAnimation;
    teardownWaapi = mod.teardownWaapi;
  });

  afterEach(() => {
    teardownDom();
  });

  const splitRecord = (triggerType, splitKind) => {
    const r = record(triggerType);
    r.timeline.animations[0].splitText = splitKind;
    return r;
  };

  test('should_animate_one_part_per_character_when_split_by_chars', () => {
    document.body.innerHTML = '<div class="target">abc</div>';
    runWaapiAnimation(splitRecord('page_load', 'chars'), document);
    assert.equal(created.length, 3);
  });

  test('should_animate_one_part_per_word_when_split_by_words', () => {
    document.body.innerHTML = '<div class="target">one two</div>';
    runWaapiAnimation(splitRecord('page_load', 'words'), document);
    assert.equal(created.length, 2);
  });

  test('should_animate_the_element_itself_when_split_is_not_set', () => {
    document.body.innerHTML = '<div class="target">abc</div>';
    runWaapiAnimation(record('page_load'), document);
    assert.equal(created.length, 1);
  });

  // Teardown has to restore the markup, or the generated spans survive the engine and a later run re-splits already-split text.
  test('should_restore_the_original_markup_on_teardown', () => {
    document.body.innerHTML = '<div class="target">abc</div>';
    const el = document.querySelector('.target');
    const before = el.innerHTML;

    runWaapiAnimation(splitRecord('page_load', 'chars'), document);
    assert.notEqual(
      el.innerHTML,
      before,
      'split should have rewritten the DOM',
    );

    teardownWaapi();
    assert.equal(el.innerHTML, before);
  });

  // Without an explicit trigger selector the trigger falls back to the animated elements — which, once split, are individual characters. Hovering one letter would then animate only that letter, so the fallback has to stay the matched elements rather than the parts.
  test('should_bind_hover_to_the_whole_element_not_to_each_character', () => {
    document.body.innerHTML = '<div class="target">abc</div>';
    const r = splitRecord('hover', 'chars');
    delete r.trigger.selector;
    runWaapiAnimation(r, document);

    document
      .querySelector('.target')
      .dispatchEvent(new window.Event('mouseenter'));

    assert.equal(
      created.length,
      3,
      'one hover on the element should animate every part',
    );
  });
});

// On a live page a scroll animation must wait for the viewport. Inside the editor it must not: DevTools owns playback there, and the element being animated is usually already on screen, so an IntersectionObserver that has already fired never fires again and Play does nothing at all. The GSAP engine solves this with isEditorPreviewMode(); the free engine needs the same seam.
describe('WAAPI runner editor preview mode', () => {
  beforeEach(async () => {
    installDom();
    const mod = await import(`./runner.js?t=${Date.now()}${Math.random()}`);
    runWaapiAnimation = mod.runWaapiAnimation;
    teardownWaapi = mod.teardownWaapi;
  });

  afterEach(() => {
    delete globalThis.window.__motionkitDevToolsLoaded;
    teardownDom();
  });

  // Seeded for every device: jsdom's innerWidth 1024 resolves to 'tab_land', so a desktop-only bag is never read.
  const scrollRecord = () => {
    const r = record('on_scroll');
    const cfg = { start: 'top 80%', once: true, scrub: 'false' };
    r.trigger.scrollTrigger = [
      {
        id: 'st1',
        devices: {
          desktop: cfg,
          laptop: cfg,
          tab_land: cfg,
          tab: cfg,
          mobile: cfg,
        },
      },
    ];
    return r;
  };

  test('should_wait_for_the_viewport_on_a_live_page', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(scrollRecord(), document);

    // Only the start-state hold, not the real animation.
    assert.equal(observed.length, 1, 'element should be observed');
    assert.ok(
      created.every((a) => a.options?.duration === 1),
      'nothing but the hold should have started',
    );
  });

  test('should_play_immediately_in_editor_preview_mode', () => {
    globalThis.window.__motionkitDevToolsLoaded = true;
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(scrollRecord(), document);

    const real = created.filter((a) => a.options?.duration !== 1);
    assert.ok(
      real.length > 0,
      'editor preview should start the animation without waiting for scroll',
    );
  });

  test('should_still_be_cancellable_by_teardown_in_editor_preview_mode', () => {
    globalThis.window.__motionkitDevToolsLoaded = true;
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(scrollRecord(), document);

    teardownWaapi();
    assert.ok(
      created.every((a) => a.cancelled),
      'every animation should be cancelled',
    );
  });
});

// Scrub ties progress to scroll position and leaves the animation paused at 0. In the editor nothing scrolls the preview on the user's behalf, so a scrubbed animation would sit frozen at its first frame with Play doing nothing.
describe('WAAPI runner editor preview mode with scrub', () => {
  beforeEach(async () => {
    installDom();
    const mod = await import(`./runner.js?t=${Date.now()}${Math.random()}`);
    runWaapiAnimation = mod.runWaapiAnimation;
    teardownWaapi = mod.teardownWaapi;
  });

  afterEach(() => {
    delete globalThis.window.__motionkitDevToolsLoaded;
    teardownDom();
  });

  // jsdom reports innerWidth 1024, which getCurrentDevice maps to 'tab_land' — seeding only `desktop` left devSt falling back to the bare entry, so scrub read undefined and these tests passed without ever entering the scrub branch.
  const scrubRecord = () => {
    const r = record('on_scroll');
    const cfg = { start: 'top 80%', once: true, scrub: 'true' };
    r.trigger.scrollTrigger = [
      {
        id: 'st1',
        devices: {
          desktop: cfg,
          laptop: cfg,
          tab_land: cfg,
          tab: cfg,
          mobile: cfg,
        },
      },
    ];
    return r;
  };

  test('should_leave_a_scrubbed_animation_paused_on_a_live_page', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(scrubRecord(), document);
    assert.ok(
      created.some((a) => a.paused),
      'scrub should pause the animation for scroll to drive',
    );
  });

  test('should_play_a_scrubbed_animation_in_editor_preview_mode', () => {
    globalThis.window.__motionkitDevToolsLoaded = true;
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(scrubRecord(), document);
    // EVERY animation, not merely one of them: a stray unpaused hold would satisfy `some` while the scrubbed animation itself stayed frozen.
    assert.ok(created.length > 0, 'something should have been created');
    assert.ok(
      created.every((a) => !a.paused),
      'editor preview should run a scrubbed animation rather than freeze it',
    );
  });
});

// A scroll trigger can name its own element ("start when THAT enters the viewport, animate THIS"). With no trigger class the animated element is its own trigger, which is what a user gets by default and expects to just work.
describe('WAAPI runner scroll trigger element', () => {
  beforeEach(async () => {
    installDom();
    const mod = await import(`./runner.js?t=${Date.now()}${Math.random()}`);
    runWaapiAnimation = mod.runWaapiAnimation;
    teardownWaapi = mod.teardownWaapi;
  });

  afterEach(() => {
    teardownDom();
  });

  const scrollRecord = (triggerSelector) => {
    const r = record('on_scroll');
    const cfg = {
      trigger: triggerSelector,
      start: 'top center',
      end: 'bottom top',
      once: true,
      scrub: 'false',
    };
    r.trigger.scrollTrigger = [
      {
        id: 'st1',
        devices: {
          desktop: cfg,
          laptop: cfg,
          tab_land: cfg,
          tab: cfg,
          mobile: cfg,
        },
      },
    ];
    return r;
  };

  test('should_observe_the_animated_element_when_no_trigger_class_is_set', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(scrollRecord(''), document);
    assert.equal(observed.length, 1);
    assert.ok(
      observed[0].el.classList.contains('target'),
      'the animated element should be its own trigger',
    );
  });

  // Ignoring a filled-in trigger class means the animation starts on the wrong element's position, with nothing in the UI to say so.
  test('should_observe_the_trigger_element_when_one_is_set', () => {
    document.body.innerHTML =
      '<div class="starter"></div><div class="target"></div>';
    runWaapiAnimation(scrollRecord('.starter'), document);
    assert.equal(observed.length, 1);
    assert.ok(
      observed[0].el.classList.contains('starter'),
      'the named trigger element should be observed, not the animated one',
    );
  });

  test('should_fall_back_to_the_animated_element_when_the_trigger_matches_nothing', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(scrollRecord('.does-not-exist'), document);
    assert.equal(observed.length, 1);
    assert.ok(observed[0].el.classList.contains('target'));
  });
});

/* Deleting an animation in the editor pushes the remaining list, and the push fires the engine's global reset first — so teardownWaapi is what has to put the page back. It cannot cancel an Animation it is no longer holding.

   playWaapiAnimation's onfinish drops the animation from runningAnimations the moment it completes, and every free animation compiles with fill 'both' or 'forwards'. A second after Play the animation has finished, teardown holds nothing, and the element keeps painting the end state of an animation the user just deleted. */
describe('WAAPI runner teardown after an animation has finished', () => {
  beforeEach(async () => {
    installDom();
    const mod = await import(`./runner.js?t=${Date.now()}${Math.random()}`);
    runWaapiAnimation = mod.runWaapiAnimation;
    teardownWaapi = mod.teardownWaapi;
  });

  afterEach(() => {
    teardownDom();
  });

  test('should_cancel_a_finished_page_load_animation_on_teardown', () => {
    document.body.innerHTML = '<div class="target"></div>';

    runWaapiAnimation(record('page_load'), document);
    assert.equal(created.length, 1);

    // What happens a fraction of a second after Play: the tween completes and the browser calls onfinish.
    created[0].onfinish?.();

    teardownWaapi();
    assert.equal(
      created[0].cancelled,
      true,
      'a finished animation survived teardown and keeps painting the deleted effect',
    );
  });
});

/* A free preset is an ENTRANCE — it brings an element in. Playing it backwards therefore ends on the opening keyframe, which for a fade is opacity 0: the element vanished when the pointer left, and a second click hid it.

   Hover and click now play forwards only. Leaving re-arms the gesture instead of reversing it, so the next hover can play it again, and the element keeps whatever state the animation finished in. */
describe('WAAPI runner hover and click stay visible', () => {
  beforeEach(async () => {
    installDom();
    const mod = await import(`./runner.js?t=${Date.now()}${Math.random()}`);
    runWaapiAnimation = mod.runWaapiAnimation;
    teardownWaapi = mod.teardownWaapi;
  });

  afterEach(() => {
    teardownDom();
  });

  // A reversed tween ends on the entrance's FIRST keyframe. Detecting it by comparing the last frame is what makes this independent of how the reversal is implemented.
  const endsOnOpeningState = (anim) => {
    const kf = anim.keyframes;
    if (!Array.isArray(kf) || kf.length < 2) return false;
    return (
      JSON.stringify(kf[kf.length - 1]) ===
      JSON.stringify(created[0].keyframes[0])
    );
  };

  test('should_not_reverse_a_hover_animation_when_the_pointer_leaves', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(record('hover'), document);

    const el = document.querySelector('.target');
    el.dispatchEvent(new window.Event('mouseenter'));
    const afterEnter = created.length;
    assert.ok(afterEnter > 0, 'hover should have started an animation');

    el.dispatchEvent(new window.Event('mouseleave'));

    const added = created.slice(afterEnter);
    assert.ok(
      !added.some(endsOnOpeningState),
      'leaving played the entrance backwards, so the element hides',
    );
  });

  // Cancelling the played animation would drop its fill and snap the element back to its natural state, which is the same disappearance by another route.
  test('should_not_cancel_the_played_animation_when_the_pointer_leaves', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(record('hover'), document);

    const el = document.querySelector('.target');
    el.dispatchEvent(new window.Event('mouseenter'));
    const played = created[0];

    el.dispatchEvent(new window.Event('mouseleave'));
    assert.equal(
      played.cancelled,
      false,
      'leaving cancelled the entrance, so the element snaps back',
    );
  });

  // Re-arming is the point: the gesture has to stay usable, just never played backwards.
  test('should_play_again_on_a_second_hover', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(record('hover'), document);

    const el = document.querySelector('.target');
    el.dispatchEvent(new window.Event('mouseenter'));
    el.dispatchEvent(new window.Event('mouseleave'));
    const before = created.length;
    el.dispatchEvent(new window.Event('mouseenter'));

    assert.ok(
      created.length > before,
      'a second hover should replay the animation',
    );
  });

  test('should_not_reverse_on_a_second_click', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(record('click'), document);

    const el = document.querySelector('.target');
    el.dispatchEvent(new window.Event('click'));
    const afterFirst = created.length;
    el.dispatchEvent(new window.Event('click'));

    const added = created.slice(afterFirst);
    assert.ok(added.length > 0, 'a second click should replay the animation');
    assert.ok(
      !added.some(endsOnOpeningState),
      'the second click played the entrance backwards, so the element hides',
    );
  });
});

/* The guard that decides whether a previous gesture is cancelled. A batch still in flight has to go, or two animations fight over the same element; a finished one must be left alone, because cancelling it drops its fill and the element snaps back to its natural state — the same disappearance the reversal used to cause. */
describe('WAAPI runner gesture restart', () => {
  beforeEach(async () => {
    installDom();
    const mod = await import(`./runner.js?t=${Date.now()}${Math.random()}`);
    runWaapiAnimation = mod.runWaapiAnimation;
    teardownWaapi = mod.teardownWaapi;
  });

  afterEach(() => {
    teardownDom();
  });

  test('should_cancel_a_still_running_hover_when_it_is_re_triggered', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(record('hover'), document);

    const el = document.querySelector('.target');
    el.dispatchEvent(new window.Event('mouseenter'));
    const first = created[0];
    assert.equal(first.playState, 'running');

    el.dispatchEvent(new window.Event('mouseenter'));
    assert.equal(
      first.cancelled,
      true,
      'a mid-flight animation must be cancelled before restarting',
    );
  });

  test('should_leave_a_finished_hover_alone_when_it_is_re_triggered', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(record('hover'), document);

    const el = document.querySelector('.target');
    el.dispatchEvent(new window.Event('mouseenter'));
    const first = created[0];
    first.finish();

    el.dispatchEvent(new window.Event('mouseenter'));
    assert.equal(
      first.cancelled,
      false,
      'cancelling a finished animation drops its fill and the element snaps back',
    );
  });
});

/* A style preset is not an entrance: it changes colour, border or spacing on hover and the user expects that change to come BACK when the pointer leaves. An entrance must not, which is what the tests above pin down — so the two behaviours cannot both be the default, and the record opts in with reverseOnLeave. */
describe('WAAPI runner reverseOnLeave', () => {
  beforeEach(async () => {
    installDom();
    const mod = await import(`./runner.js?t=${Date.now()}${Math.random()}`);
    runWaapiAnimation = mod.runWaapiAnimation;
    teardownWaapi = mod.teardownWaapi;
  });

  afterEach(() => {
    teardownDom();
  });

  // A hover STYLE record: 'to' method, so the opening keyframe is the element's resting look and playing back to it is exactly the revert we want.
  function styleRecord({ reverseOnLeave = true, triggerType = 'hover' } = {}) {
    return {
      id: 'a1',
      group: 'free_animation',
      engine: 'waapi',
      trigger: { type: triggerType, selector: '.target' },
      timeline: {
        animations: [
          {
            itemClass: '.target',
            method: 'to',
            reverseOnLeave,
            devices: {
              desktop: { to: { color: 'rgb(255,0,0)', duration: 0.3 } },
            },
          },
        ],
      },
    };
  }

  test('should_play_back_to_the_resting_state_when_the_pointer_leaves', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(styleRecord(), document);

    const el = document.querySelector('.target');
    el.dispatchEvent(new window.Event('mouseenter'));
    const afterEnter = created.length;

    el.dispatchEvent(new window.Event('mouseleave'));

    assert.ok(
      created.length > afterEnter,
      'leaving started no animation, so the hover style never reverts',
    );
  });

  // The revert has to END on the resting look. Comparing the last frame keeps this independent of whether the engine reverses the keyframes or calls reverse() on the Animation.
  test('should_end_the_leave_animation_on_the_opening_keyframe', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(styleRecord(), document);

    const el = document.querySelector('.target');
    el.dispatchEvent(new window.Event('mouseenter'));
    const opening = created[0].keyframes[0];
    const afterEnter = created.length;

    el.dispatchEvent(new window.Event('mouseleave'));
    const leaveAnim = created[afterEnter];

    assert.deepEqual(
      leaveAnim.keyframes[leaveAnim.keyframes.length - 1],
      opening,
      'the leave animation does not land on the resting state',
    );
  });

  // The guard that protects the entrance fix: without the flag nothing may happen on leave.
  test('should_not_reverse_when_the_flag_is_absent', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(styleRecord({ reverseOnLeave: false }), document);

    const el = document.querySelector('.target');
    el.dispatchEvent(new window.Event('mouseenter'));
    const afterEnter = created.length;

    el.dispatchEvent(new window.Event('mouseleave'));

    assert.equal(
      created.length,
      afterEnter,
      'leaving animated despite reverseOnLeave being off',
    );
  });

  // An entrance record carries no flag at all, so the default must stay "hold the end state".
  test('should_leave_an_ordinary_entrance_untouched', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(record('hover'), document);

    const el = document.querySelector('.target');
    el.dispatchEvent(new window.Event('mouseenter'));
    const afterEnter = created.length;

    el.dispatchEvent(new window.Event('mouseleave'));

    assert.equal(created.length, afterEnter, 'the entrance fix regressed');
  });

  // Re-entering mid-revert must not leave the revert running underneath the new hover.
  test('should_cancel_a_running_revert_when_the_pointer_returns', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(styleRecord(), document);

    const el = document.querySelector('.target');
    el.dispatchEvent(new window.Event('mouseenter'));
    const afterEnter = created.length;
    el.dispatchEvent(new window.Event('mouseleave'));
    const revert = created[afterEnter];

    el.dispatchEvent(new window.Event('mouseenter'));

    assert.equal(revert.cancelled, true, 'the revert kept running');
  });
});

/* The revert has to LOOK like a revert. Two things broke that, both from handing the leave animation the forward run's options unchanged. */
describe('WAAPI runner revert is smooth', () => {
  beforeEach(async () => {
    installDom();
    const mod = await import(`./runner.js?t=${Date.now()}${Math.random()}`);
    runWaapiAnimation = mod.runWaapiAnimation;
    teardownWaapi = mod.teardownWaapi;
  });

  afterEach(() => {
    teardownDom();
  });

  const styleRecord = (extra = {}) => ({
    id: 'a1',
    group: 'free_animation',
    engine: 'waapi',
    trigger: { type: 'hover', selector: '.target' },
    timeline: {
      animations: [
        {
          itemClass: '.target',
          method: 'to',
          reverseOnLeave: true,
          devices: {
            desktop: {
              to: { color: 'rgb(255,0,0)', duration: 0.4, ...extra },
            },
          },
        },
      ],
    },
  });

  // A delay on the way in is deliberate pacing; the same delay on the way out is just the element sitting there looking stuck before it finally snaps back.
  test('should_not_reuse_the_forward_delay_on_the_revert', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(styleRecord({ delay: 0.4 }), document);

    const el = document.querySelector('.target');
    el.dispatchEvent(new window.Event('mouseenter'));
    const afterEnter = created.length;

    el.dispatchEvent(new window.Event('mouseleave'));
    const revert = created[afterEnter];

    assert.equal(revert.options.delay, 0, 'the revert waits before starting');
  });

  /* Leaving mid-hover must continue from where the forward run got to, not restart from its end. Cancelling the forward animation drops its fill, so the element paints its full hover state for one frame before the revert takes over — a flash of exactly the colour the user is moving away from. */
  test('should_start_the_revert_from_the_current_progress', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(styleRecord(), document);

    const el = document.querySelector('.target');
    el.dispatchEvent(new window.Event('mouseenter'));
    const forward = created[0];
    const afterEnter = created.length;

    // Half way through the 400ms entrance.
    forward.currentTime = 200;
    el.dispatchEvent(new window.Event('mouseleave'));
    const revert = created[afterEnter];

    assert.ok(
      revert.currentTime > 0,
      'the revert starts from zero, so the element jumps to its full hover state first',
    );
  });

  // Reverting from half way should take half the time, or the element crawls back from a position it never reached.
  test('should_shorten_the_revert_to_the_progress_actually_made', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(styleRecord(), document);

    const el = document.querySelector('.target');
    el.dispatchEvent(new window.Event('mouseenter'));
    const forward = created[0];
    const afterEnter = created.length;

    forward.currentTime = 100;
    el.dispatchEvent(new window.Event('mouseleave'));
    const revert = created[afterEnter];

    assert.ok(
      revert.currentTime >= 290,
      'the revert replays ground the forward run never covered',
    );
  });

  /* The forward run has to GO, finished or not. It holds fill:'forwards', so a finished one keeps painting the hover state; being the later animation in the cascade it wins over the revert underneath, and the element sat at full hover colour until the revert ended and then snapped. On leave the forward run is always cancelled — unlike on re-enter, where a finished one is left alone precisely so it keeps holding that fill. */
  test('should_cancel_a_finished_forward_run_when_the_pointer_leaves', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(styleRecord(), document);

    const el = document.querySelector('.target');
    el.dispatchEvent(new window.Event('mouseenter'));
    const forward = created[0];
    forward.finish();

    el.dispatchEvent(new window.Event('mouseleave'));

    assert.equal(
      forward.cancelled,
      true,
      'the finished entrance keeps painting over the revert',
    );
  });
});

/* Scrub is a choice the user makes with the Scrub control. customScrub is the value that control falls back on when it IS set to custom — it carries a default of 0.5 so the field is never blank, which meant "the user has a custom scrub value" was true on every free preset ever built. Every scroll animation therefore took the scrub path: created paused, driven by scroll position, and left frozen on its opening frame for anyone who did not scroll past it at the right speed. */
describe('WAAPI runner scroll trigger honours the scrub choice', () => {
  beforeEach(async () => {
    installDom();
    const mod = await import(`./runner.js?t=${Date.now()}${Math.random()}`);
    runWaapiAnimation = mod.runWaapiAnimation;
    teardownWaapi = mod.teardownWaapi;
  });

  afterEach(() => {
    teardownDom();
  });

  /* Seeded on every device, not just desktop: jsdom reports innerWidth 1024, which the runner maps to 'tab_land', so a desktop-only bag never resolves and devSt silently falls back to the outer object — the scrub value under test would not be read at all. */
  const allDevices = (bag) =>
    ['desktop', 'laptop', 'tab_land', 'tab', 'mobile'].reduce(
      (acc, d) => ({ ...acc, [d]: bag }),
      {},
    );

  const scrollRecord = (devSt) => ({
    id: 'a1',
    group: 'free_animation',
    engine: 'waapi',
    trigger: {
      type: 'on_scroll',
      selector: '.target',
      scrollTrigger: [{ devices: allDevices(devSt) }],
    },
    timeline: {
      animations: [
        {
          itemClass: '.target',
          method: 'from',
          devices: allDevices({ from: { opacity: 0, duration: 0.4 } }),
        },
      ],
    },
  });

  // The shape every free preset seeds: scrub off, customScrub carrying its default.
  test('should_not_scrub_when_the_control_says_false', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(
      scrollRecord({
        start: 'top center',
        end: 'bottom top',
        once: true,
        scrub: 'false',
        customScrub: 0.5,
      }),
      document,
    );

    /* The scrub path creates the real animation paused, carrying the effect's own 400ms. The viewport path also creates a paused animation — hold()'s duration-1 placeholder that pins the opening frame — so "paused" alone cannot tell them apart; the duration is what does. */
    const scrubbed = created.filter(
      (a) => a.paused && a.options?.duration === 400,
    );
    assert.equal(scrubbed.length, 0, 'the scrub path ran with scrub off');
  });

  test('should_still_scrub_when_the_control_says_true', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(
      scrollRecord({
        start: 'top center',
        end: 'bottom top',
        once: true,
        scrub: 'true',
        customScrub: 0.5,
      }),
      document,
    );

    const scrubbed = created.filter(
      (a) => a.paused && a.options?.duration === 400,
    );
    assert.ok(scrubbed.length > 0, 'the scrub control no longer scrubs');
  });

  // 'custom' is what makes customScrub meaningful, and only then.
  test('should_scrub_when_the_control_says_custom', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(
      scrollRecord({
        start: 'top center',
        end: 'bottom top',
        once: true,
        scrub: 'custom',
        customScrub: 0.5,
      }),
      document,
    );

    const scrubbed = created.filter(
      (a) => a.paused && a.options?.duration === 400,
    );
    assert.ok(scrubbed.length > 0, 'a custom scrub value no longer scrubs');
  });
});

/* An element clipped to nothing is invisible to IntersectionObserver — clip-path removes it from the intersection geometry, so the observer that exists to reveal it never fires and the element stays clipped for the life of the page. Verified in Chromium: a clip-path-held element reports isIntersecting false forever, while an opacity-held one reports true on scroll.

   So the opening state is held for everything EXCEPT clip-path, whose presets accept one frame of un-clipped paint rather than never animating at all. */
describe('WAAPI runner does not clip an element out of its own observer', () => {
  beforeEach(async () => {
    installDom();
    const mod = await import(`./runner.js?t=${Date.now()}${Math.random()}`);
    runWaapiAnimation = mod.runWaapiAnimation;
    teardownWaapi = mod.teardownWaapi;
  });

  afterEach(() => {
    teardownDom();
  });

  const scrollRecord = (from) => ({
    id: 'a1',
    group: 'free_animation',
    engine: 'waapi',
    trigger: {
      type: 'on_scroll',
      selector: '.target',
      scrollTrigger: [
        {
          devices: ['desktop', 'laptop', 'tab_land', 'tab', 'mobile'].reduce(
            (acc, d) => ({
              ...acc,
              [d]: { start: 'top center', once: true, scrub: 'false' },
            }),
            {},
          ),
        },
      ],
    },
    timeline: {
      animations: [
        {
          itemClass: '.target',
          method: 'from',
          devices: ['desktop', 'laptop', 'tab_land', 'tab', 'mobile'].reduce(
            (acc, d) => ({ ...acc, [d]: { from: { ...from, duration: 0.6 } } }),
            {},
          ),
        },
      ],
    },
  });

  // hold() creates a paused duration-1 animation. For a wipe that placeholder is the thing that breaks it.
  const holders = () => created.filter((a) => a.options?.duration === 1);

  test('should_not_hold_a_clip_path_opening_state', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(
      scrollRecord({ clipPath: 'inset(0 100% 0 0)' }),
      document,
    );

    assert.equal(
      holders().length,
      0,
      'the element is clipped away before the observer can see it',
    );
  });

  // Everything else still gets its start state pinned, or a fade is fully visible on the way down the page and then snaps to opacity 0.
  test('should_still_hold_an_opacity_opening_state', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(scrollRecord({ opacity: 0 }), document);

    assert.equal(holders().length, 1, 'the fade lost its start state');
  });

  // A preset that animates both still must not be clipped out of view; the rest of its opening state goes unheld with it.
  test('should_not_hold_when_clip_path_is_combined_with_opacity', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(
      scrollRecord({ clipPath: 'inset(0 0 100% 0)', opacity: 0 }),
      document,
    );

    assert.equal(holders().length, 0);
  });
});

/* Deleting an animation in the editor has to stop it playing on the page — `teardownWaapi()` is what every host (the WordPress wrapper, the editor's router-registered entry, the engine-only build) calls to make that true, whether it's reached via a DOM event listener or a direct call. The event-dispatch wiring itself is host-specific (wrapper.js and motionkit-editor's entry.js each own their own listener) and is not this module's concern — what belongs here is that calling `teardownWaapi()` actually cancels running animations and drops gesture listeners. */
describe('teardownWaapi cancels everything the engine is running', () => {
  beforeEach(async () => {
    installDom();
    const mod = await import(`./runner.js?t=${Date.now()}${Math.random()}`);
    runWaapiAnimation = mod.runWaapiAnimation;
    teardownWaapi = mod.teardownWaapi;
  });

  afterEach(() => {
    teardownDom();
  });

  test('should_cancel_running_animations_when_teardown_is_called', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(record('page_load'), document);
    const played = created[0];
    assert.ok(played, 'nothing was animated');

    teardownWaapi();

    assert.equal(played.cancelled, true, 'the animation kept its fill');
  });

  // The listeners are what make a deleted hover keep firing; cancelling the animation alone would not stop the next mouseenter.
  test('should_drop_gesture_listeners_when_teardown_is_called', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(record('hover'), document);

    const el = document.querySelector('.target');
    el.dispatchEvent(new window.Event('mouseenter'));
    const beforeReset = created.length;

    teardownWaapi();

    el.dispatchEvent(new window.Event('mouseenter'));
    assert.equal(
      created.length,
      beforeReset,
      'a deleted hover animation still runs',
    );
  });
});

// The editor identifies an animated element by the attributes the engine leaves on it: the inspector's markers, the preview context menu, the Structure list and the global reset sweep all read data-motionkit-anim-id, and copy/paste-one-effect reads the comma-separated data-motionkit-step-id beside it. The GSAP engine writes both (see motionkit-editor animationEngine/custom/helper/tagTargets.js) and is copied into this repo too, so the free engine has to write them in the same shape or every one of those features is blind to a free animation.
describe('WAAPI runner target tagging', () => {
  beforeEach(async () => {
    installDom();
    const mod = await import(`./runner.js?t=${Date.now()}${Math.random()}`);
    runWaapiAnimation = mod.runWaapiAnimation;
    teardownWaapi = mod.teardownWaapi;
  });

  afterEach(() => {
    teardownDom();
  });

  // Two effects over one selector, each with its own id, in the shape the editor mints at preset-select time.
  function tagRecord(steps, triggerType = 'page_load') {
    return {
      id: 'anim-7',
      group: 'free_animation',
      engine: 'waapi',
      trigger: { type: triggerType, selector: '.target' },
      timeline: { animations: steps },
    };
  }

  const step = (id, selector = '.target') => ({
    id,
    itemClass: selector,
    method: 'from',
    devices: { desktop: { from: { opacity: 0, duration: 0.4 } } },
  });

  test('should_tag_a_target_with_the_animation_id', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(tagRecord([step('s1')]), document);

    assert.equal(
      document.querySelector('.target').getAttribute('data-motionkit-anim-id'),
      'anim-7',
    );
  });

  test('should_tag_a_target_with_its_step_id', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(tagRecord([step('s1')]), document);

    assert.equal(
      document.querySelector('.target').getAttribute('data-motionkit-step-id'),
      's1',
    );
  });

  // One element can be the target of several effects, so the step list appends rather than overwrites — paste-one-effect reads the whole list.
  test('should_append_a_second_steps_id_to_the_same_element', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(tagRecord([step('s1'), step('s2')]), document);

    assert.equal(
      document.querySelector('.target').getAttribute('data-motionkit-step-id'),
      's1,s2',
    );
  });

  test('should_not_repeat_a_step_id_already_on_the_element', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(tagRecord([step('s1'), step('s1')]), document);

    assert.equal(
      document.querySelector('.target').getAttribute('data-motionkit-step-id'),
      's1',
    );
  });

  // The editor's global reset runs gsap.set(clearProps:'all') over every tagged element, which wipes the ENTIRE inline style attribute — author-set styles included — and then restores this snapshot. A tag without a snapshot means a reset silently deletes the author's own inline styles.
  test('should_snapshot_the_authors_inline_styles_before_animating', () => {
    document.body.innerHTML =
      '<div class="target" style="color: red;"></div>';
    runWaapiAnimation(tagRecord([step('s1')]), document);

    assert.equal(
      document.querySelector('.target').__wcfOrigCss,
      'color: red;',
    );
  });

  test('should_tag_a_scroll_target_before_it_enters_the_viewport', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(tagRecord([step('s1')], 'on_scroll'), document);

    assert.equal(
      document.querySelector('.target').getAttribute('data-motionkit-anim-id'),
      'anim-7',
    );
  });

  test('should_remove_its_own_tags_on_teardown', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(tagRecord([step('s1')]), document);

    teardownWaapi();

    const el = document.querySelector('.target');
    assert.equal(el.getAttribute('data-motionkit-anim-id'), null);
    assert.equal(el.getAttribute('data-motionkit-step-id'), null);
  });

  // Teardown is engine-wide and the GSAP engine marks the same elements with the same attributes, so this engine clears only the values it wrote.

  // The step list is per-effect, so another engine's ids survive being filtered out of it; the anim id is single-valued and last-writer-wins (the GSAP engine's own untagAllTargets has exactly this property), so a foreign id this run overwrote is not put back and the global reset sweep is what re-establishes the truth.
  test('should_only_clear_step_ids_it_wrote', () => {
    document.body.innerHTML = '<div class="target"></div>';
    const el = document.querySelector('.target');
    el.setAttribute('data-motionkit-step-id', 'gsap-step');

    runWaapiAnimation(tagRecord([step('s1')]), document);
    assert.equal(el.getAttribute('data-motionkit-step-id'), 'gsap-step,s1');

    teardownWaapi();

    assert.equal(el.getAttribute('data-motionkit-step-id'), 'gsap-step');
  });

  // An element this run never touched keeps its marks — teardown walks what this engine tagged, not the whole document.
  test('should_not_touch_an_element_it_never_tagged', () => {
    document.body.innerHTML =
      '<div class="target"></div><div class="other"></div>';
    const other = document.querySelector('.other');
    other.setAttribute('data-motionkit-anim-id', 'gsap-anim');

    runWaapiAnimation(tagRecord([step('s1')]), document);
    teardownWaapi();

    assert.equal(other.getAttribute('data-motionkit-anim-id'), 'gsap-anim');
  });

  // An effect the editor never minted an id for still animates, so the anim id has to land even when there is no step id to record.
  test('should_still_tag_the_animation_id_when_a_step_has_no_id', () => {
    document.body.innerHTML = '<div class="target"></div>';
    const steps = [step('s1')];
    delete steps[0].id;
    runWaapiAnimation(tagRecord(steps), document);

    const el = document.querySelector('.target');
    assert.equal(el.getAttribute('data-motionkit-anim-id'), 'anim-7');
    assert.equal(el.getAttribute('data-motionkit-step-id'), null);
  });
});

// Start and End can be set to 'custom', with the typed position kept in customStart / customEnd — the same shape Scrub already uses. The engine used to read `start` alone, so a custom position arrived at the parser as the word 'custom' and silently fell back to the default.
describe('WAAPI runner custom scroll positions', () => {
  let resolveScrollPosition;

  beforeEach(async () => {
    installDom();
    const mod = await import(`./runner.js?t=${Date.now()}${Math.random()}`);
    runWaapiAnimation = mod.runWaapiAnimation;
    teardownWaapi = mod.teardownWaapi;
    resolveScrollPosition = mod.resolveScrollPosition;
  });

  afterEach(() => {
    teardownDom();
  });

  // Seeded for every bucket: the runner reads the bucket the current window width falls into, and jsdom's 1024px window is 'tab_land', not 'desktop'.
  const everyDevice = (values) =>
    ['desktop', 'laptop', 'tab_land', 'tab', 'mobile'].reduce(
      (acc, d) => ({ ...acc, [d]: { ...values } }),
      {},
    );

  function scrollRecord(devices) {
    return {
      id: 'anim-9',
      group: 'free_animation',
      engine: 'waapi',
      trigger: {
        type: 'on_scroll',
        selector: '.target',
        scrollTrigger: [{ id: 'st1', devices: everyDevice(devices) }],
      },
      timeline: {
        animations: [
          {
            id: 's1',
            itemClass: '.target',
            method: 'from',
            devices: { desktop: { from: { opacity: 0, duration: 0.4 } } },
          },
        ],
      },
    };
  }

  test('should_pass_a_named_position_straight_through', () => {
    assert.equal(resolveScrollPosition('top center', ''), 'top center');
  });

  test('should_swap_in_the_custom_value_when_the_select_says_custom', () => {
    assert.equal(resolveScrollPosition('custom', 'top 25%'), 'top 25%');
  });

  test('should_trim_the_custom_value', () => {
    assert.equal(resolveScrollPosition('custom', '  top 25%  '), 'top 25%');
  });

  // Empty rather than 'custom', so the caller's own default takes over instead of the parser being handed a word it cannot read.
  test('should_resolve_a_blank_custom_value_to_nothing', () => {
    assert.equal(resolveScrollPosition('custom', ''), '');
    assert.equal(resolveScrollPosition('custom', undefined), '');
  });

  test('should_observe_with_the_custom_start_rather_than_the_default', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(
      scrollRecord({ start: 'custom', customStart: 'top 25%', scrub: 'false' }),
      document,
    );
    const withCustom = observed.at(-1)?.options?.rootMargin;

    teardownWaapi();
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(
      scrollRecord({ start: 'top 25%', scrub: 'false' }),
      document,
    );
    const withNamed = observed.at(-1)?.options?.rootMargin;

    teardownWaapi();
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(scrollRecord({ scrub: 'false' }), document);
    const withDefault = observed.at(-1)?.options?.rootMargin;

    assert.ok(withCustom, 'nothing was observed for the custom start');
    assert.equal(withCustom, withNamed, 'custom start did not reach the observer');
    assert.notEqual(withCustom, withDefault, 'custom start matched the default');
  });

  test('should_fall_back_to_the_default_start_when_the_custom_value_is_blank', () => {
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(
      scrollRecord({ start: 'custom', customStart: '', scrub: 'false' }),
      document,
    );
    const blankCustom = observed.at(-1)?.options?.rootMargin;

    teardownWaapi();
    document.body.innerHTML = '<div class="target"></div>';
    runWaapiAnimation(scrollRecord({ scrub: 'false' }), document);
    const defaulted = observed.at(-1)?.options?.rootMargin;

    assert.equal(blankCustom, defaulted);
  });
});
