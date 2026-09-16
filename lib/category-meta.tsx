import {
  HeartHandshake,
  Settings2,
  Smartphone,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "./types";

type CategoryMeta = {
  icon: LucideIcon;
  badge: string;
  active: string;
  dot: string;
  iconWrap: string;
};

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  "Customer Experience": {
    icon: Users,
    badge:
      "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-900",
    active: "border-sky-600 bg-sky-600 text-white",
    dot: "bg-sky-500",
    iconWrap: "bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300",
  },
  Operations: {
    icon: Settings2,
    badge:
      "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900",
    active: "border-amber-600 bg-amber-600 text-white",
    dot: "bg-amber-500",
    iconWrap: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300",
  },
  "Digital Banking": {
    icon: Smartphone,
    badge:
      "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:ring-violet-900",
    active: "border-violet-600 bg-violet-600 text-white",
    dot: "bg-violet-500",
    iconWrap: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
  },
  "AI & Automation": {
    icon: Sparkles,
    badge:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900",
    active: "border-emerald-600 bg-emerald-600 text-white",
    dot: "bg-emerald-500",
    iconWrap: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
  },
  "Employee Experience": {
    icon: HeartHandshake,
    badge:
      "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900",
    active: "border-rose-600 bg-rose-600 text-white",
    dot: "bg-rose-500",
    iconWrap: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300",
  },
};
