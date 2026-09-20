// Covers the translation from the editor's GSAP-shaped effect records into native WAAPI keyframes. This is the whole contract between the authoring UI and the free engine: the editor writes GSAP vocabulary (power2.out, seconds, x/y/scale) and the browser only understands CSS, so every mistranslation here shows up as an animation that plays wrong rather than one that errors.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  compileTransformString,
  compileStateToKeyframe,
  compileEaseToCss,
  needsKeyframeEase,
  isKnownEase,
  compileEffectToWaapi,
} from './index.js';

// The editor's GSAP ease dropdown (src/configuration/presets/shared/presetDependencies.js's
// easeTypes) — duplicated here rather than imported, since that file is editor-owned UI
// config spanning every animation kind, not just WAAPI, and this repo has no path to it.
// Update this list if the dropdown's ease vocabulary changes.
const easeTypes = [
  { title: 'None', value: 'none' },
  { title: 'Power1.in', value: 'power1.in' },
  { title: 'Power1.out', value: 'power1.out' },
  { title: 'Power1.inOut', value: 'power1.inOut' },
  { title: 'Power2.in', value: 'power2.in' },
  { title: 'Power2.out', value: 'power2.out' },
  { title: 'Power2.inOut', value: 'power2.inOut' },
  { title: 'Power3.in', value: 'power3.in' },
  { title: 'Power3.out', value: 'power3.out' },
  { title: 'Power3.inOut', value: 'power3.inOut' },
  { title: 'Power4.in', value: 'power4.in' },
  { title: 'Power4.out', value: 'power4.out' },
  { title: 'Power4.inOut', value: 'power4.inOut' },
  { title: 'Back.in', value: 'back.in' },
  { title: 'Back.out', value: 'back.out' },
  { title: 'Back.inOut', value: 'back.inOut' },
  { title: 'Bounce.in', value: 'bounce.in' },
  { title: 'Bounce.out', value: 'bounce.out' },
  { title: 'Bounce.inOut', value: 'bounce.inOut' },
  { title: 'Circ.in', value: 'circ.in' },
  { title: 'Circ.out', value: 'circ.out' },
  { title: 'Circ.inOut', value: 'circ.inOut' },
  { title: 'Elastic.in', value: 'elastic.in' },
  { title: 'Elastic.out', value: 'elastic.out' },
  { title: 'Elastic.inOut', value: 'elastic.inOut' },
  { title: 'Expo.in', value: 'expo.in' },
  { title: 'Expo.out', value: 'expo.out' },
  { title: 'Expo.inOut', value: 'expo.inOut' },
  { title: 'Sine.in', value: 'sine.in' },
  { title: 'Sine.out', value: 'sine.out' },
  { title: 'Sine.inOut', value: 'sine.inOut' },
];

const effect = (from, extra = {}) => ({
  method: 'from',
  devices: { desktop: { from } },
  ...extra,
});

describe('compileTransformString', () => {
  test('should_return_none_for_an_empty_state', () => {
    assert.equal(compileTransformString({}), 'none');
  });

  // Identity values must not emit a transform — a stray translate3d(0,0,0) promotes every element to its own compositor layer.
  test('should_omit_identity_values', () => {
    assert.equal(
      compileTransformString({ x: 0, y: 0, scale: 1, rotate: 0 }),
      'none',
    );
  });

  test('should_emit_pixels_for_bare_numbers', () => {
    assert.equal(
      compileTransformString({ x: -20 }),
      'translate3d(-20px, 0px, 0px)',
    );
  });

  test('should_pass_through_a_string_unit_untouched', () => {
    assert.equal(
      compileTransformString({ x: '50%' }),
      'translate3d(50%, 0px, 0px)',
    );
  });

  test('should_emit_degrees_for_rotation', () => {
    assert.equal(compileTransformString({ rotate: 45 }), 'rotate(45deg)');
  });

  // Uniform scale wins over the axis pair, so a preset setting both does not emit two competing scales.
  test('should_prefer_uniform_scale_over_axis_scale', () => {
    assert.equal(
      compileTransformString({ scale: 0.5, scaleX: 2, scaleY: 2 }),
      'scale(0.5)',
    );
  });
});

