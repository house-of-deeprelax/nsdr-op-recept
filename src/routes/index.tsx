import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PhaseBadge, type Phase } from "@/components/brand/PhaseBadge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NSDR op Recept — Deeprelax Institute" },
      { name: "description", content: "Een prescribing instrument voor wellness en healthcare professionals." },
    ],
  }),
  component: Dashboard,
});

type RecentRx = { id: string; patient: string; phase: Phase; date: string };

const recent: RecentRx[] = [
  { id: "RX-2025-041", patient: "Vrouw, 42 — chronische vermoeidheid", phase: "rood", date: "Vandaag" },
  { id: "RX-2025-040", patient: "Man, 56 — herstel na hartoperatie", phase: "rood-geel", date: "Gisteren" },
  { id: "RX-2025-039", patient: "Vrouw, 34 — burn-out, paniek", phase: "geel-groen", date: "2 dagen" },
];

const ease = [0.22, 1, 0.36, 1] as const;

function Dashboard() {
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

        <div className="relative flex h-full min-h-[420px] flex-col justify-end p-6 sm:p-10 lg:min-h-0 lg:p-12">
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
            className="mt-10 max-w-[560px] font-display text-[32px] sm:mt-14 sm:text-[40px] lg:text-[52px]"
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
        {/* Stats */}
        <div className="grid grid-cols-2 lg:flex lg:flex-1 lg:flex-col">
          <StatBlock label="Deze maand" value="41" hint="+12 t.o.v. vorige maand" />
          <div className="hidden lg:block" style={{ borderTop: "1px solid var(--border-default)" }} />
          <div className="lg:hidden" style={{ borderLeft: "1px solid var(--border-default)" }}>
            <StatBlock label="Protocollen" value="07" hint="RESET-PRO v3.2" />
          </div>
          <div className="hidden lg:block">
            <StatBlock label="Protocollen" value="07" hint="RESET-PRO v3.2" />
          </div>
        </div>

        {/* Recent */}
        <div
          className="flex flex-1 flex-col p-6 sm:p-8 lg:p-10"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          <span
            className="text-[10px] uppercase"
            style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.22)" }}
          >
            Recent
          </span>
          <ul className="mt-4 flex flex-1 flex-col justify-start sm:mt-6">
            {recent.map((rx, i) => (
              <RecentRow key={rx.id} rx={rx} last={i === recent.length - 1} />
            ))}
          </ul>
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
    <div className="flex flex-1 flex-col justify-between p-10">
      <span
        className="text-[10px] uppercase"
        style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.22)" }}
      >
        {label}
      </span>
      <div>
        <div
          className="font-display"
          style={{ fontSize: 64, lineHeight: 1, color: "#f0ede6" }}
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
        className="group relative flex items-center justify-between py-4 transition-colors"
        style={{
          borderBottom: last ? "none" : "1px solid var(--border-default)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(240,237,230,0.015)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <span
          aria-hidden
          className="absolute left-[-40px] top-0 h-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ width: 2, background: "var(--sage)" }}
        />
        <span
          className="text-[10px] uppercase"
          style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.4)", width: 96 }}
        >
          {rx.id}
        </span>
        <span
          className="flex-1 truncate px-4 text-[13px]"
          style={{ color: "rgba(240,237,230,0.85)" }}
        >
          {rx.patient}
        </span>
        <PhaseBadge phase={rx.phase} />
      </Link>
    </li>
  );
}
