# Frontend

React + TypeScript + Tailwind, empaquetado con Vite.

## Comandos

```bash
npm install
npm run dev      # http://localhost:5173, con proxy /api -> http://127.0.0.1:8000
npm run build    # comprueba tipos y genera dist/
npm run preview
```

## Estructura

```
src/
├── api/client.ts        # único punto de acceso a la API
├── auth/AuthContext.tsx # sesión JWT y usuario actual
├── components/          # Layout y rutas protegidas
├── lib/format.ts        # fechas y precios en formato español
├── pages/               # cartelera, butacas, reservas y login
└── types.ts             # tipos que reflejan la API
```

El backend debe estar corriendo en el puerto 8000. Para levantar ambos a la vez
desde la raíz del repositorio: `.\dev.ps1`.
