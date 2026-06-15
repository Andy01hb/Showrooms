# Fase 0 — Cimientos · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar montado el esqueleto desplegable del proyecto: un "hola mundo" Next.js + TS que despliega solo por PR con CI verde, login funcional con 3 roles, y la maquinaria de proceso/seguridad/testing del plan maestro operativa.

**Architecture:** Monorepo único Next.js (App Router) + TypeScript estricto. Supabase para Auth/DB/Storage (local vía Docker, remoto staging + prod). Identidad con tabla `profiles` + roles `admin/broker/cliente`, RLS default-deny desde la primera migración. CI en GitHub Actions bloquea merge a `main`. Deploy en Vercel (preview por PR + production por tag). Todo operable por CLI.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · ESLint + Prettier · Vitest · Playwright · Supabase (CLI + supabase-js) · GitHub Actions · Lighthouse CI · Vercel.

**Referencia de diseño:** `docs/superpowers/specs/2026-06-14-plan-maestro-design.md`

---

## Prerrequisitos (manuales, una sola vez — los hace el usuario)

Estos NO son tareas de código; son condiciones previas. Confirmar todas antes de empezar la Task 1.

- [ ] **Docker Desktop** instalado y **corriendo** (Supabase local lo necesita). Verificar: `docker info` no da error.
- [ ] Node.js LTS instalado. Verificar: `node -v` (≥ 20).
- [ ] Cuentas existentes en **GitHub**, **Supabase** y **Vercel** (free tier).
- [ ] Supabase CLI instalado. Verificar: `supabase --version`. Si falta: `npm i -g supabase` o `scoop install supabase`.
- [ ] Vercel CLI instalado. Verificar: `vercel --version`. Si falta: `npm i -g vercel`.
- [ ] GitHub CLI instalado. Verificar: `gh --version`. Si falta: `winget install GitHub.cli`.
- [ ] **Logins interactivos** (el usuario los corre en su terminal, una vez):
  - `gh auth login`
  - `supabase login`
  - `vercel login`

> Nota Windows: las tareas mezclan comandos `npm`/`git`/`gh`/`supabase` (cross-platform) y rutas POSIX en bloques bash. En PowerShell, los comandos funcionan igual salvo encadenamientos `&&` (usar `;` o líneas separadas).

---

## File Structure

Archivos que se crean/modifican en esta fase, con su responsabilidad:

- `package.json` — scripts (`dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`) y deps.
- `tsconfig.json` — TypeScript estricto.
- `.eslintrc` / `eslint.config.mjs` — reglas de lint (de create-next-app) + ajustes.
- `.prettierrc` — formato.
- `vitest.config.ts` — config de tests unit/integración.
- `playwright.config.ts` — config E2E.
- `.env.local` (gitignored) / `.env.example` (commiteado) — variables de entorno.
- `.github/workflows/ci.yml` — pipeline CI (gates de PR).
- `lighthouserc.json` — presupuestos de performance.
- `supabase/config.toml` — config de Supabase local (lo genera `supabase init`).
- `supabase/migrations/*_init_auth.sql` — schema de identidad: `profiles`, roles, RLS, trigger, helper.
- `src/lib/supabase/client.ts` — cliente Supabase para el navegador.
- `src/lib/supabase/server.ts` — cliente Supabase para Server Components/Actions.
- `src/app/page.tsx` — home pública ("hola mundo").
- `src/app/login/page.tsx` — login mínimo.
- `src/app/dashboard/page.tsx` — página protegida por rol (smoke de auth).
- `src/middleware.ts` — protege rutas privadas en el server.
- `tests/unit/*.test.ts` — tests unitarios.
- `tests/integration/*.test.ts` — tests de integración + RLS contra Supabase local.
- `tests/e2e/*.spec.ts` — tests E2E.
- `DISENO.md` — doc de diseño vivo (apunta a specs/plans).
- `README.md` — cómo correr el proyecto.

---

## Task 1: Scaffold Next.js + TypeScript e inicializar git

**Files:**
- Create: todo el scaffold de `create-next-app` en la raíz del proyecto.

- [ ] **Step 1: Generar el proyecto Next.js en la carpeta actual**

