import {
  eventToKeyCombination,
  normalizeKeyCombination,
} from "@/lib/editor/core/iframe_events/keyboardEvents";
import { useEffect, useRef } from "react";

export function useKeyboardTrigger(combination, callback) {
  const callbackRef = useRef(callback);

  // keep callback fresh
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!combination) return;
    const targetCombo = normalizeKeyCombination(combination);
    const handler = (event) => {
      const pressedCombo = eventToKeyCombination(event);

      if (pressedCombo === targetCombo) {
        callbackRef.current(event);
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [combination]);
}
