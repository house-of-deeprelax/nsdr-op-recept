import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Sparkles, Activity, Layers } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { BentoGrid, BentoCard } from "@/components/bento/BentoGrid";
import { PhaseBadge, type Phase } from "@/components/brand/PhaseBadge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NSDR op Recept — Deeprelax Institute" },
      { name: "description", content: "Prescribing instrument voor wellness en healthcare professionals." },
    ],
  }),
  component: Dashboard,
});

type RecentRx = {
  id: string;
  context: string;
  phase: Phase;
  domain: string;
  date: string;
};

const recent: RecentRx[] = [
  { id: "RX-2025-041", context: "Vrouw, 42 — chronische vermoeidheid na long covid", phase: "rood", domain: "Energie", date: "Vandaag" },
  { id: "RX-2025-040", context: "Man, 56 — herstel na hartoperatie, slaapproblemen", phase: "rood-geel", domain: "Slaap", date: "Gisteren" },
  { id: "RX-2025-039", context: "Vrouw, 34 — burn-out, terugkerende paniek", phase: "geel-groen", domain: "Regulatie", date: "2 dagen" },
];

function Dashboard() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-1">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Goedemorgen, Preschana</span>
          <h2 className="text-3xl">Wat schrijven we vandaag voor?</h2>
        </div>

        <BentoGrid>
          {/* Hero CTA */}
          <BentoCard size="lg" className="group !p-0">
            <Link to="/nieuw" className="flex h-full flex-col justify-between p-7">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-90"
                style={{
                  background:
                    "radial-gradient(600px 400px at 0% 0%, rgba(var(--sage-rgb), 0.22), transparent 60%), radial-gradient(500px 350px at 100% 100%, rgba(var(--tierra-rgb), 0.14), transparent 60%)",
                }}
              />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/30 px-2.5 py-1 text-[11px] text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Nieuw voorschrift
                </div>
                <h3 className="mt-5 max-w-md text-4xl leading-[1.05]">
                  Schrijf een recept op basis van de casus.
                </h3>
                <p className="mt-3 max-w-md text-sm text-muted-foreground">
                  Drie stappen: casus, systeemscan, setting. We stellen een passend voorschrift samen volgens de RESET-PRO methode.
                </p>
              </div>
              <div className="relative mt-6 inline-flex items-center gap-2 self-start rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-transform group-hover:scale-[1.02]">
                Schrijf een recept
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          </BentoCard>

          {/* Stat: month */}
          <BentoCard size="sm">
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" /> Recepten deze maand
              </div>
              <div>
                <div className="font-display text-5xl text-foreground">41</div>
                <div className="mt-1 text-xs text-primary">+12 t.o.v. vorige maand</div>
              </div>
            </div>
          </BentoCard>

          {/* Stat: protocols */}
          <BentoCard size="sm">
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Layers className="h-3.5 w-3.5" /> Actieve protocollen
              </div>
              <div>
                <div className="font-display text-5xl text-foreground">7</div>
                <div className="mt-1 text-xs text-muted-foreground">RESET-PRO v3.2</div>
              </div>
            </div>
          </BentoCard>

          {/* Recent prescriptions */}
          {recent.map((rx) => (
            <BentoCard key={rx.id} size="md" className="!p-0">
              <Link to="/" className="flex h-full flex-col justify-between p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-mono text-[11px] tracking-wider text-muted-foreground">{rx.id}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{rx.date}</span>
                </div>
                <div>
                  <p className="text-sm leading-snug text-foreground/90">{rx.context}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <PhaseBadge phase={rx.phase} />
                    <span className="text-[11px] text-muted-foreground">· {rx.domain}</span>
                  </div>
                </div>
              </Link>
            </BentoCard>
          ))}

          {/* Quick actions */}
          <BentoCard size="md">
            <div className="flex h-full flex-col justify-between">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Snel</div>
              <div className="flex flex-col gap-2">
                <QuickLink to="/recepten" label="Bekijk archief" />
                <QuickLink to="/instellingen" label="Instellingen en kennisbasis" />
              </div>
            </div>
          </BentoCard>
        </BentoGrid>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-center text-[11px] text-muted-foreground"
        >
          NSDR komt naast bestaande zorg, niet in plaats daarvan.
        </motion.div>
      </div>
    </PageTransition>
  );
}

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-lg border border-border bg-background/20 px-3 py-2.5 text-sm transition-colors hover:border-accent/40 hover:bg-accent/5"
    >
      <span>{label}</span>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
    </Link>
  );
}
