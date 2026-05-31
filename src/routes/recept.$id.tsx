import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, Pencil } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  { id: "tiers", text: "" },
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
  { id: "closing", text: "NSDR komt naast bestaande zorg, niet in plaats daarvan." },
];

const tiers = [
  {
    label: "Eerste keus",
    accent: "var(--sage)",
    pill: "rgba(140,158,110,0.15)",
    session: "Yoga Nidra — Sage Grounding 20",
    duration: "20 min · 5x per week · ochtend",
    rationale:
      "Lange uitademing en lichaamsscan kalmeren de hyperarousal en herstellen het ritme van het autonome zenuwstelsel.",
  },
  {
    label: "Lichter, als terugval",
    accent: "rgba(240,237,230,0.25)",
    pill: "rgba(240,237,230,0.05)",
    session: "Adempauze — Box 4-4-6",
    duration: "10 min · 2x per dag · bij signaal",
    rationale:
      "Korte, lage-drempel interventie wanneer 20 minuten te veel is. Houdt de regulatie-routine intact zonder belasting.",
  },
  {
    label: "Zwaarder, als opbouw",
    accent: "#6d8aa8",
    pill: "rgba(109,138,168,0.12)",
    session: "Yoga Nidra — Deep Recovery 35",
    duration: "35 min · 4x per week · avond",
    rationale:
      "Wanneer de basis stabiel is, verdiept deze sessie het parasympatische herstel en de slaaparchitectuur.",
  },
];

const sections = [
  { num: "01", label: "Voor wie" },
  { num: "02", label: "Voorschrift" },
  { num: "03", label: "Dosering" },
  { num: "04", label: "Looptijd" },
  { num: "05", label: "Waar je op let" },
];

