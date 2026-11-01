import { create } from "zustand";
import { persist } from "zustand/middleware";
import { examConfig } from "@/config/exam.config";

export type ThemeMode = "light" | "dark" | "system";
export type Palette = "indigo" | "mirae" | "forest";

export const palettes: { id: Palette; name: string; swatch: [string, string] }[] = [
  { id: "indigo", name: "Indigo", swatch: ["#4f46e5", "#14b8a6"] },
  { id: "mirae", name: "Mirae", swatch: ["#2b5cff", "#0d9488"] },
  { id: "forest", name: "Oʻrmon", swatch: ["#0f7a55", "#e8930c"] },
];

interface PrefsState {
  mode: ThemeMode;
  palette: Palette;
  sidebarCollapsed: boolean;
  setMode(m: ThemeMode): void;
  setPalette(p: Palette): void;
  toggleSidebar(): void;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      mode: "system",
      palette: "indigo",
      sidebarCollapsed: false,
      setMode: (mode) => set({ mode }),
      setPalette: (palette) => set({ palette }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: examConfig.storage.prefsKey,
      // flat shape so the inline script in index.html can read it before React mounts
      storage: {
        getItem: (name) => {
          try {
            const v = localStorage.getItem(name);
            return v ? { state: JSON.parse(v), version: 0 } : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value.state));
          } catch {
            /* storage unavailable — prefs stay in memory */
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch {
            /* ignore */
          }
        },
      },
    },
  ),
);
