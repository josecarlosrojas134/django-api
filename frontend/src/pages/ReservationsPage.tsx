import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { api } from "../api/client";
import { formatDate, formatPrice } from "../lib/format";
import type { Reservation } from "../types";

interface LocationState {
  flash?: string;
}

function TicketIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9V6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5V9a3 3 0 0 0 0 6v2.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5V15a3 3 0 0 0 0-6Z" />
      <path d="M12 5v14" strokeDasharray="2 3" />
    </svg>
  );
}

function ReservationCard({
  reservation,
  cancelling,
  onCancel,
}: {
  reservation: Reservation;
  cancelling: boolean;
  onCancel: () => void;
}) {
  const cancelled = reservation.status === "cancelled";

  return (
    <li
      className={`glass animate-rise overflow-hidden rounded-xl transition ${
        cancelled ? "opacity-55" : "hover:border-primary-container/40"
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.08em] uppercase ${
                cancelled
                  ? "bg-surface-high text-on-surface-variant"
                  : "bg-primary-container/15 text-primary"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${cancelled ? "bg-on-surface-variant" : "bg-primary"}`}
              />
              {cancelled ? "Cancelada" : "Confirmada"}
            </span>
            <span className="rounded bg-surface-low px-2.5 py-1 font-mono text-[10px] tracking-[0.08em] text-on-surface-variant uppercase">
              {reservation.room}
            </span>
          </div>

          <div className="space-y-1.5">
            <h2 className="font-display text-xl leading-tight font-semibold tracking-tight text-on-surface sm:text-2xl">
              {reservation.movie}
            </h2>
            <p className="text-sm text-on-surface-variant first-letter:uppercase">
              {formatDate(reservation.starts_at)}
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="font-mono text-[10px] tracking-[0.08em] text-on-surface-variant uppercase">
              {reservation.seats.length === 1 ? "Butaca" : "Butacas"}
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {reservation.seats.map((seat) => (
                <li
                  key={`${seat.row}-${seat.number}`}
                  className="rounded bg-surface-high px-2 py-1 font-mono text-[11px] text-on-surface"
                >
                  F{seat.row}-{seat.number}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative flex flex-col justify-between gap-4 border-t border-dashed border-white/10 bg-surface-lowest/40 p-5 sm:w-56 sm:border-t-0 sm:border-l">
          <span
            aria-hidden="true"
            className="absolute -top-2 -left-2 hidden h-4 w-4 rounded-full bg-surface-lowest sm:block"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-2 -left-2 hidden h-4 w-4 rounded-full bg-surface-lowest sm:block"
          />

          <div className="space-y-1">
            <p className="font-mono text-[10px] tracking-[0.08em] text-on-surface-variant uppercase">
              Código
            </p>
            <p className="flex items-center gap-2 font-mono text-sm font-bold tracking-[0.08em] text-primary">
              <TicketIcon />
              {reservation.code}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[10px] tracking-[0.08em] text-on-surface-variant uppercase">
                Total
              </span>
              <span className="font-display text-xl font-bold text-on-surface">
                {formatPrice(reservation.total)}
              </span>
            </div>

            {!cancelled && (
              <button
                type="button"
                onClick={onCancel}
                disabled={cancelling}
                className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-on-surface-variant transition hover:border-crimson/50 hover:text-crimson disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling ? "Cancelando…" : "Cancelar reserva"}
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
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

  const cancelledCount = reservations.filter((reservation) => reservation.status === "cancelled").length;
  const activeCount = reservations.length - cancelledCount;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
      <header className="mb-8 space-y-3">
        <p className="font-mono text-[11px] font-bold tracking-[0.08em] text-primary uppercase">
          Tus entradas
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Mis reservas
          </h1>
          {!loading && reservations.length > 0 && (
            <p className="font-mono text-xs tracking-[0.04em] text-on-surface-variant uppercase">
              {activeCount} {activeCount === 1 ? "activa" : "activas"}
              {cancelledCount > 0 && ` · ${cancelledCount} ${cancelledCount === 1 ? "cancelada" : "canceladas"}`}
            </p>
          )}
        </div>
      </header>

      {flash && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2 rounded-xl border border-primary-container/40 bg-primary-container/10 px-4 py-3 text-sm text-on-surface"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-container text-[11px] font-bold text-on-primary">
            ✓
          </span>
          {flash}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-crimson/30 bg-crimson/10 px-4 py-3 text-sm text-on-surface"
        >
          {error}
        </p>
      )}

      {loading && (
        <ul className="space-y-4">
          {[0, 1].map((index) => (
            <li key={index} className="glass h-44 animate-pulse rounded-xl" aria-hidden="true" />
          ))}
        </ul>
      )}

      {!loading && reservations.length === 0 && (
        <div className="glass rounded-xl px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-high text-primary">
            <TicketIcon />
          </div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Todavía no tienes entradas
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-on-surface-variant">
            Elige una función de la cartelera, marca tus butacas y tu reserva aparecerá aquí.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary transition hover:bg-primary-bright hover:shadow-[0_0_24px_rgba(245,158,11,0.4)]"
          >
            Ver cartelera
          </Link>
        </div>
      )}

      <ul className="space-y-4">
        {reservations.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            cancelling={cancelling === reservation.id}
            onCancel={() => cancel(reservation.id)}
          />
        ))}
      </ul>
    </div>
  );
}
