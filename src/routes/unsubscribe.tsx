import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/unsubscribe")({
  head: () => ({ meta: [{ title: "Uitschrijven — NSDR op Recept" }] }),
  component: UnsubscribePage,
});

type State =
  | { kind: "loading" }
  | { kind: "invalid"; message: string }
  | { kind: "confirm"; email: string }
  | { kind: "done" }
  | { kind: "already" }
  | { kind: "error"; message: string };

function UnsubscribePage() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token") ?? "";
    setToken(t);
    if (!t) {
      setState({ kind: "invalid", message: "Geen token gevonden in de link." });
      return;
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(t)}`)
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (r.ok && body?.valid) {
          if (body.alreadyUnsubscribed) setState({ kind: "already" });
          else setState({ kind: "confirm", email: body.email ?? "" });
        } else {
          setState({ kind: "invalid", message: body?.error ?? "Ongeldige of verlopen link." });
        }
      })
      .catch(() => setState({ kind: "invalid", message: "Kon link niet valideren." }));
  }, []);

  const confirm = async () => {
    try {
      const r = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (r.ok) setState({ kind: "done" });
      else {
        const body = await r.json().catch(() => ({}));
        setState({ kind: "error", message: body?.error ?? "Uitschrijven mislukt." });
      }
    } catch {
      setState({ kind: "error", message: "Uitschrijven mislukt." });
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "#0c0c0a" }}
    >
      <div
        className="max-w-md w-full rounded-lg border p-8 text-center"
        style={{ borderColor: "var(--border-default)", color: "#f0ede6" }}
      >
        <h1 className="font-display text-[28px]" style={{ lineHeight: 1.1 }}>
          Uitschrijven
        </h1>

        {state.kind === "loading" && (
          <p className="mt-4 text-[13px]" style={{ color: "rgba(240,237,230,0.55)" }}>
            Bezig met valideren…
          </p>
        )}

        {state.kind === "invalid" && (
          <p className="mt-4 text-[13px]" style={{ color: "#e08a7a" }}>
            {state.message}
          </p>
        )}

        {state.kind === "already" && (
          <p className="mt-4 text-[13px]" style={{ color: "rgba(240,237,230,0.7)" }}>
            Je bent al uitgeschreven.
          </p>
        )}

        {state.kind === "confirm" && (
          <>
            <p className="mt-4 text-[13px]" style={{ color: "rgba(240,237,230,0.7)" }}>
              Weet je zeker dat je geen e-mails meer wilt ontvangen{state.email ? ` op ${state.email}` : ""}?
            </p>
            <button
              onClick={confirm}
              className="mt-6 rounded-md px-5 py-2"
              style={{
                background: "var(--sage)",
                color: "#0c0c0a",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.02em",
              }}
            >
              Ja, uitschrijven
            </button>
          </>
        )}

        {state.kind === "done" && (
          <p className="mt-4 text-[13px]" style={{ color: "rgba(240,237,230,0.7)" }}>
            Je bent uitgeschreven. Bedankt voor de melding.
          </p>
        )}

        {state.kind === "error" && (
          <p className="mt-4 text-[13px]" style={{ color: "#e08a7a" }}>
            {state.message}
          </p>
        )}
      </div>
    </div>
  );
}
