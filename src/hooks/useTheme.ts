import { useEffect, useState } from "react";
import { usePrefs } from "@/store/prefsStore";

const query = "(prefers-color-scheme: dark)";

export function useResolvedDark() {
  const mode = usePrefs((s) => s.mode);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const fn = () => setSystemDark(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return mode === "dark" || (mode === "system" && systemDark);
}

/** Applies `.dark` and `data-palette` on <html>. */
export function useApplyTheme() {
  const dark = useResolvedDark();
  const palette = usePrefs((s) => s.palette);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.dataset.palette = palette;
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", dark ? "#0b0d17" : "#f6f5f2"));
  }, [dark, palette]);
}
