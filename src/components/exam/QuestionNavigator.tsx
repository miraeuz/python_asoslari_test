import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, CheckCircle2, Eye, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { examConfig } from "@/config/exam.config";
import { isItemAnswered, partProgress } from "@/lib/results";
import { cn } from "@/lib/utils";
import { itemKey, useExam, useOpenAttempt, type Attempt } from "@/store/examStore";

type Filter = "all" | "unanswered" | "marked";

export type CellKind = "current" | "answered" | "visited" | "unvisited";

/** Visual language shared by the navigator, legend and review screen. */
export const cellClass: Record<CellKind, string> = {
  unvisited: "border-dashed border-border bg-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
  visited: "border-border bg-secondary/80 text-foreground hover:border-foreground/25",
  answered: "border-transparent bg-primary text-primary-foreground",
  current: "border-foreground bg-card text-foreground ring-[0.1875rem] ring-primary/25",
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
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-current={kind === "current" ? "step" : undefined}
      aria-label={label ?? `${number}-savol${answered ? ", javob berilgan" : ""}${marked ? ", belgilangan" : ""}`}
      className={cn(
        "relative grid place-items-center rounded-lg border font-semibold tabular-nums transition-[background-color,border-color,box-shadow,color,transform] duration-150 active:scale-95 disabled:cursor-default",
        size === "md" ? "aspect-square w-full text-[0.75rem]" : "size-8 text-[0.75rem]",
        kind === "current" && answered ? "border-primary bg-primary-soft text-primary ring-[0.1875rem] ring-primary/25" : cellClass[kind],
      )}
    >
      {number}
      {marked && (
        <span className="absolute -right-[0.3rem] -top-[0.3rem] grid size-[0.85rem] place-items-center rounded-full bg-warning text-warning-foreground ring-2 ring-card">
          <Bookmark className="size-[0.5rem] fill-current" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

export function Legend({ className }: { className?: string }) {
  const items: { kind: CellKind | "marked"; label: string }[] = [
    { kind: "current", label: "Joriy" },
    { kind: "answered", label: "Javob" },
    { kind: "visited", label: "Koʻrilgan" },
    { kind: "unvisited", label: "Ochilmagan" },
    { kind: "marked", label: "Belgi" },
  ];
  return (
    <ul className={cn("flex flex-wrap gap-x-3 gap-y-1.5 text-[0.6875rem] text-muted-foreground", className)}>
      {items.map((it) => (
        <li key={it.kind} className="flex items-center gap-1.5">
          {it.kind === "marked" ? (
            <span className="grid size-3 place-items-center rounded-full bg-warning text-warning-foreground">
              <Bookmark className="size-[0.45rem] fill-current" strokeWidth={3} />
            </span>
          ) : (
            <span className={cn("size-3 rounded-[0.2rem] border", cellClass[it.kind], it.kind === "current" && "ring-1")} />
          )}
          {it.label}
        </li>
      ))}
    </ul>
  );
}

export function QuestionNavigator({ onNavigate, onSubmitPart }: { onNavigate?: () => void; onSubmitPart: () => void }) {
  const attempt = useOpenAttempt();
  const goTo = useExam((s) => s.goTo);
  const [filter, setFilter] = useState<Filter>("all");
  const pi = attempt.activePart;
  const part = attempt.parts[pi];
  const cfg = examConfig.parts[pi];
  const prog = partProgress(attempt, pi);
  const inSheet = !!onNavigate;

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "Hammasi", count: prog.total },
    { id: "unanswered", label: "Javobsiz", count: prog.unanswered },
    { id: "marked", label: "Belgi", count: prog.marked },
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
    <div className="flex h-full flex-col gap-3">
      <div>
        <div className={cn("flex items-baseline justify-between text-[0.8125rem]", inSheet && "sr-only")}>
          <h2 className="font-semibold">{cfg.title}</h2>
          <span className="tabular-nums text-muted-foreground">
            {prog.answered}/{prog.total}
          </span>
        </div>
        <div className={cn("h-1 overflow-hidden rounded-full bg-secondary", !inSheet && "mt-2")}>
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            initial={false}
            animate={{ width: `${(prog.answered / Math.max(1, prog.total)) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 22 }}
          />
        </div>
      </div>

      <div role="tablist" aria-label="Filtr" className="grid grid-cols-3 gap-0.5 rounded-lg bg-secondary/70 p-0.5">
        {filters.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-md px-1 py-1 text-[0.6875rem] font-semibold transition-colors",
              filter === f.id ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label} <span className="tabular-nums opacity-60">{f.count}</span>
          </button>
        ))}
      </div>

      <div className={cn("grid gap-1.5", inSheet ? "grid-cols-8 sm:grid-cols-10" : "grid-cols-6")}>
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
          <div className="col-span-full flex flex-col items-center gap-1.5 rounded-lg border border-dashed py-4 text-center text-[0.75rem] text-muted-foreground">
            {filter === "unanswered" ? <CheckCircle2 className="size-4 text-success" /> : <Eye className="size-4" />}
            {filter === "unanswered" ? "Hammasiga javob berilgan" : "Belgilangan savol yoʻq"}
          </div>
        )}
      </div>

      <Legend className="pt-1" />

      <div className="mt-auto pt-2">
        <Button variant="outline" size="sm" className="w-full" onClick={onSubmitPart}>
          <Send /> {cfg.title}ni topshirish
        </Button>
      </div>
    </div>
  );
}
