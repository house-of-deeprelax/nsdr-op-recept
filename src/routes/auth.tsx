import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { requestLoginCode } from "@/lib/access.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Inloggen — NSDR op Recept" }],
  }),
  component: AuthPage,
});

const ease = [0.22, 1, 0.36, 1] as const;

function AuthPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  // Already signed in? Go home.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/" });
    });
  }, [navigate]);

  // Countdown for resend
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const requestCode = async (targetEmail: string) => {
    const result = await requestLoginCode({ data: { email: targetEmail } });
    if (!result.ok) {
      if (result.reason === "not_allowed") {
        toast.error("Geen toegang — dit e-mailadres staat niet op de uitnodigingslijst.");
      } else if (result.reason === "expired") {
        toast.error("Je toegang is verlopen. Neem contact op voor verlenging.");
      } else {
        toast.error("Er ging iets mis. Probeer het opnieuw.");
      }
      return false;
    }
    setResendIn(45);
    return true;
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    const ok = await requestCode(trimmed);
    setLoading(false);
    if (!ok) return;
    toast.success("Code verstuurd naar je e-mail");
    setStep("code");
  };

  const resendCode = async () => {
    if (resendIn > 0 || loading) return;
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    const ok = await requestCode(trimmed);
    setLoading(false);
    if (ok) toast.success("Nieuwe code verstuurd");
  };




  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    const token = code.trim();
    if (!token) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: trimmed,
      token,
      type: "email",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Ingelogd");
    navigate({ to: "/" });
  };

  return (
    <div
      className="flex w-full items-center justify-center px-6"
      style={{ minHeight: "calc(100vh - 44px)", background: "var(--surface-1)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="w-full max-w-[420px]"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[11px] uppercase transition-colors"
          style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.4)" }}
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={2} /> Terug
        </Link>

        <h1
          className="mt-6 font-display text-[36px] sm:text-[44px]"
          style={{ lineHeight: 1.05, letterSpacing: "-0.03em", color: "#f0ede6" }}
        >
          {step === "email" ? "Inloggen." : "Voer de code in."}
        </h1>

        <p
          className="mt-3 text-[13px]"
          style={{ lineHeight: 1.6, color: "rgba(240,237,230,0.55)" }}
        >
          {step === "email"
            ? "We sturen je een 6-cijferige code per e-mail."
            : `We hebben een code gestuurd naar ${email}.`}
        </p>

        {step === "email" ? (
          <form onSubmit={sendCode} className="mt-8 flex flex-col gap-4">
            <input
              type="email"
              autoFocus
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@praktijk.nl"
              className="w-full rounded-md border bg-transparent px-3 py-3 text-[14px] outline-none transition-colors"
              style={{ borderColor: "var(--border-default)", color: "#f0ede6" }}
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 transition-all disabled:opacity-60"
              style={{
                background: "var(--sage)",
                color: "#0c0c0a",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.02em",
              }}
            >
              {loading ? "Versturen…" : "Stuur code"}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="mt-8 flex flex-col gap-4">
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              required
              maxLength={6}
              pattern="[0-9]*"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full rounded-md border bg-transparent px-3 py-3 text-center text-[20px] tracking-[0.5em] outline-none transition-colors"
              style={{ borderColor: "var(--border-default)", color: "#f0ede6" }}
            />
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 transition-all disabled:opacity-60"
              style={{
                background: "var(--sage)",
                color: "#0c0c0a",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.02em",
              }}
            >
              {loading ? "Verifiëren…" : "Bevestig en log in"}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={resendCode}
                disabled={resendIn > 0 || loading}
                className="text-[12px] underline disabled:no-underline disabled:opacity-60"
                style={{ color: "rgba(240,237,230,0.55)" }}
              >
                {resendIn > 0 ? `Nieuwe code over ${resendIn}s` : "Stuur nieuwe code"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                }}
                className="text-[12px] underline"
                style={{ color: "rgba(240,237,230,0.55)" }}
              >
                Ander e-mailadres
              </button>
            </div>

          </form>
        )}
      </motion.div>
    </div>
  );
}
