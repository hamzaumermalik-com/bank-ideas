import { getIdeas } from "@/lib/ideas";
import Header from "@/components/header";
import Leaderboard from "@/components/leaderboard";

export default async function DashboardPage() {
  const ideas = await getIdeas();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            Winners Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
            See which ideas are leading the pack — and exactly why
            they&apos;re winning.
          </p>
        </div>
        <Leaderboard initialIdeas={ideas} />
      </main>
    </div>
  );
}
