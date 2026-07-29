"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Question = { id: string; question: string; options: string[]; order: number };
type Result = { passed: boolean; score: number; total: number; threshold: number };

export default function QuizClient({ entryId, title }: { entryId: string; title: string }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  useEffect(() => {
    fetch("/api/quiz/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId }),
    })
      .then((r) => r.json())
      .then((d) => (d.questions ? setQuestions(d.questions) : setError(d.error ?? "Failed")))
      .catch(() => setError("Could not generate the quiz"));
  }, [entryId]);

  async function submit() {
    const ordered = questions.map((_, i) => answers[i] ?? -1);
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId, answers: ordered }),
    });
    setResult(await res.json());
  }

  async function saveRating() {
    await fetch("/api/journal/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId, rating, review }),
    });
    router.push("/watchlist");
  }

  if (error) return <p className="text-blush">{error}</p>;
  if (!questions.length) return <p className="text-muted">Writing your questions…</p>;

  if (result) {
    return (
      <div className="max-w-lg">
        <h2 className="text-3xl font-semibold mb-3">
          {result.passed ? "Verified ✓" : "Not quite"}
        </h2>
        <p className="text-muted mb-8">
          You scored {result.score} out of {result.total}. You need {result.threshold}.
        </p>

        {result.passed ? (
          <div className="space-y-5">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`w-11 h-11 rounded-full transition-colors cursor-pointer ${
                    n <= rating ? "bg-blush text-ink" : "bg-surface-hi"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write a review (optional)"
              rows={4}
              className="w-full p-4 rounded-xl bg-surface outline-none resize-none"
            />
            <button
              onClick={saveRating}
              disabled={rating === 0}
              className="px-7 py-3 rounded-full bg-blush text-ink font-medium disabled:opacity-40 cursor-pointer"
            >
              Save rating
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setResult(null); setAnswers({}); }}
            className="px-7 py-3 rounded-full bg-surface-hi hover:bg-blush hover:text-ink transition-colors cursor-pointer"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-1">{title}</h1>
      <p className="text-sm text-muted mb-10">Answer at least 4 of 5 correctly.</p>

      <div className="space-y-8">
        {questions.map((q, qi) => (
          <div key={q.id}>
            <p className="mb-3 font-medium">
              <span className="text-lavender mr-2">{qi + 1}.</span>
              {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => setAnswers((p) => ({ ...p, [qi]: oi }))}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors cursor-pointer ${
                    answers[qi] === oi ? "bg-blush text-ink" : "bg-surface hover:bg-surface-hi"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={submit}
        disabled={Object.keys(answers).length < questions.length}
        className="mt-10 px-7 py-3 rounded-full bg-blush text-ink font-medium disabled:opacity-40 cursor-pointer"
      >
        Submit answers
      </button>
    </div>
  );
}