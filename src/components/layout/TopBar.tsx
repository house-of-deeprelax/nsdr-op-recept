import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function computeInitials(name: string | null | undefined, email: string | null | undefined): string {
  const source = (name ?? "").trim();
  if (source) {
    const parts = source.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase().slice(0, 2);
  }
  const e = (email ?? "").trim();
  if (e) return e.slice(0, 2).toUpperCase();
  return "··";
}

export function TopBar() {
  const [initials, setInitials] = useState<string>("··");

  useEffect(() => {
    let active = true;

    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        if (active) setInitials("··");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      setInitials(computeInitials(profile?.full_name, profile?.email ?? user.email));
    }

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <header
      className="sticky top-0 z-10 flex h-11 items-center justify-between bg-background px-4 sm:px-5"
      style={{ borderBottom: "1px solid var(--border-default)" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="block h-2 w-2 shrink-0 rounded-full"
          style={{ background: "var(--sage)", boxShadow: "0 0 10px var(--sage)" }}
        />
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="font-display-700 whitespace-nowrap leading-none text-[13px] text-foreground sm:text-[14px]">
            NSDR op Recept
          </span>
          <span className="hidden leading-none text-[rgba(240,237,230,0.25)] md:inline">·</span>
          <span
            className="hidden whitespace-nowrap leading-none text-[11px] uppercase md:inline"
            style={{ letterSpacing: "0.1em", color: "rgba(240,237,230,0.25)" }}
          >
            Deeprelax Institute
          </span>
        </div>
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
          {initials}
        </div>
      </div>
    </header>
  );
}
