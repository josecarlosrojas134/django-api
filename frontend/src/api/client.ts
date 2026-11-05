import type {
  AuthResponse,
  Movie,
  Paginated,
  Reservation,
  Screening,
  Seat,
  SeatMap,
  User,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api/v1";
const ACCESS_KEY = "cine.access";
const REFRESH_KEY = "cine.refresh";

export class ApiError extends Error {
  readonly status: number;
  readonly fields: Record<string, string[]>;

  constructor(message: string, status: number, fields: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function saveTokens(tokens: { access: string; refresh: string }): void {
  localStorage.setItem(ACCESS_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body) headers.set("Content-Type", "application/json");

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  const payload = (response.status === 204 ? null : await response.json().catch(() => null)) as {
    detail?: unknown;
    fields?: Record<string, string[]>;
  } | null;

  if (!response.ok) {
    if (response.status === 401) clearTokens();
    const detail =
      typeof payload?.detail === "string"
        ? payload.detail
        : "No se pudo completar la operación.";
    throw new ApiError(detail, response.status, payload?.fields ?? {});
  }

  return payload as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/token/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/me/"),

  movies: () => request<Paginated<Movie>>("/movies/"),

  movie: (id: number) => request<Movie>(`/movies/${id}/`),

  screenings: (movieId?: number) =>
    request<Paginated<Screening>>(
      movieId ? `/screenings/?movie=${movieId}` : "/screenings/",
    ),

  screening: (id: number) => request<Screening>(`/screenings/${id}/`),

  seatMap: (id: number) => request<SeatMap>(`/screenings/${id}/seats/`),

  reservations: () => request<Paginated<Reservation>>("/reservations/"),

  createReservation: (screening: number, seats: Seat[]) =>
    request<Reservation>("/reservations/", {
      method: "POST",
      body: JSON.stringify({ screening, seats }),
    }),

  cancelReservation: (id: number) =>
    request<Reservation>(`/reservations/${id}/cancel/`, { method: "POST" }),
};
