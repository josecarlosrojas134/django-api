"""Configuración compartida de pytest."""

import pytest
from django.core.cache import cache


@pytest.fixture(autouse=True)
def _clear_cache_between_tests():
    """El throttling guarda contadores en cache: sin limpiarla, un test afecta al siguiente."""
    cache.clear()
    yield
    cache.clear()
