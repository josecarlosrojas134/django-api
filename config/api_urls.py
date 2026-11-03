"""URLs de la versión 1 de la API."""

from django.urls import include, path

from apps.common.views import HealthView

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("", include("apps.catalog.urls")),
    path("", include("apps.booking.urls")),
    path("", include("apps.accounts.urls")),
]
