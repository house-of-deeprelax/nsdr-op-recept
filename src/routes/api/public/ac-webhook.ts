import { createFileRoute } from "@tanstack/react-router";

// ActiveCampaign webhook → grant/revoke access in allowed_users.
//
// Configure in ActiveCampaign:
//   URL: https://<project-domain>/api/public/ac-webhook?secret=<AC_WEBHOOK_SECRET>
//   Triggers: "Contact tag is added" + "Contact tag is removed"
//
// AC sends form-encoded payloads with fields:
//   type=contact_tag_added | contact_tag_removed
//   contact[email]=...
//   tag[tag]=NSDR op Recept   (or tag=...)

const ACCESS_TAG = "NSDR op Recept";
const ACCESS_YEARS = 1;

function valuesFor(form: FormData, prefix: string): string[] {
  const out: string[] = [];
  for (const [k, v] of form.entries()) {
    if (typeof v !== "string") continue;
    if (k === prefix || k.startsWith(`${prefix}[`)) out.push(v);
  }
  return out;
}

export const Route = createFileRoute("/api/public/ac-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.AC_WEBHOOK_SECRET;
        if (!secret) return new Response("Server misconfigured", { status: 500 });

        const url = new URL(request.url);
        const provided =
          url.searchParams.get("secret") ??
          request.headers.get("x-webhook-secret") ??
          "";
        if (provided !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }

        // AC posts application/x-www-form-urlencoded
        const ct = request.headers.get("content-type") ?? "";
        let form: FormData;
        try {
          if (ct.includes("application/json")) {
            const json = (await request.json()) as Record<string, unknown>;
            form = new FormData();
            const flatten = (obj: unknown, prefix = "") => {
              if (obj === null || obj === undefined) return;
              if (typeof obj !== "object") {
                form.append(prefix, String(obj));
                return;
              }
              for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
                const key = prefix ? `${prefix}[${k}]` : k;
                if (v !== null && typeof v === "object") flatten(v, key);
                else if (v !== undefined) form.append(key, String(v));
              }
            };
            flatten(json);
          } else {
            form = await request.formData();
          }
        } catch {
          return new Response("Invalid body", { status: 400 });
        }

        const type = (form.get("type") ?? "").toString();
        const email = (form.get("contact[email]") ?? form.get("email") ?? "")
          .toString()
          .trim()
          .toLowerCase();
        const tags = [
          ...valuesFor(form, "tag"),
          ...valuesFor(form, "tags"),
        ].map((t) => t.trim());

        if (!email) return new Response("Missing email", { status: 400 });
        if (!tags.some((t) => t.toLowerCase() === ACCESS_TAG.toLowerCase())) {
          // Tag-event for a different tag — ignore quietly.
          return Response.json({ ok: true, ignored: "tag_mismatch" });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (type === "contact_tag_added") {
          const expires = new Date(
            Date.now() + ACCESS_YEARS * 365 * 24 * 60 * 60 * 1000,
          ).toISOString();

          const { data: existing } = await supabaseAdmin
            .from("allowed_users")
            .select("id")
            .eq("email", email)
            .maybeSingle();

          if (existing) {
            const { error } = await supabaseAdmin
              .from("allowed_users")
              .update({ expires_at: expires, note: `ActiveCampaign: ${ACCESS_TAG}` })
              .eq("id", existing.id);
            if (error) {
              console.error("ac-webhook update error", error);
              return new Response("DB error", { status: 500 });
            }
          } else {
            const { error } = await supabaseAdmin.from("allowed_users").insert({
              email,
              expires_at: expires,
              note: `ActiveCampaign: ${ACCESS_TAG}`,
            });
            if (error) {
              console.error("ac-webhook insert error", error);
              return new Response("DB error", { status: 500 });
            }
          }
          return Response.json({ ok: true, action: "granted", email });
        }

        if (type === "contact_tag_removed") {
          const { error } = await supabaseAdmin
            .from("allowed_users")
            .delete()
            .eq("email", email);
          if (error) {
            console.error("ac-webhook delete error", error);
            return new Response("DB error", { status: 500 });
          }
          return Response.json({ ok: true, action: "revoked", email });
        }

        return Response.json({ ok: true, ignored: `type=${type}` });
      },
    },
  },
});
