# django-api

Backend Django con configuración de agentes y specs para OpenCode.

## Estado actual

- Python 3.12 + Django 6.1 + DRF, gestionado con `uv`
- Settings divididos en `base` / `dev` / `prod`, configuración con `django-environ`
- App `apps/common` creada, sin modelos todavía
- Tests y lint funcionando (`pytest`, `ruff`)

## Puesta en marcha

```bash
uv sync
cp .env.example .env
uv run python manage.py check
uv run pytest
uv run python manage.py runserver
```

Todavía **no se ha ejecutado ninguna migración**: falta definir el `AUTH_USER_MODEL`
personalizado antes de la primera. Es el siguiente paso, no lo hagas con el `User` por defecto.

## Estructura

| Ruta | Para qué sirve |
| --- | --- |
| `specs/` | Qué debe hacer el sistema: requisitos, criterios de aceptación, restricciones |
| `docs/` | Cómo está construido y cómo se opera |
| `AGENTS.md` | Cómo se trabaja en el repo: comandos, convenciones, verificación |
| `opencode.jsonc` | Agentes, permisos y bloqueos duros |
| `.opencode/skills/django-backend/` | Flujo de implementación que el agente carga cuando hace falta |

## Uso con OpenCode

- Para escribir requisitos: elige el agente **spec-writer** y pídele una spec del dominio.
- Para implementar: pide al agente principal que use la skill de backend Django.
- Para revisar un cambio: pide que lance el subagente **reviewer**.

## API

| Método | Ruta | Auth | Qué hace |
| --- | --- | --- | --- |
| GET | `/api/v1/health/` | no | estado del servicio |
| POST | `/api/v1/auth/token/` | no | login con email y contraseña |
| POST | `/api/v1/auth/token/refresh/` | no | renueva el access token |
| GET | `/api/v1/me/` | sí | usuario actual |
| GET | `/api/v1/movies/` | no | cartelera |
| GET | `/api/v1/screenings/` | no | funciones futuras |
| GET | `/api/v1/screenings/{id}/seats/` | no | mapa de butacas |
| GET/POST | `/api/v1/reservations/` | sí | mis reservas / crear reserva |
| GET | `/api/v1/reservations/{id}/` | sí | detalle de mi reserva |
| POST | `/api/v1/reservations/{id}/cancel/` | sí | cancelar y liberar butacas |

Datos de ejemplo: `uv run python manage.py seed_demo` (película, sala y dos funciones).
