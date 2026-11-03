# Checklist antes de dar una tarea por terminada

## Código

- [ ] La lógica de negocio está en `services.py`, no en la vista.
- [ ] El serializer no acepta campos que el cliente no controla (`id`, `owner`, `created_at`).
- [ ] Los permisos del endpoint están declarados explícitamente.
- [ ] No hay `print()` ni `pdb` olvidados.
- [ ] No hay secretos ni valores de entorno hardcodeados.

## Base de datos

- [ ] La migración se generó y se aplicó en local.
- [ ] Los campos nuevos no nulos tienen `default` o son `null=True`.
- [ ] No se editó una migración ya aplicada.
- [ ] Los índices existen para los campos usados en filtros frecuentes.

## Tests

- [ ] Cada criterio de aceptación de la spec tiene al menos un test.
- [ ] Se cubre el camino de error, no solo el feliz.
- [ ] `uv run pytest` pasa completo.
- [ ] `uv run ruff check .` no reporta nada.

## Spec

- [ ] Todos los requisitos están cubiertos o justificados como fuera de alcance.
- [ ] La spec refleja el comportamiento real implementado.
- [ ] El estado de la spec está actualizado y el índice de `specs/README.md` también.
