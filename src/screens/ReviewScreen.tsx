import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Bookmark, CheckCircle2, Clock3, Lock, PauseCircle, ShieldAlert, TimerOff } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { NavCell } from "@/components/exam/QuestionNavigator";
import { ThemeMenu } from "@/components/exam/ThemeMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HoldButton } from "@/components/ui/hold-button";
import { examConfig } from "@/config/exam.config";
import { useNow } from "@/hooks/useNow";
import { formatClock } from "@/lib/format";
import { isItemAnswered, partProgress } from "@/lib/results";
import { itemKey, remainingOf, useExam, type PartRuntime } from "@/store/examStore";
import { Backdrop } from "./WelcomeScreen";

const statusMeta = (p: PartRuntime, remaining: number) => {
  if (p.status === "expired" || remaining <= 0) return { label: "Vaqt tugagan", tone: "warning" as const, icon: TimerOff };
  if (p.status === "paused") return { label: "Toʻxtatilgan", tone: "primary" as const, icon: PauseCircle };
  return { label: "Topshirilgan", tone: "success" as const, icon: CheckCircle2 };
};

export function ReviewScreen() {
  const attempt = useExam((s) => s.attempt)!;
  const { openPart, finishExam } = useExam.getState();
  const now = useNow(1000);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [understood, setUnderstood] = useState(false);

  const totals = attempt.parts.map((_, i) => partProgress(attempt, i));
  const allUnanswered = totals.reduce((s, t) => s + t.unanswered, 0);
  const allMarked = totals.reduce((s, t) => s + t.marked, 0);
  const all = totals.reduce((s, t) => s + t.total, 0);
  const answered = all - allUnanswered;

  return (
    <div className="relative min-h-dvh">
      <Backdrop />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <ThemeMenu />
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold tracking-[-0.025em] sm:text-4xl">Yakuniy koʻrinish</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Topshirishdan oldin hammasini tekshiring. Vaqti qolgan qismga qaytib, javobsiz yoki belgilangan savollarni koʻrib chiqishingiz mumkin.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge tone="success" className="px-3 py-1 text-[13px]">
              <CheckCircle2 /> {answered} ta javob
            </Badge>
            <Badge tone={allUnanswered ? "destructive" : "neutral"} className="px-3 py-1 text-[13px]">
              <AlertTriangle /> {allUnanswered} ta javobsiz
            </Badge>
            <Badge tone="warning" className="px-3 py-1 text-[13px]">
              <Bookmark /> {allMarked} ta belgilangan
            </Badge>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {attempt.parts.map((p, pi) => {
            const cfg = examConfig.parts[pi];
            const prog = totals[pi];
            const remaining = remainingOf(p, now);
            const meta = statusMeta(p, remaining);
            const canReturn = remaining > 0 && (p.status === "paused" || (p.status === "submitted" && examConfig.allowReturnToSubmittedParts));
            const unanswered = p.itemIds.map((id, idx) => ({ id, idx })).filter(({ id }) => !isItemAnswered(attempt, pi, id));
            const marked = p.itemIds.map((id, idx) => ({ id, idx })).filter(({ id }) => attempt.marked[itemKey(p.id, id)]);
            return (
              <motion.section
                key={p.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 * pi }}
                className="surface flex flex-col p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs font-semibold text-primary">0{pi + 1}</div>
                    <h2 className="mt-1 text-lg font-semibold">{cfg.title}</h2>
                    <p className="text-[13px] text-muted-foreground">{cfg.subtitle}</p>
                  </div>
                  <Badge tone={meta.tone}>
                    <meta.icon /> {meta.label}
                  </Badge>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div className="text-3xl font-bold tabular-nums tracking-tight">
                    {prog.answered}
                    <span className="text-base font-medium text-muted-foreground">/{prog.total}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-sm tabular-nums text-muted-foreground">
                    <Clock3 className="size-4" /> {formatClock(remaining)}
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${(prog.answered / Math.max(1, prog.total)) * 100}%` }} />
                </div>

                {[
                  { title: "Javobsiz", list: unanswered, empty: "Hammasiga javob berilgan" },
                  { title: "Belgilangan", list: marked, empty: "Belgilangan savol yoʻq" },
                ].map((g) => (
                  <div key={g.title} className="mt-5">
                    <div className="mb-2 text-[12.5px] font-semibold text-muted-foreground">
                      {g.title} · {g.list.length}
                    </div>
                    {g.list.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {g.list.slice(0, 30).map(({ id, idx }) => (
                          <NavCell
                            key={id}
                            number={idx + 1}
                            size="sm"
                            kind={isItemAnswered(attempt, pi, id) ? "answered" : attempt.visited[itemKey(p.id, id)] ? "visited" : "unvisited"}
                            answered={isItemAnswered(attempt, pi, id)}
                            marked={!!attempt.marked[itemKey(p.id, id)]}
                            onClick={canReturn ? () => openPart(pi, idx) : undefined}
                            label={canReturn ? `${cfg.title}, ${idx + 1}-savolga qaytish` : `${idx + 1}-savol (qism yopilgan)`}
                          />
                        ))}
                        {g.list.length > 30 && <span className="self-center text-xs text-muted-foreground">+{g.list.length - 30}</span>}
                      </div>
                    ) : (
                      <p className="text-[13px] text-muted-foreground/80">{g.empty}</p>
                    )}
                  </div>
                ))}

                <div className="mt-auto pt-6">
                  {canReturn ? (
                    <Button variant="outline" className="w-full" onClick={() => openPart(pi, unanswered[0]?.idx ?? marked[0]?.idx)}>
                      Qismga qaytish <ArrowRight />
                    </Button>
                  ) : (
                    <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
                      <Lock className="size-4" /> Bu qismga qaytib boʻlmaydi
                    </p>
                  )}
                </div>
              </motion.section>
            );
          })}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative mt-10 overflow-hidden rounded-[1.6rem] border bg-foreground p-7 text-background shadow-lift sm:p-10"
        >
          <div aria-hidden className="absolute -right-20 -top-24 size-72 rounded-full bg-gradient-to-br from-primary/60 to-accent/40 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Butun imtihonni topshirish</h2>
              <p className="mt-2 text-background/70">
                Topshirgach, javoblarni oʻzgartirib boʻlmaydi. Amaliy masalalar yechimlari namuna bilan avtomatik tekshiriladi va natija darhol koʻrsatiladi.
              </p>
            </div>
            <Button size="xl" className="bg-background text-foreground shadow-none hover:bg-background/90" onClick={() => setConfirmOpen(true)}>
              Yakunlash <ArrowRight />
            </Button>
          </div>
        </motion.section>
      </main>

      <Dialog
        open={confirmOpen}
        onOpenChange={(o) => {
          setConfirmOpen(o);
          if (!o) setUnderstood(false);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <span className="mb-2 grid size-12 place-items-center rounded-2xl bg-destructive-soft text-destructive">
              <ShieldAlert className="size-6" />
            </span>
            <DialogTitle>Imtihonni yakunlaysizmi?</DialogTitle>
            <DialogDescription>
              {allUnanswered > 0 ? (
                <>
                  Sizda hali <b className="text-foreground">{allUnanswered} ta javobsiz</b> topshiriq bor. Javobsiz savollar 0 ball bilan baholanadi.
                </>
              ) : (
                "Barcha topshiriqlarga javob berdingiz. Ajoyib!"
              )}
            </DialogDescription>
          </DialogHeader>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-3.5 text-sm">
            <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} className="mt-0.5 size-[18px] accent-[hsl(var(--primary))]" />
            Tushundim: topshirgandan keyin javoblarni oʻzgartirib boʻlmaydi.
          </label>
          <div className="flex flex-col gap-2">
            <HoldButton disabled={!understood} onConfirm={finishExam} className="w-full">
              Bosib turing — topshirish
            </HoldButton>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Ortga qaytish
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
