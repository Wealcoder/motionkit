// The 10 preloader preset builders.
//
// Contract — each builder receives ({ visual, content, root }, cfg) and returns:
//   {
//     tick(p)            optional — progress-driven visuals (0..1)
//     destroy()          optional — cleanup
//     revealOverride(root, reveal, done)  optional — preset supplies its own exit
//   }
//
// Continuous motion (spin, bounce, wave, morph) is done with CSS keyframes rather than
// GSAP on purpose: the cover must look alive even on a site whose GSAP CDN is slow or
// blocked. GSAP is used for the reveal, where it is available by then or the CSS fallback
// in reveal.js takes over.

const STYLE_PREFIX = "motionkit-preloader-preset-";

const injectCss = (id, css) => {
  const styleId = STYLE_PREFIX + id;
  if (document.getElementById(styleId)) return;
  const el = document.createElement("style");
  el.id = styleId;
  el.textContent = css;
  (document.head || document.documentElement).appendChild(el);
};

const num = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const str = (v, fallback) => (typeof v === "string" && v !== "" ? v : fallback);

const SVG_NS = "http://www.w3.org/2000/svg";

// ── Progress Ring ─────────────────────────────────────────────
// Real progress on a circle. Uses stroke-dashoffset rather than a rotating mask so the
// arc is exact at every value, not an approximation that snaps at the end.
function progressRing({ visual }, cfg) {
  const size = num(cfg.ringSize, 132);
  const thickness = num(cfg.thickness, 6);
  const radius = Math.max(1, (size - thickness) / 2);
  const circumference = 2 * Math.PI * radius;

  const holder = document.createElement("div");
  holder.style.cssText = `position:relative;width:${size}px;height:${size}px`;

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  // Rotate so the arc starts at 12 o'clock instead of 3.
  svg.style.cssText = "display:block;transform:rotate(-90deg)";

  const mkCircle = (stroke) => {
    const c = document.createElementNS(SVG_NS, "circle");
    c.setAttribute("cx", String(size / 2));
    c.setAttribute("cy", String(size / 2));
    c.setAttribute("r", String(radius));
    c.setAttribute("fill", "none");
    c.setAttribute("stroke", stroke);
    c.setAttribute("stroke-width", String(thickness));
    return c;
  };

  svg.appendChild(mkCircle(str(cfg.trackColor, "#ffffff1f")));

  const arc = mkCircle(str(cfg.ringColor, "#7c5cff"));
  arc.setAttribute("stroke-linecap", "round");
  arc.setAttribute("stroke-dasharray", String(circumference));
  arc.setAttribute("stroke-dashoffset", String(circumference));
  arc.style.transition = "stroke-dashoffset .12s linear";
  if (cfg.glow) {
    arc.style.filter = `drop-shadow(0 0 10px ${str(cfg.glowColor, "#7c5cff80")})`;
  }
  svg.appendChild(arc);
  holder.appendChild(svg);

  let label = null;
  if (cfg.showPercent !== false) {
    label = document.createElement("div");
    label.style.cssText = [
      "position:absolute",
      "inset:0",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      `color:${str(cfg.percentColor, "#ffffff")}`,
      `font-size:${num(cfg.percentSize, 28)}px`,
      "font-weight:700",
      "line-height:1",
      "font-variant-numeric:tabular-nums",
    ].join(";");
    label.textContent = "0%";
    holder.appendChild(label);
  }

  visual.appendChild(holder);

  return {
    tick(p) {
      arc.setAttribute("stroke-dashoffset", String(circumference * (1 - p)));
      if (label) label.textContent = `${Math.round(p * 100)}%`;
    },
  };
}

