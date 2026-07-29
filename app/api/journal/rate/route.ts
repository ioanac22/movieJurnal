import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entryId, rating, review } = await request.json();

  const entry = await prisma.journalEntry.findFirst({ where: { id: entryId, userId } });
  if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

  // The gate: rating is impossible without passing the quiz
  if (!entry.quizPassed) {
    return NextResponse.json({ error: "Quiz not passed" }, { status: 403 });
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  await prisma.journalEntry.update({
    where: { id: entry.id },
    data: { rating, review: review || null },
  });

  return NextResponse.json({ ok: true });
}