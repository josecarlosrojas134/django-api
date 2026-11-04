# Arquitectura

Documentación de **cómo está construido** el backend. Aquí no van requisitos:
eso vive en `specs/`.

## Estructura prevista

```
django-api/
├── config/                  # settings, urls raíz, wsgi/asgi
│   └── settings/
│       ├── base.py
│       ├── dev.py
│       └── prod.py
├── apps/
│   ├── common/              # utilidades compartidas
│   ├── accounts/            # usuario, login y perfil
│   ├── catalog/             # películas, salas y funciones
│   └── booking/             # reservas y butacas
├── frontend/                # React + TypeScript + Tailwind
├── specs/                   # qué debe hacer el sistema
├── docs/                    # cómo está construido (este directorio)
└── manage.py
```

## Capas

| Capa | Responsabilidad | No debe hacer |
| --- | --- | --- |
| `models.py` | Persistencia e invariantes simples | Reglas de negocio cruzadas |
| `services.py` | Casos de uso y reglas de negocio | Conocer `request` o HTTP |
| `serializers.py` | Validación y forma de entrada/salida | Consultas complejas |
| `views.py` | Orquestación HTTP | Lógica de negocio |

## Entornos

- `dev`: SQLite por defecto (o la BD que indique `DATABASE_URL`), `DEBUG=True`,
  errores detallados.
- `prod`: PostgreSQL, `DEBUG=False`, `ALLOWED_HOSTS` explícito, logs a stdout.

## Autenticación

- Usuario propio en `apps/accounts`: email único, sin `username`.
- JWT (`djangorestframework-simplejwt`): `access` 30 min, `refresh` 7 días.
- Todo endpoint es privado por defecto (`IsAuthenticated` global).
- Endpoints: `POST /api/v1/auth/token/`, `POST /api/v1/auth/token/refresh/`, `GET /api/v1/me/`.

## Reservas

- Catálogo público: `GET /api/v1/movies/`, `GET /api/v1/screenings/`, `GET /api/v1/screenings/{id}/`, `GET /api/v1/screenings/{id}/seats/`.
- Reservas privadas: `GET|POST /api/v1/reservations/`, `GET /api/v1/reservations/{id}/`, `POST /api/v1/reservations/{id}/cancel/`.
- Una reserva nace `confirmed`; no hay reserva temporal con expiración.
- La colisión de butacas se resuelve en base de datos: índice único parcial sobre `(screening, row, number)` con `active=True`. Al cancelar se pone `active=False` y la butaca vuelve a estar libre, conservando la reserva como histórico.
- El precio se copia a `Reservation.total` al crear; cambiarlo en la función no altera reservas existentes.

## Despliegue

(Pendiente: completar cuando exista el proyecto real.)
