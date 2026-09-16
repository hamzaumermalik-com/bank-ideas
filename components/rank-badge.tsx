import { Crown, Medal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const RANK_STYLES: Record<1 | 2 | 3, { icon: LucideIcon; classes: string }> = {
  1: {
    icon: Crown,
    classes:
      "bg-amber-400 text-amber-950 shadow-[0_0_0_3px_rgba(251,191,36,0.3)]",
  },
  2: {
    icon: Medal,
    classes: "bg-slate-300 text-slate-800",
  },
  3: {
    icon: Medal,
    classes: "bg-amber-700 text-amber-50",
  },
};

export default function RankBadge({
  rank,
  size = "md",
}: {
  rank: 1 | 2 | 3;
  size?: "sm" | "md";
}) {
  const meta = RANK_STYLES[rank];
  const Icon = meta.icon;
  const dims = size === "sm" ? "h-6 w-6" : "h-10 w-10";
  const iconDims = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${dims} ${meta.classes}`}
    >
      <Icon className={iconDims} />
    </span>
  );
}
