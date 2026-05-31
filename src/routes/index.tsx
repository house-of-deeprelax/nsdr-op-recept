import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { PhaseBadge, type Phase } from "@/components/brand/PhaseBadge";
import { fadeUp, stagger } from "@/lib/motion";

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
};

const recent: RecentRx[] = [
  { id: "RX-2025-041", patient: "Vrouw, 42 — chronische vermoeidheid na long covid", phase: "rood", date: "Vandaag" },
  { id: "RX-2025-040", patient: "Man, 56 — herstel na hartoperatie, slaapproblemen", phase: "rood-geel", date: "Gisteren" },
  { id: "RX-2025-039", patient: "Vrouw, 34 — burn-out, terugkerende paniek", phase: "geel-groen", date: "2 dagen" },
];

function Dashboard() {
  return (
    <PageTransition>
      <motion.div
        variants={stagger(0.08)}
        initial="hidden"
        animate="visible"
        className="mx-auto grid max-w-[1200px] grid-cols-12 gap-4"
      >
        {/* HERO STAGE */}
        <motion.section
          variants={fadeUp}
          className="relative col-span-12 overflow-hidden rounded-[10px] border border-[rgba(var(--paper-rgb),0.08)] lg:col-span-7"
          style={{ minHeight: 320 }}
        >
          <div className="paper-grain absolute inset-0" />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(600px 400px at 100% 0%, rgba(var(--sage-rgb), 0.08), transparent 60%)",
            }}
          />
          <div className="relative flex h-full flex-col justify-between p-12">
            <div>
              <span className="text-label">Recept 0.1</span>
              <h2 className="mt-8 max-w-md font-display text-[44px] leading-[1.05]">
                Schrijf een recept op basis van de casus.
              </h2>
              <p className="text-body-muted mt-5 max-w-md text-sm leading-relaxed">
                Drie stappen: casus, systeemscan, setting. We stellen een passend
                voorschrift samen volgens de RESET-PRO methode.
              </p>
            </div>
            <div className="mt-10">
              <CTAButton to="/nieuw">Schrijf een recept</CTAButton>
            </div>
          </div>
        </motion.section>

        {/* STATS */}
        <motion.section
          variants={fadeUp}
          className="col-span-12 grid grid-cols-2 gap-4 lg:col-span-5"
        >
          <StatCell label="Deze maand" value="41" hint="+12 t.o.v. vorige maand" />
          <StatCell label="Protocollen" value="7" hint="RESET-PRO v3.2" />
        </motion.section>

        {/* RECENT RECIPES */}
        {recent.map((rx) => (
          <motion.div
            key={rx.id}
            variants={fadeUp}
            className="col-span-12 md:col-span-6 lg:col-span-4"
          >
            <RecentCard rx={rx} />
          </motion.div>
        ))}
      </motion.div>
    </PageTransition>
  );
}

function CTAButton({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2 rounded-md bg-[var(--sage)] px-4 py-2.5 text-sm text-[#1e1e1a] transition-all duration-[80ms]"
      style={{ willChange: "transform" }}
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
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
    </Link>
  );
}

function StatCell({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="surface surface-hover flex h-full min-h-[156px] flex-col justify-between rounded-[10px] p-7">
      <span className="text-label">{label}</span>
      <div>
        <div className="font-display text-[56px] leading-none">{value}</div>
        <div className="text-body-muted mt-3 text-xs">{hint}</div>
      </div>
    </div>
  );
}

function RecentCard({ rx }: { rx: RecentRx }) {
  return (
    <Link
      to="/recept/$id"
      params={{ id: rx.id.toLowerCase() }}
      className="surface surface-hover group relative flex h-full min-h-[180px] flex-col justify-between overflow-hidden rounded-[10px] p-7"
      style={{ willChange: "transform" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-px bg-[var(--sage)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
      <div className="flex items-start justify-between">
        <span className="text-label">{rx.id}</span>
        <span className="text-label">{rx.date}</span>
      </div>
      <div>
        <p className="text-body text-sm leading-snug">{rx.patient}</p>
        <div className="mt-4">
          <PhaseBadge phase={rx.phase} />
        </div>
      </div>
    </Link>
  );
}
