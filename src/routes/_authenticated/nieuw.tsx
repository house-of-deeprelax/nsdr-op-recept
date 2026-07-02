import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import type { Phase } from "@/components/brand/PhaseBadge";

export const Route = createFileRoute("/_authenticated/nieuw")({
  head: () => ({ meta: [{ title: "Nieuw recept — NSDR op Recept" }] }),
  component: NieuwPage,
});

const phases: { id: Phase; label: string; color: string; hint: string }[] = [
  { id: "rood", label: "Rood", color: "var(--phase-rood)", hint: "Score 29-48" },
  { id: "rood-geel", label: "Rood-Geel", color: "var(--phase-rood-geel)", hint: "Score 20-28" },
  { id: "geel-groen", label: "Geel-Groen", color: "var(--phase-geel-groen)", hint: "Score 13-19" },
  { id: "groen", label: "Groen", color: "var(--phase-groen)", hint: "Score 0-12" },
];

const domains = [
  "Burn-out", "Slaapproblemen", "Hormonaal", "Chronische pijn",
  "Long COVID", "Trauma", "Rouw",
  "Neurodivergentie", "Postcommotioneel",
];

const variantsByPhase: Record<
  Phase,
  { label: string; value: string; description: string }[]
> = {
  rood: [
    { label: "Overdrive", value: "overdrive", description: "systeem staat constant aan" },
    { label: "Freeze", value: "freeze", description: "systeem is bevroren" },
    { label: "Oscillatie", value: "oscillatie", description: "gaat heen en weer" },
    { label: "Trigger-respons", value: "trigger-respons", description: "periodiek overspoeld" },
  ],
  "rood-geel": [
    { label: "Restspanning", value: "restspanning", description: "uit Overdrive" },
    { label: "Restvermoeidheid", value: "restvermoeidheid", description: "uit Freeze" },
    { label: "Restoscillatie", value: "restoscillatie", description: "uit Oscillatie" },
  ],
  "geel-groen": [
    { label: "Mentaal hoog", value: "mentaal-hoog", description: "hoofd staat niet uit" },
    { label: "Fysiek hoog", value: "fysiek-hoog", description: "lichaam is nog gespannen" },
    { label: "Emotioneel hoog", value: "emotioneel-hoog", description: "snel overspoeld" },
  ],
  groen: [
    { label: "Stabiel-onderhoudend", value: "stabiel-onderhoudend", description: "na hersteltraject" },
    { label: "Hoog-presterend", value: "hoog-presterend", description: "preventief gebruik" },
  ],
};

const specialConditions: { label: string; value: string }[] = [
  { label: "Long COVID / ME-CVS", value: "long_covid" },
  { label: "Neurodivergent ADHD", value: "neurodivergent_adhd" },
  { label: "Neurodivergent Autisme", value: "neurodivergent_autisme" },
  { label: "Perimenopauze", value: "perimenopauze" },
  { label: "Hersenschudding", value: "postcommotioneel" },
  { label: "Rouw", value: "rouw" },
  { label: "Groepsbehandeling", value: "groepsbehandeling" },
];

