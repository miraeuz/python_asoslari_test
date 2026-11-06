import { useRef } from "react";
import { create } from "zustand";
import { examConfig } from "@/config/exam.config";
import { bank, questionById } from "@/data/bank";
import type { Answer } from "@/lib/grading";
import type { RunResult } from "@/lib/python";
import { newSeed } from "@/lib/random";
import { drawPart, optionOrder } from "@/lib/selection";

export type Phase = "welcome" | "exam" | "transition" | "review" | "results";
export type PartStatus = "pending" | "active" | "paused" | "submitted" | "expired";

export interface PartRuntime {
  id: string;
  itemIds: number[];
  /** Display order of option keys per question id. */
  optionOrders: Record<number, string[]>;
  remainingMs: number;
  /** Wall-clock time the clock last started; null while paused. */
  activeSince: number | null;
  status: PartStatus;
  cursor: number;
  startedAt?: number;
  submittedAt?: number;
}

export interface Student {
  firstName: string;
  lastName: string;
  nickname?: string;
}

export interface Attempt {
  id: string;
  seed: number;
  createdAt: number;
  student: Student | null;
  phase: Phase;
  parts: PartRuntime[];
  activePart: number;
  /** Set when the transition screen is showing: the part just finished. */
  transitionFrom?: number;
  answers: Record<string, Answer>;
  visited: Record<string, 1>;
  marked: Record<string, 1>;
  code: Record<string, string>;
  /** Runs the student triggered while solving. */
  runs: Record<string, RunResult>;
  /** Runs made at final submit to check solutions against the example. */
  finalRuns: Record<string, RunResult>;
  finishedAt?: number;
}

interface Snapshot {
  v: 1;
  attempt: Attempt;
}

interface ExamState {
  attempt: Attempt | null;
  /** A saved, unfinished or finished attempt found on startup. */
  saved: Attempt | null;
  rev: number;
  savedRev: number;
  lastSavedAt: number | null;
  /** +1 = forward, -1 = backward. Drives slide direction. */
  direction: 1 | -1;

  start(student: Student | null): void;
  resume(): void;
  discardSaved(): void;
  reset(): void;

  goTo(index: number): void;
  next(): void;
  prev(): void;
  setAnswer(key: string, answer: Answer | null): void;
  toggleMark(key: string): void;
  setCode(key: string, code: string): void;
  setRun(key: string, run: RunResult, final?: boolean): void;

  submitPart(): void;
  expireActivePart(): void;
  beginPart(index: number): void;
  openPart(index: number, cursor?: number): void;
  goReview(): void;
  finishExam(): void;

  persistNow(): void;
}

export const itemKey = (partId: string, itemId: number) => `${partId}:${itemId}`;

export function remainingOf(part: PartRuntime, now = Date.now()) {
  if (part.activeSince == null) return part.remainingMs;
  return Math.max(0, part.remainingMs - (now - part.activeSince));
}

export const partConfig = (index: number) => examConfig.parts[index];

function pause(part: PartRuntime, now: number): PartRuntime {
  return { ...part, remainingMs: remainingOf(part, now), activeSince: null };
}

function loadSaved(): Attempt | null {
  try {
    const raw = localStorage.getItem(examConfig.storage.attemptKey);
    if (!raw) return null;
    const snap = JSON.parse(raw) as Snapshot;
    if (snap?.v !== 1 || !snap.attempt?.parts) return null;
    // Bank or config changed shape since this attempt → discard rather than crash.
    if (snap.attempt.parts.length !== examConfig.parts.length) return null;
    return snap.attempt;
  } catch {
    return null;
  }
}

function writeSnapshot(attempt: Attempt | null) {
  try {
    if (!attempt) localStorage.removeItem(examConfig.storage.attemptKey);
    else localStorage.setItem(examConfig.storage.attemptKey, JSON.stringify({ v: 1, attempt } satisfies Snapshot));
    return true;
  } catch {
    return false;
  }
}

