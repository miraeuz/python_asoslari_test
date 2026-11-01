import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, CheckCircle2, Eye, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { examConfig } from "@/config/exam.config";
import { isItemAnswered, partProgress } from "@/lib/results";
import { cn } from "@/lib/utils";
import { itemKey, useExam, type Attempt } from "@/store/examStore";

type Filter = "all" | "unanswered" | "marked";

export type CellKind = "current" | "answered" | "visited" | "unvisited";

/** Visual language shared by the navigator, legend and review screen. */
export const cellClass: Record<CellKind, string> = {
  unvisited: "border-dashed border-border bg-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
  visited: "border-border bg-secondary/80 text-foreground hover:border-foreground/25",
  answered: "border-transparent bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.6)]",
  current: "border-foreground bg-card text-foreground ring-4 ring-primary/20",
};

export function cellKind(a: Attempt, pi: number, idx: number): CellKind {
  const part = a.parts[pi];
  const id = part.itemIds[idx];
  if (pi === a.activePart && idx === part.cursor) return "current";
  if (isItemAnswered(a, pi, id)) return "answered";
  if (a.visited[itemKey(part.id, id)]) return "visited";
  return "unvisited";
}

export function NavCell({
  number,
  kind,
  marked,
  answered,
  onClick,
  size = "md",
  label,
}: {
  number: number;
  kind: CellKind;
  marked: boolean;
  answered: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
  label?: string;
}) {
  return (
    <motion.button
      type="button"
      layout="position"
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      disabled={!onClick}
      aria-current={kind === "current" ? "step" : undefined}
      aria-label={label ?? `${number}-savol${answered ? ", javob berilgan" : ""}${marked ? ", belgilangan" : ""}`}
      className={cn(
        "relative grid place-items-center rounded-[10px] border text-[13px] disabled:cursor-default font-semibold tabular-nums transition-[background-color,border-color,box-shadow,color] duration-200",
        size === "md" ? "h-11 w-full" : "size-9",
        kind === "current" && answered ? "border-primary bg-primary-soft text-primary ring-4 ring-primary/20" : cellClass[kind],
      )}
    >
      {number}
      {marked && (
        <span className="absolute -right-1 -top-1 grid size-[15px] place-items-center rounded-full bg-warning text-warning-foreground shadow ring-2 ring-card">
          <Bookmark className="size-2.5 fill-current" strokeWidth={3} />
        </span>
      )}
    </motion.button>
  );
}

export function Legend({ className }: { className?: string }) {
  const items: { kind: CellKind | "marked"; label: string }[] = [
    { kind: "current", label: "Joriy" },
    { kind: "answered", label: "Javob berilgan" },
    { kind: "visited", label: "Koʻrilgan" },
    { kind: "unvisited", label: "Ochilmagan" },
    { kind: "marked", label: "Belgilangan" },
  ];
  return (
    <ul className={cn("grid grid-cols-2 gap-x-3 gap-y-2 text-[12px] text-muted-foreground", className)}>
      {items.map((it) => (
        <li key={it.kind} className="flex items-center gap-2">
          {it.kind === "marked" ? (
            <span className="grid size-4 place-items-center rounded-full bg-warning text-warning-foreground">
              <Bookmark className="size-2.5 fill-current" strokeWidth={3} />
            </span>
          ) : (
            <span className={cn("size-4 rounded-[5px] border", cellClass[it.kind], it.kind === "current" && "ring-2")} />
          )}
          {it.label}
        </li>
      ))}
    </ul>
  );
}

export function QuestionNavigator({ onNavigate, onSubmitPart }: { onNavigate?: () => void; onSubmitPart: () => void }) {
  const attempt = useExam((s) => s.attempt)!;
  const goTo = useExam((s) => s.goTo);
  const [filter, setFilter] = useState<Filter>("all");
  const pi = attempt.activePart;
  const part = attempt.parts[pi];
  const cfg = examConfig.parts[pi];
  const prog = partProgress(attempt, pi);

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "Hammasi", count: prog.total },
    { id: "unanswered", label: "Javobsiz", count: prog.unanswered },
    { id: "marked", label: "Belgilangan", count: prog.marked },
  ];

  const visible = part.itemIds
    .map((id, idx) => ({ id, idx }))
    .filter(({ id }) => {
      const key = itemKey(part.id, id);
      if (filter === "unanswered") return !isItemAnswered(attempt, pi, id);
      if (filter === "marked") return !!attempt.marked[key];
      return true;
    });

  return (
    <div className="flex h-full flex-col gap-5">
      <div>
        <div className={cn("flex items-baseline justify-between", onNavigate && "sr-only")}>
          <h2 className="text-sm font-semibold">{cfg.title} · Navigator</h2>
          <span className="text-xs tabular-nums text-muted-foreground">
            {prog.answered}/{prog.total}
          </span>
        </div>
        <div className={cn("h-1.5 overflow-hidden rounded-full bg-secondary", !onNavigate && "mt-3")}>
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            initial={false}
            animate={{ width: `${(prog.answered / Math.max(1, prog.total)) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 22 }}
          />
        </div>
      </div>

      <div role="tablist" aria-label="Filtr" className="grid grid-cols-3 gap-1 rounded-xl bg-secondary/70 p-1">
        {filters.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "relative rounded-lg px-2 py-1.5 text-[12px] font-semibold transition-colors",
              filter === f.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {filter === f.id && (
              <motion.span layoutId={`nav-filter-${onNavigate ? "sheet" : "side"}`} className="absolute inset-0 rounded-lg bg-card shadow-soft" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
            )}
            <span className="relative">
              {f.label} <span className="tabular-nums opacity-60">{f.count}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5">
        {visible.map(({ id, idx }) => {
          const key = itemKey(part.id, id);
          return (
            <NavCell
              key={id}
              number={idx + 1}
              kind={cellKind(attempt, pi, idx)}
              answered={isItemAnswered(attempt, pi, id)}
              marked={!!attempt.marked[key]}
              onClick={() => {
                goTo(idx);
                onNavigate?.();
              }}
            />
          );
        })}
        {visible.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-2 rounded-xl border border-dashed py-6 text-center text-sm text-muted-foreground">
            {filter === "unanswered" ? <CheckCircle2 className="size-5 text-success" /> : <Eye className="size-5" />}
            {filter === "unanswered" ? "Barcha savollarga javob berdingiz" : "Belgilangan savol yoʻq"}
          </div>
        )}
      </div>

      <Legend className="rounded-xl border bg-card/60 p-3" />

      <div className="mt-auto pb-1">
        <Button variant="outline" className="w-full" onClick={onSubmitPart}>
          <Send /> {cfg.title}ni topshirish
        </Button>
      </div>
    </div>
  );
}
