import { Keyboard, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Tip } from "@/components/ui/tooltip";
import { examConfig } from "@/config/exam.config";
import { usePrefs } from "@/store/prefsStore";
import { SaveIndicator } from "./SaveIndicator";
import { ThemeMenu } from "./ThemeMenu";
import { TimerPill } from "./TimerPill";

export function ExamHeader({
  partIndex,
  answered,
  total,
  remainingMs,
  onShortcuts,
}: {
  partIndex: number;
  answered: number;
  total: number;
  remainingMs: number;
  onShortcuts: () => void;
}) {
  const cfg = examConfig.parts[partIndex];
  const { sidebarCollapsed, toggleSidebar } = usePrefs();
  const left = total - answered;
  return (
    <header className="glass sticky top-0 z-40 border-b border-border/70">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <Tip label={sidebarCollapsed ? "Navigatorni ochish (N)" : "Navigatorni yigʻish (N)"}>
            <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={toggleSidebar} aria-label="Savollar navigatori">
              {sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
          </Tip>
          <Logo compact className="sm:hidden" />
          <Logo className="hidden sm:flex" />
        </div>

        <div className="mx-auto hidden min-w-0 items-center gap-2 md:flex">
          <div className="flex items-center gap-1 rounded-full border bg-card/70 p-1">
            {examConfig.parts.map((p, i) => (
              <span
                key={p.id}
                className={
                  i === partIndex
                    ? "rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background"
                    : "rounded-full px-3 py-1 text-xs font-medium text-muted-foreground"
                }
              >
                {p.title}
              </span>
            ))}
          </div>
          <span className="hidden truncate text-sm text-muted-foreground xl:inline">{cfg.subtitle}</span>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <SaveIndicator />
          <TimerPill remainingMs={remainingMs} totalMs={cfg.durationMinutes * 60_000} />
          <Tip label={`${answered} ta javob berildi, ${left} ta qoldi`}>
            <div className="flex h-10 items-center gap-2 rounded-full border bg-card/80 pl-1 pr-3">
              <ProgressRing value={total ? answered / total : 0} size={32} stroke={3.5}>
                <span className="text-[10px] font-bold tabular-nums">{Math.round((answered / Math.max(1, total)) * 100)}</span>
              </ProgressRing>
              <div className="leading-none">
                <div className="text-[13px] font-semibold tabular-nums">
                  {answered}/{total}
                </div>
                <div className="mt-0.5 hidden text-[10.5px] text-muted-foreground sm:block">{left} ta qoldi</div>
              </div>
            </div>
          </Tip>
          <Tip label="Klaviatura yorliqlari (?)">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={onShortcuts} aria-label="Klaviatura yorliqlari">
              <Keyboard />
            </Button>
          </Tip>
          <ThemeMenu />
        </div>
      </div>
    </header>
  );
}