// ── Gradient Orb ──────────────────────────────────────────────
// Conic gradient sweeping around a sphere, with an optional bloom. Deliberately pure CSS
// — no canvas, no SVG filter — so it stays cheap on a phone that is still loading.
function gradientOrb({ visual }, cfg) {
  const size = num(cfg.orbSize, 160);
  const colorA = str(cfg.colorA, "#7c5cff");
  const colorB = str(cfg.colorB, "#00d4ff");
  const glow = Math.max(0, num(cfg.glowStrength, 60));
  const speed = Math.max(0.1, num(cfg.rotateSpeed, 1));

  injectCss(
    "gradientorb",
    "@keyframes mk-pl-orb-spin{to{transform:rotate(360deg)}}" +
      "@keyframes mk-pl-orb-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}",
  );

  const holder = document.createElement("div");
  holder.style.cssText = [
    `width:${size}px`,
    `height:${size}px`,
    "border-radius:50%",
    "position:relative",
    cfg.breathe === false
      ? ""
      : "animation:mk-pl-orb-breathe 2.6s ease-in-out infinite",
  ]
    .filter(Boolean)
    .join(";");

  const orb = document.createElement("div");
  orb.style.cssText = [
    "position:absolute",
    "inset:0",
    "border-radius:50%",
    `background:conic-gradient(from 0deg, ${colorA}, ${colorB}, ${colorA})`,
    `animation:mk-pl-orb-spin ${4 / speed}s linear infinite`,
    glow > 0 ? `box-shadow:0 0 ${glow}px ${Math.round(glow / 3)}px ${colorA}59` : "",
  ]
    .filter(Boolean)
    .join(";");
  holder.appendChild(orb);
  visual.appendChild(holder);
  return {};
}

// ── Stroke Fill Text ──────────────────────────────────────────
// The word IS the progress bar: an outlined copy underneath, a solid copy on top clipped
// from the bottom up as loading advances.
function strokeFill({ visual }, cfg) {
  const text = str(cfg.text, "LOADING");
  const fontSize = num(cfg.fontSize, 88);
  const shared = [
    `font-size:min(${fontSize}px, 13vw)`,
    `font-weight:${str(cfg.fontWeight, "800")}`,
    `letter-spacing:${num(cfg.letterSpacing, 0.06)}em`,
    "line-height:1.05",
    "white-space:nowrap",
    "font-family:inherit",
  ].join(";");
  const strokeWidth = num(cfg.strokeWidth, 1.5);

  const holder = document.createElement("div");
  holder.style.cssText = "position:relative;display:inline-block";

  const outline = document.createElement("div");
  outline.style.cssText =
    shared +
    ";color:transparent" +
    `;-webkit-text-stroke:${strokeWidth}px ${str(cfg.strokeColor, "#ffffff33")}`;
  outline.textContent = text;

  const fill = document.createElement("div");
  fill.style.cssText =
    shared +
    ";position:absolute;left:0;top:0;width:100%" +
    `;color:${str(cfg.fillColor, "#ffffff")}` +
    ";clip-path:inset(100% 0 0 0);transition:clip-path .12s linear";
  fill.textContent = text;

  holder.appendChild(outline);
  holder.appendChild(fill);
  visual.appendChild(holder);

  return {
    tick(p) {
      fill.style.clipPath = `inset(${(1 - p) * 100}% 0 0 0)`;
    },
  };
}

