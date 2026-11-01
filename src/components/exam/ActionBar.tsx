import { ArrowLeft, ArrowRight, Bookmark, Eraser, LayoutGrid, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Tip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ActionBar({
  index,
  total,
  marked,
  canClear,
  onPrev,
  onNext,
  onMark,
  onClear,
  onSubmit,
  onOpenNav,
  submitLabel,
}: {
  index: number;
  total: number;
  marked: boolean;
  canClear: boolean;
  onPrev: () => void;
  onNext: () => void;
  onMark: () => void;
  onClear: () => void;
  onSubmit: () => void;
  onOpenNav: () => void;
  submitLabel: string;
}) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  return (
    <div className="glass fixed inset-x-0 bottom-0 z-30 border-t border-border/70 safe-bottom lg:sticky lg:bottom-0 lg:mt-auto">
      <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-3 pt-3 sm:gap-3 sm:px-6 lg:pb-3">
        <Tip label={<span className="flex items-center gap-2">Oldingi <Kbd className="bg-transparent text-background/80">←</Kbd></span>} side="top">
          <Button variant="outline" onClick={onPrev} disabled={isFirst} aria-label="Oldingi savol" className="px-3 sm:px-4">
            <ArrowLeft /> <span className="hidden sm:inline">Oldingi</span>
          </Button>
        </Tip>

        <Button variant="secondary" onClick={onOpenNav} className="px-3 tabular-nums lg:hidden" aria-label="Savollar navigatorini ochish">
          <LayoutGrid />
          <span>
            {index + 1}
            <span className="text-muted-foreground">/{total}</span>
          </span>
        </Button>

        <div className="flex items-center gap-1 sm:gap-2">
          <Tip label={<span className="flex items-center gap-2">{marked ? "Belgini olib tashlash" : "Keyinroq qaytish uchun belgilash"} <Kbd className="bg-transparent text-background/80">M</Kbd></span>} side="top">
            <Button
              variant={marked ? "warning" : "ghost"}
              onClick={onMark}
              aria-pressed={marked}
              aria-label="Belgilash"
              className={cn("px-3", marked && "ring-1 ring-warning/30")}
            >
              <Bookmark className={cn(marked && "fill-current")} />
              <span className="hidden md:inline">{marked ? "Belgilangan" : "Belgilash"}</span>
            </Button>
          </Tip>
          <Tip label={<span className="flex items-center gap-2">Javobni tozalash <Kbd className="bg-transparent text-background/80">Del</Kbd></span>} side="top">
            <Button variant="ghost" onClick={onClear} disabled={!canClear} aria-label="Javobni tozalash" className="px-3">
              <Eraser /> <span className="hidden md:inline">Tozalash</span>
            </Button>
          </Tip>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={onSubmit} className="hidden md:inline-flex">
            <Send /> {submitLabel}
          </Button>
          {isLast ? (
            <Button onClick={onSubmit} className="min-w-[7.5rem] md:hidden">
              <Send /> Topshirish
            </Button>
          ) : null}
          <Tip label={<span className="flex items-center gap-2">Keyingi <Kbd className="bg-transparent text-background/80">→</Kbd></span>} side="top">
            <Button onClick={onNext} disabled={isLast} aria-label="Keyingi savol" className={cn("min-w-[7.5rem]", isLast && "hidden md:inline-flex")}>
              <span>Keyingi</span> <ArrowRight />
            </Button>
          </Tip>
        </div>
      </div>
    </div>
  );
}
