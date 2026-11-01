import { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, useReducedMotion } from "framer-motion";
import { Award, CalendarDays, Clock3, Loader2, Sparkles } from "lucide-react";
import { ProgressRing } from "@/components/ui/progress-ring";
import { examConfig } from "@/config/exam.config";
import { formatDate, formatDuration, gradeLabel } from "@/lib/format";
import type { ExamResults } from "@/lib/results";
import { cn } from "@/lib/utils";
import type { Attempt } from "@/store/examStore";
import { CountUp } from "./CountUp";

const toneBar = { success: "stroke-success", primary: "stroke-primary", accent: "stroke-accent", destructive: "stroke-destructive" };
const toneText = { success: "text-success", primary: "text-primary", accent: "text-accent", destructive: "text-destructive" };

export function ScoreHero({ attempt, results }: { attempt: Attempt; results: ExamResults }) {
  const reduce = useReducedMotion();
  const grade = gradeLabel(results.percent);
  const name = attempt.student ? `${attempt.student.firstName} ${attempt.student.lastName}` : "Tabriklaymiz";

  useEffect(() => {
    if (results.checking || !results.passed || reduce) return;
    const flag = `pa-exam:confetti:${attempt.id}`;
    try {
      if (sessionStorage.getItem(flag)) return;
      sessionStorage.setItem(flag, "1");
    } catch {
      /* ignore */
    }
    const colors = ["#6366f1", "#14b8a6", "#22c55e", "#f59e0b"];
    const burst = (x: number) => confetti({ particleCount: 70, spread: 70, startVelocity: 42, origin: { x, y: 0.35 }, colors, scalar: 0.9, disableForReducedMotion: true });
    burst(0.25);
    setTimeout(() => burst(0.75), 180);
  }, [results.checking, results.passed, reduce, attempt.id]);

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border bg-card p-6 shadow-lift sm:p-10">
      <div aria-hidden className="absolute -left-24 -top-24 size-80 rounded-full bg-primary/15 blur-3xl" />
      <div aria-hidden className="absolute -bottom-28 right-0 size-80 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative grid items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-12">
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 140, damping: 16 }} className="mx-auto">
          <ProgressRing value={results.percent / 100} size={196} stroke={14} barClassName={toneBar[grade.tone]} trackClassName="stroke-secondary">
            <div className="text-center">
              <div className="text-5xl font-bold tabular-nums tracking-tight">
                <CountUp value={results.percent} suffix="%" />
              </div>
              <div className="mt-1 text-sm tabular-nums text-muted-foreground">
                {results.points} / {results.maxPoints} ball
              </div>
            </div>
          </ProgressRing>
        </motion.div>

        <div className="text-center md:text-left">
          <div className={cn("inline-flex items-center gap-2 text-sm font-semibold", toneText[grade.tone])}>
            {results.passed ? <Award className="size-4" /> : <Sparkles className="size-4" />}
            {grade.label}
          </div>
          <h1 className="mt-2 text-balance text-3xl font-bold tracking-[-0.025em] sm:text-[2.6rem] sm:leading-[1.1]">
            {results.passed ? `${name}, imtihondan oʻtdingiz!` : `${name}, natijangiz tayyor`}
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground md:mx-0">
            {results.passed
              ? "Ajoyib natija. Quyida har bir qism va mavzu boʻyicha tahlil hamda har bir savolning izohi bor."
              : `Oʻtish bali — ${examConfig.passPercent}%. Quyidagi mavzular tahlili qaysi boʻlimlarni takrorlash kerakligini koʻrsatadi.`}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground md:justify-start">
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4" /> {formatDate(attempt.finishedAt ?? Date.now())}
            </span>
            <span className="flex items-center gap-2">
              <Clock3 className="size-4" /> {formatDuration(Math.max(60_000, results.timeSpentMs))}
            </span>
            {attempt.student?.nickname && <span>{attempt.student.nickname}</span>}
            {results.checking && (
              <span className="flex items-center gap-2 text-primary">
                <Loader2 className="size-4 animate-spin" /> Amaliy masalalar tekshirilmoqda…
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
