import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { PhaseBadge, type Phase } from "@/components/brand/PhaseBadge";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/recipe";

export const Route = createFileRoute("/_authenticated/recepten")({
  head: () => ({ meta: [{ title: "Recepten — NSDR op Recept" }] }),
  component: ReceptenPage,
});

type Prescription = {
  id: string;
  rx_number: string;
  created_at: string;
  patient_context: string | null;
  fase: string | null;
  variant: string | null;
  dominant_domein: string | null;
};

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
  const [items, setItems] = useState<Prescription[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/prescriptions?select=id,rx_number,created_at,patient_context,fase,variant,dominant_domein&order=created_at.desc`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          },
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = (await res.json()) as Prescription[];
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
      [p.patient_context, p.fase, p.dominant_domein]
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
          style={{
            borderColor: "var(--border-default)",
            background: "var(--surface-1)",
          }}
        >
          <Search
            className="h-4 w-4"
            strokeWidth={2}
            style={{ color: "rgba(240,237,230,0.4)" }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek op patiënt, fase of domein"
            className="w-full bg-transparent text-[13px] outline-none placeholder:opacity-40"
            style={{ color: "#f0ede6" }}
          />
        </div>

        {/* Content */}
        <div className="mt-8">
          {error && (
            <div
              className="rounded-md border p-4 text-[13px]"
              style={{
                borderColor: "var(--border-default)",
                color: "rgba(240,237,230,0.65)",
              }}
            >
              Kon recepten niet laden: {error}
            </div>
          )}

          {!error && items === null && (
            <div
              className="text-[12px] uppercase"
              style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.35)" }}
            >
              Laden…
            </div>
          )}

          {!error && items && items.length === 0 && <EmptyState />}

          {!error && items && items.length > 0 && filtered.length === 0 && (
            <div
              className="text-[13px]"
              style={{ color: "rgba(240,237,230,0.55)" }}
            >
              Geen resultaten voor "{query}".
            </div>
          )}

          {!error && filtered.length > 0 && (
            <ul className="flex flex-col">
              {filtered.map((p, i) => (
                <PrescriptionRow
                  key={p.id}
                  p={p}
                  last={i === filtered.length - 1}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

function PrescriptionRow({ p, last }: { p: Prescription; last: boolean }) {
  const phase = normalizePhase(p.fase);
  return (
    <li>
      <Link
        to="/recept/$id"
        params={{ id: p.rx_number.toLowerCase() }}
        className="group relative flex flex-col gap-2 py-4 transition-colors sm:py-5"
        style={{ borderBottom: last ? "none" : "1px solid var(--border-default)" }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] uppercase"
            style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.4)" }}
          >
            {p.rx_number}
          </span>
          <span
            className="text-[10px] uppercase"
            style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.35)" }}
          >
            {formatDate(p.created_at)}
          </span>
        </div>

        <span className="text-[13px]" style={{ color: "rgba(240,237,230,0.85)" }}>
          {p.patient_context ?? "—"}
        </span>

        <div className="flex items-center gap-2">
          <PhaseBadge phase={phase} />
          {p.variant && (
            <span className="text-[11px]" style={{ color: "rgba(240,237,230,0.5)" }}>
              · {p.variant}
            </span>
          )}
          {p.dominant_domein && (
            <span
              className="ml-auto rounded-full border px-2 py-0.5 text-[10px] uppercase"
              style={{
                borderColor: "var(--border-default)",
                color: "rgba(240,237,230,0.45)",
                letterSpacing: "0.08em",
              }}
            >
              {p.dominant_domein}
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-start gap-5 rounded-md border p-8"
      style={{
        borderColor: "var(--border-default)",
        background: "var(--surface-1)",
      }}
    >
      <p className="text-[14px]" style={{ color: "rgba(240,237,230,0.7)" }}>
        Nog geen recepten. Begin met je eerste casus.
      </p>
      <Link
        to="/nieuw"
        className="inline-flex items-center gap-2 rounded-md px-5 py-3"
        style={{
          background: "var(--sage)",
          color: "#0c0c0a",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.02em",
        }}
      >
        Schrijf een recept
      </Link>
    </div>
  );
}
