import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignUpButton } from "@clerk/nextjs";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen">
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <p className="text-sm tracking-[0.2em] uppercase text-lavender mb-6">
          Your film diary
        </p>

        <h1 className="text-5xl md:text-7xl font-semibold leading-[1.05] mb-8">
          Your personal journal
          <br />
          <span className="text-blush">of everything you watch.</span>
        </h1>

        <p className="text-lg text-muted max-w-xl mx-auto mb-12 leading-relaxed">
          Keep track of the films and series you love, remember what you thought
          of them, and see what the people close to you are watching.
        </p>

        {userId ? (
          <Link
            href="/watchlist"
            className="inline-block px-8 py-3.5 rounded-full bg-blush text-ink font-medium hover:bg-apricot transition-colors"
          >
            Open your journal
          </Link>
        ) : (
          <SignUpButton mode="modal">
            <button className="px-8 py-3.5 rounded-full bg-blush text-ink font-medium hover:bg-apricot transition-colors cursor-pointer">
              Start your journal
            </button>
          </SignUpButton>
        )}
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-28">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              step: "01",
              title: "Collect",
              body: "Build your watchlist from thousands of films, series and documentaries.",
              accent: "text-blush",
            },
            {
              step: "02",
              title: "Remember",
              body: "Rate what you've seen and write down what stayed with you.",
              accent: "text-lavender",
            },
            {
              step: "03",
              title: "Share",
              body: "Follow friends and discover what they're watching next.",
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
        Flickpick — keep track of what you watch
      </footer>
    </main>
  );
}