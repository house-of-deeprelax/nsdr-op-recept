import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutDashboard, FilePlus2, FileText, Settings, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { to: string; label: string; icon: typeof LayoutDashboard };

const items: Item[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/nieuw", label: "Nieuw recept", icon: FilePlus2 },
  { to: "/recepten", label: "Recepten", icon: FileText },
  { to: "/instellingen", label: "Instellingen", icon: Settings },
];

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="glass relative z-20 flex h-screen shrink-0 flex-col rounded-none border-y-0 border-l-0"
    >
      <div className="flex h-14 items-center justify-between px-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
          </span>
          {!collapsed && (
            <span className="font-display text-sm tracking-tight">Deeprelax</span>
          )}
        </Link>
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1 px-2">
        {items.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group relative flex h-10 items-center gap-3 rounded-lg px-2.5 text-sm transition-colors",
                active
                  ? "bg-primary/12 text-foreground"
                  : "text-foreground/65 hover:bg-white/[0.04] hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-primary"
                />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-3">
        <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/25 text-xs font-semibold text-accent">
            PM
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-xs font-medium">Preschana Misri</div>
              <div className="truncate text-[10px] text-muted-foreground">MD</div>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="mt-3 flex w-full items-center justify-center rounded-md py-1.5 text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
          aria-label={collapsed ? "Open menu" : "Sluit menu"}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>
    </motion.aside>
  );
}
