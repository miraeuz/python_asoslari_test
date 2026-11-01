import { useEffect, useState } from "react";

export function useMediaQuery(q: string) {
  const [match, setMatch] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const fn = () => setMatch(mq.matches);
    mq.addEventListener("change", fn);
    fn();
    return () => mq.removeEventListener("change", fn);
  }, [q]);
  return match;
}

export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
