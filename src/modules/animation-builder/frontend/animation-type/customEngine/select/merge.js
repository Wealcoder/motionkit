export function pickDeviceConfig(bag, deviceKey) {
  if (!bag || typeof bag !== "object") return null;
  return bag[deviceKey] || null;
}

// Editor emits step.vars in method-specific envelope:
//   from/to/set  →  { from: {...} } / { to: {...} } / { set: {...} }
//   fromTo       →  { from: {...}, to: {...} }
//   call         →  { call: { fn, args } } or raw
// Returns the unwrapped GSAP-ready vars, or null when nothing meaningful.
export function normalizeStepVars(step) {
  if (!step) return null;
  const v = step.vars || {};
  switch (step.method) {
    case "from":
    case "to":
    case "set": {
      const vars = v[step.method] || {};
      return Object.keys(vars).length ? vars : null;
    }
    case "fromTo": {
      const from = v.from || {};
      const to = v.to || {};
      if (!Object.keys(from).length && !Object.keys(to).length) return null;
      return { from, to };
    }
    case "call":
      return v.call || v;
    case "scrollTo":
      const vars = v[step.method] || v;
      return vars && Object.keys(vars).length ? vars : { autoKill: true };
    default: {
      const vars = v[step.method] || v;
      return vars && Object.keys(vars).length ? vars : null;
    }
  }
}
