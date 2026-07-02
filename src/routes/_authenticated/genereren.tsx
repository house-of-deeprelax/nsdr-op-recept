import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { generateRecipe, saveRecipe, type Intake } from "@/lib/recipe";

export const Route = createFileRoute("/_authenticated/genereren")({
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
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const raw =
      typeof window !== "undefined" ? sessionStorage.getItem("nsdr:intake") : null;
    if (!raw) {
      navigate({ to: "/nieuw" });
      return;
    }
    const intake = JSON.parse(raw) as Intake;

    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    generationSteps.forEach((_, i) => {
      stepTimers.push(setTimeout(() => setActive(i + 1), (i + 1) * 900));
    });

    (async () => {
      try {
        const { id, recipe } = await generateRecipe(intake);
        const idLower = String(id).toLowerCase();
        await saveRecipe({ id, recipe, intake });
        sessionStorage.setItem(
          `nsdr:recipe:${idLower}`,
          JSON.stringify({ recipe, intake, createdAt: new Date().toISOString() }),
        );
        sessionStorage.removeItem("nsdr:intake");
        const minWait = generationSteps.length * 900 + 700;
        setTimeout(
          () => navigate({ to: "/recept/$id", params: { id: idLower } }),
          minWait,
        );
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Er ging iets mis bij het genereren.");
      }
    })();

    return () => stepTimers.forEach(clearTimeout);
  }, [navigate]);

  return (
    <div
      className="flex w-full flex-col items-center justify-center px-6"
      style={{ minHeight: "calc(100vh - 44px)", background: "var(--background)" }}
    >
      <motion.div
        animate={{ scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "1px solid rgba(140,158,110,0.35)",
        }}
      />

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-display text-center"
        style={{ marginTop: 28, fontSize: 32, color: "#f0ede6", lineHeight: 1.05 }}
      >
        We schrijven je recept.
      </motion.h2>

      <ul
        className="text-left"
        style={{ marginTop: 32, gap: 12, display: "flex", flexDirection: "column" }}
      >
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
                    className="block h-1 w-1 rounded-full"
                    style={{ background: "var(--sage)" }}
                  />
                ) : (
                  <span
                    className="block h-1 w-1 rounded-full"
                    style={{
                      background: done ? "rgba(140,158,110,0.4)" : "rgba(240,237,230,0.12)",
                    }}
                  />
                )}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: done
                    ? "rgba(240,237,230,0.28)"
                    : current
                      ? "#f0ede6"
                      : "rgba(240,237,230,0.5)",
                  transition: "color 300ms ease",
                }}
              >
                {label}
              </span>
            </motion.li>
          );
        })}
      </ul>

      {error && (
        <div
          className="mt-10 max-w-[420px] rounded-md p-4 text-center text-[13px]"
          style={{
            background: "rgba(158,126,94,0.08)",
            border: "1px solid rgba(158,126,94,0.3)",
            color: "var(--tierra)",
          }}
        >
          {error}
          <button
            onClick={() => navigate({ to: "/nieuw" })}
            className="mt-3 block w-full text-[12px] underline"
            style={{ color: "rgba(240,237,230,0.7)" }}
          >
            Terug naar intake
          </button>
        </div>
      )}
    </div>
  );
}
