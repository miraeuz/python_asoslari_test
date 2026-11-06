import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, CircleDashed, HelpCircle, Lightbulb, Loader2, X } from "lucide-react";
import { CodeBlock } from "@/components/code/CodeBlock";
import { RichInline, RichText } from "@/components/code/RichText";
import { letterAt, OptionText } from "@/components/exam/ChoiceOptions";
import { Badge } from "@/components/ui/badge";
import { examConfig } from "@/config/exam.config";
import type { Question } from "@/data/schema";
import { typeLabel } from "@/lib/format";
import type { Answer } from "@/lib/grading";
import type { ExamResults, ItemResult, ItemVerdict } from "@/lib/results";
import { cn } from "@/lib/utils";
import type { Attempt } from "@/store/examStore";

type Filter = "all" | "wrong" | "correct" | "unanswered";

const verdictMeta: Record<ItemVerdict, { label: string; icon: typeof Check; cls: string }> = {
  correct: { label: "Toʻgʻri", icon: Check, cls: "bg-success text-success-foreground" },
  wrong: { label: "Xato", icon: X, cls: "bg-destructive text-destructive-foreground" },
  unanswered: { label: "Javobsiz", icon: CircleDashed, cls: "bg-secondary text-muted-foreground" },
  checking: { label: "Tekshirilmoqda", icon: Loader2, cls: "bg-primary-soft text-primary" },
  unchecked: { label: "Tekshirilmadi", icon: HelpCircle, cls: "bg-warning-soft text-warning" },
};

function OutputPair({ yours, correct, yoursLabel = "Sizning javobingiz", correctLabel = "Toʻgʻri javob", ok }: { yours: string; correct: string; yoursLabel?: string; correctLabel?: string; ok: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        { label: yoursLabel, value: yours, tone: ok ? "border-success/40" : "border-destructive/40" },
        { label: correctLabel, value: correct, tone: "border-success/40" },
      ].map((b) => (
        <div key={b.label} className={cn("overflow-hidden rounded-xl border bg-code-bg", b.tone)}>
          <div className="border-b border-code-border px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{b.label}</div>
          <pre className="overflow-x-auto whitespace-pre px-3 py-2.5 font-mono text-[0.8125rem] leading-[1.7] scrollbar-thin">{b.value || <span className="text-muted-foreground">—</span>}</pre>
        </div>
      ))}
    </div>
  );
}

function QuestionDetail({ q, answer, order, verdict }: { q: Question; answer: Answer | undefined; order: string[]; verdict: ItemVerdict }) {
  const reveal = examConfig.revealAnswersInResults;
  const chosen = new Set(answer?.kind === "multi" ? answer.values : answer?.kind === "choice" ? [answer.value] : []);
  const correct = new Set(Array.isArray(q.correct) ? q.correct : [q.correct]);
  const byKey = new Map(q.options.map((o) => [o.key, o]));

  return (
    <div className="space-y-4">
      <RichText text={q.prompt} className="text-[0.9375rem] leading-relaxed" />
      {q.code && <CodeBlock code={q.code} compact />}

      {(q.type === "single_choice" || q.type === "multiple_choice") && (
        <ul className="grid gap-2">
          {order.map((k, i) => {
            const isRight = correct.has(k);
            const isChosen = chosen.has(k);
            return (
              <li
                key={k}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3.5 py-2.5 text-[0.9062rem]",
                  reveal && isRight && "border-success/50 bg-success-soft/60",
                  isChosen && !isRight && "border-destructive/50 bg-destructive-soft/60",
                )}
              >
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border text-[0.6875rem] font-bold",
                    reveal && isRight ? "border-success bg-success text-success-foreground" : isChosen ? "border-destructive bg-destructive text-destructive-foreground" : "text-muted-foreground",
                  )}
                >
                  {reveal && isRight ? <Check className="size-3.5" strokeWidth={3} /> : isChosen ? <X className="size-3.5" strokeWidth={3} /> : letterAt(i)}
                </span>
                <span className="min-w-0 flex-1 pt-0.5">
                  <OptionText q={q} text={byKey.get(k)!.text} />
                </span>
                {isChosen && <span className="shrink-0 pt-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">Siz</span>}
              </li>
            );
          })}
        </ul>
      )}

      {q.type === "true_false" && (
        <OutputPair
          yours={answer?.kind === "choice" ? (answer.value === "True" ? "Toʻgʻri" : "Notoʻgʻri") : ""}
          correct={reveal ? (q.correct === "True" ? "Toʻgʻri" : "Notoʻgʻri") : "•••"}
          ok={verdict === "correct"}
        />
      )}
      {(q.type === "fill_blank" || q.type === "output") && (
        <OutputPair yours={answer?.kind === "text" ? answer.value : ""} correct={reveal ? String(q.correct) : "•••"} ok={verdict === "correct"} />
      )}

      {reveal && q.explanation && (
        <div className="flex gap-3 rounded-xl border border-primary/20 bg-primary-soft/50 p-3.5 text-[0.875rem] leading-relaxed">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
          <RichInline text={q.explanation} />
        </div>
      )}
    </div>
  );
}

