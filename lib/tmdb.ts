const TMDB_BASE = "https://api.themoviedb.org/3";

// Forma în care TMDB ne trimite un film (doar câmpurile care ne interesează)
type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
};

// Forma normalizată, pe care o folosim noi peste tot
export type MovieResult = {
  tmdbId: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  releaseYear: number | null;
};

export async function searchMovies(query: string): Promise<MovieResult[]> {
  const url = `${TMDB_BASE}/search/movie?query=${encodeURIComponent(query)}&language=en-US&include_adult=false`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
      accept: "application/json",
    },
    // Rezultatele căutării nu se schimbă des — le ținem 1h
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`TMDB a răspuns cu ${res.status}`);
  }

  const data = (await res.json()) as { results: TmdbMovie[] };

  return data.results.slice(0, 12).map((m) => ({
    tmdbId: m.id,
    title: m.title,
    overview: m.overview,
    posterUrl: m.poster_path
      ? `https://image.tmdb.org/t/p/w342${m.poster_path}`
      : null,
    releaseYear: m.release_date
      ? Number(m.release_date.slice(0, 4))
      : null,
  }));
}