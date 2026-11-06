import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  Bookmark,
  Clock3,
  Code2,
  History,
  Keyboard,
  ListChecks,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { CodeBlock } from "@/components/code/CodeBlock";
import { ThemeMenu } from "@/components/exam/ThemeMenu";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { examConfig } from "@/config/exam.config";
import { bank } from "@/data/bank";
import { formatClock, formatDate, formatDuration } from "@/lib/format";
import { remainingOf, useExam } from "@/store/examStore";

const ease = [0.22, 1, 0.36, 1] as const;

export function Backdrop() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className={`absolute -left-[12%] -top-[22%] h-[62vmax] w-[62vmax] rounded-full bg-primary/[0.16] blur-[6.875rem] dark:bg-primary/[0.2] ${reduce ? "" : "animate-float-slow"}`} />
      <div
        className={`absolute -bottom-[28%] -right-[10%] h-[56vmax] w-[56vmax] rounded-full bg-accent/[0.14] blur-[7.5rem] dark:bg-accent/[0.14] ${reduce ? "" : "animate-float-slow"}`}
        style={{ animationDelay: "-9s" }}
      />
      <div
        className="absolute inset-0 opacity-[0.5] dark:opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border)/0.55) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)/0.55) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 55% at 50% 30%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 30%, black, transparent 75%)",
        }}
      />
      <div className="noise absolute inset-0 opacity-[0.035] mix-blend-overlay" />
    </div>
  );
}

const heroCode = `ism = input().strip().title()
ball = 87
print(f"{ism}: {ball} ball ({ball / 100:.0%})")`;

