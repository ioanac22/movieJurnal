import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { askGemini, parseJsonSafe } from "@/lib/gemini";

type GeneratedQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

const SYSTEM = `You write quizzes that verify someone actually watched a film.

RULES:
- Questions must be about specific scenes, dialogue, visual details, character actions, or plot twists.
- NEVER ask about facts findable without watching: director, release year, cast, awards, box office, general premise.
- A person who only read the synopsis must fail.
- Each question must cover a DIFFERENT moment in the film. Never ask about the same event twice.
- Exactly 4 options per question, exactly one correct.
- Wrong options must be plausible, not absurd.
- Output valid JSON only.`;

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { entryId } = await request.json();
  if (!entryId) {
    return NextResponse.json({ error: "Missing entryId" }, { status: 400 });
  }

  const entry = await prisma.journalEntry.findFirst({
    where: { id: entryId, userId },
    include: { movie: true },
  });

  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const existing = await prisma.quizQuestion.findMany({
    where: { movieId: entry.movieId },
    orderBy: { order: "asc" },
    take: 5,
    select: { id: true, question: true, options: true, order: true },
  });

  if (existing.length >= 5) {
    return NextResponse.json({ questions: existing });
  }

  const prompt = `Film: "${entry.movie.title}" (${entry.movie.releaseYear ?? "unknown year"})

Write 5 questions verifying the viewer actually watched this film. Each must cover a different moment.

Return JSON in this exact shape:
{"questions":[{"question":"...","options":["a","b","c","d"],"correctIndex":0}]}`;

  try {
    const raw = await askGemini(prompt, {
      systemInstruction: SYSTEM,
      json: true,
      temperature: 0.9,
    });

    const parsed = parseJsonSafe<{ questions: GeneratedQuestion[] }>(raw);
    const questions = parsed.questions.slice(0, 5);

    if (questions.length < 5) {
      return NextResponse.json({ error: "Generation incomplete" }, { status: 502 });
    }

    await prisma.quizQuestion.createMany({
      data: questions.map((q, i) => ({
        movieId: entry.movieId,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        order: i,
      })),
    });

    const saved = await prisma.quizQuestion.findMany({
      where: { movieId: entry.movieId },
      orderBy: { order: "asc" },
      take: 5,
      select: { id: true, question: true, options: true, order: true },
    });

    return NextResponse.json({ questions: saved });
  } catch (err) {
    console.error("Quiz generation failed:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 502 });
  }
}