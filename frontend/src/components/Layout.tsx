import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

const CURRENT_YEAR = new Date().getFullYear();

function navClass({ isActive }: { isActive: boolean }): string {
  return [
    "rounded-lg px-3 py-2 text-sm transition",
    isActive
      ? "bg-surface-high font-semibold text-primary shadow-[0_0_15px_rgba(245,158,11,0.15)]"
      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
  ].join(" ");
}

function LogoMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7 text-primary"
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

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-surface-lowest/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(245,158,11,0.07)]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <LogoMark />
            <span className="font-display text-xl font-bold uppercase tracking-tight text-primary">
              Cinevox
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Cartelera
            </NavLink>
            <NavLink to="/reservations" className={navClass}>
              Mis reservas
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden items-center gap-2 rounded-full bg-surface-container-low py-1 pr-3 pl-1 sm:flex">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-highest font-display text-xs font-bold text-primary uppercase">
                    {user.email.slice(0, 2)}
                  </span>
                  <div className="flex flex-col leading-none">
                    <span className="font-mono text-[10px] font-bold tracking-[0.08em] text-primary uppercase">
                      Sesión
                    </span>
                    <span className="max-w-[180px] truncate text-xs font-medium text-on-surface">
                      {user.email}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm text-on-surface-variant transition hover:border-crimson/50 hover:text-crimson"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-bright hover:shadow-[0_0_24px_rgba(245,158,11,0.4)]"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-white/5 bg-surface-lowest/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <LogoMark />
              <span className="font-display text-lg font-bold uppercase tracking-tight text-primary">
                Cinevox
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-on-surface-variant">
              Cartelera y reserva de butacas por función. Proyecto de ejemplo con Django, React y
              PostgreSQL.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-sm font-semibold tracking-wide text-on-surface uppercase">
              Secciones
            </h2>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link to="/" className="text-on-surface-variant transition hover:text-primary">
                  Cartelera
                </Link>
              </li>
              <li>
                <Link
                  to="/reservations"
                  className="text-on-surface-variant transition hover:text-primary"
                >
                  Mis reservas
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-sm font-semibold tracking-wide text-on-surface uppercase">
              Cómo funciona
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Elige una función, marca tus butacas y confirma. Sin pago: la reserva queda
              confirmada al instante y puedes cancelarla cuando quieras.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 px-4 py-4 sm:px-8">
          <p className="mx-auto max-w-7xl font-mono text-[11px] tracking-[0.08em] text-on-surface-variant/60 uppercase">
            © {CURRENT_YEAR} Cinevox · Demo técnica
          </p>
        </div>
      </footer>
    </div>
  );
}
