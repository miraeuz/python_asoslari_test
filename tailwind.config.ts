import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const token = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1440px" } },
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', "Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        background: token("background"),
        foreground: token("foreground"),
        canvas: token("canvas"),
        primary: { DEFAULT: token("primary"), foreground: token("primary-foreground"), soft: token("primary-soft") },
        accent: { DEFAULT: token("accent"), foreground: token("accent-foreground"), soft: token("accent-soft") },
        secondary: { DEFAULT: token("secondary"), foreground: token("secondary-foreground") },
        muted: { DEFAULT: token("muted"), foreground: token("muted-foreground") },
        card: { DEFAULT: token("card"), foreground: token("card-foreground") },
        popover: { DEFAULT: token("popover"), foreground: token("popover-foreground") },
        success: { DEFAULT: token("success"), foreground: token("success-foreground"), soft: token("success-soft") },
        warning: { DEFAULT: token("warning"), foreground: token("warning-foreground"), soft: token("warning-soft") },
        destructive: { DEFAULT: token("destructive"), foreground: token("destructive-foreground"), soft: token("destructive-soft") },
        code: { bg: token("code-bg"), border: token("code-border"), gutter: token("code-gutter") },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "0 1px 2px hsl(var(--shadow) / 0.06), 0 8px 24px -8px hsl(var(--shadow) / 0.12)",
        lift: "0 2px 4px hsl(var(--shadow) / 0.06), 0 20px 48px -16px hsl(var(--shadow) / 0.28)",
        glow: "0 0 0 1px hsl(var(--primary) / 0.25), 0 10px 30px -8px hsl(var(--primary) / 0.45)",
      },
      keyframes: {
        "float-slow": { "0%,100%": { transform: "translate3d(0,0,0) scale(1)" }, "50%": { transform: "translate3d(2%,-3%,0) scale(1.05)" } },
        "pulse-dot": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.35" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      animation: {
        "float-slow": "float-slow 18s ease-in-out infinite",
        "pulse-dot": "pulse-dot 2.2s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
