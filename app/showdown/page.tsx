import { getIdeas } from "@/lib/ideas";
import Header from "@/components/header";
import Showdown from "@/components/showdown";

export default async function ShowdownPage() {
  const ideas = await getIdeas();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            ⚔️ Idea Showdown
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-slate-600 dark:text-slate-400">
            Two ideas enter, one gets your vote. Pick the one you&apos;d
            rather see happen — as many rounds as you like.
          </p>
        </div>
        <Showdown initialIdeas={ideas} />
      </main>
    </div>
  );
}
