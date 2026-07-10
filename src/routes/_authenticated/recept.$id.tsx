import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Download, Pencil } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { PhaseBadge, type Phase } from "@/components/brand/PhaseBadge";
import { useTypewriter, Cursor } from "@/lib/typewriter";
import { getPrescriptionByRx, type Recipe, type Intake } from "@/lib/recipe";

export const Route = createFileRoute("/_authenticated/recept/$id")({
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
    variant: "",
    domain: "—",
    setting: "individueel",
    frequencyPerWeek: "",
    timeOfDay: [],
    timeOfDayOther: "",
    sessionDuration: [],
    recipeDuration: "",
    recipeDurationOther: "",
    special_conditions: [],
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
    let cancelled = false;
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
    // Fall back to DB lookup for older recipes opened from /recepten.
    (async () => {
      try {
        const stored = await getPrescriptionByRx(id);
        if (cancelled) return;
        if (stored) {
          setData(stored);
          sessionStorage.setItem(
            `nsdr:recipe:${id.toLowerCase()}`,
            JSON.stringify(stored),
          );
        } else {
          setData(FALLBACK);
        }
      } catch {
        if (!cancelled) setData(FALLBACK);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const [copied, setCopied] = useState(false);

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

  const rxNumber = id.toUpperCase();
  const dateStr = new Date(stored.createdAt).toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const copyToClipboard = async () => {
    const text = [
      `NSDR op Recept — ${rxNumber}`,
      dateStr,
      "",
      "VOOR WIE EN WAAR NU",
      recipe.voor_wie_en_waar_nu,
      "",
      "HET VOORSCHRIFT",
      `Eerste keus: ${recipe.het_voorschrift.eerste_keus.sessie} — ${recipe.het_voorschrift.eerste_keus.rationale}`,
      `Lichter: ${recipe.het_voorschrift.lichter.sessie} — ${recipe.het_voorschrift.lichter.rationale}`,
      `Zwaarder: ${recipe.het_voorschrift.zwaarder.sessie} — ${recipe.het_voorschrift.zwaarder.rationale}`,
      "",
      "DE DOSERING",
      recipe.de_dosering,
      "",
      "LOOPTIJD EN HERIJKING",
      recipe.looptijd_en_herijking,
      "",
      "WAAR JE OP LET",
      recipe.waar_je_op_let,
      "",
      "---",
      "NSDR komt naast bestaande zorg, niet in plaats daarvan.",
      "Deeprelax Institute — deeprelax.com",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopiëren mislukt");
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth(); // 210
    const pageH = doc.internal.pageSize.getHeight(); // 297
    const mL = 20;
    const mR = 20;
    const mT = 18;
    const mB = 18;
    const contentW = pageW - mL - mR;

    // Load profile from localStorage
    type Profile = {
      name: string;
      profession: string;
      organization: string;
      address: string;
      city: string;
      phone: string;
      email: string;
      bigNumber: string;
    };
    let profile: Profile = {
      name: "",
      profession: "",
      organization: "",
      address: "",
      city: "",
      phone: "",
      email: "",
      bigNumber: "",
    };
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("nsdr:settings:profile")
          : null;
      if (raw) profile = { ...profile, ...JSON.parse(raw) };
    } catch {}

    const phaseColors: Record<string, [number, number, number]> = {
      rood: [226, 75, 74],
      "rood-geel": [212, 128, 32],
      "geel-groen": [122, 176, 64],
      groen: [58, 128, 64],
    };
    const phaseLabels: Record<string, string> = {
      rood: "Rood",
      "rood-geel": "Rood-Geel",
      "geel-groen": "Geel-Groen",
      groen: "Groen",
    };
    const phaseKey = (intake.phase as string) || "";
    const phaseRGB = phaseColors[phaseKey] ?? [120, 120, 120];
    const phaseLbl = phaseLabels[phaseKey] ?? phaseKey;

    // ── HEADER (drawn once on first page) ──
    const drawHeader = () => {
      let yL = mT;
      // Left — behandelaar
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text(profile.name || "—", mL, yL + 4);
      yL += 5.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(85, 85, 85);
      const leftLines: string[] = [];
      if (profile.profession) leftLines.push(profile.profession);
      if (profile.organization) leftLines.push(profile.organization);
      const addr = [profile.address, profile.city].filter(Boolean).join(", ");
      if (addr) leftLines.push(addr);
      if (profile.phone) leftLines.push(profile.phone);
      if (profile.email) leftLines.push(profile.email);
      for (const line of leftLines) {
        yL += 4.2;
        doc.text(line, mL, yL);
      }
      if (profile.bigNumber) {
        yL += 4.5;
        doc.setFontSize(9);
        doc.setTextColor(136, 136, 136);
        doc.text(`BIG-nummer: ${profile.bigNumber}`, mL, yL);
      }

      // Right — recept info
      let yR = mT;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(136, 136, 136);
      doc.setCharSpace(0.8);
      doc.text("NSDR OP RECEPT", pageW - mR, yR + 3, { align: "right" });
      doc.setCharSpace(0);
      yR += 9;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(0, 0, 0);
      doc.text(rxNumber, pageW - mR, yR + 4, { align: "right" });
      yR += 9;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(85, 85, 85);
      doc.text(`Datum: ${dateStr}`, pageW - mR, yR + 2, { align: "right" });

      const headerBottom = Math.max(yL, yR + 2) + 4;

      // Divider
      doc.setDrawColor(51, 51, 51);
      doc.setLineWidth(0.18);
      doc.line(mL, headerBottom, pageW - mR, headerBottom);

      return headerBottom + 8; // gap 8mm
    };

    // ── COMPACT HEADER for continuation pages ──
    const drawContinuationHeader = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(rxNumber, mL, mT + 3);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(136, 136, 136);
      doc.text(profile.name || "", pageW - mR, mT + 3, { align: "right" });

      const yLine = mT + 6;
      doc.setDrawColor(51, 51, 51);
      doc.setLineWidth(0.18);
      doc.line(mL, yLine, pageW - mR, yLine);
      return yLine + 6;
    };

    let y = drawHeader();

    // ── PATIENT CONTEXT BLOCK ──
    const drawContextBox = (startY: number) => {
      const padding = 5;
      const boxX = mL;
      const boxW = contentW;
      const colW = (boxW - padding * 3) / 2;

      // Measure content
      doc.setFontSize(10);
      const clientText = intake.context || "—";
      const clientLines = doc.splitTextToSize(clientText, colW);
      const variantText = intake.variant ? ` ${intake.variant}` : "";
      const faseTextLines = doc.splitTextToSize(
        `${phaseLbl}${variantText}`,
        colW - 4,
      );

      const labelH = 4;
      const lineH = 4.6;
      const leftH = labelH + 2 + clientLines.length * lineH;
      const rightH = labelH + 2 + faseTextLines.length * lineH;
      const boxH = Math.max(leftH, rightH) + padding * 2;

      // Box
      doc.setFillColor(248, 248, 248);
      doc.setDrawColor(248, 248, 248);
      doc.roundedRect(boxX, startY, boxW, boxH, 2, 2, "F");

      // Left col — CLIËNT
      const leftX = boxX + padding;
      let ly = startY + padding + 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(136, 136, 136);
      doc.setCharSpace(0.5);
      doc.text("CLIËNT", leftX, ly);
      doc.setCharSpace(0);
      ly += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      for (const l of clientLines) {
        doc.text(l, leftX, ly);
        ly += lineH;
      }

      // Right col — FASE
      const rightX = boxX + padding * 2 + colW;
      let ry = startY + padding + 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(136, 136, 136);
      doc.setCharSpace(0.5);
      doc.text("FASE", rightX, ry);
      doc.setCharSpace(0);
      ry += 5;

      // Phase color dot/pill
      doc.setFillColor(phaseRGB[0], phaseRGB[1], phaseRGB[2]);
      doc.circle(rightX + 1.6, ry - 1.2, 1.4, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(faseTextLines[0] ?? "", rightX + 5, ry);
      ry += lineH;
      for (let i = 1; i < faseTextLines.length; i++) {
        doc.text(faseTextLines[i], rightX + 5, ry);
        ry += lineH;
      }

      return startY + boxH + 8; // gap 8mm
    };

    y = drawContextBox(y);

    // ── SECTIONS ──
    const footerReserve = 18; // mm reserved at bottom
    const availableBottom = () => pageH - mB - footerReserve;

    const measureSection = (title: string, body: string) => {
      doc.setFontSize(11);
      const titleH = 6 + 2 + 2; // title + rule + gap
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(body, contentW);
      return titleH + lines.length * 5.2 + 6;
    };

    const ensureSpace = (needed: number) => {
      if (y + needed > availableBottom()) {
        doc.addPage();
        y = drawContinuationHeader();
      }
    };

    const drawSection = (num: string, title: string, body: string) => {
      const needed = measureSection(title, body);
      ensureSpace(needed);

      // Number + label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(136, 136, 136);
      doc.setCharSpace(0.6);
      doc.text(num, mL, y);
      doc.setCharSpace(0);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(title.toUpperCase(), mL + 8, y);
      y += 2;

      // Thin rule
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.15);
      doc.line(mL, y, pageW - mR, y);
      y += 5;

      // Body
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      const lines = doc.splitTextToSize(body, contentW);
      for (const l of lines) {
        doc.text(l, mL, y);
        y += 5.2;
      }
      y += 6;
    };

    // Section 02 — Voorschrift (three tiers)
    const drawVoorschrift = () => {
      const tiersArr = [
        {
          label: "Eerste keus",
          ...recipe.het_voorschrift.eerste_keus,
          color: [140, 158, 110] as [number, number, number],
        },
        {
          label: "Lichter, als terugval",
          ...recipe.het_voorschrift.lichter,
          color: [160, 160, 160] as [number, number, number],
        },
        {
          label: "Zwaarder, als opbouw",
          ...recipe.het_voorschrift.zwaarder,
          color: [109, 138, 168] as [number, number, number],
        },
      ];

      // Measure full block
      doc.setFontSize(11);
      let blockH = 6 + 2 + 5; // header + rule + gap
      for (const t of tiersArr) {
        const sLines = doc.splitTextToSize(t.sessie, contentW - 4);
        const rLines = doc.splitTextToSize(t.rationale, contentW - 4);
        blockH += 5 + sLines.length * 5 + rLines.length * 4.8 + 5;
      }
      ensureSpace(blockH);

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(136, 136, 136);
      doc.setCharSpace(0.6);
      doc.text("02", mL, y);
      doc.setCharSpace(0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text("HET VOORSCHRIFT", mL + 8, y);
      y += 2;
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.15);
      doc.line(mL, y, pageW - mR, y);
      y += 5;

      for (const t of tiersArr) {
        // Left color bar
        const startY = y - 1;
        const sLines = doc.splitTextToSize(t.sessie, contentW - 6);
        const rLines = doc.splitTextToSize(t.rationale, contentW - 6);
        const tierH = 4 + sLines.length * 5 + rLines.length * 4.6 + 2;
        doc.setFillColor(t.color[0], t.color[1], t.color[2]);
        doc.rect(mL, startY, 1.2, tierH, "F");

        const tx = mL + 5;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(t.color[0], t.color[1], t.color[2]);
        doc.setCharSpace(0.5);
        doc.text(t.label.toUpperCase(), tx, y + 1);
        doc.setCharSpace(0);
        y += 4;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        for (const l of sLines) {
          doc.text(l, tx, y + 2);
          y += 5;
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(85, 85, 85);
        for (const l of rLines) {
          doc.text(l, tx, y + 2);
          y += 4.6;
        }
        y += 4;
      }
      y += 2;
    };

    drawSection("01", "Voor wie en waar nu", recipe.voor_wie_en_waar_nu);
    drawVoorschrift();
    drawSection("03", "De dosering", recipe.de_dosering);
    drawSection("04", "Looptijd en herijking", recipe.looptijd_en_herijking);
    drawSection("05", "Waar je op let", recipe.waar_je_op_let);

    // ── SIGNATURE BLOCK on last page ──
    const sigH = 28;
    if (y + sigH > availableBottom()) {
      doc.addPage();
      y = drawContinuationHeader();
    }
    const sigY = Math.max(y + 10, availableBottom() - sigH);
    const colGap = 10;
    const leftColW = 70;

    // Left — handtekening
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(136, 136, 136);
    doc.setCharSpace(0.5);
    doc.text("HANDTEKENING BEHANDELAAR", mL, sigY);
    doc.setCharSpace(0);

    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.3);
    doc.line(mL, sigY + 14, mL + leftColW, sigY + 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(profile.name || "", mL, sigY + 19);
    if (profile.profession) {
      doc.setTextColor(136, 136, 136);
      doc.text(profile.profession, mL, sigY + 23);
    }

    // Right — datum
    const rightX = mL + leftColW + colGap;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(136, 136, 136);
    doc.setCharSpace(0.5);
    doc.text("DATUM", rightX, sigY);
    doc.setCharSpace(0);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(dateStr, rightX, sigY + 14);

    // ── FOOTER on every page ──
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const fy = pageH - mB;
      doc.setDrawColor(221, 221, 221);
      doc.setLineWidth(0.1);
      doc.line(mL, fy - 6, pageW - mR, fy - 6);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(153, 153, 153);
      doc.text(
        "NSDR komt naast bestaande zorg, niet in plaats daarvan.",
        mL,
        fy - 1,
      );

      doc.setFont("helvetica", "normal");
      doc.text(
        `Deeprelax Institute — deeprelax.com   pagina ${i} / ${pageCount}`,
        pageW - mR,
        fy - 1,
        { align: "right" },
      );
    }

    doc.save(`${rxNumber}.pdf`);
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
                  className="relative flex shrink-0 cursor-pointer items-baseline gap-2 px-3 py-2 text-left transition-colors hover:text-[#f0ede6] lg:gap-3 lg:px-0"
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
          <SidebarAction primary onClick={downloadPDF}>
            <Download className="h-3.5 w-3.5" strokeWidth={1.5} /> PDF downloaden
          </SidebarAction>
          <SidebarAction onClick={() => {
            sessionStorage.removeItem("nsdr:intake");
            navigate({ to: "/nieuw" });
          }}>
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} /> Nieuwe
          </SidebarAction>
          <SidebarAction onClick={copyToClipboard}>
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={1.5} /> Gekopieerd!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" strokeWidth={1.5} /> Kopiëren
              </>
            )}
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
      data-primary={primary ? "true" : "false"}
      className="sidebar-action inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-[12px] transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]"
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
