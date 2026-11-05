import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import { CarteleraSidebar } from "../components/CarteleraSidebar";
import {
  dateKey,
  dayNumber,
  formatDuration,
  formatLabel,
  shortDayLabel,
  timeOf,
} from "../lib/movie";
import type { Movie, Screening } from "../types";

interface Group {
  movie: Movie;
  screenings: Screening[];
}

function RatingBadge({ rating }: { rating: number | null }) {
  if (rating === null) return null;
  return (
    <span className="flex items-center gap-1 rounded bg-surface-lowest/85 px-2 py-1 font-mono text-[11px] font-bold text-primary backdrop-blur">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-3 w-3"
        fill="currentColor"
        stroke="none"
      >
        <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3 6.2 20.4l1.1-6.5L2.6 9.3l6.5-.9L12 2.5z" />
      </svg>
      {rating.toFixed(1)}
    </span>
  );
}

function SessionChip({
  screening,
  showDay,
}: {
  screening: Screening;
  showDay: boolean;
}) {
  const soldOut = screening.seats_available === 0;

  return (
    <Link
      to={`/screenings/${screening.id}`}
      aria-disabled={soldOut}
      className={`flex min-w-[128px] flex-col gap-1 rounded-lg border px-3 py-2 transition ${
        soldOut
          ? "pointer-events-none border-white/5 bg-surface-low/50 opacity-45"
          : "border-white/10 bg-surface-low hover:border-primary-container/60 hover:bg-surface-container"
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-bold text-on-surface">
          {timeOf(screening.starts_at)}
        </span>
        <span className="rounded bg-surface-high px-1.5 py-0.5 font-mono text-[9px] tracking-[0.08em] text-primary uppercase">
          {formatLabel(screening.room_format)}
        </span>
      </span>
      <span className="font-mono text-[10px] tracking-[0.04em] text-on-surface-variant uppercase">
        {showDay && (
          <>
            {shortDayLabel(dateKey(screening.starts_at))}{" "}
            {dayNumber(dateKey(screening.starts_at))} ·{" "}
          </>
        )}
        {soldOut ? "agotada" : `${screening.seats_available} libres`}
      </span>
    </Link>
  );
}

function MovieCard({
  movie,
  screenings,
  showDay,
}: {
  movie: Movie;
  screenings: Screening[];
  showDay: boolean;
}) {
  return (
    <article className="group flex flex-col">
      <Link
        to={`/movies/${movie.id}`}
        className="relative block overflow-hidden rounded-xl border border-white/5"
      >
        <div className="relative aspect-[2/3] bg-surface-container">
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={`Póster de ${movie.title}`}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-surface-high to-surface-lowest">
              <span className="font-display text-4xl font-bold text-white/10">
                {movie.title.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-surface-lowest via-surface-lowest/10 to-transparent" />

          <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
            {movie.is_premiere && (
              <span className="rounded bg-primary-container px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.1em] text-on-primary uppercase">
                Estreno
              </span>
            )}
            {movie.age_rating && (
              <span className="rounded border border-white/20 bg-surface-lowest/70 px-1.5 py-0.5 font-mono text-[9px] text-on-surface backdrop-blur">
                {movie.age_rating}
              </span>
            )}
          </div>

          <div className="absolute top-2.5 right-2.5">
            <RatingBadge rating={movie.rating} />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3 className="font-display text-lg leading-tight font-semibold text-on-surface">
              {movie.title}
            </h3>
            <p className="mt-1 font-mono text-[10px] tracking-[0.04em] text-on-surface-variant uppercase">
              {movie.genres.slice(0, 2).join(" · ")} · {formatDuration(movie.duration_minutes)}
            </p>
          </div>
        </div>
      </Link>

      <ul className="mt-3 flex flex-wrap gap-2">
        {screenings.map((screening) => (
          <li key={screening.id}>
            <SessionChip screening={screening} showDay={showDay} />
          </li>
        ))}
      </ul>
    </article>
  );
}

export function CatalogPage() {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .screenings()
      .then((response) => setScreenings(response.results))
      .catch((caught: unknown) =>
        setError(caught instanceof Error ? caught.message : "Error al cargar la cartelera."),
      )
      .finally(() => setLoading(false));
  }, []);

  const allGroups = useMemo<Group[]>(() => {
    const byMovie = new Map<number, Group>();
    for (const screening of screenings) {
      const current = byMovie.get(screening.movie.id);
      if (current) {
        current.screenings.push(screening);
      } else {
        byMovie.set(screening.movie.id, { movie: screening.movie, screenings: [screening] });
      }
    }
    return [...byMovie.values()];
  }, [screenings]);

  const dates = useMemo(() => {
    const keys = [...new Set(screenings.map((screening) => dateKey(screening.starts_at)))].sort();
    return keys.map((key) => ({
      key,
      count: screenings.filter((screening) => dateKey(screening.starts_at) === key).length,
    }));
  }, [screenings]);

  const genres = useMemo(() => {
    const names = new Set<string>();
    for (const group of allGroups) {
      for (const genre of group.movie.genres) names.add(genre);
    }
    return [...names].sort();
  }, [allGroups]);

  const normalizedQuery = query.trim().toLowerCase();

  const groups = useMemo<Group[]>(() => {
    return allGroups
      .map((group) => ({
        movie: group.movie,
        screenings: group.screenings.filter(
          (screening) =>
            (!selectedDate || dateKey(screening.starts_at) === selectedDate) &&
            (!selectedGenre || screening.movie.genres.includes(selectedGenre)) &&
            (!normalizedQuery ||
              screening.movie.title.toLowerCase().includes(normalizedQuery) ||
              screening.movie.genres.some((genre) => genre.toLowerCase().includes(normalizedQuery))),
        ),
      }))
      .filter((group) => group.screenings.length > 0);
  }, [allGroups, selectedDate, selectedGenre, normalizedQuery]);

  const featured =
    allGroups.find(
      (group) =>
        group.movie.is_premiere && group.screenings.some((s) => s.seats_available > 0),
    ) ?? allGroups.find((group) => group.screenings.some((s) => s.seats_available > 0));

  const featuredSession = featured?.screenings.find((screening) => screening.seats_available > 0);
  const totalSeatsAvailable = groups.reduce(
    (sum, group) => sum + group.screenings.reduce((acc, s) => acc + s.seats_available, 0),
    0,
  );
  const totalSessions = groups.reduce((sum, group) => sum + group.screenings.length, 0);

  return (
    <div>
      <section className="relative isolate overflow-hidden border-b border-white/5">
        {featured?.movie.poster_url && (
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <img
              src={featured.movie.poster_url}
              alt=""
              className="h-full w-full scale-125 object-cover object-top opacity-30 blur-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-lowest via-surface-lowest/85 to-surface-lowest/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-lowest via-transparent to-surface-lowest/60" />
          </div>
        )}
        <div className="pointer-events-none absolute -top-24 left-1/3 h-[420px] w-[420px] rounded-full bg-primary-container/10 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-8 md:py-24">
          <div className="max-w-3xl space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded bg-surface-lowest/90 px-3 py-1 font-mono text-[11px] font-bold tracking-[0.08em] text-primary uppercase backdrop-blur-md">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                En cartelera
              </span>
              {featuredSession && (
                <span className="rounded bg-surface-high/80 px-2.5 py-1 font-mono text-[11px] tracking-[0.08em] text-on-surface-variant uppercase">
                  {formatLabel(featuredSession.room_format)}
                </span>
              )}
              {featured?.movie.rating !== null && featured?.movie.rating !== undefined && (
                <span className="flex items-center gap-1 rounded bg-surface-high/80 px-2.5 py-1 font-mono text-[11px] tracking-[0.08em] text-on-surface-variant uppercase">
                  <span className="text-primary">★</span>
                  {featured.movie.rating.toFixed(1)} / 10
                </span>
              )}
              {featured?.movie.age_rating && (
                <span className="rounded bg-surface-high/80 px-2.5 py-1 font-mono text-[11px] tracking-[0.08em] text-on-surface-variant uppercase">
                  {featured.movie.age_rating}
                </span>
              )}
              {featured && (
                <span className="rounded bg-surface-high/80 px-2.5 py-1 font-mono text-[11px] tracking-[0.08em] text-on-surface-variant uppercase">
                  {formatDuration(featured.movie.duration_minutes)}
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance uppercase sm:text-5xl md:text-6xl">
              {featured ? (
                <>
                  {featured.movie.title.includes(":") ? (
                    <>
                      <span className="block">
                        {featured.movie.title.split(":")[0]}:
                      </span>
                      <span className="block text-primary">
                        {featured.movie.title.split(":").slice(1).join(":").trim()}
                      </span>
                    </>
                  ) : (
                    featured.movie.title
                  )}
                </>
              ) : (
                "Tu próxima sesión empieza aquí"
              )}
            </h1>

            {featured?.movie.tagline && (
              <p className="max-w-2xl text-base leading-relaxed text-on-surface">{featured.movie.tagline}</p>
            )}
            {featured?.movie.description && (
              <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant">
                {featured.movie.description}
              </p>
            )}

            {featured && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/movies/${featured.movie.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary transition hover:bg-primary-bright hover:shadow-[0_0_24px_rgba(245,158,11,0.4)]"
                >
                  Comprar entradas
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  to={`/movies/${featured.movie.id}`}
                  className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-on-surface transition hover:border-primary/50 hover:text-primary"
                >
                  Ver ficha
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-surface-lowest/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-8">
          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              role="searchbox"
              inputMode="search"
              aria-label="Buscar película o género"
              placeholder="Buscar película o género…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setQuery("");
              }}
              className="w-full rounded-xl border border-white/10 bg-surface-container py-2.5 pr-11 pl-11 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Borrar búsqueda"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-on-surface-variant transition hover:bg-white/5 hover:text-on-surface"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  className="h-4 w-4"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="shrink-0 font-mono text-[10px] tracking-[0.08em] text-on-surface-variant uppercase">
              Fecha
            </span>
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className={`shrink-0 rounded-lg px-3 py-1.5 font-mono text-[11px] transition ${
                selectedDate === null
                  ? "bg-primary-container font-bold text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Todas
            </button>
            {dates.map((date) => (
              <button
                key={date.key}
                type="button"
                onClick={() => setSelectedDate(date.key)}
                className={`flex shrink-0 flex-col items-center rounded-lg px-3 py-1.5 transition ${
                  selectedDate === date.key
                    ? "bg-primary-container text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="font-mono text-[9px] tracking-[0.08em] uppercase">
                  {shortDayLabel(date.key)}
                </span>
                <span className="font-display text-sm font-bold">{dayNumber(date.key)}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="shrink-0 font-mono text-[10px] tracking-[0.08em] text-on-surface-variant uppercase">
              Género
            </span>
            <button
              type="button"
              onClick={() => setSelectedGenre(null)}
              className={`shrink-0 rounded-full px-3 py-1 font-mono text-[11px] transition ${
                selectedGenre === null
                  ? "bg-primary-container font-bold text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Todo
            </button>
            {genres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => setSelectedGenre(genre)}
                className={`shrink-0 rounded-full px-3 py-1 font-mono text-[11px] transition ${
                  selectedGenre === genre
                    ? "bg-primary-container font-bold text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] font-bold tracking-[0.08em] text-primary uppercase">
              Programación
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight">En cartelera</h2>
          </div>
          {!loading && !error && groups.length > 0 && (
            <p className="font-mono text-xs tracking-[0.04em] text-on-surface-variant uppercase">
              {groups.length} {groups.length === 1 ? "película" : "películas"} · {totalSessions}{" "}
              {totalSessions === 1 ? "sesión" : "sesiones"} · {totalSeatsAvailable} butacas libres
            </p>
          )}
        </div>

        {loading && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="glass h-[420px] animate-pulse rounded-xl" aria-hidden="true" />
            ))}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-crimson/30 bg-crimson/10 p-4 text-sm text-on-surface"
          >
            {error}
          </div>
        )}

        {!loading && !error && groups.length === 0 && (
          <div className="glass rounded-xl p-10 text-center">
            <p className="text-on-surface-variant">
              {normalizedQuery
                ? `Sin resultados para “${query.trim()}”. Prueba con otro término.`
                : "No hay funciones con esos filtros. Prueba otra fecha o género."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedDate(null);
                setSelectedGenre(null);
                setQuery("");
              }}
              className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm text-on-surface transition hover:border-primary/50 hover:text-primary"
            >
              Quitar filtros
            </button>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="grid content-start gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map(({ movie, screenings: sessions }, index) => (
              <div
                key={movie.id}
                className="animate-rise"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <MovieCard movie={movie} screenings={sessions} showDay={selectedDate === null} />
              </div>
            ))}
          </div>

          {!loading && !error && <CarteleraSidebar screenings={screenings} />}
        </div>
      </section>
    </div>
  );
}
