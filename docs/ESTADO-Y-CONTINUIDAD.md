# Estado y continuidad — Showroom Inmobiliario

> **Propósito de este archivo:** permitir retomar el proyecto **en otra PC** (tras `git clone`) sin
> perder el hilo. La "memoria" de Claude Code es local a cada máquina y **no** viaja con el repo, por
> eso todo el contexto crítico está acá y en `docs/contexto/memoria/` (snapshot) + `docs/superpowers/`.

Última actualización: **2026-06-14**.

---

## 0. Cómo retomar en otra PC (TL;DR)

```bash
git clone https://github.com/Andy01hb/Showrooms.git
cd Showrooms
# 1) Instalar prerequisitos (ver §3)
# 2) Instalar dependencias del proyecto:
npm install
# 3) Logins interactivos una vez (ver §4): gh / supabase / vercel
# 4) Levantar Supabase local (necesita Docker corriendo): supabase start
# 5) Copiar .env.example -> .env.local y completar con las keys de `supabase start`
npm run dev   # http://localhost:3000
```

Y para que **Claude** retome el hilo en la PC nueva, decile algo como:

> "Leé `docs/ESTADO-Y-CONTINUIDAD.md`, `docs/contexto/memoria/` y `docs/superpowers/` y seguí la Fase 0
> desde donde quedó."

Opcional (recomendado): restaurar la memoria de Claude — ver §7.

---

## 1. Qué es el proyecto (resumen)

Plataforma de **showroom inmobiliario para preventa de departamentos**, referencia https://urbania3d.app.
Dos mitades unidas por la DB: (1) **vidriera** navegable (PNG con hotspots → 360° → 3D) y (2) **motor de
negocio** (catálogo proyecto→torre→piso→unidad, disponibilidad en vivo, CRM de preventa). Triple meta:
aprender a programar, producto real para clientes, y portafolio. Detalle de dominio en
`docs/contexto/memoria/domain-modelo-inmobiliario.md`.

Plan por fases: **0) Cimientos** (en curso) · 1) Visor+editor PNG · 2) Catálogo · 3) Vidriera+negocio
(mapa maestro + disponibilidad live) · 4) Ventas/CRM · 5) Finanzas preventa · 6) Pulido + 360/3D.

---

## 2. Dónde estamos — progreso de la Fase 0

Ejecutando el plan `docs/superpowers/plans/2026-06-14-fase-0-cimientos.md` **inline** (acordado: inline
para Fase 0 por lo interactivo; subagentes desde Fase 1). Estado por tarea:

| #   | Tarea                               | Estado                                                                                      |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | Scaffold Next.js + TS + git         | ✅ hecha                                                                                    |
| 2   | TS estricto + Prettier + LF         | ✅ hecha                                                                                    |
| 3   | Vitest + `formatUsd` (TDD)          | ✅ hecha (verde)                                                                            |
| 4   | Playwright + E2E home (TDD)         | ✅ hecha (verde)                                                                            |
| 5   | Repo GitHub + push                  | ✅ repo creado y `main` pusheado · ⏳ **falta branch protection** (va tras CI)              |
| 6   | CI GitHub Actions                   | ✅ `ci.yml` en `main`; **falta confirmar el run verde** en GitHub Actions y proteger `main` |
| 7   | Lighthouse CI                       | ⏳ pendiente                                                                                |
| 8   | Supabase local (Docker)             | ⏳ pendiente                                                                                |
| 9   | Schema profiles/roles/RLS (TDD)     | ⏳ pendiente                                                                                |
| 10  | Clientes Supabase + env             | ⏳ pendiente                                                                                |
| 11  | Login + dashboard por rol (E2E TDD) | ⏳ pendiente                                                                                |
| 12  | Supabase staging + prod             | ⏳ pendiente (necesita `supabase login`)                                                    |
| 13  | Vercel preview + prod               | ⏳ pendiente (necesita `vercel login`)                                                      |
| 14  | DISENO.md + README + tag v0.1.0     | ⏳ pendiente                                                                                |

