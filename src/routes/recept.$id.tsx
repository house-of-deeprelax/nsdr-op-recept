import { createFileRoute } from "@tanstack/react-router";
import { PageTransition } from "@/components/layout/PageTransition";

export const Route = createFileRoute("/recept/$id")({
  head: () => ({ meta: [{ title: "Voorschrift — NSDR op Recept" }] }),
  component: RecipePage,
});

function RecipePage() {
  const { id } = Route.useParams();
  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl">
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground">{id}</span>
        <h2 className="mt-2 text-3xl">Voorschrift</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          De recept-document weergave komt in iteratie 2.
        </p>
      </div>
    </PageTransition>
  );
}
