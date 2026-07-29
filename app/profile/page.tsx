import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    include: { movie: true },
    orderBy: { updatedAt: "desc" },
  });

  const reviewed = entries.filter((e) => e.quizPassed && e.rating);
  const pending = entries.filter((e) => !e.quizPassed);

  const avg =
    reviewed.length > 0
      ? (reviewed.reduce((s, e) => s + (e.rating ?? 0), 0) / reviewed.length).toFixed(1)
      : "—";

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Your profile</h1>
        <Link
          href="/friends"
          className="px-5 py-2 rounded-full bg-surface-hi hover:bg-lavender hover:text-ink transition-colors text-sm"
        >
          Friends
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-12">
        <div className="rounded-2xl bg-surface p-6">
          <p className="text-3xl font-semibold text-blush">{reviewed.length}</p>
          <p className="text-sm text-muted mt-1">verified</p>
        </div>
        <div className="rounded-2xl bg-surface p-6">
          <p className="text-3xl font-semibold text-lavender">{pending.length}</p>
          <p className="text-sm text-muted mt-1">to watch</p>
        </div>
        <div className="rounded-2xl bg-surface p-6">
          <p className="text-3xl font-semibold text-apricot">{avg}</p>
          <p className="text-sm text-muted mt-1">avg rating</p>
        </div>
      </div>

      <h2 className="text-xl font-medium mb-5">Your reviews</h2>

      {reviewed.length === 0 && (
        <p className="text-muted text-sm">
          No reviews yet.{" "}
          <Link href="/watchlist" className="text-blush hover:underline">
            Take a quiz
          </Link>{" "}
          to unlock rating.
        </p>
      )}

      <div className="space-y-4">
        {reviewed.map((entry) => (
          <div key={entry.id} className="flex gap-4 rounded-2xl bg-surface p-4">
            {entry.movie.posterPath && (
              <Image
                src={entry.movie.posterPath}
                alt={entry.movie.title}
                width={80}
                height={120}
                className="rounded-lg h-fit"
              />
            )}
            <div className="flex-1">
              <div className="flex items-baseline gap-3 mb-1">
                <h3 className="font-medium">{entry.movie.title}</h3>
                <span className="text-sm text-muted">{entry.movie.releaseYear}</span>
              </div>
              <p className="text-blush text-sm mb-2">
                {"★".repeat(entry.rating ?? 0)}
                <span className="text-surface-hi">
                  {"★".repeat(5 - (entry.rating ?? 0))}
                </span>
              </p>
              {entry.review && (
                <p className="text-sm text-muted leading-relaxed">{entry.review}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}