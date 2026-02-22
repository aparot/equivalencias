# EcoEquivalencias MVP

MVP full-stack con:
- `mobile/`: app movil React Native (Expo)
- `admin/`: panel web Next.js para administracion de dataset
- `backend/`: esquema + migraciones + seed para Supabase
- `shared/`: motor de calculo, validaciones, exportacion y tests

Basado en la logica del Excel `Herramienta Eco Equivalencia .xlsx` (entrada de materiales, conversiones, equivalencias por CO2e y referencias).

## 1) Requisitos
- Node.js 20+
- npm 10+
- Proyecto Supabase

## 2) Estructura del repo
- `mobile/App.tsx`: flujo MVP (selector, cantidad, calculo, resultados, citas, historial, exportaciones)
- `admin/app/page.tsx`: CRUD + publicacion de version
- `backend/supabase/migrations/*.sql`: modelo de datos y vistas publicadas
- `backend/supabase/seed/seed.sql`: dataset demo (8 recursos, 30 equivalencias, citas 1..3)
- `shared/src/calc.ts`: logica de conversion y calculo
- `shared/tests/calc.test.ts`: tests de conversion, calculo y filtro por citas

## 3) Variables de entorno

### Mobile (`mobile/.env`)
```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_ADMIN_URL=... # ej: https://admin.tudominio.com
```
Puedes copiar desde `mobile/.env.example`.

### Admin (`admin/.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=... # o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY=... # o SUPABASE_SERVICE_ROLE_KEY (legacy)
NEXT_PUBLIC_PORTAL_URL=... # ej: https://app.tudominio.com
```
Puedes copiar desde `admin/.env.local.example`.

## 4) Cargar migraciones y seed
Usa el SQL editor de Supabase (o CLI) en este orden:
1. `backend/supabase/migrations/20260221100000_init.sql`
2. `backend/supabase/migrations/20260221101000_api_views.sql`
3. `backend/supabase/migrations/20260222120000_user_plans.sql`
4. `backend/supabase/migrations/20260222123000_user_entitlements.sql`
5. `backend/supabase/migrations/20260222150000_admin_role_functions.sql`
6. `backend/supabase/migrations/20260222151000_audit_log_insert_policy.sql`
7. `backend/supabase/seed/seed.sql` (dataset demo rapido)

Para un dataset más robusto y trazable científicamente (47 recursos + 31 ecoequivalencias):
7. `backend/supabase/seed/seed_v2_scientific.sql`

## 5) Correr local

### shared tests
```bash
npm install
npm run test:shared
```

### admin
```bash
npm install
npm run dev --workspace admin
```

### mobile
```bash
npm install
npm run start --workspace mobile
```

## 6) Publicar dataset (flujo)
1. En Admin, iniciar sesion con un usuario que tenga rol `admin`.
2. Crear/editar recursos, unidades, equivalencias y fuentes.
3. Vincular equivalencias con al menos una fuente.
4. Click en `Publicar version seleccionada`.
5. La app movil consume vistas `published_*` y refresca dataset.

## 7) Sistema de citas (regla obligatoria)
- Cada equivalencia se relaciona con `equivalence_sources`.
- La vista `published_equivalences_with_sources` solo devuelve equivalencias con fuentes.
- En el cliente movil, ademas se filtra por `citations.length > 0`.
- Resultado: ninguna equivalencia sin citas se muestra.

## 8) Exportaciones
- CSV: incluye equivalencia, valor, unidad, descripcion y fuentes.
- PDF: incluye input, resultados y seccion de fuentes.

## 9) Offline e historial
- Cache local del dataset publicado.
- Cache de ultima consulta.
- Historial local de ultimos 20 calculos.

## 10) i18n
- Estructura base en `shared/src/i18n.ts` con `es`, `en`, `pt`.
- Espanol es idioma por defecto.

## 11) Deploy sin localhost (Vercel, un solo dominio)

Se recomienda un **solo proyecto** en Vercel (admin + portal en el mismo dominio).

### Configuración
1. Crea un proyecto en Vercel desde este repo.
2. Root Directory: `admin`
3. Framework: Next.js

### Environment Variables (en el mismo proyecto)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `NEXT_PUBLIC_PORTAL_URL` = `/`

### Resultado
- Portal: `https://tu-dominio.vercel.app/`
- Admin: `https://tu-dominio.vercel.app/admin`
- Redirección server-side por rol (sin saltos).
