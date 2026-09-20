/* State (GSAP-shaped props) → WAAPI keyframe. Driven by the single property table in shared/catalogue.js — see that file for what `kind` means and why properties are grouped the way they are. */

import { PROPS, FILTER_PROPS } from '../../shared/catalogue.js';

export function compileTransformString(props = {}) {
  const parts = [];

  const x = props.x ?? 0;
  const y = props.y ?? 0;
  const z = props.z ?? 0;
  const xPercent = props.xPercent ?? 0;
  const yPercent = props.yPercent ?? 0;

  if (xPercent !== 0 || yPercent !== 0) {
    parts.push(`translate(${xPercent}%, ${yPercent}%)`);
  }

  if (x !== 0 || y !== 0 || z !== 0) {
    const xUnit = typeof x === 'number' ? `${x}px` : x;
    const yUnit = typeof y === 'number' ? `${y}px` : y;
    const zUnit = typeof z === 'number' ? `${z}px` : z;
    parts.push(`translate3d(${xUnit}, ${yUnit}, ${zUnit})`);
  }

  const rotate = props.rotate ?? props.rotation ?? props.rotationZ;
  if (rotate !== undefined && rotate !== 0) {
    const rotVal = typeof rotate === 'number' ? `${rotate}deg` : rotate;
    parts.push(`rotate(${rotVal})`);
  }

  if (props.rotationX !== undefined && props.rotationX !== 0) {
    const rotX =
      typeof props.rotationX === 'number'
        ? `${props.rotationX}deg`
        : props.rotationX;
    parts.push(`rotateX(${rotX})`);
  }

  if (props.rotationY !== undefined && props.rotationY !== 0) {
    const rotY =
      typeof props.rotationY === 'number'
        ? `${props.rotationY}deg`
        : props.rotationY;
    parts.push(`rotateY(${rotY})`);
  }

  const scale = props.scale;
  const scaleX = props.scaleX;
  const scaleY = props.scaleY;

  if (scale !== undefined && scale !== 1) {
    parts.push(`scale(${scale})`);
  } else {
    if (scaleX !== undefined && scaleX !== 1) parts.push(`scaleX(${scaleX})`);
    if (scaleY !== undefined && scaleY !== 1) parts.push(`scaleY(${scaleY})`);
  }

  if (props.skewX !== undefined && props.skewX !== 0) {
    const sX =
      typeof props.skewX === 'number' ? `${props.skewX}deg` : props.skewX;
    parts.push(`skewX(${sX})`);
  }
  if (props.skewY !== undefined && props.skewY !== 0) {
    const sY =
      typeof props.skewY === 'number' ? `${props.skewY}deg` : props.skewY;
    parts.push(`skewY(${sY})`);
  }

  return parts.length > 0 ? parts.join(' ') : 'none';
}

// A bare number carries the unit the property implies; a string is already authored and passes through untouched.
export function withUnit(value, unit) {
  return typeof value === 'number' ? `${value}${unit}` : value;
}

/* Every filter effect is a value of the SINGLE `filter` property, so they compose into one space-separated string rather than separate keyframe keys — writing them separately meant the last assignment won and the rest vanished with no error.

   An explicit `filter` string wins outright: it is the escape hatch for anything the catalogue does not name. */
export function compileFilterString(props = {}) {
  if (props.filter !== undefined && props.filter !== '') return props.filter;

  const parts = [];
  for (const [key, def] of Object.entries(FILTER_PROPS)) {
    const value = props[key];
    if (value === undefined || value === '') continue;
    parts.push(`${def.css || key}(${withUnit(value, def.unit)})`);
  }
  return parts.length > 0 ? parts.join(' ') : '';
}

export function compileStateToKeyframe(stateProps = {}) {
  const keyframe = {};
  const transform = compileTransformString(stateProps);

  if (transform !== 'none') {
    keyframe.transform = transform;
  }

  const filter = compileFilterString(stateProps);
  if (filter) keyframe.filter = filter;

  for (const [key, def] of Object.entries(PROPS)) {
    if (def.kind === 'transform' || def.kind === 'filter') continue;

    if (def.kind === 'plain') {
      if (def.numeric) {
        if (stateProps[key] !== undefined) keyframe[def.css] = Number(stateProps[key]);
        continue;
      }
      if (stateProps[key] === undefined || stateProps[key] === '') continue;
      keyframe[def.css] = def.unit ? withUnit(stateProps[key], def.unit) : stateProps[key];
      continue;
    }

    if (def.kind === 'keyword-pair') {
      /* A width needs a style to paint. Most elements compute border-style 'none', and the browser then clamps border-width to 0 whatever the keyframes say — so a Hover Border preset animated a width that never appeared. The style is a keyword and cannot be interpolated, so it is emitted on every keyframe as a constant rather than animated, the same way Animated Underline carries its gradient.

         Only when the WIDTH is animated: a colour change alone means the element either already has a border, whose style stands, or has none, and conjuring one would paint a border the preset never asked for. */
      if (stateProps[key] !== undefined && stateProps[key] !== '') {
        keyframe[key] = withUnit(stateProps[key], def.unit);
        keyframe[def.styleProp] = stateProps[def.styleProp] || 'solid';
      } else if (stateProps[def.styleProp]) {
        keyframe[def.styleProp] = stateProps[def.styleProp];
      }
      continue;
    }

    // 'keyword-only' (borderStyle, outlineStyle): fully handled above by its paired 'keyword-pair' entry — it exists in the catalogue only so the editor can offer it as its own field row.
  }

  return keyframe;
}
