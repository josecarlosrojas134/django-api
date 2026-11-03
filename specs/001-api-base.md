# API base

**Estado:** borrador
**Dominio:** núcleo

## Contexto

Punto de partida del backend: una API REST mínima y verificable sobre la que construir
los dominios siguientes. Sirve para validar el esqueleto (configuración, tests,
autenticación y errores) antes de añadir reglas de negocio.

## Requisitos

- **R1:** existe un endpoint `GET /api/health/` que responde `200` con `{"status": "ok"}` sin autenticación.
- **R2:** existe un endpoint `GET /api/me/` que devuelve el usuario autenticado (`id`, `email`) y `401` si no hay sesión.
- **R3:** los errores de validación devuelven `400` con un cuerpo uniforme `{"detail": ..., "fields": {...}}`.
- **R4:** todas las rutas de negocio viven bajo `/api/` y van versionadas como `/api/v1/`.
- **R5:** la configuración se lee de variables de entorno; `.env.example` documenta todas las necesarias.

## Criterios de aceptación

- [ ] `GET /api/v1/health/` responde `200` y `{"status": "ok"}` sin token.
- [ ] `GET /api/v1/me/` sin sesión responde `401` con `{"detail": "..."}`.
- [ ] `GET /api/v1/me/` con sesión válida responde `200` con solo `id` y `email`.
- [ ] Un serializer inválido produce `400` con la clave `fields` y el detalle por campo.
- [ ] `pytest` pasa en un clon limpio tras `uv sync` y `migrate`.
- [ ] Arrancar sin `DJANGO_SECRET_KEY` falla con un mensaje claro, no con un traceback de Django.

## Fuera de alcance

- Registro público de usuarios, OAuth, refresh tokens.
- Documentación OpenAPI generada automáticamente (se evalúa en otra spec).

## Restricciones

- No usar el `User` por defecto: `AUTH_USER_MODEL` personalizado desde la primera migración.
- Ninguna vista puede contener lógica de negocio; va en `services.py`.
- Sin secretos en el repositorio, ni siquiera en tests.
- SQLite en desarrollo; nada de SQL específico de PostgreSQL en este alcance.

## Preguntas abiertas

- [ ] ¿Autenticación por sesión, token simple o JWT? (bloquea R2)
- [ ] ¿`email` como identificador único de login?