describe('compileStateToKeyframe', () => {
  test('should_map_blur_onto_a_css_filter', () => {
    assert.equal(compileStateToKeyframe({ blur: 10 }).filter, 'blur(10px)');
  });

  test('should_keep_opacity_zero_rather_than_dropping_it_as_falsy', () => {
    assert.equal(compileStateToKeyframe({ opacity: 0 }).opacity, 0);
  });

  test('should_not_emit_a_transform_key_when_there_is_no_transform', () => {
    assert.equal('transform' in compileStateToKeyframe({ opacity: 0 }), false);
  });
});

describe('compileEaseToCss', () => {
  // The presets author eases in GSAP's camelCase (power1.inOut) while the lookup table is lowercase, so the match has to be case-insensitive or every inOut ease silently falls back.
  test('should_resolve_camelCase_gsap_ease_names', () => {
    assert.equal(
      compileEaseToCss('power1.inOut'),
      'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
    );
    assert.equal(
      compileEaseToCss('power2.inOut'),
      'cubic-bezier(0.77, 0, 0.175, 1)',
    );
  });

  test('should_resolve_a_plain_ease_name', () => {
    assert.equal(compileEaseToCss('linear'), 'linear');
  });

  test('should_fall_back_for_an_unknown_ease', () => {
    assert.equal(
      compileEaseToCss('rough.bounce.wobble'),
      compileEaseToCss('power2.out'),
    );
  });
});

describe('compileEffectToWaapi timing', () => {
  test('should_read_ordinary_gsap_seconds_as_seconds', () => {
    assert.equal(
      compileEffectToWaapi(effect({ opacity: 0, duration: 0.8 })).options
        .duration,
      800,
    );
  });

  test('should_read_a_large_value_as_milliseconds', () => {
    assert.equal(
      compileEffectToWaapi(effect({ opacity: 0, duration: 300 })).options
        .duration,
      300,
    );
  });

  // Guards the cliff at the seconds/ms threshold: 21 once compiled to 21ms, an invisible flicker, because it sat just past the boundary.
  test('should_not_compile_a_value_just_past_the_threshold_to_a_sub_frame_duration', () => {
    assert.equal(
      compileEffectToWaapi(effect({ opacity: 0, duration: 21 })).options
        .duration,
      21000,
    );
  });

  test('should_fall_back_to_the_default_for_a_missing_duration', () => {
    assert.equal(
      compileEffectToWaapi(effect({ opacity: 0 })).options.duration,
      800,
    );
  });

  test('should_fall_back_to_the_default_for_a_nonsense_duration', () => {
    assert.equal(
      compileEffectToWaapi(effect({ opacity: 0, duration: -5 })).options
        .duration,
      800,
    );
    assert.equal(
      compileEffectToWaapi(effect({ opacity: 0, duration: 'soon' })).options
        .duration,
      800,
    );
  });

  test('should_keep_an_explicit_zero_delay_at_zero', () => {
    assert.equal(
      compileEffectToWaapi(effect({ opacity: 0, delay: 0 })).options.delay,
      0,
    );
  });
});

