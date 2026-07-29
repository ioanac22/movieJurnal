import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuizClient from "@/components/QuizClient";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  const { entryId } = await params;   // Next 16: params is a Promise
  const { userId } = await auth();
  if (!userId) redirect("/");

  const entry = await prisma.journalEntry.findFirst({
    where: { id: entryId, userId },
    include: { movie: true },
  });

  if (!entry) notFound();

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <QuizClient entryId={entry.id} title={entry.movie.title} />
    </main>
  );
}