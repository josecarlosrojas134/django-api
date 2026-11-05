"""Tests de los endpoints públicos y del formato de errores."""

import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_health_returns_ok_without_authentication():
    response = APIClient().get("/api/v1/health/")

    assert response.status_code == 200
    assert response.data == {"status": "ok"}


@pytest.mark.django_db
def test_health_is_also_available_at_root():
    """Sondas de infraestructura suelen llamar a `/health`, sin prefijo de versión."""

    response = APIClient().get("/health/")

    assert response.status_code == 200
    assert response.data == {"status": "ok"}


@pytest.mark.django_db
def test_drf_error_uses_uniform_format():
    """Un 405 lo genera DRF, así que debe pasar por el handler común."""

    response = APIClient().post("/api/v1/health/")

    assert response.status_code == 405
    assert set(response.data) == {"detail", "fields"}
    assert response.data["fields"] == {}
