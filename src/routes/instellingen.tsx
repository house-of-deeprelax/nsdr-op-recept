import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/layout/PageTransition";

export const Route = createFileRoute("/instellingen")({
  head: () => ({ meta: [{ title: "Instellingen — NSDR op Recept" }] }),
  component: InstellingenPage,
});

const PROFESSIONS = [
  "Arts",
  "Psycholoog",
  "Psychotherapeut",
  "Fysiotherapeut",
  "Ergotherapeut",
  "Coach",
  "Yogadocent",
  "Anders",
];

const PROTOCOLS = [
  "Basisprotocol",
  "Sessiebibliotheek",
  "Pijn",
  "Neurodivergentie",
  "Post-viraal",
  "Slaap",
  "Burn-out",
  "Hormonaal",
  "Groepsbehandeling",
  "Postcommotioneel",
  "Rouw",
];

const STORAGE_KEY = "nsdr:settings:profile";

type Profile = { name: string; profession: string; organization: string };

function InstellingenPage() {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    profession: "Arts",
    organization: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setProfile(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    toast.success("Opgeslagen");
  };

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-8 lg:px-12">
        <h1
          className="font-display text-[28px] sm:text-[36px]"
          style={{ letterSpacing: "-0.02em", color: "#f0ede6" }}
        >
          Instellingen
        </h1>

        {/* PROFIEL */}
        <Section number="01" title="Profiel">
          <div className="flex flex-col gap-4">
            <Field label="Naam">
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-[13px] outline-none"
                style={{
                  borderColor: "var(--border-default)",
                  color: "#f0ede6",
                }}
              />
            </Field>

            <Field label="Beroep">
              <select
                value={profile.profession}
                onChange={(e) =>
                  setProfile({ ...profile, profession: e.target.value })
                }
                className="w-full rounded-md border bg-transparent px-3 py-2 text-[13px] outline-none"
                style={{
                  borderColor: "var(--border-default)",
                  color: "#f0ede6",
                  background: "var(--surface-1)",
                }}
              >
                {PROFESSIONS.map((p) => (
                  <option key={p} value={p} style={{ background: "#0c0c0a" }}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Organisatie">
              <input
                type="text"
                value={profile.organization}
                onChange={(e) =>
                  setProfile({ ...profile, organization: e.target.value })
                }
                className="w-full rounded-md border bg-transparent px-3 py-2 text-[13px] outline-none"
                style={{
                  borderColor: "var(--border-default)",
                  color: "#f0ede6",
                }}
              />
            </Field>

            <div>
              <button
                type="button"
                onClick={save}
                className="inline-flex items-center gap-2 rounded-md px-5 py-2.5"
                style={{
                  background: "var(--sage)",
                  color: "#0c0c0a",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.02em",
                }}
              >
                Opslaan
              </button>
            </div>
          </div>
        </Section>

        {/* KENNISBASIS */}
        <Section number="02" title="Kennisbasis">
          <div
            className="text-[11px] uppercase"
            style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.45)" }}
          >
            Actieve protocollen in de kennisbank
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PROTOCOLS.map((p) => (
              <li
                key={p}
                className="flex items-center gap-2 rounded-md border px-3 py-2"
                style={{
                  borderColor: "var(--border-default)",
                  background: "var(--surface-1)",
                }}
              >
                <Check
                  className="h-4 w-4"
                  strokeWidth={2.5}
                  style={{ color: "var(--sage)" }}
                />
                <span className="text-[13px]" style={{ color: "#f0ede6" }}>
                  {p}
                </span>
              </li>
            ))}
          </ul>
          <p
            className="mt-4 text-[12px]"
            style={{ color: "rgba(240,237,230,0.45)" }}
          >
            Protocollen worden beheerd door Deeprelax Institute.
          </p>
        </Section>

        {/* OVER */}
        <Section number="03" title="Over">
          <dl className="flex flex-col gap-3 text-[13px]">
            <Row label="Versie" value="MVP 1.0" />
            <Row label="Gebouwd door" value="Deeprelax Institute" />
          </dl>
          <p
            className="mt-6 border-t pt-6 text-[12px] italic"
            style={{
              borderColor: "var(--border-default)",
              color: "rgba(240,237,230,0.55)",
            }}
          >
            NSDR komt naast bestaande zorg, niet in plaats daarvan.
          </p>
        </Section>
      </div>
    </PageTransition>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="mt-10 border-t pt-8"
      style={{ borderColor: "var(--border-default)" }}
    >
      <div className="flex items-baseline gap-3">
        <span
          className="text-[10px] uppercase"
          style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.35)" }}
        >
          {number}
        </span>
        <h2
          className="font-display text-[20px]"
          style={{ letterSpacing: "-0.01em", color: "#f0ede6" }}
        >
          {title}
        </h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-[10px] uppercase"
        style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.5)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt
        className="text-[11px] uppercase"
        style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.45)" }}
      >
        {label}
      </dt>
      <dd style={{ color: "#f0ede6" }}>{value}</dd>
    </div>
  );
}
