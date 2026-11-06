import { cn } from "@/lib/utils";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-b-2 bg-card px-1.5 font-mono text-[0.6562rem] font-semibold text-muted-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
