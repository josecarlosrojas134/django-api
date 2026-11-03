"""Formato uniforme de errores de la API.

Toda respuesta de error queda como `{"detail": ..., "fields": {...}}`.
"""

from typing import Any

from rest_framework.response import Response
from rest_framework.views import exception_handler


def api_exception_handler(exc: Exception, context: dict[str, Any]) -> Response | None:
    response = exception_handler(exc, context)
    if response is None:
        return None

    data = response.data
    detail: Any = ""
    fields: dict[str, Any] = {}

    if isinstance(data, dict):
        detail = data.get("detail", "Datos inválidos.")
        fields = {key: value for key, value in data.items() if key != "detail"}
    elif isinstance(data, list):
        detail = data

    response.data = {"detail": detail, "fields": fields}
    return response
