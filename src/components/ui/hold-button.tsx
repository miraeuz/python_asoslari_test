import * as React from "react";
import { motion, useAnimationControls } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Press-and-hold to confirm. Prevents accidental final submission while
 * staying fully keyboard accessible (hold Space / Enter).
 */
export function HoldButton({
  onConfirm,
  duration = 1400,
  children,
  disabled,
  className,
}: {
  onConfirm: () => void;
  duration?: number;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const controls = useAnimationControls();
  const timer = React.useRef<number>();
  const [holding, setHolding] = React.useState(false);

  const start = () => {
    if (disabled) return;
    setHolding(true);
    controls.start({ scaleX: 1, transition: { duration: duration / 1000, ease: "linear" } });
    timer.current = window.setTimeout(() => {
      setHolding(false);
      onConfirm();
    }, duration);
  };
  const cancel = () => {
    window.clearTimeout(timer.current);
    setHolding(false);
    controls.start({ scaleX: 0, transition: { duration: 0.25 } });
  };
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={(e) => (e.key === " " || e.key === "Enter") && cancel()}
      aria-label="Bosib turing: imtihonni yakuniy topshirish"
      className={cn(
        "relative isolate inline-flex h-14 select-none items-center justify-center gap-2 overflow-hidden rounded-xl bg-foreground px-8 text-base font-semibold text-background shadow-lift transition active:scale-[0.99] disabled:opacity-40",
        className,
      )}
    >
      <motion.span
        aria-hidden
        initial={{ scaleX: 0 }}
        animate={controls}
        style={{ originX: 0 }}
        className="absolute inset-0 -z-10 bg-gradient-to-r from-primary to-accent"
      />
      <span className="relative">{holding ? "Qoʻyib yubormang…" : children}</span>
    </button>
  );
}