function ProblemDetail({ item, code }: { item: ItemResult; code: string | undefined }) {
  const p = item.problem!;
  const run = item.run;
  return (
    <div className="space-y-4">
      <RichText text={p.description} className="text-[0.875rem] leading-relaxed text-muted-foreground" />
      {item.verdict === "unanswered" ? (
        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Yechim yozilmagan.</p>
      ) : (
        <CodeBlock code={code ?? ""} filename="yechim.py" compact />
      )}
      {item.verdict !== "unanswered" && (
        <>
          <OutputPair yours={run?.stdout ?? ""} correct={p.outputExample} yoursLabel="Dasturingiz natijasi" correctLabel="Kutilgan natija" ok={item.verdict === "correct"} />
          {run?.stderr && <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-destructive/30 bg-destructive-soft/50 p-3 font-mono text-[0.7812rem] text-destructive">{run.stderr}</pre>}
        </>
      )}
      <p className="text-xs text-muted-foreground">
        Namuna kirish: <code className="inline-code">{p.inputExample.split("\n")[0]}{p.inputExample.includes("\n") ? " …" : ""}</code>
      </p>
    </div>
  );
}

function ReviewItem({ item, attempt }: { item: ItemResult; attempt: Attempt }) {
  const [open, setOpen] = useState(false);
  const meta = verdictMeta[item.verdict];
  const part = attempt.parts[item.partIndex];
  const q = item.question;
  const title = q ? q.prompt.split("\n")[0] : item.problem!.title;
  return (
    <li className="surface overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-secondary/40 sm:px-5">
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", meta.cls)} aria-label={meta.label}>
          <meta.icon className={cn("size-4", item.verdict === "checking" && "animate-spin")} strokeWidth={2.6} />
        </span>
        <span className="w-8 shrink-0 font-mono text-[0.8125rem] font-semibold tabular-nums text-muted-foreground">{String(item.index + 1).padStart(2, "0")}</span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-1 text-[0.9062rem] font-medium">
            <RichInline text={title} />
          </span>
          <span className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
            {q ? (
              <>
                <span>{q.topicNumber ? `${q.topicNumber} ${q.topic}` : q.topic}</span>
                <span className="hidden sm:inline">{typeLabel[q.type]}</span>
              </>
            ) : (
              <span>{item.problem!.topics.slice(0, 3).join(" · ")}</span>
            )}
          </span>
        </span>
        <Badge tone={item.verdict === "correct" ? "success" : item.verdict === "wrong" ? "destructive" : "neutral"} className="hidden sm:inline-flex">
          {meta.label}
        </Badge>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
            <div className="border-t px-4 py-5 sm:px-6">
              {q ? (
                <QuestionDetail q={q} answer={attempt.answers[item.key]} order={part.optionOrders[q.id] ?? q.options.map((o) => o.key)} verdict={item.verdict} />
              ) : (
                <ProblemDetail item={item} code={attempt.code[item.key]} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function ReviewList({ results, attempt }: { results: ExamResults; attempt: Attempt }) {
  const [tab, setTab] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const part = results.parts[tab];
  const items = useMemo(
    () =>
      part.items.filter((i) =>
        filter === "all" ? true : filter === "unanswered" ? i.verdict === "unanswered" || i.verdict === "unchecked" : i.verdict === filter,
      ),
    [part, filter],
  );
  const filters: { id: Filter; label: string; n: number }[] = [
    { id: "all", label: "Hammasi", n: part.total },
    { id: "wrong", label: "Xatolar", n: part.wrong },
    { id: "correct", label: "Toʻgʻrilar", n: part.correct },
    { id: "unanswered", label: "Javobsiz", n: part.unanswered + part.pending },
  ];

  return (
    <section aria-labelledby="review-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="review-title" className="text-xl font-semibold tracking-tight">
            Savollar tahlili
          </h2>
          <p className="text-sm text-muted-foreground">Har bir savolni oching — toʻgʻri javob va izoh koʻrinadi.</p>
        </div>
        <div role="tablist" className="flex gap-1 rounded-xl bg-secondary/70 p-1">
          {results.parts.map((p, i) => (
            <button key={p.index} role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className={cn("relative rounded-lg px-3.5 py-1.5 text-[0.8125rem] font-semibold transition", tab === i ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
              {tab === i && <motion.span layoutId="review-tab" className="absolute inset-0 rounded-lg bg-card shadow-soft" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{p.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition",
              filter === f.id ? "border-foreground bg-foreground text-background" : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label} <span className="tabular-nums opacity-60">{f.n}</span>
          </button>
        ))}
      </div>

      <ul className="mt-5 space-y-2.5">
        {items.map((it) => (
          <ReviewItem key={it.key} item={it} attempt={attempt} />
        ))}
        {items.length === 0 && <li className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Bu filtrda savol yoʻq.</li>}
      </ul>
    </section>
  );
}
