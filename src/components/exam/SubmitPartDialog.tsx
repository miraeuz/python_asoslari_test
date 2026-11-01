import { AlertTriangle, Bookmark, CheckCircle2, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { examConfig } from "@/config/exam.config";
import { formatClock } from "@/lib/format";
import { isItemAnswered, partProgress } from "@/lib/results";
import { itemKey, useExam } from "@/store/examStore";
import { NavCell } from "./QuestionNavigator";

export function SubmitPartDialog({
  open,
  onOpenChange,
  remainingMs,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  remainingMs: number;
  onConfirm: () => void;
}) {
  const attempt = useExam((s) => s.attempt)!;
  const goTo = useExam((s) => s.goTo);
  const pi = attempt.activePart;
  const part = attempt.parts[pi];
  const cfg = examConfig.parts[pi];
  const prog = partProgress(attempt, pi);
  const isLastPart = !attempt.parts.some((p) => p.status === "pending");
  const unanswered = part.itemIds.map((id, idx) => ({ id, idx })).filter(({ id }) => !isItemAnswered(attempt, pi, id));
  const marked = part.itemIds.map((id, idx) => ({ id, idx })).filter(({ id }) => attempt.marked[itemKey(part.id, id)]);

  const jump = (idx: number) => {
    goTo(idx);
    onOpenChange(false);
  };

  const stats = [
    { label: "Javob berilgan", value: prog.answered, icon: CheckCircle2, cls: "text-success bg-success-soft" },
    { label: "Javobsiz", value: prog.unanswered, icon: AlertTriangle, cls: "text-destructive bg-destructive-soft" },
    { label: "Belgilangan", value: prog.marked, icon: Bookmark, cls: "text-warning bg-warning-soft" },
    { label: "Qolgan vaqt", value: formatClock(remainingMs), icon: Clock3, cls: "text-primary bg-primary-soft" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{cfg.title}ni topshirasizmi?</DialogTitle>
          <DialogDescription>
            {isLastPart
              ? "Shundan soʻng umumiy koʻrinish sahifasi ochiladi — u yerda barcha qismlarni koʻrib chiqib, imtihonni yakunlaysiz."
              : `Shundan soʻng keyingi qismga oʻtasiz. ${examConfig.allowReturnToSubmittedParts ? "Vaqti qolgan qismga yakuniy koʻrinishdan qaytish mumkin; qaytmaguningizcha vaqt toʻxtab turadi." : "Bu qismga qaytib boʻlmaydi."}`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-3">
              <span className={`grid size-8 place-items-center rounded-lg ${s.cls}`}>
                <s.icon className="size-4" />
              </span>
              <div className="mt-2 text-xl font-bold tabular-nums">{s.value}</div>
              <div className="text-[11.5px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {unanswered.length > 0 && (
          <div>
            <p className="mb-2 text-[13px] font-semibold">Javobsiz savollar — bosib oʻting</p>
            <div className="flex flex-wrap gap-1.5">
              {unanswered.map(({ id, idx }) => (
                <NavCell key={id} number={idx + 1} kind="unvisited" answered={false} marked={!!attempt.marked[itemKey(part.id, id)]} size="sm" onClick={() => jump(idx)} />
              ))}
            </div>
          </div>
        )}
        {marked.length > 0 && (
          <div>
            <p className="mb-2 text-[13px] font-semibold">Belgilangan savollar</p>
            <div className="flex flex-wrap gap-1.5">
              {marked.map(({ id, idx }) => (
                <NavCell key={id} number={idx + 1} kind={isItemAnswered(attempt, pi, id) ? "answered" : "visited"} answered={isItemAnswered(attempt, pi, id)} marked size="sm" onClick={() => jump(idx)} />
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Davom etish
          </Button>
          <Button onClick={onConfirm}>Ha, {cfg.title}ni topshirish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
