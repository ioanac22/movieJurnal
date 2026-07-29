import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { friendshipId, accept } = await request.json();

  // Only the addressee can respond — never the sender
  const row = await prisma.friendship.findFirst({
    where: { id: friendshipId, addresseeId: userId, status: "PENDING" },
  });

  if (!row) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  if (accept) {
    await prisma.friendship.update({
      where: { id: row.id },
      data: { status: "ACCEPTED" },
    });
  } else {
    await prisma.friendship.delete({ where: { id: row.id } });
  }

  return NextResponse.json({ ok: true });
}