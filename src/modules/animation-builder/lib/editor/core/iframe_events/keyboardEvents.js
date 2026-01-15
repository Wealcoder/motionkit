import { keybordTriggerControl } from "@/register/event/keybordTriggerRegister";

// main keyboard trigger (for iframe)
export function handleIframeKeyboardEvent(event) {
  const pressetKeys = eventToKeyCombination(event);
  // sending message to editor (react)
  window.parent.postMessage(
    {
      type: "WCF_AB_KEYDOWN_EVENT",
      value: pressetKeys,
    },
    "*"
  );
}

// normalized keyboard key combination
export function normalizeKeyCombination(combo) {
  return combo.toLowerCase().replace(/\s+/g, "").split("+").sort().join("+");
}

// check meta key for keyboard combination
export function eventToKeyCombination(event) {
  const keys = [];

  if (event.ctrlKey) keys.push("ctrl");
  if (event.shiftKey) keys.push("shift");
  if (event.altKey) keys.push("alt");
  if (event.metaKey) keys.push("meta");

  const key = event.key.toLowerCase();

  // ignore modifier-only presses
  if (!["control", "shift", "alt", "meta"].includes(key)) {
    keys.push(key);
  }

  return keys.sort().join("+");
}

// validating key inside react (editor)
export function validateKeyCombination(keys, actions) {
  if (!keys || !actions) return;
  const normalizedKeys = normalizeKeyCombination(keys);
  for (const combo in keybordTriggerControl) {
    if (normalizeKeyCombination(combo) === normalizedKeys) {
      const action = keybordTriggerControl[combo];
      if (action && actions[action]) {
        actions[action]();
      }
      break;
    }
  }
}
