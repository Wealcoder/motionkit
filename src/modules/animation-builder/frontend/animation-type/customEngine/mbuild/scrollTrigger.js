// "default" is an editor sentinel. Omit so ScrollTrigger picks its own default.
function nonDefault(v) {
  return v && v !== "default" ? v : undefined;
}

function parseScrub(s) {
  if (s === "false" || s === false || s == null) return undefined;
  if (s === "true" || s === true) return true;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : true;
}

function parsePin(p) {
  if (p === "false" || p === false || p == null) return undefined;
  if (p === "true" || p === true) return true;
  return p;
}

// Build a GSAP-ready ScrollTrigger config object from the editor's per-device
// cfg. fallbackTrigger is used when cfg.trigger is "default" — typically the
// first animated selector in the routed timeline.
export function buildScrollTriggerConfig(cfg, fallbackTrigger) {
  if (!cfg) return null;
  const out = {};
  const trg = nonDefault(cfg.trigger) || fallbackTrigger;
  if (trg) out.trigger = trg;
  if (cfg.start) out.start = cfg.start;
  if (cfg.end) out.end = cfg.end;
  const endTrg = nonDefault(cfg.endTrigger);
  if (endTrg) out.endTrigger = endTrg;
  const scrub = parseScrub(cfg.scrub);
  if (scrub !== undefined) out.scrub = scrub;
  const pin = parsePin(cfg.pin);
  if (pin !== undefined) out.pin = pin;
  return out;
}
