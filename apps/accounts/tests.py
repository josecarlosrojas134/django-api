"""Tests del modelo de usuario y de los endpoints de autenticación."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

pytestmark = pytest.mark.django_db

PASSWORD = "clave-segura-123"


@pytest.fixture
def user():
    return User.objects.create_user(email="jose@example.com", password=PASSWORD)


@pytest.fixture
def client():
    return APIClient()


def test_create_user_lowercases_domain():
    created = User.objects.create_user(email="Jose@Example.COM", password=PASSWORD)
    assert created.email == "Jose@example.com"


def test_create_user_requires_email():
    with pytest.raises(ValueError):
        User.objects.create_user(email="", password=PASSWORD)


def test_create_superuser_sets_flags():
    admin = User.objects.create_superuser(email="admin@example.com", password=PASSWORD)
    assert admin.is_staff is True
    assert admin.is_superuser is True


def test_token_obtain_with_email(client, user):
    response = client.post(
        "/api/v1/auth/token/",
        {"email": user.email, "password": PASSWORD},
    )

    assert response.status_code == 200
    assert {"access", "refresh", "user"} <= set(response.data)
    assert response.data["user"] == {"id": user.id, "email": user.email}


def test_token_obtain_with_wrong_password_fails(client, user):
    response = client.post(
        "/api/v1/auth/token/",
        {"email": user.email, "password": "incorrecta"},
    )

    assert response.status_code == 401
    assert set(response.data) == {"detail", "fields"}
    assert response.data["fields"] == {}


def test_refresh_token_returns_new_access(client, user):
    tokens = client.post(
        "/api/v1/auth/token/",
        {"email": user.email, "password": PASSWORD},
    ).data

    response = client.post("/api/v1/auth/token/refresh/", {"refresh": tokens["refresh"]})

    assert response.status_code == 200
    assert "access" in response.data


def test_me_requires_authentication(client):
    response = client.get("/api/v1/me/")

    assert response.status_code == 401
    assert "detail" in response.data


def test_me_returns_only_public_fields(client, user):
    access = client.post(
        "/api/v1/auth/token/",
        {"email": user.email, "password": PASSWORD},
    ).data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    response = client.get("/api/v1/me/")

    assert response.status_code == 200
    assert set(response.data) == {"id", "email"}
    assert response.data["email"] == user.email


def test_validation_errors_use_uniform_format(client):
    response = client.post("/api/v1/auth/token/", {"email": ""})

    assert response.status_code == 400
    assert set(response.data) == {"detail", "fields"}
    assert "email" in response.data["fields"]
