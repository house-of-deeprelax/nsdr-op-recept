import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NSDR op Recept — Deeprelax Institute" },
      { name: "description", content: "Een prescribing instrument voor wellness en healthcare professionals." },
    ],
  }),
  component: Dashboard,
});

const ease = [0.22, 1, 0.36, 1] as const;

function Dashboard() {
  return (
    <div className="flex w-full flex-col" style={{ minHeight: "calc(100vh - 44px)" }}>
      {/* HERO */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease }}
        className="relative w-full overflow-hidden"
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
              "radial-gradient(900px 600px at 80% 10%, rgba(140,158,110,0.06), transparent 60%)",
          }}
        />

        <div className="relative mx-auto flex w-full max-w-[1400px] flex-col justify-center px-6 py-20 sm:px-10 sm:py-28 lg:px-16 lg:py-36">
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
            className="mt-6 max-w-[1100px] font-display text-[40px] sm:text-[64px] lg:text-[88px]"
            style={{
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              color: "#f0ede6",
            }}
          >
            Schrijf een recept op basis van de casus.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28, ease }}
            className="mt-6 max-w-[560px] text-[14px] sm:mt-7 sm:text-[15px]"
            style={{ lineHeight: 1.65, color: "rgba(240,237,230,0.5)" }}
          >
            Drie stappen: casus, systeemscan, setting. We stellen een passend
            voorschrift samen volgens de RESET-PRO methode.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease }}
            className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10"
          >
            <CTAButton to="/nieuw">Schrijf een recept</CTAButton>
            <SecondaryButton to="/recepten">Alle recepten</SecondaryButton>
          </motion.div>
        </div>
      </motion.section>

      {/* HOE WERKT HET */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease }}
        className="border-t"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div className="mx-auto w-full max-w-[1400px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
          <div className="flex items-baseline justify-between">
            <span
              className="text-[10px] uppercase"
              style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.22)" }}
            >
              Hoe werkt het
            </span>
          </div>

          <h2
            className="mt-4 max-w-[720px] font-display text-[28px] sm:text-[36px] lg:text-[44px]"
            style={{ lineHeight: 1.1, letterSpacing: "-0.02em", color: "#f0ede6" }}
          >
            Van casus naar voorschrift in drie stappen.
          </h2>

          <div
            className="mt-10 grid grid-cols-1 md:grid-cols-3"
            style={{ borderTop: "1px solid var(--border-default)" }}
          >
            <Step
              n="01"
              title="Casus invoeren"
              body="Beschrijf de patiënt: leeftijd, klacht, context. Kort en specifiek — de basis van het recept."
            />
            <Step
              n="02"
              title="Systeemscan"
              body="Bepaal fase en variant. Het systeem koppelt RESET-PRO domeinen aan de juiste interventies."
              middle
            />
            <Step
              n="03"
              title="Setting & recept"
              body="Kies setting en tijd. Download een professioneel PDF-voorschrift, klaar voor de patiënt."
            />
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

function SecondaryButton({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2 rounded-md border px-5 py-3 transition-all duration-[120ms]"
      style={{
        borderColor: "var(--border-default)",
        color: "#f0ede6",
        background: "transparent",
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: 13,
        letterSpacing: "0.02em",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(240,237,230,0.05)";
        e.currentTarget.style.borderColor = "var(--border-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "var(--border-default)";
      }}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
    </Link>
  );
}

function Step({
  n,
  title,
  body,
  middle,
}: {
  n: string;
  title: string;
  body: string;
  middle?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-5 px-0 py-8 md:px-8"
      style={{
        borderLeft: middle ? "1px solid var(--border-default)" : undefined,
        borderRight: middle ? "1px solid var(--border-default)" : undefined,
      }}
    >
      <span
        className="font-display text-[44px]"
        style={{ lineHeight: 1, color: "var(--sage)", letterSpacing: "-0.02em" }}
      >
        {n}
      </span>
      <h3
        className="font-display text-[20px]"
        style={{ lineHeight: 1.2, color: "#f0ede6", letterSpacing: "-0.01em" }}
      >
        {title}
      </h3>
      <p className="text-[13px]" style={{ lineHeight: 1.65, color: "rgba(240,237,230,0.5)" }}>
        {body}
      </p>
    </div>
  );
}
