"""Tests del flujo de reserva: creación, colisiones, permisos y cancelación."""

from datetime import timedelta
from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient

from apps.catalog.models import Movie, Room, Screening

from .models import Reservation

User = get_user_model()

pytestmark = pytest.mark.django_db

PASSWORD = "clave-segura-123"


@pytest.fixture
def user():
    return User.objects.create_user(email="ana@example.com", password=PASSWORD)


@pytest.fixture
def other_user():
    return User.objects.create_user(email="luis@example.com", password=PASSWORD)


@pytest.fixture
def screening():
    movie = Movie.objects.create(title="Interestelar", duration_minutes=169)
    room = Room.objects.create(name="Sala 1", rows=3, seats_per_row=4)
    return Screening.objects.create(
        movie=movie,
        room=room,
        starts_at=timezone.now() + timedelta(days=1),
        price=Decimal("6.50"),
    )


@pytest.fixture
def client(user):
    api = APIClient()
    api.force_authenticate(user=user)
    return api


def book(client, screening, seats):
    return client.post(
        "/api/v1/reservations/",
        {"screening": screening.id, "seats": seats},
        format="json",
    )


def test_create_reservation_with_two_seats(client, screening):
    response = book(client, screening, [{"row": 1, "number": 1}, {"row": 1, "number": 2}])

    assert response.status_code == 201
    assert response.data["status"] == "confirmed"
    assert response.data["total"] == "13.00"
    assert response.data["seats"] == [{"row": 1, "number": 1}, {"row": 1, "number": 2}]
    assert len(response.data["code"]) == 8
    assert Reservation.objects.count() == 1


def test_duplicate_seats_in_request_are_rejected(client, screening):
    response = book(client, screening, [{"row": 1, "number": 1}, {"row": 1, "number": 1}])

    assert response.status_code == 400
    assert "seats" in response.data["fields"]


def test_seat_outside_room_is_rejected(client, screening):
    response = book(client, screening, [{"row": 9, "number": 1}])

    assert response.status_code == 400
    assert "detail" in response.data


def test_same_seat_cannot_be_booked_twice(client, screening):
    first = book(client, screening, [{"row": 2, "number": 3}])
    second = book(client, screening, [{"row": 2, "number": 3}])

    assert first.status_code == 201
    assert second.status_code == 409
    assert Reservation.objects.count() == 1


def test_cannot_book_a_started_screening(client, screening):
    screening.starts_at = timezone.now() - timedelta(hours=1)
    screening.save(update_fields=["starts_at"])

    response = book(client, screening, [{"row": 1, "number": 1}])

    assert response.status_code == 400


def test_reservation_requires_authentication(screening):
    response = APIClient().post(
        "/api/v1/reservations/",
        {"screening": screening.id, "seats": [{"row": 1, "number": 1}]},
        format="json",
    )

    assert response.status_code == 401


def test_user_only_sees_own_reservations(client, other_user, screening):
    book(client, screening, [{"row": 1, "number": 1}])

    other_client = APIClient()
    other_client.force_authenticate(user=other_user)
    response = other_client.get("/api/v1/reservations/")

    assert response.status_code == 200
    assert response.data["results"] == []


def test_cancelling_frees_the_seats(client, screening):
    created = book(client, screening, [{"row": 3, "number": 4}]).data

    cancel = client.post(f"/api/v1/reservations/{created['id']}/cancel/")
    seats_map = APIClient().get(f"/api/v1/screenings/{screening.id}/seats/")
    rebook = book(client, screening, [{"row": 3, "number": 4}])

    assert cancel.status_code == 200
    assert cancel.data["status"] == "cancelled"
    assert cancel.data["seats"] == [{"row": 3, "number": 4}]
    assert seats_map.data["occupied"] == []
    assert rebook.status_code == 201


def test_cannot_cancel_someone_elses_reservation(client, other_user, screening):
    created = book(client, screening, [{"row": 1, "number": 1}]).data

    other_client = APIClient()
    other_client.force_authenticate(user=other_user)
    response = other_client.post(f"/api/v1/reservations/{created['id']}/cancel/")

    assert response.status_code == 404


def test_cancelling_twice_returns_error(client, screening):
    created = book(client, screening, [{"row": 1, "number": 1}]).data

    client.post(f"/api/v1/reservations/{created['id']}/cancel/")
    response = client.post(f"/api/v1/reservations/{created['id']}/cancel/")

    assert response.status_code == 400
    assert "detail" in response.data
