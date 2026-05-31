import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FilePlus2, FileText, Settings } from "lucide-react";

type Item = { to: string; label: string; icon: typeof LayoutDashboard };

const items: Item[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/nieuw", label: "Nieuw recept", icon: FilePlus2 },
  { to: "/recepten", label: "Recepten", icon: FileText },
  { to: "/instellingen", label: "Instellingen", icon: Settings },
];

// Kept for API compatibility with __root.tsx; sidebar is permanently a 48px icon rail.
export function Sidebar(_props: { collapsed?: boolean; onToggle?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className="relative z-20 flex h-screen w-12 shrink-0 flex-col bg-background"
      style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}
    >
      <nav className="mt-14 flex flex-1 flex-col">
        {items.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className="relative flex h-12 items-center justify-center transition-opacity"
              style={{ opacity: active ? 1 : undefined }}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-6 -translate-y-1/2"
                  style={{ width: 2, background: "var(--sage)" }}
                />
              )}
              <Icon
                className="h-4 w-4 transition-colors"
                strokeWidth={1.5}
                style={{ color: active ? "var(--foreground)" : "rgba(240,237,230,0.2)" }}
              />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
