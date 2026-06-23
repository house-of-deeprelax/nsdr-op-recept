// Client-side recipe types + edge function call (recipe generation lives in the
// legacy edge function project; the rest of the app now uses Lovable Cloud).
import { supabase } from "@/integrations/supabase/client";

const GENERATION_URL = "https://biidmtkicgmlerdvxniy.supabase.co";
const GENERATION_ANON =
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

export type StoredRecipe = {
  recipe: Recipe;
  intake: Intake;
  createdAt: string;
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

  // De recept-edge-function draait in een apart Supabase-project. Een Bearer
  // token van dit project zou daar niet valideren; gebruik de (publieke) anon
  // key van dat project als Authorization + apikey.
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error("Niet ingelogd — log opnieuw in om een recept te genereren.");
  }

  const res = await fetch(`${GENERATION_URL}/functions/v1/generate-recipe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GENERATION_ANON}`,
      apikey: GENERATION_ANON,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Edge function gaf ${res.status} terug${text ? `: ${text.slice(0, 200)}` : ""}`,
    );
  }

  const data = (await res.json()) as { id: string; recipe: Recipe };
  return data;
}

// ── Persistence in Lovable Cloud ──────────────────────────────────────────────

export async function saveRecipe(args: {
  id: string;
  recipe: Recipe;
  intake: Intake;
}): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("Niet ingelogd");

  const phaseMap: Record<Phase, string> = {
    rood: "rood",
    "rood-geel": "geel-rood",
    "geel-groen": "geel-groen",
    groen: "groen",
  };

  const { error } = await supabase.from("prescriptions").upsert(
    {
      user_id: user.id,
      rx_number: args.id,
      patient_context: args.intake.context || null,
      fase: phaseMap[args.intake.phase],
      variant: args.intake.variant || null,
      dominant_domein: args.intake.domain || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recipe: args.recipe as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      intake: args.intake as any,
    } as never,
    { onConflict: "user_id,rx_number" },
  );

  if (error) throw error;
}

export type PrescriptionRow = {
  id: string;
  rx_number: string;
  created_at: string;
  patient_context: string | null;
  fase: string | null;
  variant: string | null;
  dominant_domein: string | null;
};

export async function listPrescriptions(limit = 100): Promise<PrescriptionRow[]> {
  const { data, error } = await supabase
    .from("prescriptions")
    .select("id,rx_number,created_at,patient_context,fase,variant,dominant_domein")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as PrescriptionRow[];
}

export async function getPrescriptionByRx(
  rxNumber: string,
): Promise<StoredRecipe | null> {
  const { data, error } = await supabase
    .from("prescriptions")
    .select("recipe,intake,created_at")
    .ilike("rx_number", rxNumber)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    recipe: data.recipe as unknown as Recipe,
    intake: data.intake as unknown as Intake,
    createdAt: data.created_at,
  };
}
