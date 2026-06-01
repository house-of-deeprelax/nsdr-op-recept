import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { PhaseBadge, type Phase } from "@/components/brand/PhaseBadge";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/recipe";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NSDR op Recept — Deeprelax Institute" },
      { name: "description", content: "Een prescribing instrument voor wellness en healthcare professionals." },
    ],
  }),
  component: Dashboard,
});

type RecentRx = {
  id: string;
  patient: string;
  phase: Phase;
  date: string;
  variant: string;
  domain: string;
};

const demoRecent: RecentRx[] = [
  {
    id: "RX-2025-041",
    patient: "Vrouw, 44 — burn-out, overspanning",
    phase: "rood",
    date: "Vandaag",
    variant: "Overdrive",
    domain: "Burn-out",
  },
  {
    id: "RX-2025-040",
    patient: "Man, 38 — post-COVID, slaapproblemen",
    phase: "rood-geel",
    date: "Gisteren",
    variant: "Restvermoeidheid",
    domain: "Postviraal",
  },
  {
    id: "RX-2025-039",
    patient: "Vrouw, 51 — perimenopauze, emotioneel labil",
    phase: "geel-groen",
    date: "2 dagen geleden",
    variant: "Emotioneel hoog",
    domain: "Hormonaal",
  },
  {
    id: "RX-2025-038",
    patient: "Man, 45 — preventief, hoog prestatieniveau",
    phase: "groen",
    date: "3 dagen geleden",
    variant: "Hoog-presterend",
    domain: "Burn-out",
  },
];

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

function useRecentPrescriptions(): RecentRx[] {
  const [items, setItems] = useState<RecentRx[]>(demoRecent);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/prescriptions?select=rx_number,created_at,patient_context,fase,variant,dominant_domein&order=created_at.desc&limit=4`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          },
        );
        if (!res.ok) return;
        const data = (await res.json()) as Array<{
          rx_number: string;
          created_at: string;
          patient_context: string | null;
          fase: string | null;
          variant: string | null;
          dominant_domein: string | null;
        }>;
        if (cancelled || data.length === 0) return;
        setItems(
          data.map((p) => ({
            id: p.rx_number,
            patient: p.patient_context ?? "—",
            phase: normalizePhase(p.fase),
            date: formatDate(p.created_at),
            variant: p.variant ?? "—",
            domain: p.dominant_domein ?? "—",
          })),
        );
      } catch {
        // keep demo fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return items;
}

const ease = [0.22, 1, 0.36, 1] as const;

function Dashboard() {
  const recent = useRecentPrescriptions();
  return (
    <div
      className="flex w-full flex-col lg:flex-row"
      style={{ minHeight: "calc(100vh - 44px)" }}
    >
      {/* LEFT — HERO */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease }}
        className="relative w-full overflow-hidden lg:w-[58%]"
        style={{ background: "var(--surface-1)" }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, rgba(240,237,230,0.015) 0 1px, transparent 1px 10px)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(700px 500px at 90% 10%, rgba(140,158,110,0.05), transparent 60%)",
          }}
        />

        <div className="relative flex h-full min-h-[420px] flex-col justify-center p-6 sm:p-10 lg:min-h-0 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
          >
            <span
              className="text-[10px] uppercase"
              style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.2)" }}
            >
              Recept 0.1
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease }}
            className="mt-6 max-w-[560px] font-display text-[32px] sm:text-[40px] lg:text-[52px]"
            style={{
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#f0ede6",
            }}
          >
            Schrijf een recept op basis van de casus.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28, ease }}
            className="mt-4 max-w-[420px] text-[13px] sm:mt-5 sm:text-[14px]"
            style={{ lineHeight: 1.65, color: "rgba(240,237,230,0.5)" }}
          >
            Drie stappen: casus, systeemscan, setting. We stellen een passend
            voorschrift samen volgens de RESET-PRO methode.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease }}
            className="mt-6 sm:mt-8"
          >
            <CTAButton to="/nieuw">Schrijf een recept</CTAButton>
          </motion.div>
        </div>
      </motion.section>


      {/* RIGHT — CONTEXT */}
      <motion.section
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease }}
        className="flex flex-1 flex-col border-t lg:border-l lg:border-t-0"
        style={{ borderColor: "var(--border-default)" }}
      >
        {/* Recent */}
        <div className="flex flex-col p-6 sm:p-8 lg:p-10">
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] uppercase"
              style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.22)" }}
            >
              Recent
            </span>
            <Link
              to="/recepten"
              className="inline-flex items-center gap-1 text-[11px] uppercase transition-colors hover:opacity-100"
              style={{ letterSpacing: "0.1em", color: "rgba(240,237,230,0.55)" }}
            >
              Bekijk <ArrowRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          </div>
          <ul className="mt-4 flex flex-col sm:mt-6">
            {recent.map((rx, i) => (
              <RecentRow key={rx.id} rx={rx} last={i === recent.length - 1} />
            ))}
          </ul>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-2 lg:flex lg:flex-1"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          <StatBlock label="Deze maand" value="41" hint="+12 t.o.v. vorige maand" />
          <div style={{ borderLeft: "1px solid var(--border-default)" }}>
            <StatBlock label="Protocollen" value="07" hint="RESET-PRO v3.2" />
          </div>
        </div>

      </motion.section>
    </div>
  );
}

function CTAButton({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2 rounded-md px-5 py-3 transition-all duration-[80ms]"
      style={{
        background: "var(--sage)",
        color: "#0c0c0a",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: "0.02em",
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(0.97)";
        e.currentTarget.style.filter = "brightness(0.92)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.filter = "brightness(1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.filter = "brightness(1)";
      }}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
    </Link>
  );
}

function StatBlock({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="flex flex-1 flex-col justify-between gap-6 p-6 sm:p-8 lg:p-10">
      <span
        className="text-[10px] uppercase"
        style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.22)" }}
      >
        {label}
      </span>
      <div>
        <div
          className="font-display text-[44px] sm:text-[56px] lg:text-[64px]"
          style={{ lineHeight: 1, color: "#f0ede6" }}
        >
          {value}
        </div>
        <div className="mt-3 text-[12px]" style={{ color: "rgba(240,237,230,0.45)" }}>
          {hint}
        </div>
      </div>
    </div>
  );
}

function RecentRow({ rx, last }: { rx: RecentRx; last: boolean }) {
  return (
    <li>
      <Link
        to="/recept/$id"
        params={{ id: rx.id.toLowerCase() }}
        className="group relative flex flex-col gap-2 py-4 transition-colors sm:py-5"
        style={{ borderBottom: last ? "none" : "1px solid var(--border-default)" }}
      >
        {/* Top row: RX + Date */}
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] uppercase"
            style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.4)" }}
          >
            {rx.id}
          </span>
          <span
            className="text-[10px] uppercase"
            style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.35)" }}
          >
            {rx.date}
          </span>
        </div>

        {/* Patient */}
        <span
          className="text-[13px]"
          style={{ color: "rgba(240,237,230,0.85)" }}
        >
          {rx.patient}
        </span>

        {/* Badges row */}
        <div className="flex items-center gap-2">
          <PhaseBadge phase={rx.phase} />
          <span className="text-[11px]" style={{ color: "rgba(240,237,230,0.5)" }}>
            · {rx.variant}
          </span>
          <span
            className="ml-auto rounded-full border px-2 py-0.5 text-[10px] uppercase"
            style={{
              borderColor: "var(--border-default)",
              color: "rgba(240,237,230,0.45)",
              letterSpacing: "0.08em",
            }}
          >
            {rx.domain}
          </span>
        </div>
      </Link>
    </li>
  );
}
