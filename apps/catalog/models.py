from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Genre(models.Model):
    """Género cinematográfico reutilizable entre películas."""

    name = models.CharField(max_length=40, unique=True)

    class Meta:
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name


class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    duration_minutes = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Ficha de la película. Todo opcional: el catálogo funciona sin estos datos.
    tagline = models.CharField(max_length=200, blank=True)
    director = models.CharField(max_length=120, blank=True)
    cast = models.CharField(
        max_length=300,
        blank=True,
        help_text="Nombres separados por comas.",
    )
    poster_url = models.URLField(max_length=500, blank=True)
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        help_text="Nota sobre 10.",
    )
    age_rating = models.CharField(
        max_length=10,
        blank=True,
        help_text="Clasificación por edad, por ejemplo +12 o TP.",
    )
    is_premiere = models.BooleanField(default=False)
    trailer_url = models.URLField(max_length=500, blank=True)
    genres = models.ManyToManyField(Genre, blank=True, related_name="movies")

    class Meta:
        ordering = ("title",)

    def __str__(self) -> str:
        return self.title

    @property
    def cast_list(self) -> list[str]:
        return [name.strip() for name in self.cast.split(",") if name.strip()]

    @property
    def genre_names(self) -> list[str]:
        return [genre.name for genre in self.genres.all()]


class Room(models.Model):
    """Sala de proyección con su formato y equipamiento."""

    class Format(models.TextChoices):
        STANDARD = "standard", "Estándar"
        IMAX = "imax", "IMAX"
        DOLBY = "dolby", "Dolby Atmos"
        VIP = "vip", "VIP"
        SCREENX = "screenx", "ScreenX"

    name = models.CharField(max_length=50, unique=True)
    rows = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    seats_per_row = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    accessible_seats = models.CharField(
        max_length=120,
        blank=True,
        help_text="Butacas accesibles separadas por comas, fila:butaca (p. ej. 1:1,1:8).",
    )
    format = models.CharField(max_length=20, choices=Format.choices, default=Format.STANDARD)
    features = models.CharField(
        max_length=200,
        blank=True,
        help_text="Características separadas por comas.",
    )

    class Meta:
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name

    @property
    def capacity(self) -> int:
        return self.rows * self.seats_per_row

    @property
    def feature_list(self) -> list[str]:
        return [item.strip() for item in self.features.split(",") if item.strip()]

    @property
    def accessible_seat_pairs(self) -> list[tuple[int, int]]:
        """Butacas accesibles como pares (fila, butaca).

        Entradas malformadas o fuera de la sala se ignoran.
        """
        pairs: list[tuple[int, int]] = []
        for chunk in self.accessible_seats.split(","):
            row, sep, number = chunk.strip().partition(":")
            if not sep or not row.isdigit() or not number.isdigit():
                continue
            row_number, seat_number = int(row), int(number)
            if 1 <= row_number <= self.rows and 1 <= seat_number <= self.seats_per_row:
                pairs.append((row_number, seat_number))
        return pairs


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
