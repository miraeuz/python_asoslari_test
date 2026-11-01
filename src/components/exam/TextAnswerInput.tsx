import { useEffect, useRef } from "react";
import { PenLine, TerminalSquare } from "lucide-react";
import type { Answer } from "@/lib/grading";
import { cn } from "@/lib/utils";

/** Single-line answer for fill-in-the-blank / code completion. */
export function FillBlankInput({ answer, onChange, id }: { answer: Answer | undefined; onChange: (a: Answer | null) => void; id: string }) {
  const value = answer?.kind === "text" ? answer.value : "";
  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-5">
      <label htmlFor={id} className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
        <PenLine className="size-4" /> Boʻsh joy (<code className="inline-code">____</code>) oʻrniga yoziladigan qism
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value ? { kind: "text", value: e.target.value } : null)}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        placeholder="masalan: sep"
        className="mt-3 h-14 w-full rounded-xl border border-input bg-code-bg px-4 font-mono text-lg tracking-wide text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
      <p className="mt-2.5 text-xs text-muted-foreground">Faqat yetishmayotgan qismni yozing — qoʻshtirnoq yoki qavssiz.</p>
    </div>
  );
}

/** Multi-line "what does it print?" answer, styled as a terminal. */
export function OutputAnswerInput({ answer, onChange, id }: { answer: Answer | undefined; onChange: (a: Answer | null) => void; id: string }) {
  const value = answer?.kind === "text" ? answer.value : "";
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.max(132, el.scrollHeight)}px`;
  }, [value]);
  const lines = value ? value.split("\n").length : 0;
  return (
    <div className="overflow-hidden rounded-2xl border border-code-border bg-code-bg shadow-soft">
      <div className="flex items-center justify-between border-b border-code-border px-4 py-2.5">
        <label htmlFor={id} className="flex items-center gap-2 text-[12.5px] font-semibold text-muted-foreground">
          <TerminalSquare className="size-4 text-accent" /> TERMINAL — dastur natijasi
        </label>
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{lines} qator</span>
      </div>
      <div className="flex">
        <span aria-hidden className="select-none py-3.5 pl-4 font-mono text-[14px] leading-[1.7] text-accent">
          ❯
        </span>
        <textarea
          id={id}
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value ? { kind: "text", value: e.target.value } : null)}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          wrap="off"
          placeholder={"Ekranga chiqadigan natijani aynan yozing.\nHar bir print() — yangi qatordan."}
          className={cn(
            "min-h-[132px] w-full resize-none overflow-x-auto whitespace-pre bg-transparent px-3 py-3.5 font-mono text-[14px] leading-[1.7] text-foreground outline-none placeholder:text-muted-foreground/50",
          )}
        />
      </div>
    </div>
  );
}
