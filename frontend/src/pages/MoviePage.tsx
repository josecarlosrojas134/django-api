import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../api/client";
import { formatPrice } from "../lib/format";
import {
  dateKey,
  dayNumber,
  formatDuration,
  formatLabel,
  longDayLabel,
  shortDayLabel,
  timeOf,
} from "../lib/movie";
import type { Movie, RoomFormat, Screening } from "../types";

interface RoomGroup {
  name: string;
  format: RoomFormat;
  features: string[];
  sessions: Screening[];
}

interface DayGroup {
  key: string;
  rooms: RoomGroup[];
}

function groupByDay(screenings: Screening[]): DayGroup[] {
  const days = new Map<string, Map<string, RoomGroup>>();

  for (const screening of screenings) {
    const dayKey = dateKey(screening.starts_at);
    const rooms = days.get(dayKey) ?? new Map<string, RoomGroup>();
    const room = rooms.get(screening.room) ?? {
      name: screening.room,
      format: screening.room_format,
      features: screening.room_features,
      sessions: [],
    };
    room.sessions.push(screening);
    rooms.set(screening.room, room);
    days.set(dayKey, rooms);
  }

  return [...days.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, rooms]) => ({
      key,
      rooms: [...rooms.values()].sort((a, b) =>
        a.sessions[0].starts_at.localeCompare(b.sessions[0].starts_at),
      ),
    }));
}

