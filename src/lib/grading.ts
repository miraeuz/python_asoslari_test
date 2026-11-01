import type { Question } from "@/data/schema";

export type Answer =
  | { kind: "choice"; value: string }
  | { kind: "multi"; values: string[] }
  | { kind: "text"; value: string };

export type Verdict = "correct" | "wrong" | "unanswered";

/** Normalize program output: unify newlines, drop trailing spaces per line and trailing blank lines. Leading spaces stay meaningful. */
export const normalizeOutput = (s: string) =>
  s
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/, ""))
    .join("\n")
    .replace(/\n+$/, "");

const normalizeBlank = (s: string) => s.trim().replace(/^`|`$/g, "").replace(/\s+/g, " ");

export function isAnswered(a: Answer | undefined): boolean {
  if (!a) return false;
  if (a.kind === "multi") return a.values.length > 0;
  return a.value.trim().length > 0;
}

export function gradeQuestion(q: Question, a: Answer | undefined): Verdict {
  if (!isAnswered(a)) return "unanswered";
  const ans = a!;
  switch (q.type) {
    case "single_choice":
    case "true_false":
      return ans.kind === "choice" && ans.value === q.correct ? "correct" : "wrong";
    case "multiple_choice": {
      if (ans.kind !== "multi") return "wrong";
      const want = [...(q.correct as string[])].sort().join();
      return [...ans.values].sort().join() === want ? "correct" : "wrong";
    }
    case "fill_blank":
      return ans.kind === "text" && normalizeBlank(ans.value) === normalizeBlank(String(q.correct)) ? "correct" : "wrong";
    case "output":
      return ans.kind === "text" && normalizeOutput(ans.value) === normalizeOutput(String(q.correct)) ? "correct" : "wrong";
  }
}

export function answerToText(q: Question, a: Answer | undefined, labelOf: (key: string) => string): string {
  if (!isAnswered(a)) return "—";
  if (a!.kind === "multi") return a!.values.map(labelOf).sort().join(", ");
  if (a!.kind === "choice") return q.type === "true_false" ? (a!.value === "True" ? "Toʻgʻri" : "Notoʻgʻri") : labelOf(a!.value);
  return a!.value;
}
