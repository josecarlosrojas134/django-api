"""Casos de uso de reservas. Sin HTTP, sin vistas."""

from django.db import IntegrityError, transaction
from django.utils import timezone

from .exceptions import (
    InvalidSeats,
    ReservationAlreadyCancelled,
    ScreeningAlreadyStarted,
    SeatUnavailable,
)
from .models import Reservation, ReservationSeat


def _normalize_seats(seats: list[dict]) -> list[tuple[int, int]]:
    pairs = [(int(seat["row"]), int(seat["number"])) for seat in seats]
    if len(set(pairs)) != len(pairs):
        raise InvalidSeats("No se puede repetir la misma butaca en una reserva.")
    return pairs


def _validate_seats_inside_room(room, seats: list[tuple[int, int]]) -> None:
    outside = [
        (row, number)
        for row, number in seats
        if not (1 <= row <= room.rows and 1 <= number <= room.seats_per_row)
    ]
    if outside:
        raise InvalidSeats(f"La sala no tiene estas butacas: {outside}.")


def create_reservation(*, user, screening, seats: list[dict]) -> Reservation:
    if screening.starts_at <= timezone.now():
        raise ScreeningAlreadyStarted()

    normalized = _normalize_seats(seats)
    _validate_seats_inside_room(screening.room, normalized)

    try:
        with transaction.atomic():
            reservation = Reservation.objects.create(
                user=user,
                screening=screening,
                total=screening.price * len(normalized),
            )
            ReservationSeat.objects.bulk_create(
                [
                    ReservationSeat(
                        reservation=reservation,
                        screening=screening,
                        row=row,
                        number=number,
                    )
                    for row, number in normalized
                ]
            )
    except IntegrityError as exc:
        # El índice único parcial de la base de datos es la garantía real.
        raise SeatUnavailable() from exc

    return reservation


def cancel_reservation(*, reservation: Reservation) -> Reservation:
    with transaction.atomic():
        locked = Reservation.objects.select_for_update().get(pk=reservation.pk)
        if locked.status == Reservation.Status.CANCELLED:
            raise ReservationAlreadyCancelled()

        locked.status = Reservation.Status.CANCELLED
        locked.save(update_fields=["status"])
        locked.seats.update(active=False)

    return locked
