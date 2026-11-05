import { useMemo } from "react";
import { Link } from "react-router-dom";

import { dateKey, shortDayLabel, dayNumber, timeOf } from "../lib/movie";
import type { Movie, Screening } from "../types";

function occupancyPercent(screening: Screening): number {
  if (screening.total_seats === 0) return 0;
  const sold = screening.total_seats - screening.seats_available;
  return Math.round((sold / screening.total_seats) * 100);
}

function PremieresCard({ movies }: { movies: Movie[] }) {
  if (movies.length === 0) return null;

  return (
    <section className="glass rounded-xl p-5">
      <h3 className="mb-4 flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.15em] text-primary uppercase">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
        Estrenos
      </h3>
      <ul className="space-y-3">
        {movies.map((movie) => (
          <li key={movie.id}>
            <Link to={`/movies/${movie.id}`} className="group flex items-center gap-3">
              <span className="block h-20 w-14 shrink-0 overflow-hidden rounded-md border border-white/10">
                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={`Póster de ${movie.title}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-surface-high font-mono text-xs text-white/20">
                    {movie.title.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-on-surface transition group-hover:text-primary">
                  {movie.title}
                </span>
                <span className="mt-0.5 block font-mono text-[10px] tracking-[0.04em] text-on-surface-variant uppercase">
                  {movie.genres.slice(0, 2).join(" · ")}
                </span>
                {movie.rating !== null && (
                  <span className="mt-0.5 block font-mono text-[10px] font-bold text-primary">
                    ★ {movie.rating.toFixed(1)}/10
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BusiestCard({ screenings }: { screenings: Screening[] }) {
  const busiest = useMemo(
    () =>
      screenings
        .filter((screening) => screening.total_seats - screening.seats_available > 0)
        .sort((a, b) => occupancyPercent(b) - occupancyPercent(a))
        .slice(0, 5),
    [screenings],
  );

  return (
    <section className="glass rounded-xl p-5">
      <h3 className="mb-4 flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.15em] text-primary uppercase">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
        Más agotadas
      </h3>
      {busiest.length === 0 ? (
        <p className="text-xs leading-relaxed text-on-surface-variant">
          Todavía no hay butacas vendidas. Sé la primera reserva.
        </p>
      ) : (
        <ol className="space-y-3">
          {busiest.map((screening) => {
            const pct = occupancyPercent(screening);
            const sold = screening.total_seats - screening.seats_available;
            return (
              <li key={screening.id}>
                <Link
                  to={`/screenings/${screening.id}`}
                  className="group block rounded-lg p-1.5 transition hover:bg-white/5"
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="min-w-0 truncate text-xs font-medium text-on-surface transition group-hover:text-primary">
                      {screening.movie.title}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] font-bold text-on-surface-variant">
                      {pct}%
                    </span>
                  </span>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface-high">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-primary-bright to-primary-container transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="mt-1 block font-mono text-[9px] tracking-[0.04em] text-on-surface-variant/80 uppercase">
                    {shortDayLabel(dateKey(screening.starts_at))} {dayNumber(dateKey(screening.starts_at))} ·{" "}
                    {timeOf(screening.starts_at)} · {sold}/{screening.total_seats} butacas
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export function CarteleraSidebar({ screenings }: { screenings: Screening[] }) {
  const premieres = useMemo(() => {
    const byMovie = new Map<number, Movie>();
    for (const screening of screenings) {
      if (screening.movie.is_premiere && !byMovie.has(screening.movie.id)) {
        byMovie.set(screening.movie.id, screening.movie);
      }
    }
    return [...byMovie.values()].sort(
      (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    );
  }, [screenings]);

  return (
    <aside className="h-fit space-y-4 lg:sticky lg:top-6">
      <PremieresCard movies={premieres} />
      <BusiestCard screenings={screenings} />
      <section className="rounded-xl border border-primary-container/30 bg-gradient-to-br from-primary-container/10 to-transparent p-5">
        <h3 className="font-mono text-[10px] font-bold tracking-[0.15em] text-primary uppercase">
          CINEVOX
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
          Sin registro ni pago para reservar: tu butaca queda confirmada al instante y puedes
          cancelarla cuando quieras.
        </p>
      </section>
    </aside>
  );
}