// ── Glitch Text ───────────────────────────────────────────────
// Chromatic-aberration tear from three stacked copies. Intensity rides on a CSS custom
// property so the keyframes stay static and injectCss can keep being idempotent.
function glitchText({ visual }, cfg) {
  const text = str(cfg.text, "LOADING");
  const speed = Math.max(0.2, num(cfg.speed, 1));

  injectCss(
    "glitchtext",
    "@keyframes mk-pl-glitch-a{" +
      "0%,100%{clip-path:inset(0 0 86% 0);transform:translateX(calc(var(--mk-gi) * -1))}" +
      "25%{clip-path:inset(24% 0 52% 0);transform:translateX(var(--mk-gi))}" +
      "50%{clip-path:inset(58% 0 22% 0);transform:translateX(calc(var(--mk-gi) * -1))}" +
      "75%{clip-path:inset(38% 0 44% 0);transform:translateX(var(--mk-gi))}}" +
      "@keyframes mk-pl-glitch-b{" +
      "0%,100%{clip-path:inset(72% 0 8% 0);transform:translateX(var(--mk-gi))}" +
      "25%{clip-path:inset(12% 0 70% 0);transform:translateX(calc(var(--mk-gi) * -1))}" +
      "50%{clip-path:inset(46% 0 34% 0);transform:translateX(var(--mk-gi))}" +
      "75%{clip-path:inset(6% 0 80% 0);transform:translateX(calc(var(--mk-gi) * -1))}}",
  );

  const shared = [
    `font-size:min(${num(cfg.fontSize, 64)}px, 12vw)`,
    `font-weight:${str(cfg.fontWeight, "800")}`,
    `letter-spacing:${num(cfg.letterSpacing, 0.08)}em`,
    "line-height:1.05",
    "white-space:nowrap",
    "font-family:inherit",
  ].join(";");

  const holder = document.createElement("div");
  holder.style.cssText = "position:relative;display:inline-block";
  holder.style.setProperty("--mk-gi", `${num(cfg.intensity, 4)}px`);

  const base = document.createElement("div");
  base.style.cssText = shared + `;color:${str(cfg.baseColor, "#ffffff")}`;
  base.textContent = text;
  holder.appendChild(base);

  [
    [str(cfg.shiftColorA, "#ff2e63"), "mk-pl-glitch-a"],
    [str(cfg.shiftColorB, "#00fff0"), "mk-pl-glitch-b"],
  ].forEach(([color, anim]) => {
    const layer = document.createElement("div");
    layer.style.cssText =
      shared +
      ";position:absolute;left:0;top:0;width:100%" +
      `;color:${color}` +
      `;animation:${anim} ${0.9 / speed}s steps(2,end) infinite`;
    layer.textContent = text;
    holder.appendChild(layer);
  });

  visual.appendChild(holder);
  return {};
}

// ── 1. Spinner Ring ───────────────────────────────────────────
function spinner({ visual }, cfg) {
  const size = num(cfg.ringSize, 56);
  const thickness = num(cfg.thickness, 4);
  const speed = Math.max(0.1, num(cfg.spinSpeed, 1));

  injectCss(
    "spinner",
    "@keyframes mk-pl-spin{to{transform:rotate(360deg)}}",
  );

  const el = document.createElement("div");
  el.style.cssText = [
    `width:${size}px`,
    `height:${size}px`,
    "border-radius:50%",
    `border:${thickness}px solid ${str(cfg.trackColor, "#ffffff26")}`,
    `border-top-color:${str(cfg.ringColor, "#ffffff")}`,
    "box-sizing:border-box",
    `animation:mk-pl-spin ${1 / speed}s linear infinite`,
  ].join(";");
  visual.appendChild(el);
  return {};
}

// ── 2. Progress Bar ───────────────────────────────────────────
function progressBar({ visual }, cfg) {
  const track = document.createElement("div");
  track.style.cssText = [
    `width:${num(cfg.barWidth, 240)}px`,
    "max-width:80vw",
    `height:${num(cfg.barHeight, 4)}px`,
    `background:${str(cfg.trackColor, "#ffffff26")}`,
    `border-radius:${num(cfg.radius, 4)}px`,
    "overflow:hidden",
  ].join(";");

  const fill = document.createElement("div");
  fill.style.cssText = [
    "width:0%",
    "height:100%",
    `background:${str(cfg.barColor, "#ffffff")}`,
    "border-radius:inherit",
    "transition:width .12s linear",
  ].join(";");
  track.appendChild(fill);
  visual.appendChild(track);

  return {
    tick(p) {
      fill.style.width = `${Math.round(p * 100)}%`;
    },
  };
}

// ── 3. Number Counter ─────────────────────────────────────────
function counter({ visual }, cfg) {
  const from = num(cfg.countFrom, 0);
  const to = num(cfg.countTo, 100);
  const suffix = typeof cfg.suffix === "string" ? cfg.suffix : "%";

  const el = document.createElement("div");
  el.style.cssText = [
    `font-size:${num(cfg.fontSize, 72)}px`,
    `font-weight:${str(cfg.fontWeight, "700")}`,
    `color:${str(cfg.color, "#ffffff")}`,
    "line-height:1",
    "font-variant-numeric:tabular-nums",
  ].join(";");
  el.textContent = `${Math.round(from)}${suffix}`;
  visual.appendChild(el);

  return {
    tick(p) {
      el.textContent = `${Math.round(from + (to - from) * p)}${suffix}`;
    },
  };
}

