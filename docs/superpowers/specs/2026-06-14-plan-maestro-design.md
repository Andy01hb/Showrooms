# Plan Maestro — Showroom Inmobiliario

**Fecha:** 2026-06-14
**Estado:** Diseño aprobado (proceso + arquitectura). Pendiente: plan de implementación de Fase 0.
**Tipo:** Documento de estrategia de ingeniería + visión de producto (vivo, se actualiza).

---

## 0. Propósito y alcance

Este documento define **las reglas del juego** del proyecto: cómo trabajamos el día a día (proceso,
entornos, seguridad, escala, testing) y cómo eso encaja con las fases del producto. **No** diseña el
interior de cada fase — cada fase tendrá su propio ciclo brainstorm → spec → plan.

**Qué construimos:** una plataforma de showroom inmobiliario para preventa de departamentos (referencia:
urbania3d.app), con dos mitades conectadas por la base de datos:
- **Vidriera / experiencia:** showroom navegable (PNG con hotspots → 360° → 3D), mapa maestro
  interactivo, recorridos.
- **Motor / negocio:** catálogo proyecto→torre→piso→unidad, disponibilidad en vivo, precios y planes de
  pago, CRM (leads, reservas, embudo de preventa).

**Triple meta:** aprender a programar · producto real para clientes · portafolio profesional.

**Stack aprobado:** Next.js + TypeScript · Supabase (Postgres/RLS/Auth/Storage/Realtime) · Vercel ·
GitHub · Visualización PNG→Photo Sphere Viewer (360°)→react-three-fiber (3D) · Testing Vitest +
Playwright + Lighthouse CI + k6. Todo operable por CLI.

---

## 1. Entornos y branches

Modelo: **2 entornos reales + previews efímeras como QA**. Pragmático para un solo dev, pero con
prácticas pro reales; escala a 3 entornos fijos sin reescritura cuando haga falta.

| Entorno | Cuándo | Git | Hosting | Supabase | Para qué |
|---|---|---|---|---|---|
| **Local** | Mientras programás | `feature/*` | `next dev` | Supabase local (Docker) | Desarrollar y romper sin miedo |
| **Preview (QA efímero)** | Por cada PR | el PR contra `main` | Vercel Preview (URL por PR) | proyecto Supabase **staging** | Probar el cambio aislado, compartir link, correr tests |
| **Producción** | Al promover | tag desde `main` | Vercel Production | proyecto Supabase **prod** | Lo que ven clientes reales |

**Branches (trunk-based):**
- `main` → **siempre desplegable**. Cada push actualiza staging. Nunca se commitea directo: todo entra por PR.
- `feature/*` (`fix/*`, `chore/*`) → ramas **cortas** (horas/días), una por unidad de trabajo. Salen de
  `main`, vuelven por PR con squash.
- **Producción no tiene branch propia.** Se promueve con **tag** (`v0.1.0`, `v0.2.0`…) desde un commit de
  `main` ya validado en staging. Control manual de qué llega a clientes sin mantener rama paralela.

**Por qué no 3 entornos fijos:** la Preview de Vercel + Supabase staging cumplen el rol de "QA
desplegado" gratis y automático por PR. El día que un broker pruebe en serio o se necesite un staging
estable, ese Supabase staging ya existe → se le conecta una branch `staging` fija y listo, cero
reescritura.

**Costo:** Supabase free tier = 2 proyectos activos (staging + prod). Local es Docker (gratis). Entra
justo.

---

## 2. Flujo de trabajo del día a día

Ciclo a repetir para **cada** unidad de trabajo:

1. **Abrir trabajo:** `git checkout main && git pull` → `git checkout -b feature/x` → `supabase start` →
   `npm run dev`.
2. **Diseñar antes de codear:** para algo no trivial, brainstorm → spec → plan. Fixes chicos van directo.
3. **Codear con TDD:** test primero (Vitest), verlo fallar, implementar, refactor. UI/flujos con
   Playwright. Cambios de DB → nueva **migración** (`supabase migration new`), nunca clicks en el panel.
4. **Verificar local (gate personal):** `npm run lint && npm run typecheck && npm test && npm run build`.
   Si algo falla, no se sube.
5. **Abrir PR:** `git push -u origin feature/x` → `gh pr create --fill`. Dispara Vercel Preview + CI
   (GitHub Actions). **El PR no se mergea si el CI falla** (branch protection en `main`).
6. **Revisar:** probar la Preview a mano + `/code-review` (y `/security-review` si toca auth/RLS/forms/pagos).
7. **Mergear y limpiar:** `gh pr merge --squash --delete-branch`. `main` queda verde y desplegado en
   staging.
8. **Promover a prod:** aplicar migraciones pendientes (`supabase db push`), verificar staging, luego
   `git tag v0.2.0 && git push --tags` → deploy a Vercel Production.

