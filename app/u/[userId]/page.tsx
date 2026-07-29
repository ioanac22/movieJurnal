import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { areFriends, getUsersByIds } from "@/lib/friends";

export default async function FriendProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId: targetId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/");

  // Reviews are visible to friends only — checked on the server
  const allowed = targetId === userId || (await areFriends(userId, targetId));
  if (!allowed) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-muted">You need to be friends to see this profile.</p>
      </main>
    );
  }

  const [user] = await getUsersByIds([targetId]);
  if (!user) notFound();

  const reviewed = await prisma.journalEntry.findMany({
    where: { userId: targetId, quizPassed: true, rating: { not: null } },
    include: { movie: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-10">
        <Image
          src={user.imageUrl}
          alt={user.username}
          width={64}
          height={64}
          className="rounded-full"
        />
        <div>
          <h1 className="text-2xl font-semibold">{user.username}</h1>
          <p className="text-sm text-muted">
            {reviewed.length} verified {reviewed.length === 1 ? "film" : "films"}
          </p>
        </div>
      </div>

      {reviewed.length === 0 && <p className="text-sm text-muted">No reviews yet.</p>}

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