const steps = [
  {
    name: "De casus",
    blurb:
      "Beschrijf in eigen woorden wie er voor je zit. Context, hoofdklacht en duur — kort en concreet.",
  },
  {
    name: "Systeemscan",
    blurb:
      "Bepaal de regulatie-fase en het dominante domein. Dit stuurt protocol en intensiteit.",
  },
  {
    name: "Setting",
    blurb:
      "Hoeveel tijd, hoe vaak, op welk moment van de dag. Het ritme is belangrijker dan de duur.",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

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
  const [variant, setVariant] = useState<string>("");
  const [domain, setDomain] = useState<string>("");

  const [setting, setSetting] = useState<"individueel" | "groep">("individueel");
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState("");
  const [dailyTimes, setDailyTimes] = useState("");
  const [rhythm, setRhythm] = useState("");
  const [specialConds, setSpecialConds] = useState<string[]>([]);

  // Hydrate uit sessionStorage zodat intake bewaard blijft bij fouten / terugkeer
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("nsdr:intake");
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.context) setContext(d.context);
      if (d.complaint) setComplaint(d.complaint);
      if (d.duration) setDuration(d.duration);
      if (d.treatment) setTreatment(d.treatment);
      if (typeof d.somaticCleared === "boolean") setSomatic(d.somaticCleared);
      if (d.phase) setPhase(d.phase);
      if (d.variant) setVariant(d.variant);
      if (d.domain) setDomain(d.domain);
      if (d.setting) setSetting(d.setting);
      if (d.time) setTime(d.time);
      if (d.frequency) setFrequency(d.frequency);
      if (d.dailyTimes) setDailyTimes(d.dailyTimes);
      if (d.rhythm) setRhythm(d.rhythm);
      if (Array.isArray(d.special_conditions)) setSpecialConds(d.special_conditions);
    } catch {}
  }, []);

  const canNext =
    (step === 0 && context && complaint && duration && somatic !== null) ||
    (step === 1 && phase && variant) ||
    (step === 2 && frequency && (frequency !== "Dagelijks" || dailyTimes));

  const progress = ((step + 1) / 3) * 100;

  const selectPhase = (p: Phase) => {
    setPhase(p);
    setVariant("");
  };

  const toggleCondition = (value: string) => {
    setSpecialConds((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const go = (delta: 1 | -1) => {
    if (delta === 1 && step === 2) {
      const intake = {
        context, complaint, duration, treatment,
        somaticCleared: somatic === true,
        phase, variant, domain,
        setting, time, frequency, dailyTimes, rhythm,
        special_conditions: specialConds,
      };
      try {
        sessionStorage.setItem("nsdr:intake", JSON.stringify(intake));
      } catch {}
      navigate({ to: "/genereren" });
      return;
    }
    setDirection(delta);
    setStep(step + delta);
  };

  return (
    <div className="flex w-full flex-col lg:flex-row" style={{ minHeight: "calc(100vh - 44px)" }}>
      {/* LEFT — aside */}
      <aside
        className="relative flex w-full flex-col p-6 sm:p-8 lg:w-[38%] lg:p-[48px_32px]"
        style={{
          background: "var(--surface-1)",
          borderRight: "1px solid var(--border-default)",
        }}
      >
        <div className="relative">
          <span
            className="block font-display text-[36px] lg:text-[48px]"
            style={{ lineHeight: 1, color: "rgba(240,237,230,0.08)", letterSpacing: "-0.03em" }}
          >
            {String(step + 1).padStart(2, "0")} / 03
          </span>
          <motion.h2
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
            className="mt-2 font-display text-[20px] lg:mt-3 lg:text-[24px]"
            style={{ color: "#f0ede6", lineHeight: 1.1 }}
          >
            {steps[step].name}
          </motion.h2>

          {/* Progress line */}
          <div className="mt-6 h-px w-full lg:mt-8" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              className="h-full"
              style={{ background: "var(--sage)" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease }}
            />
          </div>

          <motion.p
            key={`blurb-${step}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-6 hidden lg:mt-8 lg:block"
            style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(240,237,230,0.4)" }}
          >
            {steps[step].blurb}
          </motion.p>
        </div>

        {/* Desktop nav pinned to bottom */}
        <div className="mt-auto hidden items-center justify-between pt-12 lg:flex">
          <button
            onClick={() => go(-1)}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 text-[12px] transition-colors disabled:opacity-25"
            style={{ color: "rgba(240,237,230,0.45)" }}
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={1.5} /> Vorige
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
      </aside>

      {/* RIGHT — content */}
      <section
        className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-[48px_56px]"
        style={{ background: "var(--background)" }}
      >
        <div className="max-w-[640px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction === 1 ? 16 : -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === 1 ? -16 : 16 }}
              transition={{ duration: 0.25, ease }}
            >
              {step === 0 && (
                <div className="space-y-10">
                  <Field label="Leeftijd en context">
                    <LineTextarea value={context} onChange={setContext} placeholder="bv. vrouw, 44, HR-manager, twee kinderen" />
                  </Field>
                  <Field label="Hoofdklacht">
                    <LineTextarea value={complaint} onChange={setComplaint} placeholder="waar komt deze persoon mee, in jouw woorden" />
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
                            onClick={() => selectPhase(p.id)}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 22 }}
                            className="relative flex flex-col items-center justify-center transition-colors"
                            style={{
                              height: 120,
                              borderRadius: 6,
                              border: `1px solid ${active ? `color-mix(in oklab, ${p.color} 50%, transparent)` : "rgba(255,255,255,0.06)"}`,
                              background: active ? `color-mix(in oklab, ${p.color} 5%, transparent)` : "transparent",
                            }}
                          >
                            <span
                              className="block rounded-full"
                              style={{
                                width: 48,
                                height: 48,
                                background: p.color,
                                boxShadow: active ? `0 0 22px ${p.color}` : `0 0 10px ${p.color}`,
                                opacity: active ? 1 : 0.85,
                              }}
                            />
                            <span
                              className="mt-4 font-display-700"
                              style={{ fontSize: 14, color: "#f0ede6" }}
                            >
                              {p.label}
                            </span>
                            <span
                              className="mt-1 text-[10px] uppercase"
                              style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.3)" }}
                            >
                              {p.hint}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </Field>

                  {phase && (
                    <Field label="Variant">
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        {variantsByPhase[phase].map((v) => {
                          const active = variant === v.value;
                          return (
                            <motion.button
                              key={v.value}
                              type="button"
                              onClick={() => setVariant(v.value)}
                              whileTap={{ scale: 0.98 }}
                              transition={{ type: "spring", stiffness: 400, damping: 22 }}
                              className="relative flex flex-col items-start justify-center transition-colors"
                              style={{
                                padding: "20px 16px",
                                borderRadius: 6,
                                border: `1px solid ${active ? "var(--sage)" : "rgba(255,255,255,0.06)"}`,
                                background: active ? "color-mix(in oklab, var(--sage) 6%, transparent)" : "transparent",
                              }}
                            >
                              <span
                                className="font-display-700"
                                style={{ fontSize: 14, color: "#f0ede6" }}
                              >
                                {v.label}
                              </span>
                              <span
                                className="mt-1 text-[11px]"
                                style={{ color: "rgba(240,237,230,0.45)", lineHeight: 1.4 }}
                              >
                                {v.description}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </Field>
                  )}

                  <Field label="Dominant domein" optional>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {domains.map((d) => (
                        <Chip key={d} active={domain === d} onClick={() => setDomain(domain === d ? "" : d)}>
                          {d}
                        </Chip>
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
                  <Field label="Frequentie">
                    <ChipRow value={frequency} onChange={(v) => { setFrequency(v); if (v !== "Dagelijks") setDailyTimes(""); }} options={["Dagelijks", "3x per week", "2x per week", "1x per week"]} />
                    {frequency === "Dagelijks" && (
                      <div className="pt-3">
                        <select
                          value={dailyTimes}
                          onChange={(e) => setDailyTimes(e.target.value)}
                          className="w-full rounded-md px-3 py-2.5 text-[13px] outline-none transition-colors"
                          style={{
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: "rgba(255,255,255,0.02)",
                            color: "#f0ede6",
                          }}
                        >
                          <option value="">Hoe vaak per dag?</option>
                          <option value="1x per dag">1x per dag</option>
                          <option value="2x per dag">2x per dag</option>
                          <option value="3x per dag">3x per dag</option>
                          <option value="4x per dag">4x per dag</option>
                        </select>
                      </div>
                    )}
                  </Field>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile nav — pinned above bottom tab bar */}
        <div
          className="sticky bottom-0 left-0 right-0 z-20 -mx-6 mt-10 flex items-center justify-between px-6 py-4 sm:-mx-8 sm:px-8 lg:hidden"
          style={{
            background: "rgba(12,12,10,0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderTop: "1px solid var(--border-default)",
          }}
        >
          <button
            onClick={() => go(-1)}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 text-[12px] transition-colors disabled:opacity-25"
            style={{ color: "rgba(240,237,230,0.45)" }}
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={1.5} /> Vorige
          </button>
          <CTAButton onClick={() => go(1)} disabled={!canNext}>
            {step === 2 ? (
              <>
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} /> Genereren
              </>
            ) : (
              <>
                Volgende <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </>
            )}
          </CTAButton>
        </div>
      </section>
    </div>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <label
          className="text-[10px] uppercase"
          style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.22)" }}
        >
          {label}
        </label>
        {optional && (
          <span className="text-[10px] uppercase" style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.22)" }}>
            — optioneel
          </span>
        )}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

const focusOn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderBottom = "1px solid var(--sage)";
};
const focusOff = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderBottom = "0.5px solid rgba(255,255,255,0.12)";
};

function LineInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent py-2 text-[15px] text-foreground outline-none transition-colors"
      style={{ borderBottom: "0.5px solid rgba(255,255,255,0.12)" }}
      onFocus={focusOn}
      onBlur={focusOff}
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
      className="w-full resize-none bg-transparent py-2 text-[15px] text-foreground outline-none transition-colors"
      style={{ borderBottom: "0.5px solid rgba(255,255,255,0.12)" }}
      onFocus={focusOn}
      onBlur={focusOff}
    />
  );
}

function LineToggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-3 text-[13px] transition-colors"
      style={{
        borderRadius: 6,
        border: `1px solid ${active ? "var(--sage)" : "rgba(255,255,255,0.06)"}`,
        color: active ? "#f0ede6" : "rgba(240,237,230,0.55)",
      }}
    >
      {label}
    </button>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3 py-1.5 text-[12px] transition-colors"
      style={{
        border: `1px solid ${active ? "var(--sage)" : "rgba(255,255,255,0.06)"}`,
        color: active ? "#f0ede6" : "rgba(240,237,230,0.5)",
      }}
    >
      {children}
    </button>
  );
}

function ChipRow({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o} active={value === o} onClick={() => onChange(o)}>
          {o}
        </Chip>
      ))}
    </div>
  );
}

function CTAButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-md px-4 py-2.5 transition-all duration-[80ms] disabled:cursor-not-allowed disabled:opacity-25"
      style={{
        background: "var(--sage)",
        color: "#0c0c0a",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: "0.03em",
      }}
      onMouseDown={(e) => { if (!disabled) { e.currentTarget.style.transform = "scale(0.97)"; e.currentTarget.style.filter = "brightness(0.92)"; } }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.filter = "brightness(1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.filter = "brightness(1)"; }}
    >
      {children}
    </button>
  );
}
