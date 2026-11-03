import secrets

from django.conf import settings
from django.db import models


def generate_code() -> str:
    """Código corto y legible para enseñar en taquilla."""
    return secrets.token_hex(4).upper()


class Reservation(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = "confirmed", "Confirmada"
        CANCELLED = "cancelled", "Cancelada"

    code = models.CharField(max_length=12, unique=True, default=generate_code, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="reservations"
    )
    screening = models.ForeignKey(
        "catalog.Screening", on_delete=models.PROTECT, related_name="reservations"
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CONFIRMED)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [models.Index(fields=["user", "-created_at"])]

    def __str__(self) -> str:
        return f"{self.code} · {self.screening}"

    @property
    def seat_count(self) -> int:
        return self.seats.count()


class ReservationSeat(models.Model):
    """Butaca concreta de una reserva.

    `screening` está duplicado a propósito: permite un índice único parcial que impide
    que dos reservas activas ocupen la misma butaca, incluso en peticiones simultáneas.
    Al cancelar se marca `active=False` en vez de borrar, para conservar el histórico.
    """

    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name="seats")
    screening = models.ForeignKey(
        "catalog.Screening", on_delete=models.PROTECT, related_name="booked_seats"
    )
    row = models.PositiveSmallIntegerField()
    number = models.PositiveSmallIntegerField()
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ("row", "number")
        constraints = [
            models.UniqueConstraint(
                fields=["screening", "row", "number"],
                condition=models.Q(active=True),
                name="unique_active_seat_per_screening",
            )
        ]

    def __str__(self) -> str:
        return f"Fila {self.row}, butaca {self.number}"
