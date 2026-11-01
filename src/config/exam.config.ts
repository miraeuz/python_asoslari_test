/**
 * ─────────────────────────────────────────────────────────────
 *  Exam configuration — the single place to change the exam.
 * ─────────────────────────────────────────────────────────────
 *  • Add / remove / reorder parts in `parts`.
 *  • `kind: "questions"` draws from the question bank,
 *    `kind: "problems"` draws from practical_problems.
 *  • `pool.topicNumbers` uses the numbering from the bank's
 *    `topics_distribution` keys ("2.1 Sintaksis…" → "2.1").
 *    Use `pool: "all"` to draw from every topic.
 */

export type PartKind = "questions" | "problems";

export interface PartConfig {
  id: string;
  title: string;
  subtitle: string;
  kind: PartKind;
  /** How many items to draw. Clamped to the pool size. */
  count: number;
  durationMinutes: number;
  pool: "all" | { topicNumbers?: string[]; topics?: string[] };
  /** Points per correct item. */
  points: number;
}

export interface ExamConfig {
  brand: {
    academy: string;
    application: string;
    title: string;
    tagline: string;
  };
  parts: PartConfig[];
  /** Random order of questions inside a part (seeded per attempt). */
  shuffleQuestions: boolean;
  /** Random order of answer options (letters are re-labelled, grading uses bank keys). */
  shuffleOptions: boolean;
  /** Pick questions proportionally to each topic's size in the pool. */
  stratifyByTopic: boolean;
  /** After submitting a part, a student may return to it from the final review while that part still has time left. */
  allowReturnToSubmittedParts: boolean;
  passPercent: number;
  autosaveIntervalMs: number;
  /** Ask for a name before starting. */
  collectStudentInfo: boolean;
  /** Show explanations and correct answers on the results page. */
  revealAnswersInResults: boolean;
  /**
   * In-browser Python (Pyodide) for running practical-problem solutions.
   * `indexURL: "bundled"` uses the copy in public/pyodide (works offline);
   * or give a CDN URL such as "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/".
   */
  python: { enabled: boolean; indexURL: "bundled" | string; timeoutMs: number };
  storage: { attemptKey: string; prefsKey: string };
}

export const examConfig: ExamConfig = {
  brand: {
    academy: "Python Academy",
    application: "Application 2",
    title: "Python Asoslari",
    tagline: "Bilimingizni real kod, real natija va hayotiy masalalar orqali sinang.",
  },
  parts: [
    {
      id: "p1",
      title: "1-qism",
      subtitle: "Sintaksis, oʻzgaruvchilar va maʼlumot turlari",
      kind: "questions",
      count: 50,
      durationMinutes: 60,
      pool: { topicNumbers: ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8"] },
      points: 1,
    },
    {
      id: "p2",
      title: "2-qism",
      subtitle: "Sonlar, mantiqiy qiymatlar va satrlar",
      kind: "questions",
      count: 50,
      durationMinutes: 60,
      pool: { topicNumbers: ["2.9", "2.10", "2.11", "2.12", "2.13", "2.14", "2.15", "2.16"] },
      points: 1,
    },
    {
      id: "p3",
      title: "3-qism",
      subtitle: "Hayotiy amaliy masalalar",
      kind: "problems",
      count: 20,
      durationMinutes: 60,
      pool: "all",
      points: 2,
    },
  ],
  shuffleQuestions: true,
  shuffleOptions: true,
  stratifyByTopic: true,
  allowReturnToSubmittedParts: true,
  passPercent: 60,
  autosaveIntervalMs: 3000,
  collectStudentInfo: true,
  revealAnswersInResults: true,
  python: {
    enabled: true,
    indexURL: "bundled",
    timeoutMs: 8000,
  },
  storage: { attemptKey: "pa-exam:attempt:v1", prefsKey: "pa-exam:prefs" },
};
