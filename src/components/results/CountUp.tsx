import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

export function CountUp({ value, duration = 1.4, suffix = "" }: { value: number; duration?: number; suffix?: string }) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) {
      setV(value);
      return;
    }
    const c = animate(0, value, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [value, duration, reduce]);
  return (
    <>
      {v}
      {suffix}
    </>
  );
}
