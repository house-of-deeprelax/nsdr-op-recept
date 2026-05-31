import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, Pencil, ArrowLeft } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { PhaseBadge } from "@/components/brand/PhaseBadge";
import { useTypewriter, Cursor } from "@/lib/typewriter";

export const Route = createFileRoute("/recept/$id")({
  head: () => ({ meta: [{ title: "Voorschrift — NSDR op Recept" }] }),
  component: RecipePage,
});

const blocks = [
  {
    id: "intro",
    text:
      "Vrouw, 44, HR-manager met twee jonge kinderen. Acht maanden aanhoudende vermoeidheid, gespannen schouders en doorslaapproblemen na een periode van overbelasting. Somatisch onderzocht en gerust gesteld; het beeld past bij beginnend herstel uit chronische stress.",
  },
  {
    id: "reality",
    text:
      "Somatische oorzaken zijn uitgesloten. POH-GGZ loopt parallel. NSDR komt hier naast de bestaande zorg, gericht op down-regulatie en slaapherstel.",
  },
  {
    id: "tiers",
    text: "",
  },
  {
    id: "dosering",
    text:
      "Start met de eerste keus: 20 minuten, vijf ochtenden per week, op vaste tijd direct na het wakker worden. Het ritme is belangrijker dan de duur; mis je een sessie, ga dan niet terug-doseren. Voeg de zwaardere variant pas toe wanneer de ochtendsessie twee weken stabiel staat.",
  },
  {
    id: "looptijd",
    text:
      "Eerste evaluatiemoment na drie weken. Verwachte indicatoren: kortere inslaaplatentie, minder ochtendmoeheid, hogere HRV-baseline. Herijk de fase en overweeg de opbouwvariant wanneer ten minste twee van drie indicatoren verbeteren. Totale looptijd: zes tot twaalf weken.",
  },
  {
    id: "attention",
    text:
      "Let op: toename van prikkelbaarheid of dissociatie tijdens de bodyscan vraagt om terugschakelen naar de lichtere variant. Slaperigheid overdag die niet verbetert na week twee bespreek je met huisarts of POH-GGZ. Cafeïne na 14:00 ondermijnt het slaapherstel; benoem dit expliciet.",
  },
  {
    id: "closing",
    text: "NSDR komt naast bestaande zorg, niet in plaats daarvan.",
  },
];

const tiers = [
  {
    label: "Eerste keus",
    color: "var(--sage)",
    session: "Yoga Nidra — Sage Grounding 20",
    duration: "20 min · 5x per week · ochtend",
    rationale:
      "Lange uitademing en lichaamsscan kalmeren de hyperarousal en herstellen het ritme van het autonome zenuwstelsel.",
  },
  {
    label: "Lichter, als terugval",
    color: "rgba(241,241,238,0.25)",
    session: "Adempauze — Box 4-4-6",
    duration: "10 min · 2x per dag · bij signaal",
    rationale:
      "Korte, lage-drempel interventie wanneer 20 minuten te veel is. Houdt de regulatie-routine intact zonder belasting.",
  },
  {
    label: "Zwaarder, als opbouw",
    color: "#7aa4d4",
    session: "Yoga Nidra — Deep Recovery 35",
    duration: "35 min · 4x per week · avond",
    rationale:
      "Wanneer de basis stabiel is, verdiept deze sessie het parasympatische herstel en de slaaparchitectuur.",
  },
];