Desde `C:\Users\valer\OneDrive\Escritorio\Showroom(Andy)`:

```bash
npx create-next-app@latest . --typescript --eslint --app --src-dir --tailwind --import-alias "@/*" --no-turbopack
```
Cuando pregunte por sobrescribir archivos existentes (ya hay `docs/`), elegir **No** para no borrar `docs/`. Si se queja por carpeta no vacía, mover temporalmente `docs/` fuera, scaffoldear, y devolver `docs/` adentro.

- [ ] **Step 2: Inicializar git (si create-next-app no lo hizo)**

```bash
git init
git branch -M main
```
Expected: `.git/` existe; `git status` corre sin error.

- [ ] **Step 3: Verificar que arranca**

```bash
npm run dev
```
Expected: server en `http://localhost:3000`, página default de Next visible. Cortar con Ctrl+C.

- [ ] **Step 4: Commit inicial**

```bash
git add -A
git commit -m "chore: scaffold Next.js + TypeScript project"
```

---

## Task 2: TypeScript estricto + Prettier

**Files:**
- Modify: `tsconfig.json`
- Create: `.prettierrc`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Activar modo estricto en `tsconfig.json`**

Asegurar que `compilerOptions` incluya:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **Step 2: Crear `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 3: Instalar Prettier y agregar scripts en `package.json`**

```bash
npm i -D prettier
```
Agregar en `"scripts"`:

```json
{
  "typecheck": "tsc --noEmit",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

- [ ] **Step 4: Verificar typecheck y formato**

```bash
npm run typecheck
npm run format
```
Expected: `typecheck` sin errores; `format` reescribe archivos sin fallar.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: strict TypeScript + Prettier"
```

---

## Task 3: Vitest + primer test unitario (TDD)

Validamos la cadena de testing con una función real mínima: un helper de dominio que formatea precios en USD (lo vamos a necesitar igual).

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/format.ts`
- Test: `tests/unit/format.test.ts`
- Modify: `package.json` (script `test`)

- [ ] **Step 1: Instalar Vitest y crear config**

```bash
npm i -D vitest
```
Crear `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
```
Agregar en `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 2: Escribir el test que falla**

Crear `tests/unit/format.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { formatUsd } from '@/lib/format';

describe('formatUsd', () => {
  it('formatea un entero en dólares', () => {
    expect(formatUsd(120000)).toBe('US$120,000');
  });

  it('redondea a entero (sin centavos en precios de lista)', () => {
    expect(formatUsd(99999.6)).toBe('US$100,000');
  });
});
```

- [ ] **Step 3: Correr el test y verificar que falla**

```bash
npm test
```
Expected: FAIL — `Cannot find module '@/lib/format'`.

- [ ] **Step 4: Implementación mínima**

Crear `src/lib/format.ts`:

```ts
export function formatUsd(amount: number): string {
  const rounded = Math.round(amount);
  return `US$${rounded.toLocaleString('en-US')}`;
}
```

- [ ] **Step 5: Correr el test y verificar que pasa**

```bash
npm test
```
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: add Vitest with formatUsd helper"
```

---

## Task 4: Playwright + primer E2E smoke (TDD)

**Files:**
- Create: `playwright.config.ts`
- Test: `tests/e2e/home.spec.ts`
- Modify: `package.json` (script `test:e2e`)

- [ ] **Step 1: Instalar Playwright**

```bash
npm i -D @playwright/test
npx playwright install --with-deps chromium
```

- [ ] **Step 2: Crear `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```
Agregar script: `"test:e2e": "playwright test"`.

- [ ] **Step 3: Escribir el E2E que falla**

Crear `tests/e2e/home.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('home muestra el nombre del showroom', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /showroom/i })).toBeVisible();
});
```

- [ ] **Step 4: Correr el E2E y verificar que falla**

```bash
npm run test:e2e
```
Expected: FAIL — no existe un heading que matchee /showroom/.

- [ ] **Step 5: Implementar la home mínima**

Reemplazar `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main style={{ padding: 32 }}>
      <h1>Showroom Inmobiliario</h1>
      <p>Preventa de departamentos. Plataforma en construcción.</p>
    </main>
  );
}
```

- [ ] **Step 6: Correr el E2E y verificar que pasa**

```bash
npm run test:e2e
```
Expected: PASS (1 test).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: add Playwright E2E + minimal home page"
```

---

## Task 5: Crear repo en GitHub, push y branch protection

**Files:** ninguno (operaciones de plataforma).

- [ ] **Step 1: Crear el repo y subir**

```bash
gh repo create showroom-inmobiliario --private --source=. --remote=origin --push
```
Expected: repo creado en GitHub, `main` pusheado.

- [ ] **Step 2: Verificar el remoto**

```bash
git remote -v
git branch -r
```
Expected: `origin` apunta al repo; existe `origin/main`.

- [ ] **Step 3: Configurar branch protection en `main`** (se completa después de tener el CI, Task 6 — dejar el comando listo aquí)

Tras crear `ci.yml`, exigir el status check `ci` y PR obligatorio:

```bash
gh api -X PUT repos/:owner/showroom-inmobiliario/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[checks][][context]=ci" \
  -f "enforce_admins=true" \
  -f "required_pull_request_reviews[required_approving_review_count]=0" \
  -f "restrictions=null"
```
Expected: respuesta 200 con la config de protección. (Si el plan free no permite branch protection en repos privados, alternativa: mantener repo **público** o aplicar la disciplina manualmente. Documentarlo si pasa.)

- [ ] **Step 4: Commit** (no hay cambios de archivos; saltar si nada cambió).

---

## Task 6: Pipeline CI en GitHub Actions

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Crear el workflow**

```yaml
name: CI
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  ci:
    name: ci
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run format:check
      - run: npm test
      - run: npm run build
      - run: npm audit --audit-level=critical
```

- [ ] **Step 2: Asegurar el script `lint`** en `package.json`

`create-next-app` ya agrega `"lint": "next lint"`. Verificar que existe.

- [ ] **Step 3: Probar el pipeline en una rama**

```bash
git checkout -b chore/ci
git add -A
git commit -m "ci: add GitHub Actions pipeline"
git push -u origin chore/ci
gh pr create --fill
```
Expected: el PR dispara el workflow `CI`; el job `ci` corre y queda verde.

- [ ] **Step 4: Aplicar branch protection** (ejecutar ahora el comando del Step 3 de la Task 5, que ya tiene el check `ci` disponible).

- [ ] **Step 5: Mergear el PR**

```bash
gh pr merge --squash --delete-branch
```
Expected: `main` actualizado, rama borrada.

---

## Task 7: Lighthouse CI (presupuesto de performance)

**Files:**
- Create: `lighthouserc.json`
- Modify: `.github/workflows/ci.yml` (job nuevo)

- [ ] **Step 1: Crear `lighthouserc.json`**

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run start",
      "url": ["http://localhost:3000/"],
      "numberOfRuns": 1
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```
> Nota: empieza como `warn` para performance (la home es trivial; afinamos umbrales en fases con contenido real). Accessibility como `error` desde ya.

- [ ] **Step 2: Agregar el job de Lighthouse al workflow**

Añadir a `.github/workflows/ci.yml`:

```yaml
  lighthouse:
    name: lighthouse
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npx @lhci/cli autorun
```

- [ ] **Step 3: PR de verificación**

```bash
git checkout -b chore/lighthouse
git add -A
git commit -m "ci: add Lighthouse CI performance budget"
git push -u origin chore/lighthouse
gh pr create --fill
```
Expected: el job `lighthouse` corre y reporta scores; el PR queda verde.

- [ ] **Step 4: Mergear**

```bash
gh pr merge --squash --delete-branch
```

---

## Task 8: Supabase local (Docker)

**Files:**
- Create: `supabase/config.toml` (generado por `supabase init`)

- [ ] **Step 1: Inicializar Supabase en el repo**

```bash
supabase init
```
Expected: crea carpeta `supabase/` con `config.toml`.

- [ ] **Step 2: Levantar el stack local**

```bash
supabase start
```
Expected: imprime `API URL` (`http://localhost:54321`), `anon key`, `service_role key`, `DB URL`. Anotar `API URL` y `anon key` (van a `.env.local` en Task 10).

- [ ] **Step 3: Verificar Studio**

Abrir `http://localhost:54323` (Supabase Studio local). Expected: carga el panel.

- [ ] **Step 4: Commit**

```bash
git add supabase/config.toml supabase/.gitignore
git commit -m "chore: init Supabase local stack"
```

---

## Task 9: Schema de identidad — profiles, roles, RLS (migración + tests TDD)

Identidad con tabla `profiles` (1:1 con `auth.users`), columna `role` (`admin/broker/cliente`, default `cliente`), trigger que crea el profile al registrarse, helper `current_user_role()` para usar en futuras políticas sin recursión, y RLS default-deny.

**Files:**
- Create: `supabase/migrations/<timestamp>_init_auth.sql`
- Test: `tests/integration/profiles.rls.test.ts`
- Create: `tests/helpers/supabase.ts`

- [ ] **Step 1: Crear la migración**

```bash
supabase migration new init_auth
```
Editar el archivo `supabase/migrations/<timestamp>_init_auth.sql`:

```sql
-- Roles del dominio
create type public.user_role as enum ('admin', 'broker', 'cliente');

-- Perfil 1:1 con auth.users
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'cliente',
  full_name text,
  created_at timestamptz not null default now()
);

-- RLS: default-deny (al activar RLS sin políticas, nadie accede)
alter table public.profiles enable row level security;

-- Helper sin recursión: rol del usuario actual (SECURITY DEFINER salta RLS internamente)
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Políticas:
-- 1) cada quien lee su propio profile
create policy "leer_propio_profile"
  on public.profiles for select
  using (id = auth.uid());

-- 2) admin lee todos
create policy "admin_lee_todos"
  on public.profiles for select
  using (public.current_user_role() = 'admin');

-- 3) cada quien actualiza su propio profile, pero NO puede cambiarse el rol
create policy "actualizar_propio_profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- Trigger: crear profile automáticamente al registrarse (rol cliente por defecto)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- [ ] **Step 2: Aplicar la migración en local**

```bash
supabase db reset
```
Expected: recrea la DB local aplicando todas las migraciones, sin errores.

- [ ] **Step 3: Crear helper de tests**

Crear `tests/helpers/supabase.ts`:

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_LOCAL_URL ?? 'http://localhost:54321';
const ANON = process.env.SUPABASE_LOCAL_ANON_KEY!;
const SERVICE = process.env.SUPABASE_LOCAL_SERVICE_KEY!;

export function anonClient(): SupabaseClient {
  return createClient(URL, ANON, { auth: { persistSession: false } });
}

export function serviceClient(): SupabaseClient {
  return createClient(URL, SERVICE, { auth: { persistSession: false } });
}

// Crea un usuario confirmado y devuelve un cliente autenticado como él
export async function signUpUser(email: string, password = 'test1234!') {
  const admin = serviceClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;

  const client = anonClient();
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;

  return { client, userId: data.user.id, admin };
}
```
Instalar el SDK: `npm i @supabase/supabase-js`.

- [ ] **Step 4: Escribir los tests de RLS que fallan**

Crear `tests/integration/profiles.rls.test.ts`:

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { signUpUser, serviceClient } from '../helpers/supabase';

const uniq = () => `user_${Math.floor(performance.now())}_${process.pid}@test.local`;

describe('RLS de profiles', () => {
  it('un usuario puede leer su propio profile', async () => {
    const { client, userId } = await signUpUser(uniq());
    const { data, error } = await client.from('profiles').select('*').eq('id', userId).single();
    expect(error).toBeNull();
    expect(data?.id).toBe(userId);
  });

  it('un usuario NO puede leer el profile de otro', async () => {
    const a = await signUpUser(uniq());
    const b = await signUpUser(uniq());
    const { data } = await a.client.from('profiles').select('*').eq('id', b.userId);
    expect(data).toEqual([]); // RLS oculta filas ajenas: 0 resultados
  });

  it('un cliente NO puede auto-promoverse a admin', async () => {
    const { client, userId } = await signUpUser(uniq());
    const { error } = await client.from('profiles').update({ role: 'admin' }).eq('id', userId);
    // la política with_check rechaza el cambio de rol
    const { data } = await serviceClient().from('profiles').select('role').eq('id', userId).single();
    expect(data?.role).toBe('cliente');
    expect(error).not.toBeNull();
  });

  it('nuevo usuario obtiene rol cliente por el trigger', async () => {
    const { userId } = await signUpUser(uniq());
    const { data } = await serviceClient().from('profiles').select('role').eq('id', userId).single();
    expect(data?.role).toBe('cliente');
  });
});
```

- [ ] **Step 5: Configurar env de tests y correr — verificar que fallan/pasan correctamente**

Exportar las keys locales (las imprimió `supabase start`) antes de correr. En bash:

```bash
export SUPABASE_LOCAL_ANON_KEY="<anon key de supabase start>"
export SUPABASE_LOCAL_SERVICE_KEY="<service_role key de supabase start>"
npm test
```
Expected: con la migración aplicada (Step 2), los 4 tests PASAN. Si se corre antes de aplicar la migración, fallan — confirma que prueban el comportamiento real.

> Para que el CI corra estos tests, en `ci.yml` se agrega un step `supabase start` (acción `supabase/setup-cli`) antes de `npm test`, exportando las keys locales. Si se prefiere mantener el CI sin Docker, marcar estos tests como suite `integration` separada que corre en un job dedicado con Supabase. Decisión: agregar job `integration` en la Task siguiente del CI.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: identity schema (profiles, roles, RLS) + RLS tests"
```

---

## Task 10: Clientes Supabase en Next + variables de entorno

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `.env.example`
- Modify: `.env.local` (gitignored — crear si falta)
- Verify: `.gitignore` incluye `.env*.local`

- [ ] **Step 1: Instalar el helper SSR**

```bash
npm i @supabase/ssr
```

- [ ] **Step 2: Crear `.env.example` (commiteado, sin secretos reales)**

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-me
# Solo server. NUNCA con prefijo NEXT_PUBLIC_. Nunca commitear el valor real.
SUPABASE_SERVICE_ROLE_KEY=replace-me
```

- [ ] **Step 3: Crear `.env.local` con los valores locales reales** (de `supabase start`). Confirmar que `.gitignore` ya ignora `.env*.local` (create-next-app lo hace). Verificar:

```bash
git check-ignore .env.local
```
Expected: imprime `.env.local` (está ignorado).

- [ ] **Step 4: Cliente de navegador**

Crear `src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 5: Cliente de server**

Crear `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Component: ignorar; el middleware refresca la sesión
          }
        },
      },
    },
  );
}
```

- [ ] **Step 6: Verificar typecheck**

```bash
npm run typecheck
```
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Supabase browser/server clients + env example"
```

---

## Task 11: Login mínimo + ruta protegida por rol (E2E TDD)

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/dashboard/page.tsx`
- Create: `src/middleware.ts`
- Test: `tests/e2e/auth.spec.ts`

- [ ] **Step 1: Middleware que protege `/dashboard`**

Crear `src/middleware.ts`:

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) =>
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    },
  );

  const { data } = await supabase.auth.getUser();
  if (!data.user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return response;
}

