import { useEffect, useRef } from "react";
import { isTypingTarget } from "@/lib/utils";

export type HotkeyMap = Record<string, (e: KeyboardEvent) => void>;

/**
 * Keys are matched against `e.key` (case-insensitive). Ignored while typing
 * in inputs, while a modal dialog is open, or with Ctrl/Meta/Alt pressed.
 */
export function useHotkeys(map: HotkeyMap, enabled = true) {
  const ref = useRef(map);
  ref.current = map;
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
      if (isTypingTarget(e.target)) return;
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;
      const fn = ref.current[e.key.toLowerCase()] ?? ref.current[e.key];
      if (fn) {
        e.preventDefault();
        fn(e);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}