**Reglas que hacen que funcione solo:**
1. Nada entra a `main` sin PR + CI verde (aunque seas vos solo).
2. El esquema de DB siempre por migración, nunca clicks → local/staging/prod no divergen.
3. Prod se promueve a propósito (tag manual), nunca por accidente.

---

## 3. Seguridad desde el inicio

Defensa en profundidad por capas, de adentro (datos) hacia afuera (red). Activo crítico: datos de
unidades, precios y leads.

**Capa 1 — La DB se defiende sola (lo más importante)**
- **RLS en TODAS las tablas**, activado en la migración que las crea. El cliente del navegador habla
  directo con Postgres: tabla sin RLS = tabla abierta. Default: **denegar todo**, abrir explícito por rol.
- Políticas por rol:
  - **Público/cliente:** lee solo unidades publicadas + disponibilidad/precio. Nunca leads ajenos, costos
    internos ni datos de otros clientes.
  - **Broker:** ve disponibilidad y maneja **solo SUS** leads (`where broker_id = auth.uid()`).
  - **Admin:** acceso completo, igual mediado por políticas (sin bypass desde el cliente).
- **`service_role` key JAMÁS en el navegador.** Solo en server (API routes / Server Actions). Lo chequea el CI.

**Capa 2 — Nada confía en el input**
- **Validación Zod en cada borde** (forms, params, body) antes de tocar la DB. Mismo schema → tipos de TS:
  una sola fuente de verdad.
- **Anti-race en reservas:** transacción + lock a nivel DB (función de Postgres), no check-then-write en
  JS. Dos brokers no pueden reservar la misma unidad a la vez.

**Capa 3 — Identidad y acceso**
- Auth de Supabase con roles `admin/broker/cliente` en el JWT (custom claims), reflejados en RLS. El rol
  se decide en el server. Rutas admin/broker protegidas en server (middleware), no solo ocultando botones.

**Capa 4 — Superficie pública**
- **Rate limiting** en formularios públicos (contacto, info, registro).
- **Secretos fuera del repo:** env vars (`.env.local` en gitignore; secrets en Vercel/GitHub). CI escanea
  que no se filtre ninguna key.
- Headers de seguridad (CSP, HSTS) en Next desde el arranque.

**Capa 5 — Cadena de suministro**
- **`npm audit` en cada PR** (bloquea si hay vuln crítica) + **Dependabot**.

**Principio:** nunca confiar en la validación del cliente como única barrera. Aunque falle el front, la DB
con RLS protege.

---

## 4. Escalabilidad desde el inicio

La escala real de un showroom no es "millones de req/seg", es: imágenes pesadas servidas rápido, lecturas
concurrentes de disponibilidad en picos, catálogo que crece (miles de filas), y mantenibilidad del código.

Estrategia: **no sobre-construir infra; tomar decisiones baratas hoy que evitan reescrituras caras
mañana.**

1. **Imágenes (lo de mayor impacto):** en Supabase Storage (no en repo/DB) servidas por CDN +
   `next/image` (resize, WebP/AVIF, lazy-load, srcset). Barato hacerlo bien desde el primer PNG; carísimo
   migrar miles después.
2. **Renderizado en el borde:** páginas públicas con estático/ISR cacheado en CDN de Vercel — el cliente
   no golpea la DB en cada visita. La **disponibilidad en vivo** se actualiza encima vía Supabase
   Realtime, sin re-render total. Separar "casi nunca cambia" (caché agresivo) de "cambia" (realtime
   puntual).
3. **DB con índices y paginación desde el día uno:** índices en `proyecto_id`, `torre_id`,
   `estado_comercial`, `tipologia` (en la misma migración). Paginación en toda lista que pueda crecer
   (nunca "traé todo").
4. **Código en módulos chicos con frontera clara:** una responsabilidad por archivo; lógica de negocio
   (precios, estados, reservas) separada de la UI. Archivo que crece = señal de que hace demasiado.
5. **Realtime acotado:** suscripciones filtradas (solo el proyecto que se ve), no "escuchá toda la tabla".

**Principio:** escalá lo que se mide, no lo que se imagina. Decisiones baratas-pero-irreversibles ahora;
lo caro (sharding, microservicios, colas) cuando un número real lo justifique.

---

## 5. Estrategia de testing

Pirámide de tests: muchos rápidos abajo, pocos lentos arriba. Todo lo automatizable corre en el CI por PR.

- **Nivel 1 — Unitarios (Vitest):** lógica de negocio pura (cálculo de precios/planes, transiciones de
  estado de unidad, validaciones Zod). El grueso de los tests; corren en cada save y cada PR.
