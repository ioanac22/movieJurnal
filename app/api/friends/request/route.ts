import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetId } = await request.json();

  if (!targetId || targetId === userId) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: userId, addresseeId: targetId },
        { requesterId: targetId, addresseeId: userId },
      ],
    },
  });

  if (existing) {
    // They already asked us — accept instead of creating a duplicate
    if (existing.addresseeId === userId && existing.status === "PENDING") {
      await prisma.friendship.update({
        where: { id: existing.id },
        data: { status: "ACCEPTED" },
      });
      return NextResponse.json({ status: "ACCEPTED" });
    }
    return NextResponse.json({ status: existing.status });
  }

  await prisma.friendship.create({
    data: { requesterId: userId, addresseeId: targetId },
  });

  return NextResponse.json({ status: "PENDING" });
}