import { motion, useReducedMotion } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAutosave } from "@/hooks/useAutosave";
import { useLeaveGuard } from "@/hooks/useLeaveGuard";
import { useApplyTheme } from "@/hooks/useTheme";
import { ExamScreen } from "@/screens/ExamScreen";
import { ResultsScreen } from "@/screens/ResultsScreen";
import { ReviewScreen } from "@/screens/ReviewScreen";
import { TransitionScreen } from "@/screens/TransitionScreen";
import { WelcomeScreen } from "@/screens/WelcomeScreen";
import { useExam } from "@/store/examStore";

export default function App() {
  useApplyTheme();
  useAutosave();
  const phase = useExam((s) => s.attempt?.phase ?? "welcome");
  const activePart = useExam((s) => s.attempt?.activePart ?? 0);
  const reduce = useReducedMotion();
  useLeaveGuard(phase === "exam" || phase === "transition" || phase === "review");

  // Each part gets its own page key so moving Part 1 → 2 → 3 animates as a new page.
  const pageKey = phase === "exam" ? `exam-${activePart}` : phase;

  return (
    <TooltipProvider>
      <a href="#main" className="sr-only z-[100] rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Asosiy qismga oʻtish
      </a>
      {/* Enter-only page animation: a new key mounts a fresh page immediately.
          No exit phase means the old page can never stay on screen or receive clicks. */}
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, y: reduce ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {phase === "welcome" && <WelcomeScreen />}
        {phase === "exam" && <ExamScreen />}
        {phase === "transition" && <TransitionScreen />}
        {phase === "review" && <ReviewScreen />}
        {phase === "results" && <ResultsScreen />}
      </motion.div>
    </TooltipProvider>
  );
}
