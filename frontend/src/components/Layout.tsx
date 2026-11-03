import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

function navClass({ isActive }: { isActive: boolean }): string {
  return [
    "rounded-full px-4 py-1.5 text-sm font-medium transition",
    isActive
      ? "bg-amber-400 text-slate-950"
      : "text-slate-300 hover:bg-white/10 hover:text-white",
  ].join(" ");
}

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-gradient-to-b from-amber-500/10 to-transparent" />

      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="text-2xl">🎬</span>
            <span>
              Cine <span className="text-amber-400">Rojas</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <NavLink to="/" end className={navClass}>
              Cartelera
            </NavLink>
            <NavLink to="/reservations" className={navClass}>
              Mis reservas
            </NavLink>

            {user ? (
              <div className="ml-2 flex items-center gap-3 border-l border-white/10 pl-3">
                <span className="hidden text-sm text-slate-400 sm:inline">{user.email}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-slate-300 transition hover:border-white/30 hover:text-white"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-2 rounded-full bg-amber-400 px-4 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                Entrar
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        Proyecto de ejemplo · Django + React
      </footer>
    </div>
  );
}
