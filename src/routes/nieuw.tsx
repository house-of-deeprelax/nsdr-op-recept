import { createFileRoute } from "@tanstack/react-router";
import { PageTransition } from "@/components/layout/PageTransition";

export const Route = createFileRoute("/nieuw")({
  head: () => ({ meta: [{ title: "Nieuw recept — NSDR op Recept" }] }),
  component: () => (
    <PageTransition>
      <div className="mx-auto max-w-3xl">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Stap 1 van 3</span>
        <h2 className="mt-2 text-3xl">De casus</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          De multi-step intake komt in iteratie 2 zodra de backend is aangesloten.
        </p>
      </div>
    </PageTransition>
  ),
});
