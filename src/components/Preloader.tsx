import { useEffect, useState } from "react";

const TOTAL_MS = 5000;
const FADE_MS = 1200;

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
        @keyframes nsdr-soft-reveal {
          0%   { transform: scale(0.995); opacity: 0; filter: blur(3px); }
          40%  { opacity: 1; }
          100% { transform: scale(1); opacity: 1; filter: blur(0); }
        }
        @keyframes nsdr-line-grow {
          0%   { width: 0; opacity: 0; }
          30%  { opacity: 0.6; }
          100% { width: 260px; opacity: 1; }
        }
        @keyframes nsdr-subtitle-soft {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes nsdr-bg-breathe {
          0%, 100% { opacity: 0.6; }
          50%      { opacity: 0.85; }
        }
        .nsdr-reveal    { animation: nsdr-soft-reveal 5.5s cubic-bezier(0.22,1,0.36,1) forwards; }
        .nsdr-line      { animation: nsdr-line-grow 2.8s cubic-bezier(0.22,1,0.36,1) 1.3s forwards; }
        .nsdr-subtitle  { animation: nsdr-subtitle-soft 2.2s ease-out 2.6s both; }
        .nsdr-bg        { animation: nsdr-bg-breathe 8s ease-in-out infinite; }
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
          transition: `opacity ${FADE_MS}ms ease-in-out`,
          pointerEvents: fadingOut ? "none" : "auto",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.7) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          className="nsdr-bg"
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "9999px",
            background: "radial-gradient(circle, rgba(122,138,88,0.10), transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <div
          className="nsdr-reveal"
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
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 400,
              fontSize: "clamp(20px, 2.6vw, 32px)",
              lineHeight: 1,
              color: "#F1F1EE",
              textTransform: "uppercase",
              letterSpacing: "0.32em",
              paddingLeft: "0.32em",
              margin: 0,
              whiteSpace: "nowrap",
            }}
          >
            NSDR op Recept
          </h1>

          <div
            className="nsdr-line"
            style={{
              marginTop: "36px",
              height: "1px",
              maxWidth: "260px",
              backgroundColor: "#7a8a58",
              boxShadow: "0 0 6px rgba(122,138,88,0.3)",
            }}
          />

          <p
            className="nsdr-subtitle"
            style={{
              marginTop: "26px",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.4em",
              color: "rgba(241,241,238,0.40)",
              margin: "26px 0 0",
            }}
          >
            Deeprelax Institute
          </p>
        </div>
      </div>
    </>
  );
}

