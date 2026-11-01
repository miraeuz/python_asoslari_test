import { difficultyLabel } from "@/lib/format";
import type { Difficulty as D } from "@/data/schema";
import { cn } from "@/lib/utils";

export function DifficultyDots({ level, className }: { level: D; className?: string }) {
  const n = level === "easy" ? 1 : level === "medium" ? 2 : 3;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground", className)} title={difficultyLabel[level]}>
      <span className="flex gap-[3px]" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-2.5 w-1 rounded-full",
              i <= n ? (n === 1 ? "bg-success" : n === 2 ? "bg-warning" : "bg-destructive") : "bg-border",
            )}
          />
        ))}
      </span>
      {difficultyLabel[level]}
    </span>
  );
}
