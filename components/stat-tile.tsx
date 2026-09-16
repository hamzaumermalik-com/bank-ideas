import type { LucideIcon } from "lucide-react";

export default function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-semibold leading-none text-slate-900 dark:text-slate-50">
          {value}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}
