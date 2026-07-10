import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { checkMyAccess } from "@/lib/access.functions";

// Cache access-check per user for the tab session so we don't hit the server
// on every navigation. Invalidated on SIGNED_IN / SIGNED_OUT below.
type AccessResult = { allowed: boolean; isAdmin: boolean };
let accessCache: { userId: string; promise: Promise<AccessResult> } | null = null;

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
      accessCache = null;
    }
  });
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // getSession() reads locally — no network call. Sufficient for a route
    // gate; server functions re-validate the bearer token independently.
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) throw redirect({ to: "/auth" });

    try {
      if (!accessCache || accessCache.userId !== user.id) {
        accessCache = { userId: user.id, promise: checkMyAccess() };
      }
      const access = await accessCache.promise;
      if (!access.allowed) {
        accessCache = null;
        await supabase.auth.signOut();
        throw redirect({ to: "/auth" });
      }
      return { user, isAdmin: access.isAdmin };
    } catch (err) {
      if (err && typeof err === "object" && "to" in err) throw err;
      accessCache = null;
      return { user, isAdmin: false };
    }
  },
  component: () => <Outlet />,
});