describe('compileEffectToWaapi keyframes', () => {
  // 'from' means "start here, land at rest", so the closing keyframe must be the element's natural state.
  test('should_animate_a_from_effect_towards_the_neutral_state', () => {
    const { keyframes } = compileEffectToWaapi(effect({ opacity: 0, y: 40 }));

    assert.equal(keyframes[0].opacity, 0);
    assert.equal(keyframes[0].transform, 'translate3d(0px, 40px, 0px)');
    assert.deepEqual(keyframes[1], { transform: 'none', opacity: 1 });
  });

  test('should_reset_a_filter_on_the_way_out_of_a_from_effect', () => {
    const { keyframes } = compileEffectToWaapi(effect({ blur: 8 }));

    assert.equal(keyframes[0].filter, 'blur(8px)');
    assert.equal(keyframes[1].filter, 'none');
  });

  test('should_animate_a_to_effect_away_from_the_neutral_state', () => {
    const { keyframes } = compileEffectToWaapi({
      method: 'to',
      devices: { desktop: { to: { opacity: 0 } } },
    });

    assert.deepEqual(keyframes[0], { transform: 'none', opacity: 1 });
    assert.equal(keyframes[1].opacity, 0);
  });

  test('should_use_both_explicit_states_for_a_fromTo_effect', () => {
    const { keyframes } = compileEffectToWaapi({
      method: 'fromTo',
      devices: { desktop: { from: { opacity: 0.2 }, to: { opacity: 0.9 } } },
    });

    assert.equal(keyframes[0].opacity, 0.2);
    assert.equal(keyframes[1].opacity, 0.9);
  });

  // The editor dispatches through resolveAnimations, which flattens the device bag to `vars` and drops `devices`. Reading only `devices` here produced an empty opening keyframe, so a Fade In animated from nothing instead of from opacity 0.
  test('should_read_a_flattened_vars_bag_from_the_editor_path', () => {
    const { keyframes } = compileEffectToWaapi({
      method: 'from',
      vars: { from: { opacity: 0, y: 40 } },
    });

    assert.equal(keyframes[0].opacity, 0);
    assert.equal(keyframes[0].transform, 'translate3d(0px, 40px, 0px)');
  });

  // The WordPress plugin localizes the stored record as-is, so the same compiler has to read the raw per-device bag too.
  test('should_read_a_raw_devices_bag_from_the_plugin_path', () => {
    const { keyframes } = compileEffectToWaapi(
      effect({ opacity: 0, y: 40 }),
      'desktop',
    );

    assert.equal(keyframes[0].opacity, 0);
    assert.equal(keyframes[0].transform, 'translate3d(0px, 40px, 0px)');
  });

  // Per-device bags are the editor's responsive model; a device with no bag of its own inherits desktop rather than animating from nothing.
  test('should_fall_back_to_the_desktop_bag_for_an_unseeded_device', () => {
    const { keyframes } = compileEffectToWaapi(
      effect({ opacity: 0, y: 40 }),
      'mobile',
    );

    assert.equal(keyframes[0].opacity, 0);
  });

  test('should_always_fill_both_so_the_end_state_persists', () => {
    assert.equal(
      compileEffectToWaapi(effect({ opacity: 0 })).options.fill,
      'both',
    );
  });
});

// --- Easing coverage: every option the editor's dropdown offers must actually render. ---
// The dropdown and this compiler are two separate lists, and a name in one but not the
// other fails silently: compileEaseToCss returns the power2.out fallback, so the user
// picks Bounce and watches a plain ease-out. These lock the two lists together.
describe('compileEaseToCss coverage', () => {
  test('should_map_every_ease_the_dropdown_offers', () => {
    // Some names legitimately share a curve (expo.out and power2.out are the same bezier), so presence in the map is the real question, not difference from the fallback.
    for (const { value } of easeTypes) {
      const known = isKnownEase(value) || needsKeyframeEase(value);
      assert.equal(known, true, `${value} is offered but not mapped`);
    }
  });

  // Bounce and elastic oscillate, so no single cubic-bezier can express them. They are
  // reported as unmappable here and baked into keyframes by the effect compiler instead.
  test('should_report_bounce_and_elastic_as_needing_keyframes', () => {
    for (const n of [
      'bounce.out',
      'elastic.out',
      'bounce.in',
      'elastic.inOut',
    ]) {
      assert.equal(needsKeyframeEase(n), true, `${n} should need keyframes`);
    }
    assert.equal(needsKeyframeEase('power2.out'), false);
  });
});

