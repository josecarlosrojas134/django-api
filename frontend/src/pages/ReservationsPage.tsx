import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { api } from "../api/client";
import { formatDate, formatPrice } from "../lib/format";
import type { Reservation } from "../types";

interface LocationState {
  flash?: string;
}

export function ReservationsPage() {
  const location = useLocation();
  const [flash, setFlash] = useState<string | null>(
    (location.state as LocationState | null)?.flash ?? null,
  );
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);

  const load = useCallback(async () => {
    const response = await api.reservations();
    setReservations(response.results);
  }, []);

  useEffect(() => {
    load()
      .catch((caught: unknown) =>
        setError(caught instanceof Error ? caught.message : "No se pudieron cargar tus reservas."),
      )
      .finally(() => setLoading(false));
  }, [load]);

  async function cancel(id: number) {
    if (!window.confirm("¿Cancelar esta reserva? Las butacas quedarán libres.")) return;

    setCancelling(id);
    setError(null);
    try {
      await api.cancelReservation(id);
      await load();
      setFlash(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cancelar.");
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-400">
          Tus entradas
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Mis reservas</h1>
      </header>

      {flash && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {flash}
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {loading && <p className="text-slate-400">Cargando reservas…</p>}

      {!loading && reservations.length === 0 && (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-slate-400">Todavía no tienes entradas.</p>
          <Link
            to="/"
            className="inline-block rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Ver cartelera
          </Link>
        </div>
      )}

      <ul className="space-y-4">
        {reservations.map((reservation) => {
          const cancelled = reservation.status === "cancelled";
          return (
            <li
              key={reservation.id}
              className={`rounded-2xl border p-6 ${
                cancelled
                  ? "border-white/5 bg-white/[0.02] opacity-60"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">{reservation.movie}</h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs ${
                        cancelled
                          ? "bg-slate-800 text-slate-400"
                          : "bg-emerald-500/15 text-emerald-300"
                      }`}
                    >
                      {cancelled ? "Cancelada" : "Confirmada"}
                    </span>
                  </div>
                  <p className="text-sm capitalize text-slate-400">
                    {formatDate(reservation.starts_at)} · {reservation.room}
                  </p>
                  <p className="text-sm text-slate-300">
                    {reservation.seats
                      .map((seat) => `F${seat.row}-${seat.number}`)
                      .join(" · ")}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-semibold">
                    {formatPrice(reservation.total)}
                  </span>
                  <span className="font-mono text-xs tracking-widest text-amber-300">
                    {reservation.code}
                  </span>
                  {!cancelled && (
                    <button
                      type="button"
                      onClick={() => cancel(reservation.id)}
                      disabled={cancelling === reservation.id}
                      className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-300 transition hover:border-red-400/50 hover:text-red-300 disabled:opacity-50"
                    >
                      {cancelling === reservation.id ? "Cancelando…" : "Cancelar"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
