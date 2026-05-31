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

const SIDEBAR_TRANSITION = { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const };

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
      transition={SIDEBAR_TRANSITION}
      className="relative z-20 flex h-screen shrink-0 flex-col border-r border-[rgba(var(--paper-rgb),0.06)] bg-background"
    >
      <div className="flex h-14 items-center px-4">
        <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--sage)]" style={{ boxShadow: "0 0 10px var(--sage)" }} />
          <motion.span
            animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -8 : 0 }}
            transition={SIDEBAR_TRANSITION}
            className="font-display whitespace-nowrap text-sm"
          >
            Deeprelax
          </motion.span>
        </Link>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-0.5 px-2">
        {items.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group relative flex h-10 items-center rounded-md px-3 text-sm transition-colors",
                active ? "text-foreground" : "text-[rgba(var(--paper-rgb),0.5)] hover:text-foreground",
              )}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-[var(--sage)]"
                />
              )}
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <motion.span
                animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -8 : 0 }}
                transition={SIDEBAR_TRANSITION}
                className="ml-3 whitespace-nowrap overflow-hidden"
                style={{ pointerEvents: collapsed ? "none" : undefined }}
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[rgba(var(--paper-rgb),0.06)] p-3">
        <div className="flex h-10 items-center px-1">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[rgba(var(--paper-rgb),0.06)] text-[10px] text-[rgba(var(--paper-rgb),0.7)]">
            PM
          </div>
          <motion.div
            animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -8 : 0 }}
            transition={SIDEBAR_TRANSITION}
            className="ml-3 min-w-0 whitespace-nowrap"
            style={{ pointerEvents: collapsed ? "none" : undefined }}
          >
            <div className="truncate text-xs">Preschana Misri</div>
            <div className="text-label mt-0.5">MD</div>
          </motion.div>
        </div>
        <button
          onClick={onToggle}
          className="mt-2 flex h-8 w-full items-center justify-center rounded-md text-[rgba(var(--paper-rgb),0.4)] hover:bg-[rgba(var(--paper-rgb),0.04)] hover:text-foreground"
          aria-label={collapsed ? "Open menu" : "Sluit menu"}
        >
          <motion.span
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={SIDEBAR_TRANSITION}
            className="inline-flex"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" strokeWidth={1.5} /> : <ChevronsLeft className="h-4 w-4" strokeWidth={1.5} />}
          </motion.span>
        </button>
      </div>
    </motion.aside>
  );
}
