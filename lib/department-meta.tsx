import {
  Briefcase,
  HeartHandshake,
  Landmark,
  Laptop,
  Megaphone,
  MoreHorizontal,
  Settings2,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Department } from "./types";

type DepartmentMeta = {
  icon: LucideIcon;
  emoji: string;
  iconWrap: string;
  active: string;
};

export const DEPARTMENT_META: Record<Department, DepartmentMeta> = {
  "Retail Banking": {
    icon: Landmark,
    emoji: "🏦",
    iconWrap: "bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300",
    active: "border-sky-600 bg-sky-50 ring-2 ring-sky-200 dark:bg-sky-950 dark:ring-sky-900",
  },
  "Corporate Banking": {
    icon: Briefcase,
    emoji: "💼",
    iconWrap: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300",
    active: "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 dark:bg-indigo-950 dark:ring-indigo-900",
  },
  Operations: {
    icon: Settings2,
    emoji: "⚙️",
    iconWrap: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300",
    active: "border-amber-600 bg-amber-50 ring-2 ring-amber-200 dark:bg-amber-950 dark:ring-amber-900",
  },
  "IT & Digital": {
    icon: Laptop,
    emoji: "💻",
    iconWrap: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
    active: "border-violet-600 bg-violet-50 ring-2 ring-violet-200 dark:bg-violet-950 dark:ring-violet-900",
  },
  "Risk & Compliance": {
    icon: ShieldCheck,
    emoji: "🛡️",
    iconWrap: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300",
    active: "border-rose-600 bg-rose-50 ring-2 ring-rose-200 dark:bg-rose-950 dark:ring-rose-900",
  },
  "HR & Admin": {
    icon: HeartHandshake,
    emoji: "🤝",
    iconWrap: "bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-300",
    active: "border-pink-600 bg-pink-50 ring-2 ring-pink-200 dark:bg-pink-950 dark:ring-pink-900",
  },
  "Marketing & CX": {
    icon: Megaphone,
    emoji: "📣",
    iconWrap: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-300",
    active: "border-orange-600 bg-orange-50 ring-2 ring-orange-200 dark:bg-orange-950 dark:ring-orange-900",
  },
  "Finance & Treasury": {
    icon: Wallet,
    emoji: "💰",
    iconWrap: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
    active: "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200 dark:bg-emerald-950 dark:ring-emerald-900",
  },
  Other: {
    icon: MoreHorizontal,
    emoji: "🌟",
    iconWrap: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    active: "border-slate-600 bg-slate-50 ring-2 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700",
  },
};
