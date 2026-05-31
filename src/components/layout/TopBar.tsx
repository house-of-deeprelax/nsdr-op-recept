import { Bell } from "lucide-react";

export function TopBar() {
  return (
    <header
      className="sticky top-0 z-10 flex h-11 items-center justify-between bg-background px-5"
      style={{ borderBottom: "1px solid var(--border-default)" }}
    >
      <div className="flex items-center gap-3">
        <span
          className="block h-2 w-2 rounded-full"
          style={{ background: "var(--sage)", boxShadow: "0 0 10px var(--sage)" }}
        />
        <span className="font-display-700 text-[14px] text-foreground">NSDR op Recept</span>
        <span className="text-[rgba(240,237,230,0.25)]">·</span>
        <span
          className="text-[11px] uppercase"
          style={{ letterSpacing: "0.1em", color: "rgba(240,237,230,0.25)" }}
        >
          Deeprelax Institute
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          aria-label="Notificaties"
          className="text-[rgba(240,237,230,0.3)] transition-colors hover:text-foreground"
        >
          <Bell className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <div
          className="grid h-7 w-7 place-items-center rounded-full text-[10px]"
          style={{ background: "rgba(140,158,110,0.15)", color: "var(--sage)", letterSpacing: "0.05em" }}
        >
          PM
        </div>
      </div>
    </header>
  );
}