export const useExam = create<ExamState>()((set, get) => {
  /** Apply an attempt mutation and bump the revision (autosave watches it). */
  const mutate = (fn: (a: Attempt) => Attempt | void) => {
    const a = get().attempt;
    if (!a) return;
    const copy: Attempt = { ...a };
    const out = fn(copy) ?? copy;
    set((s) => ({ attempt: out, rev: s.rev + 1 }));
  };

  const markVisited = (a: Attempt) => {
    const part = a.parts[a.activePart];
    const id = part.itemIds[part.cursor];
    if (id != null) a.visited = { ...a.visited, [itemKey(part.id, id)]: 1 };
  };

  /** Pause the active part, store a status, and route to the next screen. */
  const closeActivePart = (status: "submitted" | "expired") =>
    mutate((a) => {
      const now = Date.now();
      const idx = a.activePart;
      a.parts = a.parts.map((p, i) =>
        i === idx ? { ...pause(p, now), status, submittedAt: now, remainingMs: status === "expired" ? 0 : remainingOf(p, now) } : p,
      );
      const nextPending = a.parts.findIndex((p) => p.status === "pending");
      if (nextPending !== -1) {
        a.phase = "transition";
        a.transitionFrom = idx;
      } else {
        a.phase = "review";
        a.transitionFrom = undefined;
      }
    });

  return {
    attempt: null,
    saved: loadSaved(),
    rev: 0,
    savedRev: 0,
    lastSavedAt: null,
    direction: 1,

    start(student) {
      const seed = newSeed();
      const now = Date.now();
      const parts: PartRuntime[] = examConfig.parts.map((cfg, i) => {
        const itemIds = drawPart(cfg, bank, seed + i * 7919);
        const optionOrders: Record<number, string[]> = {};
        if (cfg.kind === "questions") {
          for (const id of itemIds) {
            const q = questionById.get(id)!;
            if (q.options.length) optionOrders[id] = optionOrder(q.options.map((o) => o.key), seed ^ (id * 2654435761));
          }
        }
        return {
          id: cfg.id,
          itemIds,
          optionOrders,
          remainingMs: cfg.durationMinutes * 60_000,
          activeSince: i === 0 ? now : null,
          status: i === 0 ? "active" : "pending",
          cursor: 0,
          startedAt: i === 0 ? now : undefined,
        };
      });
      const attempt: Attempt = {
        id: `${now.toString(36)}-${seed.toString(36)}`,
        seed,
        createdAt: now,
        student,
        phase: "exam",
        parts,
        activePart: 0,
        answers: {},
        visited: { [itemKey(parts[0].id, parts[0].itemIds[0])]: 1 },
        marked: {},
        code: {},
        runs: {},
        finalRuns: {},
      };
      writeSnapshot(attempt);
      set({ attempt, saved: null, rev: 1, savedRev: 1, lastSavedAt: now, direction: 1 });
    },

    resume() {
      const saved = get().saved;
      if (!saved) return;
      set({ attempt: saved, saved: null, rev: 1, savedRev: 1, lastSavedAt: Date.now() });
    },

    discardSaved() {
      writeSnapshot(null);
      set({ saved: null });
    },

    reset() {
      writeSnapshot(null);
      set({ attempt: null, saved: null, rev: 0, savedRev: 0, lastSavedAt: null });
    },

    goTo(index) {
      const a = get().attempt;
      if (!a) return;
      const part = a.parts[a.activePart];
      const clamped = Math.max(0, Math.min(part.itemIds.length - 1, index));
      if (clamped === part.cursor) return;
      set({ direction: clamped > part.cursor ? 1 : -1 });
      mutate((m) => {
        m.parts = m.parts.map((p, i) => (i === m.activePart ? { ...p, cursor: clamped } : p));
        markVisited(m);
      });
    },
    next() {
      const a = get().attempt;
      if (a) get().goTo(a.parts[a.activePart].cursor + 1);
    },
    prev() {
      const a = get().attempt;
      if (a) get().goTo(a.parts[a.activePart].cursor - 1);
    },

    setAnswer(key, answer) {
      mutate((a) => {
        const answers = { ...a.answers };
        if (answer) answers[key] = answer;
        else delete answers[key];
        a.answers = answers;
      });
    },
    toggleMark(key) {
      mutate((a) => {
        const marked = { ...a.marked };
        if (marked[key]) delete marked[key];
        else marked[key] = 1;
        a.marked = marked;
      });
    },
    setCode(key, code) {
      mutate((a) => {
        a.code = { ...a.code, [key]: code };
      });
    },
    setRun(key, run, final) {
      mutate((a) => {
        if (final) a.finalRuns = { ...a.finalRuns, [key]: run };
        else a.runs = { ...a.runs, [key]: run };
      });
    },

    submitPart: () => closeActivePart("submitted"),
    expireActivePart: () => closeActivePart("expired"),

    beginPart(index) {
      mutate((a) => {
        const now = Date.now();
        a.parts = a.parts.map((p, i) => (i === index ? { ...p, status: "active", activeSince: now, startedAt: p.startedAt ?? now } : p));
        a.activePart = index;
        a.phase = "exam";
        a.transitionFrom = undefined;
        markVisited(a);
      });
      set({ direction: 1 });
    },

    openPart(index, cursor) {
      const a = get().attempt;
      if (!a) return;
      const target = a.parts[index];
      const reopenable =
        target.status === "paused" ||
        (target.status === "submitted" && examConfig.allowReturnToSubmittedParts && remainingOf(target) > 0);
      if (!reopenable && target.status !== "active") return;
      mutate((m) => {
        const now = Date.now();
        m.parts = m.parts.map((p, i) => {
          if (i === index) return { ...p, status: "active", activeSince: now, cursor: cursor ?? p.cursor };
          if (p.status === "active") return { ...pause(p, now), status: "paused" };
          return p;
        });
        m.activePart = index;
        m.phase = "exam";
        markVisited(m);
      });
    },

    goReview() {
      mutate((a) => {
        const now = Date.now();
        a.parts = a.parts.map((p) => (p.status === "active" ? { ...pause(p, now), status: "paused" } : p));
        a.phase = "review";
      });
    },

    finishExam() {
      mutate((a) => {
        const now = Date.now();
        a.parts = a.parts.map((p) =>
          p.status === "active" || p.status === "paused" || p.status === "pending"
            ? { ...pause(p, now), status: "submitted", submittedAt: p.submittedAt ?? now }
            : p,
        );
        a.finishedAt = now;
        a.phase = "results";
      });
      get().persistNow();
    },

    persistNow() {
      const { attempt, rev } = get();
      if (writeSnapshot(attempt)) set({ savedRev: rev, lastSavedAt: Date.now() });
    },
  };
});

/** Convenience selectors */
export const useAttempt = () => useExam((s) => s.attempt);

/**
 * The open attempt for screens that require one. While a screen animates
 * out after the attempt was closed (reset), it keeps the last attempt it
 * rendered instead of crashing on `null`.
 */
export function useOpenAttempt(): Attempt {
  const a = useExam((s) => s.attempt);
  const last = useRef(a);
  if (a) last.current = a;
  return last.current!;
}
