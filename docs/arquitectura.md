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
│   └── <dominio>/           # models, services, serializers, views, tests
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

- `dev`: SQLite, `DEBUG=True`, errores detallados.
- `prod`: PostgreSQL, `DEBUG=False`, `ALLOWED_HOSTS` explícito, logs a stdout.

## Despliegue

(Pendiente: completar cuando exista el proyecto real.)
