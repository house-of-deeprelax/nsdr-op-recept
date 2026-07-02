type LovableErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type LovableEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: LovableErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __lovableEvents?: LovableEvents;
    __nsdrRecentErrors?: Map<string, number>;
  }
}

const SERVER_LOG_THROTTLE_MS = 5 * 60 * 1000;

function shouldLogToServer(key: string): boolean {
  if (typeof window === "undefined") return false;
  if (!window.__nsdrRecentErrors) window.__nsdrRecentErrors = new Map();
  const last = window.__nsdrRecentErrors.get(key) ?? 0;
  if (Date.now() - last < SERVER_LOG_THROTTLE_MS) return false;
  window.__nsdrRecentErrors.set(key, Date.now());
  return true;
}

async function sendToServer(error: unknown, context: Record<string, unknown>) {
  try {
    const err = error as { message?: string; stack?: string } | undefined;
    const message =
      (err?.message && String(err.message)) ||
      (typeof error === "string" ? error : "Onbekende fout");
    const stack = err?.stack ? String(err.stack) : undefined;
    const route =
      typeof window !== "undefined" ? window.location.pathname : undefined;
    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent : undefined;

    if (!shouldLogToServer(`${route}::${message.slice(0, 200)}`)) return;

    // Attach bearer if available via the client supabase session
    let authHeader: Record<string, string> = {};
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) authHeader = { Authorization: `Bearer ${token}` };
    } catch {
      // ignore
    }

    await fetch("/_serverFn/src_lib_errors_functions_ts--logClientError", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({ data: { message, stack, route, userAgent, context } }),
      keepalive: true,
    }).catch(() => {
      // Fallback: try alternate path shape if endpoint differs
    });
  } catch {
    // never let the reporter itself throw
  }
}

export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const ctx = {
    source: "react_error_boundary",
    route: window.location.pathname,
    ...context,
  };
  window.__lovableEvents?.captureException?.(error, ctx, {
    mechanism: "react_error_boundary",
    handled: false,
    severity: "error",
  });
  void sendToServer(error, ctx);
}

/**
 * Install global handlers once (browser only). Safe to call multiple times.
 */
export function installGlobalErrorReporting() {
  if (typeof window === "undefined") return;
  const w = window as unknown as { __nsdrErrReportingInstalled?: boolean };
  if (w.__nsdrErrReportingInstalled) return;
  w.__nsdrErrReportingInstalled = true;

  window.addEventListener("error", (event) => {
    const err = (event as ErrorEvent).error ?? new Error((event as ErrorEvent).message);
    void sendToServer(err, { source: "window.onerror" });
  });
  window.addEventListener("unhandledrejection", (event) => {
    const reason = (event as PromiseRejectionEvent).reason;
    void sendToServer(reason ?? new Error("Unhandled promise rejection"), {
      source: "unhandledrejection",
    });
  });
}
