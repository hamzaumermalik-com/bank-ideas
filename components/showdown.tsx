"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Swords, Trophy } from "lucide-react";
import { voteIdea } from "@/app/actions";
import { recordVote } from "@/lib/game";
import type { Idea } from "@/lib/types";
import CategoryBadge from "./category-badge";

type Phase = "picking" | "result";

function pickRandomPair(pool: Idea[]): [Idea, Idea] | null {
  if (pool.length < 2) return null;
  const a = Math.floor(Math.random() * pool.length);
  let b = Math.floor(Math.random() * pool.length);
  while (b === a) {
    b = Math.floor(Math.random() * pool.length);
  }
  return [pool[a], pool[b]];
}

function firstPair(pool: Idea[]): [Idea, Idea] | null {
  // Deterministic (not random) so server and client render the same initial
  // matchup — avoids a hydration mismatch. Every later round (triggered by a
  // click, after mount) is free to use pickRandomPair().
  if (pool.length < 2) return null;
  return [pool[0], pool[1]];
}

export default function Showdown({ initialIdeas }: { initialIdeas: Idea[] }) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [pair, setPair] = useState<[Idea, Idea] | null>(() =>
    firstPair(initialIdeas)
  );
  const [phase, setPhase] = useState<Phase>("picking");
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const nextRound = useCallback((pool: Idea[]) => {
    setPair(pickRandomPair(pool));
    setPhase("picking");
    setWinnerId(null);
    setRound((r) => r + 1);
  }, []);

  function handlePick(event: React.MouseEvent<HTMLButtonElement>, winner: Idea) {
    if (phase !== "picking") return;

    const rect = event.currentTarget.getBoundingClientRect();
    setPhase("result");
    setWinnerId(winner.id);

    confetti({
      particleCount: 100,
      spread: 90,
      startVelocity: 45,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ["#8b5cf6", "#ec4899", "#f59e0b"],
    });

    const updated = ideas.map((idea) =>
      idea.id === winner.id ? { ...idea, votes: idea.votes + 1 } : idea
    );
    setIdeas(updated);
    recordVote();

    voteIdea(winner.id).catch(() => {
      // best-effort; local state already reflects the pick for gameplay flow
    });

    timerRef.current = window.setTimeout(() => {
      nextRound(updated);
    }, 1500);
  }

  if (!pair) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        You need at least 2 ideas on the board to play Showdown. Head to the{" "}
        <Link href="/" className="font-medium text-blue-600 dark:text-blue-400">
          Ideas feed
        </Link>{" "}
        and submit one!
      </div>
    );
  }

  const [left, right] = pair;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
        <Trophy className="h-4 w-4 text-amber-500" />
        Round {round}
      </div>

      <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <FighterCard
          idea={left}
          onPick={(e) => handlePick(e, left)}
          state={
            phase === "picking"
              ? "idle"
              : winnerId === left.id
                ? "winner"
                : "loser"
          }
        />

        <div className="flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-sm font-black text-white shadow-lg">
            VS
          </span>
        </div>

        <FighterCard
          idea={right}
          onPick={(e) => handlePick(e, right)}
          state={
            phase === "picking"
              ? "idle"
              : winnerId === right.id
                ? "winner"
                : "loser"
          }
        />
      </div>

      <p className="text-center text-xs text-slate-400">
        Click an idea to cast your vote for it. Next round starts
        automatically.
      </p>
    </div>
  );
}

function FighterCard({
  idea,
  onPick,
  state,
}: {
  idea: Idea;
  onPick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  state: "idle" | "winner" | "loser";
}) {
  return (
    <button
      onClick={onPick}
      disabled={state !== "idle"}
      className={`group relative flex w-full flex-col gap-3 rounded-2xl border-2 bg-white p-6 text-left shadow-sm transition-all duration-300 dark:bg-slate-900 ${
        state === "winner"
          ? "scale-105 border-amber-400 shadow-xl shadow-amber-200/50 dark:shadow-amber-900/30"
          : state === "loser"
            ? "scale-95 border-slate-200 opacity-40 grayscale dark:border-slate-800"
            : "border-slate-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg dark:border-slate-800 dark:hover:border-violet-800"
      }`}
    >
      {state === "winner" && (
        <span className="absolute -right-3 -top-3 flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-amber-950 shadow-lg">
          🏆 WINNER
        </span>
      )}
      {state === "loser" && (
        <span className="absolute -right-3 -top-3 flex items-center gap-1 rounded-full bg-slate-700 px-3 py-1 text-xs font-black text-white shadow-lg">
          K.O.
        </span>
      )}

      <CategoryBadge category={idea.category} />
      <h3 className="text-lg font-bold leading-snug text-slate-900 dark:text-slate-50">
        {idea.title}
      </h3>
      <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
        {idea.description}
      </p>
      <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
        <span>— {idea.submitted_by}</span>
        <span className="flex items-center gap-1 font-semibold text-violet-600 dark:text-violet-400">
          <Swords className="h-3.5 w-3.5" />
          Power {idea.votes}
        </span>
      </div>
    </button>
  );
}
