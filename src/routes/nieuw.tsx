import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import type { Phase } from "@/components/brand/PhaseBadge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/nieuw")({
  head: () => ({ meta: [{ title: "Nieuw recept — NSDR op Recept" }] }),
  component: NieuwPage,
});

const phases: { id: Phase; label: string; color: string; hint: string }[] = [
  { id: "rood", label: "Rood", color: "#e24b4a", hint: "Acuut ontregeld" },
  { id: "rood-geel", label: "Rood-Geel", color: "#d48020", hint: "Beginnend herstel" },
  { id: "geel-groen", label: "Geel-Groen", color: "#7ab040", hint: "Veerkracht terug" },
  { id: "groen", label: "Groen", color: "#3a8040", hint: "Onderhoud en groei" },
];

const domains = [
  "Burn-out", "Postviraal", "Long COVID", "Trauma", "Rouw",
  "Neurodivergentie", "Hormonaal", "Postcommotioneel",
  "Chronische pijn", "Slaapproblemen",
];

const stepTitles = ["De casus", "Systeemscan", "Setting"];

function NieuwPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const [context, setContext] = useState("");
  const [complaint, setComplaint] = useState("");
  const [duration, setDuration] = useState("");
  const [treatment, setTreatment] = useState("");
  const [somatic, setSomatic] = useState<null | boolean>(null);

  const [phase, setPhase] = useState<Phase | null>(null);
  const [domain, setDomain] = useState<string>("");

  const [setting, setSetting] = useState<"individueel" | "groep">("individueel");
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState("");
  const [rhythm, setRhythm] = useState("");

  const canNext =
    (step === 0 && context && complaint && duration && somatic !== null) ||
    (step === 1 && phase && domain) ||
    (step === 2 && time && frequency && rhythm);

  const progress = ((step + 1) / 3) * 100;

  const go = (delta: 1 | -1) => {
    if (delta === 1 && step === 2) {
      navigate({ to: "/genereren" });
      return;
    }
    setDirection(delta);
    setStep(step + delta);
  };

  return (
    <>
      {/* Progress line at top of viewport */}
      <div className="fixed left-0 right-0 top-0 z-30 h-[1.5px] bg-[rgba(var(--paper-rgb),0.06)]">
        <motion.div
          className="h-full bg-[var(--sage)]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <PageTransition>
        <div className="mx-auto max-w-[560px] pt-8">
          <div className="mb-12">
            <span className="text-label">Stap {step + 1} van 3</span>
            <h2 className="mt-3 font-display text-[36px] leading-[1.05]">{stepTitles[step]}</h2>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ opacity: 0, x: direction === 1 ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === 1 ? -20 : 20 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                {step === 0 && (
                  <div className="space-y-10">
                    <Field label="Leeftijd en context">
                      <LineTextarea
                        value={context}
                        onChange={setContext}
                        placeholder="bv. vrouw, 44, HR-manager, twee kinderen"
                      />
                    </Field>
                    <Field label="Hoofdklacht">
                      <LineTextarea
                        value={complaint}
                        onChange={setComplaint}
                        placeholder="waar komt deze persoon mee, in jouw woorden"
                      />
                    </Field>
                    <Field label="Duur klachten">
                      <LineInput value={duration} onChange={setDuration} placeholder="bv. 8 maanden" />
                    </Field>
                    <Field label="Lopende behandeling" optional>
                      <LineInput value={treatment} onChange={setTreatment} placeholder="bv. POH-GGZ, fysio" />
                    </Field>
                    <Field label="Somatische oorzaak uitgesloten">
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <LineToggle active={somatic === true} onClick={() => setSomatic(true)} label="Ja, uitgesloten" />
                        <LineToggle active={somatic === false} onClick={() => setSomatic(false)} label="Nee of onbekend" />
                      </div>
                    </Field>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-12">
                    <Field label="Fase">
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        {phases.map((p) => {
                          const active = phase === p.id;
                          return (
                            <motion.button
                              key={p.id}
                              type="button"
                              onClick={() => setPhase(p.id)}
                              whileTap={{ scale: 0.98 }}
                              animate={{ scale: active ? 1.02 : 1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 22 }}
                              className="relative flex aspect-[1.4/1] flex-col items-center justify-center rounded-[10px] border transition-colors duration-200"
                              style={{
                                borderColor: active
                                  ? `color-mix(in oklab, ${p.color} 60%, transparent)`
                                  : "rgba(var(--paper-rgb),0.08)",
                                background: active
                                  ? `color-mix(in oklab, ${p.color} 6%, transparent)`
                                  : "transparent",
                              }}
                            >
                              <span
                                className="block rounded-full"
                                style={{
                                  width: 40,
                                  height: 40,
                                  background: p.color,
                                  boxShadow: active ? `0 0 24px ${p.color}` : `0 0 12px ${p.color}`,
                                  opacity: active ? 1 : 0.85,
                                }}
                              />
                              <span className="font-display mt-4 text-base">{p.label}</span>
                              <span className="text-label mt-1.5">{p.hint}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </Field>

                    <Field label="Dominant domein">
                      <div className="flex flex-wrap gap-2 pt-2">
                        {domains.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setDomain(d)}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-xs transition-colors duration-200",
                              domain === d
                                ? "border-[var(--sage)] text-foreground"
                                : "border-[rgba(var(--paper-rgb),0.08)] text-[rgba(var(--paper-rgb),0.5)] hover:text-foreground",
                            )}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-10">
                    <Field label="Setting">
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <LineToggle active={setting === "individueel"} onClick={() => setSetting("individueel")} label="Individueel" />
                        <LineToggle active={setting === "groep"} onClick={() => setSetting("groep")} label="Groep" />
                      </div>
                    </Field>
                    <Field label="Beschikbare tijd">
                      <ChipSelect value={time} onChange={setTime} options={["10 min", "20 min", "30 min", "45 min"]} />
                    </Field>
                    <Field label="Frequentie">
                      <ChipSelect value={frequency} onChange={setFrequency} options={["Dagelijks", "3x per week", "2x per week", "1x per week"]} />
                    </Field>
                    <Field label="Dagritme">
                      <ChipSelect value={rhythm} onChange={setRhythm} options={["Ochtendmens", "Avondmens", "Wisselend"]} />
                    </Field>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-14 flex items-center justify-between">
            <button
              onClick={() => go(-1)}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 text-sm text-[rgba(var(--paper-rgb),0.5)] transition-colors hover:text-foreground disabled:opacity-30 disabled:hover:text-[rgba(var(--paper-rgb),0.5)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Vorige
            </button>
            <CTAButton onClick={() => go(1)} disabled={!canNext}>
              {step === 2 ? (
                <>
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} /> Recept genereren
                </>
              ) : (
                <>
                  Volgende <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </>
              )}
            </CTAButton>
          </div>
        </div>
      </PageTransition>
    </>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <label className="text-label">{label}</label>
        {optional && <span className="text-label">— optioneel</span>}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function LineInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border-b border-[rgba(var(--paper-rgb),0.12)] bg-transparent py-2 text-base text-foreground outline-none transition-colors duration-200 placeholder:text-[rgba(var(--paper-rgb),0.3)] focus:border-b focus:border-[var(--sage)]"
      style={{ borderBottomWidth: "0.5px" }}
      onFocus={(e) => { e.currentTarget.style.borderBottom = "1px solid var(--sage)"; }}
      onBlur={(e) => { e.currentTarget.style.borderBottom = "0.5px solid rgba(241,241,238,0.12)"; }}
    />
  );
}

function LineTextarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className="w-full resize-none border-b border-[rgba(var(--paper-rgb),0.12)] bg-transparent py-2 text-base text-foreground outline-none transition-colors duration-200 placeholder:text-[rgba(var(--paper-rgb),0.3)]"
      style={{ borderBottomWidth: "0.5px" }}
      onFocus={(e) => { e.currentTarget.style.borderBottom = "1px solid var(--sage)"; }}
      onBlur={(e) => { e.currentTarget.style.borderBottom = "0.5px solid rgba(241,241,238,0.12)"; }}
    />
  );
}

function LineToggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-4 py-3 text-sm transition-colors duration-200",
        active
          ? "border-[var(--sage)] text-foreground"
          : "border-[rgba(var(--paper-rgb),0.08)] text-[rgba(var(--paper-rgb),0.55)] hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function ChipSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs transition-colors duration-200",
            value === o
              ? "border-[var(--sage)] text-foreground"
              : "border-[rgba(var(--paper-rgb),0.08)] text-[rgba(var(--paper-rgb),0.5)] hover:text-foreground",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function CTAButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-md bg-[var(--sage)] px-4 py-2.5 text-sm text-[#1e1e1a] transition-all duration-[80ms] disabled:cursor-not-allowed disabled:opacity-30"
      onMouseDown={(e) => { if (!disabled) { e.currentTarget.style.transform = "scale(0.97)"; e.currentTarget.style.filter = "brightness(0.92)"; } }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.filter = "brightness(1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.filter = "brightness(1)"; }}
    >
      {children}
    </button>
  );
}
