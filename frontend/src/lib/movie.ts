import type { RoomFormat } from "../types";

const FORMAT_LABELS: Record<RoomFormat, string> = {
  standard: "Estándar",
  imax: "IMAX",
  dolby: "Dolby Atmos",
  vip: "VIP",
  screenx: "ScreenX",
};

export function formatLabel(format: RoomFormat): string {
  return FORMAT_LABELS[format] ?? FORMAT_LABELS.standard;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function dateKey(iso: string): string {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function shortDayLabel(key: string): string {
  return new Date(`${key}T12:00:00`).toLocaleDateString("es-ES", { weekday: "short" });
}

export function dayNumber(key: string): string {
  return new Date(`${key}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric" });
}

export function longDayLabel(key: string): string {
  return new Date(`${key}T12:00:00`).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
