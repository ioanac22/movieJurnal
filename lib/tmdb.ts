const TMDB_BASE = "https://api.themoviedb.org/3";

export type MediaType = "movie" | "tv";

type TmdbItem = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
};

export type MovieResult = {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  overview: string;
  posterUrl: string | null;
  releaseYear: number | null;
};

export type MovieDetails = MovieResult & {
  backdropUrl: string | null;
  tagline: string | null;
  runtime: number | null;
  seasons: number | null;
  genres: string[];
  voteAverage: number | null;
};

// Genre ids differ between movies and TV. Missing key = not offered for that type.
export const GENRE_MAP: Record<string, Partial<Record<MediaType, number>>> = {
  Action: { movie: 28, tv: 10759 },
  Comedy: { movie: 35, tv: 35 },
  Drama: { movie: 18, tv: 18 },
  Romance: { movie: 10749 },
  Horror: { movie: 27 },
  Thriller: { movie: 53 },
  "Sci-Fi": { movie: 878, tv: 10765 },
  Animation: { movie: 16, tv: 16 },
  Crime: { movie: 80, tv: 80 },
  Mystery: { movie: 9648, tv: 9648 },
  Family: { movie: 10751, tv: 10751 },
};

const headers = () => ({
  Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
  accept: "application/json",
});

function normalize(item: TmdbItem, mediaType: MediaType): MovieResult {
  const date = item.release_date || item.first_air_date;
  return {
    tmdbId: item.id,
    mediaType,
    title: item.title || item.name || "Untitled",
    overview: item.overview,
    posterUrl: item.poster_path
      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
      : null,
    releaseYear: date ? Number(date.slice(0, 4)) : null,
  };
}

export async function searchMovies(query: string): Promise<MovieResult[]> {
  const res = await fetch(
    `${TMDB_BASE}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US`,
    { headers: headers(), next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error(`TMDB responded with ${res.status}`);
  const data = (await res.json()) as { results: TmdbItem[] };
  return data.results.filter((i) => i.poster_path).map((i) => normalize(i, "movie"));
}

export async function discover(opts: {
  mediaType: MediaType;
  genreId?: number | null;
  page?: number;
}): Promise<MovieResult[]> {
  const { mediaType, genreId, page = 1 } = opts;

  const params = new URLSearchParams({
    language: "en-US",
    sort_by: "popularity.desc",
    page: String(page),
    "vote_count.gte": "40", // filters out obscure junk
    include_adult: "false",
  });

  if (genreId) params.set("with_genres", String(genreId));

  const res = await fetch(`${TMDB_BASE}/discover/${mediaType}?${params}`, {
    headers: headers(),
    next: { revalidate: 86400 },
  });

  if (!res.ok) throw new Error(`TMDB responded with ${res.status}`);
  const data = (await res.json()) as { results: TmdbItem[] };
  return data.results.filter((i) => i.poster_path).map((i) => normalize(i, mediaType));
}

export async function getDetails(
  tmdbId: number,
  mediaType: MediaType
): Promise<MovieDetails> {
  const res = await fetch(`${TMDB_BASE}/${mediaType}/${tmdbId}?language=en-US`, {
    headers: headers(),
    next: { revalidate: 86400 },
  });

  if (!res.ok) throw new Error(`TMDB responded with ${res.status}`);

  const d = await res.json();
  const base = normalize(d, mediaType);

  return {
    ...base,
    backdropUrl: d.backdrop_path
      ? `https://image.tmdb.org/t/p/w780${d.backdrop_path}`
      : null,
    tagline: d.tagline || null,
    runtime: d.runtime ?? d.episode_run_time?.[0] ?? null,
    seasons: d.number_of_seasons ?? null,
    genres: (d.genres ?? []).map((g: { name: string }) => g.name),
    voteAverage: d.vote_average ? Number(d.vote_average.toFixed(1)) : null,
  };
}