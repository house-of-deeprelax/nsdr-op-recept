import { createFileRoute } from "@tanstack/react-router";
import { PageTransition } from "@/components/layout/PageTransition";

export const Route = createFileRoute("/genereren")({
  head: () => ({ meta: [{ title: "We schrijven je recept — NSDR op Recept" }] }),
  component: () => (
    <PageTransition>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl">We schrijven je recept…</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Generation-flow komt in iteratie 2.
        </p>
      </div>
    </PageTransition>
  ),
});
