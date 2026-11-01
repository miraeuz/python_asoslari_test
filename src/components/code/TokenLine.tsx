import type { Token } from "@/lib/highlighter";

/** One highlighted line. Colors switch with the theme through CSS variables. */
export function TokenLine({ tokens }: { tokens: Token[] }) {
  if (tokens.length === 0 || (tokens.length === 1 && tokens[0].content === "")) return <>{"​"}</>;
  return (
    <>
      {tokens.map((t, i) =>
        t.light ? (
          <span key={i} className="tok" style={{ ["--tl" as string]: t.light, ["--td" as string]: t.dark ?? t.light }}>
            {t.content}
          </span>
        ) : (
          <span key={i}>{t.content}</span>
        ),
      )}
    </>
  );
}
