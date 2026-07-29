import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export type PublicUser = {
  id: string;
  username: string;
  imageUrl: string;
};

// Clerk owns users, so we fetch display data from Clerk by id
export async function getUsersByIds(ids: string[]): Promise<PublicUser[]> {
  if (ids.length === 0) return [];
  const client = await clerkClient();
  const { data } = await client.users.getUserList({ userId: ids, limit: 100 });

  return data.map((u) => ({
    id: u.id,
    username: u.username ?? u.firstName ?? "user",
    imageUrl: u.imageUrl,
  }));
}

// Returns the Clerk ids of everyone this user is friends with
export async function getFriendIds(userId: string): Promise<string[]> {
  const rows = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
  });

  return rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId));
}

export async function areFriends(a: string, b: string): Promise<boolean> {
  const row = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: a, addresseeId: b },
        { requesterId: b, addresseeId: a },
      ],
    },
  });
  return !!row;
}