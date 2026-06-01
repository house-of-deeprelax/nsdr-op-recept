import { useEffect, useState } from "react";

const TEXT = "NSDR op Recept";
const LETTER_MS = 110;
const LINE_DELAY = TEXT.length * LETTER_MS + 150;
const INSTITUTE_DELAY = LINE_DELAY + 1500;
const TOTAL_MS = 5000;
const FADE_MS = 500;

export function Preloader({ onDone }: { onDone: () => void }) {
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [showLine, setShowLine] = useState(false);
  const [showInstitute, setShowInstitute] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    for (let i = 1; i <= TEXT.length; i++) {
      timers.push(window.setTimeout(() => setVisibleLetters(i), i * LETTER_MS));
    }
    timers.push(window.setTimeout(() => setShowLine(true), LINE_DELAY));
    timers.push(window.setTimeout(() => setShowInstitute(true), INSTITUTE_DELAY));
    timers.push(window.setTimeout(() => setFadingOut(true), TOTAL_MS - FADE_MS));
    timers.push(window.setTimeout(() => onDone(), TOTAL_MS));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#1e1e1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadingOut ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
        pointerEvents: fadingOut ? "none" : "auto",
      }}
    >
      <div
        style={{
          fontFamily: "Barlow, system-ui, sans-serif",
          fontWeight: 800,
          fontSize: "32px",
          color: "#F1F1EE",
          letterSpacing: "0.02em",
        }}
      >
        {TEXT.split("").map((ch, i) => (
          <span
            key={i}
            style={{
              opacity: i < visibleLetters ? 1 : 0,
              transition: "opacity 120ms ease-out",
              whiteSpace: "pre",
            }}
          >
            {ch}
          </span>
        ))}
      </div>

      <div
        style={{
          marginTop: "24px",
          width: "100%",
          maxWidth: "300px",
          height: "1px",
          backgroundColor: "transparent",
        }}
      >
        <div
          style={{
            height: "1px",
            backgroundColor: "#7a8a58",
            width: showLine ? "100%" : "0%",
            transition: "width 1500ms ease-out",
          }}
        />
      </div>

      <div
        style={{
          marginTop: "20px",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "rgba(241,241,238,0.4)",
          opacity: showInstitute ? 1 : 0,
          transition: "opacity 600ms ease-out",
        }}
      >
        Deeprelax Institute
      </div>
    </div>
  );
}
