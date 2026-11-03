import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ApiError, api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { formatDate, formatPrice } from "../lib/format";
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

  const total = screening ? Number(screening.price) * selected.size : 0;

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
    if (selected.size === 0 || !screening) return;

    if (!user) {
      navigate("/login", { state: { from: `/screenings/${screeningId}` } });
      return;
    }

    setSubmitting(true);
    setError(null);
    const seats = [...selected]
      .map((key) => key.split("-").map(Number))
      .map(([row, number]) => ({ row, number }));

    try {
      const reservation = await api.createReservation(screeningId, seats);
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
    return <p className="text-slate-400">Cargando sala…</p>;
  }

  if (!screening || !seatMap) {
    return (
      <div className="space-y-4">
        <p className="text-red-300">{error ?? "Función no encontrada."}</p>
        <Link to="/" className="text-amber-300 hover:underline">
          Volver a la cartelera
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link to="/" className="text-sm text-slate-400 transition hover:text-white">
        ← Cartelera
      </Link>

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{screening.movie.title}</h1>
        <p className="text-sm capitalize text-slate-400">
          {formatDate(screening.starts_at)} · {screening.room} ·{" "}
          {formatPrice(screening.price)} por butaca
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mx-auto w-fit space-y-2">
            <div className="mx-auto mb-8 h-2 w-2/3 rounded-full bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
            <p className="mb-6 text-center text-[10px] uppercase tracking-[0.3em] text-slate-500">
              Pantalla
            </p>

            {Array.from({ length: seatMap.rows }, (_, rowIndex) => {
              const row = rowIndex + 1;
              return (
                <div key={row} className="flex items-center gap-2">
                  <span className="w-5 text-right text-xs text-slate-500">{row}</span>
                  <div className="flex gap-1.5">
                    {Array.from({ length: seatMap.seats_per_row }, (_, seatIndex) => {
                      const number = seatIndex + 1;
                      const key = `${row}-${number}`;
                      const isOccupied = occupied.has(key);
                      const isSelected = selected.has(key);
                      const base =
                        "h-7 w-7 rounded-t-lg text-[10px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300";
                      const style = isOccupied
                        ? "cursor-not-allowed bg-slate-800 text-slate-600"
                        : isSelected
                          ? "bg-amber-400 text-slate-950"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600";

                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => toggleSeat(row, number)}
                          aria-label={`Fila ${row}, butaca ${number}`}
                          aria-pressed={isSelected}
                          className={`${base} ${style}`}
                        >
                          {number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-t bg-slate-700" /> Libre
            </span>
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-t bg-amber-400" /> Seleccionada
            </span>
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-t bg-slate-800" /> Ocupada
            </span>
          </div>
        </section>

        <aside className="h-fit space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Tu selección</h2>

          {selected.size === 0 ? (
            <p className="text-sm text-slate-400">Toca una butaca del mapa para empezar.</p>
          ) : (
            <ul className="space-y-1 text-sm text-slate-300">
              {[...selected]
                .sort()
                .map((key) => {
                  const [row, number] = key.split("-");
                  return (
                    <li key={key}>
                      Fila {row} · butaca {number}
                    </li>
                  );
                })}
            </ul>
          )}

          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm">
            <span className="text-slate-400">
              {selected.size} {selected.size === 1 ? "butaca" : "butacas"}
            </span>
            <span className="text-lg font-semibold">{formatPrice(total)}</span>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={confirm}
            disabled={selected.size === 0 || submitting}
            className="w-full rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Reservando…" : user ? "Confirmar reserva" : "Entrar y reservar"}
          </button>

          <p className="text-center text-xs text-slate-500">
            Sin pago: la reserva queda confirmada al instante.
          </p>
        </aside>
      </div>
    </div>
  );
}
