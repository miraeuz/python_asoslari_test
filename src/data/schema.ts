/**
 * Shape of `questions.json` (the 200-question bank) and the normalized
 * structures the app works with. Replace the JSON file with any bank that
 * follows this shape — see README "Savollar bankini almashtirish".
 */

export type QuestionType = "single_choice" | "multiple_choice" | "true_false" | "fill_blank" | "output";
export type Difficulty = "easy" | "medium" | "hard";

export interface RawQuestion {
  id: number;
  topic: string;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  code?: string;
  options?: string[];
  correct_answer: string | string[];
  explanation: string;
}

export interface RawProblem {
  id: number;
  title: string;
  description: string;
  input_example: string;
  output_example: string;
  topics_used: string[];
  difficulty: Difficulty;
}

export interface RawBank {
  meta: Record<string, unknown> & { course?: string };
  topics_distribution?: Record<string, number>;
  questions: RawQuestion[];
  practical_problems: RawProblem[];
}

export interface Option {
  /** Stable key from the bank ("A", "B", …). Answers are stored by key. */
  key: string;
  text: string;
}

export interface Question {
  id: number;
  topic: string;
  /** "2.13" etc. when the bank's topics_distribution provides numbering. */
  topicNumber?: string;
  type: QuestionType;
  difficulty: Difficulty;
  /** Question prose without the fenced code block (code is rendered separately). */
  prompt: string;
  code?: string;
  options: Option[];
  correct: string | string[];
  explanation: string;
}

export interface Problem {
  id: number;
  title: string;
  description: string;
  inputExample: string;
  outputExample: string;
  topics: string[];
  difficulty: Difficulty;
}

export interface Bank {
  course: string;
  topics: { number?: string; name: string; count: number }[];
  questions: Question[];
  problems: Problem[];
}

const OPTION_RE = /^([A-Z])\)\s?([\s\S]*)$/;
const FENCE_RE = /```[a-z]*\n[\s\S]*?```/g;

export function normalizeBank(raw: RawBank): Bank {
  const topicNumbers = new Map<string, string>();
  const topics: Bank["topics"] = [];
  for (const [label, count] of Object.entries(raw.topics_distribution ?? {})) {
    const m = label.match(/^(\d+(?:\.\d+)*)\s+(.+)$/);
    const name = m ? m[2] : label;
    if (m) topicNumbers.set(name, m[1]);
    topics.push({ number: m?.[1], name, count });
  }
  // Banks without topics_distribution still work: derive topics from questions.
  if (topics.length === 0) {
    const counts = new Map<string, number>();
    raw.questions.forEach((q) => counts.set(q.topic, (counts.get(q.topic) ?? 0) + 1));
    counts.forEach((count, name) => topics.push({ name, count }));
  }

  const questions: Question[] = raw.questions.map((q) => {
    const options: Option[] = (q.options ?? []).map((o, i) => {
      const m = o.match(OPTION_RE);
      return m ? { key: m[1], text: m[2] } : { key: String.fromCharCode(65 + i), text: o };
    });
    const prompt = q.code ? q.question.replace(FENCE_RE, "").trim() : q.question.trim();
    return {
      id: q.id,
      topic: q.topic,
      topicNumber: topicNumbers.get(q.topic),
      type: q.type,
      difficulty: q.difficulty,
      prompt,
      code: q.code,
      options,
      correct: q.correct_answer,
      explanation: q.explanation,
    };
  });

  const problems: Problem[] = raw.practical_problems.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    inputExample: p.input_example,
    outputExample: p.output_example,
    topics: p.topics_used,
    difficulty: p.difficulty,
  }));

  return { course: String(raw.meta?.course ?? "Python Academy"), topics, questions, problems };
}
