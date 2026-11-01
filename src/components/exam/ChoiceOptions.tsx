import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { RichInline } from "@/components/code/RichText";
import type { Question } from "@/data/schema";
import type { Answer } from "@/lib/grading";
import { cn } from "@/lib/utils";

export const letterAt = (i: number) => String.fromCharCode(65 + i);

/** How option text should look: inline-code aware, monospace for program outputs. */
export function OptionText({ q, text }: { q: Question; text: string }) {
  if (text.includes("`")) return <RichInline text={text} className="whitespace-pre-wrap" />;
  const looksLikeOutput = !!q.code && !/\s(xatosi|chiqadi|chiqmaydi)\b/.test(text) && !/^(Boʻsh qator)/.test(text);
  return <span className={cn("whitespace-pre-wrap break-words", looksLikeOutput && "font-mono text-[0.95em]")}>{text}</span>;
}

export function ChoiceOptions({
  q,
  order,
  answer,
  onChange,
  idPrefix,
}: {
  q: Question;
  order: string[];
  answer: Answer | undefined;
  onChange: (a: Answer | null) => void;
  idPrefix: string;
}) {
  const multi = q.type === "multiple_choice";
  const selected = new Set(answer?.kind === "multi" ? answer.values : answer?.kind === "choice" ? [answer.value] : []);
  const byKey = new Map(q.options.map((o) => [o.key, o]));

  const toggle = (key: string) => {
    if (!multi) {
      onChange(selected.has(key) ? null : { kind: "choice", value: key });
      return;
    }
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next.size ? { kind: "multi", values: [...next] } : null);
  };

  return (
    <div role={multi ? "group" : "radiogroup"} aria-label="Javob variantlari" className="grid gap-3">
      {multi && (
        <p className="-mb-1 text-[13px] font-medium text-muted-foreground">Bir nechta toʻgʻri javobni belgilang</p>
      )}
      {order.map((key, i) => {
        const opt = byKey.get(key)!;
        const on = selected.has(key);
        return (
          <motion.button
            key={key}
            type="button"
            role={multi ? "checkbox" : "radio"}
            aria-checked={on}
            onClick={() => toggle(key)}
            whileTap={{ scale: 0.992 }}
            className={cn(
              "group relative flex w-full items-start gap-4 rounded-2xl border bg-card p-4 text-left text-[15.5px] leading-relaxed transition-[border-color,box-shadow,transform] duration-200 sm:p-[1.125rem]",
              on
                ? "border-primary/70 shadow-[0_0_0_1px_hsl(var(--primary)/0.5),0_10px_28px_-14px_hsl(var(--primary)/0.55)]"
                : "border-border hover:-translate-y-px hover:border-foreground/20 hover:shadow-soft",
            )}
          >
            {on && !multi && (
              <motion.span
                layoutId={`${idPrefix}-choice`}
                className="absolute inset-0 rounded-2xl bg-primary-soft/70"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            {on && multi && <span className="absolute inset-0 rounded-2xl bg-primary-soft/70" />}
            <span
              className={cn(
                "relative grid size-8 shrink-0 place-items-center border text-[13px] font-bold transition-colors",
                multi ? "rounded-lg" : "rounded-full",
                on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary/60 text-muted-foreground group-hover:text-foreground",
              )}
            >
              {on ? (
                <motion.span initial={{ scale: 0.4, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 600, damping: 22 }}>
                  <Check className="size-4" strokeWidth={3} />
                </motion.span>
              ) : (
                letterAt(i)
              )}
            </span>
            <span className="relative min-w-0 flex-1 pt-[3px] text-foreground">
              <OptionText q={q} text={opt.text} />
            </span>
            <span className="relative hidden pt-1 font-mono text-[11px] text-muted-foreground/60 sm:block">{letterAt(i)}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
