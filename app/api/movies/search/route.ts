import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { searchMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  try {
    const movies = await searchMovies(query);
    return NextResponse.json({ movies });
  } catch (err) {
    console.error("TMDB error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }
}