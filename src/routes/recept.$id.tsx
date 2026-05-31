import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Copy, Download, Pencil, ArrowLeft } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/brand/GlassCard";
import { PhaseBadge } from "@/components/brand/PhaseBadge";
import { Button } from "@/components/ui/button";
import { fadeUp, stagger } from "@/lib/motion";

export const Route = createFileRoute("/recept/$id")({
  head: () => ({ meta: [{ title: "Voorschrift — NSDR op Recept" }] }),
  component: RecipePage,
});

const tiers = [
  {
    label: "Eerste keus",
    color: "var(--primary)",
    rgb: "var(--sage-rgb)",
    session: "Yoga Nidra — Sage Grounding 20",
    duration: "20 min · 5x per week · ochtend",
    rationale:
      "Lange uitademing en lichaamsscan kalmeren de hyperarousal en herstellen het ritme van het autonome zenuwstelsel.",
  },
  {
    label: "Lichter, als terugval",
    color: "rgba(241,241,238,0.4)",
    rgb: "241,241,238",
    session: "Adempauze — Box 4-4-6",
    duration: "10 min · 2x per dag · bij signaal",
    rationale:
      "Korte, lage-drempel interventie wanneer 20 minuten te veel is. Houdt de regulatie-routine intact zonder belasting.",
  },
  {
    label: "Zwaarder, als opbouw",
    color: "#7aa4d4",
    rgb: "122,164,212",
    session: "Yoga Nidra — Deep Recovery 35",
    duration: "35 min · 4x per week · avond",
    rationale:
      "Wanneer de basis stabiel is, verdiept deze sessie het parasympatische herstel en de slaaparchitectuur.",
  },
];

function RecipePage() {
  const { id } = Route.useParams();

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl pb-32">
        {/* Top meta */}
        <motion.div
          variants={stagger(0.06)}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div variants={fadeUp}>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" /> Terug naar dashboard
            </Link>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-4 flex items-center justify-between">
            <span className="font-mono text-[11px] tracking-wider text-muted-foreground">
              RX-{id.toUpperCase()} · {new Date().toLocaleDateString("nl-NL")}
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Voorschrift
            </span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-3 text-4xl leading-[1.05]">
            NSDR-voorschrift volgens RESET-PRO
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* 1. Voor wie en waar nu */}
          <Section number="01" title="Voor wie en waar nu">
            <div className="flex flex-wrap items-center gap-2">
              <PhaseBadge phase="rood-geel" />
              <span className="text-[11px] text-muted-foreground">·</span>
              <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs text-accent">
                Burn-out
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-foreground/90">
              Vrouw, 44, HR-manager, twee jonge kinderen. Acht maanden aanhoudende vermoeidheid,
              gespannen schouders en doorslaapproblemen na een periode van overbelasting.
              Somatisch onderzocht en gerust gesteld; het beeld past bij beginnend herstel uit
              chronische stress.
            </p>
            <div
              className="mt-5 rounded-r-lg border-l-2 bg-background/20 px-4 py-3 text-sm text-foreground/85"
              style={{ borderColor: "var(--accent)" }}
            >
              <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-accent">
                Medische realiteit
              </span>
              Somatische oorzaken zijn uitgesloten. POH-GGZ loopt parallel. NSDR komt hier
              naast de bestaande zorg, gericht op down-regulatie en slaapherstel.
            </div>
          </Section>

          {/* 2. Het voorschrift */}
          <Section number="02" title="Het voorschrift">
            <div className="space-y-3">
              {tiers.map((t) => (
                <motion.div
                  key={t.label}
                  variants={fadeUp}
                  className="rounded-r-lg border-l-2 bg-background/20 p-4"
                  style={{ borderColor: t.color }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] uppercase tracking-[0.12em]"
                      style={{ color: t.color }}
                    >
                      {t.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{t.duration}</span>
                  </div>
                  <h4 className="mt-2 font-display text-lg">{t.session}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t.rationale}
                  </p>
                </motion.div>
              ))}
            </div>
          </Section>

          {/* 3. Dosering */}
          <Section number="03" title="De dosering">
            <p className="text-sm leading-relaxed text-foreground/90">
              Start met de eerste keus: 20 minuten, vijf ochtenden per week, op vaste tijd
              direct na het wakker worden. Het ritme is belangrijker dan de duur; mis je een
              sessie, ga dan niet terug-doseren. Voeg de zwaardere variant pas toe wanneer
              de ochtendsessie twee weken stabiel staat.
            </p>
          </Section>

          {/* 4. Looptijd en herijking */}
          <Section number="04" title="Looptijd en herijking">
            <p className="text-sm leading-relaxed text-foreground/90">
              Eerste evaluatiemoment na drie weken. Verwachte indicatoren: kortere
              inslaaplatentie, minder ochtendmoeheid, hogere HRV-baseline. Herijk de fase
              en overweeg de opbouwvariant wanneer ten minste twee van drie indicatoren
              verbeteren. Totale looptijd: zes tot twaalf weken.
            </p>
          </Section>

          {/* 5. Waar je op let */}
          <Section number="05" title="Waar je op let">
            <ul className="space-y-2.5 text-sm leading-relaxed text-foreground/90">
              {[
                "Toename van prikkelbaarheid of dissociatie tijdens de bodyscan — stap terug naar de lichtere variant.",
                "Slaperigheid overdag die niet verbetert na week twee — bespreek met huisarts of POH-GGZ.",
                "Cafeïne na 14:00 ondermijnt het slaapherstel; expliciet benoemen.",
              ].map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div
              className="mt-5 rounded-r-lg border-l-2 bg-background/20 px-4 py-3 text-sm italic text-foreground/85"
              style={{ borderColor: "var(--accent)" }}
            >
              NSDR komt naast bestaande zorg, niet in plaats daarvan.
            </div>
          </Section>
        </motion.div>
      </div>

      {/* Action bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="fixed inset-x-0 bottom-6 z-20 flex justify-center px-4"
      >
        <div className="glass flex items-center gap-2 rounded-2xl p-2 shadow-xl">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4" /> PDF downloaden
          </Button>
          <Button variant="ghost" className="text-foreground/80 hover:text-foreground">
            <Pencil className="h-4 w-4" /> Bewerken
          </Button>
          <Button variant="ghost" className="text-foreground/80 hover:text-foreground">
            <Copy className="h-4 w-4" /> Kopiëren
          </Button>
        </div>
      </motion.div>
    </PageTransition>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={fadeUp}>
      <GlassCard className="p-7">
        <div className="mb-4 flex items-baseline gap-3">
          <span className="font-mono text-[11px] tracking-wider text-primary/70">{number}</span>
          <h3 className="text-xl">{title}</h3>
        </div>
        {children}
      </GlassCard>
    </motion.div>
  );
}
