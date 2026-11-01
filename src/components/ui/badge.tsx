import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold [&_svg]:size-3.5", {
  variants: {
    tone: {
      neutral: "border-border bg-secondary/70 text-secondary-foreground",
      primary: "border-transparent bg-primary-soft text-primary",
      accent: "border-transparent bg-accent-soft text-accent",
      success: "border-transparent bg-success-soft text-success",
      warning: "border-transparent bg-warning-soft text-warning",
      destructive: "border-transparent bg-destructive-soft text-destructive",
      outline: "border-border bg-transparent text-muted-foreground",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function Badge({ className, tone, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
