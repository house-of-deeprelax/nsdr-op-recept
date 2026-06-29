import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTabs } from "@/components/layout/MobileTabs";
import { TopBar } from "@/components/layout/TopBar";
import { Toaster } from "@/components/ui/sonner";
import { Preloader } from "@/components/Preloader";

const SESSION_MAX_MS = 30 * 24 * 60 * 60 * 1000; // 30 dagen
const LOGGED_IN_AT_KEY = "nsdr:loggedInAt";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NSDR op Recept" },
      { name: "description", content: "NSDR Recept op is een AI-gestuurd hulpmiddel voor zorgprofessionals om gepersonaliseerde wellness-voorschriften te genereren." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "NSDR op Recept" },
      { property: "og:description", content: "NSDR Recept op is een AI-gestuurd hulpmiddel voor zorgprofessionals om gepersonaliseerde wellness-voorschriften te genereren." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "NSDR op Recept" },
      { name: "twitter:description", content: "NSDR Recept op is een AI-gestuurd hulpmiddel voor zorgprofessionals om gepersonaliseerde wellness-voorschriften te genereren." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/863adbf6-be8b-4f96-9b42-d149e08515dd/id-preview-87e362f0--178f1863-e05e-4a8b-9925-cf67bfeaa835.lovable.app-1780352998731.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/863adbf6-be8b-4f96-9b42-d149e08515dd/id-preview-87e362f0--178f1863-e05e-4a8b-9925-cf67bfeaa835.lovable.app-1780352998731.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow:wght@700;800&family=DM+Sans:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const enforceMaxAge = async (
      supabase: typeof import("@/integrations/supabase/client")["supabase"],
      reason: "expired" | "missing",
    ) => {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
      localStorage.removeItem(LOGGED_IN_AT_KEY);
      toast.error(
        reason === "expired"
          ? "Je sessie is verlopen (max. 1 maand). Log opnieuw in."
          : "Je sessie is verlopen. Log opnieuw in.",
      );
    };

    import("@/integrations/supabase/client").then(async ({ supabase }) => {
      if (!mounted) return;

      // Check sessie-leeftijd bij elke app-load
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const raw = localStorage.getItem(LOGGED_IN_AT_KEY);
        const loggedInAt = raw ? parseInt(raw, 10) : NaN;
        if (!Number.isFinite(loggedInAt)) {
          // Bestaande sessie zonder timestamp: zet nu, zodat we vanaf hier 30 dagen tellen
          localStorage.setItem(LOGGED_IN_AT_KEY, String(Date.now()));
        } else if (Date.now() - loggedInAt > SESSION_MAX_MS) {
          await enforceMaxAge(supabase, "expired");
        }
      }

      const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
        if (event === "SIGNED_IN") {
          localStorage.setItem(LOGGED_IN_AT_KEY, String(Date.now()));
        }
        if (event === "SIGNED_OUT") {
          localStorage.removeItem(LOGGED_IN_AT_KEY);
        }
        if (event === "TOKEN_REFRESHED") {
          const raw = localStorage.getItem(LOGGED_IN_AT_KEY);
          const loggedInAt = raw ? parseInt(raw, 10) : NaN;
          if (Number.isFinite(loggedInAt) && Date.now() - loggedInAt > SESSION_MAX_MS) {
            await enforceMaxAge(supabase, "expired");
            return;
          }
        }
        if (
          event !== "SIGNED_IN" &&
          event !== "SIGNED_OUT" &&
          event !== "USER_UPDATED"
        )
          return;
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      });
      (window as unknown as { __nsdrAuthSub?: { unsubscribe: () => void } }).__nsdrAuthSub =
        sub.subscription;
    });
    return () => {
      mounted = false;
      const w = window as unknown as { __nsdrAuthSub?: { unsubscribe: () => void } };
      w.__nsdrAuthSub?.unsubscribe();
    };
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}

function AppShell() {
  const [showPreloader, setShowPreloader] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shown = sessionStorage.getItem("nsdr:preloader-shown");
    if (!shown) setShowPreloader(true);
  }, []);

  const handlePreloaderDone = () => {
    sessionStorage.setItem("nsdr:preloader-shown", "1");
    setShowPreloader(false);
  };

  return (
    <div className="flex min-h-screen w-full">
      {showPreloader && <Preloader onDone={handlePreloaderDone} />}
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="relative z-[1] flex-1 pb-16 md:pb-0">
          <Outlet />
        </main>
        <footer
          className="px-4 py-3 text-center text-[10px] uppercase md:hidden"
          style={{
            letterSpacing: "0.12em",
            color: "rgba(240,237,230,0.25)",
            borderTop: "1px solid var(--border-default)",
            marginBottom: "64px",
          }}
        >
          Deeprelax Institute · Alleen voor professioneel gebruik
        </footer>

      </div>
      <MobileTabs />
      <Toaster />
    </div>
  );
}

