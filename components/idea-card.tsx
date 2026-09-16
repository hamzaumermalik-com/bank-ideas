"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import confetti from "canvas-confetti";
import { Bot, ChevronUp, Clock, User } from "lucide-react";
import { voteIdea } from "@/app/actions";
import type { Idea } from "@/lib/types";
import { recordVote, registerVoteCombo } from "@/lib/game";
import CategoryBadge from "./category-badge";
import RankBadge from "./rank-badge";

function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

type Popup = { id: number; text: string };

export default function IdeaCard({
  idea,
  rank,
}: {
  idea: Idea;
  rank?: 1 | 2 | 3;
}) {
  const [votes, addOptimisticVote] = useOptimistic(
    idea.votes,
    (state: number, amount: number) => state + amount
  );
  const [isPending, startTransition] = useTransition();
  const [popups, setPopups] = useState<Popup[]>([]);
  const popupId = useRef(0);
  const isLeader = rank === 1;

  function handleVote(event: React.MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const combo = registerVoteCombo();

    confetti({
      particleCount: isLeader ? 90 : 40,
      spread: isLeader ? 80 : 55,
      startVelocity: isLeader ? 45 : 32,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: rect.top / window.innerHeight,
      },
      colors: ["#1d4ed8", "#10b981", "#f59e0b"],
    });

    const id = popupId.current++;
    const text = combo > 1 ? `+2 XP · Combo x${combo}!` : "+2 XP";
    setPopups((current) => [...current, { id, text }]);
    window.setTimeout(() => {
      setPopups((current) => current.filter((p) => p.id !== id));
    }, 800);

    startTransition(async () => {
      addOptimisticVote(1);
      recordVote();
      await voteIdea(idea.id);
    });
  }

  function handleAskAi() {
    window.dispatchEvent(
      new CustomEvent("bank-ideas:ask-ai", {
        detail: {
          prompt: `Check this idea for originality and banking feasibility: "${idea.title}" — ${idea.description}`,
        },
      })
    );
  }

  return (
    <article
      className={`group relative flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:bg-slate-900 dark:hover:border-blue-900 ${
        rank
          ? "border-amber-200 ring-1 ring-amber-100 dark:border-amber-900 dark:ring-amber-950"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      {rank && (
        <div className="absolute -left-2.5 -top-2.5">
          <RankBadge rank={rank} size="sm" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <CategoryBadge category={idea.category} />
        <span
          className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs text-slate-400"
          suppressHydrationWarning
        >
          <Clock className="h-3 w-3" />
          {timeAgo(idea.created_at)}
        </span>
      </div>

      <h3 className="text-base font-semibold leading-snug text-slate-900 dark:text-slate-50">
        {idea.title}
      </h3>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {idea.description}
      </p>

      <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {idea.submitted_by}
          </span>
          <button
            onClick={handleAskAi}
            title="Ask the AI assistant about this idea"
            aria-label="Ask the AI assistant about this idea"
            className="flex items-center gap-1 rounded-full border border-violet-200 px-2 py-0.5 text-violet-600 transition-colors hover:bg-violet-50 dark:border-violet-900 dark:text-violet-400 dark:hover:bg-violet-950"
          >
            <Bot className="h-3 w-3" />
            Ask AI
          </button>
        </span>
        <div className="relative">
          {popups.map((popup) => (
            <span
              key={popup.id}
              className="animate-float-up pointer-events-none absolute -top-1 right-0 whitespace-nowrap text-xs font-bold text-emerald-600 dark:text-emerald-400"
            >
              {popup.text}
            </span>
          ))}
          <button
            onClick={handleVote}
            disabled={isPending}
            aria-label="Upvote this idea"
            className="flex items-center gap-1 rounded-full border border-slate-200 py-1 pl-2 pr-3 text-xs font-semibold text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-90 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:bg-blue-950"
          >
            <ChevronUp className="h-4 w-4" />
            {votes}
          </button>
        </div>
      </div>
    </article>
  );
}
