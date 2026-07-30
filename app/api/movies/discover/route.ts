import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { discover, type MediaType } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = request.nextUrl.searchParams;
  const mediaType = (sp.get("type") === "tv" ? "tv" : "movie") as MediaType;
  const genreParam = sp.get("genre");
  const genreId = genreParam ? Number(genreParam) : null;
  const page = Number(sp.get("page") ?? "1");

  try {
    const movies = await discover({ mediaType, genreId, page });
    return NextResponse.json({ movies });
  } catch (err) {
    console.error("Discover failed:", err);
    return NextResponse.json({ error: "Discover failed" }, { status: 502 });
  }
}