describe('compileEffectToWaapi easing', () => {
  test('should_bake_bounce_into_multiple_keyframes_with_linear_timing', () => {
    const out = compileEffectToWaapi(
      effect({ opacity: 0, y: 40, duration: 0.8, ease: 'bounce.out' }),
    );
    assert.ok(
      out.keyframes.length > 2,
      'a baked ease must expand past the two-keyframe form',
    );
    // The sampled curve carries the shape, so the browser must not re-ease on top of it.
    assert.equal(out.options.easing, 'linear');
  });

  test('should_keep_the_two_keyframe_form_for_an_ordinary_ease', () => {
    const out = compileEffectToWaapi(
      effect({ opacity: 0, y: 40, duration: 0.8, ease: 'power2.out' }),
    );
    assert.equal(out.keyframes.length, 2);
    assert.equal(out.options.easing, 'cubic-bezier(0.16, 1, 0.3, 1)');
  });

  // A fromTo tween declares BOTH ends, so neither may be replaced by a resting value: the baked path has to carry the authored to-state through to the last frame.
  test('should_bake_a_fromTo_between_both_declared_states', () => {
    const out = compileEffectToWaapi({
      method: 'fromTo',
      devices: {
        desktop: {
          from: { scale: 0.5, duration: 0.6, ease: 'bounce.out' },
          to: { scale: 1.5 },
        },
      },
    });
    assert.equal(out.keyframes[0].transform, 'scale(0.5)');
    assert.equal(
      out.keyframes[out.keyframes.length - 1].transform,
      'scale(1.5)',
    );
  });

  test('should_hold_the_final_state_at_the_end_of_a_baked_ease', () => {
    const out = compileEffectToWaapi(
      effect({ opacity: 0, duration: 0.8, ease: 'elastic.out' }),
    );
    const last = out.keyframes[out.keyframes.length - 1];
    assert.equal(
      last.opacity,
      1,
      'the last keyframe must be the resting state',
    );
  });
});

// A `from` tween's destination is the element's natural state, and for most properties the keyword for that is what the browser interpolates towards. clip-path is the exception: `none` is not an interpolable value, so a wipe animates to the halfway point and then snaps. Verified in Chromium — inset(0 100% 0 0) -> none reads inset, inset, none, none, none across the tween, while -> inset(0px) walks 100% to 0% smoothly.
describe('clip path resting state', () => {
  const effectWith = (from) => ({
    method: 'from',
    devices: { desktop: { from: { duration: 0.8, ease: 'linear', ...from } } },
  });

  test('should_not_rest_a_clip_path_on_the_none_keyword', () => {
    const { keyframes } = compileEffectToWaapi(
      effectWith({ clipPath: 'inset(0 100% 0 0)' }),
      'desktop',
    );
    const last = keyframes[keyframes.length - 1];
    assert.notEqual(
      last.clipPath,
      'none',
      'clip-path cannot interpolate to none — the reveal snaps instead of wiping',
    );
  });

  test('should_rest_a_clip_path_on_a_fully_open_shape', () => {
    const { keyframes } = compileEffectToWaapi(
      effectWith({ clipPath: 'inset(0 100% 0 0)' }),
      'desktop',
    );
    const last = keyframes[keyframes.length - 1];
    assert.equal(last.clipPath, 'inset(0%)');
  });

  // Only when the tween actually declares one: an ordinary fade must not acquire a clip-path it never asked for, since that creates a new stacking/clipping context on every animated element.
  test('should_not_add_a_clip_path_to_a_tween_without_one', () => {
    const { keyframes } = compileEffectToWaapi(
      effectWith({ opacity: 0 }),
      'desktop',
    );
    for (const frame of keyframes) {
      assert.equal(frame.clipPath, undefined);
    }
  });
});

