import { useEffect } from "react";
import { examConfig } from "@/config/exam.config";
import { useExam } from "@/store/examStore";

/**
 * Writes the attempt to localStorage every `autosaveIntervalMs` (3 s) when
 * something changed, and immediately when the tab is hidden or closed.
 */
export function useAutosave() {
  useEffect(() => {
    const tick = () => {
      const { rev, savedRev, attempt, persistNow } = useExam.getState();
      if (attempt && rev !== savedRev) persistNow();
    };
    const id = window.setInterval(tick, examConfig.autosaveIntervalMs);
    const flush = () => {
      if (useExam.getState().attempt) useExam.getState().persistNow();
    };
    const onVis = () => document.visibilityState === "hidden" && flush();
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
}
