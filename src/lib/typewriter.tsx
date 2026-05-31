import { useEffect, useState } from "react";

export type TypewriterBlock = { id: string; text: string };

export function useTypewriter(
  blocks: TypewriterBlock[],
  opts: { speed?: number; pauseBetween?: number; startDelay?: number } = {},
) {
  const { speed = 18, pauseBetween = 400, startDelay = 0 } = opts;

  const [activeIndex, setActiveIndex] = useState(-1);
  const [chars, setChars] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setActiveIndex(0), startDelay);
    return () => clearTimeout(startTimer);
  }, [startDelay]);

  useEffect(() => {
    if (activeIndex < 0 || activeIndex >= blocks.length) return;
    const current = blocks[activeIndex];
    setChars(0);

    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setChars(i);
      if (i >= current.text.length) {
        clearInterval(interval);
        if (activeIndex === blocks.length - 1) {
          setTimeout(() => setComplete(true), pauseBetween);
        } else {
          setTimeout(() => setActiveIndex(activeIndex + 1), pauseBetween);
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [activeIndex, blocks, speed, pauseBetween]);

  const getText = (id: string) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === -1) return "";
    if (idx < activeIndex) return blocks[idx].text;
    if (idx === activeIndex) return blocks[idx].text.slice(0, chars);
    return "";
  };

  const isCursorOn = (id: string) => {
    if (complete) return false;
    const idx = blocks.findIndex((b) => b.id === id);
    return idx === activeIndex;
  };

  const isStarted = (id: string) => {
    const idx = blocks.findIndex((b) => b.id === id);
    return idx >= 0 && idx <= activeIndex;
  };

  return { activeIndex, getText, isCursorOn, isStarted, complete };
}

export function Cursor({ on }: { on: boolean }) {
  if (!on) return null;
  return (
    <span
      className="cursor-blink ml-0.5 inline-block translate-y-[2px] align-baseline"
      style={{ width: 2, height: 16, background: "var(--sage)" }}
    />
  );
}