- **Nivel 2 — Integración (Vitest vs Supabase local):** piezas hablando con la DB real (migraciones,
  reservas, queries con índices). Aquí viven los tests de seguridad.
- **Nivel 3 — E2E (Playwright):** pocos; flujos críticos (cliente explora→ve disponibilidad→pide info;
  admin carga unidad; broker reserva).

**Cómo testeamos que es seguro (automatizado, en CI):**
- **Tests de autorización por rol:** por cada política RLS, un test que intenta lo prohibido y verifica
  que **falla** (ej: broker A pide leads de broker B → espera 0 filas/error; cliente no ve unidades no
  publicadas; cliente no puede marcar vendida).
- **Test anti-race de reservas:** dos reservas concurrentes sobre la misma unidad → solo una gana.
- **Test de no-fuga de `service_role`:** chequeo en CI de que la key no aparece en bundles del cliente.
- **`/security-review`** en cada PR que toque auth/RLS/forms/pagos.
- Regla: cada política de seguridad nace con su test que prueba que el ataque correspondiente falla. Sin
  test, no está terminada.

**Cómo testeamos que rinde/escala:**
- **Lighthouse CI** por PR sobre páginas públicas, con presupuestos (ej: performance ≥ 90, LCP < 2.5s).
  Degradación bajo umbral → CI lo marca.
- **k6** bajo demanda antes de lanzamientos: N clientes concurrentes mirando disponibilidad, valida
  ISR + Realtime bajo pico.
- **EXPLAIN** en queries clave: verificar que usan índices (no scan completo).

**Qué corre y cuándo:**

| Cuándo | Qué | Bloquea merge |
|---|---|---|
| Al guardar (local) | lint, typecheck, unit | — |
| **En cada PR (CI)** | lint, typecheck, unit, integración + RLS, build, `npm audit`, Lighthouse CI | **Sí** |
| Antes de un release | E2E completos, k6 si hubo cambios de carga | Manual |
| Continuo | Dependabot, `/code-review`, `/security-review` | — |

**Principio:** cada bug o agujero encontrado se convierte en un test que evita que vuelva. Seguridad y
performance son tests verdes/rojos en cada PR, no una revisión final.

---

## 6. Fases del producto

El proceso (secciones 1-5) se aplica igual a cada fase. Cada fase: brainstorm → spec → plan → TDD → PR →
CI → merge → tag.

- **Fase 0 — Cimientos** *(lo que se planifica a continuación):* repo + GitHub + branch protection;
  Next.js + TS scaffold; Supabase local (Docker) + proyectos staging/prod; Vercel (preview + prod); CI de
  GitHub Actions con todos los gates; esqueleto de auth con los 3 roles; `DISENO.md` vivo. **Salida:** un
  "hola mundo" que despliega solo por PR, CI verde, login funcional. → `v0.1.0`
- **Fase 1 — Visor + editor de PNG:** subir PNGs a Storage; editor visual de orden de navegación +
  hotspots; visor PNG→PNG. Resuelve el problema concreto (imágenes sin orden conocido).
- **Fase 2 — Catálogo de unidades:** modelo proyecto→torre→piso→unidad (RLS, índices, migraciones);
  admin carga catálogo; CRUD de unidades (tipología, m² discriminados, orientación, vista, estado, precio
  + plan de pagos).
- **Fase 3 — Conectar vidriera + negocio:** mapa maestro interactivo; **disponibilidad en vivo**
  (Realtime); admin marca vendida → showroom público lo refleja al instante. Factor "demo → producto".
- **Fase 4 — Ventas / CRM:** embudo lead → reserva (con lock anti-race) → seña/boleto; broker gestiona
  SUS leads; admin ve todo.
- **Fase 5 — Finanzas de preventa:** planes de pago (anticipo % + cuotas + saldo a entrega), estados de
  pago, reportes básicos.
- **Fase 6 — Pulido + 360/3D + analíticas:** Photo Sphere Viewer (360°), react-three-fiber (3D) sobre el
  visor de Fase 1; analíticas; optimización fina; k6 antes de lanzamientos.

**Reglas que conectan fases con proceso:**
1. Cada fase arranca con su propio brainstorm → spec → plan. Este documento define las reglas, no el
   interior de cada fase.
2. Cada fase termina en un tag → algo desplegado y usable, no un "casi".
3. Construcción en vertical: features completas y delgadas (UI + lógica + DB + test) antes que "todo el
   front primero, todo el back después". Siempre algo que funciona y se puede mostrar.

---

## Pendientes operativos

- Logins interactivos una sola vez (los corre el usuario): `gh auth login`, `supabase login`,
  `vercel login`.
- Git instalado (2.54.0). El proyecto aún no es repo → se inicializa en Fase 0.
- Cuentas externas: free tier suficiente.
