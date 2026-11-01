import type { HighlighterCore, ThemedToken } from "shiki/core";

let instance: HighlighterCore | null = null;
let loading: Promise<HighlighterCore> | null = null;
const subscribers = new Set<() => void>();

/** Lazily create one Shiki highlighter (VS Code Light+ / Dark+, Python only). */
export function loadHighlighter(): Promise<HighlighterCore> {
  if (instance) return Promise.resolve(instance);
  if (!loading) {
    loading = (async () => {
      const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
        import("shiki/core"),
        import("shiki/engine/javascript"),
      ]);
      const h = await createHighlighterCore({
        themes: [import("@shikijs/themes/light-plus"), import("@shikijs/themes/dark-plus")],
        langs: [import("@shikijs/langs/python")],
        engine: createJavaScriptRegexEngine(),
      });
      instance = h;
      subscribers.forEach((fn) => fn());
      return h;
    })();
  }
  return loading;
}

export const getHighlighter = () => instance;
export const onHighlighterReady = (fn: () => void) => {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
};

export type Token = Pick<ThemedToken, "content"> & { light?: string; dark?: string };

/** Tokenize synchronously if the highlighter is ready, else return plain lines. */
export function tokenize(code: string): Token[][] {
  const h = instance;
  if (!h) return code.split("\n").map((l) => [{ content: l }]);
  const { tokens } = h.codeToTokens(code, { lang: "python", themes: { light: "light-plus", dark: "dark-plus" } });
  return tokens.map((line) =>
    line.map((t) => ({
      content: t.content,
      light: (t.htmlStyle as Record<string, string> | undefined)?.color,
      dark: (t.htmlStyle as Record<string, string> | undefined)?.["--shiki-dark"],
    })),
  );
}