**Lo ya construido en el repo:** Next.js 16.2.9 (App Router, TS estricto, Tailwind v4), home mínima
(`src/app/page.tsx`), helper `src/lib/format.ts` (`formatUsd`) con test, E2E de la home, Vitest +
Playwright configurados, Prettier, `.gitattributes` (LF), workflow `.github/workflows/ci.yml`.

---

## 3. Entorno requerido en una PC nueva

Verificá/instalá (Windows; en otra plataforma, el equivalente):

| Herramienta                | Verificar            | Instalar (Windows)                                                                                                                                                                                                                                                             |
| -------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Node.js LTS (≥20) + npm    | `node -v`            | `winget install OpenJS.NodeJS.LTS`                                                                                                                                                                                                                                             |
| Git                        | `git --version`      | `winget install Git.Git`                                                                                                                                                                                                                                                       |
| Docker Desktop (corriendo) | `docker info`        | instalar Docker Desktop y abrirlo                                                                                                                                                                                                                                              |
| GitHub CLI                 | `gh --version`       | `winget install GitHub.cli`                                                                                                                                                                                                                                                    |
| Vercel CLI                 | `vercel --version`   | `npm i -g vercel`                                                                                                                                                                                                                                                              |
| Supabase CLI               | `supabase --version` | binario de https://github.com/supabase/cli/releases (en la PC original quedó en `C:\Users\valer\bin` agregado al PATH usuario). Alternativa: `scoop install supabase` (Scoop NO se instala desde una terminal admin). `npm i -g supabase` está **deshabilitado** por Supabase. |

Notas de la máquina original (pueden no aplicar en otra PC):

- Node 24.16.0 LTS, npm 11.13.0, gh 2.94.0, Vercel 54.14.0, Supabase 2.106.0, Docker 29.5.3.
- El **Bash** del entorno no heredó el PATH de winget en sesiones ya abiertas; al correr comandos había
  que prefijar `export PATH="$PATH:/c/Program Files/nodejs:/c/Users/valer/AppData/Roaming/npm:/c/Users/valer/bin"`.
- Git identity global: `user.name=Andy`, `user.email=andyxdjajaja@gmail.com`.

---

## 4. Logins interactivos (una vez por máquina)

- **GitHub:** `gh auth login --hostname github.com --git-protocol https --web` (scopes necesarios:
  `repo`, `workflow`, y para `gh` completo también `read:org`; para branch protection conviene
  `admin:repo_hook`). En la PC original el `gh auth login` interactivo no se completó; se operó `gh` con
  `GH_TOKEN` extraído de Git Credential Manager:
  ```bash
  export GH_TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill | grep '^password=' | cut -d= -f2-)
  ```
  (ese token de GCM tenía scopes `gist, repo, workflow`). En una PC nueva es más limpio hacer el
  `gh auth login` normal.
- **Supabase:** `supabase login` (necesario para Task 12: crear proyectos staging/prod).
- **Vercel:** `vercel login` (necesario para Task 13).

⚠️ **Nunca** commitear tokens ni `service_role` keys. `.env*` está gitignored (excepto `.env.example`).

---

## 5. Próximos pasos exactos (retomar acá)

1. **Cerrar Task 6 (CI):** confirmar en GitHub → pestaña **Actions** que el workflow **CI** corrió **verde**
   sobre `main` (lint, typecheck, format:check, test, build, audit). Comando: `gh run list` / `gh run watch`.
2. **Task 5 (branch protection):** proteger `main` exigiendo el check `ci` y PR obligatorio:
   ```bash
   gh api -X PUT repos/Andy01hb/Showrooms/branches/main/protection \
     -H "Accept: application/vnd.github+json" \
     -f "required_status_checks[strict]=true" \
     -f "required_status_checks[checks][][context]=ci" \
     -f "enforce_admins=true" \
     -f "required_pull_request_reviews[required_approving_review_count]=0" \
     -f "restrictions=null"
   ```
   (Repo es **público**, así branch protection está disponible en free tier.)
