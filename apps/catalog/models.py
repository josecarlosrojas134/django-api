from django.core.validators import MinValueValidator
from django.db import models


class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    duration_minutes = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("title",)

    def __str__(self) -> str:
        return self.title


class Room(models.Model):
    name = models.CharField(max_length=50, unique=True)
    rows = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    seats_per_row = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])

    class Meta:
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name

    @property
    def capacity(self) -> int:
        return self.rows * self.seats_per_row


class Screening(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.PROTECT, related_name="screenings")
    room = models.ForeignKey(Room, on_delete=models.PROTECT, related_name="screenings")
    starts_at = models.DateTimeField()
    price = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])

    class Meta:
        ordering = ("starts_at",)
        constraints = [
            models.UniqueConstraint(
                fields=["room", "starts_at"],
                name="unique_screening_room_start",
            )
        ]
        indexes = [models.Index(fields=["starts_at"])]

    def __str__(self) -> str:
        return f"{self.movie} · {self.starts_at:%d/%m/%Y %H:%M}"
