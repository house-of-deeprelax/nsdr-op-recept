import { useEffect, useState } from "react";

const TOTAL_MS = 5000;
const FADE_MS = 600;

export function Preloader({ onDone }: { onDone: () => void }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setFadingOut(true), TOTAL_MS - FADE_MS);
    const t2 = window.setTimeout(() => onDone(), TOTAL_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <>
      <style>{`
        @keyframes nsdr-cinematic-zoom {
          0%   { transform: scale(0.92); opacity: 0; filter: blur(14px); }
          40%  { opacity: 1; filter: blur(0); }
          100% { transform: scale(1.06); opacity: 1; filter: blur(0); }
        }
        @keyframes nsdr-glow-line {
          0%   { width: 0;     opacity: 0; }
          30%  { opacity: 1; }
          60%  { width: 220px; opacity: 1; }
          100% { width: 220px; opacity: 1; }
        }
        @keyframes nsdr-subtitle-fade {
          0%   { opacity: 0; letter-spacing: 0.8em; transform: translateY(8px); }
          100% { opacity: 1; letter-spacing: 0.4em; transform: translateY(0); }
        }
        @keyframes nsdr-bg-pulse {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        .nsdr-cinematic { animation: nsdr-cinematic-zoom 4.4s cubic-bezier(0.22,1,0.36,1) forwards; }
        .nsdr-line      { animation: nsdr-glow-line 2.2s ease-in-out 0.6s forwards; }
        .nsdr-subtitle  { animation: nsdr-subtitle-fade 1.4s ease-out 1.6s both; }
        .nsdr-bg        { animation: nsdr-bg-pulse 3.5s ease-in-out infinite; }
      `}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "#0a0a08",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          opacity: fadingOut ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease-out`,
          pointerEvents: fadingOut ? "none" : "auto",
        }}
      >
        {/* Cinematic vignette */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.85) 100%)",
            pointerEvents: "none",
          }}
        />
        {/* Ambient backglow */}
        <div
          aria-hidden
          className="nsdr-bg"
          style={{
            position: "absolute",
            width: "640px",
            height: "640px",
            borderRadius: "9999px",
            background: "radial-gradient(circle, rgba(122,138,88,0.18), transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <div
          className="nsdr-cinematic"
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 1,
            padding: "0 24px",
          }}
        >
          <h1
            style={{
              fontFamily: "Barlow, system-ui, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(48px, 8vw, 96px)",
              lineHeight: 1,
              color: "#F1F1EE",
              letterSpacing: "-0.02em",
              margin: 0,
              textShadow: "0 0 30px rgba(241,241,238,0.18)",
              whiteSpace: "nowrap",
            }}
          >
            NSDR op Recept
          </h1>

          <div
            className="nsdr-line"
            style={{
              marginTop: "28px",
              height: "1px",
              maxWidth: "220px",
              backgroundColor: "#7a8a58",
              boxShadow: "0 0 12px #7a8a58, 0 0 24px rgba(122,138,88,0.6)",
            }}
          />

          <p
            className="nsdr-subtitle"
            style={{
              marginTop: "24px",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.4em",
              color: "rgba(241,241,238,0.45)",
              margin: "24px 0 0",
            }}
          >
            Deeprelax Institute
          </p>
        </div>
      </div>
    </>
  );
}
