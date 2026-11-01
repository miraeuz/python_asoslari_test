import { Check, Monitor, Moon, Palette as PaletteIcon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useResolvedDark } from "@/hooks/useTheme";
import { palettes, usePrefs, type ThemeMode } from "@/store/prefsStore";

const modes: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Yorugʻ", icon: Sun },
  { id: "dark", label: "Qorongʻi", icon: Moon },
  { id: "system", label: "Tizim boʻyicha", icon: Monitor },
];

export function ThemeMenu() {
  const { mode, palette, setMode, setPalette } = usePrefs();
  const dark = useResolvedDark();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Mavzu va ranglar">
          {dark ? <Moon /> : <Sun />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Rejim</DropdownMenuLabel>
        {modes.map((m) => (
          <DropdownMenuItem key={m.id} onSelect={() => setMode(m.id)}>
            <m.icon className="text-muted-foreground" />
            <span className="flex-1">{m.label}</span>
            {mode === m.id && <Check className="text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-1.5">
          <PaletteIcon className="size-3" /> Akademiya ranglari
        </DropdownMenuLabel>
        {palettes.map((p) => (
          <DropdownMenuItem key={p.id} onSelect={() => setPalette(p.id)}>
            <span className="flex -space-x-1">
              <span className="size-4 rounded-full ring-2 ring-popover" style={{ background: p.swatch[0] }} />
              <span className="size-4 rounded-full ring-2 ring-popover" style={{ background: p.swatch[1] }} />
            </span>
            <span className="flex-1">{p.name}</span>
            {palette === p.id && <Check className="text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