/* The properties the image and button presets need. All are plain animatable CSS — WAAPI interpolates them natively — but the compiler only emitted a fixed list, so a preset declaring any of them produced a keyframe that silently dropped it.

   Filters are the subtle one: blur, grayscale and brightness are all values of the single `filter` property, so emitting them as separate keys would mean the last one wins. They compose into one string instead. */
describe('image and button properties', () => {
  const frameFor = (from) =>
    compileEffectToWaapi(
      {
        method: 'from',
        devices: { desktop: { from: { duration: 0.6, ...from } } },
      },
      'desktop',
    ).keyframes[0];

  test('should_emit_a_box_shadow', () => {
    assert.equal(
      frameFor({ boxShadow: '0 0 0 rgba(0,0,0,0)' }).boxShadow,
      '0 0 0 rgba(0,0,0,0)',
    );
  });

  test('should_emit_a_border_radius', () => {
    assert.equal(frameFor({ borderRadius: '50%' }).borderRadius, '50%');
  });

  // A number is the common case in a preset — the unit is what the user means, not something they should have to type.
  test('should_treat_a_numeric_border_radius_as_pixels', () => {
    assert.equal(frameFor({ borderRadius: 24 }).borderRadius, '24px');
  });

  test('should_emit_a_border_color', () => {
    assert.equal(frameFor({ borderColor: '#ff0000' }).borderColor, '#ff0000');
  });

  test('should_emit_letter_spacing', () => {
    assert.equal(frameFor({ letterSpacing: 10 }).letterSpacing, '10px');
  });

  test('should_emit_background_size_and_position', () => {
    const frame = frameFor({
      backgroundSize: '120%',
      backgroundPosition: 'center',
    });
    assert.equal(frame.backgroundSize, '120%');
    assert.equal(frame.backgroundPosition, 'center');
  });

  test('should_emit_width_and_height', () => {
    const frame = frameFor({ width: '0%', height: 40 });
    assert.equal(frame.width, '0%');
    assert.equal(frame.height, '40px');
  });
});

/* Every filter is a value of ONE css property, so they have to compose into a single string. Emitting grayscale as its own keyframe key silently dropped it — the compiler already wrote `filter` for blur, and the later assignment won. */
describe('filter composition', () => {
  const frameFor = (from) =>
    compileEffectToWaapi(
      {
        method: 'from',
        devices: { desktop: { from: { duration: 0.6, ...from } } },
      },
      'desktop',
    ).keyframes[0];

  test('should_emit_grayscale_as_a_filter', () => {
    assert.equal(frameFor({ grayscale: 100 }).filter, 'grayscale(100%)');
  });

  test('should_emit_brightness_and_saturate', () => {
    assert.equal(frameFor({ brightness: 50 }).filter, 'brightness(50%)');
    assert.equal(frameFor({ saturate: 0 }).filter, 'saturate(0%)');
  });

  // The case that fails silently: a grayscale image reveal that also blurs would lose one half.
  test('should_combine_blur_and_grayscale_into_one_filter', () => {
    const { filter } = frameFor({ blur: 8, grayscale: 100 });
    assert.ok(filter.includes('blur(8px)'), `blur missing from "${filter}"`);
    assert.ok(
      filter.includes('grayscale(100%)'),
      `grayscale missing from "${filter}"`,
    );
  });

  // A `from` filter tween has to land on the element's natural look, and 'none' is interpolable for filter (unlike clip-path) — but only when the tween declared a filter at all.
  test('should_rest_a_filter_tween_on_none', () => {
    const { keyframes } = compileEffectToWaapi(
      {
        method: 'from',
        devices: { desktop: { from: { duration: 0.6, grayscale: 100 } } },
      },
      'desktop',
    );
    assert.equal(keyframes[keyframes.length - 1].filter, 'none');
  });
});