function RecipePage() {
  const { id } = Route.useParams();
  const tw = useTypewriter(blocks, { speed: 18, pauseBetween: 400, startDelay: 300 });

  return (
    <PageTransition>
      <div className="mx-auto max-w-[720px] px-10 py-12 pb-32">
        <div className="mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[rgba(var(--paper-rgb),0.5)] transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={1.5} /> Terug naar dashboard
          </Link>
          <div className="mt-6 flex items-baseline justify-between">
            <span className="text-label">Voorschrift · RX-{id.toUpperCase()}</span>
            <span className="text-label">{new Date().toLocaleDateString("nl-NL")}</span>
          </div>
          <h2 className="mt-4 font-display text-[40px] leading-[1.05]">
            NSDR-voorschrift volgens RESET-PRO
          </h2>
        </div>

        <div className="space-y-12">
          {/* 01 — Voor wie en waar nu */}
          <Section number="01" title="Voor wie en waar nu">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <PhaseBadge phase="rood-geel" />
              <span className="text-label">— Burn-out</span>
            </div>
            <p className="text-body text-[15px] leading-[1.7]">
              {tw.getText("intro")}
              <Cursor on={tw.isCursorOn("intro")} />
            </p>
            {tw.isStarted("reality") && (
              <div
                className="mt-6 rounded-r-md py-3 pl-5 pr-4 text-[14px] leading-[1.7] text-foreground/85"
                style={{
                  borderLeft: "2px solid var(--tierra)",
                  background: "rgba(176,144,112,0.05)",
                }}
              >
                <div className="text-label mb-2" style={{ color: "var(--tierra)" }}>
                  Medische realiteit
                </div>
                <span className="text-body">
                  {tw.getText("reality")}
                  <Cursor on={tw.isCursorOn("reality")} />
                </span>
              </div>
            )}
          </Section>

          {/* 02 — Het voorschrift */}
          <Section number="02" title="Het voorschrift">
            <div className="space-y-3">
              <AnimatePresence>
                {tw.isStarted("tiers") &&
                  tiers.map((t, i) => (
                    <motion.div
                      key={t.label}
                      initial={{ opacity: 0, x: 32 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-r-md py-5 pl-6 pr-5"
                      style={{
                        borderLeft: `2px solid ${t.color}`,
                        background: "rgba(241,241,238,0.025)",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                      }}
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="text-label" style={{ color: t.color === "var(--sage)" ? "var(--sage)" : "rgba(var(--paper-rgb),0.5)" }}>
                          {t.label}
                        </span>
                        <span className="text-label">{t.duration}</span>
                      </div>
                      <div className="mt-3 text-[15px] font-medium text-foreground">
                        {t.session}
                      </div>
                      <p className="text-body-muted mt-2 text-[14px] leading-[1.7]">
                        {t.rationale}
                      </p>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </Section>

          {/* 03 — Dosering */}
          {tw.isStarted("dosering") && (
            <Section number="03" title="De dosering">
              <p className="text-body text-[15px] leading-[1.7]">
                {tw.getText("dosering")}
                <Cursor on={tw.isCursorOn("dosering")} />
              </p>
            </Section>
          )}

          {/* 04 — Looptijd */}
          {tw.isStarted("looptijd") && (
            <Section number="04" title="Looptijd en herijking">
              <p className="text-body text-[15px] leading-[1.7]">
                {tw.getText("looptijd")}
                <Cursor on={tw.isCursorOn("looptijd")} />
              </p>
            </Section>
          )}

          {/* 05 — Waar je op let */}
          {tw.isStarted("attention") && (
            <Section number="05" title="Waar je op let">
              <p className="text-body text-[15px] leading-[1.7]">
                {tw.getText("attention")}
                <Cursor on={tw.isCursorOn("attention")} />
              </p>
              {tw.isStarted("closing") && (
                <p className="text-body-muted mt-6 text-[14px] italic leading-[1.7]">
                  {tw.getText("closing")}
                  <Cursor on={tw.isCursorOn("closing")} />
                </p>
              )}
            </Section>
          )}
        </div>
      </div>

      {/* Action bar */}
      <AnimatePresence>
        {tw.complete && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-8 z-20 flex justify-center px-4"
          >
            <div
              className="flex items-center gap-1 rounded-[10px] border border-[rgba(var(--paper-rgb),0.08)] bg-[#1e1e1a] p-1.5"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
            >
              <ActionPrimary>
                <Download className="h-3.5 w-3.5" strokeWidth={1.5} /> PDF downloaden
              </ActionPrimary>
              <ActionGhost>
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} /> Bewerken
              </ActionGhost>
              <ActionGhost>
                <Copy className="h-3.5 w-3.5" strokeWidth={1.5} /> Kopiëren
              </ActionGhost>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-5 flex items-baseline gap-3">
        <span className="text-label">Fig {number}</span>
        <h3 className="font-display text-[22px]">{title}</h3>
      </div>
      {children}
    </motion.section>
  );
}

function ActionPrimary({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-md bg-[var(--sage)] px-3.5 py-2 text-xs text-[#1e1e1a] transition-all duration-[80ms]"
      onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; e.currentTarget.style.filter = "brightness(0.92)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.filter = "brightness(1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.filter = "brightness(1)"; }}
    >
      {children}
    </button>
  );
}

function ActionGhost({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-xs text-[rgba(var(--paper-rgb),0.65)] transition-colors hover:bg-[rgba(var(--paper-rgb),0.04)] hover:text-foreground">
      {children}
    </button>
  );
}