export const config = { matcher: ['/dashboard/:path*'] };
```

- [ ] **Step 2: Página de login**

Crear `src/app/login/page.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main style={{ padding: 32, maxWidth: 360 }}>
      <h1>Ingresar</h1>
      <form onSubmit={onSubmit}>
        <input aria-label="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input aria-label="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Entrar</button>
      </form>
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
```

- [ ] **Step 3: Página de dashboard que muestra el rol**

Crear `src/app/dashboard/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', userData.user?.id ?? '')
    .single();

  return (
    <main style={{ padding: 32 }}>
      <h1>Dashboard</h1>
      <p>Sesión: {userData.user?.email}</p>
      <p>Rol: {profile?.role ?? 'desconocido'}</p>
    </main>
  );
}
```

- [ ] **Step 4: Escribir el E2E que falla**

Crear `tests/e2e/auth.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('sin sesión, /dashboard redirige a /login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});

test('con credenciales válidas se entra al dashboard y se ve el rol', async ({ page }) => {
  // Usuario sembrado por el setup de tests (ver Step 6)
  await page.goto('/login');
  await page.getByLabel('email').fill(process.env.E2E_USER_EMAIL!);
  await page.getByLabel('password').fill(process.env.E2E_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(/Rol: cliente/)).toBeVisible();
});
```

- [ ] **Step 5: Correr el E2E y verificar que el primer test falla por la razón correcta**

```bash
npm run test:e2e -- tests/e2e/auth.spec.ts
```
Expected: el test de redirect PASA tras crear el middleware; el de login FALLA hasta sembrar el usuario (Step 6).

- [ ] **Step 6: Sembrar el usuario de prueba y exportar credenciales**

Crear `tests/e2e/seed.ts` (script idempotente):

```ts
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

const email = process.env.E2E_USER_EMAIL ?? 'e2e@test.local';
const password = process.env.E2E_USER_PASSWORD ?? 'test1234!';

const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
if (error && !error.message.includes('already')) throw error;
console.log('seed ok:', email);
```
Correr:

```bash
export E2E_USER_EMAIL=e2e@test.local
export E2E_USER_PASSWORD=test1234!
npx tsx tests/e2e/seed.ts
```
(Instalar runner si falta: `npm i -D tsx`.)

- [ ] **Step 7: Correr el E2E completo y verificar que pasa**

```bash
npm run test:e2e -- tests/e2e/auth.spec.ts
```
Expected: ambos tests PASAN.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: minimal login + role-gated dashboard + auth E2E"
```

---

## Task 12: Proyectos Supabase staging y prod + migraciones remotas

**Files:** ninguno (operaciones de plataforma + push de migraciones existentes).

- [ ] **Step 1: Crear los proyectos remotos**

```bash
supabase projects create showroom-staging --org-id <tu-org-id> --region sa-east-1 --db-password <pass-staging>
supabase projects create showroom-prod    --org-id <tu-org-id> --region sa-east-1 --db-password <pass-prod>
```
(Listar org-id: `supabase orgs list`. Región sugerida LATAM: `sa-east-1` São Paulo.)
Expected: dos proyectos creados; anotar sus `project-ref`.

- [ ] **Step 2: Linkear y pushear migraciones a staging**

```bash
supabase link --project-ref <ref-staging>
supabase db push
```
Expected: la migración `init_auth` se aplica en staging sin errores.

- [ ] **Step 3: Repetir para prod**

```bash
supabase link --project-ref <ref-prod>
supabase db push
```
Expected: misma migración aplicada en prod.

- [ ] **Step 4: Anotar las API URL y anon keys** de staging y prod (panel o `supabase projects api-keys --project-ref <ref>`). Se usan en las env vars de Vercel (Task 13). El `service_role` de cada uno se guarda **solo** como secret de server en Vercel, nunca en el repo.

---

## Task 13: Conectar Vercel (preview + production) + env vars + git integration

**Files:** ninguno (operaciones de plataforma).

- [ ] **Step 1: Linkear el proyecto a Vercel**

```bash
vercel link
```
Expected: crea/asocia el proyecto Vercel a este repo.

- [ ] **Step 2: Conectar el repo de GitHub** (habilita preview por PR + deploy por push a main)

```bash
vercel git connect
```
Expected: Vercel queda conectado al repo `showroom-inmobiliario`; los PR generarán Preview Deployments.

- [ ] **Step 3: Cargar env vars de Preview (apuntan a Supabase staging)**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
```
(Pegar los valores de **staging** cuando lo pida.)

- [ ] **Step 4: Cargar env vars de Production (apuntan a Supabase prod)**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```
(Pegar los valores de **prod**.)

- [ ] **Step 5: Verificar Preview con un PR de prueba**

```bash
git checkout -b chore/vercel-smoke
git commit --allow-empty -m "chore: trigger preview deploy"
git push -u origin chore/vercel-smoke
gh pr create --fill
```
Expected: el bot de Vercel comenta el PR con una Preview URL; abrirla muestra la home. CI verde.

- [ ] **Step 6: Mergear (despliega staging vía push a main) y verificar el deploy de Vercel**

```bash
gh pr merge --squash --delete-branch
```
Expected: deploy automático del entorno conectado a `main`; URL del proyecto carga la home.

---

## Task 14: DISENO.md, README y primer release `v0.1.0`

**Files:**
- Create: `DISENO.md`
- Modify: `README.md`

- [ ] **Step 1: Crear `DISENO.md` (doc vivo, apunta a specs/plans)**

```markdown
# DISEÑO — Showroom Inmobiliario

Documento vivo. Resumen e índice del diseño; el detalle vive en `docs/superpowers/`.

## Estado actual
- Fase 0 (Cimientos): completada → `v0.1.0`.
- Próxima: Fase 1 (Visor + editor de PNG) — pendiente de brainstorm/spec.

## Documentos
- Plan maestro (proceso + visión): `docs/superpowers/specs/2026-06-14-plan-maestro-design.md`
- Plan Fase 0: `docs/superpowers/plans/2026-06-14-fase-0-cimientos.md`

## Decisiones clave
- Entornos: Local (Docker) + Preview (Vercel, Supabase staging) + Producción (tag, Supabase prod).
- Branches: trunk-based; `main` siempre desplegable; `feature/*` cortas; prod por tag.
- Seguridad: RLS default-deny en toda tabla; service_role solo en server; Zod en bordes.
- Roles: admin / broker / cliente (tabla `profiles`).
```

- [ ] **Step 2: Actualizar `README.md`** con cómo correr el proyecto

```markdown
# Showroom Inmobiliario

Plataforma de showroom para preventa de departamentos.

## Desarrollo local
1. `docker` corriendo + `supabase start`
2. Copiar `.env.example` a `.env.local` y completar con las keys de `supabase start`
3. `npm install`
4. `npm run dev` → http://localhost:3000

## Tests
- `npm test` — unit + integración (requiere Supabase local)
- `npm run test:e2e` — E2E (Playwright)

## Flujo
Ramas `feature/*` → PR → CI verde → merge squash a `main` → tag `vX.Y.Z` para producción.
```

- [ ] **Step 3: Commit por PR (como todo)**

```bash
git checkout -b docs/fase-0-wrapup
git add -A
git commit -m "docs: add DISENO.md and README"
git push -u origin docs/fase-0-wrapup
gh pr create --fill
gh pr merge --squash --delete-branch
```

- [ ] **Step 4: Taggear el primer release y desplegar a producción**

```bash
git checkout main && git pull
git tag v0.1.0
git push --tags
```
Expected: Vercel publica el deploy de Production; la home queda en la URL de producción.

- [ ] **Step 5: Verificación final de la fase**

Confirmar que TODO lo siguiente es cierto (evidencia, no suposición):
- [ ] Un PR dispara CI (lint, typecheck, format, test, build, audit, lighthouse) y se ve verde.
- [ ] `main` está protegido: no se puede pushear directo.
- [ ] Existe Preview URL por PR apuntando a Supabase staging.
- [ ] Login funciona en local; `/dashboard` muestra el rol; sin sesión redirige a `/login`.
- [ ] Los tests de RLS de `profiles` pasan.
- [ ] `v0.1.0` desplegado en producción y la URL carga.

---

## Self-Review (hecho al escribir el plan)

- **Cobertura del spec:** entornos/branches (Tasks 5,6,12,13) · flujo diario (el plan ES el flujo: rama→PR→CI→merge→tag) · seguridad (Task 9 RLS, Task 10 service_role solo server + .env, Task 6 npm audit) · escalabilidad (índices/imágenes llegan con datos reales en Fase 2; Lighthouse budget en Task 7) · testing (Tasks 3,4,9,11 + jobs CI). Sin huecos para el alcance de Fase 0.
- **Placeholders:** los `<...>` restantes son valores que SOLO existen tras un login/creación interactiva del usuario (org-id, project-ref, keys). Están marcados explícitamente como tales, no son detalles sin definir.
- **Consistencia de tipos/nombres:** `current_user_role()`, enum `user_role`, tabla `profiles`, clientes `@/lib/supabase/{client,server}` usados consistentemente entre tasks.
- **Nota de escalabilidad:** índices y CDN de imágenes son no-aplicables en Fase 0 (no hay catálogo aún); se ejecutan en Fase 2. Documentado, no omitido por descuido.
