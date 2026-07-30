import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDetails, type MediaType } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = request.nextUrl.searchParams;
  const id = Number(sp.get("id"));
  const mediaType = (sp.get("type") === "tv" ? "tv" : "movie") as MediaType;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const details = await getDetails(id, mediaType);
    return NextResponse.json({ details });
  } catch (err) {
    console.error("Details failed:", err);
    return NextResponse.json({ error: "Details failed" }, { status: 502 });
  }
}