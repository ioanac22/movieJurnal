import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { searchMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  // 1. Doar userii logați pot căuta (protejăm cota TMDB)
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }

  // 2. Citim și validăm parametrul
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Query prea scurt" }, { status: 400 });
  }

  // 3. Interogăm TMDB
  try {
    const movies = await searchMovies(query);
    return NextResponse.json({ movies });
  } catch (err) {
    console.error("Eroare TMDB:", err);
    return NextResponse.json({ error: "Căutarea a eșuat" }, { status: 502 });
  }
}