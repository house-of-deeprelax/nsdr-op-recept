// Client-side recipe types + edge function call.
// Calls the Supabase Edge Function `generate-recipe` directly.

export const SUPABASE_URL = "https://biidmtkicgmlerdvxniy.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaWRtdGtpY2dtbGVyZHZ4bml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTUwMzYsImV4cCI6MjA4NzY5MTAzNn0.wcFBDAV4aWV9wKxClt9o5kBE6g_R1fo67qyFXX4IXrM";

export type Phase = "rood" | "rood-geel" | "geel-groen" | "groen";

export type Intake = {
  context: string;
  complaint: string;
  duration: string;
  treatment: string;
  somaticCleared: boolean;
  phase: Phase;
  variant: string;
  domain: string;
  setting: "individueel" | "groep";
  time: string;
  frequency: string;
  rhythm: string;
  special_conditions: string[];
};

export type Recipe = {
  voor_wie_en_waar_nu: string;
  het_voorschrift: {
    eerste_keus: { sessie: string; rationale: string };
    lichter: { sessie: string; rationale: string };
    zwaarder: { sessie: string; rationale: string };
  };
  de_dosering: string;
  looptijd_en_herijking: string;
  waar_je_op_let: string;
};

export async function generateRecipe(
  intake: Intake,
): Promise<{ id: string; recipe: Recipe }> {
  const phaseMap: Record<Phase, string> = {
    rood: "rood",
    "rood-geel": "geel-rood",
    "geel-groen": "geel-groen",
    groen: "groen",
  };

  const payload = {
    leeftijd_context: intake.context,
    hoofdklacht: intake.complaint,
    duur_klachten: intake.duration,
    lopende_behandeling: intake.treatment || "",
    somatisch_uitgesloten: intake.somaticCleared,
    fase: phaseMap[intake.phase].toLowerCase(),
    variant: intake.variant.toLowerCase(),
    dominant_domein: intake.domain,
    setting: intake.setting,
    beschikbare_tijd: intake.time,
    frequentie: intake.frequency,
    dagritme: intake.rhythm,
    special_conditions: intake.special_conditions,
  };

  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-recipe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Edge function gaf ${res.status} terug${text ? `: ${text.slice(0, 200)}` : ""}`,
    );
  }

  const json = (await res.json()) as
    | { id?: string; recipe?: Recipe }
    | Recipe;

  // Accept either { id, recipe } or a bare Recipe object
  const recipe: Recipe =
    "recipe" in (json as object) && (json as { recipe?: Recipe }).recipe
      ? (json as { recipe: Recipe }).recipe
      : (json as Recipe);

  const id =
    (json as { id?: string }).id ??
    `RX-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;

  return { id, recipe };
}