/* A bounce or elastic ease cannot be a cubic-bezier, so the tween is sampled into keyframes — and a sampled tween interpolates raw numbers, which means BOTH ends need one. RESTING_VALUES supplies the far end for a `from` tween.

   A property missing from that table reads `undefined` on the far side, the lerp guard holds the opening value, and the channel simply never animates: a Bounce preset that greys an image would stay grey forever. Silent, and invisible to a keyframe-count assertion. */
describe('resting values for sampled eases', () => {
  const bakedEnds = (from) => {
    const { keyframes } = compileEffectToWaapi(
      {
        method: 'from',
        devices: {
          desktop: { from: { duration: 0.6, ease: 'bounce.out', ...from } },
        },
      },
      'desktop',
    );
    return { first: keyframes[0], last: keyframes[keyframes.length - 1] };
  };

  test('should_land_a_sampled_grayscale_on_its_natural_state', () => {
    const { first, last } = bakedEnds({ grayscale: 100 });
    assert.equal(first.filter, 'grayscale(100%)');
    assert.notEqual(
      last.filter,
      'grayscale(100%)',
      'grayscale never animated — the element stays grey',
    );
  });

  test('should_land_a_sampled_border_radius_on_zero', () => {
    const { first, last } = bakedEnds({ borderRadius: 40 });
    assert.equal(first.borderRadius, '40px');
    assert.equal(last.borderRadius, '0px');
  });

  test('should_land_a_sampled_letter_spacing_on_zero', () => {
    const { last } = bakedEnds({ letterSpacing: 20 });
    assert.equal(last.letterSpacing, '0px');
  });

  test('should_land_a_sampled_brightness_on_full', () => {
    const { last } = bakedEnds({ brightness: 30 });
    assert.equal(last.filter, 'brightness(100%)');
  });
});

/* Looping is WAAPI's own — `iterations` and `direction` on the timing object — and the compiler never emitted either, so an idle animation (a floating icon, a breathing button) could not be expressed at all: every preset played once and stopped.

   `alternate` is what makes a loop read as motion rather than a jump: without it the element springs back to its opening state at the end of each pass. */
describe('looping', () => {
  const optionsFor = (from) =>
    compileEffectToWaapi(
      {
        method: 'from',
        devices: { desktop: { from: { duration: 0.6, ...from } } },
      },
      'desktop',
    ).options;

  test('should_play_once_by_default', () => {
    const options = optionsFor({ opacity: 0 });
    assert.ok(
      options.iterations === undefined || options.iterations === 1,
      `default must not loop, got ${options.iterations}`,
    );
  });

  test('should_repeat_forever_when_asked', () => {
    assert.equal(optionsFor({ opacity: 0, repeat: -1 }).iterations, Infinity);
  });

  // GSAP counts repeats as replays AFTER the first pass; WAAPI counts total runs. repeat 2 means three plays.
  test('should_read_a_repeat_count_as_additional_plays', () => {
    assert.equal(optionsFor({ opacity: 0, repeat: 2 }).iterations, 3);
  });

  test('should_alternate_when_yoyo_is_on', () => {
    assert.equal(
      optionsFor({ opacity: 0, repeat: -1, yoyo: true }).direction,
      'alternate',
    );
  });

  test('should_run_forwards_when_yoyo_is_off', () => {
    const options = optionsFor({ opacity: 0, repeat: -1 });
    assert.ok(
      options.direction === undefined || options.direction === 'normal',
      `expected forward playback, got ${options.direction}`,
    );
  });

  // A looping tween must not hold its opening frame before it starts or its last frame after: with fill 'both' an infinite alternate still reads correctly, but a finite loop that ends on the far state should stay there, which is what 'both' gives.
  test('should_keep_filling_both_ends_while_looping', () => {
    assert.equal(optionsFor({ opacity: 0, repeat: -1 }).fill, 'both');
  });
});

/* A border width animates to nothing unless the element has a border-style. Most do not: an h1 computes border-style 'none', and the browser then clamps border-width to 0 whatever the keyframes say — verified in Chromium, where animating to 4px leaves the computed width at 0px with no style set, and reaches 4px with `border-style: solid`.

   border-style is a keyword and cannot be interpolated, so it is emitted on BOTH keyframes rather than animated — the same trick Animated Underline uses for its gradient. */
