# Estado y continuidad — Showroom Inmobiliario

> **Propósito de este archivo:** permitir retomar el proyecto **en otra PC** (tras `git clone`) sin
> perder el hilo. La "memoria" de Claude Code es local a cada máquina y **no** viaja con el repo, por
> eso todo el contexto crítico está acá y en `docs/contexto/memoria/` (snapshot) + `docs/superpowers/`.

Última actualización: **2026-06-22** (retomado en PC nueva con **Linux/Ubuntu 26.04**).

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

| #   | Tarea                               | Estado                                                                                                           |
| --- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | Scaffold Next.js + TS + git         | ✅ hecha                                                                                                         |
| 2   | TS estricto + Prettier + LF         | ✅ hecha                                                                                                         |
| 3   | Vitest + `formatUsd` (TDD)          | ✅ hecha (verde)                                                                                                 |
| 4   | Playwright + E2E home (TDD)         | ✅ hecha (verde)                                                                                                 |
| 5   | Repo GitHub + push                  | ✅ hecha · branch protection en `main` ACTIVA (checks `ci`+`lighthouse`, strict, enforce_admins, PR obligatorio) |
| 6   | CI GitHub Actions                   | ✅ `ci.yml` en `main`, runs VERDES (incluye PR #1)                                                               |
| 7   | Lighthouse CI                       | ✅ hecha · `lighthouserc.json` + job `lighthouse` en `ci.yml`; mergeado en PR #1 (verde)                         |
| 8   | Supabase local (Docker)             | ✅ hecha (2026-06-22) · stack local arriba en `:54321` (Studio `:54323`)                                         |
| 9   | Schema profiles/roles/RLS (TDD)     | ✅ hecha (2026-06-22) · migración `init_auth` aplicada · 6/6 tests verdes                                        |
| 10  | Clientes Supabase + env             | ✅ hecha (2026-06-22) · `client.ts`/`server.ts` + `.env.example`/`.env.local`                                    |
| 11  | Login + dashboard por rol (E2E TDD) | ✅ hecha (2026-06-22) · `src/proxy.ts` (Next 16) + login/dashboard · 3 E2E verdes                                |
| 12  | Supabase staging + prod             | ⏳ pendiente (necesita `supabase login`)                                                                         |
| 13  | Vercel preview + prod               | ⏳ pendiente (necesita `vercel login`)                                                                           |
| 14  | DISENO.md + README + tag v0.1.0     | ⏳ pendiente                                                                                                     |

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

> **Tasks 5, 6 y 7 ✅** (2026-06-20) y **Tasks 8 y 9 ✅** (2026-06-22, en la PC Linux). Trabajo en la rama
> `feature/fase0-supabase-auth` (5 commits, todavía **sin pushear** — falta instalar/loguear `gh` en esta
> PC). **Retomar acá: Task 12.** Tasks 12–13 necesitan logins interactivos (`supabase login`, `vercel
> login`); para pushear la rama y abrir PR falta `gh` (instalar + `gh auth login`).

1. ~~**Task 8:** `supabase init` + `supabase start`.~~ ✅ Stack local arriba. Claves (nuevo formato) en §9.
2. ~~**Task 9:** migración `init_auth` + tests de RLS.~~ ✅ 6/6 verdes. Ojo: hubo que **agregar GRANTs
   explícitos** a `authenticated`/`service_role` (Supabase moderno ya no los otorga solo en tablas nuevas).
3. ~~**Tasks 10–11:** clientes Supabase + login + `/dashboard` por rol + E2E.~~ ✅ 3 E2E verdes. Ojo:
   **Next 16 renombró `middleware.ts` → `proxy.ts`** (función `proxy`); y Playwright requirió **1.61**
   (la 1.60 no soporta Ubuntu 26.04). User E2E sembrado idempotente con `tests/e2e/seed.ts`.
4. **Task 12 (retomar acá):** `supabase login` → crear proyectos `showroom-staging` y `showroom-prod` → `db push`.
5. **Task 13:** `vercel login` → `vercel link` + `vercel git connect` + env vars preview(staging)/prod.
6. **Task 14:** `DISENO.md`, `README`, tag `v0.1.0` → deploy producción. Verificación final de fase.

> **Pendiente de infra para pushear:** instalar `gh` (`sudo apt-get install -y gh` o
> `https://cli.github.com`), `gh auth login`, luego `git push -u origin feature/fase0-supabase-auth` y
> abrir PR. El CI (`ci.yml`) hoy NO levanta Supabase, así que los tests de integración/E2E que dependen de
> la DB fallarían en CI — falta agregar un job con `supabase start` (ver nota en el plan, Task 9 Step 5).

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

---

## 9. Notas de la PC Linux (Ubuntu 26.04) — setup que difiere del plan original (Windows)

El plan asumía Windows + Docker Desktop. En esta PC (Ubuntu 26.04) el setup fue:

- **Docker:** `sudo apt-get install -y docker.io` (Docker **Engine** nativo 29.1.3, NO Docker Desktop —
  mucho más liviano, sin VM; esto resolvió el problema de memoria que nos frenó antes). Daemon habilitado
  con `sudo systemctl enable --now docker`. Usuario en grupo `docker` (`sudo usermod -aG docker $USER`).
  - ⚠️ Tras `usermod`, el grupo no se activa en sesiones ya abiertas. Como `newgrp`/`sg` no están
    instalados, para usar docker **sin reloguear** se corre vía `sudo -u $USER <cmd>` (recalcula los
    grupos desde `/etc/group`). Lo ideal a futuro: cerrar sesión y volver a entrar una vez.
- **Supabase CLI 2.107.0:** `npm i -g supabase` sigue deshabilitado. Se instaló el **tarball** de
  `github.com/supabase/cli/releases` en `~/.local/bin` (ya en PATH). Importante: el release trae **dos**
  binarios (`supabase` = shim + `supabase-go` = CLI real); hay que extraer **ambos** juntos o `supabase`
  falla con "Could not find the supabase-go binary".
- **`gh` / `vercel login` / `supabase login`:** aún NO hechos en esta PC (gh ni siquiera instalado).
  Bloquean push/PR y Tasks 12–13.

### Claves de Supabase local (formato NUEVO)

Esta versión del CLI ya **no** imprime `anon key` / `service_role key` (JWT legacy), sino el formato nuevo.
Equivalencias usadas en el código/tests:

| Plan (legacy)    | Esta versión   | Cómo obtenerla              |
| ---------------- | -------------- | --------------------------- |
| API URL          | Project URL    | `http://127.0.0.1:54321`    |
| anon key         | **Publishable** (`sb_publishable_…`) | `supabase status` |
| service_role key | **Secret** (`sb_secret_…`)           | `supabase status` (NO commitear) |

Son *shared defaults* de dev local (no producción), pero igual obtené los valores con `supabase status`
en vez de hardcodearlos. Los tests de RLS los toman de las env vars `SUPABASE_LOCAL_URL` /
`SUPABASE_LOCAL_ANON_KEY` / `SUPABASE_LOCAL_SERVICE_KEY` (ver `tests/helpers/supabase.ts`).

### Desvío en la migración `init_auth`

Supabase moderno es *secure by default*: no auto-otorga privilegios de tabla a `authenticated`/`anon`/
`service_role` en tablas nuevas. Por eso la migración agrega GRANTs explícitos
(`grant select, update … to authenticated;` y `grant all … to service_role;`). Sin esto, RLS daba
`permission denied for table profiles` (error 42501) aunque las políticas fueran correctas.
