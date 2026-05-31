import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
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
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    generationSteps.forEach((_, i) => {
      timers.push(setTimeout(() => setActive(i + 1), (i + 1) * 900));
    });
    timers.push(
      setTimeout(() => setClosing(true), generationSteps.length * 900 + 200),
    );
    timers.push(
      setTimeout(() => {
        navigate({ to: "/recept/$id", params: { id: "demo" } });
      }, generationSteps.length * 900 + 700),
    );
    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  return (
    <PageTransition>
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center text-center">
        <AnimatePresence>
          {!closing && (
            <motion.div
              key="circle"
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="mb-8"
            >
              <motion.div
                animate={{ scale: [0.92, 1.08, 0.92] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="h-16 w-16 rounded-full border"
                style={{ borderColor: "rgba(122,138,88,0.4)", borderWidth: "1px" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-display text-[32px] leading-[1.05]"
        >
          We schrijven je recept.
        </motion.h2>

        <ul className="mt-6 space-y-3 text-left">
          {generationSteps.map((label, i) => {
            const done = i < active;
            const current = i === active;
            return (
              <motion.li
                key={label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="flex h-4 w-4 items-center justify-center">
                  {current ? (
                    <motion.span
                      animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="block h-1 w-1 rounded-full bg-[var(--sage)]"
                    />
                  ) : (
                    <span
                      className="block h-1 w-1 rounded-full"
                      style={{
                        background: done ? "rgba(122,138,88,0.4)" : "rgba(241,241,238,0.15)",
                      }}
                    />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm transition-colors duration-300",
                    done && "text-[rgba(241,241,238,0.3)]",
                    current && "text-foreground",
                    !done && !current && "text-[rgba(241,241,238,0.55)]",
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
