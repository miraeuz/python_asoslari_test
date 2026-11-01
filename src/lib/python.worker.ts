/// <reference lib="webworker" />
/**
 * Runs a student's Python solution with a given stdin inside Pyodide.
 * Lives in a worker so an infinite loop can be killed by terminating it.
 */
type PyodideLike = {
  globals: { set(name: string, value: unknown): void };
  runPythonAsync(code: string): Promise<unknown>;
};

let ready: Promise<PyodideLike> | null = null;

const HARNESS = `
import sys, io, traceback
_out = io.StringIO()
_err = io.StringIO()
sys.stdin = io.StringIO(__stdin)
_old_out, _old_err = sys.stdout, sys.stderr
sys.stdout, sys.stderr = _out, _err
try:
    exec(compile(__code, "yechim.py", "exec"), {"__name__": "__main__"})
except SystemExit:
    pass
except BaseException:
    etype, value, tb = sys.exc_info()
    lines = traceback.format_exception(etype, value, tb)
    # hide the harness frame, keep the student's frames
    print("".join(l for l in lines if "<exec>" not in l), file=_err, end="")
finally:
    sys.stdout, sys.stderr = _old_out, _old_err
(_out.getvalue(), _err.getvalue())
`;

self.onmessage = async (e: MessageEvent<{ id: number; code: string; stdin: string; indexURL: string }>) => {
  const { id, code, stdin, indexURL } = e.data;
  try {
    if (!ready) {
      ready = (async () => {
        const mod = await import(/* @vite-ignore */ `${indexURL}pyodide.mjs`);
        return (await mod.loadPyodide({ indexURL })) as PyodideLike;
      })();
    }
    const py = await ready;
    // engine loaded — the main thread starts the execution time limit now
    self.postMessage({ id, type: "ready" });
    py.globals.set("__code", code);
    py.globals.set("__stdin", stdin.endsWith("\n") ? stdin : stdin + "\n");
    const started = performance.now();
    const res = (await py.runPythonAsync(HARNESS)) as { toJs(): [string, string]; destroy(): void };
    const [stdout, stderr] = res.toJs();
    res.destroy?.();
    self.postMessage({ id, type: "done", stdout, stderr, ms: Math.round(performance.now() - started) });
  } catch (err) {
    ready = null;
    self.postMessage({ id, type: "fatal", message: String(err) });
  }
};
