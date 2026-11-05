import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ApiError, api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { formatDate, formatPrice } from "../lib/format";
import { formatLabel } from "../lib/movie";
import type { Screening, SeatMap } from "../types";

export function SeatsPage() {
  const { id } = useParams<{ id: string }>();
  const screeningId = Number(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [screening, setScreening] = useState<Screening | null>(null);
  const [seatMap, setSeatMap] = useState<SeatMap | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadSeats = useCallback(async () => {
    const map = await api.seatMap(screeningId);
    setSeatMap(map);
    setSelected(new Set());
  }, [screeningId]);

  useEffect(() => {
    Promise.all([api.screening(screeningId), api.seatMap(screeningId)])
      .then(([screeningData, map]) => {
        setScreening(screeningData);
        setSeatMap(map);
      })
      .catch((caught: unknown) =>
        setError(caught instanceof Error ? caught.message : "No se pudo cargar la función."),
      )
      .finally(() => setLoading(false));
  }, [screeningId]);

  const occupied = useMemo(
    () => new Set((seatMap?.occupied ?? []).map((seat) => `${seat.row}-${seat.number}`)),
    [seatMap],
  );

  const accessible = useMemo(
    () => new Set((seatMap?.accessible ?? []).map((seat) => `${seat.row}-${seat.number}`)),
    [seatMap],
  );

  const optimalRow = seatMap ? Math.ceil(seatMap.rows / 2) : null;

  const selectedSeats = useMemo(
    () =>
      [...selected]
        .map((key) => key.split("-").map(Number))
        .map(([row, number]) => ({ row, number }))
        .sort((a, b) => a.row - b.row || a.number - b.number),
    [selected],
  );

  const total = screening ? Number(screening.price) * selectedSeats.length : 0;

  function toggleSeat(row: number, number: number) {
    const key = `${row}-${number}`;
    if (occupied.has(key)) return;
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  async function confirm() {
    if (selectedSeats.length === 0 || !screening) return;

    if (!user) {
      navigate("/login", { state: { from: `/screenings/${screeningId}` } });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const reservation = await api.createReservation(screeningId, selectedSeats);
      navigate("/reservations", {
        state: { flash: `Reserva ${reservation.code} confirmada` },
      });
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 409) {
        setError("Esas butacas se acaban de ocupar. Elige otras.");
        await loadSeats();
      } else {
        setError(caught instanceof Error ? caught.message : "No se pudo reservar.");
      }
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <p className="font-mono text-xs tracking-[0.08em] text-on-surface-variant uppercase">
          Cargando sala…
        </p>
      </div>
    );
  }

  if (!screening || !seatMap) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-16 sm:px-8">
        <p className="text-crimson">{error ?? "Función no encontrada."}</p>
        <Link to="/" className="text-sm text-primary hover:underline">
          Volver a la cartelera
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
      <nav className="mb-6 flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] uppercase">
        <Link to="/" className="text-on-surface-variant transition hover:text-primary">
          Cartelera
        </Link>
        <span aria-hidden="true" className="text-on-surface-variant/40">
          /
        </span>
        <Link
          to={`/movies/${screening.movie.id}`}
          className="max-w-[45%] truncate text-on-surface-variant transition hover:text-primary"
        >
          {screening.movie.title}
        </Link>
        <span aria-hidden="true" className="text-on-surface-variant/40">
          /
        </span>
        <span className="shrink-0 text-primary">Paso 02 · Butacas</span>
      </nav>

      <header className="mb-8 space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {screening.movie.title}
        </h1>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-on-surface-variant">
          <span className="rounded bg-surface-container px-2 py-0.5 font-mono text-[11px] tracking-[0.04em] text-on-surface uppercase">
            {screening.room}
          </span>
          <span className="rounded bg-primary-container/15 px-2 py-0.5 font-mono text-[11px] tracking-[0.04em] text-primary uppercase">
            {formatLabel(screening.room_format)}
          </span>
          <span className="first-letter:uppercase">{formatDate(screening.starts_at)}</span>
          <span aria-hidden="true">·</span>
          <span>{formatPrice(screening.price)} por butaca</span>
        </p>
        {screening.room_features.length > 0 && (
          <p className="font-mono text-[10px] tracking-[0.04em] text-on-surface-variant uppercase">
            {screening.room_features.join(" · ")}
          </p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="glass overflow-x-auto rounded-xl p-5 sm:p-8">
          {screening.room_format === "vip" && (
            <div className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-primary-container/40 bg-primary-container/10 px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.08em] text-primary uppercase">
              <span aria-hidden="true">✦</span>
              Zona VIP · servicio a butaca
            </div>
          )}

          <div className="mx-auto w-fit">
            <div className="relative mx-auto mb-10 w-64 max-w-full sm:w-96">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.16),transparent_72%)]"
              />
              <div className="relative mx-auto h-1.5 rounded-full bg-gradient-to-r from-transparent via-primary-container to-transparent shadow-[0_0_28px_rgba(245,158,11,0.6)]" />
              <p className="relative mt-4 text-center font-mono text-[10px] tracking-[0.4em] text-on-surface-variant uppercase">
                Pantalla
              </p>
            </div>

            <div
              aria-hidden="true"
              className="mb-4 flex items-center justify-center gap-2 text-primary/80"
            >
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-primary/50" />
              <p className="font-mono text-[9px] tracking-[0.35em] uppercase">Visión óptima</p>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-primary/50" />
            </div>

            <div className="space-y-1.5">
              {Array.from({ length: seatMap.rows }, (_, rowIndex) => {
                const row = rowIndex + 1;
                const isOptimal = row === optimalRow;
                return (
                  <div key={row} className="flex items-center justify-center gap-2">
                    <span
                      className={`w-4 text-right font-mono text-[10px] ${
                        isOptimal ? "font-bold text-primary" : "text-on-surface-variant/60"
                      }`}
                    >
                      {row}
                    </span>

                    <div className="flex gap-1">
                      {Array.from({ length: seatMap.seats_per_row }, (_, seatIndex) => {
                        const number = seatIndex + 1;
                        const key = `${row}-${number}`;
                        const isOccupied = occupied.has(key);
                        const isSelected = selected.has(key);
                        const isAccessible = accessible.has(key);

                        const stateClass = isOccupied
                          ? "cursor-not-allowed border border-white/5 bg-surface-container/60 text-on-surface-variant/25"
                          : isSelected
                            ? "animate-glow border border-primary-bright bg-primary-container font-bold text-on-primary"
                            : `border border-white/10 bg-[#26334d] text-on-surface-variant hover:border-primary-bright hover:bg-primary-container/25 hover:text-primary${isOptimal ? " ring-1 ring-primary/35" : ""}`;

                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={isOccupied}
                            onClick={() => toggleSeat(row, number)}
                            aria-label={`Fila ${row}, butaca ${number}${isAccessible ? ", accesible (PMR)" : ""}`}
                            aria-pressed={isSelected}
                            className={`relative flex h-7 w-7 items-center justify-center rounded-t-md font-mono text-[10px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-8 sm:w-8 sm:text-[11px] ${stateClass}`}
                          >
                            {number}
                            {isAccessible && (
                              <span
                                aria-hidden="true"
                                className="absolute bottom-0.5 left-1 h-1 w-1 rounded-full bg-amber-300"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <span
                      className={`w-4 font-mono text-[10px] ${
                        isOptimal ? "font-bold text-primary" : "text-on-surface-variant/60"
                      }`}
                    >
                      {row}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-white/5 pt-5">
              {[
                { label: "Disponible", className: "border border-white/10 bg-[#26334d]" },
                { label: "Seleccionada", className: "border border-primary-bright bg-primary-container" },
                { label: "Ocupada", className: "border border-white/5 bg-surface-container/60" },
                { label: "Accesible (PMR)", className: "border border-white/10 bg-[#26334d] relative" },
                { label: "Visión óptima", className: "border border-white/10 bg-[#26334d] ring-1 ring-primary/35" },
              ].map((item) => (
                <span
                  key={item.label}
                  className="flex items-center gap-2 font-mono text-[10px] tracking-[0.08em] text-on-surface-variant uppercase"
                >
                  <span className={`relative h-3.5 w-3.5 rounded-t-[3px] ${item.className}`}>
                    {item.label === "Accesible (PMR)" && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0.5 left-0.5 h-1 w-1 rounded-full bg-amber-300"
                      />
                    )}
                  </span>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <aside className="glass-strong h-fit space-y-5 rounded-xl p-5">
          <header className="space-y-1 border-b border-white/5 pb-4">
            <p className="font-mono text-[10px] font-bold tracking-[0.08em] text-primary uppercase">
              Resumen de reserva
            </p>
            <h2 className="font-display text-lg leading-tight font-semibold">
              {screening.movie.title}
            </h2>
            <p className="text-xs text-on-surface-variant">
              {screening.room} · {formatDate(screening.starts_at)}
            </p>
          </header>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] tracking-[0.08em] text-on-surface-variant uppercase">
                Tus butacas
              </p>
              <span className="rounded-full bg-surface-high px-2 py-0.5 font-mono text-[10px] text-on-surface">
                {selectedSeats.length} {selectedSeats.length === 1 ? "asiento" : "asientos"}
              </span>
            </div>

            {selectedSeats.length === 0 ? (
              <p className="py-3 text-sm text-on-surface-variant">
                Toca una butaca del mapa para empezar.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {selectedSeats.map((seat) => (
                  <li
                    key={`${seat.row}-${seat.number}`}
                    className="flex items-center justify-between rounded-lg bg-surface-low px-3 py-2"
                  >
                    <span className="flex items-center gap-2 font-mono text-xs text-on-surface">
                      <span className="rounded bg-primary-container px-1.5 py-0.5 text-[10px] font-bold text-on-primary">
                        F{seat.row}
                      </span>
                      Butaca {seat.number}
                    </span>
                    <span className="font-mono text-xs text-on-surface-variant">
                      {formatPrice(screening.price)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-end justify-between border-t border-white/5 pt-4">
            <span className="font-mono text-[10px] tracking-[0.08em] text-on-surface-variant uppercase">
              Total a pagar
            </span>
            <span className="font-display text-2xl font-bold text-primary">{formatPrice(total)}</span>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-crimson/30 bg-crimson/10 px-3 py-2 text-xs text-on-surface"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={confirm}
            disabled={selectedSeats.length === 0 || submitting}
            className="w-full rounded-lg bg-primary-container px-4 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-bright hover:shadow-[0_0_24px_rgba(245,158,11,0.4)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none"
          >
            {submitting ? "Reservando…" : user ? "Confirmar butacas" : "Entrar y reservar"}
          </button>

          <p className="text-center text-[11px] leading-relaxed text-on-surface-variant">
            Sin pago: la reserva queda confirmada al instante.
          </p>
        </aside>
      </div>
    </div>
  );
}
