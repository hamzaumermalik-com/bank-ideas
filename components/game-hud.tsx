"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Trophy, TrendingUp } from "lucide-react";
import { onGameEvent, type GameEvent } from "@/lib/game";

type Toast = {
  id: number;
  kind: GameEvent["type"];
  title: string;
  subtitle?: string;
};

export default function GameHud() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    return onGameEvent((event) => {
      const id = nextId.current++;

      if (event.type === "points") {
        setToasts((current) => [
          ...current,
          { id, kind: "points", title: `+${event.amount} XP`, subtitle: event.reason },
        ]);
      } else if (event.type === "achievement") {
        setToasts((current) => [
          ...current,
          {
            id,
            kind: "achievement",
            title: `${event.achievement.emoji} Achievement unlocked!`,
            subtitle: event.achievement.title,
          },
        ]);
        confetti({
          particleCount: 70,
          spread: 100,
          origin: { y: 0.3 },
          colors: ["#f59e0b", "#1d4ed8", "#10b981"],
        });
      } else if (event.type === "levelup") {
        setToasts((current) => [
          ...current,
          {
            id,
            kind: "levelup",
            title: `🎉 Level up! Level ${event.level}`,
            subtitle: event.title,
          },
        ]);
        confetti({
          particleCount: 140,
          spread: 120,
          startVelocity: 55,
          origin: { y: 0.3 },
          colors: ["#f59e0b", "#1d4ed8", "#10b981", "#ec4899"],
        });
      }

      window.setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, 3200);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-pop-in flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {toast.kind === "achievement" ? (
              <Trophy className="h-4 w-4" />
            ) : toast.kind === "levelup" ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-slate-50">
              {toast.title}
            </p>
            {toast.subtitle && (
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {toast.subtitle}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
