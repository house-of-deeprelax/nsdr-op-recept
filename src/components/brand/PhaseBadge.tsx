import { cn } from "@/lib/utils";

export type Phase = "rood" | "rood-geel" | "geel-groen" | "groen";

const map: Record<Phase, { label: string; color: string }> = {
  "rood": { label: "Rood", color: "var(--phase-rood)" },
  "rood-geel": { label: "Rood-Geel", color: "var(--phase-rood-geel)" },
  "geel-groen": { label: "Geel-Groen", color: "var(--phase-geel-groen)" },
  "groen": { label: "Groen", color: "var(--phase-groen)" },
};

export function PhaseBadge({ phase, className }: { phase: Phase; className?: string }) {
  const { label, color } = map[phase];
  return (
    <span
      className={cn(
        "group/badge inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs transition-all duration-200",
        className,
      )}
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 10%, transparent)`,
        color: color,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `color-mix(in oklab, ${color} 16%, transparent)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = `color-mix(in oklab, ${color} 10%, transparent)`;
      }}
    >
      <span
        className="block rounded-full transition-all duration-200 group-hover/badge:h-[9px] group-hover/badge:w-[9px]"
        style={{
          width: 6,
          height: 6,
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
      {label}
    </span>
  );
}
