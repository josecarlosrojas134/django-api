"""URLs raíz del proyecto."""

from django.contrib import admin
from django.urls import include, path

from apps.common.views import HealthView

urlpatterns = [
    path("admin/", admin.site.urls),
    # Alias para sondas de infraestructura que sondean la raíz del servicio.
    path("health/", HealthView.as_view(), name="health-root"),
    path("api/v1/", include("config.api_urls")),
]
