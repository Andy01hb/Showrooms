---
name: project-showroom-inmobiliario
description: "Goal and scope of the user's real-estate 3D showroom platform project"
metadata:
  node_type: memory
  type: project
  originSessionId: aea19027-6cde-4cde-bdc2-edc0b2500667
---

El usuario está construyendo (desde cero, como proyecto de aprendizaje + producto real) una plataforma de **showroom inmobiliario para preventa de departamentos**, al nivel de https://urbania3d.app (su referencia explícita). Objetivo desde el día uno: producto completo, no solo un visor. Triple meta: aprender a programar, compartir con clientes, y portafolio profesional.

La plataforma tiene dos mitades conectadas por la base de datos: (1) **Experiencia/vidriera** = showroom navegable (PNG con hotspots → 360° → 3D real), mapa maestro interactivo, recorridos; (2) **Negocio/motor** = catálogo proyecto→torre→piso→unidad, estados comerciales con disponibilidad en vivo, precios y planes de pago, CRM (leads, reservas, embudo de preventa).

El usuario tiene PNGs (renders y/o planos AutoCAD) sin saber el orden de navegación; por eso necesita un editor visual de recorridos. Eso es la Fase 1 (núcleo de experiencia), pero se construye como componente del producto grande.

Plan por fases: 0) Cimientos · 1) Visor+editor PNG · 2) Catálogo de unidades · 3) Conectar vidriera+negocio (mapa maestro + disponibilidad live) · 4) Ventas/CRM · 5) Finanzas de preventa · 6) Pulido + 360/3D + analíticas.

Estado al 2026-06-14 (actualizado): diseño de proceso COMPLETO y aprobado. Vía superpowers (brainstorming→writing-plans) se escribieron dos documentos en el repo (carpeta `docs/superpowers/`, aún sin git):

- **Spec / plan maestro:** `docs/superpowers/specs/2026-06-14-plan-maestro-design.md` — proceso + visión: entornos, branches, flujo diario, seguridad por capas, escalabilidad, testing, y cómo encaja con las 6 fases del producto.
- **Plan de implementación Fase 0 (Cimientos):** `docs/superpowers/plans/2026-06-14-fase-0-cimientos.md` — 14 tareas con comandos exactos y TDD (scaffold Next+TS, tooling, Vitest/Playwright, GitHub repo+branch protection, CI Actions, Lighthouse CI, Supabase local+staging+prod, schema identidad profiles/roles/RLS, clientes Supabase, login+ruta protegida, Vercel preview+prod, DISENO.md, tag v0.1.0).

EN EJECUCIÓN (Fase 0, inline) — progreso al retomar 2026-06-14:

- **Tooling instalado en la máquina (Windows):** Node 24.16.0 LTS + npm 11.13.0 (winget), gh 2.94.0 (winget), Vercel CLI 54.14.0 (npm -g), Supabase CLI 2.106.0 (binario en `C:\Users\valer\bin`, agregado al PATH usuario). Docker Desktop corriendo. Git identity global seteada: name "Andy", email andyxdjajaja@gmail.com.
- **Repo GitHub:** el usuario lo creó a mano → **https://github.com/Andy01hb/Showrooms** (usuario `Andy01hb`), **PÚBLICO** (el plan decía privado; se dejó público, sirve para portafolio; sin secretos porque `.env*` está gitignored). `main` pusheado.
- **Auth GitHub (importante):** `gh auth login` NO se completó (problemas con flujo interactivo en el shell `!`). En su lugar git push funciona vía **Git Credential Manager** (helper `manager`), y `gh` se opera con `GH_TOKEN` extraído de GCM así: `export GH_TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null | grep '^password=' | cut -d= -f2-)`. Ese token tiene scopes `gist, repo, workflow` (alcanza para push, workflows CI, branch protection, PRs; le falta `read:org` que solo bloquea el login interactivo, no `GH_TOKEN`).
- **Tasks Fase 0 completadas:** 1 (scaffold Next 16.2.9 + TS, NO Next 15 como decía el plan; React 19.2.4), 2 (TS estricto + Prettier + .gitattributes LF), 3 (Vitest + formatUsd, verde), 4 (Playwright + E2E home, verde). 5 en curso (repo+push hechos; falta branch protection, va tras CI). Commits con trailer Co-Authored-By Claude.
- Notas: el shell PowerShell del harness corre como admin (Scoop se negó). Bash del harness no hereda PATH de winget en sesión abierta; prefijar `export PATH="$PATH:/c/Program Files/nodejs:/c/Users/valer/AppData/Roaming/npm"`. `create-next-app .` falló por nombre de carpeta `Showroom(Andy)` (mayúsculas/paréntesis); se scaffoldeó en temp con nombre `showroom-inmobiliario` y se movió. AGENTS.md/CLAUDE.md generados por create-next-app advierten que Next 16 difiere del training; leer `node_modules/next/dist/docs/` antes de tocar APIs de Next.

PENDIENTE Fase 0: Tasks 6 (CI Actions), 7 (Lighthouse), 8 (Supabase local), 9 (schema profiles/RLS), 10 (clientes Supabase), 11 (login+dashboard), 12 (Supabase staging+prod — necesita `supabase login`), 13 (Vercel — necesita `vercel login`), 14 (DISENO.md/README/tag v0.1.0). Logins interactivos aún pendientes: `supabase login`, `vercel login`.

Ver [[tech-stack-decisions]], [[domain-modelo-inmobiliario]], [[user-preferences-showroom]].
