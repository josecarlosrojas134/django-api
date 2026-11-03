"""Configuración de producción.

Falla al arrancar si falta lo imprescindible: es preferible a arrancar inseguro.
"""

from .base import *  # noqa: F403
from .base import env

DEBUG = False

# Sin valor por defecto: `ImproperlyConfigured` con mensaje claro si falta.
SECRET_KEY = env("DJANGO_SECRET_KEY")

ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS")

DATABASES = {"default": env.db("DATABASE_URL")}

# Detrás de un proxy que termina TLS.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31_536_000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True

MAILERS = {
    "default": {
        "BACKEND": "django.core.mail.backends.smtp.EmailBackend",
        "HOST": env("EMAIL_HOST"),
        "PORT": env.int("EMAIL_PORT", default=587),
        "USERNAME": env("EMAIL_HOST_USER", default=""),
        "PASSWORD": env("EMAIL_HOST_PASSWORD", default=""),
        "USE_TLS": True,
    },
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
