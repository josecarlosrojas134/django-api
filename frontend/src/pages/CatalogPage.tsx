import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import { formatDate, formatPrice } from "../lib/format";
import type { Movie, Screening } from "../types";

interface Group {
  movie: Movie;
  screenings: Screening[];
}

export function CatalogPage() {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .screenings()
      .then((response) => setScreenings(response.results))
      .catch((caught: unknown) =>
        setError(caught instanceof Error ? caught.message : "Error al cargar la cartelera."),
      )
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo<Group[]>(() => {
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

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-400">
          Cartelera
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Elige película y butaca
        </h1>
        <p className="max-w-2xl text-slate-400">
          Todas las funciones de esta semana. Selecciona una sesión para ver el mapa de la sala.
        </p>
      </section>

      {loading && <p className="text-slate-400">Cargando cartelera…</p>}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && groups.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-slate-400">
          No hay funciones programadas. Ejecuta <code className="text-amber-300">manage.py seed_demo</code>.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {groups.map(({ movie, screenings: sessions }) => (
          <article
            key={movie.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-amber-400/40"
          >
            <header className="space-y-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-2xl font-semibold">{movie.title}</h2>
                <span className="shrink-0 rounded-full border border-white/15 px-2.5 py-0.5 text-xs text-slate-300">
                  {movie.duration_minutes} min
                </span>
              </div>
              {movie.description && (
                <p className="text-sm text-slate-400">{movie.description}</p>
              )}
            </header>

            <ul className="space-y-2">
              {sessions.map((screening) => {
                const soldOut = screening.seats_available === 0;
                return (
                  <li
                    key={screening.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-900/60 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium capitalize">{formatDate(screening.starts_at)}</p>
                      <p className="text-xs text-slate-400">
                        {screening.room} · {screening.seats_available} butacas libres ·{" "}
                        {formatPrice(screening.price)}
                      </p>
                    </div>

                    {soldOut ? (
                      <span className="rounded-full bg-slate-800 px-3 py-1.5 text-xs text-slate-500">
                        Agotada
                      </span>
                    ) : (
                      <Link
                        to={`/screenings/${screening.id}`}
                        className="rounded-full bg-amber-400 px-4 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
                      >
                        Elegir butacas
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
