import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/genereren")({
  head: () => ({ meta: [{ title: "We schrijven je recept — NSDR op Recept" }] }),
  component: GenererenPage,
});

const generationSteps = [
  "Fase en domein koppelen",
  "Aanpassingstabel raadplegen",
  "Sessies selecteren",
  "Dosering en looptijd bepalen",
  "Recept opmaken",
];

function GenererenPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    generationSteps.forEach((_, i) => {
      timers.push(setTimeout(() => setActive(i + 1), (i + 1) * 900));
    });
    timers.push(
      setTimeout(() => {
        navigate({ to: "/recept/$id", params: { id: "demo" } });
      }, generationSteps.length * 900 + 600),
    );
    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  return (
    <PageTransition>
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center">
        {/* Breathing pulse ring */}
        <div className="relative mb-12 flex h-40 w-40 items-center justify-center">
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(var(--sage-rgb), 0.35) 0%, transparent 70%)",
            }}
          />
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-24 w-24 rounded-full border border-primary/40"
            style={{ boxShadow: "0 0 40px rgba(var(--sage-rgb), 0.3)" }}
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute h-12 w-12 rounded-full bg-primary/30 blur-md"
          />
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl"
        >
          We schrijven je recept…
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-sm text-muted-foreground"
        >
          Een moment terwijl we de RESET-PRO logica toepassen.
        </motion.p>

        {/* Steps */}
        <ul className="mt-12 w-full max-w-sm space-y-3 text-left">
          {generationSteps.map((label, i) => {
            const done = i < active;
            const current = i === active;
            return (
              <motion.li
                key={label}
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: done || current ? 1 : 0.35,
                  x: 0,
                }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] transition-all",
                    done && "border-primary bg-primary text-primary-foreground",
                    current && "border-primary/60 bg-primary/15",
                    !done && !current && "border-border bg-background/30",
                  )}
                >
                  {done ? (
                    <Check className="h-3 w-3" />
                  ) : current ? (
                    <motion.span
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                    />
                  ) : (
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm transition-colors",
                    done && "text-foreground/70",
                    current && "text-foreground",
                    !done && !current && "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </PageTransition>
  );
}
