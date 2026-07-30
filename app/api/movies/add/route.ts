import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tmdbId, title, overview, posterUrl, releaseYear, mediaType } =
    await request.json();

  if (!tmdbId || !title) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const type = mediaType === "tv" ? "tv" : "movie";

  const movie = await prisma.movie.upsert({
    where: { tmdbId_mediaType: { tmdbId, mediaType: type } },
    update: {},
    create: {
      tmdbId,
      mediaType: type,
      title,
      overview: overview || null,
      posterPath: posterUrl || null,
      releaseYear: releaseYear || null,
    },
  });

  const entry = await prisma.journalEntry.upsert({
    where: { userId_movieId: { userId, movieId: movie.id } },
    update: {},
    create: { userId, movieId: movie.id },
  });

  return NextResponse.json({ entry, movie });
}