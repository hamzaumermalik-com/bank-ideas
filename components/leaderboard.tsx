"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, Lightbulb, ThumbsUp, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CATEGORY_META } from "@/lib/category-meta";
import { CATEGORIES, type Category, type Idea } from "@/lib/types";
import CategoryBadge from "./category-badge";
import RankBadge from "./rank-badge";
import StatTile from "./stat-tile";

function rankSort(a: Idea, b: Idea) {
  return (
    b.votes - a.votes ||
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

function describeRank(
  idea: Idea,
  rank: 1 | 2 | 3,
  leaderVotes: number,
  runnerUpVotes?: number
) {
  const vote = (n: number) => `${n} vote${n === 1 ? "" : "s"}`;

  if (rank === 1) {
    if (runnerUpVotes === undefined) {
      return `Unchallenged leader with ${vote(idea.votes)}`;
    }
    const margin = idea.votes - runnerUpVotes;
    return margin > 0
      ? `Leading by ${margin} vote${margin === 1 ? "" : "s"}`
      : "Tied for the lead";
  }

  const behind = leaderVotes - idea.votes;
  return behind > 0
    ? `${vote(behind)} behind the leader`
    : "Tied with the leader";
}

function PodiumCard({
  idea,
  rank,
  description,
  className = "",
}: {
  idea: Idea;
  rank: 1 | 2 | 3;
  description: string;
  className?: string;
}) {
  const ringByRank: Record<1 | 2 | 3, string> = {
    1: "ring-amber-300 dark:ring-amber-700",
    2: "ring-slate-300 dark:ring-slate-600",
    3: "ring-amber-800/40 dark:ring-amber-900",
  };

  return (
    <div
      className={`flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm ring-2 dark:border-slate-800 dark:bg-slate-900 ${ringByRank[rank]} ${className}`}
    >
      <RankBadge rank={rank} />
      <div className="mt-3">
        <CategoryBadge category={idea.category} />
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
        {idea.title}
      </p>
      <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-50">
        {idea.votes}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        vote{idea.votes === 1 ? "" : "s"}
      </p>
      <p className="mt-2 text-xs font-medium text-blue-700 dark:text-blue-300">
        {description}
      </p>
      <p className="mt-3 text-xs text-slate-400">— {idea.submitted_by}</p>
    </div>
  );
}

function Podium({ top3 }: { top3: Idea[] }) {
  const [first, second, third] = top3;
  const runnerUpVotes = second?.votes;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
      {second && (
        <PodiumCard
          idea={second}
          rank={2}
          description={describeRank(second, 2, first.votes)}
          className="sm:order-1"
        />
      )}
      <PodiumCard
        idea={first}
        rank={1}
        description={describeRank(first, 1, first.votes, runnerUpVotes)}
        className="sm:order-2 sm:-mt-6 sm:pb-8 sm:pt-7"
      />
      {third && (
        <PodiumCard
          idea={third}
          rank={3}
          description={describeRank(third, 3, first.votes)}
          className="sm:order-3"
        />
      )}
    </div>
  );
}

export default function Leaderboard({
  initialIdeas,
}: {
  initialIdeas: Idea[];
}) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);

  useEffect(() => {
    const channel = supabase
      .channel("leaderboard-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ideas" },
        (payload) => {
          setIdeas((current) => {
            if (current.some((idea) => idea.id === payload.new.id)) {
              return current;
            }
            return [payload.new as Idea, ...current];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "ideas" },
        (payload) => {
          setIdeas((current) =>
            current.map((idea) =>
              idea.id === payload.new.id ? (payload.new as Idea) : idea
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const contenders = useMemo(
    () => [...ideas].filter((idea) => idea.votes > 0).sort(rankSort),
    [ideas]
  );
  const top3 = contenders.slice(0, 3);
  const rest = contenders.slice(3);

  const totalVotes = useMemo(
    () => ideas.reduce((sum, idea) => sum + idea.votes, 0),
    [ideas]
  );

  const champions = useMemo(() => {
    const map = new Map<Category, Idea>();
    for (const category of CATEGORIES) {
      const inCategory = ideas
        .filter((idea) => idea.category === category && idea.votes > 0)
        .sort(rankSort);
      if (inCategory.length > 0) {
        map.set(category, inCategory[0]);
      }
    }
    return map;
  }, [ideas]);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile icon={Lightbulb} label="Ideas submitted" value={ideas.length} />
        <StatTile icon={ThumbsUp} label="Total votes cast" value={totalVotes} />
        <StatTile
          icon={Trophy}
          label="Ideas with votes"
          value={contenders.length}
        />
      </div>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
          <Trophy className="h-5 w-5 text-amber-500" />
          Top Ideas
        </h2>
        {top3.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No votes yet — head to the Ideas feed and cast the first vote to
            crown a winner!
          </div>
        ) : (
          <Podium top3={top3} />
        )}
      </section>

      {champions.size > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <Flame className="h-5 w-5 text-rose-500" />
            Category Champions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.filter((category) => champions.has(category)).map(
              (category) => {
                const idea = champions.get(category)!;
                const meta = CATEGORY_META[category];
                const Icon = meta.icon;
                return (
                  <div
                    key={category}
                    className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${meta.iconWrap}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      Top in {category}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {idea.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {idea.votes} vote{idea.votes === 1 ? "" : "s"} —
                      leading this category
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
            Full Leaderboard
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Rank</th>
                  <th className="px-4 py-3 font-medium">Idea</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 text-right font-medium">Votes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rest.map((idea, index) => (
                  <tr key={idea.id} className="bg-white dark:bg-slate-950">
                    <td className="px-4 py-3 font-semibold text-slate-400">
                      #{index + 4}
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                      {idea.title}
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={idea.category} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                      {idea.votes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
