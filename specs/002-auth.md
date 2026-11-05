# Autenticación con email y JWT

**Estado:** implementada
**Dominio:** cuentas

## Contexto

El backend se consume desde clientes que no comparten dominio con la API (móvil,
SPA, integraciones). Las sesiones con cookies complican CORS y CSRF, así que se usa
JWT con el email como identificador.

## Requisitos

- **R1:** el usuario se identifica por `email` único; no existe campo `username`.
- **R2:** `POST /api/v1/auth/token/` con `{email, password}` devuelve `200` con `access`, `refresh` y los datos públicos del usuario.
- **R3:** credenciales incorrectas devuelven `401` con el formato uniforme de error.
- **R4:** `POST /api/v1/auth/token/refresh/` con un `refresh` válido devuelve un `access` nuevo.
- **R5:** `GET /api/v1/me/` con `Authorization: Bearer <access>` devuelve solo `id` y `email`.
- **R6:** los endpoints de cuenta se crean con `User.objects.create_user` / `create_superuser`, sin `username`.
- **R7:** `POST /api/v1/auth/token/` y `POST /api/v1/auth/token/refresh/` están limitados a 10 peticiones por minuto e IP; superar el límite devuelve `429`.

## Criterios de aceptación

- [x] Login con email y contraseña correctos devuelve `access`, `refresh` y `user`.
- [x] Contraseña incorrecta devuelve `401` y no filtra si el email existe.
- [x] `refresh` válido devuelve un `access` nuevo.
- [x] `/api/v1/me/` sin token devuelve `401`.
- [x] `/api/v1/me/` con token devuelve exactamente `{"id", "email"}`.
- [x] `create_superuser` exige `is_staff` y `is_superuser`.
- [x] El dominio del email se normaliza a minúsculas.
- [x] Tras 10 intentos de login en un minuto, el siguiente devuelve `429`.

## Restricciones

- El `access` dura 30 minutos y el `refresh` 7 días.
- No se exponen `password`, `is_staff`, `last_login` ni permisos en ninguna respuesta.
- Sin blacklist de tokens en esta iteración: cerrar sesión es responsabilidad del cliente.
- La contraseña se valida con los validadores de Django, nunca a mano.
- El throttling es por IP y ventana de un minuto, con la cache por defecto de Django.

## Pendiente para más adelante

- Rotación de refresh tokens con `token_blacklist`.
- Verificación de email y recuperación de contraseña.
- Cache compartida (Redis) para el throttling: con `LocMemCache` el límite es por proceso,
  así que con varios workers el límite efectivo se multiplica.
