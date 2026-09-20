/* The single property table for the WAAPI engine — every property the compiler can animate, and the editor's "Add Property" popover can offer, in one place.

   Before this file, `compiler.js` and the editor's `freePropertyFields.js` each hand-maintained their own independent list, with no import connecting them. Eight properties the compiler already animated (sepia, invert, hueRotate, wordSpacing, outlineStyle, borderStyle, backgroundImage, backgroundRepeat) had no matching editor field, so a preset author could only reach them by hand-editing JSON. This table is now the only place a property's shape, unit and UI row are declared — both sides read it, so the two can no longer drift apart.

   `kind` decides how compiler/keyframe.js folds the property into a keyframe:
     - 'transform'    one of the axes compileTransformString composes into the single `transform` string. Handled there directly (translate/rotate/scale interact — x/y/z combine into one translate3d, scale and scaleX/scaleY are mutually exclusive) rather than by this table, but listed here so the property is known to exist and carries `field` metadata for the editor.
     - 'filter'       one value of the single `filter` string. `unit` and `css` (the CSS filter function name, defaults to the key) are read directly by compileFilterString.
     - 'plain'        an independent CSS property, emitted as-is once a value is present. `unit` wraps a bare number; a string author already carries its own unit and passes through untouched. `numeric: true` means the value is cast with Number(), not unit-wrapped (opacity).
     - 'keyword-pair' a width paired with a style keyword that cannot itself be interpolated (borderWidth/borderStyle, outlineWidth/outlineStyle) — a style with no width paints nothing, so the width branch seeds a default style when the preset didn't set one.
     - 'keyword-only' the style half of a keyword-pair, or a standalone keyword value — carried onto the keyframe verbatim when present, never unit-wrapped.

   `rest` is the value a sampled bounce/elastic/spring ease uses for whichever side of a from/to pair didn't declare the property — see compiler/ease.js's bakeEaseToKeyframes. Properties with no universal resting value (fontSize, padding, margin, borderWidth — the neutral state is whatever the stylesheet already says) simply omit it.

   `field` is the editor UI row: title, fieldType, defaultValue and the rest of what `helpers/freePropertyFields.js` needs to render and write an "Add Property" row. */