3. **Task 7:** Lighthouse CI (`lighthouserc.json` + job en `ci.yml`).
4. **Task 8:** `supabase init` + `supabase start` (Docker corriendo). Anotar API URL + anon/service keys.
5. **Task 9:** migración `init_auth` (tabla `profiles`, enum `user_role` admin/broker/cliente, RLS
   default-deny, trigger, helper `current_user_role()`) + tests de RLS (Vitest integración).
6. **Tasks 10–11:** clientes `@/lib/supabase/{client,server}`, `.env.example`/`.env.local`, login +
   `/dashboard` protegido por rol + E2E de auth.
7. **Task 12:** `supabase login` → crear proyectos `showroom-staging` y `showroom-prod` → `db push`.
8. **Task 13:** `vercel login` → `vercel link` + `vercel git connect` + env vars preview(staging)/prod.
9. **Task 14:** `DISENO.md`, `README`, tag `v0.1.0` → deploy producción. Verificación final de fase.

El detalle paso a paso (con comandos y código exacto) está en
`docs/superpowers/plans/2026-06-14-fase-0-cimientos.md`.

---

## 6. Decisiones y desvíos respecto del plan

- **Next.js 16.2.9** (el plan asumía 15) + React 19.2.4. `create-next-app` generó `AGENTS.md`/`CLAUDE.md`
  que advierten que esta versión de Next difiere del training; **leer `node_modules/next/dist/docs/`**
  antes de tocar APIs de Next (middleware, server components, etc.).
- **Repo público** llamado **`Showrooms`** (usuario `Andy01hb`), no privado. Sin secretos en el repo.
  Si se quiere privado: GitHub → Settings → Danger Zone → Change visibility.
- El paquete npm se llama `showroom-inmobiliario` (la carpeta original `Showroom(Andy)` no es nombre npm
  válido por mayúsculas/paréntesis; por eso se scaffoldeó aparte y se movió).
- **Entornos:** 2 reales + previews efímeras como QA — Local (Docker) · Preview/QA por PR (Vercel +
  Supabase **staging**) · Producción (tag `vX.Y.Z`, Vercel prod + Supabase **prod**). Trunk-based: `main`
  siempre desplegable; ramas `feature/*` cortas → PR → CI verde → merge squash. Detalle en
  `docs/superpowers/specs/2026-06-14-plan-maestro-design.md`.
- `.claude/settings.local.json` se dejó **fuera** del repo (gitignored) por ser config local.

---

## 7. Restaurar la "memoria" de Claude en la PC nueva (opcional)

Snapshot en `docs/contexto/memoria/`. Para reinyectarla como memoria persistente de Claude Code en la
PC nueva, copiá esos `.md` (incluido `MEMORY.md`) a la carpeta de memoria del proyecto en esa máquina:

```
<HOME>/.claude/projects/<hash-derivado-del-path-del-proyecto>/memory/
```

(El `<hash...>` lo genera Claude Code a partir de la ruta del proyecto; si no lo encontrás, simplemente
pedile a Claude que lea `docs/contexto/memoria/` y `docs/ESTADO-Y-CONTINUIDAD.md` para reconstruir el
contexto — alcanza para retomar.)

---

## 8. Índice de documentos

- **Este archivo** — estado y cómo retomar.
- `docs/superpowers/specs/2026-06-14-plan-maestro-design.md` — visión + proceso (entornos, branches,
  seguridad, escalabilidad, testing, encaje con las 6 fases).
- `docs/superpowers/plans/2026-06-14-fase-0-cimientos.md` — plan Fase 0, 14 tareas con comandos y TDD.
- `docs/contexto/memoria/*.md` — snapshot de la memoria de Claude (proyecto, stack, dominio, preferencias).
