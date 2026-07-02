import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageTransition } from "@/components/layout/PageTransition";
import {
  adminListAllowedUsers,
  adminAddAllowedUser,
  adminExtendAllowedUser,
  adminDeleteAllowedUser,
  checkMyAccess,
} from "@/lib/access.functions";
import {
  adminListErrors,
  adminToggleErrorResolved,
  adminDeleteError,
} from "@/lib/errors.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Beheer — NSDR op Recept" }] }),
  beforeLoad: async () => {
    try {
      const access = await checkMyAccess();
      if (!access.isAdmin) throw redirect({ to: "/" });
    } catch (e) {
      if (e && typeof e === "object" && "to" in e) throw e;
      throw redirect({ to: "/" });
    }
  },
  component: AdminPage,
});

type Row = {
  id: string;
  email: string;
  expires_at: string;
  note: string;
  created_at: string;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function isExpired(iso: string) {
  return new Date(iso).getTime() < Date.now();
}

function AdminPage() {
  const [tab, setTab] = useState<"users" | "errors">("users");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    try {
      const data = await adminListAllowedUsers();
      setRows(data as Row[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kon lijst niet laden");
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setBusy(true);
    try {
      await adminAddAllowedUser({ data: { email: trimmed, note } });
      toast.success("Deelnemer toegevoegd");
      setEmail("");
      setNote("");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Toevoegen mislukt");
    } finally {
      setBusy(false);
    }
  };

  const extend = async (row: Row) => {
    const next = new Date(
      Math.max(Date.now(), new Date(row.expires_at).getTime()) +
        365 * 24 * 60 * 60 * 1000,
    ).toISOString();
    try {
      await adminExtendAllowedUser({ data: { id: row.id, expiresAt: next } });
      toast.success("Toegang verlengd met 1 jaar");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verlengen mislukt");
    }
  };

  const remove = async (row: Row) => {
    if (!confirm(`${row.email} verwijderen?`)) return;
    try {
      await adminDeleteAllowedUser({ data: { id: row.id } });
      toast.success("Deelnemer verwijderd");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verwijderen mislukt");
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-[900px] px-6 py-10">
        <h1
          className="font-display text-[36px]"
          style={{ lineHeight: 1.05, letterSpacing: "-0.03em", color: "#f0ede6" }}
        >
          Deelnemersbeheer
        </h1>
        <p
          className="mt-3 text-[13px]"
          style={{ color: "rgba(240,237,230,0.55)" }}
        >
          Alleen e-mailadressen op deze lijst kunnen inloggen. Standaard 1 jaar geldig.
        </p>

        <form
          onSubmit={addUser}
          className="mt-8 flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-end"
          style={{ borderColor: "var(--border-default)" }}
        >
          <div className="flex flex-1 flex-col gap-1">
            <label
              className="text-[11px] uppercase"
              style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.4)" }}
            >
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@praktijk.nl"
              className="rounded-md border bg-transparent px-3 py-2 text-[14px] outline-none"
              style={{ borderColor: "var(--border-default)", color: "#f0ede6" }}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label
              className="text-[11px] uppercase"
              style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.4)" }}
            >
              Notitie (optioneel)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="bv. cohort 2026"
              className="rounded-md border bg-transparent px-3 py-2 text-[14px] outline-none"
              style={{ borderColor: "var(--border-default)", color: "#f0ede6" }}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-md px-5 py-2 disabled:opacity-60"
            style={{
              background: "var(--sage)",
              color: "#0c0c0a",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.02em",
            }}
          >
            Toevoegen
          </button>
        </form>

        <div
          className="mt-8 overflow-hidden rounded-md border"
          style={{ borderColor: "var(--border-default)" }}
        >
          <table className="w-full text-[13px]" style={{ color: "#f0ede6" }}>
            <thead>
              <tr
                className="text-left text-[11px] uppercase"
                style={{
                  letterSpacing: "0.12em",
                  color: "rgba(240,237,230,0.4)",
                  borderBottom: "1px solid var(--border-default)",
                }}
              >
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Verloopt</th>
                <th className="px-4 py-3">Notitie</th>
                <th className="px-4 py-3 text-right">Acties</th>
              </tr>
            </thead>
            <tbody>
              {rows === null && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center" style={{ color: "rgba(240,237,230,0.4)" }}>
                    Laden…
                  </td>
                </tr>
              )}
              {rows?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center" style={{ color: "rgba(240,237,230,0.4)" }}>
                    Nog geen deelnemers.
                  </td>
                </tr>
              )}
              {rows?.map((row) => {
                const expired = isExpired(row.expires_at);
                return (
                  <tr
                    key={row.id}
                    style={{ borderTop: "1px solid var(--border-default)" }}
                  >
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3">
                      <span style={{ color: expired ? "#e08a7a" : "#f0ede6" }}>
                        {formatDate(row.expires_at)}
                        {expired && " · verlopen"}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "rgba(240,237,230,0.55)" }}>
                      {row.note || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => extend(row)}
                        className="mr-3 text-[12px] underline"
                        style={{ color: "rgba(240,237,230,0.7)" }}
                      >
                        +1 jaar
                      </button>
                      <button
                        onClick={() => remove(row)}
                        className="text-[12px] underline"
                        style={{ color: "#e08a7a" }}
                      >
                        Verwijderen
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}
