import { motion } from "framer-motion";
import { CheckCircle2, CircleDashed, Code2, ListChecks, XCircle } from "lucide-react";
import { formatDuration } from "@/lib/format";
import type { ExamResults } from "@/lib/results";
import { cn } from "@/lib/utils";

export function PartBreakdown({ results }: { results: ExamResults }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {results.parts.map((p, i) => (
        <motion.div
          key={p.index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.08 }}
          className="surface p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              {p.kind === "problems" ? <Code2 className="size-4 text-accent" /> : <ListChecks className="size-4 text-primary" />}
              {p.title}
            </div>
            <span className="text-xs text-muted-foreground">{formatDuration(Math.max(60_000, p.timeSpentMs))}</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold tabular-nums tracking-tight">{p.percent}%</span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {p.points}/{p.maxPoints} ball
            </span>
          </div>
          <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-secondary">
            <motion.div className="bg-success" initial={{ width: 0 }} animate={{ width: `${(p.correct / Math.max(1, p.total)) * 100}%` }} transition={{ duration: 0.9, delay: 0.3 }} />
            <motion.div className="bg-destructive/80" initial={{ width: 0 }} animate={{ width: `${(p.wrong / Math.max(1, p.total)) * 100}%` }} transition={{ duration: 0.9, delay: 0.4 }} />
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            {[
              { label: "Toʻgʻri", v: p.correct, icon: CheckCircle2, cls: "text-success" },
              { label: "Xato", v: p.wrong, icon: XCircle, cls: "text-destructive" },
              { label: "Javobsiz", v: p.unanswered + p.pending, icon: CircleDashed, cls: "text-muted-foreground" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-secondary/60 py-2">
                <dd className={cn("flex items-center justify-center gap-1 text-base font-bold tabular-nums", s.cls)}>
                  <s.icon className="size-3.5" />
                  {s.v}
                </dd>
                <dt className="text-muted-foreground">{s.label}</dt>
              </div>
            ))}
          </dl>
          {p.kind === "problems" && <p className="mt-3 text-[0.7188rem] leading-relaxed text-muted-foreground">Namuna kirish bilan avtomatik tekshirildi. Yakuniy baho — oʻqituvchi koʻrib chiqqandan keyin.</p>}
        </motion.div>
      ))}
    </div>
  );
}

export function TopicBars({ results }: { results: ExamResults }) {
  const sorted = [...results.topics];
  const weakest = [...sorted].sort((a, b) => a.percent - b.percent).slice(0, 3).filter((t) => t.percent < 70);
  return (
    <div className="surface p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Mavzular boʻyicha</h2>
          <p className="text-sm text-muted-foreground">Test savollari asosida</p>
        </div>
        {weakest.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Takrorlash tavsiya etiladi: <span className="font-medium text-foreground">{weakest.map((t) => t.number ?? t.topic).join(", ")}</span>
          </p>
        )}
      </div>
      <ul className="mt-5 grid gap-x-10 gap-y-3.5 md:grid-cols-2">
        {sorted.map((t, i) => (
          <li key={t.topic}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate">
                {t.number && <span className="mr-1.5 font-mono text-xs text-muted-foreground">{t.number}</span>}
                {t.topic}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {t.correct}/{t.total}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className={cn("h-full rounded-full", t.percent >= 80 ? "bg-success" : t.percent >= 60 ? "bg-primary" : t.percent >= 40 ? "bg-warning" : "bg-destructive")}
                initial={{ width: 0 }}
                animate={{ width: `${t.percent}%` }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.03 }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
