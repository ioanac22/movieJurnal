import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }

  const body = await request.json();
  const { tmdbId, title, overview, posterUrl, releaseYear } = body;

  if (!tmdbId || !title) {
    return NextResponse.json({ error: "Date lipsă" }, { status: 400 });
  }

  // 1. Filmul există deja în DB? Dacă nu, îl creăm.
  //    upsert = "update sau insert" — o singură interogare, fără race conditions.
  const movie = await prisma.movie.upsert({
    where: { tmdbId },
    update: {},
    create: {
      tmdbId,
      title,
      overview: overview || null,
      posterPath: posterUrl || null,
      releaseYear: releaseYear || null,
    },
  });

  // 2. Legăm filmul de user. Dacă există deja, nu duplicăm.
  const entry = await prisma.journalEntry.upsert({
    where: { userId_movieId: { userId, movieId: movie.id } },
    update: {},
    create: { userId, movieId: movie.id },
  });

  return NextResponse.json({ entry, movie });
}