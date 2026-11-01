import { useEffect, useState } from "react";
import { getHighlighter, loadHighlighter, onHighlighterReady } from "@/lib/highlighter";

/** Returns true once Shiki is ready; triggers loading on first use. */
export function useHighlighterReady() {
  const [ready, setReady] = useState(() => !!getHighlighter());
  useEffect(() => {
    if (ready) return;
    const off = onHighlighterReady(() => setReady(true));
    loadHighlighter().then(() => setReady(true));
    return off;
  }, [ready]);
  return ready;
}
