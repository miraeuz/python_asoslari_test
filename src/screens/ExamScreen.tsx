import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ActionBar } from "@/components/exam/ActionBar";
import { ExamHeader } from "@/components/exam/ExamHeader";
import { QuestionNavigator } from "@/components/exam/QuestionNavigator";
import { QuestionView } from "@/components/exam/QuestionView";
import { ShortcutsDialog } from "@/components/exam/ShortcutsDialog";
import { SubmitPartDialog } from "@/components/exam/SubmitPartDialog";
import { ProblemView } from "@/components/problems/ProblemView";
import { BottomSheet } from "@/components/ui/sheet";
import { examConfig } from "@/config/exam.config";
import { problemById, questionById } from "@/data/bank";
import { useHotkeys } from "@/hooks/useHotkeys";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useNow } from "@/hooks/useNow";
import { isAnswered } from "@/lib/grading";
import { hasSolution, partProgress, STARTER_CODE } from "@/lib/results";
import { cn } from "@/lib/utils";
import { itemKey, remainingOf, useExam } from "@/store/examStore";
import { useOpenAttempt } from "@/store/examStore";
import { usePrefs } from "@/store/prefsStore";

export function ExamScreen() {
  const attempt = useOpenAttempt();
  const direction = useExam((s) => s.direction);
  const { next, prev, setAnswer, toggleMark, setCode, setRun, submitPart, expireActivePart } = useExam.getState();
  const { sidebarCollapsed, toggleSidebar } = usePrefs();
  const isDesktop = useIsDesktop();
  const reduce = useReducedMotion();
  const now = useNow(500);

  const [navOpen, setNavOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [keysOpen, setKeysOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  const pi = attempt.activePart;
  const part = attempt.parts[pi];
  const cfg = examConfig.parts[pi];
  const id = part.itemIds[part.cursor];
  const key = itemKey(part.id, id);
  const remaining = remainingOf(part, now);
  const prog = partProgress(attempt, pi);

  // Time is up → close the part automatically.
  useEffect(() => {
    if (remaining <= 0 && part.status === "active") expireActivePart();
  }, [remaining, part.status, expireActivePart]);

  // Focus management: move focus to the new question's heading and scroll to top.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    const t = window.setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 120);
    return () => window.clearTimeout(t);
  }, [key, reduce]);

  const question = cfg.kind === "questions" ? questionById.get(id) : undefined;
  const problem = cfg.kind === "problems" ? problemById.get(id) : undefined;
  const order = question ? part.optionOrders[id] ?? question.options.map((o) => o.key) : [];

  const canClear = question ? isAnswered(attempt.answers[key]) : hasSolution(attempt.code[key]);
  const clear = () => (question ? setAnswer(key, null) : setCode(key, STARTER_CODE));

  const pickOption = (pos: number) => {
    if (!question) return;
    const k = order[pos];
    if (!k) return;
    if (question.type === "multiple_choice") {
      const cur = attempt.answers[key];
      const values = new Set(cur?.kind === "multi" ? cur.values : []);
      if (values.has(k)) values.delete(k);
      else values.add(k);
      setAnswer(key, values.size ? { kind: "multi", values: [...values] } : null);
    } else if (question.type === "single_choice") {
      setAnswer(key, { kind: "choice", value: k });
    }
  };

  useHotkeys({
    arrowright: next,
    arrowleft: prev,
    m: () => toggleMark(key),
    delete: clear,
    n: () => (isDesktop ? toggleSidebar() : setNavOpen(true)),
    "?": () => setKeysOpen(true),
    a: () => pickOption(0),
    b: () => pickOption(1),
    c: () => pickOption(2),
    d: () => pickOption(3),
    "1": () => pickOption(0),
    "2": () => pickOption(1),
    "3": () => pickOption(2),
    "4": () => pickOption(3),
    t: () => question?.type === "true_false" && setAnswer(key, { kind: "choice", value: "True" }),
    f: () => question?.type === "true_false" && setAnswer(key, { kind: "choice", value: "False" }),
  });

  const confirmSubmit = () => {
    setSubmitOpen(false);
    submitPart();
  };

  const showSidebar = isDesktop && !sidebarCollapsed;
  const slide = reduce ? 0 : 28;

  return (
    <div className="flex min-h-dvh flex-col">
      <ExamHeader partIndex={pi} answered={prog.answered} total={prog.total} remainingMs={remaining} onShortcuts={() => setKeysOpen(true)} />

      <div className="mx-auto flex w-full max-w-[1600px] flex-1">
        <AnimatePresence initial={false}>
          {showSidebar && (
            <motion.aside
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 316, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              className="sticky top-16 h-[calc(100dvh-4rem)] shrink-0 overflow-hidden border-r border-border/70"
              aria-label="Savollar navigatori"
            >
              <div className="h-full w-[316px] overflow-y-auto p-5 scrollbar-thin">
                <QuestionNavigator onSubmitPart={() => setSubmitOpen(true)} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main ref={mainRef} id="main" className="flex min-w-0 flex-1 flex-col">
          <div className={cn("flex-1 px-4 pb-32 pt-7 sm:px-8 sm:pt-10 lg:pb-12", cfg.kind === "problems" && "xl:px-10")}>
            <div aria-live="polite" className="sr-only">
              {cfg.title}, {part.cursor + 1}-savol, jami {part.itemIds.length}
            </div>
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={key}
                custom={direction}
                initial={{ opacity: 0, x: direction * slide, filter: "blur(3px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] } }}
                exit={{ opacity: 0, x: -direction * (slide / 2), filter: "blur(3px)", transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }}
              >
                {question && (
                  <QuestionView
                    ref={headingRef}
                    q={question}
                    number={part.cursor + 1}
                    total={part.itemIds.length}
                    order={order}
                    answer={attempt.answers[key]}
                    marked={!!attempt.marked[key]}
                    onAnswer={(a) => setAnswer(key, a)}
                  />
                )}
                {problem && (
                  <ProblemView
                    ref={headingRef}
                    p={problem}
                    number={part.cursor + 1}
                    total={part.itemIds.length}
                    code={attempt.code[key]}
                    run={attempt.runs[key]}
                    onCode={(c) => setCode(key, c)}
                    onRun={(r) => setRun(key, r)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <ActionBar
            index={part.cursor}
            total={part.itemIds.length}
            marked={!!attempt.marked[key]}
            canClear={canClear}
            onPrev={prev}
            onNext={next}
            onMark={() => toggleMark(key)}
            onClear={clear}
            onSubmit={() => setSubmitOpen(true)}
            onOpenNav={() => setNavOpen(true)}
            submitLabel={`${cfg.title}ni topshirish`}
          />
        </main>
      </div>

      {!isDesktop && (
        <BottomSheet open={navOpen} onOpenChange={setNavOpen} title="Savollar" description={`${cfg.title} · ${prog.answered}/${prog.total} javob berilgan`}>
          <div className="pb-4">
            <QuestionNavigator
              onNavigate={() => setNavOpen(false)}
              onSubmitPart={() => {
                setNavOpen(false);
                setSubmitOpen(true);
              }}
            />
          </div>
        </BottomSheet>
      )}

      <SubmitPartDialog open={submitOpen} onOpenChange={setSubmitOpen} remainingMs={remaining} onConfirm={confirmSubmit} />
      <ShortcutsDialog open={keysOpen} onOpenChange={setKeysOpen} />
    </div>
  );
}
