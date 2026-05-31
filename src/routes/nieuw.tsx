import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/brand/GlassCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Phase } from "@/components/brand/PhaseBadge";

export const Route = createFileRoute("/nieuw")({
  head: () => ({ meta: [{ title: "Nieuw recept — NSDR op Recept" }] }),
  component: NieuwPage,
});

const phases: { id: Phase; label: string; color: string; hint: string }[] = [
  { id: "rood", label: "Rood", color: "var(--phase-rood)", hint: "Acuut ontregeld" },
  { id: "rood-geel", label: "Rood-Geel", color: "var(--phase-rood-geel)", hint: "Beginnend herstel" },
  { id: "geel-groen", label: "Geel-Groen", color: "var(--phase-geel-groen)", hint: "Herwinnen van veerkracht" },
  { id: "groen", label: "Groen", color: "var(--phase-groen)", hint: "Onderhoud en groei" },
];

const domains = [
  "Burn-out", "Postviraal", "Long COVID", "Trauma", "Rouw",
  "Neurodivergentie", "Hormonaal", "Postcommotioneel",
  "Chronische pijn", "Slaapproblemen",
];

const steps = ["De casus", "Systeemscan", "Setting"];

function NieuwPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 1
  const [context, setContext] = useState("");
  const [complaint, setComplaint] = useState("");
  const [duration, setDuration] = useState("");
  const [treatment, setTreatment] = useState("");
  const [somatic, setSomatic] = useState<null | boolean>(null);

  // Step 2
  const [phase, setPhase] = useState<Phase | null>(null);
  const [domain, setDomain] = useState<string>("");

  // Step 3
  const [setting, setSetting] = useState<"individueel" | "groep">("individueel");
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState("");
  const [rhythm, setRhythm] = useState("");

  const canNext =
    (step === 0 && context && complaint && duration && somatic !== null) ||
    (step === 1 && phase && domain) ||
    (step === 2 && time && frequency && rhythm);

  const next = () => {
    if (step < 2) setStep(step + 1);
    else navigate({ to: "/genereren" });
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl">
        {/* Header / stepper */}
        <motion.div
          variants={stagger(0.06)}
          initial="hidden"
          animate="visible"
          className="mb-10"
        >
          <motion.span variants={fadeUp} className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Stap {step + 1} van 3
          </motion.span>
          <motion.h2 variants={fadeUp} className="mt-2 text-3xl">
            {steps[step]}
          </motion.h2>

          <motion.div variants={fadeUp} className="mt-6 flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium transition-colors",
                    i < step && "bg-primary text-primary-foreground",
                    i === step && "bg-primary/20 text-primary border border-primary/40",
                    i > step && "bg-background/30 text-muted-foreground border border-border",
                  )}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className="h-px flex-1 bg-border" />
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>

        <GlassCard className="p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stagger(0.08)}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            >
              {step === 0 && (
                <div className="space-y-6">
                  <Field label="Leeftijd en context">
                    <Textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="bv. vrouw, 44, HR-manager, twee kinderen"
                      className="min-h-[80px] resize-none border-border bg-background/20"
                    />
                  </Field>
                  <Field label="Hoofdklacht">
                    <Textarea
                      value={complaint}
                      onChange={(e) => setComplaint(e.target.value)}
                      placeholder="waar komt deze persoon mee, in jouw woorden"
                      className="min-h-[100px] resize-none border-border bg-background/20"
                    />
                  </Field>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label="Duur klachten">
                      <Input
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="bv. 8 maanden"
                        className="border-border bg-background/20"
                      />
                    </Field>
                    <Field label="Lopende behandeling" optional>
                      <Input
                        value={treatment}
                        onChange={(e) => setTreatment(e.target.value)}
                        placeholder="bv. POH-GGZ, fysio"
                        className="border-border bg-background/20"
                      />
                    </Field>
                  </div>
                  <Field label="Somatische oorzaak uitgesloten?">
                    <div className="grid grid-cols-2 gap-3">
                      <ToggleButton
                        active={somatic === true}
                        onClick={() => setSomatic(true)}
                        label="Ja, uitgesloten"
                      />
                      <ToggleButton
                        active={somatic === false}
                        onClick={() => setSomatic(false)}
                        label="Nee of onbekend"
                      />
                    </div>
                  </Field>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8">
                  <Field label="In welke fase bevindt deze persoon zich?">
                    <motion.div
                      variants={stagger(0.06)}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-2 gap-3"
                    >
                      {phases.map((p) => {
                        const active = phase === p.id;
                        return (
                          <motion.button
                            key={p.id}
                            variants={fadeUp}
                            type="button"
                            onClick={() => setPhase(p.id)}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            className={cn(
                              "glass relative overflow-hidden rounded-xl p-4 text-left transition-all",
                              active && "ring-1",
                            )}
                            style={
                              active
                                ? {
                                    background: `color-mix(in oklab, ${p.color} 12%, transparent)`,
                                    borderColor: `color-mix(in oklab, ${p.color} 45%, transparent)`,
                                    boxShadow: `0 0 0 1px color-mix(in oklab, ${p.color} 40%, transparent), 0 8px 24px -12px ${p.color}`,
                                  }
                                : undefined
                            }
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ background: p.color, boxShadow: `0 0 10px ${p.color}` }}
                              />
                              <span className="font-display text-base" style={{ color: active ? p.color : undefined }}>
                                {p.label}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">{p.hint}</p>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  </Field>

                  <Field label="Dominant domein">
                    <Select value={domain} onValueChange={setDomain}>
                      <SelectTrigger className="border-border bg-background/20">
                        <SelectValue placeholder="Kies een domein" />
                      </SelectTrigger>
                      <SelectContent>
                        {domains.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <Field label="Setting">
                    <div className="grid grid-cols-2 gap-3">
                      <ToggleButton
                        active={setting === "individueel"}
                        onClick={() => setSetting("individueel")}
                        label="Individueel"
                      />
                      <ToggleButton
                        active={setting === "groep"}
                        onClick={() => setSetting("groep")}
                        label="Groep"
                      />
                    </div>
                  </Field>
                  <div className="grid gap-6 sm:grid-cols-3">
                    <Field label="Beschikbare tijd">
                      <Select value={time} onValueChange={setTime}>
                        <SelectTrigger className="border-border bg-background/20">
                          <SelectValue placeholder="Kies" />
                        </SelectTrigger>
                        <SelectContent>
                          {["10 min", "20 min", "30 min", "45 min"].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Frequentie">
                      <Select value={frequency} onValueChange={setFrequency}>
                        <SelectTrigger className="border-border bg-background/20">
                          <SelectValue placeholder="Kies" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Dagelijks", "3x per week", "2x per week", "1x per week"].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Dagritme">
                      <Select value={rhythm} onValueChange={setRhythm}>
                        <SelectTrigger className="border-border bg-background/20">
                          <SelectValue placeholder="Kies" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Ochtendmens", "Avondmens", "Wisselend"].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </GlassCard>

        {/* Nav */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-6 flex items-center justify-between"
        >
          <Button
            variant="ghost"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Vorige
          </Button>
          <Button
            onClick={next}
            disabled={!canNext}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {step === 2 ? (
              <>
                <Sparkles className="h-4 w-4" /> Recept genereren
              </>
            ) : (
              <>
                Volgende <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </PageTransition>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={fadeUp} className="space-y-2">
      <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {label}
        {optional && <span className="ml-2 normal-case tracking-normal text-[10px] opacity-60">optioneel</span>}
      </Label>
      {children}
    </motion.div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        "glass rounded-lg px-4 py-3 text-sm transition-all",
        active
          ? "border-primary/50 bg-primary/10 text-primary"
          : "text-foreground/80 hover:text-foreground",
      )}
    >
      {label}
    </motion.button>
  );
}
