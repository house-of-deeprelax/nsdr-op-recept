export function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center border-b border-[rgba(var(--paper-rgb),0.06)] bg-background px-10">
      <div className="flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-[var(--sage)]" style={{ boxShadow: "0 0 10px var(--sage)" }} />
        <span className="font-display text-sm">NSDR op Recept</span>
        <span className="text-label ml-2">Deeprelax Institute</span>
      </div>
    </header>
  );
}
