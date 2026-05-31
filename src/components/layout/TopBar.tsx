import { Bell } from "lucide-react";

export function TopBar() {
  return (
    <header className="glass sticky top-0 z-10 flex h-14 items-center justify-between rounded-none border-x-0 border-t-0 px-6">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
        <h1 className="text-sm font-display tracking-tight">NSDR op Recept</h1>
        <span className="text-xs text-muted-foreground">· Deeprelax Institute</span>
      </div>
      <button
        className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground focus-sage"
        aria-label="Meldingen"
      >
        <Bell className="h-4 w-4" />
      </button>
    </header>
  );
}
