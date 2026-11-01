import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useHighlighterReady } from "@/hooks/useHighlighter";
import { tokenize } from "@/lib/highlighter";
import { cn } from "@/lib/utils";
import { TokenLine } from "./TokenLine";
import { PythonIcon } from "@/components/brand/PythonIcon";

/**
 * Read-only code block styled after a VS Code editor tab:
 * file tab, line-number gutter, theme-matched colors, copy button.
 */
export function CodeBlock({
  code,
  filename = "main.py",
  className,
  compact,
  allowCopy = true,
}: {
  code: string;
  filename?: string;
  className?: string;
  compact?: boolean;
  allowCopy?: boolean;
}) {
  const ready = useHighlighterReady();
  const lines = useMemo(() => tokenize(code), [code, ready]);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <figure
      className={cn(
        "group overflow-hidden rounded-xl border border-code-border bg-code-bg shadow-[0_1px_2px_hsl(var(--shadow)/0.05),0_12px_32px_-18px_hsl(var(--shadow)/0.35)]",
        className,
      )}
    >
      <figcaption className="flex h-9 items-stretch justify-between border-b border-code-border bg-[hsl(var(--code-bg))] pr-1.5 dark:bg-[hsl(0_0%_9.5%)]">
        <div className="flex items-stretch">
          <div className="flex items-center gap-1.5 border-r border-code-border bg-code-bg px-3.5 text-[12.5px] text-foreground/80 shadow-[inset_0_2px_0_hsl(var(--primary))]">
            <PythonIcon className="size-3.5" />
            <span className="font-mono">{filename}</span>
          </div>
        </div>
        {allowCopy && (
          <button
            type="button"
            onClick={copy}
            className="my-1 inline-flex items-center gap-1.5 rounded-md px-2 text-[12px] font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Kodni nusxalash"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span key="ok" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1.5 text-success">
                  <Check className="size-3.5" /> Nusxalandi
                </motion.span>
              ) : (
                <motion.span key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1.5">
                  <Copy className="size-3.5" /> Nusxa
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}
      </figcaption>
      <div className={cn("overflow-x-auto scrollbar-thin", compact ? "py-2.5" : "py-3.5")}>
        <pre className="min-w-max font-mono text-[13.5px] leading-[1.7] sm:text-[14px]">
          <code className="grid">
            {lines.map((tokens, i) => (
              <span key={i} className="grid grid-cols-[3.25rem_1fr] hover:bg-foreground/[0.035]">
                <span className="select-none pr-4 text-right text-code-gutter/80 tabular-nums">{i + 1}</span>
                <span className="whitespace-pre pr-6 text-foreground">
                  <TokenLine tokens={tokens} />
                </span>
              </span>
            ))}
          </code>
        </pre>
      </div>
    </figure>
  );
}
