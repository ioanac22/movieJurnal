import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function WatchlistPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    include: { movie: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold mb-2">My watchlist</h1>
      <p className="text-sm text-muted mb-8">
        {entries.length} {entries.length === 1 ? "film" : "films"} saved
      </p>

      {entries.length === 0 && (
        <p className="text-muted">
          Nothing yet.{" "}
          <Link href="/dashboard" className="text-blush hover:underline">
            Browse trending films
          </Link>
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-xl overflow-hidden bg-surface">
            {entry.movie.posterPath ? (
              <Image
                src={entry.movie.posterPath}
                alt={entry.movie.title}
                width={342}
                height={513}
                className="w-full h-auto"
              />
            ) : (
              <div className="aspect-[2/3] bg-surface-hi flex items-center justify-center text-muted text-xs">
                no poster
              </div>
            )}
            <div className="p-3">
              <h3 className="text-sm font-medium line-clamp-1">{entry.movie.title}</h3>
              <p className="text-xs text-muted mb-2">{entry.movie.releaseYear ?? "—"}</p>

              {entry.quizPassed ? (
                <div className="text-xs py-1.5 text-center rounded-full bg-lavender/20 text-lavender">
                  ✓ Verified {entry.rating ? `· ${entry.rating}★` : ""}
                </div>
              ) : (
                <Link
                  href={`/quiz/${entry.id}`}
                  className="block text-xs py-1.5 text-center rounded-full bg-surface-hi hover:bg-blush hover:text-ink transition-colors"
                >
                  I watched it
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}