# Specs

Índice de especificaciones. Cada archivo describe **qué** debe hacer una parte del
sistema y **qué restricciones** tiene. Este índice es lo único que se carga siempre
en el contexto del agente; las specs concretas se leen cuando son relevantes.

## Índice

| Spec | Dominio | Estado |
| --- | --- | --- |
| [001-api-base.md](001-api-base.md) | Núcleo de la API | aprobada |
| [002-auth.md](002-auth.md) | Autenticación email + JWT | implementada |

## Cómo escribir una spec

Usa `_plantilla.md` como base. Reglas:

1. **Un archivo por funcionalidad**, no por capa técnica.
2. Requisitos **numerados** (`R1`, `R2`…) para poder referenciarlos en commits y revisiones.
3. Criterios de aceptación **verificables**: si no se puede comprobar, no sirve.
4. **Restricciones explícitas**: lo que no se puede hacer importa tanto como lo que sí.
5. Nada de detalles de implementación (eso va en `docs/`).
6. Al cambiar el comportamiento, actualiza la spec en el mismo cambio.

## Estados

- `borrador` — en discusión, no implementar todavía.
- `aprobada` — lista para implementar.
- `implementada` — el código cumple los criterios de aceptación.
- `obsoleta` — reemplazada por otra spec; enlázala.

## Lo que NO va aquí

- Cómo se despliega el servicio → `docs/`.
- Convenciones de código y comandos → `AGENTS.md`.
- Prohibiciones duras → `opencode.jsonc` (`permissions` / `policies`), porque ahí sí se aplican.
