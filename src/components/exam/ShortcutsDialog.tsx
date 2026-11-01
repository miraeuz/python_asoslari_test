import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";

const rows: [string[], string][] = [
  [["←", "→"], "Oldingi / keyingi savol"],
  [["A", "B", "C", "D"], "Variantni tanlash (yoki 1–4)"],
  [["T", "F"], "Toʻgʻri / Notoʻgʻri"],
  [["M"], "Keyinroq qaytish uchun belgilash"],
  [["Del"], "Javobni tozalash"],
  [["N"], "Navigatorni ochish / yigʻish"],
  [["Ctrl", "Enter"], "Amaliy masalada kodni ishga tushirish"],
  [["Esc", "Tab"], "Kod muharriridan chiqish"],
  [["?"], "Shu oynani ochish"],
];

export function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Klaviatura yorliqlari</DialogTitle>
          <DialogDescription>Sichqonchasiz, tez va qulay ishlash uchun.</DialogDescription>
        </DialogHeader>
        <ul className="divide-y rounded-xl border">
          {rows.map(([keys, label]) => (
            <li key={label} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="flex gap-1">
                {keys.map((k) => (
                  <Kbd key={k}>{k}</Kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
