import { useMemo, useRef } from "react";
import { useHighlighterReady } from "@/hooks/useHighlighter";
import { tokenize } from "@/lib/highlighter";
import { cn } from "@/lib/utils";
import { TokenLine } from "./TokenLine";

const INDENT = "    ";

/** Replace the selection with `text`, keeping the browser's undo history when possible. */
function insertText(el: HTMLTextAreaElement, text: string) {
  el.focus();
  // execCommand keeps Ctrl+Z working in textareas. An empty insert must use
  // "delete" — Chrome misplaces the caret for insertText("").
  const ok = text === "" ? document.execCommand?.("delete", false) : document.execCommand?.("insertText", false, text);
  if (ok) return;
  const { selectionStart: s, selectionEnd: e, value } = el;
  // Use the native setter so React's change tracking sees the new value.
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
  setter?.call(el, value.slice(0, s) + text + value.slice(e));
  el.selectionStart = el.selectionEnd = s + text.length;
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * Lightweight code editor: transparent <textarea> over a Shiki-highlighted
 * <pre>. Python-friendly keys: Tab / Shift+Tab indent, Enter keeps
 * indentation (+4 after ":"). Esc then Tab moves focus out (no keyboard trap).
 */
export function CodeEditor({
  value,
  onChange,
  minLines = 16,
  className,
  label = "Python kodi",
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  minLines?: number;
  className?: string;
  label?: string;
  readOnly?: boolean;
}) {
  const ready = useHighlighterReady();
  const taRef = useRef<HTMLTextAreaElement>(null);
  const escaped = useRef(false);
  const lines = useMemo(() => tokenize(value), [value, ready]);
  const lineCount = Math.max(minLines, lines.length);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    if (e.key === "Escape") {
      escaped.current = true;
      return;
    }
    if (e.key === "Tab") {
      if (escaped.current) {
        escaped.current = false;
        return; // let focus move on
      }
      e.preventDefault();
      const { selectionStart: s, selectionEnd: end, value: v } = el;
      const lineStart = v.lastIndexOf("\n", s - 1) + 1;
      const multi = v.slice(s, end).includes("\n");
      if (!e.shiftKey && !multi) {
        insertText(el, INDENT);
        return;
      }
      // indent / dedent every selected line
      const block = v.slice(lineStart, end);
      const changed = block
        .split("\n")
        .map((l) => (e.shiftKey ? l.replace(/^ {1,4}/, "") : INDENT + l))
        .join("\n");
      el.setSelectionRange(lineStart, end);
      insertText(el, changed);
      el.setSelectionRange(lineStart, lineStart + changed.length);
      return;
    }
    escaped.current = false;
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const { selectionStart: s, value: v } = el;
      const lineStart = v.lastIndexOf("\n", s - 1) + 1;
      const line = v.slice(lineStart, s);
      const indent = line.match(/^\s*/)?.[0] ?? "";
      const extra = /:\s*(#.*)?$/.test(line) ? INDENT : "";
      insertText(el, "\n" + indent + extra);
      return;
    }
    if (e.key === "Backspace") {
      const { selectionStart: s, selectionEnd: end, value: v } = el;
      if (s !== end) return;
      const lineStart = v.lastIndexOf("\n", s - 1) + 1;
      const before = v.slice(lineStart, s);
      if (before.length > 0 && /^ +$/.test(before) && before.length % 4 === 0) {
        e.preventDefault();
        el.setSelectionRange(s - 4, s);
        insertText(el, "");
      }
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-code-border bg-code-bg focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10",
        className,
      )}
    >
      <div className="max-h-[70dvh] overflow-auto scrollbar-thin" onClick={() => taRef.current?.focus()}>
        <div className="relative flex min-w-max font-mono text-[13.5px] leading-[1.7] sm:text-[14px]">
          <div
            aria-hidden
            className="sticky left-0 z-10 select-none border-r border-code-border/70 bg-code-bg py-3.5 pl-3 pr-3 text-right text-code-gutter/80 tabular-nums"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <div className="relative min-w-0 flex-1">
            <pre aria-hidden className="m-0 whitespace-pre py-3.5 pl-4 pr-10 text-foreground">
              {lines.map((t, i) => (
                <div key={i}>
                  <TokenLine tokens={t} />
                </div>
              ))}
              {/* keep the textarea one line taller so a trailing newline is visible */}
              {"​"}
            </pre>
            <textarea
              ref={taRef}
              value={value}
              readOnly={readOnly}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={readOnly ? undefined : onKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              wrap="off"
              aria-label={label}
              aria-describedby="editor-help"
              className="absolute inset-0 h-full w-full resize-none overflow-hidden whitespace-pre bg-transparent py-3.5 pl-4 pr-10 font-mono text-transparent caret-primary outline-none selection:bg-primary/25"
              style={{ WebkitTextFillColor: "transparent", tabSize: 4 }}
            />
          </div>
        </div>
      </div>
      <p id="editor-help" className="sr-only">
        Tab — 4 ta boʻsh joy. Shift+Tab — chekinishni kamaytirish. Muharrirdan chiqish uchun Esc, keyin Tab bosing.
      </p>
    </div>
  );
}
