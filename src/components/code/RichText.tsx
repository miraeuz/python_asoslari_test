import { Fragment } from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal, safe renderer for bank text: `inline code`, **bold**, paragraphs
 * and line breaks. No HTML is ever injected.
 */
export function RichInline({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.startsWith("`") && p.endsWith("`") && p.length > 1) {
          return (
            <code key={i} className="inline-code whitespace-pre-wrap">
              {p.slice(1, -1)}
            </code>
          );
        }
        if (p.startsWith("**") && p.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {p.slice(2, -2)}
            </strong>
          );
        }
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </span>
  );
}

export function RichText({ text, className, inHeading }: { text: string; className?: string; inHeading?: boolean }) {
  const paragraphs = text.trim().split(/\n{2,}/);
  const Wrap = inHeading ? "span" : "div";
  const Para = inHeading ? "span" : "p";
  return (
    <Wrap className={cn("block space-y-3", className)}>
      {paragraphs.map((para, i) => (
        <Para key={i} className="block">
          {para.split("\n").map((line, j, arr) => (
            <Fragment key={j}>
              <RichInline text={line} />
              {j < arr.length - 1 && <br />}
            </Fragment>
          ))}
        </Para>
      ))}
    </Wrap>
  );
}
