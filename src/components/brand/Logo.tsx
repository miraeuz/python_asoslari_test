import { examConfig } from "@/config/exam.config";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-[0.6875rem] bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" className="size-[58%]">
        <path d="M10 8h7a5 5 0 0 1 0 10h-3.5v6H10z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="22" cy="22" r="2.6" fill="currentColor" />
      </svg>
      <span className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
    </span>
  );
}

export function Logo({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && (
        <div className="leading-none">
          <div className="text-[0.9375rem] font-bold tracking-tight">{examConfig.brand.academy}</div>
          <div className="mt-1 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {examConfig.brand.application} · {examConfig.brand.title}
          </div>
        </div>
      )}
    </div>
  );
}
