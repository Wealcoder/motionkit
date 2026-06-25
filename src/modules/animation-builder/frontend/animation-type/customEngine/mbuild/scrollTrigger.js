import { isPreviewMode } from "@/utils/isPreviewMode";

// "default" is an editor sentinel. Omit so ScrollTrigger picks its own default.
export function nonDefault(v) {
  return v && v !== "default" ? v : undefined;
}

// Editor emits `"custom"` as the primary value when the user picks the Custom
// option; the actual value lives on a sibling key (e.g. start → customStart).
function resolveCustomable(cfg, key, customKey) {
  const v = cfg[key];
  return v === "custom" ? cfg[customKey] : v;
}

function parseScrub(s) {
  if (s === "false" || s === false || s == null || s === "") return undefined;
  if (s === "true" || s === true) return true;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : true;
}

function parsePin(p) {
  if (p === "false" || p === false || p == null || p === "") return undefined;
  if (p === "true" || p === true) return true;
  return p;
}

function parseBool(v) {
  if (v == null || v === "") return undefined;
  if (v === true || v === "true") return true;
  if (v === false || v === "false") return false;
  return undefined;
}

function parseNumber(v) {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : undefined;
}

function parseString(v) {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s ? s : undefined;
}

// pinSpacing has no `customPinSpacing` sibling in the editor today, so a bare
// "custom" selection is dropped until/unless a sibling field is added.
function parsePinSpacing(v) {
  if (v == null || v === "") return undefined;
  if (v === "true" || v === true) return true;
  if (v === "false" || v === false) return false;
  if (v === "custom") return undefined;
  return v;
}

// Optional ScrollTrigger properties surfaced via the editor's "Add Properties"
// popover. Each parser returns undefined to skip emission.
const OPTIONAL_PROPS = [
  ["pinSpacing", parsePinSpacing],
  ["pinType", parseString],
  ["pinReparent", parseBool],
  ["toggleClass", parseString],
  ["once", parseBool],
  ["toggleActions", parseString],
  ["anticipatePin", parseNumber],
  ["scroller", parseString],
  ["horizontal", parseBool],
  ["preventOverlaps", parseBool],
  ["fastScrollEnd", parseBool],
  ["invalidateOnRefresh", parseBool],
  ["refreshPriority", parseNumber],
  ["autoRefreshEvents", parseString],
];

// Build a GSAP-ready ScrollTrigger config object from the editor's per-device
// cfg. fallbackTrigger is used when cfg.trigger is "default" — typically the
// first animated selector in the routed timeline.
export function buildScrollTriggerConfig(cfg, fallbackTrigger) {
  if (!cfg) return null;
  const out = {};

  const trg = nonDefault(cfg.trigger) || fallbackTrigger;
  if (trg) out.trigger = trg;

  const start = resolveCustomable(cfg, "start", "customStart");
  if (start) out.start = start;

  const end = resolveCustomable(cfg, "end", "customEnd");
  if (end) out.end = end;

  // endTrigger: "default" → mirror the resolved trigger (GSAP already does
  // this implicitly; making it explicit keeps the emitted config readable).
  // "custom" → customEndTrigger.
  let endTrg;
  if (cfg.endTrigger === "default") endTrg = trg;
  else if (cfg.endTrigger === "custom") endTrg = cfg.customEndTrigger;
  else endTrg = cfg.endTrigger;
  if (endTrg) out.endTrigger = endTrg;

  const scrub = parseScrub(resolveCustomable(cfg, "scrub", "customScrub"));
  if (scrub !== undefined) out.scrub = scrub;

  const pin = parsePin(resolveCustomable(cfg, "pin", "customPin"));
  if (pin !== undefined) out.pin = pin;

  for (const [key, parse] of OPTIONAL_PROPS) {
    const v = parse(cfg[key]);
    if (v !== undefined) out[key] = v;
  }

  // markers are dev-only debug guides: shown only in the editor preview iframe (action=motionkit-editor / mk_token), forced off in full preview and on the published site, regardless of editor cfg / device.
  out.markers = isPreviewMode();

  return out;
}
