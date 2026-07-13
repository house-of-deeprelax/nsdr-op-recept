import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/kennisbank")({
  head: () => ({ meta: [{ title: "Kennisbank — NSDR op Recept" }] }),
  component: KennisbankPage,
});

const KB_URL =
  "https://biidmtkicgmlerdvxniy.supabase.co/functions/v1/kennisbank-chat";
const KB_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaWRtdGtpY2dtbGVyZHZ4bml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTUwMzYsImV4cCI6MjA4NzY5MTAzNn0.wcFBDAV4aWV9wKxClt9o5kBE6g_R1fo67qyFXX4IXrM";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Wat doe ik als een cliënt in Freeze niet reageert?",
  "Wanneer schakel ik door naar Geel-Rood?",
  "Welke sessies passen bij Mentaal hoog?",
  "Hoe leg ik pacing uit aan een cliënt?",
];

function KennisbankPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  // Auto-resize textarea (max ~4 rows)
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [input]);

  function insertSuggestion(text: string) {
    setInput(text);
    textareaRef.current?.focus();
  }

  async function submit() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    const nextHistory: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(KB_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${KB_ANON}`,
          apikey: KB_ANON,
        },
        body: JSON.stringify({
          message: trimmed,
          history: messages,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { answer?: string };
      const answer = data.answer ?? "";
      setMessages([...nextHistory, { role: "assistant", content: answer }]);
    } catch {
      setMessages([
        ...nextHistory,
        {
          role: "assistant",
          content: "Er ging iets mis. Probeer het opnieuw.",
        },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const hasInput = input.trim().length > 0;
  const canSend = hasInput && !loading;

  return (
    <div className="flex h-[calc(100vh-56px)] w-full flex-col lg:flex-row">
      {/* Left column */}
      <aside
        className="w-full shrink-0 overflow-y-auto lg:w-[38%]"
        style={{
          background: "#141412",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "48px 32px",
        }}
      >
        <div
          className="text-[10px] uppercase"
          style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.4)" }}
        >
          KENNISBANK
        </div>
        <h1
          className="font-display mt-2"
          style={{
            fontWeight: 800,
            fontSize: "24px",
            color: "#f0ede6",
            letterSpacing: "-0.01em",
          }}
        >
          Stel een vraag
        </h1>

        <p
          className="mt-6"
          style={{
            fontSize: "17px",
            color: "rgba(240,237,230,0.5)",
            lineHeight: 1.55,
          }}
        >
          Stel een vraag over de NSDR-methode, protocollen, sessies of klinisch
          redeneren. De kennisbank bevat alle protocollen van Deeprelax
          Institute.
        </p>

        <div className="mt-8">
          <div
            className="text-[10px] uppercase"
            style={{ letterSpacing: "0.12em", color: "rgba(240,237,230,0.4)" }}
          >
            VOORBEELDVRAGEN
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => insertSuggestion(s)}
                className="text-left transition-colors hover:!border-[rgba(122,138,88,0.4)] hover:!text-[rgba(240,237,230,0.85)]"
                style={{
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "rgba(240,237,230,0.6)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Right column */}
      <section
        className="flex min-h-0 flex-1 flex-col"
        style={{ background: "#0c0c0a" }}
      >
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
          style={{ padding: "32px 40px" }}
        >
          {messages.length === 0 && !loading ? (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3">
              <BookOpen
                className="h-5 w-5"
                strokeWidth={1.5}
                style={{ color: "rgba(240,237,230,0.2)" }}
              />
              <p
                style={{ color: "rgba(240,237,230,0.2)", fontSize: 13 }}
              >
                Geen vragen gesteld. Begin hieronder.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div
                      style={{
                        background: "rgba(122,138,88,0.15)",
                        border: "0.5px solid rgba(122,138,88,0.3)",
                        borderRadius: "12px 12px 2px 12px",
                        padding: "12px 16px",
                        maxWidth: "80%",
                        fontSize: 14,
                        color: "#f0ede6",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex justify-start">
                    <div
                      style={{
                        background: "rgba(241,241,238,0.03)",
                        border: "0.5px solid rgba(241,241,238,0.07)",
                        borderRadius: "2px 12px 12px 12px",
                        padding: "16px 20px",
                        width: "100%",
                        fontSize: 14,
                        color: "rgba(240,237,230,0.85)",
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                ),
              )}
              {loading && (
                <div className="flex justify-start">
                  <div
                    className="flex items-center gap-3"
                    style={{
                      background: "rgba(241,241,238,0.03)",
                      border: "0.5px solid rgba(241,241,238,0.07)",
                      borderRadius: "2px 12px 12px 12px",
                      padding: "16px 20px",
                      fontSize: 14,
                      color: "rgba(240,237,230,0.6)",
                    }}
                  >
                    <span className="flex gap-1">
                      <span
                        className="h-1.5 w-1.5 animate-pulse rounded-full"
                        style={{
                          background: "rgba(240,237,230,0.5)",
                          animationDelay: "0ms",
                        }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-pulse rounded-full"
                        style={{
                          background: "rgba(240,237,230,0.5)",
                          animationDelay: "150ms",
                        }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-pulse rounded-full"
                        style={{
                          background: "rgba(240,237,230,0.5)",
                          animationDelay: "300ms",
                        }}
                      />
                    </span>
                    <span>Even zoeken in de kennisbank...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div
          style={{
            borderTop: "0.5px solid rgba(255,255,255,0.06)",
            padding: "20px 40px",
          }}
        >
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Stel een vraag over de methode..."
              className="w-full resize-none outline-none placeholder:text-[rgba(240,237,230,0.3)] focus:!border-[rgba(122,138,88,0.4)]"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "0.5px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "12px 48px 12px 16px",
                fontSize: 14,
                color: "#f0ede6",
                lineHeight: 1.5,
                minHeight: 44,
                maxHeight: 120,
              }}
            />
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label="Verstuur"
              className="absolute flex items-center justify-center transition-colors disabled:cursor-not-allowed"
              style={{
                right: 8,
                bottom: 8,
                width: 32,
                height: 32,
                borderRadius: 6,
                background: canSend ? "#7a8a58" : "rgba(255,255,255,0.05)",
                color: canSend ? "#0c0c0a" : "rgba(240,237,230,0.35)",
              }}
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