export function WelcomeScreen() {
  const saved = useExam((s) => s.saved);
  const { start, resume, discardSaved } = useExam.getState();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [nick, setNick] = useState("");
  const [agreed, setAgreed] = useState(false);
  const reduce = useReducedMotion();

  const totalItems = examConfig.parts.reduce((s, p) => s + p.count, 0);
  const totalMin = examConfig.parts.reduce((s, p) => s + p.durationMinutes, 0);
  const canStart = (!examConfig.collectStudentInfo || (first.trim() && last.trim())) && agreed;

  const begin = () => {
    if (!canStart) return;
    start(examConfig.collectStudentInfo ? { firstName: first.trim(), lastName: last.trim(), nickname: nick.trim() || undefined } : null);
  };

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease, delay },
  });

  const rules = [
    { icon: ListChecks, text: `Imtihon ${examConfig.parts.length} qismdan iborat. Har bir qismning oʻz taymeri bor.` },
    { icon: Bookmark, text: "Qism ichida savollar orasida erkin yurasiz va shubhali savollarni belgilab qoʻyasiz." },
    { icon: TimerReset, text: "Qism vaqti tugasa, u avtomatik topshiriladi. Taymer siz shu qismdaligingizda yuradi." },
    { icon: Save, text: "Javoblar har 3 soniyada saqlanadi. Sahifa yopilib qolsa — davom ettirasiz (vaqt toʻxtamaydi)." },
    { icon: Code2, text: "3-qismda kodni brauzerning oʻzida ishga tushirib, namuna bilan solishtirasiz." },
    { icon: Keyboard, text: "Klaviatura bilan ishlash mumkin: ← → oʻtish, A–D tanlash, M belgilash." },
  ];

  const savedIsFinished = saved?.phase === "results";
  const savedActive = saved?.parts.find((p) => p.status === "active");

  return (
    <div className="relative min-h-dvh">
      <Backdrop />
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <ThemeMenu />
      </header>

      <main className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-4 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14 lg:pt-10">
        {/* ── Hero ── */}
        <section>
          <motion.div {...fade(0)} className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-soft backdrop-blur">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-success" />
            {examConfig.brand.application} · {bank.questions.length} savollik bank
          </motion.div>

          <motion.h1 {...fade(0.06)} className="mt-6 text-balance text-[2.6rem] font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-[4.3rem]">
            {examConfig.brand.title}
            <span className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">yakuniy imtihoni</span>
          </motion.h1>

          <motion.p {...fade(0.12)} className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {examConfig.brand.tagline}
          </motion.p>

          <motion.div {...fade(0.18)} className="mt-8 grid gap-3 sm:grid-cols-3">
            {examConfig.parts.map((p, i) => (
              <div key={p.id} className="surface hairline relative overflow-hidden p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-primary">0{i + 1}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    {p.durationMinutes} daq
                  </span>
                </div>
                <div className="mt-3 text-2xl font-bold tabular-nums tracking-tight">
                  {p.count}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">{p.kind === "problems" ? "masala" : "savol"}</span>
                </div>
                <div className="mt-1 text-[0.8125rem] leading-snug text-muted-foreground">{p.subtitle}</div>
              </div>
            ))}
          </motion.div>

          <motion.div {...fade(0.24)} className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <BookOpenCheck className="size-4 text-accent" /> Jami {totalItems} ta topshiriq
            </span>
            <span className="flex items-center gap-2">
              <Clock3 className="size-4 text-accent" /> {formatDuration(totalMin * 60_000)}
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-accent" /> Oʻtish bali — {examConfig.passPercent}%
            </span>
          </motion.div>

          <motion.div {...fade(0.3)} className="relative mt-10 hidden max-w-xl md:block">
            <motion.div animate={reduce ? undefined : { y: [0, -6, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
              <CodeBlock code={heroCode} filename="natija.py" allowCopy={false} compact />
            </motion.div>
            <div className="absolute -bottom-5 right-6 rounded-xl border bg-card px-4 py-2.5 font-mono text-sm shadow-lift">
              <span className="text-accent">❯</span> Malika: 87 ball (87%)
            </div>
          </motion.div>
        </section>

        {/* ── Start card ── */}
        <motion.section {...fade(0.14)} className="lg:pt-6" aria-label="Imtihonni boshlash">
          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 rounded-2xl border border-primary/30 bg-primary-soft/60 p-5 shadow-soft backdrop-blur"
            >
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <History className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-semibold">{savedIsFinished ? "Oxirgi natijangiz saqlangan" : "Tugallanmagan imtihon topildi"}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {saved.student ? `${saved.student.firstName} ${saved.student.lastName} · ` : ""}
                    {formatDate(saved.createdAt)}
                    {savedActive && ` · qolgan vaqt ${formatClock(remainingOf(savedActive))}`}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={resume}>
                  {savedIsFinished ? "Natijani koʻrish" : "Davom etish"} <ArrowRight />
                </Button>
                <Button variant="ghost" onClick={discardSaved}>
                  <RotateCcw /> {savedIsFinished ? "Oʻchirish" : "Bekor qilish va yangidan"}
                </Button>
              </div>
            </motion.div>
          )}

          <div className="glass rounded-[1.4rem] border p-6 shadow-lift sm:p-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              <Sparkles className="size-3.5" /> Imtihonga kirish
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Tayyormisiz?</h2>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                begin();
              }}
            >
              {examConfig.collectStudentInfo && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="first">Ism</Label>
                      <Input id="first" autoComplete="given-name" value={first} onChange={(e) => setFirst(e.target.value)} placeholder="Malika" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="last">Familiya</Label>
                      <Input id="last" autoComplete="family-name" value={last} onChange={(e) => setLast(e.target.value)} placeholder="Karimova" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="nick">
                      Guruh yoki taxallus <span className="font-normal text-muted-foreground">(ixtiyoriy)</span>
                    </Label>
                    <Input id="nick" value={nick} onChange={(e) => setNick(e.target.value)} placeholder="PY-204" />
                  </div>
                </>
              )}

              <details className="group rounded-xl border bg-card/60 open:bg-card" open>
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold">
                  Imtihon qoidalari
                  <ArrowRight className="size-4 text-muted-foreground transition group-open:rotate-90" />
                </summary>
                <ul className="space-y-2.5 px-4 pb-4">
                  {rules.map((r) => (
                    <li key={r.text} className="flex gap-3 text-[0.8438rem] leading-relaxed text-muted-foreground">
                      <r.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                      {r.text}
                    </li>
                  ))}
                </ul>
              </details>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl px-1 py-1 text-sm">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 size-[1.125rem] shrink-0 accent-[hsl(var(--primary))]" />
                <span className="text-muted-foreground">
                  Qoidalar bilan tanishdim. Imtihonni <span className="font-semibold text-foreground">mustaqil</span> topshiraman.
                </span>
              </label>

              <div className="pt-2">
                <MagneticButton type="submit" size="xl" disabled={!canStart} className="w-full sm:w-auto">
                  Imtihonni boshlash <ArrowRight className="transition group-hover:translate-x-0.5" />
                </MagneticButton>
                {saved && !savedIsFinished && <p className="mt-3 text-xs text-muted-foreground">Yangi imtihon boshlansa, tugallanmagan urinish oʻchiriladi.</p>}
              </div>
            </form>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