describe('border width implies a border style', () => {
  test('should_emit_a_border_style_when_a_width_is_animated', () => {
    const { keyframes } = compileEffectToWaapi(
      {
        method: 'to',
        devices: { desktop: { to: { borderWidth: 3, duration: 0.3 } } },
      },
      'desktop',
    );
    assert.equal(keyframes[0].borderStyle, 'solid');
    assert.equal(keyframes[1].borderStyle, 'solid');
  });

  // An author who names a style keeps it — the default only fills a gap.
  test('should_respect_an_explicit_border_style', () => {
    const { keyframes } = compileEffectToWaapi(
      {
        method: 'to',
        devices: {
          desktop: {
            to: { borderWidth: 3, borderStyle: 'dashed', duration: 0.3 },
          },
        },
      },
      'desktop',
    );
    assert.equal(keyframes[1].borderStyle, 'dashed');
  });

  // Colour alone paints nothing new: the element either already has a border, in which case its own style stands, or it has none and a style would conjure one the preset never asked for.
  test('should_not_add_a_border_style_for_colour_alone', () => {
    const { keyframes } = compileEffectToWaapi(
      {
        method: 'to',
        devices: { desktop: { to: { borderColor: '#2563eb', duration: 0.3 } } },
      },
      'desktop',
    );
    assert.equal(keyframes[1].borderStyle, undefined);
  });

  test('should_not_add_a_border_style_when_no_border_is_touched', () => {
    const { keyframes } = compileEffectToWaapi(
      {
        method: 'to',
        devices: { desktop: { to: { color: '#2563eb', duration: 0.3 } } },
      },
      'desktop',
    );
    assert.equal(keyframes[1].borderStyle, undefined);
  });

  // Same clamp, same fix: an outline with no style paints nothing either.
  test('should_emit_an_outline_style_when_a_width_is_animated', () => {
    const { keyframes } = compileEffectToWaapi(
      {
        method: 'to',
        devices: { desktop: { to: { outlineWidth: 3, duration: 0.3 } } },
      },
      'desktop',
    );
    assert.equal(keyframes[1].outlineStyle, 'solid');
  });
});

/* A 'to' effect's opening keyframe is synthetic — {transform:'none', opacity:1} — so it names none of the properties being animated. Forward that is fine: the browser fills the opening value from the element's own computed style, which is exactly the resting look a hover style should start from.

   Reversed it is not. The revert plays those keyframes backwards, so the synthetic frame becomes the ENDPOINT, and a property missing from it resolves against whatever the element computes at that moment — which is the animation's own fill. A reverted border width climbed 1px → 2px → 3px across successive hovers instead of returning to 0.

   So the box properties that have a meaningful resting value carry it explicitly. */
describe('to-method opening keyframe names its resting values', () => {
  const opening = (to) =>
    compileEffectToWaapi(
      { method: 'to', devices: { desktop: { to: { ...to, duration: 0.3 } } } },
      'desktop',
    ).keyframes[0];

  test('should_rest_border_width_at_zero', () => {
    assert.equal(opening({ borderWidth: 3 }).borderWidth, '0px');
  });

  test('should_rest_outline_width_at_zero', () => {
    assert.equal(opening({ outlineWidth: 3 }).outlineWidth, '0px');
  });

  // Padding and margin have no universal resting value — an element's own padding is whatever its stylesheet says, and naming 0 would collapse it on the way in rather than growing from where it sits.
  test('should_leave_padding_to_the_stylesheet', () => {
    assert.equal(opening({ padding: 20 }).padding, undefined);
  });

  test('should_not_name_a_resting_value_for_untouched_properties', () => {
    assert.equal(opening({ color: '#2563eb' }).borderWidth, undefined);
  });
});
