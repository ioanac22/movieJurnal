"use client";

import Image from "next/image";
import type { MovieResult } from "@/lib/tmdb";

export default function MovieGrid({
  movies,
  added,
  onAdd,
  onSelect,
}: {
  movies: MovieResult[];
  added: string[];
  onAdd: (m: MovieResult) => void;
  onSelect: (m: MovieResult) => void;
}) {
  const key = (m: MovieResult) => `${m.mediaType}-${m.tmdbId}`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {movies.map((movie) => (
        <div key={key(movie)} className="rounded-xl overflow-hidden bg-surface group">
          <button
            onClick={() => onSelect(movie)}
            className="block w-full cursor-pointer"
            aria-label={`Details for ${movie.title}`}
          >
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                width={342}
                height={513}
                className="w-full h-auto group-hover:opacity-80 transition-opacity"
              />
            ) : (
              <div className="aspect-[2/3] bg-surface-hi flex items-center justify-center text-muted text-xs">
                no poster
              </div>
            )}
          </button>

          <div className="p-3">
            <h3 className="text-sm font-medium line-clamp-1">{movie.title}</h3>
            <p className="text-xs text-muted mb-2">{movie.releaseYear ?? "—"}</p>
            <button
              onClick={() => onAdd(movie)}
              disabled={added.includes(key(movie))}
              className="w-full text-xs py-1.5 rounded-full bg-surface-hi hover:bg-blush hover:text-ink transition-colors disabled:opacity-40 disabled:hover:bg-surface-hi disabled:hover:text-cream cursor-pointer"
            >
              {added.includes(key(movie)) ? "✓ In watchlist" : "+ Watchlist"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}