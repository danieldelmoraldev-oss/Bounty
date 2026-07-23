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

## Despliegue

- **Server → Render**: hay un `render.yaml` (Blueprint) en la raíz. En Render:
  "New +" → "Blueprint" → conectar el repo de GitHub → Render detecta
  `render.yaml` solo. Hay que rellenar a mano en el dashboard (quedan fuera
  del yaml a propósito, son secretos): `MONGODB_URI`, `JWT_SECRET`,
  `OPENAI_API_KEY`. El servicio usa `DATA_MODE=live` (base `bounty_live`,
  arranca vacía) y queda en `https://bounty-server.onrender.com`, que ya es
  la URL que espera `apps/mobile/.env.production`.
- **Landing → Vercel**: "Add New" → "Project" → importar el repo → en
  "Root Directory" seleccionar `apps/landing` (Next.js se detecta solo, sin
  variables de entorno necesarias por ahora).
- **Importante en MongoDB Atlas**: en "Network Access" hay que permitir
  `0.0.0.0/0` ("Allow access from anywhere"). Ni el ordenador de desarrollo
  ni Render tienen una IP fija, así que restringir por IP concreta corta la
  conexión tarde o temprano.

## Fotos y vídeos (Cloudinary)

El móvil sube las fotos (retos y cámara libre) directamente a Cloudinary desde
el dispositivo, sin pasar por el servidor: solo le llega la URL resultante.
Variables en `apps/mobile/.env.development` / `.env.production`
(`EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`, `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET`)
— no son secretos, son públicas por diseño de los presets "unsigned" de
Cloudinary. El preset debe tener **Signing Mode = Unsigned** en su dashboard
o las subidas fallan con 400.

## Roadmap

El plan completo por fases vive en las notas del proyecto. Resumen: 0)
Cimientos ✅, 1) Identidad y grupos ✅, 2) Temporadas y ranking ✅, 3) Motor de
retos ✅, 4) Cámara libre y álbum ✅, 5) Economía y tienda ✅ (buffs de puntos,
sabotajes entre miembros con efectos temporales, marcos y títulos
cosméticos), 6) Recaps, 7) Preparación de release (EAS build + Play Store).
