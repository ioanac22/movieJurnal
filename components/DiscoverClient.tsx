"use client";

import { useEffect, useState } from "react";
import { GENRE_MAP, type MediaType, type MovieResult } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import MovieModal from "@/components/MovieModal";

type Category = { label: string; mediaType: MediaType; forcedGenre?: number };

const CATEGORIES: Category[] = [
  { label: "Films", mediaType: "movie" },
  { label: "Series", mediaType: "tv" },
  { label: "Documentaries", mediaType: "movie", forcedGenre: 99 },
];

export default function DiscoverClient() {
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [genre, setGenre] = useState<string | null>(null);
  const [movies, setMovies] = useState<MovieResult[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState<string[]>([]);
  const [selected, setSelected] = useState<MovieResult | null>(null);

  const key = (m: MovieResult) => `${m.mediaType}-${m.tmdbId}`;

  // Genres available for the current media type
  const availableGenres = Object.entries(GENRE_MAP)
    .filter(([, ids]) => ids[category.mediaType] !== undefined)
    .map(([label]) => label);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [category, genre]);

  useEffect(() => {
    const genreId =
      category.forcedGenre ??
      (genre ? GENRE_MAP[genre]?.[category.mediaType] : undefined);

    const params = new URLSearchParams({
      type: category.mediaType,
      page: String(page),
    });
    if (genreId) params.set("genre", String(genreId));

    setLoading(true);
    fetch(`/api/movies/discover?${params}`)
      .then((r) => r.json())
      .then((d) => {
        const fresh: MovieResult[] = d.movies ?? [];
        setMovies((prev) => (page === 1 ? fresh : [...prev, ...fresh]));
      })
      .finally(() => setLoading(false));
  }, [category, genre, page]);

  async function handleAdd(movie: MovieResult) {
    setAdded((p) => [...p, key(movie)]);
    const res = await fetch("/api/movies/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movie),
    });
    if (!res.ok) setAdded((p) => p.filter((k) => k !== key(movie)));
  }

  return (
    <>
      {/* Category */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            onClick={() => {
              setCategory(c);
              setGenre(null);
            }}
            className={`px-5 py-2 rounded-full text-sm transition-colors cursor-pointer ${
              category.label === c.label
                ? "bg-blush text-ink"
                : "bg-surface-hi hover:bg-surface"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Genre — hidden for documentaries, the genre is already fixed */}
      {!category.forcedGenre && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setGenre(null)}
            className={`px-4 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
              genre === null
                ? "bg-lavender text-ink"
                : "bg-surface hover:bg-surface-hi text-muted"
            }`}
          >
            All
          </button>
          {availableGenres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-4 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                genre === g
                  ? "bg-lavender text-ink"
                  : "bg-surface hover:bg-surface-hi text-muted"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {movies.length === 0 && loading ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : (
        <MovieGrid
          movies={movies}
          added={added}
          onAdd={handleAdd}
          onSelect={setSelected}
        />
      )}

      {movies.length > 0 && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loading}
            className="px-7 py-3 rounded-full bg-surface-hi hover:bg-blush hover:text-ink transition-colors text-sm disabled:opacity-40 cursor-pointer"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}

      {selected && (
        <MovieModal
          movie={selected}
          added={added.includes(key(selected))}
          onAdd={handleAdd}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}