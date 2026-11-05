"""Tests del catálogo público."""

from datetime import timedelta
from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient

from apps.booking.models import Reservation, ReservationSeat

from .models import Genre, Movie, Room, Screening

User = get_user_model()

pytestmark = pytest.mark.django_db


@pytest.fixture
def movie():
    return Movie.objects.create(title="Interestelar", duration_minutes=169)


@pytest.fixture
def room():
    return Room.objects.create(name="Sala 1", rows=3, seats_per_row=4)


@pytest.fixture
def screening(movie, room):
    return Screening.objects.create(
        movie=movie,
        room=room,
        starts_at=timezone.now() + timedelta(days=1),
        price=Decimal("6.50"),
    )


def test_movies_are_public(movie):
    response = APIClient().get("/api/v1/movies/")

    assert response.status_code == 200
    assert response.data["results"][0]["title"] == "Interestelar"


def test_movie_detail_exposes_metadata(movie):
    movie.tagline = "No estabas destinado a morir aquí."
    movie.director = "Christopher Nolan"
    movie.cast = "Matthew McConaughey, Anne Hathaway"
    movie.poster_url = "https://example.com/poster.jpg"
    movie.rating = Decimal("8.7")
    movie.age_rating = "+12"
    movie.is_premiere = True
    movie.save()
    movie.genres.set([Genre.objects.create(name="Ciencia ficción")])

    response = APIClient().get(f"/api/v1/movies/{movie.id}/")

    assert response.status_code == 200
    assert response.data["tagline"] == "No estabas destinado a morir aquí."
    assert response.data["director"] == "Christopher Nolan"
    assert response.data["cast"] == ["Matthew McConaughey", "Anne Hathaway"]
    assert response.data["genres"] == ["Ciencia ficción"]
    assert response.data["rating"] == Decimal("8.7")
    assert response.data["age_rating"] == "+12"
    assert response.data["is_premiere"] is True


def test_movie_detail_returns_404_when_missing():
    response = APIClient().get("/api/v1/movies/9999/")

    assert response.status_code == 404


def test_screening_exposes_room_format_and_features(screening):
    screening.room.format = Room.Format.IMAX
    screening.room.features = "Láser 4K, Dolby Atmos"
    screening.room.save()

    response = APIClient().get(f"/api/v1/screenings/{screening.id}/")

    assert response.data["room_format"] == "imax"
    assert response.data["room_features"] == ["Láser 4K", "Dolby Atmos"]


def test_future_screenings_are_listed_and_past_ones_hidden(screening):
    Screening.objects.create(
        movie=screening.movie,
        room=screening.room,
        starts_at=timezone.now() - timedelta(days=1),
        price=Decimal("5.00"),
    )

    response = APIClient().get("/api/v1/screenings/")

    assert response.status_code == 200
    assert [item["id"] for item in response.data["results"]] == [screening.id]


def test_seating_map_shows_occupied_seats(screening):
    user = User.objects.create_user(email="ana@example.com", password="clave-segura-123")
    reservation = Reservation.objects.create(user=user, screening=screening, total=Decimal("6.50"))
    ReservationSeat.objects.create(reservation=reservation, screening=screening, row=1, number=2)

    seats_map = APIClient().get(f"/api/v1/screenings/{screening.id}/seats/")
    detail = APIClient().get(f"/api/v1/screenings/{screening.id}/")

    assert seats_map.data["rows"] == 3
    assert seats_map.data["seats_per_row"] == 4
    assert seats_map.data["occupied"] == [{"row": 1, "number": 2}]
    assert detail.data["seats_available"] == 11


def test_seating_map_exposes_accessible_seats(screening):
    screening.room.accessible_seats = "1:1, 1:4, 3:2, invalid, 9:9"
    screening.room.save()

    response = APIClient().get(f"/api/v1/screenings/{screening.id}/seats/")

    assert response.status_code == 200
    assert response.data["accessible"] == [
        {"row": 1, "number": 1},
        {"row": 1, "number": 4},
        {"row": 3, "number": 2},
    ]


def test_seating_map_without_accessible_setting_is_empty(screening):
    response = APIClient().get(f"/api/v1/screenings/{screening.id}/seats/")

    assert response.data["accessible"] == []
