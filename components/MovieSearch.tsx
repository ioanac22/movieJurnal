"use client";

import { useState } from "react";
import Image from "next/image";
import type { MovieResult } from "@/lib/tmdb";

export default function MovieSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState<number[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.movies ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(movie: MovieResult) {
    const res = await fetch("/api/movies/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movie),
    });
    if (res.ok) setAdded((prev) => [...prev, movie.tmdbId]);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută un film..."
          className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-100 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-zinc-100 text-zinc-900 disabled:opacity-50"
        >
          {loading ? "Caut..." : "Caută"}
        </button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {results.map((movie) => (
          <div key={movie.tmdbId} className="rounded-lg overflow-hidden bg-zinc-900">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                width={342}
                height={513}
                className="w-full h-auto"
              />
            ) : (
              <div className="aspect-[2/3] bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
                fără poster
              </div>
            )}
            <div className="p-3">
              <h3 className="text-sm font-medium text-zinc-100">{movie.title}</h3>
              <p className="text-xs text-zinc-400 mb-2">{movie.releaseYear ?? "—"}</p>
              <button
                onClick={() => handleAdd(movie)}
                disabled={added.includes(movie.tmdbId)}
                className="w-full text-xs py-1.5 rounded bg-zinc-700 text-zinc-100 disabled:opacity-40"
              >
                {added.includes(movie.tmdbId) ? "✓ Adăugat" : "+ Jurnal"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}