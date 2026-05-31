import { createFileRoute } from "@tanstack/react-router";
import { PageTransition } from "@/components/layout/PageTransition";

export const Route = createFileRoute("/recepten")({
  head: () => ({ meta: [{ title: "Recepten — NSDR op Recept" }] }),
  component: () => (
    <PageTransition>
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl">Recepten</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Archief komt in iteratie 2.
        </p>
      </div>
    </PageTransition>
  ),
});
