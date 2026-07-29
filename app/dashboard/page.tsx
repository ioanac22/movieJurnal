import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTrendingMovies } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const trending = await getTrendingMovies();

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex gap-3 mb-10">
        <Link href="/search" className="px-5 py-2 rounded-full bg-surface-hi hover:bg-blush hover:text-ink transition-colors text-sm">
          Search
        </Link>
        <Link href="/watchlist" className="px-5 py-2 rounded-full bg-surface-hi hover:bg-lavender hover:text-ink transition-colors text-sm">
          My watchlist
        </Link>
      </div>

      <h2 className="text-2xl font-semibold mb-1">Trending this week</h2>
      <p className="text-sm text-muted mb-6">Popular right now — add anything that looks good.</p>
      <MovieGrid movies={trending} />
    </main>
  );
}