export const PROPS = {
  // --- transform-composing ---
  x: {
    kind: 'transform',
    rest: 0,
    field: {
      title: 'X',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 1,
      message: 'Horizontal translation (px)',
    },
  },
  y: {
    kind: 'transform',
    rest: 0,
    field: {
      title: 'Y',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 1,
      message: 'Vertical translation (px)',
    },
  },
  z: {
    kind: 'transform',
    rest: 0,
    field: {
      title: 'Z',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 1,
      message: 'Z-axis translation (px)',
    },
  },
  xPercent: {
    kind: 'transform',
    rest: 0,
    field: {
      title: 'X Percent',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 1,
      message: 'Horizontal translation as percentage of element width',
    },
  },
  yPercent: {
    kind: 'transform',
    rest: 0,
    field: {
      title: 'Y Percent',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 1,
      message: 'Vertical translation as percentage of element height',
    },
  },
  scale: {
    kind: 'transform',
    rest: 1,
    field: {
      title: 'Scale',
      fieldType: 'number-field',
      defaultValue: 1,
      step: 0.1,
      message: 'Uniform scale factor',
    },
  },
  scaleX: {
    kind: 'transform',
    rest: 1,
    field: {
      title: 'Scale X',
      fieldType: 'number-field',
      defaultValue: 1,
      step: 0.1,
      message: 'Horizontal scale factor',
    },
  },
  scaleY: {
    kind: 'transform',
    rest: 1,
    field: {
      title: 'Scale Y',
      fieldType: 'number-field',
      defaultValue: 1,
      step: 0.1,
      message: 'Vertical scale factor',
    },
  },
  rotate: {
    kind: 'transform',
    rest: 0,
    field: {
      title: 'Rotate',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 1,
      message: 'Rotation around the Z axis (deg)',
    },
  },
  rotation: {
    kind: 'transform',
    rest: 0,
    field: {
      title: 'Rotation',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 1,
      message: 'Rotation around the Z axis (deg)',
    },
  },
  rotationX: {
    kind: 'transform',
    rest: 0,
    field: {
      title: 'Rotation X',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 1,
      message: 'Rotation around the X axis (deg)',
    },
  },
  rotationY: {
    kind: 'transform',
    rest: 0,
    field: {
      title: 'Rotation Y',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 1,
      message: 'Rotation around the Y axis (deg)',
    },
  },
  skewX: {
    kind: 'transform',
    rest: 0,
    field: {
      title: 'Skew X',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 1,
      message: 'Horizontal skew (deg)',
    },
  },
  skewY: {
    kind: 'transform',
    rest: 0,
    field: {
      title: 'Skew Y',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 1,
      message: 'Vertical skew (deg)',
    },
  },

  // --- filter-composing (one value of the single `filter` property) ---
  blur: {
    kind: 'filter',
    unit: 'px',
    rest: 0,
    field: {
      title: 'Blur',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 1,
      min: 0,
      message: 'Gaussian blur radius (px)',
    },
  },
  grayscale: {
    kind: 'filter',
    unit: '%',
    rest: 0,
    field: {
      title: 'Grayscale',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 5,
      min: 0,
      max: 100,
      message: 'Desaturation, 0 to 100%',
    },
  },
  brightness: {
    kind: 'filter',
    unit: '%',
    rest: 100,
    field: {
      title: 'Brightness',
      fieldType: 'number-field',
      defaultValue: 100,
      step: 5,
      min: 0,
      message: 'Brightness percentage — 100 is untouched',
    },
  },
  contrast: {
    kind: 'filter',
    unit: '%',
    rest: 100,
    field: {
      title: 'Contrast',
      fieldType: 'number-field',
      defaultValue: 100,
      step: 5,
      min: 0,
      message: 'Contrast percentage — 100 is untouched',
    },
  },
  saturate: {
    kind: 'filter',
    unit: '%',
    rest: 100,
    field: {
      title: 'Saturate',
      fieldType: 'number-field',
      defaultValue: 100,
      step: 5,
      min: 0,
      message: 'Saturation percentage — 100 is untouched',
    },
  },
  sepia: {
    kind: 'filter',
    unit: '%',
    rest: 0,
    field: {
      title: 'Sepia',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 5,
      min: 0,
      max: 100,
      message: 'Sepia tint, 0 to 100%',
    },
  },
  invert: {
    kind: 'filter',
    unit: '%',
    rest: 0,
    field: {
      title: 'Invert',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 5,
      min: 0,
      max: 100,
      message: 'Colour inversion, 0 to 100%',
    },
  },
  hueRotate: {
    kind: 'filter',
    css: 'hue-rotate',
    unit: 'deg',
    rest: 0,
    field: {
      title: 'Hue Rotate',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 5,
      message: 'Hue rotation (deg)',
    },
  },

  // --- plain CSS ---
  opacity: {
    kind: 'plain',
    css: 'opacity',
    numeric: true,
    rest: 1,
    field: {
      title: 'Opacity',
      fieldType: 'number-field',
      defaultValue: 1,
      step: 0.1,
      min: 0,
      max: 1,
      message: 'Opacity, 0 to 1',
    },
  },
  transformOrigin: {
    kind: 'plain',
    css: 'transformOrigin',
    field: {
      title: 'Transform Origin',
      fieldType: 'text-field',
      defaultValue: '',
      message: 'Origin the transform pivots around, e.g. "center center"',
    },
  },
  clipPath: {
    kind: 'plain',
    css: 'clipPath',
    field: {
      title: 'Clip Path',
      fieldType: 'text-field',
      defaultValue: '',
      message: 'CSS clip-path value',
    },
  },
  color: {
    kind: 'plain',
    css: 'color',
    field: {
      title: 'Color',
      fieldType: 'color-picker-field',
      defaultValue: '',
      message: 'Text colour',
    },
  },
  backgroundColor: {
    kind: 'plain',
    css: 'backgroundColor',
    field: {
      title: 'Background Color',
      fieldType: 'color-picker-field',
      defaultValue: '',
      message: 'Background colour',
    },
  },
  boxShadow: {
    kind: 'plain',
    css: 'boxShadow',
    field: {
      title: 'Box Shadow',
      fieldType: 'text-field',
      defaultValue: '',
      message: 'CSS box-shadow, e.g. "0 10px 30px rgba(0,0,0,0.2)"',
    },
  },
  borderColor: {
    kind: 'plain',
    css: 'borderColor',
    field: {
      title: 'Border Color',
      fieldType: 'color-picker-field',
      defaultValue: '',
      message: 'Border colour',
    },
  },
  borderRadius: {
    kind: 'plain',
    css: 'borderRadius',
    unit: 'px',
    rest: 0,
    field: {
      title: 'Border Radius',
      fieldType: 'text-field',
      defaultValue: '',
      message:
        'Corner radius — a number is pixels, or write a value like "50%"',
    },
  },
  letterSpacing: {
    kind: 'plain',
    css: 'letterSpacing',
    unit: 'px',
    rest: 0,
    field: {
      title: 'Letter Spacing',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 1,
      message: 'Space between letters (px)',
    },
  },
  wordSpacing: {
    kind: 'plain',
    css: 'wordSpacing',
    unit: 'px',
    rest: 0,
    field: {
      title: 'Word Spacing',
      fieldType: 'number-field',
      defaultValue: 0,
      step: 1,
      message: 'Space between words (px)',
    },
  },
  width: {
    kind: 'plain',
    css: 'width',
    unit: 'px',
    field: {
      title: 'Width',
      fieldType: 'text-field',
      defaultValue: '',
      message: 'Width — a number is pixels, or write a value like "0%"',
    },
  },
  height: {
    kind: 'plain',
    css: 'height',
    unit: 'px',
    field: {
      title: 'Height',
      fieldType: 'text-field',
      defaultValue: '',
      message: 'Height — a number is pixels, or write a value like "0%"',
    },
  },
  backgroundSize: {
    kind: 'plain',
    css: 'backgroundSize',
    field: {
      title: 'Background Size',
      fieldType: 'text-field',
      defaultValue: '',
      message:
        'CSS background-size, e.g. "120%" — pairs with Background Position for a slow zoom',
    },
  },
  fontSize: {
    kind: 'plain',
    css: 'fontSize',
    unit: 'px',
    field: {
      title: 'Font Size',
      fieldType: 'number-field',
      defaultValue: '',
      step: 1,
      message: 'Font size in pixels',
    },
  },
  fontWeight: {
    kind: 'plain',
    css: 'fontWeight',
    rest: 400,
    field: {
      title: 'Font Weight',
      fieldType: 'number-field',
      defaultValue: '',
      min: 100,
      max: 900,
      step: 100,
      message: 'Font weight, 100 to 900 — only variable fonts animate smoothly',
    },
  },
  lineHeight: {
    kind: 'plain',
    css: 'lineHeight',
    field: {
      title: 'Line Height',
      fieldType: 'text-field',
      defaultValue: '',
      message: 'Line height — unitless like "1.6", or a value like "24px"',
    },
  },
  padding: {
    kind: 'plain',
    css: 'padding',
    unit: 'px',
    field: {
      title: 'Padding',
      fieldType: 'text-field',
      defaultValue: '',
      message: 'Padding — a number is pixels, or write "10px 20px"',
    },
  },
  margin: {
    kind: 'plain',
    css: 'margin',
    unit: 'px',
    field: {
      title: 'Margin',
      fieldType: 'text-field',
      defaultValue: '',
      message: 'Margin — a number is pixels, or write "10px 20px"',
    },
  },
  textShadow: {
    kind: 'plain',
    css: 'textShadow',
    field: {
      title: 'Text Shadow',
      fieldType: 'text-field',
      defaultValue: '',
      message: 'CSS text-shadow, e.g. "0 2px 6px rgba(0,0,0,0.4)"',
    },
  },
  textDecorationColor: {
    kind: 'plain',
    css: 'textDecorationColor',
    field: {
      title: 'Underline Color',
      fieldType: 'color-picker-field',
      defaultValue: '',
      message: 'Colour of an existing underline',
    },
  },
  textDecorationThickness: {
    kind: 'plain',
    css: 'textDecorationThickness',
    unit: 'px',
    rest: 0,
    field: {
      title: 'Underline Thickness',
      fieldType: 'number-field',
      defaultValue: '',
      step: 1,
      message: 'Underline thickness in pixels',
    },
  },
  // The underline-sweep seed: a preset sets these once so backgroundSize has a gradient to reveal. Not animated themselves, just present on the element — see Animated Underline in presets/free.
  backgroundImage: {
    kind: 'plain',
    css: 'backgroundImage',
    field: {
      title: 'Background Image',
      fieldType: 'text-field',
      defaultValue: '',
      message: 'CSS background-image, e.g. a gradient for a sweep effect',
    },
  },
  backgroundRepeat: {
    kind: 'plain',
    css: 'backgroundRepeat',
    field: {
      title: 'Background Repeat',
      fieldType: 'text-field',
      defaultValue: '',
      message: 'CSS background-repeat, e.g. "no-repeat"',
    },
  },
  outlineOffset: {
    kind: 'plain',
    css: 'outlineOffset',
    unit: 'px',
    rest: 0,
    field: {
      title: 'Outline Offset',
      fieldType: 'number-field',
      defaultValue: '',
      step: 1,
      message: 'Gap between the element and its outline, in pixels',
    },
  },
  outlineColor: {
    kind: 'plain',
    css: 'outlineColor',
    field: {
      title: 'Outline Color',
      fieldType: 'color-picker-field',
      defaultValue: '',
      message: 'Outline colour',
    },
  },
  backgroundPosition: {
    kind: 'plain',
    css: 'backgroundPosition',
    field: {
      title: 'Background Position',
      fieldType: 'text-field',
      defaultValue: '',
      message: 'CSS background-position, e.g. "center" or "left top"',
    },
  },

  // --- keyword-pair (a width paired with a non-interpolable style keyword) ---
  borderWidth: {
    kind: 'keyword-pair',
    styleProp: 'borderStyle',
    unit: 'px',
    field: {
      title: 'Border Width',
      fieldType: 'number-field',
      defaultValue: '',
      step: 1,
      message:
        'Border width in pixels — the element needs a border-style to show it',
    },
  },
  outlineWidth: {
    kind: 'keyword-pair',
    styleProp: 'outlineStyle',
    unit: 'px',
    field: {
      title: 'Outline Width',
      fieldType: 'number-field',
      defaultValue: '',
      step: 1,
      message: 'Outline width in pixels',
    },
  },
  // The style half of a keyword-pair — carried onto the keyframe verbatim, never unit-wrapped, only emitted when the matching width isn't also present (compiler/keyframe.js's keyword-pair branch handles that case itself).
  borderStyle: {
    kind: 'keyword-only',
    field: {
      title: 'Border Style',
      fieldType: 'text-field',
      defaultValue: '',
      message:
        'CSS border-style, e.g. "solid" — needed for Border Width to paint',
    },
  },
  outlineStyle: {
    kind: 'keyword-only',
    field: {
      title: 'Outline Style',
      fieldType: 'text-field',
      defaultValue: '',
      message:
        'CSS outline-style, e.g. "solid" — needed for Outline Width to paint',
    },
  },
};

// The compiled `filter` property is one CSS function per key, so nothing else is `kind: 'filter'` — this pulls just that subset for compileFilterString.
export const FILTER_PROPS = Object.fromEntries(
  Object.entries(PROPS).filter(([, def]) => def.kind === 'filter'),
);

// Every property's resting value, for the sampled bounce/elastic ease path (compiler/ease.js). Properties with no universal resting value simply have none here.
export const RESTING_VALUES = Object.fromEntries(
  Object.entries(PROPS)
    .filter(([, def]) => def.rest !== undefined)
    .map(([key, def]) => [key, def.rest]),
);
