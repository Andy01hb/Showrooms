---
name: tech-stack-decisions
description: 'Approved tech stack, environments and branch strategy for the showroom project'
metadata:
  node_type: memory
  type: project
  originSessionId: aea19027-6cde-4cde-bdc2-edc0b2500667
---

Stack aprobado por el usuario (2026-06-14) para [[project-showroom-inmobiliario]], priorizando que todo se opere por CLI:

- **Git/host:** GitHub (`gh` CLI)
- **App:** Next.js + TypeScript (front público + admin + API en un solo proyecto)
- **Backend/DB/Auth/Storage/Realtime:** Supabase (`supabase` CLI; Postgres, RLS, auth con roles admin/broker/cliente, storage de imágenes, realtime para disponibilidad en vivo, migraciones como código, dev local con Docker)
- **Deploy:** Vercel (`vercel` CLI; preview deploy automático por PR)
- **Visualización:** PNG/hotspots → Photo Sphere Viewer (360°) → react-three-fiber (3D)
- **Testing:** Vitest (unit/integración + tests de RLS), Playwright (E2E, ya instalado), Lighthouse CI/k6 (perf), npm audit + Dependabot + /security-review

**Entornos — REFINADO 2026-06-14 a "2 reales + previews efímeras como QA" (decisión del usuario: pragmático que escala, para un solo dev):** Local (branch `feature/*`, Supabase local Docker) · **Preview/QA efímero** (URL única por PR en Vercel, apunta a proyecto Supabase **staging** — cumple el rol de "QA desplegado" gratis y automático por PR, sin tercer servidor fijo) · Producción (tag `vX.Y.Z` desde `main`, Vercel production, proyecto Supabase **prod**). NO hay branch `production` ni `staging` fija: prod se promueve con tag manual. Escala a 3 entornos fijos sin reescritura el día que un broker pruebe en serio (solo conectar branch `staging` al Supabase staging que ya existe). Supabase free tier = 2 proyectos (staging+prod); local es Docker. Modelo trunk-based: `main` siempre desplegable, ramas `feature/*` cortas → PR → CI verde → merge squash. Branch protection en `main`: nada entra sin PR + CI verde. DB siempre por migración (nunca clicks en panel).

Seguridad desde el inicio: RLS en Postgres, validación Zod, anti-race en reservas (transacciones/locks), rate limiting en formularios, secretos fuera del repo (service_role nunca en cliente).

Pendiente de ejecutar (requiere login interactivo del usuario una sola vez): `gh auth login`, `supabase login`, `vercel login`. Las cuentas externas tienen free tier suficiente.
