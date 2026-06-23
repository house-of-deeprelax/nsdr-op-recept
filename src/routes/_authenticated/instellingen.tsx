import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/layout/PageTransition";

export const Route = createFileRoute("/_authenticated/instellingen")({
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

const KENNISBANK = ["Basisprotocol", "Sessiebibliotheek", "Groepsbehandeling"];

const VERDIEPINGEN = [
  "Pijn",
  "Neurodivergentie",
  "Post-viraal",
  "Slaap",
  "Burn-out",
  "Hormonaal",
  "Postcommotioneel",
  "Rouw",
];

const STORAGE_KEY = "nsdr:settings:profile";

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

const DEFAULT_PROFILE: Profile = {
  name: "",
  profession: "Arts",
  organization: "",
  address: "",
  city: "",
  phone: "",
  email: "",
  bigNumber: "",
};

function InstellingenPage() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
      } catch {}
    }
  }, []);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    toast.success("Profiel opgeslagen");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };

  const update = (key: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setProfile({ ...profile, [key]: e.target.value });

  const inputClass =
    "w-full rounded-md border bg-transparent px-3 py-2 text-[13px] outline-none";
  const inputStyle = {
    borderColor: "var(--border-default)",
    color: "#f0ede6",
  } as const;

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
            <Field label="Volledige naam">
              <input type="text" value={profile.name} onChange={update("name")} className={inputClass} style={inputStyle} />
            </Field>

            <Field label="Titel">
              <select
                value={profile.profession}
                onChange={update("profession")}
                className={inputClass}
                style={{ ...inputStyle, background: "var(--surface-1)" }}
              >
                {PROFESSIONS.map((p) => (
                  <option key={p} value={p} style={{ background: "#0c0c0a" }}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Praktijk / organisatie">
              <input type="text" value={profile.organization} onChange={update("organization")} className={inputClass} style={inputStyle} />
            </Field>

            <Field label="Adres">
              <input type="text" value={profile.address} onChange={update("address")} className={inputClass} style={inputStyle} />
            </Field>

            <Field label="Plaats">
              <input type="text" value={profile.city} onChange={update("city")} className={inputClass} style={inputStyle} />
            </Field>

            <Field label="Telefoonnummer">
              <input type="tel" value={profile.phone} onChange={update("phone")} className={inputClass} style={inputStyle} />
            </Field>

            <Field label="Email">
              <input type="email" value={profile.email} onChange={update("email")} className={inputClass} style={inputStyle} />
            </Field>

            <Field label="BIG-nummer (optioneel)">
              <input type="text" value={profile.bigNumber} onChange={update("bigNumber")} className={inputClass} style={inputStyle} />
            </Field>

            <div className="flex items-center gap-3">
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
                Profiel opslaan
              </button>
              {saved && (
                <span
                  className="inline-flex items-center gap-1 text-[12px]"
                  style={{ color: "var(--sage)" }}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Opgeslagen
                </span>
              )}
            </div>

          </div>
        </Section>

        {/* KENNISBANK */}
        <Section number="02a" title="Kennisbank">
          <div
            className="text-[11px] uppercase"
            style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.45)" }}
          >
            Actieve protocollen in de kennisbank
          </div>
          <ProtocolList items={KENNISBANK} />
        </Section>

        {/* VERDIEPINGEN */}
        <Section number="02b" title="Verdiepingen">
          <div
            className="text-[11px] uppercase"
            style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.45)" }}
          >
            Actieve verdiepingen
          </div>
          <ProtocolList items={VERDIEPINGEN} />
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

function ProtocolList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.map((p) => (
        <li
          key={p}
          className="flex items-center gap-2 rounded-md border px-3 py-2"
          style={{
            borderColor: "var(--border-default)",
            background: "var(--surface-1)",
          }}
        >
          <Check className="h-4 w-4" strokeWidth={2.5} style={{ color: "var(--sage)" }} />
          <span className="text-[13px]" style={{ color: "#f0ede6" }}>
            {p}
          </span>
        </li>
      ))}
    </ul>
  );
}
