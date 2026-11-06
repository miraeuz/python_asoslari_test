import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { CodeBlock } from "@/components/code/CodeBlock";
import { RichText } from "@/components/code/RichText";
import { Badge } from "@/components/ui/badge";
import type { Question } from "@/data/schema";
import type { Answer } from "@/lib/grading";
import { typeLabel } from "@/lib/format";
import { ChoiceOptions } from "./ChoiceOptions";
import { DifficultyDots } from "./Difficulty";
import { FillBlankInput, OutputAnswerInput } from "./TextAnswerInput";
import { TrueFalseInput } from "./TrueFalseInput";

export const QuestionView = forwardRef<
  HTMLHeadingElement,
  {
    q: Question;
    number: number;
    total: number;
    order: string[];
    answer: Answer | undefined;
    marked: boolean;
    onAnswer: (a: Answer | null) => void;
  }
>(function QuestionView({ q, number, total, order, answer, marked, onAnswer }, headingRef) {
  const idPrefix = `q${q.id}`;
  return (
    <article
      aria-labelledby={`${idPrefix}-title`}
      data-question-id={q.id}
      className="mx-auto grid w-full max-w-[56rem] gap-6 xl:max-w-[100rem] xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:gap-10 2xl:gap-14"
    >
      {/* ── Question ── */}
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.8125rem] font-semibold tabular-nums text-primary">
            {String(number).padStart(2, "0")}
            <span className="text-muted-foreground/60"> / {total}</span>
          </span>
          <span className="h-4 w-px bg-border" />
          <Badge tone="neutral">
            {q.topicNumber && <span className="font-mono opacity-70">{q.topicNumber}</span>}
            {q.topic}
          </Badge>
          <Badge tone="outline">{typeLabel[q.type]}</Badge>
          <DifficultyDots level={q.difficulty} className="ml-auto" />
        </div>

        {marked && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 inline-flex items-center gap-2 rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold text-warning"
          >
            <Bookmark className="size-3.5 fill-current" /> Keyinroq qaytish uchun belgilangan
          </motion.div>
        )}

        <h1
          id={`${idPrefix}-title`}
          ref={headingRef}
          tabIndex={-1}
          className="text-pretty text-[clamp(1.15rem,0.95rem+0.6vw,1.5rem)] font-semibold leading-[1.45] tracking-[-0.012em] outline-none"
        >
          <RichText text={q.prompt} inHeading />
        </h1>

        {q.code && <CodeBlock code={q.code} className="mt-5" />}
      </div>

      {/* ── Answer ── */}
      <div className="min-w-0 xl:sticky xl:top-24 xl:self-start xl:pt-9">
        <p className="mb-3 hidden text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground xl:block">Javobingiz</p>
        {(q.type === "single_choice" || q.type === "multiple_choice") && (
          <ChoiceOptions q={q} order={order} answer={answer} onChange={onAnswer} idPrefix={idPrefix} />
        )}
        {q.type === "true_false" && <TrueFalseInput answer={answer} onChange={onAnswer} idPrefix={idPrefix} />}
        {q.type === "fill_blank" && <FillBlankInput answer={answer} onChange={onAnswer} id={`${idPrefix}-input`} />}
        {q.type === "output" && <OutputAnswerInput answer={answer} onChange={onAnswer} id={`${idPrefix}-input`} />}
      </div>
    </article>
  );
});
