import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <p className="p-16 text-center font-mono text-xs tracking-[0.08em] text-on-surface-variant uppercase">
        Cargando…
      </p>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
