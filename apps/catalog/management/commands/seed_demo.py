"""Datos de ejemplo para probar la API sin tocar el admin.

Uso: `uv run python manage.py seed_demo`
"""

from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.catalog.models import Movie, Room, Screening


class Command(BaseCommand):
    help = "Crea una película, una sala y dos funciones de ejemplo (idempotente)."

    def handle(self, *args, **options):
        movie, _ = Movie.objects.get_or_create(
            title="Interestelar",
            defaults={
                "description": "Un grupo de exploradores viaja por un agujero de gusano.",
                "duration_minutes": 169,
            },
        )
        room, _ = Room.objects.get_or_create(
            name="Sala 1",
            defaults={"rows": 6, "seats_per_row": 8},
        )

        tomorrow = timezone.now().replace(hour=20, minute=0, second=0, microsecond=0) + timedelta(
            days=1
        )
        created = 0
        for offset, price in (
            (timedelta(0), Decimal("6.50")),
            (timedelta(hours=3), Decimal("5.50")),
        ):
            _, was_created = Screening.objects.get_or_create(
                movie=movie,
                room=room,
                starts_at=tomorrow + offset,
                defaults={"price": price},
            )
            created += int(was_created)

        self.stdout.write(
            self.style.SUCCESS(
                f"{movie} · {room} · {created} función(es) nueva(s) en {tomorrow:%d/%m/%Y %H:%M}"
            )
        )
