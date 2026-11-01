import { forwardRef, useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CircleAlert, Copy, Loader2, Play, RotateCcw, TerminalSquare, Timer as TimerIcon, X } from "lucide-react";
import { CodeEditor } from "@/components/code/CodeEditor";
import { RichText } from "@/components/code/RichText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { DifficultyDots } from "@/components/exam/Difficulty";
import { examConfig } from "@/config/exam.config";
import type { Problem } from "@/data/schema";
import { normalizeOutput } from "@/lib/grading";
import { pythonEngine, runPython, type RunResult } from "@/lib/python";
import { STARTER_CODE } from "@/lib/results";
import { cn } from "@/lib/utils";

/** Emphasise "Kirish:" / "Chiqish:" section labels inside statements. */
const emphasiseSections = (s: string) =>
  s.replace(/^((?:\d+-qator|Kirish|Chiqish)[^:\n]{0,90}:)/gm, "**$1**");

function ExampleBlock({ title, value }: { title: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-code-border bg-code-bg">
      <div className="flex items-center justify-between border-b border-code-border px-3.5 py-2">
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1400);
            } catch {
              /* ignore */
            }
          }}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11.5px] text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label={`${title}ni nusxalash`}
        >
          {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre px-3.5 py-3 font-mono text-[13.5px] leading-[1.7] text-foreground scrollbar-thin">{value}</pre>
    </div>
  );
}

function useEngineState() {
  return useSyncExternalStore(pythonEngine.subscribe, () => pythonEngine.state);
}

export const ProblemView = forwardRef<
  HTMLHeadingElement,
  {
    p: Problem;
    number: number;
    total: number;
    code: string | undefined;
    run: RunResult | undefined;
    onCode: (c: string) => void;
    onRun: (r: RunResult) => void;
  }
>(function ProblemView({ p, number, total, code, run, onCode, onRun }, headingRef) {
  const value = code ?? STARTER_CODE;
  const [stdin, setStdin] = useState(p.inputExample);
  const [running, setRunning] = useState(false);
  const engine = useEngineState();

  useEffect(() => setStdin(p.inputExample), [p.id, p.inputExample]);

  const usingExample = stdin === p.inputExample;
  const matches = run?.status === "ok" && usingExample && normalizeOutput(run.stdout) === normalizeOutput(p.outputExample);

  const execute = async () => {
    if (running) return;
    setRunning(true);
    const r = await runPython(value, stdin);
    onRun(r);
    setRunning(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        execute();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <article className="mx-auto grid w-full max-w-[1400px] gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" aria-labelledby={`p${p.id}-title`}>
      {/* ── Statement ── */}
      <section className="min-w-0 xl:sticky xl:top-24 xl:max-h-[calc(100dvh-12rem)] xl:overflow-y-auto xl:pr-2 scrollbar-thin">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[13px] font-semibold tabular-nums text-primary">
            {String(number).padStart(2, "0")}
            <span className="text-muted-foreground/60"> / {total}</span>
          </span>
          <span className="h-4 w-px bg-border" />
          <Badge tone="accent">Amaliy masala</Badge>
          <DifficultyDots level={p.difficulty} className="ml-auto" />
        </div>
        <h1 id={`p${p.id}-title`} ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-[-0.015em] outline-none sm:text-[1.7rem]">
          {p.title}
        </h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {p.topics.map((t) => (
            <Badge key={t} tone="outline" className="font-medium">
              {t}
            </Badge>
          ))}
        </div>
        <RichText text={emphasiseSections(p.description)} className="mt-5 text-[15.5px] leading-[1.75] text-foreground/90" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <ExampleBlock title="Namuna kirish" value={p.inputExample} />
          <ExampleBlock title="Namuna chiqish" value={p.outputExample} />
        </div>
      </section>

      {/* ── Workspace ── */}
      <section className="min-w-0 space-y-4" aria-label="Yechim">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Yechimingizni yozing</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">
              <Kbd>Tab</Kbd> chekinish · <Kbd>Ctrl</Kbd>+<Kbd>Enter</Kbd> ishga tushirish
            </span>
            <Button variant="ghost" size="sm" onClick={() => onCode(STARTER_CODE)} aria-label="Kodni tozalash">
              <RotateCcw /> Tozalash
            </Button>
          </div>
        </div>

        <CodeEditor value={value} onChange={onCode} minLines={18} label={`${p.title} — yechim kodi`} />

        <div className="grid gap-3 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center justify-between border-b px-3.5 py-2">
              <label htmlFor={`stdin-${p.id}`} className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Kirish (stdin)
              </label>
              {!usingExample && (
                <button onClick={() => setStdin(p.inputExample)} className="text-[11.5px] font-medium text-primary hover:underline">
                  Namunani tiklash
                </button>
              )}
            </div>
            <textarea
              id={`stdin-${p.id}`}
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              spellCheck={false}
              wrap="off"
              rows={4}
              className="block w-full resize-y bg-transparent px-3.5 py-3 font-mono text-[13.5px] leading-[1.7] outline-none"
            />
          </div>

          <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-code-border bg-code-bg">
            <div className="flex items-center justify-between gap-2 border-b border-code-border px-3.5 py-2">
              <span className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <TerminalSquare className="size-3.5 text-accent" /> Natija
              </span>
              <AnimatePresence mode="wait">
                {run && !running && (
                  <motion.span key={run.at} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    {run.status === "timeout" ? (
                      <Badge tone="warning">
                        <TimerIcon /> Vaqt tugadi
                      </Badge>
                    ) : run.status === "unavailable" ? (
                      <Badge tone="outline">
                        <CircleAlert /> Python mavjud emas
                      </Badge>
                    ) : run.status === "error" ? (
                      <Badge tone="destructive">
                        <X /> Xato
                      </Badge>
                    ) : usingExample ? (
                      matches ? (
                        <Badge tone="success">
                          <Check /> Namunaga mos
                        </Badge>
                      ) : (
                        <Badge tone="destructive">
                          <X /> Namunaga mos emas
                        </Badge>
                      )
                    ) : (
                      <Badge tone="neutral">Bajarildi · {run.ms} ms</Badge>
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="min-h-[7.5rem] flex-1 overflow-auto px-3.5 py-3 font-mono text-[13.5px] leading-[1.7] scrollbar-thin" aria-live="polite">
              {running ? (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  {engine === "ready" ? "Bajarilmoqda…" : "Python muhiti yuklanmoqda (faqat birinchi marta)…"}
                </span>
              ) : run ? (
                <>
                  {run.stdout && <pre className="whitespace-pre text-foreground">{run.stdout}</pre>}
                  {run.stderr && <pre className="mt-1 whitespace-pre-wrap text-destructive">{run.stderr}</pre>}
                  {!run.stdout && !run.stderr && <span className="text-muted-foreground">(hech narsa chiqmadi)</span>}
                </>
              ) : (
                <span className="text-muted-foreground">Kodni namuna kirish bilan sinab koʻring — natija shu yerda chiqadi.</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            Yakuniy topshirishda yechimingiz namuna kirish bilan avtomatik tekshiriladi. Ishga tushirish ixtiyoriy.
          </p>
          <Button onClick={execute} disabled={running || !examConfig.python.enabled} variant="accent" className={cn("min-w-[11rem]")}>
            {running ? <Loader2 className="animate-spin" /> : <Play className="fill-current" />}
            {running ? "Bajarilmoqda" : "Ishga tushirish"}
          </Button>
        </div>
      </section>
    </article>
  );
});
