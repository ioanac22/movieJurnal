import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignUpButton } from "@clerk/nextjs";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <p className="text-sm tracking-[0.2em] uppercase text-lavender mb-6">
          Movie journal
        </p>

        <h1 className="text-5xl md:text-7xl font-semibold leading-[1.05] mb-8">
          Anyone can rate a film.
          <br />
          <span className="text-blush">Prove you watched it.</span>
        </h1>

        <p className="text-lg text-muted max-w-xl mx-auto mb-12 leading-relaxed">
          Flickpick asks you five questions about scenes, dialogue and details
          you can only know from watching. Score 4 out of 5 and your rating
          unlocks.
        </p>

        {userId ? (
          <Link
            href="/search"
            className="inline-block px-8 py-3.5 rounded-full bg-blush text-ink font-medium hover:bg-apricot transition-colors"
          >
            Go to your journal
          </Link>
        ) : (
          <SignUpButton mode="modal">
            <button className="px-8 py-3.5 rounded-full bg-blush text-ink font-medium hover:bg-apricot transition-colors cursor-pointer">
              Start your journal
            </button>
          </SignUpButton>
        )}
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 pb-28">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              step: "01",
              title: "Add a film",
              body: "Search millions of titles and drop them into your journal.",
              accent: "text-blush",
            },
            {
              step: "02",
              title: "Take the quiz",
              body: "AI writes five questions about specific scenes — not trivia you could google.",
              accent: "text-lavender",
            },
            {
              step: "03",
              title: "Unlock your rating",
              body: "Pass and you can rate and review. Answers are checked on the server.",
              accent: "text-apricot",
            },
          ].map((card) => (
            <div
              key={card.step}
              className="rounded-2xl bg-surface p-7 hover:bg-surface-hi transition-colors"
            >
              <span className={`text-xs font-mono ${card.accent}`}>{card.step}</span>
              <h3 className="text-xl font-medium mt-3 mb-2">{card.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-surface-hi py-8 text-center text-sm text-muted">
        Flickpick — built with Next.js, Clerk, Prisma & Gemini
      </footer>
    </main>
  );
}