export function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(movieId)) {
      setError("Película no encontrada.");
      setLoading(false);
      return;
    }

    Promise.all([api.movie(movieId), api.screenings(movieId)])
      .then(([movieData, screeningsData]) => {
        setMovie(movieData);
        setScreenings(screeningsData.results);
      })
      .catch((caught: unknown) =>
        setError(caught instanceof Error ? caught.message : "No se pudo cargar la película."),
      )
      .finally(() => setLoading(false));
  }, [movieId]);

  const days = useMemo(() => groupByDay(screenings), [screenings]);
  const allSessions = useMemo(
    () => days.flatMap((day) => day.rooms.flatMap((room) => room.sessions)),
    [days],
  );
  const nextSession = allSessions.find((screening) => screening.seats_available > 0);
  const minPrice = allSessions.length
    ? Math.min(...allSessions.map((screening) => Number(screening.price)))
    : null;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-8">
        <div className="glass h-72 animate-pulse rounded-xl" aria-hidden="true" />
        <p className="font-mono text-xs tracking-[0.08em] text-on-surface-variant uppercase">
          Cargando ficha…
        </p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-16 sm:px-8">
        <p className="text-crimson">{error ?? "Película no encontrada."}</p>
        <Link to="/" className="text-sm text-primary hover:underline">
          Volver a la cartelera
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className="relative isolate overflow-hidden border-b border-white/5">
        {movie.poster_url && (
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <img
              src={movie.poster_url}
              alt=""
              className="h-full w-full scale-125 object-cover object-top opacity-25 blur-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-lowest via-surface-lowest/90 to-surface-lowest/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-lowest via-transparent to-surface-lowest/50" />
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
          <nav className="mb-6 flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] uppercase">
            <Link to="/" className="text-on-surface-variant transition hover:text-primary">
              Cartelera
            </Link>
            <span aria-hidden="true" className="text-on-surface-variant/40">
              /
            </span>
            <span className="truncate text-primary">Ficha</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[210px_1fr_300px]">
            <div className="mx-auto w-44 sm:w-52 lg:mx-0 lg:w-full">
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]">
                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={`Póster de ${movie.title}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-surface-high to-surface-lowest">
                    <span className="font-display text-5xl font-bold text-white/10">
                      {movie.title.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                {movie.is_premiere && (
                  <span className="rounded bg-primary-container px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.1em] text-on-primary uppercase">
                    Estreno
                  </span>
                )}
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded bg-surface-high/80 px-2.5 py-1 font-mono text-[10px] tracking-[0.08em] text-on-surface-variant uppercase"
                  >
                    {genre}
                  </span>
                ))}
                {movie.age_rating && (
                  <span className="rounded border border-white/15 px-2 py-1 font-mono text-[10px] text-on-surface">
                    {movie.age_rating}
                  </span>
                )}
                {movie.rating !== null && (
                  <span className="flex items-center gap-1 rounded bg-surface-lowest/80 px-2.5 py-1 font-mono text-[10px] font-bold text-primary">
                    <span aria-hidden="true">★</span>
                    {movie.rating.toFixed(1)} / 10
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl leading-[1.05] font-bold tracking-tight text-balance uppercase sm:text-4xl md:text-5xl">
                {movie.title.includes(":") ? (
                  <>
                    <span className="block">{movie.title.split(":")[0]}:</span>
                    <span className="block text-primary">
                      {movie.title.split(":").slice(1).join(":").trim()}
                    </span>
                  </>
                ) : (
                  movie.title
                )}
              </h1>

              {movie.tagline && (
                <p className="text-base leading-relaxed text-on-surface">{movie.tagline}</p>
              )}

              <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant">
                {movie.description}
              </p>

              <dl className="flex flex-wrap gap-x-8 gap-y-3 pt-2">
                {movie.director && (
                  <div className="space-y-0.5">
                    <dt className="font-mono text-[10px] tracking-[0.08em] text-on-surface-variant uppercase">
                      Dirección
                    </dt>
                    <dd className="text-sm text-on-surface">{movie.director}</dd>
                  </div>
                )}
                <div className="space-y-0.5">
                  <dt className="font-mono text-[10px] tracking-[0.08em] text-on-surface-variant uppercase">
                    Duración
                  </dt>
                  <dd className="text-sm text-on-surface">
                    {formatDuration(movie.duration_minutes)}
                  </dd>
                </div>
                {allSessions.length > 0 && (
                  <div className="space-y-0.5">
                    <dt className="font-mono text-[10px] tracking-[0.08em] text-on-surface-variant uppercase">
                      Salas
                    </dt>
                    <dd className="text-sm text-on-surface">
                      {[...new Set(allSessions.map((screening) => screening.room))].join(" · ")}
                    </dd>
                  </div>
                )}
              </dl>

              {movie.cast.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="font-mono text-[10px] tracking-[0.08em] text-on-surface-variant uppercase">
                    Reparto
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {movie.cast.map((name) => (
                      <li
                        key={name}
                        className="rounded-full border border-white/10 bg-surface-low px-3 py-1 text-xs text-on-surface-variant"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <aside className="glass-strong h-fit space-y-5 rounded-xl p-5">
              <header className="space-y-1 border-b border-white/5 pb-4">
                <p className="font-mono text-[10px] font-bold tracking-[0.08em] text-primary uppercase">
                  Entradas
                </p>
                <p className="font-display text-2xl font-bold text-on-surface">
                  {minPrice !== null ? `Desde ${formatPrice(minPrice)}` : "Sin funciones"}
                </p>
                {nextSession && (
                  <p className="flex flex-wrap items-baseline gap-x-1.5 text-xs text-on-surface-variant">
                    <span>Próxima función</span>
                    <span className="font-mono text-on-surface">
                      {shortDayLabel(dateKey(nextSession.starts_at))}{" "}
                      {dayNumber(dateKey(nextSession.starts_at))} · {timeOf(nextSession.starts_at)}
                    </span>
                  </p>
                )}
              </header>

              {nextSession ? (
                <Link
                  to={`/screenings/${nextSession.id}`}
                  className="block w-full rounded-lg bg-primary-container px-4 py-3 text-center text-sm font-semibold text-on-primary transition hover:bg-primary-bright hover:shadow-[0_0_24px_rgba(245,158,11,0.4)]"
                >
                  Elegir butacas
                </Link>
              ) : (
                <span className="block w-full rounded-lg border border-white/10 px-4 py-3 text-center text-sm text-on-surface-variant">
                  Sin butacas disponibles
                </span>
              )}

              <p className="text-center text-[11px] leading-relaxed text-on-surface-variant">
                Sin pago: la reserva se confirma al instante y puedes cancelarla cuando quieras.
              </p>
            </aside>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] font-bold tracking-[0.08em] text-primary uppercase">
              Horarios
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Funciones</h2>
          </div>
          {allSessions.length > 0 && (
            <p className="font-mono text-xs tracking-[0.04em] text-on-surface-variant uppercase">
              {allSessions.length} {allSessions.length === 1 ? "sesión" : "sesiones"}
            </p>
          )}
        </div>

        {days.length === 0 && (
          <div className="glass rounded-xl p-10 text-center text-on-surface-variant">
            No hay funciones programadas para esta película.
          </div>
        )}

        <div className="space-y-6">
          {days.map((day) => (
            <div
              key={day.key}
              className="grid gap-3 border-t border-white/5 pt-5 first:border-t-0 first:pt-0 sm:grid-cols-[150px_1fr] sm:gap-6"
            >
              <h3 className="font-mono text-[11px] leading-relaxed font-bold tracking-[0.08em] text-on-surface-variant uppercase first-letter:uppercase sm:pt-4">
                {longDayLabel(day.key)}
              </h3>

              <div className="flex flex-wrap gap-3">
                {day.rooms.map((room) => (
                  <div
                    key={`${day.key}-${room.name}`}
                    className="glass min-w-[280px] flex-1 space-y-4 rounded-xl p-4 sm:p-5"
                  >
                    <header className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-display text-base font-semibold text-on-surface">
                          {room.name}
                        </h4>
                        <span className="rounded bg-primary-container/15 px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.08em] text-primary uppercase">
                          {formatLabel(room.format)}
                        </span>
                      </div>
                      {room.features.length > 0 && (
                        <p className="font-mono text-[10px] leading-relaxed tracking-[0.04em] text-on-surface-variant uppercase">
                          {room.features.join(" · ")}
                        </p>
                      )}
                    </header>

                    <ul className="flex flex-wrap gap-2">
                      {room.sessions.map((screening) => {
                        const soldOut = screening.seats_available === 0;
                        return (
                          <li key={screening.id}>
                            <Link
                              to={`/screenings/${screening.id}`}
                              aria-disabled={soldOut}
                              className={`flex flex-col gap-0.5 rounded-lg border px-3 py-2 transition ${
                                soldOut
                                  ? "pointer-events-none border-white/5 bg-surface-low/50 opacity-45"
                                  : "border-white/10 bg-surface-low hover:border-primary-container/60 hover:bg-surface-container"
                              }`}
                            >
                              <span className="font-mono text-sm font-bold text-on-surface">
                                {timeOf(screening.starts_at)}
                              </span>
                              <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                                {formatPrice(screening.price)} ·{" "}
                                {soldOut ? "agotada" : `${screening.seats_available} libres`}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
