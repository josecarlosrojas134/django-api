import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

interface LocationState {
  from?: string;
}

function LogoMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-8 w-8 text-primary"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M7.5 5v14M16.5 5v14M2.5 9.5h5M2.5 14.5h5M16.5 9.5h5M16.5 14.5h5" />
    </svg>
  );
}

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from ?? "/reservations";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo iniciar sesión.");
      setSubmitting(false);
    }
  }

  return (
    <div className="relative mx-auto flex max-w-md flex-col justify-center px-4 py-14 sm:px-0 sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-container/10 blur-[120px]"
      />

      <div className="relative space-y-6">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-surface-low">
            <LogoMark />
          </div>
          <div className="space-y-1.5">
            <p className="font-display text-xl font-bold uppercase tracking-tight text-primary">
              Cinevox
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-balance">
              Iniciar sesión
            </h1>
            <p className="text-sm text-on-surface-variant">
              Entra para reservar butacas y ver tus entradas.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong space-y-4 rounded-xl p-6 sm:p-7">
          <label className="block space-y-1.5">
            <span className="font-mono text-[10px] font-bold tracking-[0.08em] text-on-surface-variant uppercase">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-surface-lowest/70 px-4 py-2.5 text-sm text-on-surface transition outline-none placeholder:text-on-surface-variant/50 focus:border-primary-container focus:ring-2 focus:ring-primary-container/30"
              placeholder="tu@email.com"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="font-mono text-[10px] font-bold tracking-[0.08em] text-on-surface-variant uppercase">
              Contraseña
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-surface-lowest/70 px-4 py-2.5 text-sm text-on-surface transition outline-none placeholder:text-on-surface-variant/50 focus:border-primary-container focus:ring-2 focus:ring-primary-container/30"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-crimson/30 bg-crimson/10 px-4 py-2.5 text-sm text-on-surface"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary-container px-4 py-2.5 text-sm font-semibold text-on-primary transition hover:bg-primary-bright hover:shadow-[0_0_24px_rgba(245,158,11,0.4)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
          >
            {submitting ? "Entrando…" : "Entrar"}
          </button>

          <p className="text-center font-mono text-[10px] leading-relaxed tracking-[0.04em] text-on-surface-variant/70 uppercase">
            Sin pago · Reserva inmediata
          </p>
        </form>

        <p className="text-center text-sm text-on-surface-variant">
          ¿Solo quieres mirar?{" "}
          <Link to="/" className="text-primary transition hover:underline">
            Volver a la cartelera
          </Link>
        </p>
      </div>
    </div>
  );
}
