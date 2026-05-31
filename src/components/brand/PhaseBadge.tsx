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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        className,
      )}
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
        color: color,
        border: `0.5px solid color-mix(in oklab, ${color} 35%, transparent)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
      />
      {label}
    </span>
  );
}
