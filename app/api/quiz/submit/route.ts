import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const PASS_THRESHOLD = 4;

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { entryId, answers } = await request.json();

  if (!entryId || !Array.isArray(answers)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const entry = await prisma.journalEntry.findFirst({
    where: { id: entryId, userId },
  });

  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  if (entry.quizPassed) {
    return NextResponse.json({ passed: true, score: entry.quizScore });
  }

  const questions = await prisma.quizQuestion.findMany({
    where: { movieId: entry.movieId },
    orderBy: { order: "asc" },
    take: 5,
  });

  if (questions.length === 0) {
    return NextResponse.json({ error: "No quiz for this movie" }, { status: 400 });
  }

  let score = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.correctIndex) score++;
  });

  const passed = score >= PASS_THRESHOLD;

  await prisma.journalEntry.update({
    where: { id: entry.id },
    data: {
      quizScore: score,
      quizPassed: passed,
      quizAttempts: { increment: 1 },
    },
  });

  return NextResponse.json({
    passed,
    score,
    total: questions.length,
    threshold: PASS_THRESHOLD,
  });
}