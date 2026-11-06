import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold tracking-[-0.005em] transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_1px_0_hsl(0_0%_100%/0.18)_inset,0_6px_18px_-6px_hsl(var(--primary)/0.65)] hover:bg-primary/92 hover:shadow-[0_1px_0_hsl(0_0%_100%/0.18)_inset,0_10px_24px_-8px_hsl(var(--primary)/0.75)]",
        accent: "bg-accent text-accent-foreground shadow-[0_6px_18px_-6px_hsl(var(--accent)/0.6)] hover:bg-accent/90",
        success: "bg-success text-success-foreground shadow-[0_6px_18px_-6px_hsl(var(--success)/0.6)] hover:bg-success/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-card/70 text-foreground shadow-[0_1px_2px_hsl(var(--shadow)/0.05)] hover:border-foreground/20 hover:bg-secondary/70",
        soft: "bg-primary-soft text-primary hover:bg-primary/15",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
        warning: "bg-warning-soft text-warning hover:bg-warning/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-[0.8125rem]",
        default: "h-11 px-4",
        lg: "h-12 px-6 text-[0.9375rem]",
        xl: "h-14 rounded-xl px-8 text-base",
        icon: "size-10",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
Button.displayName = "Button";
