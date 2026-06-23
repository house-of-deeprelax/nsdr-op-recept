import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { checkMyAccess } from "@/lib/access.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    // Re-check whitelist / expiry every navigation
    try {
      const access = await checkMyAccess();
      if (!access.allowed) {
        await supabase.auth.signOut();
        throw redirect({ to: "/auth" });
      }
      return { user: data.user, isAdmin: access.isAdmin };
    } catch (err) {
      // Network/server failure: don't lock the user out, but no admin context.
      if (err && typeof err === "object" && "to" in err) throw err;
      return { user: data.user, isAdmin: false };
    }
  },
  component: () => <Outlet />,
});
