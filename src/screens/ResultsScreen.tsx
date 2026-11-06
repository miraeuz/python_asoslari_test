import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Printer, RotateCcw } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeMenu } from "@/components/exam/ThemeMenu";
import { PartBreakdown, TopicBars } from "@/components/results/Breakdown";
import { ReviewList } from "@/components/results/ReviewList";
import { ScoreHero } from "@/components/results/ScoreHero";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { examConfig } from "@/config/exam.config";
import { problemById } from "@/data/bank";
import { runPython } from "@/lib/python";
import { computeResults, hasSolution } from "@/lib/results";
import { itemKey, useExam } from "@/store/examStore";
import { useOpenAttempt } from "@/store/examStore";
import { Backdrop } from "./WelcomeScreen";

/** Runs every written solution against its example once, after final submit. */
function useFinalChecks() {
  const attempt = useOpenAttempt();
  const setRun = useExam((s) => s.setRun);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      for (const [pi, part] of attempt.parts.entries()) {
        if (examConfig.parts[pi].kind !== "problems") continue;
        for (const id of part.itemIds) {
          const key = itemKey(part.id, id);
          const code = useExam.getState().attempt?.code[key];
          if (!hasSolution(code) || useExam.getState().attempt?.finalRuns[key]) continue;
          const r = await runPython(code!, problemById.get(id)!.inputExample);
          setRun(key, r, true);
          if (r.status === "unavailable") {
            // engine can't load — mark the remaining solutions as unchecked without retrying each one
            for (const rest of part.itemIds) {
              const k = itemKey(part.id, rest);
              const st = useExam.getState().attempt!;
              if (hasSolution(st.code[k]) && !st.finalRuns[k]) setRun(k, r, true);
            }
            return;
          }
        }
      }
    })();
  }, [attempt.parts, setRun]);
}

export function ResultsScreen() {
  const attempt = useOpenAttempt();
  const reset = useExam((s) => s.reset);
  const [confirmReset, setConfirmReset] = useState(false);
  useFinalChecks();
  const results = useMemo(() => computeResults(attempt), [attempt]);

  const exportJson = () => {
    const payload = {
      exam: `${examConfig.brand.academy} – ${examConfig.brand.application}: ${examConfig.brand.title}`,
      student: attempt.student,
      attemptId: attempt.id,
      startedAt: new Date(attempt.createdAt).toISOString(),
      finishedAt: attempt.finishedAt ? new Date(attempt.finishedAt).toISOString() : null,
      score: { points: results.points, maxPoints: results.maxPoints, percent: results.percent, passed: results.passed },
      parts: results.parts.map((p) => ({
        title: p.title,
        correct: p.correct,
        wrong: p.wrong,
        unanswered: p.unanswered,
        points: p.points,
        maxPoints: p.maxPoints,
        timeSpentMinutes: Math.round(p.timeSpentMs / 60000),
        items: p.items.map((i) => ({
          n: i.index + 1,
          id: i.question?.id ?? i.problem?.id,
          verdict: i.verdict,
          answer: i.question ? attempt.answers[i.key] ?? null : undefined,
          code: i.problem ? attempt.code[i.key] ?? null : undefined,
        })),
      })),
      topics: results.topics,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    const who = attempt.student ? `${attempt.student.lastName}_${attempt.student.firstName}` : "natija";
    a.href = URL.createObjectURL(blob);
    a.download = `python-asoslari_${who}_${attempt.id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="relative min-h-dvh">
      <Backdrop />
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5 sm:px-8 print:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={exportJson}>
            <Download /> <span className="hidden sm:inline">JSON</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.print()}>
            <Printer /> <span className="hidden sm:inline">Chop etish</span>
          </Button>
          <ThemeMenu />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-5 pb-20 sm:px-8">
        <ScoreHero attempt={attempt} results={results} />
        <PartBreakdown results={results} />
        {results.topics.length > 0 && <TopicBars results={results} />}
        <ReviewList results={results} attempt={attempt} />

        <div className="flex flex-col items-center gap-3 pt-6 text-center print:hidden">
          <Button variant="outline" size="lg" onClick={() => setConfirmReset(true)}>
            <RotateCcw /> Yangi urinish
          </Button>
          <p className="text-xs text-muted-foreground">Natija shu qurilmada saqlanadi. Yangi urinish boshlansa, u oʻchiriladi.</p>
        </div>
      </main>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Natijani oʻchirib, yangidan boshlaysizmi?</DialogTitle>
            <DialogDescription>Kerak boʻlsa, avval JSON faylini yuklab oling.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReset(false)}>
              Bekor qilish
            </Button>
            <Button variant="destructive" onClick={reset}>
              Ha, yangidan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
