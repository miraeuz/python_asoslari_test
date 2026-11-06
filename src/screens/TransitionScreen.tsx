import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock3, Code2, ListChecks, TimerOff } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeMenu } from "@/components/exam/ThemeMenu";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { examConfig } from "@/config/exam.config";
import { formatDuration } from "@/lib/format";
import { partProgress } from "@/lib/results";
import { useExam } from "@/store/examStore";
import { useOpenAttempt } from "@/store/examStore";
import { Backdrop } from "./WelcomeScreen";

const ease = [0.22, 1, 0.36, 1] as const;

export function TransitionScreen() {
  const attempt = useOpenAttempt();
  const beginPart = useExam((s) => s.beginPart);
  const reduce = useReducedMotion();
  const [starting, setStarting] = useState(false);
  const from = attempt.transitionFrom ?? 0;
  const nextIndex = attempt.parts.findIndex((p) => p.status === "pending");
  const done = attempt.parts[from];
  const doneCfg = examConfig.parts[from];
  const nextCfg = examConfig.parts[nextIndex];
  const prog = partProgress(attempt, from);
  const used = doneCfg.durationMinutes * 60_000 - done.remainingMs;
  const expired = done.status === "expired";

  return (
    <div className="relative min-h-dvh">
      <Backdrop />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <ThemeMenu />
      </header>

      <main className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-16 pt-6 sm:px-8 lg:min-h-[calc(100dvh-6rem)] lg:grid-cols-2 lg:gap-14 lg:pt-0">
        <motion.section initial={{ opacity: 0, x: reduce ? 0 : -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease }}>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${expired ? "bg-warning-soft text-warning" : "bg-success-soft text-success"}`}>
            {expired ? <TimerOff className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
            {expired ? "Vaqt tugadi — qism avtomatik topshirildi" : `${doneCfg.title} topshirildi`}
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">Ajoyib, davom etamiz.</h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">Bir oz nafas oling. Keyingi qism taymeri siz “Boshlash”ni bosgandagina ishga tushadi.</p>

          <div className="mt-8 flex items-center gap-6 rounded-2xl border bg-card/70 p-5 shadow-soft backdrop-blur">
            <ProgressRing value={prog.answered / Math.max(1, prog.total)} size={84} stroke={7} barClassName="stroke-success">
              <span className="text-lg font-bold tabular-nums">{prog.answered}</span>
            </ProgressRing>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Javob berildi</dt>
              <dd className="font-semibold tabular-nums">
                {prog.answered} / {prog.total}
              </dd>
              <dt className="text-muted-foreground">Belgilangan</dt>
              <dd className="font-semibold tabular-nums">{prog.marked}</dd>
              <dt className="text-muted-foreground">Sarflangan vaqt</dt>
              <dd className="font-semibold">{formatDuration(Math.max(60_000, used))}</dd>
            </dl>
          </div>
        </motion.section>

        {nextCfg && (
          <motion.section
            initial={{ opacity: 0, y: reduce ? 0 : 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
            className="glass relative overflow-hidden rounded-[1.6rem] border p-7 shadow-lift sm:p-9"
          >
            <div aria-hidden className="absolute -right-16 -top-16 size-56 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 blur-2xl" />
            <div className="relative">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Keyingi</div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-mono text-5xl font-bold text-primary">0{nextIndex + 1}</span>
                <h2 className="text-2xl font-bold tracking-tight">{nextCfg.title}</h2>
              </div>
              <p className="mt-2 text-muted-foreground">{nextCfg.subtitle}</p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-3">
                  {nextCfg.kind === "problems" ? <Code2 className="size-4 text-accent" /> : <ListChecks className="size-4 text-accent" />}
                  {nextCfg.count} ta {nextCfg.kind === "problems" ? "hayotiy amaliy masala — kod yozasiz va ishga tushirasiz" : "savol: test, natijani topish, boʻsh joyni toʻldirish"}
                </li>
                <li className="flex items-center gap-3">
                  <Clock3 className="size-4 text-accent" /> {nextCfg.durationMinutes} daqiqa
                </li>
              </ul>
              <div className="mt-8">
                <MagneticButton
                  size="xl"
                  disabled={starting}
                  onClick={() => {
                    if (starting) return;
                    setStarting(true);
                    beginPart(nextIndex);
                  }}
                  autoFocus
                >
                  {nextCfg.title}ni boshlash <ArrowRight />
                </MagneticButton>
              </div>
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
