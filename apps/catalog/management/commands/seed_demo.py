"""Datos de ejemplo para probar la API sin tocar el admin.

Uso: `uv run python manage.py seed_demo`
"""

from datetime import datetime, time, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.catalog.models import Genre, Movie, Room, Screening

MOVIES = [
    {
        "title": "Interestelar",
        "description": (
            "Un grupo de exploradores viaja por un agujero de gusano en busca de un nuevo "
            "hogar para la humanidad."
        ),
        "duration_minutes": 169,
        "tagline": "La humanidad nació en la Tierra. No estaba destinada a morir aquí.",
        "director": "Christopher Nolan",
        "cast": "Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg",
        "rating": Decimal("8.7"),
        "age_rating": "+12",
        "is_premiere": False,
        "genres": ["Ciencia ficción", "Drama", "Aventura"],
    },
    {
        "title": "Dune: Parte Dos",
        "description": (
            "Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los "
            "conspiradores que destruyeron a su familia."
        ),
        "duration_minutes": 166,
        "tagline": "El destino del universo se decide en Arrakis.",
        "director": "Denis Villeneuve",
        "cast": "Timothée Chalamet, Zendaya, Rebecca Ferguson, Austin Butler",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg",
        "rating": Decimal("8.2"),
        "age_rating": "+12",
        "is_premiere": True,
        "genres": ["Ciencia ficción", "Aventura"],
    },
    {
        "title": "Oppenheimer",
        "description": (
            "La historia del científico que dirigió el Proyecto Manhattan y cambió el mundo "
            "para siempre."
        ),
        "duration_minutes": 180,
        "tagline": "El mundo cambia para siempre.",
        "director": "Christopher Nolan",
        "cast": "Cillian Murphy, Emily Blunt, Robert Downey Jr., Matt Damon",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg",
        "rating": Decimal("8.1"),
        "age_rating": "+16",
        "is_premiere": False,
        "genres": ["Drama", "Historia"],
    },
    {
        "title": "Gladiator II",
        "description": (
            "Lucio debe entrar en el Coliseo para recuperar el honor de su familia y la "
            "libertad de Roma."
        ),
        "duration_minutes": 148,
        "tagline": "La venganza tiene un nuevo nombre.",
        "director": "Ridley Scott",
        "cast": "Paul Mescal, Pedro Pascal, Denzel Washington, Connie Nielsen",
        "poster_url": (
            "https://upload.wikimedia.org/wikipedia/en/0/04/Gladiator_II_%282024%29_poster.jpg"
        ),
        "rating": Decimal("6.9"),
        "age_rating": "+16",
        "is_premiere": False,
        "genres": ["Acción", "Drama"],
    },
    {
        "title": "Alien: Romulus",
        "description": (
            "Un grupo de jóvenes colonos se enfrenta a la forma de vida más aterradora del "
            "universo en una estación espacial abandonada."
        ),
        "duration_minutes": 119,
        "tagline": "El terror vuelve a su origen.",
        "director": "Fede Álvarez",
        "cast": "Cailee Spaeny, David Jonsson, Archie Renaux",
        "poster_url": (
            "https://upload.wikimedia.org/wikipedia/en/c/cb/Alien_Romulus_2024_%28poster%29.jpg"
        ),
        "rating": Decimal("7.1"),
        "age_rating": "+16",
        "is_premiere": False,
        "genres": ["Terror", "Ciencia ficción"],
    },
    {
        "title": "Robot Salvaje",
        "description": (
            "Un robot naufragado en una isla desierta aprende a sobrevivir y a criar a un "
            "ánsar huérfano."
        ),
        "duration_minutes": 102,
        "tagline": "A veces, para sobrevivir, hay que adaptarse.",
        "director": "Chris Sanders",
        "cast": "Lupita Nyong'o, Pedro Pascal, Kit Connor",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/7/70/The_Wild_Robot_poster.jpg",
        "rating": Decimal("8.2"),
        "age_rating": "TP",
        "is_premiere": False,
        "genres": ["Animación", "Aventura", "Familia"],
    },
]

ROOMS = [
    {
        "name": "Sala 1",
        "rows": 6,
        "seats_per_row": 8,
        "accessible_seats": "1:1,1:8",
        "format": Room.Format.IMAX,
        "features": "Láser 4K, Dolby Atmos 64 canales, Pantalla 24 m",
        "price": Decimal("8.50"),
    },
    {
        "name": "Sala 2",
        "rows": 7,
        "seats_per_row": 10,
        "accessible_seats": "1:1,1:10",
        "format": Room.Format.DOLBY,
        "features": "Dolby Atmos, Butacas reclinables",
        "price": Decimal("7.90"),
    },
    {
        "name": "Sala 3",
        "rows": 5,
        "seats_per_row": 6,
        "accessible_seats": "1:1,1:6",
        "format": Room.Format.VIP,
        "features": "Servicio a butaca, Butacas de cuero",
        "price": Decimal("9.90"),
    },
]

DAYS = 6
HOURS = (16, 19, 22)


class Command(BaseCommand):
    help = "Crea cartelera, salas y funciones de ejemplo en los próximos días (idempotente)."

    def handle(self, *args, **options):
        genre_names = {name for movie in MOVIES for name in movie["genres"]}
        genres = {name: Genre.objects.get_or_create(name=name)[0] for name in genre_names}

        movies = []
        for data in MOVIES:
            movie, _ = Movie.objects.update_or_create(
                title=data["title"],
                defaults={
                    **{key: value for key, value in data.items() if key != "genres"},
                    "is_active": True,
                },
            )
            movie.genres.set([genres[name] for name in data["genres"]])
            movies.append(movie)

        rooms = []
        for data in ROOMS:
            price = data["price"]
            room, _ = Room.objects.update_or_create(
                name=data["name"],
                defaults={key: value for key, value in data.items() if key != "price"},
            )
            rooms.append((room, price))

        today = timezone.localdate()
        created = 0
        skipped = 0
        for day in range(DAYS):
            slot_date = today + timedelta(days=day)
            for hour_index, hour in enumerate(HOURS):
                index = day * len(HOURS) + hour_index
                room, price = rooms[index % len(rooms)]
                movie = movies[index % len(movies)]
                starts_at = timezone.make_aware(datetime.combine(slot_date, time(hour=hour)))

                if starts_at <= timezone.now():
                    skipped += 1
                    continue

                _, was_created = Screening.objects.get_or_create(
                    room=room,
                    starts_at=starts_at,
                    defaults={"movie": movie, "price": price},
                )
                created += int(was_created)

        demo_email = "demo@example.com"
        user, user_created = get_user_model().objects.get_or_create(
            email=demo_email,
            defaults={"first_name": "Demo"},
        )
        if user_created:
            user.set_password("demo12345")  # cuenta de demo pública, solo datos de ejemplo
            user.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"{len(movies)} películas · {len(rooms)} salas · "
                f"{created} función(es) nueva(s) · {skipped} omitida(s) por horario pasado · "
                f"usuario demo: {demo_email} / demo12345"
            )
        )
