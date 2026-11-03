export interface User {
  id: number;
  email: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
}

export interface Screening {
  id: number;
  movie: Movie;
  room: string;
  starts_at: string;
  price: string;
  total_seats: number;
  seats_available: number;
}

export interface Seat {
  row: number;
  number: number;
}

export interface SeatMap {
  screening: number;
  rows: number;
  seats_per_row: number;
  occupied: Seat[];
}

export interface Reservation {
  id: number;
  code: string;
  status: "confirmed" | "cancelled";
  movie: string;
  room: string;
  starts_at: string;
  seats: Seat[];
  total: string;
  created_at: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}
