import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MovieSearch from "@/components/MovieSearch";

export default async function SearchPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return <MovieSearch />;
}