import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { PhaseBadge, type Phase } from "@/components/brand/PhaseBadge";
import { listPrescriptions, type PrescriptionRow } from "@/lib/recipe";

export const Route = createFileRoute("/_authenticated/recepten")({
  head: () => ({ meta: [{ title: "Recepten — NSDR op Recept" }] }),
  component: ReceptenPage,
});

function normalizePhase(fase: string | null | undefined): Phase {
  const f = (fase ?? "").toLowerCase();
  if (f === "rood") return "rood";
  if (f === "geel-rood" || f === "rood-geel") return "rood-geel";
  if (f === "geel-groen") return "geel-groen";
  return "groen";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function ReceptenPage() {
  const [items, setItems] = useState<PrescriptionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listPrescriptions(200);
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Onbekende fout");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) =>
      [p.patient_context, p.fase, p.dominant_domein, p.rx_number]
        .map((s) => (s ?? "").toLowerCase())
        .some((s) => s.includes(q)),
    );
  }, [items, query]);

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-8 lg:px-12">
        <div className="flex items-baseline justify-between">
          <h1
            className="font-display text-[28px] sm:text-[36px]"
            style={{ letterSpacing: "-0.02em", color: "#f0ede6" }}
          >
            Recepten
          </h1>
          <span
            className="text-[10px] uppercase"
            style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.4)" }}
          >
            {items ? `${items.length} totaal` : "…"}
          </span>
        </div>

        {/* Search */}
        <div
          className="mt-6 flex items-center gap-2 rounded-md border px-3 py-2"
          style={{ borderColor: "var(--border-default)" }}
        >
          <Search className="h-4 w-4" strokeWidth={1.5} style={{ color: "rgba(240,237,230,0.4)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek op patiënt, fase, domein of RX-nummer"
            className="w-full bg-transparent text-[13px] outline-none"
            style={{ color: "#f0ede6" }}
          />
        </div>

        {error && (
          <div
            className="mt-6 rounded-md p-4 text-[13px]"
            style={{
              background: "rgba(158,126,94,0.08)",
              border: "1px solid rgba(158,126,94,0.3)",
              color: "var(--tierra)",
            }}
          >
            {error}
          </div>
        )}

        {/* List */}
        <ul className="mt-6 flex flex-col">
          {items === null && (
            <li className="py-4 text-[13px]" style={{ color: "rgba(240,237,230,0.45)" }}>
              Laden…
            </li>
          )}
          {items !== null && filtered.length === 0 && (
            <li className="py-10 text-center text-[13px]" style={{ color: "rgba(240,237,230,0.45)" }}>
              Nog geen recepten. Schrijf je eerste recept via <Link to="/nieuw" style={{ color: "var(--sage)" }}>Nieuw</Link>.
            </li>
          )}
          {filtered.map((rx, i) => (
            <li key={rx.id}>
              <Link
                to="/recept/$id"
                params={{ id: rx.rx_number.toLowerCase() }}
                className="group relative flex flex-col gap-2 py-4 transition-colors sm:py-5"
                style={{
                  borderBottom:
                    i === filtered.length - 1 ? "none" : "1px solid var(--border-default)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] uppercase"
                    style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.4)" }}
                  >
                    {rx.rx_number}
                  </span>
                  <span
                    className="text-[10px] uppercase"
                    style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.35)" }}
                  >
                    {formatDate(rx.created_at)}
                  </span>
                </div>
                <span className="text-[13px]" style={{ color: "rgba(240,237,230,0.85)" }}>
                  {rx.patient_context ?? "—"}
                </span>
                <div className="flex items-center gap-2">
                  <PhaseBadge phase={normalizePhase(rx.fase)} />
                  {rx.variant && (
                    <span className="text-[11px]" style={{ color: "rgba(240,237,230,0.5)" }}>
                      · {rx.variant}
                    </span>
                  )}
                  {rx.dominant_domein && (
                    <span
                      className="ml-auto rounded-full border px-2 py-0.5 text-[10px] uppercase"
                      style={{
                        borderColor: "var(--border-default)",
                        color: "rgba(240,237,230,0.45)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {rx.dominant_domein}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PageTransition>
  );
}
