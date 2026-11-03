"""Configuración para desarrollo local.

- `DEBUG` activo y errores detallados.
- SQLite por defecto; se puede apuntar a otra BD con `DATABASE_URL`.
- `DJANGO_SECRET_KEY` tiene un valor inseguro por comodidad: nunca sirve en producción.
"""

from .base import *  # noqa: F403
from .base import BASE_DIR, env

DEBUG = True

SECRET_KEY = env("DJANGO_SECRET_KEY", default="django-insecure-dev-only-change-me")  # noqa: S105

ALLOWED_HOSTS = env.list(
    "DJANGO_ALLOWED_HOSTS",
    default=["localhost", "127.0.0.1", "[::1]"],
)

DATABASES = {
    "default": env.db(
        "DATABASE_URL",
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
    )
}

# En desarrollo los errores de validación se ven mejor sin la capa extra de formato.
REST_FRAMEWORK = {  # noqa: F405
    **REST_FRAMEWORK,  # noqa: F405
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
}
