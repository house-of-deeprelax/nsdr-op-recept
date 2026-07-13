import { Link, useRouterState } from "@tanstack/react-router";
import { navItems } from "@/components/layout/Sidebar";

export function MobileTabs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-5 md:hidden"
      style={{
        background: "rgba(12,12,10,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid var(--border-default)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {navItems.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className="relative flex flex-col items-center justify-center gap-1"
          >
            {active && (
              <span
                aria-hidden
                className="absolute top-0 h-[2px] w-8 rounded-b-full"
                style={{ background: "var(--sage)" }}
              />
            )}
            <Icon
              className="h-[18px] w-[18px]"
              strokeWidth={1.5}
              style={{ color: active ? "var(--foreground)" : "rgba(240,237,230,0.35)" }}
            />
            <span
              className="text-[10px]"
              style={{
                letterSpacing: "0.02em",
                color: active ? "var(--foreground)" : "rgba(240,237,230,0.4)",
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
