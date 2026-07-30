"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { MovieResult, MovieDetails } from "@/lib/tmdb";

export default function MovieModal({
  movie,
  onClose,
  onAdd,
  added,
}: {
  movie: MovieResult;
  onClose: () => void;
  onAdd: (m: MovieResult) => void;
  added: boolean;
}) {
  const [details, setDetails] = useState<MovieDetails | null>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    fetch(`/api/movies/details?id=${movie.tmdbId}&type=${movie.mediaType}`)
      .then((r) => r.json())
      .then((d) => d.details && setDetails(d.details))
      .catch(() => {});
  }, [movie.tmdbId, movie.mediaType]);

  const d = details;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-3xl bg-surface overflow-hidden my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-ink/70 text-cream hover:bg-ink transition-colors cursor-pointer flex items-center justify-center text-lg"
          aria-label="Close"
        >
          ×
        </button>

        {d?.backdropUrl && (
          <div className="relative h-44 md:h-56">
            <Image src={d.backdropUrl} alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
          </div>
        )}

        <div className="p-6 flex gap-5">
          {movie.posterUrl && (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              width={110}
              height={165}
              className="rounded-xl h-fit shrink-0 hidden sm:block"
            />
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-semibold leading-tight">{movie.title}</h2>

            {d?.tagline && (
              <p className="text-sm text-lavender italic mt-1">{d.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted mt-3">
              <span>{movie.releaseYear ?? "—"}</span>
              {d?.runtime ? <span>· {d.runtime} min</span> : null}
              {d?.seasons ? (
                <span>
                  · {d.seasons} season{d.seasons > 1 ? "s" : ""}
                </span>
              ) : null}
              {d?.voteAverage ? (
                <span className="text-apricot">· ★ {d.voteAverage}</span>
              ) : null}
              <span className="px-2 py-0.5 rounded-full bg-surface-hi text-xs">
                {movie.mediaType === "tv" ? "Series" : "Film"}
              </span>
            </div>

            {d?.genres && d.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {d.genres.map((g) => (
                  <span
                    key={g}
                    className="text-xs px-2.5 py-1 rounded-full bg-surface-hi text-muted"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            <p className="text-sm text-muted leading-relaxed mt-4">
              {movie.overview || "No description available."}
            </p>

            <button
              onClick={() => onAdd(movie)}
              disabled={added}
              className="mt-6 px-6 py-2.5 rounded-full bg-blush text-ink text-sm font-medium hover:bg-apricot transition-colors disabled:opacity-40 disabled:hover:bg-blush cursor-pointer"
            >
              {added ? "✓ In watchlist" : "+ Add to watchlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}