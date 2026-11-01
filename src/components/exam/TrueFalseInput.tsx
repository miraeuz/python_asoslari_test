import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { Answer } from "@/lib/grading";
import { cn } from "@/lib/utils";

export function TrueFalseInput({ answer, onChange, idPrefix }: { answer: Answer | undefined; onChange: (a: Answer | null) => void; idPrefix: string }) {
  const value = answer?.kind === "choice" ? answer.value : undefined;
  const items = [
    { v: "True", label: "Toʻgʻri", hint: "T", icon: Check, tone: "success" as const },
    { v: "False", label: "Notoʻgʻri", hint: "F", icon: X, tone: "destructive" as const },
  ];
  return (
    <div role="radiogroup" aria-label="Toʻgʻri yoki notoʻgʻri" className="grid grid-cols-2 gap-3">
      {items.map((it) => {
        const on = value === it.v;
        return (
          <motion.button
            key={it.v}
            type="button"
            role="radio"
            aria-checked={on}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(on ? null : { kind: "choice", value: it.v })}
            className={cn(
              "relative flex flex-col items-center gap-3 rounded-2xl border bg-card px-4 py-6 text-base font-semibold transition-[border-color,box-shadow] sm:py-8",
              on
                ? it.tone === "success"
                  ? "border-success/70 shadow-[0_0_0_1px_hsl(var(--success)/0.5)]"
                  : "border-destructive/70 shadow-[0_0_0_1px_hsl(var(--destructive)/0.5)]"
                : "hover:border-foreground/20 hover:shadow-soft",
            )}
          >
            {on && (
              <motion.span
                layoutId={`${idPrefix}-tf`}
                className={cn("absolute inset-0 rounded-2xl", it.tone === "success" ? "bg-success-soft" : "bg-destructive-soft")}
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span
              className={cn(
                "relative grid size-12 place-items-center rounded-full border transition-colors",
                on ? (it.tone === "success" ? "border-success bg-success text-success-foreground" : "border-destructive bg-destructive text-destructive-foreground") : "bg-secondary text-muted-foreground",
              )}
            >
              <it.icon className="size-6" strokeWidth={2.6} />
            </span>
            <span className="relative">{it.label}</span>
            <span className="relative font-mono text-[11px] font-medium text-muted-foreground/70">{it.hint}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
