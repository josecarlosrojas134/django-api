# CINEVOX · django-api

![CI](https://github.com/josecarlosrojas134/django-api/actions/workflows/ci.yml/badge.svg?branch=develop)
![Licencia: MIT](https://img.shields.io/badge/licencia-MIT-blue.svg)

Cartelera de cine y reserva de butacas: Django REST Framework + React + TypeScript,
autenticación JWT y reservas concurrentes sobre salas reales (índice único parcial
`(función, fila, butaca)` para `active=True`).

![Cartelera](docs/screenshots/cartelera.png)

| Ficha de película | Selección de butacas |
| --- | --- |
| ![Ficha](docs/screenshots/ficha.png) | ![Butacas](docs/screenshots/butacas.png) |

Backend Django con specs (`specs/`), documentación (`docs/`), CI y `main` protegida.

## Estado actual

- Python 3.12 + Django 6.1 + DRF, gestionado con `uv`
- Settings divididos en `base` / `dev` / `prod`, configuración con `django-environ`
- Guías de agentes (`AGENTS.md`) y specs vigentes, CI en GitHub Actions (pytest + ruff contra PostgreSQL 16)
- Catálogo (películas, salas, funciones), autenticación JWT y reservas con butacas funcionando

## Puesta en marcha

```bash
uv sync
cp .env.example .env
uv run python manage.py migrate
uv run python manage.py check
uv run pytest
```

### Base de datos

- **Sin configurar nada**: `.env.example` trae `DATABASE_URL=sqlite:///db.sqlite3` y el proyecto crea un `db.sqlite3` en la raíz. Suficiente para tocar el código.
- **PostgreSQL local** (recomendado, igual que producción): crea la base una vez y apunta `DATABASE_URL` a ella.

  ```powershell
  # Windows (PostgreSQL 16)
  psql -U postgres -c "CREATE DATABASE cinema;"
  # .env -> DATABASE_URL=postgres://postgres:TU_PASSWORD@127.0.0.1:5432/cinema
  ```

  Si PostgreSQL no está instalado, los tests igualmente usan la base indicada por `DATABASE_URL`; sin ellas, SQLite.

- **Datos de demo**: `uv run python manage.py seed_demo` siembra 6 películas, 3 salas y 18 funciones con pósters, listas para reservar.
- **Admin**: `uv run python manage.py createsuperuser` y entra a `http://127.0.0.1:8000/admin/`.

Para levantar todo (backend + frontend) en Windows, incluyendo la primera puesta en marcha:

```powershell
.\dev.ps1
```

`dev.ps1` copia `.env` si no existe, hace `uv sync`, `migrate`, `seed_demo`, instala dependencias del frontend si faltan y levanta ambas ventanas. Si prefieres hacerlo a mano:

O por separado:

```bash
uv run python manage.py runserver          # http://127.0.0.1:8000
cd frontend && npm run dev                 # http://localhost:5173
```

## Frontend

React + TypeScript + Tailwind, en `frontend/`.

- Vite hace de proxy: todo lo que va a `/api` se reenvía a `http://127.0.0.1:8000`, así no hace falta CORS en desarrollo.
- Sesión con JWT guardado en `localStorage`; `AuthContext` hidrata el usuario al cargar.
- Pantallas: cartelera, selección de butacas y mis reservas.
- Usuario de ejemplo creado por `seed_demo`: `demo@example.com` / `demo12345`.

## Estructura

| Ruta | Para qué sirve |
| --- | --- |
| `specs/` | Qué debe hacer el sistema: requisitos, criterios de aceptación, restricciones |
| `docs/` | Cómo está construido y cómo se opera |
| `AGENTS.md` | Cómo se trabaja en el repo: comandos, convenciones, verificación |
| `opencode.jsonc` | Agentes, permisos y bloqueos duros |
| `.opencode/skills/django-backend/` | Flujo de implementación que el agente carga cuando hace falta |

## Trabajo en equipo

Si un compañero se une, su base de datos se crea en **su** máquina con los mismos pasos:

1. Instalar PostgreSQL 16 (o usar `sqlite:///db.sqlite3` para algo rápido).
2. `cp .env.example .env` y poner su `DATABASE_URL` (SQLite ya vale) y su `DJANGO_SECRET_KEY`.
3. `uv sync && uv run python manage.py migrate && uv run python manage.py seed_demo`.

La `.env` nunca se comparte (está en `.gitignore`); lo que se comparte es el esquema (migraciones) y los datos de demo (`seed_demo`). Si queréis una **base compartida** (p. ej. un staging), se despliega una instancia PostgreSQL única e apuntan todos a ella con su propia `DATABASE_URL`; entonces hay que coordinar migraciones (una por cambio lógico, nunca editando una aplicada) y limpiarla periódicamente. No repartáis la `.env` de producción: el `SECRET_KEY` y las credenciales no se comparten nunca.

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
| GET | `/api/v1/movies/{id}/` | no | ficha de película |
| GET | `/api/v1/screenings/` | no | funciones futuras |
| GET | `/api/v1/screenings/{id}/seats/` | no | mapa de butacas |
| GET/POST | `/api/v1/reservations/` | sí | mis reservas / crear reserva |
| GET | `/api/v1/reservations/{id}/` | sí | detalle de mi reserva |
| POST | `/api/v1/reservations/{id}/cancel/` | sí | cancelar y liberar butacas |

Datos de ejemplo: `uv run python manage.py seed_demo` (6 películas, 3 salas y 18 funciones con pósters reales; idempotente).

## Licencia

MIT — ver [LICENSE](LICENSE).
