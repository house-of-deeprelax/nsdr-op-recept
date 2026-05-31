import { createFileRoute } from "@tanstack/react-router";
import { PageTransition } from "@/components/layout/PageTransition";

export const Route = createFileRoute("/instellingen")({
  head: () => ({ meta: [{ title: "Instellingen — NSDR op Recept" }] }),
  component: () => (
    <PageTransition>
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl">Instellingen</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Komt in iteratie 2.
        </p>
      </div>
    </PageTransition>
  ),
});
