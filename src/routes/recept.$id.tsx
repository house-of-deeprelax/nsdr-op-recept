import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, Pencil } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PhaseBadge, type Phase } from "@/components/brand/PhaseBadge";
import { useTypewriter, Cursor } from "@/lib/typewriter";
import type { Recipe, Intake } from "@/lib/recipe";

export const Route = createFileRoute("/recept/$id")({
  head: () => ({ meta: [{ title: "Voorschrift — NSDR op Recept" }] }),
  component: RecipePage,
});

type Stored = { recipe: Recipe; intake: Intake; createdAt: string };

const FALLBACK: Stored = {
  recipe: {
    voor_wie_en_waar_nu:
      "Geen opgeslagen recept gevonden. Start een nieuwe intake om een voorschrift te genereren.",
    het_voorschrift: {
      eerste_keus: { sessie: "—", rationale: "Nog geen recept beschikbaar." },
      lichter: { sessie: "—", rationale: "Nog geen recept beschikbaar." },
      zwaarder: { sessie: "—", rationale: "Nog geen recept beschikbaar." },
    },
    de_dosering: "—",
    looptijd_en_herijking: "—",
    waar_je_op_let: "—",
  },
  intake: {
    context: "",
    complaint: "",
    duration: "",
    treatment: "",
    somaticCleared: true,
    phase: "rood-geel",
    domain: "—",
    setting: "individueel",
    time: "20 min",
    frequency: "Dagelijks",
    rhythm: "Ochtendmens",
  },
  createdAt: new Date().toISOString(),
};

const sections = [
  { num: "01", label: "Voor wie" },
  { num: "02", label: "Voorschrift" },
  { num: "03", label: "Dosering" },
  { num: "04", label: "Looptijd" },
  { num: "05", label: "Waar je op let" },
];

function RecipePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<Stored | null>(null);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem(`nsdr:recipe:${id.toLowerCase()}`)
        : null;
    if (raw) {
      try {
        setData(JSON.parse(raw));
        return;
      } catch {}
    }
    setData(FALLBACK);
  }, [id]);

  const stored = data ?? FALLBACK;
  const recipe = stored.recipe;
  const intake = stored.intake;

  const blocks = useMemo(
    () => [
      { id: "intro", text: recipe.voor_wie_en_waar_nu },
      { id: "tiers", text: "" },
      { id: "dosering", text: recipe.de_dosering },
      { id: "looptijd", text: recipe.looptijd_en_herijking },
      { id: "attention", text: recipe.waar_je_op_let },
      { id: "closing", text: "NSDR komt naast bestaande zorg, niet in plaats daarvan." },
    ],
    [recipe],
  );

  const tiers = useMemo(
    () => [
      {
        label: "Eerste keus",
        accent: "var(--sage)",
        pill: "rgba(140,158,110,0.15)",
        session: recipe.het_voorschrift.eerste_keus.sessie,
        rationale: recipe.het_voorschrift.eerste_keus.rationale,
      },
      {
        label: "Lichter, als terugval",
        accent: "rgba(240,237,230,0.25)",
        pill: "rgba(240,237,230,0.05)",
        session: recipe.het_voorschrift.lichter.sessie,
        rationale: recipe.het_voorschrift.lichter.rationale,
      },
      {
        label: "Zwaarder, als opbouw",
        accent: "#6d8aa8",
        pill: "rgba(109,138,168,0.12)",
        session: recipe.het_voorschrift.zwaarder.sessie,
        rationale: recipe.het_voorschrift.zwaarder.rationale,
      },
    ],
    [recipe],
  );

  // Re-key typewriter when data loads so it animates fresh content
  const twKey = data ? "loaded" : "fallback";
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

  const copyToClipboard = () => {
    const text = [
      `RX-${id.toUpperCase()}`,
      "",
      "VOOR WIE EN WAAR NU",
      recipe.voor_wie_en_waar_nu,
      "",
      "HET VOORSCHRIFT",
      `Eerste keus: ${recipe.het_voorschrift.eerste_keus.sessie}`,
      recipe.het_voorschrift.eerste_keus.rationale,
      "",
      `Lichter: ${recipe.het_voorschrift.lichter.sessie}`,
      recipe.het_voorschrift.lichter.rationale,
      "",
      `Zwaarder: ${recipe.het_voorschrift.zwaarder.sessie}`,
      recipe.het_voorschrift.zwaarder.rationale,
      "",
      "DOSERING",
      recipe.de_dosering,
      "",
      "LOOPTIJD EN HERIJKING",
      recipe.looptijd_en_herijking,
      "",
      "WAAR JE OP LET",
      recipe.waar_je_op_let,
    ].join("\n");
    navigator.clipboard?.writeText(text);
  };

  const phase = intake.phase as Phase;

  return (
    <div key={twKey} className="flex w-full flex-col lg:flex-row" style={{ minHeight: "calc(100vh - 44px)" }}>
      {/* LEFT — sidebar */}
      <aside
        className="flex w-full flex-col p-6 sm:p-8 lg:sticky lg:top-11 lg:h-[calc(100vh-44px)] lg:w-[280px] lg:min-w-[280px] lg:p-[32px_24px]"
        style={{
          background: "var(--surface-1)",
          borderRight: "1px solid var(--border-default)",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <div className="flex items-start justify-between gap-4 lg:block">
          <div>
            <span
              className="text-[10px] uppercase"
              style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.22)" }}
            >
              Voorschrift
            </span>
            <div
              className="mt-2 font-display text-[24px] lg:text-[28px]"
              style={{ lineHeight: 1.05, color: "#f0ede6" }}
            >
              {id.toUpperCase()}
            </div>
            <div
              className="mt-2 text-[11px] uppercase"
              style={{ letterSpacing: "0.1em", color: "rgba(240,237,230,0.3)" }}
            >
              {new Date(stored.createdAt).toLocaleDateString("nl-NL", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </div>
          </div>

          <div className="flex flex-row flex-wrap items-center gap-2 lg:mt-8 lg:flex-col lg:items-start">
            <PhaseBadge phase={phase} />
            {intake.domain && (
              <span
                className="rounded-full px-2.5 py-1 text-[11px]"
                style={{
                  background: "rgba(240,237,230,0.04)",
                  color: "rgba(240,237,230,0.7)",
                  border: "1px solid var(--border-default)",
                }}
              >
                {intake.domain}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 lg:mt-10">
          <span
            className="hidden text-[10px] uppercase lg:inline-block"
            style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.22)" }}
          >
            Secties
          </span>
          <nav className="no-scrollbar -mx-6 mt-0 flex flex-row gap-1 overflow-x-auto px-6 sm:-mx-8 sm:px-8 lg:mx-0 lg:mt-3 lg:flex-col lg:overflow-visible lg:px-0">
            {sections.map((s) => {
              const active = activeSection === s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => scrollTo(s.num)}
                  className="relative flex shrink-0 items-baseline gap-2 px-3 py-2 text-left transition-colors lg:gap-3 lg:px-0"
                  style={{
                    color: active ? "#f0ede6" : "rgba(240,237,230,0.45)",
                    borderBottom: active ? "1px solid var(--sage)" : "1px solid transparent",
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute hidden lg:block"
                    style={{
                      left: -24, top: 10, height: 14, width: 2,
                      background: active ? "var(--sage)" : "transparent",
                    }}
                  />
                  <span
                    className="text-[10px] uppercase"
                    style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.3)" }}
                  >
                    {s.num}
                  </span>
                  <span className="whitespace-nowrap text-[13px]">{s.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-6 flex flex-row flex-wrap gap-1.5 lg:mt-auto lg:flex-col lg:pt-8">
          <SidebarAction primary onClick={() => window.print()}>
            <Download className="h-3.5 w-3.5" strokeWidth={1.5} /> PDF
          </SidebarAction>
          <SidebarAction onClick={() => navigate({ to: "/nieuw" })}>
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} /> Nieuwe
          </SidebarAction>
          <SidebarAction onClick={copyToClipboard}>
            <Copy className="h-3.5 w-3.5" strokeWidth={1.5} /> Kopiëren
          </SidebarAction>
          <Link
            to="/"
            className="hidden text-[11px] uppercase transition-colors lg:mt-3 lg:inline-block"
            style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.3)" }}
          >
            ← Dashboard
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <main
        className="flex-1 p-6 pb-24 sm:p-10 lg:p-[56px_72px_120px]"
        style={{ background: "var(--background)" }}
      >
        <div className="max-w-[640px]">
          <Section
            innerRef={(el) => { refs.current["01"] = el; }}
            num="01"
            title="Voor wie en waar nu"
          >
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(240,237,230,0.9)" }}>
              {tw.getText("intro")}
              <Cursor on={tw.isCursorOn("intro")} />
            </p>
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
                        borderRadius: "0 4px 4px 0",
                      }}
                      className="p-4 sm:p-5 lg:px-6 lg:py-5"
                    >
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
                        <span
                          className="self-start rounded-full px-2.5 py-1 text-[10px] uppercase"
                          style={{ letterSpacing: "0.12em", background: t.pill, color: t.accent }}
                        >
                          {t.label}
                        </span>
                        <span
                          className="font-display-700 lg:flex-1 lg:text-right"
                          style={{ fontSize: 14, color: "#f0ede6" }}
                        >
                          {t.session}
                        </span>
                      </div>
                      <p
                        className="mt-3"
                        style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(240,237,230,0.6)" }}
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
  num, title, innerRef, children,
}: {
  num: string;
  title: string;
  innerRef?: (el: HTMLDivElement | null) => void;
  children: React.ReactNode;
}) {
  return (
    <section ref={innerRef} style={{ paddingTop: 32, paddingBottom: 32 }}>
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

function SidebarAction({
  children, primary, onClick,
}: {
  children: React.ReactNode;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
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
