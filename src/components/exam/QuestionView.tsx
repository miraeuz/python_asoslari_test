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
    <article aria-labelledby={`${idPrefix}-title`} data-question-id={q.id} className="mx-auto w-full max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[13px] font-semibold tabular-nums text-primary">
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
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold text-warning"
        >
          <Bookmark className="size-3.5 fill-current" /> Keyinroq qaytish uchun belgilangan
        </motion.div>
      )}

      <h1
        id={`${idPrefix}-title`}
        ref={headingRef}
        tabIndex={-1}
        className="text-pretty text-[1.3rem] font-semibold leading-[1.45] tracking-[-0.012em] outline-none sm:text-[1.45rem]"
      >
        <RichText text={q.prompt} inHeading />
      </h1>

      {q.code && <CodeBlock code={q.code} className="mt-6" />}

      <div className="mt-7">
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
