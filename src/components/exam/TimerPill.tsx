import { motion } from "framer-motion";
import { Timer } from "lucide-react";
import { formatClock } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Live countdown. Calm by default, amber under 10 min, red and pulsing under 2 min. */
export function TimerPill({ remainingMs, totalMs, compact }: { remainingMs: number; totalMs: number; compact?: boolean }) {
  const warn = remainingMs <= 10 * 60_000;
  const danger = remainingMs <= 2 * 60_000;
  const frac = totalMs ? remainingMs / totalMs : 0;
  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`Qolgan vaqt ${formatClock(remainingMs)}`}
      className={cn(
        "relative flex h-10 items-center gap-2 overflow-hidden rounded-full border px-3.5 font-mono text-[15px] font-semibold tabular-nums transition-colors",
        danger
          ? "border-destructive/40 bg-destructive-soft text-destructive"
          : warn
            ? "border-warning/40 bg-warning-soft text-warning"
            : "border-border bg-card/80 text-foreground",
      )}
    >
      <motion.span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 opacity-[0.09]", danger ? "bg-destructive" : warn ? "bg-warning" : "bg-primary")}
        initial={false}
        animate={{ width: `${frac * 100}%` }}
        transition={{ ease: "linear", duration: 1 }}
      />
      <Timer className={cn("relative size-4", danger && "animate-pulse-dot")} />
      <span className="relative">{formatClock(remainingMs)}</span>
      {!compact && <span className="relative hidden font-sans text-xs font-medium text-muted-foreground xl:inline">qoldi</span>}
    </div>
  );
}
