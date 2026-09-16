"use client";

import { useState } from "react";
import { Flame, Lock } from "lucide-react";
import { usePlayer } from "@/lib/use-player";
import { ACHIEVEMENTS, getLevel } from "@/lib/game";

export default function PlayerChip() {
  const player = usePlayer();
  const [open, setOpen] = useState(false);
  const level = getLevel(player.points);

  const progressPct = level.next
    ? Math.min(
        100,
        Math.round(
          ((player.points - level.threshold) /
            (level.next.threshold - level.threshold)) *
            100
        )
      )
    : 100;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition-transform hover:scale-105 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-950"
      >
        <span className="text-sm">{level.emoji}</span>
        Lv.{level.level}
        <span className="hidden text-amber-600 sm:inline dark:text-amber-400">
          {player.points} XP
        </span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{level.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {level.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Level {level.level} · {player.points} XP
                  </p>
                </div>
              </div>
              {player.streak > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                  <Flame className="h-3.5 w-3.5" />
                  {player.streak}d streak
                </span>
              )}
            </div>

            {level.next && (
              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {level.next.threshold - player.points} XP to{" "}
                  {level.next.title}
                </p>
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {player.ideasSubmitted}
                </p>
                Ideas submitted
              </div>
              <div className="rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {player.votesCast}
                </p>
                Votes cast
              </div>
            </div>

            <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
              Achievements
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ACHIEVEMENTS.map((achievement) => {
                const unlocked = player.unlocked.includes(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    title={`${achievement.title} — ${achievement.description}`}
                    className={`relative flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-center ${
                      unlocked
                        ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
                        : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60"
                    }`}
                  >
                    <span
                      className={`text-lg ${unlocked ? "" : "grayscale opacity-40"}`}
                    >
                      {achievement.emoji}
                    </span>
                    <span
                      className={`text-[10px] font-medium leading-tight ${
                        unlocked
                          ? "text-amber-800 dark:text-amber-300"
                          : "text-slate-400"
                      }`}
                    >
                      {achievement.title}
                    </span>
                    {!unlocked && (
                      <Lock className="absolute right-1 top-1 h-2.5 w-2.5 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                );
              })}
            </div>

            <a
              href="/showdown"
              className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
            >
              ⚔️ Play Idea Showdown
            </a>
          </div>
        </>
      )}
    </div>
  );
}