// ── 4. Logo Pulse ─────────────────────────────────────────────
// Breathes the branding logo when one is configured; falls back to a dot so the preset is
// never an empty screen.
function logoPulse({ visual, content }, cfg) {
  const scale = num(cfg.pulseScale, 1.12);
  const dur = Math.max(0.2, num(cfg.pulseDuration, 1.1));

  injectCss(
    "logopulse",
    `@keyframes mk-pl-pulse{0%,100%{transform:scale(1)}50%{transform:scale(${scale})}}`,
  );

  const target = content.querySelector(".mk-pl-logo");
  if (target) {
    target.style.animation = `mk-pl-pulse ${dur}s ease-in-out infinite`;
    if (cfg.glow) {
      target.style.filter = `drop-shadow(0 0 24px ${str(cfg.glowColor, "#ffffff66")})`;
    }
    return {};
  }

  const dot = document.createElement("div");
  dot.style.cssText = [
    "width:56px",
    "height:56px",
    "border-radius:50%",
    "background:#ffffff",
    `animation:mk-pl-pulse ${dur}s ease-in-out infinite`,
    cfg.glow
      ? `box-shadow:0 0 32px ${str(cfg.glowColor, "#ffffff66")}`
      : "",
  ]
    .filter(Boolean)
    .join(";");
  visual.appendChild(dot);
  return {};
}

// ── 5. Curtain Reveal ─────────────────────────────────────────
// The panels ARE the cover, so this preset supplies its own exit animation.
function curtainReveal({ root }, cfg) {
  const count = Math.max(1, Math.min(12, num(cfg.panelCount, 3)));
  const color = str(cfg.panelColor, "#0a0a0a");
  const direction = str(cfg.direction, "up");
  const stagger = Math.max(0, num(cfg.panelStagger, 0.08));
  const vertical = direction === "up" || direction === "down";

  const layer = document.createElement("div");
  layer.style.cssText = "position:absolute;inset:0;z-index:-1;display:flex;" +
    (vertical ? "flex-direction:row" : "flex-direction:column");

  const panels = [];
  for (let i = 0; i < count; i++) {
    const panel = document.createElement("div");
    panel.style.cssText = `flex:1 1 auto;background:${color}`;
    layer.appendChild(panel);
    panels.push(panel);
  }
  root.style.background = "transparent";
  root.appendChild(layer);

  const offset = {
    up: "translateY(-101%)",
    down: "translateY(101%)",
    left: "translateX(-101%)",
    right: "translateX(101%)",
  }[direction] || "translateY(-101%)";

  return {
    revealOverride(_root, reveal, done) {
      const gsap = typeof window !== "undefined" ? window.gsap : null;
      const dur = reveal.duration;
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        done();
      };

      if (gsap) {
        const vars = { duration: dur, ease: reveal.ease, stagger };
        if (vertical) vars.yPercent = direction === "up" ? -101 : 101;
        else vars.xPercent = direction === "left" ? -101 : 101;
        gsap.to(panels, { ...vars, onComplete: finish });
        setTimeout(finish, (dur + stagger * count) * 1000 + 200);
        return;
      }

      panels.forEach((panel, i) => {
        panel.style.transition = `transform ${dur}s ease-in-out ${i * stagger}s`;
      });
      requestAnimationFrame(() => {
        panels.forEach((panel) => {
          panel.style.transform = offset;
        });
      });
      setTimeout(finish, (dur + stagger * count) * 1000 + 80);
    },
  };
}