function RecipePage() {
  const { id } = Route.useParams();
  const tw = useTypewriter(blocks, { speed: 14, pauseBetween: 350, startDelay: 250 });

  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeSection, setActiveSection] = useState("01");

  useEffect(() => {
    const handler = () => {
      let current = "01";
      for (const s of sections) {
        const el = refs.current[s.num];
        if (el && el.getBoundingClientRect().top < 160) current = s.num;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handler, true);
    handler();
    return () => window.removeEventListener("scroll", handler, true);
  }, []);

  const scrollTo = useCallback((num: string) => {
    const el = refs.current[num];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="flex w-full" style={{ minHeight: "calc(100vh - 44px)" }}>
      {/* LEFT — 280px */}
      <aside
        className="flex flex-col"
        style={{
          width: 280,
          minWidth: 280,
          background: "var(--surface-1)",
          borderRight: "1px solid var(--border-default)",
          padding: "32px 24px",
          position: "sticky",
          top: 44,
          height: "calc(100vh - 44px)",
        }}
      >
        <span
          className="text-[10px] uppercase"
          style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.22)" }}
        >
          Voorschrift
        </span>
        <div
          className="mt-2 font-display"
          style={{ fontSize: 28, lineHeight: 1.05, color: "#f0ede6" }}
        >
          RX-{id.toUpperCase()}
        </div>
        <div
          className="mt-2 text-[11px] uppercase"
          style={{ letterSpacing: "0.1em", color: "rgba(240,237,230,0.3)" }}
        >
          {new Date().toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" })}
        </div>

        <div className="mt-8 flex flex-col gap-2">
          <PhaseBadge phase="rood-geel" />
          <span
            className="self-start rounded-full px-2.5 py-1 text-[11px]"
            style={{
              background: "rgba(240,237,230,0.04)",
              color: "rgba(240,237,230,0.7)",
              border: "1px solid var(--border-default)",
            }}
          >
            Burn-out
          </span>
        </div>

        <div className="mt-10">
          <span
            className="text-[10px] uppercase"
            style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.22)" }}
          >
            Secties
          </span>
          <nav className="mt-3 flex flex-col">
            {sections.map((s) => {
              const active = activeSection === s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => scrollTo(s.num)}
                  className="relative flex items-baseline gap-3 py-2 text-left transition-colors"
                  style={{ color: active ? "#f0ede6" : "rgba(240,237,230,0.45)" }}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute"
                      style={{ left: -24, top: 10, height: 14, width: 2, background: "var(--sage)" }}
                    />
                  )}
                  <span
                    className="text-[10px] uppercase"
                    style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.3)" }}
                  >
                    {s.num}
                  </span>
                  <span className="text-[13px]">{s.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto flex flex-col gap-1.5 pt-8">
          <SidebarAction primary>
            <Download className="h-3.5 w-3.5" strokeWidth={1.5} /> PDF downloaden
          </SidebarAction>
          <SidebarAction>
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} /> Bewerken
          </SidebarAction>
          <SidebarAction>
            <Copy className="h-3.5 w-3.5" strokeWidth={1.5} /> Kopiëren
          </SidebarAction>
          <Link
            to="/"
            className="mt-3 text-[11px] uppercase transition-colors"
            style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.3)" }}
          >
            ← Dashboard
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <main
        className="flex-1"
        style={{ background: "var(--background)", padding: "56px 72px 120px" }}
      >
        <div className="max-w-[640px]">
          <Section
            innerRef={(el) => { refs.current["01"] = el; }}
            num="01"
            title="Voor wie en waar nu"
          >
            <p
              className="text-body"
              style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(240,237,230,0.9)" }}
            >
              {tw.getText("intro")}
              <Cursor on={tw.isCursorOn("intro")} />
            </p>
            {tw.isStarted("reality") && (
              <div
                className="mt-6"
                style={{
                  borderLeft: "3px solid var(--tierra)",
                  background: "rgba(158,126,94,0.06)",
                  padding: "16px 20px",
                  borderRadius: "0 4px 4px 0",
                }}
              >
                <div
                  className="mb-2 text-[10px] uppercase"
                  style={{ letterSpacing: "0.12em", color: "var(--tierra)" }}
                >
                  Medische realiteit
                </div>
                <span style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(240,237,230,0.88)" }}>
                  {tw.getText("reality")}
                  <Cursor on={tw.isCursorOn("reality")} />
                </span>
              </div>
            )}
          </Section>

          <Section
            innerRef={(el) => { refs.current["02"] = el; }}
            num="02"
            title="Het voorschrift"
          >
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {tw.isStarted("tiers") &&
                  tiers.map((t, i) => (
                    <motion.div
                      key={t.label}
                      initial={{ opacity: 0, x: 36 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        borderLeft: `3px solid ${t.accent}`,
                        background: "var(--surface-1)",
                        padding: "20px 24px",
                        borderRadius: "0 4px 4px 0",
                      }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span
                          className="rounded-full px-2.5 py-1 text-[10px] uppercase"
                          style={{
                            letterSpacing: "0.12em",
                            background: t.pill,
                            color: t.accent,
                          }}
                        >
                          {t.label}
                        </span>
                        <span
                          className="font-display-700"
                          style={{ fontSize: 14, color: "#f0ede6", flex: 1, textAlign: "center" }}
                        >
                          {t.session}
                        </span>
                        <span
                          className="text-[11px] uppercase"
                          style={{ letterSpacing: "0.08em", color: "rgba(240,237,230,0.45)" }}
                        >
                          {t.duration}
                        </span>
                      </div>
                      <p
                        className="mt-3"
                        style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(240,237,230,0.55)" }}
                      >
                        {t.rationale}
                      </p>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </Section>

          <Section
            innerRef={(el) => { refs.current["03"] = el; }}
            num="03"
            title="De dosering"
          >
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(240,237,230,0.9)" }}>
              {tw.getText("dosering")}
              <Cursor on={tw.isCursorOn("dosering")} />
            </p>
          </Section>

          <Section
            innerRef={(el) => { refs.current["04"] = el; }}
            num="04"
            title="Looptijd en herijking"
          >
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(240,237,230,0.9)" }}>
              {tw.getText("looptijd")}
              <Cursor on={tw.isCursorOn("looptijd")} />
            </p>
          </Section>

          <Section
            innerRef={(el) => { refs.current["05"] = el; }}
            num="05"
            title="Waar je op let"
          >
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(240,237,230,0.9)" }}>
              {tw.getText("attention")}
              <Cursor on={tw.isCursorOn("attention")} />
            </p>
            {tw.isStarted("closing") && (
              <p
                className="mt-6 italic"
                style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(240,237,230,0.45)" }}
              >
                {tw.getText("closing")}
                <Cursor on={tw.isCursorOn("closing")} />
              </p>
            )}
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({
  num,
  title,
  innerRef,
  children,
}: {
  num: string;
  title: string;
  innerRef?: (el: HTMLDivElement | null) => void;
  children: React.ReactNode;
}) {
  return (
    <section
      ref={innerRef}
      style={{ paddingTop: 32, paddingBottom: 32 }}
    >
      <div className="mb-5 flex items-baseline gap-3">
        <span
          className="text-[10px] uppercase"
          style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.22)" }}
        >
          Fig {num}
        </span>
        <h3 className="font-display" style={{ fontSize: 22, color: "#f0ede6", lineHeight: 1.1 }}>
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function SidebarAction({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-[12px] transition-colors"
      style={
        primary
          ? { background: "var(--sage)", color: "#0c0c0a", fontWeight: 500 }
          : { background: "transparent", color: "rgba(240,237,230,0.65)", border: "1px solid var(--border-default)" }
      }
    >
      {children}
    </button>
  );
}
