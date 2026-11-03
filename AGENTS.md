# AGENTS.md

Backend Django. Documentación y respuestas en español; código, nombres de modelos,
campos y URLs en inglés.

## Stack

- Python 3.12, Django 6.1, Django REST Framework
- Autenticación: JWT con `djangorestframework-simplejwt`, login por email
- Dependencias y entorno: `uv` (`pyproject.toml` + `uv.lock` + `.python-version`)
- Configuración por entorno: `django-environ`, leyendo `.env`
- BD: SQLite en desarrollo, PostgreSQL en producción
- Tests: `pytest` + `pytest-django`
- Lint y formato: `ruff`

## Estructura

```
config/settings/       base.py, dev.py, prod.py
config/urls.py         URLs raíz de la API
apps/<dominio>/        una app por dominio (models, services, serializers, views)
apps/accounts/         usuario propio, login y perfil
apps/catalog/          películas, salas y funciones
apps/booking/          reservas y butacas
apps/common/           utilidades realmente compartidas
frontend/              React + TypeScript + Tailwind (Vite)
tests/                 tests que cruzan apps
specs/                 qué debe hacer el sistema
docs/                  cómo está construido
```

`manage.py` usa `config.settings.dev`; `wsgi.py` y `asgi.py` usan `config.settings.prod`.

## Comandos

```bash
uv sync                                   # instalar/actualizar dependencias
uv run python manage.py check             # comprobación rápida de configuración
uv run python manage.py runserver
uv run python manage.py makemigrations <app>
uv run python manage.py migrate
uv run python manage.py startapp <dominio> apps/<dominio>
uv run pytest
uv run pytest apps/<dominio>/ -q
uv run ruff check .
uv run ruff format .
```

Fallback sin `uv`, dentro de un `.venv` activado:

```bash
python -m venv .venv
pip install -e .
python manage.py runserver
pytest
```

Nunca inventes comandos: si el proyecto no tiene la herramienta, dilo en vez de simularlo.

## Entorno

- Copia `.env.example` a `.env` para configuración local. `.env` está en `.gitignore`.
- En desarrollo `DJANGO_SECRET_KEY` tiene un default inseguro; en producción es obligatorio.
- No añadas secretos al repositorio, ni siquiera en tests o fixtures.

## Specs

- `specs/` es la fuente de verdad del **comportamiento esperado** (qué hace el sistema
  y qué no puede hacer).
- `docs/` explica **cómo está construido** y cómo se opera.
- `AGENTS.md` (este archivo) describe **cómo se trabaja** en el repo.

Antes de implementar:

1. Abre `specs/README.md` y localiza la spec de la funcionalidad.
2. Lee la spec completa y verifica los criterios de aceptación.
3. Si el código y la spec se contradicen, **pregunta** antes de asumir cuál está bien.

Después de implementar: actualiza la spec en el mismo cambio si el comportamiento
cambió. Una spec desactualizada es peor que no tener spec.

## Convenciones

- Una app de Django por dominio (`apps/<dominio>`), no una app monolítica.
- Lógica de negocio en `services.py`; las vistas solo orquestan.
- Serializers para validación de entrada, nunca validación en la vista.
- Migraciones: una por cambio lógico, con nombre descriptivo, nunca editando una ya aplicada.
- `AUTH_USER_MODEL` personalizado **antes** de la primera migración aplicada.
- El login es por `email`; no reintroducir `username` en ningún sitio.
- Todo endpoint es privado por defecto (`IsAuthenticated` global); abrir uno requiere justificarlo.
- URLs de negocio bajo `/api/v1/`, con barra final consistente.
- La disponibilidad de butacas la garantiza el índice único parcial `unique_active_seat_per_screening`, no una comprobación en Python: no lo sustituyas.

## Frontend

- `frontend/` es React + TypeScript + Tailwind, servido por Vite en el puerto 5173.
- Todo acceso a la API pasa por `src/api/client.ts`; no llamar a `fetch` desde componentes.
- En desarrollo Vite proxya `/api` a `http://127.0.0.1:8000`; no hace falta configurar CORS.
- La sesión vive en `AuthContext` y el token en `localStorage`.
- Verificación antes de terminar: `cd frontend; npm run build` sin errores de TypeScript.

## Reglas

- No commitear secretos ni `.env`.
- No borrar ni reescribir migraciones existentes.
- No añadir dependencias sin justificarlo en el mensaje de commit.
- Antes de decir que algo está terminado: `uv run pytest` en verde y `uv run ruff check .` limpio.
