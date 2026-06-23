import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

// ============================================================================
// Public: request OTP login code (whitelist check happens server-side)
// ============================================================================

export const requestLoginCode = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string }) =>
    z.object({ email: z.string().email() }).parse(input),
  )
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Check whitelist directly (admin client bypasses RLS)
    const { data: row, error: accessErr } = await supabaseAdmin
      .from("allowed_users")
      .select("expires_at")
      .eq("email", email)
      .maybeSingle();

    if (accessErr) {
      console.error("allowed_users lookup error", accessErr);
      return { ok: false as const, reason: "error" as const };
    }

    if (!row) {
      return { ok: false as const, reason: "not_allowed" as const };
    }
    if (new Date(row.expires_at).getTime() <= Date.now()) {
      return { ok: false as const, reason: "expired" as const };
    }

    // Send OTP using the publishable key client (server-side, no session)
    const supabasePublic = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { error: otpErr } = await supabasePublic.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (otpErr) {
      console.error("signInWithOtp error", otpErr);
      return { ok: false as const, reason: "error" as const };
    }

    return { ok: true as const };
  });

// ============================================================================
// Authenticated: am I still allowed in?
// ============================================================================

export const checkMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = (context.claims as { email?: string }).email;
    if (!email) return { allowed: false as const, isAdmin: false as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: allowedRow } = await supabaseAdmin
      .from("allowed_users")
      .select("expires_at")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();
    const allowed =
      !!allowedRow && new Date(allowedRow.expires_at).getTime() > Date.now();
    const { data: adminRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    return {
      allowed: Boolean(allowed),
      isAdmin: Boolean(adminRole),
    };
  });

// ============================================================================
// Admin: manage allowed_users
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

export const adminListAllowedUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("allowed_users")
      .select("id, email, expires_at, note, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const adminAddAllowedUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; note?: string; expiresAt?: string }) =>
    z
      .object({
        email: z.string().email(),
        note: z.string().optional(),
        expiresAt: z.string().datetime().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const expires =
      data.expiresAt ??
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabaseAdmin.from("allowed_users").insert({
      email: data.email.toLowerCase().trim(),
      note: data.note ?? "",
      expires_at: expires,
      invited_by: context.userId,
    });
    if (error) throw error;
    return { ok: true };
  });

export const adminExtendAllowedUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; expiresAt: string }) =>
    z.object({ id: z.string().uuid(), expiresAt: z.string().datetime() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("allowed_users")
      .update({ expires_at: data.expiresAt })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteAllowedUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("allowed_users")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
