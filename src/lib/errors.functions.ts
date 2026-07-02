import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const THROTTLE_MS = 60 * 60 * 1000; // 1 hour per fingerprint

function makeFingerprint(message: string, route?: string) {
  const base = `${route ?? ""}::${(message ?? "").slice(0, 200)}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }
  return `fp_${Math.abs(hash).toString(36)}`;
}

// ============================================================================
// Public: log a client-side error (auth optional — best-effort)
// ============================================================================

export const logClientError = createServerFn({ method: "POST" })
  .inputValidator((input: {
    message: string;
    stack?: string;
    route?: string;
    userAgent?: string;
    context?: Record<string, unknown>;
  }) =>
    z
      .object({
        message: z.string().min(1).max(2000),
        stack: z.string().max(20000).optional(),
        route: z.string().max(500).optional(),
        userAgent: z.string().max(500).optional(),
        context: z.record(z.string(), z.unknown()).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Try to extract user from bearer if present (optional)
    let userId: string | null = null;
    let userEmail: string | null = null;
    try {
      const { getRequestHeader } = await import("@tanstack/react-start/server");
      const auth = getRequestHeader("authorization");
      const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
      if (token) {
        const { data: userData } = await supabaseAdmin.auth.getUser(token);
        userId = userData.user?.id ?? null;
        userEmail = userData.user?.email ?? null;
      }
    } catch {
      // ignore
    }

    const fingerprint = makeFingerprint(data.message, data.route);

    const { data: inserted, error } = await supabaseAdmin
      .from("error_logs")
      .insert({
        source: "client",
        message: data.message.slice(0, 2000),
        stack: data.stack?.slice(0, 20000) ?? null,
        route: data.route ?? null,
        user_agent: data.userAgent ?? null,
        user_id: userId,
        user_email: userEmail,
        fingerprint,
        context: (data.context ?? null) as never,
      })
      .select("id")
      .single();

    if (error) {
      console.error("error_logs insert failed", error);
      return { ok: false as const };
    }

    // Fire-and-forget throttled email
    await maybeNotifyAdmins({
      fingerprint,
      message: data.message,
      source: "client",
      route: data.route ?? "—",
      userEmail: userEmail ?? "—",
      stack: data.stack ?? "",
    });

    return { ok: true as const, id: inserted?.id };
  });

// ============================================================================
// Internal helper — throttled email notification to admins
// ============================================================================

async function maybeNotifyAdmins(args: {
  fingerprint: string;
  message: string;
  source: string;
  route: string;
  userEmail: string;
  stack: string;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const since = new Date(Date.now() - THROTTLE_MS).toISOString();

  // Count of same-fingerprint errors in last hour
  const { count } = await supabaseAdmin
    .from("error_logs")
    .select("id", { count: "exact", head: true })
    .eq("fingerprint", args.fingerprint)
    .gte("created_at", since);

  // Latest last_notified_at for this fingerprint
  const { data: latest } = await supabaseAdmin
    .from("error_logs")
    .select("last_notified_at")
    .eq("fingerprint", args.fingerprint)
    .not("last_notified_at", "is", null)
    .order("last_notified_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastNotifiedMs = latest?.last_notified_at
    ? new Date(latest.last_notified_at).getTime()
    : 0;

  if (Date.now() - lastNotifiedMs < THROTTLE_MS) return;

  // Get admin emails from user_roles + auth.users
  const { data: admins } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");

  const adminIds = (admins ?? []).map((r: { user_id: string }) => r.user_id);
  if (adminIds.length === 0) return;

  const adminEmails: string[] = [];
  for (const uid of adminIds) {
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(uid);
    if (u.user?.email) adminEmails.push(u.user.email);
  }
  if (adminEmails.length === 0) return;

  const siteUrl =
    process.env.SITE_URL || "https://nsdr-op-recept.nl";
  const adminUrl = `${siteUrl}/admin`;

  // Send to each admin via internal send route (service-role auth)
  const sendUrl = `${siteUrl}/lovable/email/transactional/send`;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  for (const to of adminEmails) {
    try {
      await fetch(sendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
          "Lovable-Context": "internal",
        },
        body: JSON.stringify({
          templateName: "error-alert",
          recipientEmail: to,
          idempotencyKey: `err-${args.fingerprint}-${Math.floor(Date.now() / THROTTLE_MS)}`,
          templateData: {
            siteName: "NSDR op Recept",
            message: args.message,
            source: args.source,
            route: args.route,
            userEmail: args.userEmail,
            occurredAt: new Date().toISOString(),
            count: count ?? 1,
            adminUrl,
            stack: args.stack,
          },
        }),
      });
    } catch (e) {
      console.error("error-alert send failed", e);
    }
  }

  // Mark most recent row as notified
  await supabaseAdmin
    .from("error_logs")
    .update({ last_notified_at: new Date().toISOString() })
    .eq("fingerprint", args.fingerprint)
    .order("created_at", { ascending: false })
    .limit(1);
}

// ============================================================================
// Admin: list & manage error logs
// ============================================================================

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin only");
}

export const adminListErrors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("error_logs")
      .select("id, created_at, source, message, route, user_email, fingerprint, resolved, stack")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  });

export const adminToggleErrorResolved = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; resolved: boolean }) =>
    z.object({ id: z.string().uuid(), resolved: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("error_logs")
      .update({ resolved: data.resolved })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteError = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("error_logs").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
