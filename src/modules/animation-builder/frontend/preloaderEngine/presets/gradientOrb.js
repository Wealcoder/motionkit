import { injectCss, num, str } from "./shared.js";

// ── Gradient Orb ──────────────────────────────────────────────
// Conic gradient sweeping around a sphere, with an optional bloom. Deliberately pure CSS
// — no canvas, no SVG filter — so it stays cheap on a phone that is still loading.
export default function gradientOrb({ visual }, cfg) {
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
