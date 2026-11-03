---
name: Backend Django
description: Implementa funcionalidades de un backend Django/DRF a partir de las specs del proyecto, respetando convenciones y criterios de aceptación
---

## Cuándo se usa

Cuando hay que implementar, ampliar o corregir comportamiento del backend Django
siguiendo una spec de `specs/`.

## Flujo

1. **Localiza la spec.** Lee `specs/README.md`, elige el archivo del dominio y léelo
   completo.
2. **Verifica el estado.** Si está en `borrador`, no implementes: pregunta qué falta
   para aprobarla. Si no existe spec para el cambio, propón escribirla antes.
3. **Traza el plan.** Enumera qué requisitos (`R1`, `R2`…) cubre cada cambio y qué
   archivos tocas. Confirma con el usuario si hay ambigüedad o preguntas abiertas.
4. **Implementa por capas**, en este orden:
   - modelo + migración
   - `services.py` con la lógica
   - serializer (validación)
   - vista + URL
   - tests de los criterios de aceptación
5. **Verifica** con `references/checklist.md` antes de dar nada por terminado.
6. **Actualiza la spec.** Marca estado `implementada` y ajusta lo que haya cambiado.

## Convenciones propias de este repo

- Una app por dominio en `apps/<dominio>`; `apps/common` solo para utilidades reales.
- `services.py` recibe y devuelve datos simples, no `request`.
- Serializers validan; vistas orquestan; modelos no contienen reglas de negocio complejas.
- Migraciones con nombre descriptivo (`0002_add_order_status.py`), nunca editadas después de aplicarse.
- Tests con `pytest` y `@pytest.mark.django_db`, un archivo por capa relevante.
- URLs bajo `/api/v1/`, `trailing_slash` consistente.

## Comandos

```bash
uv run python manage.py makemigrations <app>
uv run python manage.py migrate
uv run pytest apps/<dominio>/ -q
uv run ruff check .
```

## Errores frecuentes que debes evitar

- Escribir lógica de negocio en `views.py` "porque es más rápido".
- Crear un serializer que acepte campos que el cliente no debería poder cambiar (`id`, `owner`).
- Devolver el modelo completo en la respuesta filtrada por permisos.
- Añadir una migración sin revisar el `default` de campos no nulos existentes.
- Añadir dependencias nuevas sin justificarlo.
