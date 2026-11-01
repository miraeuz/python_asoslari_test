import { examConfig } from "@/config/exam.config";

export interface RunResult {
  status: "ok" | "error" | "timeout" | "unavailable";
  stdout: string;
  stderr: string;
  ms?: number;
  at: number;
}

export type EngineState = "idle" | "loading" | "ready";
type Listener = (state: EngineState) => void;

let worker: Worker | null = null;
let seq = 0;
let engineState: EngineState = "idle";
const listeners = new Set<Listener>();
const LOAD_BUDGET_MS = 90_000;

const setState = (s: EngineState) => {
  engineState = s;
  listeners.forEach((l) => l(s));
};

export const pythonEngine = {
  get state() {
    return engineState;
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

/** Absolute URL of the Pyodide runtime folder (workers need absolute URLs). */
function resolveIndexURL() {
  const u = examConfig.python.indexURL;
  const base = u === "bundled" ? `${import.meta.env.BASE_URL}pyodide/` : u;
  return new URL(base.endsWith("/") ? base : base + "/", window.location.href).href;
}

function getWorker() {
  if (!worker) worker = new Worker(new URL("./python.worker.ts", import.meta.url), { type: "module" });
  return worker;
}

function killWorker() {
  worker?.terminate();
  worker = null;
  setState("idle");
}

/** Run Python code with stdin. Never throws — failures come back as a status. */
export function runPython(code: string, stdin: string): Promise<RunResult> {
  if (!examConfig.python.enabled) {
    return Promise.resolve({ status: "unavailable", stdout: "", stderr: "Python ishga tushirish oʻchirilgan.", at: Date.now() });
  }
  const id = ++seq;
  const w = getWorker();
  if (engineState !== "ready") setState("loading");

  return new Promise((resolve) => {
    let timer = 0;
    const finish = (r: RunResult, kill = false) => {
      window.clearTimeout(timer);
      w.removeEventListener("message", onMsg);
      if (kill) killWorker();
      resolve(r);
    };
    const arm = (ms: number, onTimeout: () => void) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(onTimeout, ms);
    };

    const onMsg = (e: MessageEvent) => {
      const d = e.data;
      if (d.id !== id) return;
      if (d.type === "ready") {
        setState("ready");
        arm(examConfig.python.timeoutMs, () =>
          finish(
            {
              status: "timeout",
              stdout: "",
              stderr: `Dastur ${examConfig.python.timeoutMs / 1000} soniyada tugamadi — cheksiz sikl yoki ortiqcha input() boʻlishi mumkin.`,
              at: Date.now(),
            },
            true,
          ),
        );
        return;
      }
      if (d.type === "fatal") {
        finish(
          {
            status: "unavailable",
            stdout: "",
            stderr: "Python muhitini yuklab boʻlmadi. Internet aloqasini tekshiring.\n" + d.message,
            at: Date.now(),
          },
          true,
        );
        return;
      }
      finish({ status: d.stderr ? "error" : "ok", stdout: d.stdout, stderr: d.stderr, ms: d.ms, at: Date.now() });
    };

    w.addEventListener("message", onMsg);
    arm(LOAD_BUDGET_MS, () =>
      finish({ status: "unavailable", stdout: "", stderr: "Python muhiti juda uzoq yuklanmoqda. Keyinroq urinib koʻring.", at: Date.now() }, true),
    );
    w.postMessage({ id, code, stdin, indexURL: resolveIndexURL() });
  });
}
