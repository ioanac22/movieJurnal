import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DiscoverClient from "@/components/DiscoverClient";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Discover</h1>
          <p className="text-sm text-muted mt-1">
            Browse by type and genre, then add what catches your eye.
          </p>
        </div>
        <Link
          href="/search"
          className="text-sm text-muted hover:text-cream transition-colors shrink-0"
        >
          Search by title →
        </Link>
      </div>

      <DiscoverClient />
    </main>
  );
}