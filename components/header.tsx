"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark, LayoutDashboard, Lightbulb } from "lucide-react";
import PlayerChip from "./player-chip";

const NAV_ITEMS = [
  { href: "/", label: "Ideas", icon: Lightbulb },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white shadow-sm dark:bg-blue-800">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold leading-tight text-slate-900 dark:text-slate-50">
              Bank Ideas
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Employee Innovation Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-700 text-white shadow-sm"
                      : "text-slate-600 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-400"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <PlayerChip />
        </div>
      </div>
    </header>
  );
}
