"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ArrowRight,
  Lightbulb,
  LayoutGrid,
  Search,
  ThumbsUp,
  Trophy,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CATEGORY_META } from "@/lib/category-meta";
import { CATEGORIES, type Idea } from "@/lib/types";
import IdeaCard from "./idea-card";
import StatTile from "./stat-tile";

type SortMode = "newest" | "top";

export default function IdeasBoard({
  initialIdeas,
}: {
  initialIdeas: Idea[];
}) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");

  useEffect(() => {
    const channel = supabase
      .channel("ideas-feed")
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

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const idea of ideas) {
      map.set(idea.category, (map.get(idea.category) ?? 0) + 1);
    }
    return map;
  }, [ideas]);

  const totalVotes = useMemo(
    () => ideas.reduce((sum, idea) => sum + idea.votes, 0),
    [ideas]
  );

  const overallRanking = useMemo(() => {
    const map = new Map<string, 1 | 2 | 3>();
    const contenders = [...ideas]
      .filter((idea) => idea.votes > 0)
      .sort(
        (a, b) =>
          b.votes - a.votes ||
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    contenders.slice(0, 3).forEach((idea, index) => {
      map.set(idea.id, (index + 1) as 1 | 2 | 3);
    });
    return map;
  }, [ideas]);

  const visibleIdeas = useMemo(() => {
    let result = ideas;
    if (category !== "All") {
      result = result.filter((idea) => idea.category === category);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (idea) =>
          idea.title.toLowerCase().includes(q) ||
          idea.description.toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) =>
      sort === "top"
        ? b.votes - a.votes
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [ideas, category, query, sort]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile icon={Lightbulb} label="Ideas submitted" value={ideas.length} />
        <StatTile
          icon={LayoutGrid}
          label="Categories active"
          value={counts.size}
        />
        <StatTile icon={ThumbsUp} label="Total votes cast" value={totalVotes} />
      </div>

      <Link
        href="/dashboard"
        className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/70"
      >
        <span className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          See who&apos;s winning on the Dashboard
        </span>
        <ArrowRight className="h-4 w-4" />
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ideas…"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
          <label htmlFor="sort" className="text-slate-500 dark:text-slate-400">
            Sort:
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="newest">Newest</option>
            <option value="top">Most upvoted</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("All")}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            category === "All"
              ? "border-blue-700 bg-blue-700 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          All <span className="opacity-70">({ideas.length})</span>
        </button>
        {CATEGORIES.map((c) => {
          const isActive = category === c;
          const count = counts.get(c) ?? 0;
          const meta = CATEGORY_META[c];
          const Icon = meta.icon;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? meta.active
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {c} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {visibleIdeas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {ideas.length === 0
            ? "No ideas yet. Be the first to submit one!"
            : "No ideas match your filters."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              rank={overallRanking.get(idea.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
