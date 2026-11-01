import { AnimatePresence, motion } from "framer-motion";
import { CloudCheck, CloudUpload } from "lucide-react";
import { formatTime } from "@/lib/format";
import { useExam } from "@/store/examStore";
import { Tip } from "@/components/ui/tooltip";

export function SaveIndicator() {
  const dirty = useExam((s) => s.rev !== s.savedRev);
  const at = useExam((s) => s.lastSavedAt);
  return (
    <Tip label={at ? `Avtomatik saqlandi · ${formatTime(at)}` : "Avtomatik saqlash har 3 soniyada"}>
      <div className="hidden h-10 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted-foreground md:flex" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {dirty ? (
            <motion.span key="d" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} className="flex items-center gap-1.5">
              <CloudUpload className="size-4" /> Saqlanmoqda
            </motion.span>
          ) : (
            <motion.span key="s" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} className="flex items-center gap-1.5 text-success">
              <CloudCheck className="size-4" /> Saqlandi
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </Tip>
  );
}