// ── 6. Bouncing Dots ──────────────────────────────────────────
function dots({ visual }, cfg) {
  const count = Math.max(1, Math.min(10, num(cfg.dotCount, 3)));
  const size = num(cfg.dotSize, 12);
  const gap = num(cfg.gap, 14);
  const height = num(cfg.bounceHeight, 18);
  const dur = Math.max(0.1, num(cfg.bounceDuration, 0.5));

  injectCss(
    "dots",
    `@keyframes mk-pl-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-${height}px)}}`,
  );

  const row = document.createElement("div");
  row.style.cssText = `display:flex;align-items:flex-end;gap:${gap}px;height:${size + height}px`;
  for (let i = 0; i < count; i++) {
    const dot = document.createElement("div");
    dot.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      "border-radius:50%",
      `background:${str(cfg.dotColor, "#ffffff")}`,
      `animation:mk-pl-bounce ${dur * 2}s ease-in-out ${(i * dur) / count}s infinite`,
    ].join(";");
    row.appendChild(dot);
  }
  visual.appendChild(row);
  return {};
}

// ── 7. Wave Bars ──────────────────────────────────────────────
function waveBars({ visual }, cfg) {
  const count = Math.max(2, Math.min(16, num(cfg.barCount, 5)));
  const width = num(cfg.barWidth, 6);
  const gap = num(cfg.gap, 6);
  const maxHeight = num(cfg.maxHeight, 48);
  const dur = Math.max(0.2, num(cfg.waveDuration, 0.9));

  injectCss(
    "wavebars",
    "@keyframes mk-pl-wave{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}",
  );

  const row = document.createElement("div");
  row.style.cssText = `display:flex;align-items:center;gap:${gap}px;height:${maxHeight}px`;
  for (let i = 0; i < count; i++) {
    const bar = document.createElement("div");
    bar.style.cssText = [
      `width:${width}px`,
      `height:${maxHeight}px`,
      `background:${str(cfg.barColor, "#ffffff")}`,
      "border-radius:2px",
      `animation:mk-pl-wave ${dur}s ease-in-out ${(i * dur) / count / 2}s infinite`,
    ].join(";");
    row.appendChild(bar);
  }
  visual.appendChild(row);
  return {};
}

// ── 8. Circle Fill ────────────────────────────────────────────
const FILL_DIRECTION = {
  center: "circle at 50% 50%",
  top: "to bottom",
  bottom: "to top",
  left: "to right",
  right: "to left",
};

function circleFill({ visual }, cfg) {
  const size = num(cfg.circleSize, 120);
  const fillColor = str(cfg.fillColor, "#ffffff");
  const trackColor = str(cfg.trackColor, "#ffffff26");
  const origin = str(cfg.origin, "center");

  const el = document.createElement("div");
  el.style.cssText = [
    `width:${size}px`,
    `height:${size}px`,
    "border-radius:50%",
    `background:${trackColor}`,
    "overflow:hidden",
    "position:relative",
    cfg.showRing === false ? "" : `box-shadow:inset 0 0 0 2px ${fillColor}`,
  ]
    .filter(Boolean)
    .join(";");

  const fill = document.createElement("div");
  const isRadial = origin === "center";
  fill.style.cssText = [
    "position:absolute",
    "inset:0",
    `background:${fillColor}`,
    "transition:clip-path .12s linear,transform .12s linear",
  ].join(";");
  if (isRadial) fill.style.clipPath = "circle(0% at 50% 50%)";
  else {
    const axis =
      origin === "top" || origin === "bottom" ? "scaleY" : "scaleX";
    fill.style.transformOrigin = FILL_DIRECTION[origin] || "bottom";
    fill.style.transform = `${axis}(0)`;
    fill.dataset.axis = axis;
  }
  el.appendChild(fill);
  visual.appendChild(el);

  return {
    tick(p) {
      if (isRadial) {
        fill.style.clipPath = `circle(${Math.round(p * 71)}% at 50% 50%)`;
        return;
      }
      fill.style.transform = `${fill.dataset.axis}(${p})`;
    },
  };
}

