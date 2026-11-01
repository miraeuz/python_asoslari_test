import { examConfig } from "@/config/exam.config";
import { problemById, questionById } from "@/data/bank";
import type { Problem, Question } from "@/data/schema";
import { itemKey, type Attempt } from "@/store/examStore";
import { gradeQuestion, isAnswered, normalizeOutput } from "./grading";
import type { RunResult } from "./python";

export type ItemVerdict = "correct" | "wrong" | "unanswered" | "checking" | "unchecked";

export interface ItemResult {
  key: string;
  partIndex: number;
  index: number;
  verdict: ItemVerdict;
  question?: Question;
  problem?: Problem;
  run?: RunResult;
}

export interface PartResult {
  index: number;
  title: string;
  subtitle: string;
  kind: "questions" | "problems";
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  pending: number;
  points: number;
  maxPoints: number;
  percent: number;
  timeSpentMs: number;
  items: ItemResult[];
}

export interface TopicResult {
  topic: string;
  number?: string;
  correct: number;
  total: number;
  percent: number;
}

export interface ExamResults {
  parts: PartResult[];
  topics: TopicResult[];
  points: number;
  maxPoints: number;
  percent: number;
  passed: boolean;
  timeSpentMs: number;
  checking: boolean;
}

export const STARTER_CODE = "# Yechimingizni shu yerga yozing\n";

export const hasSolution = (code: string | undefined) => !!code && code.trim() !== "" && code.trim() !== STARTER_CODE.trim();

export function problemVerdict(p: Problem, code: string | undefined, run: RunResult | undefined): ItemVerdict {
  if (!hasSolution(code)) return "unanswered";
  if (!run) return "checking";
  if (run.status === "unavailable") return "unchecked";
  if (run.status !== "ok") return "wrong";
  return normalizeOutput(run.stdout) === normalizeOutput(p.outputExample) ? "correct" : "wrong";
}

export function computeResults(a: Attempt): ExamResults {
  const topicMap = new Map<string, TopicResult>();

  const parts: PartResult[] = a.parts.map((part, pi) => {
    const cfg = examConfig.parts[pi];
    const items: ItemResult[] = part.itemIds.map((id, index) => {
      const key = itemKey(part.id, id);
      if (cfg.kind === "problems") {
        const problem = problemById.get(id)!;
        const run = a.finalRuns[key];
        return { key, partIndex: pi, index, problem, run, verdict: problemVerdict(problem, a.code[key], run) };
      }
      const question = questionById.get(id)!;
      const verdict = gradeQuestion(question, a.answers[key]);
      const t = topicMap.get(question.topic) ?? { topic: question.topic, number: question.topicNumber, correct: 0, total: 0, percent: 0 };
      t.total++;
      if (verdict === "correct") t.correct++;
      topicMap.set(question.topic, t);
      return { key, partIndex: pi, index, question, verdict };
    });
    const count = (v: ItemVerdict) => items.filter((i) => i.verdict === v).length;
    const correct = count("correct");
    const maxPoints = items.length * cfg.points;
    const start = part.startedAt;
    const timeSpentMs = start ? cfg.durationMinutes * 60_000 - part.remainingMs : 0;
    return {
      index: pi,
      title: cfg.title,
      subtitle: cfg.subtitle,
      kind: cfg.kind,
      total: items.length,
      correct,
      wrong: count("wrong"),
      unanswered: count("unanswered"),
      pending: count("checking") + count("unchecked"),
      points: correct * cfg.points,
      maxPoints,
      percent: maxPoints ? Math.round((correct * cfg.points * 100) / maxPoints) : 0,
      timeSpentMs: Math.max(0, timeSpentMs),
      items,
    };
  });

  const points = parts.reduce((s, p) => s + p.points, 0);
  const maxPoints = parts.reduce((s, p) => s + p.maxPoints, 0);
  const percent = maxPoints ? Math.round((points * 100) / maxPoints) : 0;
  const topics = [...topicMap.values()]
    .map((t) => ({ ...t, percent: Math.round((t.correct * 100) / t.total) }))
    .sort((x, y) => (x.number ?? x.topic).localeCompare(y.number ?? y.topic, undefined, { numeric: true }));

  return {
    parts,
    topics,
    points,
    maxPoints,
    percent,
    passed: percent >= examConfig.passPercent,
    timeSpentMs: parts.reduce((s, p) => s + p.timeSpentMs, 0),
    checking: parts.some((p) => p.items.some((i) => i.verdict === "checking")),
  };
}

/** Status of one navigator cell. */
export type CellState = "current" | "answered" | "visited" | "unvisited";

export function partProgress(a: Attempt, pi: number) {
  const part = a.parts[pi];
  const kind = examConfig.parts[pi].kind;
  let answered = 0;
  let marked = 0;
  for (const id of part.itemIds) {
    const key = itemKey(part.id, id);
    const done = kind === "problems" ? hasSolution(a.code[key]) : isAnswered(a.answers[key]);
    if (done) answered++;
    if (a.marked[key]) marked++;
  }
  return { answered, marked, total: part.itemIds.length, unanswered: part.itemIds.length - answered };
}

export function isItemAnswered(a: Attempt, pi: number, id: number) {
  const part = a.parts[pi];
  const key = itemKey(part.id, id);
  return examConfig.parts[pi].kind === "problems" ? hasSolution(a.code[key]) : isAnswered(a.answers[key]);
}
