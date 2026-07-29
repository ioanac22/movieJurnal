"use client";

import { useState } from "react";
import Image from "next/image";
import type { MovieResult } from "@/lib/tmdb";

export default function MovieGrid({ movies }: { movies: MovieResult[] }) {
  const [added, setAdded] = useState<number[]>([]);

  async function handleAdd(movie: MovieResult) {
    setAdded((prev) => [...prev, movie.tmdbId]);
    const res = await fetch("/api/movies/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movie),
    });
    if (!res.ok) setAdded((prev) => prev.filter((id) => id !== movie.tmdbId));
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {movies.map((movie) => (
        <div key={movie.tmdbId} className="rounded-xl overflow-hidden bg-surface">
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              width={342}
              height={513}
              className="w-full h-auto"
            />
          ) : (
            <div className="aspect-[2/3] bg-surface-hi flex items-center justify-center text-muted text-xs">
              no poster
            </div>
          )}
          <div className="p-3">
            <h3 className="text-sm font-medium line-clamp-1">{movie.title}</h3>
            <p className="text-xs text-muted mb-2">{movie.releaseYear ?? "—"}</p>
            <button
              onClick={() => handleAdd(movie)}
              disabled={added.includes(movie.tmdbId)}
              className="w-full text-xs py-1.5 rounded-full bg-surface-hi hover:bg-blush hover:text-ink transition-colors disabled:opacity-40 disabled:hover:bg-surface-hi disabled:hover:text-cream cursor-pointer"
            >
              {added.includes(movie.tmdbId) ? "✓ In watchlist" : "+ Watchlist"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}