"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import { recordBonus } from "@/lib/game";

type Rarity = "common" | "rare" | "epic" | "legendary";

const RARITY_STYLES: Record<Rarity, { label: string; className: string }> = {
  common: {
    label: "Common",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
  rare: {
    label: "Rare",
    className: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  },
  epic: {
    label: "Epic",
    className: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  legendary: {
    label: "Legendary",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
};

const SEGMENTS: {
  label: string;
  amount: number;
  color: string;
  emoji: string;
  rarity: Rarity;
}[] = [
  { label: "+5 XP", amount: 5, color: "#3b82f6", emoji: "🎈", rarity: "common" },
  { label: "+10 XP", amount: 10, color: "#10b981", emoji: "⭐", rarity: "common" },
  { label: "+8 XP", amount: 8, color: "#06b6d4", emoji: "🎉", rarity: "common" },
  { label: "+15 XP", amount: 15, color: "#ec4899", emoji: "💎", rarity: "rare" },
  { label: "+12 XP", amount: 12, color: "#8b5cf6", emoji: "🍀", rarity: "rare" },
  { label: "+20 XP", amount: 20, color: "#f97316", emoji: "🚀", rarity: "epic" },
  { label: "+18 XP", amount: 18, color: "#14b8a6", emoji: "🔥", rarity: "epic" },
  { label: "JACKPOT +35", amount: 35, color: "#f59e0b", emoji: "👑", rarity: "legendary" },
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length;

export default function PrizeWheel({ onDone }: { onDone: () => void }) {
  const [rotation, setRotation] = useState(0);
  const [phase, setPhase] = useState<"ready" | "spinning" | "done">("ready");
  const [result, setResult] = useState<(typeof SEGMENTS)[number] | null>(null);
  const awarded = useRef(false);

  // This component only ever mounts client-side (after a successful form
  // submission triggers it), so document is always available here — no SSR
  // guard needed before using createPortal.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function spin() {
    if (phase !== "ready") return;

    const index = Math.floor(Math.random() * SEGMENTS.length);
    const segment = SEGMENTS[index];
    const segmentCenter = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const target = 360 * 6 + (360 - segmentCenter);

    setPhase("spinning");
    setRotation(target);

    window.setTimeout(() => {
      setPhase("done");
      setResult(segment);
      if (!awarded.current) {
        awarded.current = true;
        recordBonus(segment.amount, "Spin the Wheel bonus");
      }
      confetti({
        particleCount: segment.rarity === "legendary" ? 200 : 120,
        spread: segment.rarity === "legendary" ? 140 : 100,
        startVelocity: segment.rarity === "legendary" ? 55 : 40,
        origin: { y: 0.5 },
        colors: ["#f59e0b", "#1d4ed8", "#10b981", "#ec4899", "#8b5cf6"],
      });
    }, 3400);
  }

  const gradient = `conic-gradient(${SEGMENTS.map(
    (s, i) => `${s.color} ${i * SEGMENT_ANGLE}deg ${(i + 1) * SEGMENT_ANGLE}deg`
  ).join(", ")})`;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-slate-900">
        <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
          🎉 Idea launched!
        </p>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Spin the wheel for a bonus XP reward
        </p>

        <div className="relative mx-auto my-6 h-64 w-64">
          <div className="absolute -top-1 left-1/2 z-10 h-0 w-0 -translate-x-1/2 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-slate-900 drop-shadow dark:border-t-slate-50" />
          <div
            className={`h-full w-full overflow-hidden rounded-full border-[6px] border-white shadow-[0_0_0_4px_rgba(0,0,0,0.05)] transition-transform dark:border-slate-800 ${
              phase === "ready" ? "animate-pulse" : ""
            }`}
            style={{
              background: gradient,
              transform: `rotate(${rotation}deg)`,
              transitionDuration: "3.4s",
              transitionTimingFunction: "cubic-bezier(0.15, 0.65, 0.1, 1)",
            }}
          >
            {SEGMENTS.map((s, index) => {
              const angle = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
              return (
                <div
                  key={s.label}
                  className="absolute inset-0 flex justify-center"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span className="mt-2.5 flex w-14 flex-col items-center text-center leading-tight text-white drop-shadow">
                    <span className="text-base">{s.emoji}</span>
                    <span className="text-[9px] font-bold">{s.label}</span>
                  </span>
                </div>
              );
            })}
          </div>

          {phase === "ready" ? (
            <button
              onClick={spin}
              className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-violet-600 to-fuchsia-600 text-[11px] font-black uppercase tracking-tight text-white shadow-lg transition-transform hover:scale-110 active:scale-95 dark:border-slate-900"
            >
              Spin!
            </button>
          ) : (
            <div className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-100 bg-white text-lg shadow dark:border-slate-700 dark:bg-slate-900">
              🎡
            </div>
          )}
        </div>

        {phase === "done" && result ? (
          <div className="animate-pop-in">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${RARITY_STYLES[result.rarity].className}`}
            >
              {RARITY_STYLES[result.rarity].label}
            </span>
            <p className="mt-1 text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {result.emoji} +{result.amount} Bonus XP!
            </p>
            <button
              onClick={onDone}
              className="mt-5 w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
            >
              Awesome!
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {phase === "spinning" ? "Spinning…" : "Tap the wheel to spin!"}
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}
