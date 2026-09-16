"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { recordBonus } from "@/lib/game";

const SEGMENTS = [
  { label: "+5 XP", amount: 5, color: "#3b82f6" },
  { label: "+10 XP", amount: 10, color: "#10b981" },
  { label: "JACKPOT +25", amount: 25, color: "#f59e0b" },
  { label: "+8 XP", amount: 8, color: "#8b5cf6" },
  { label: "+15 XP", amount: 15, color: "#ec4899" },
  { label: "+12 XP", amount: 12, color: "#06b6d4" },
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length;

export default function PrizeWheel({ onDone }: { onDone: () => void }) {
  const [rotation, setRotation] = useState(0);
  const [phase, setPhase] = useState<"ready" | "spinning" | "done">("ready");
  const [result, setResult] = useState<{ label: string; amount: number } | null>(
    null
  );
  const awarded = useRef(false);

  useEffect(() => {
    const startTimer = window.setTimeout(() => {
      const index = Math.floor(Math.random() * SEGMENTS.length);
      const segment = SEGMENTS[index];
      const segmentCenter = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
      const target = 360 * 6 + (360 - segmentCenter);

      setPhase("spinning");
      setRotation(target);

      const revealTimer = window.setTimeout(() => {
        setPhase("done");
        setResult(segment);
        if (!awarded.current) {
          awarded.current = true;
          recordBonus(segment.amount, "Spin the Wheel bonus");
        }
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 },
          colors: ["#f59e0b", "#1d4ed8", "#10b981", "#ec4899"],
        });
      }, 3200);

      return () => window.clearTimeout(revealTimer);
    }, 500);

    return () => window.clearTimeout(startTimer);
  }, []);

  const gradient = `conic-gradient(${SEGMENTS.map(
    (s, i) => `${s.color} ${i * SEGMENT_ANGLE}deg ${(i + 1) * SEGMENT_ANGLE}deg`
  ).join(", ")})`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-slate-900">
        <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
          🎉 Idea launched! Spin for a bonus!
        </p>

        <div className="relative mx-auto my-6 h-56 w-56">
          <div className="absolute -top-1 left-1/2 z-10 h-0 w-0 -translate-x-1/2 border-l-[9px] border-r-[9px] border-t-[16px] border-l-transparent border-r-transparent border-t-slate-900 dark:border-t-slate-50" />
          <div
            className="h-full w-full overflow-hidden rounded-full border-[6px] border-white shadow-lg transition-transform dark:border-slate-800"
            style={{
              background: gradient,
              transform: `rotate(${rotation}deg)`,
              transitionDuration: "3.2s",
              transitionTimingFunction: "cubic-bezier(0.18, 0.7, 0.1, 1)",
            }}
          >
            {SEGMENTS.map((s) => {
              const index = SEGMENTS.indexOf(s);
              const angle = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
              return (
                <div
                  key={s.label}
                  className="absolute inset-0 flex justify-center"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span className="mt-3 w-16 text-center text-[10px] font-bold leading-tight text-white drop-shadow">
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="absolute inset-0 m-auto flex h-11 w-11 items-center justify-center rounded-full border-2 border-slate-100 bg-white text-lg shadow dark:border-slate-700 dark:bg-slate-900">
            🎡
          </div>
        </div>

        {phase === "done" && result ? (
          <>
            <p className="animate-pop-in text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              +{result.amount} Bonus XP!
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {result.label === `+${result.amount} XP`
                ? "Nice spin!"
                : result.label}
            </p>
            <button
              onClick={onDone}
              className="mt-5 w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
            >
              Awesome!
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {phase === "spinning" ? "Spinning…" : "Get ready…"}
          </p>
        )}
      </div>
    </div>
  );
}
