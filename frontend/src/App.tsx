import { Link, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CatalogPage } from "./pages/CatalogPage";
import { LoginPage } from "./pages/LoginPage";
import { MoviePage } from "./pages/MoviePage";
import { ReservationsPage } from "./pages/ReservationsPage";
import { SeatsPage } from "./pages/SeatsPage";

function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-24 text-center">
      <p className="font-mono text-[11px] font-bold tracking-[0.08em] text-primary uppercase">
        Error 404
      </p>
      <h1 className="font-display text-3xl font-bold tracking-tight">Página no encontrada</h1>
      <p className="text-sm text-on-surface-variant">La ruta que buscas no existe.</p>
      <Link
        to="/"
        className="inline-block rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary transition hover:bg-primary-bright hover:shadow-[0_0_24px_rgba(245,158,11,0.4)]"
      >
        Volver a la cartelera
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CatalogPage />} />
        <Route path="movies/:id" element={<MoviePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="screenings/:id" element={<SeatsPage />} />
        <Route
          path="reservations"
          element={
            <ProtectedRoute>
              <ReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
