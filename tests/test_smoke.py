"""Comprobaciones básicas de que el proyecto está correctamente configurado."""

from django.conf import settings


def test_settings_module_is_dev():
    assert settings.SETTINGS_MODULE == "config.settings.dev"


def test_core_apps_are_installed():
    assert "rest_framework" in settings.INSTALLED_APPS
    assert "apps.common" in settings.INSTALLED_APPS


def test_database_engine_is_supported():
    """`dev` usa SQLite por defecto o PostgreSQL si `DATABASE_URL` apunta ahí."""
    assert settings.DATABASES["default"]["ENGINE"] in {
        "django.db.backends.sqlite3",
        "django.db.backends.postgresql",
    }


def test_api_requires_authentication_by_default():
    assert (
        "rest_framework.permissions.IsAuthenticated"
        in settings.REST_FRAMEWORK["DEFAULT_PERMISSION_CLASSES"]
    )
