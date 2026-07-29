import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  const client = await clerkClient();
  const { data } = await client.users.getUserList({ query, limit: 10 });

  const users = data
    .filter((u) => u.id !== userId) // don't show yourself
    .map((u) => ({
      id: u.id,
      username: u.username ?? u.firstName ?? "user",
      imageUrl: u.imageUrl,
    }));

  return NextResponse.json({ users });
}