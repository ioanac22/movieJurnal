import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getFriendIds, getUsersByIds, type PublicUser } from "@/lib/friends";
import FriendsClient from "@/components/FriendsClient";

export default async function FriendsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const friendIds = await getFriendIds(userId);
  const friends = await getUsersByIds(friendIds);

  const pendingRows = await prisma.friendship.findMany({
    where: { addresseeId: userId, status: "PENDING" },
  });

  const requesters = await getUsersByIds(pendingRows.map((r) => r.requesterId));

  const incoming = pendingRows
    .map((r) => {
      const user = requesters.find((u) => u.id === r.requesterId);
      return user ? { friendshipId: r.id, user } : null;
    })
    .filter((x): x is { friendshipId: string; user: PublicUser } => x !== null);

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold mb-10">Friends</h1>
      <FriendsClient friends={friends} incoming={incoming} />
    </main>
  );
}