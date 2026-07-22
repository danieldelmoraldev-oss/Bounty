# Bounty

Red social privada y gamificada para grupos de amigos: temporadas, retos por
niveles de dificultad, sabotajes y un álbum histórico de cada fiesta.

## Estructura

```
apps/
  mobile/    Expo (React Native + TypeScript) — la app
  server/    API en Express + TypeScript — Render
  landing/   Next.js — landing de marketing en Vercel
packages/
  shared/    Tipos TypeScript compartidos entre mobile y server
```

## Requisitos

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Una cuenta de MongoDB Atlas (connection string en `apps/server/.env`)

## Arranque en local

```bash
pnpm install

# 1. Backend
cp apps/server/.env.example apps/server/.env   # y rellena MONGODB_URI
pnpm dev:server        # http://localhost:4000/health

# 2. App móvil (en otra terminal)
cp apps/mobile/.env.local.example apps/mobile/.env.local  # pon tu IP de red local
pnpm dev:mobile
```

La app usa `EXPO_PUBLIC_API_URL` para saber a qué backend hablar. En local,
Expo carga automáticamente `.env.development` (o tu `.env.local`, si existe,
que tiene prioridad y no se versiona). En builds de producción/EAS carga
`.env.production`, que debe apuntar a la URL de Render.

## Entornos y datos de demo

El backend decide con `DATA_MODE=mock|live` en su `.env` si trabaja contra la
base de demo (poblada con `pnpm seed`, datos falsos pero reales en Mongo) o
contra la base de producción. La app nunca necesita saberlo: solo habla con
la URL de API que le indique su propio `.env`.

## Roadmap

El plan completo por fases vive en las notas del proyecto. Resumen: 0)
Cimientos (este commit), 1) Identidad y grupos, 2) Temporadas y ranking, 3)
Motor de retos, 4) Cámara libre y álbum, 5) Economía y tienda, 6) Recaps, 7)
Preparación de release (EAS build + Play Store).