// ── 9. Text Reveal ────────────────────────────────────────────
function textReveal({ visual }, cfg) {
  const text = str(cfg.text, "Loading");
  const mode = str(cfg.mode, "stagger");
  const stagger = Math.max(0, num(cfg.staggerAmount, 0.05));

  const wrap = document.createElement("div");
  wrap.style.cssText = [
    `font-size:${num(cfg.fontSize, 42)}px`,
    `font-weight:${str(cfg.fontWeight, "700")}`,
    `letter-spacing:${num(cfg.letterSpacing, 0.2)}em`,
    `color:${str(cfg.color, "#ffffff")}`,
    "line-height:1.1",
    "position:relative",
    "white-space:pre-wrap",
  ].join(";");

  if (mode === "mask") {
    injectCss(
      "textmask",
      "@keyframes mk-pl-maskwipe{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}",
    );
    wrap.textContent = text;
    wrap.style.animation = `mk-pl-maskwipe ${Math.max(0.4, text.length * stagger)}s ease-in-out infinite alternate`;
    visual.appendChild(wrap);
    return {};
  }

  // typewriter + stagger both need per-character spans.
  const chars = Array.from(text);
  const spans = chars.map((ch) => {
    const span = document.createElement("span");
    span.textContent = ch === " " ? " " : ch;
    span.style.display = "inline-block";
    return span;
  });

  if (mode === "typewriter") {
    spans.forEach((s) => {
      s.style.opacity = "0";
    });
    spans.forEach((s) => wrap.appendChild(s));
    visual.appendChild(wrap);
    return {
      tick(p) {
        const shown = Math.round(p * spans.length);
        for (let i = 0; i < spans.length; i++) {
          spans[i].style.opacity = i < shown ? "1" : "0";
        }
      },
    };
  }

  injectCss(
    "textstagger",
    "@keyframes mk-pl-letter{0%,100%{transform:translateY(0);opacity:.45}50%{transform:translateY(-8px);opacity:1}}",
  );
  spans.forEach((s, i) => {
    s.style.animation = `mk-pl-letter 1.4s ease-in-out ${i * stagger}s infinite`;
    wrap.appendChild(s);
  });
  visual.appendChild(wrap);
  return {};
}

// ── 10. Morph Blob ────────────────────────────────────────────
// Pure CSS border-radius morphing — deliberately independent of the MorphSVG plugin so
// the preset works regardless of which GSAP plugins a site has enabled.
function morphBlob({ visual }, cfg) {
  const size = num(cfg.blobSize, 120);
  const speed = Math.max(0.2, num(cfg.morphSpeed, 1));
  const blur = num(cfg.blur, 0);

  injectCss(
    "morphblob",
    "@keyframes mk-pl-morph{0%,100%{border-radius:42% 58% 63% 37%/41% 44% 56% 59%}" +
      "34%{border-radius:66% 34% 38% 62%/58% 63% 37% 42%}" +
      "67%{border-radius:38% 62% 55% 45%/62% 38% 62% 38%}}",
  );

  const el = document.createElement("div");
  el.style.cssText = [
    `width:${size}px`,
    `height:${size}px`,
    `background:${str(cfg.blobColor, "#ffffff")}`,
    `animation:mk-pl-morph ${4 / speed}s ease-in-out infinite`,
    blur > 0 ? `filter:blur(${blur}px)` : "",
  ]
    .filter(Boolean)
    .join(";");
  visual.appendChild(el);
  return {};
}

const BUILDERS = {
  progressRing,
  gradientOrb,
  strokeFill,
  glitchText,
  spinner,
  progressBar,
  counter,
  logoPulse,
  curtainReveal,
  dots,
  waveBars,
  circleFill,
  textReveal,
  morphBlob,
};

/**
 * Build a preset's visual. Unknown keys fall back to the progress ring rather than
 * rendering nothing — a bare cover with no motion reads as a hung page.
 */
export function buildPreset(key, ctx, cfg) {
  const builder = BUILDERS[key] || BUILDERS.progressRing;
  try {
    return builder(ctx, cfg || {}) || {};
  } catch (e) {
    return {};
  }
}

export const PRESET_KEYS = Object.keys(BUILDERS);
