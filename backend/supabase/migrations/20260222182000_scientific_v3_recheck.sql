-- EcoEquivalencias - Scientific Dataset v3 (deep recheck)
-- Applies:
-- 1) Updated core ecoequivalences
-- 2) Tetrapak downgraded to non-verified/provisional
-- 3) Organics differentiated with WARM v16 review deltas
begin;

-- Archive currently published dataset and publish a new one.
update public.dataset_versions
set status = 'archived'::public.version_status,
    valid_to = coalesce(valid_to, current_date),
    updated_at = now()
where status = 'published'::public.version_status;

insert into public.dataset_versions (id, name, status, valid_from, notes)
values (
  '33333333-3333-3333-3333-333333333333',
  'Scientific v3 (deep recheck: EPA 2024 + WARM v16 review)',
  'published',
  '2026-02-22',
  'Actualiza equivalencias EPA (oct-2024), rebaja Tetrapak a provisional y revisa orgánicos con sensibilidad WARM v16.'
)
on conflict (id) do update set
  name = excluded.name,
  status = excluded.status,
  valid_from = excluded.valid_from,
  notes = excluded.notes,
  valid_to = null,
  updated_at = now();

-- Add explicit sources used by this recheck.
insert into public.sources (id, key, author, organization, title, year, url, doi, accessed_at, notes, is_demo)
values
  (
    '21000000-0000-0000-0000-000000000008',
    'epa-ghg-revision-oct-2024',
    'US EPA',
    'US EPA',
    'Greenhouse Gas Equivalencies Calculator Revision History (October 2024)',
    2024,
    'https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator',
    null,
    '2026-02-22',
    'Referencia de actualización para factores de equivalencias comunicacionales.',
    false
  ),
  (
    '21000000-0000-0000-0000-000000000009',
    'tetrapak-provisional-review-2026',
    'Equipo EcoEquivalencias',
    'EcoEquivalencias',
    'Revisión técnica Tetrapak: categoría no verificable en WARM',
    2026,
    null,
    null,
    '2026-02-22',
    'Tetrapak se mantiene provisional hasta incorporar fuente LCA/EPD específica.',
    false
  )
on conflict (id) do update set
  key = excluded.key,
  author = excluded.author,
  organization = excluded.organization,
  title = excluded.title,
  year = excluded.year,
  url = excluded.url,
  doi = excluded.doi,
  accessed_at = excluded.accessed_at,
  notes = excluded.notes,
  is_demo = excluded.is_demo,
  updated_at = now();

-- Clone resources from v2 -> v3 (new IDs to keep historical snapshots immutable).
create temp table tmp_resource_map on commit drop as
select r.id as old_id, gen_random_uuid() as new_id
from public.resources r
where r.version_id = '22222222-2222-2222-2222-222222222222';

insert into public.resources (
  id, version_id, slug, name, category, base_unit, factor_kgco2e_per_base_unit,
  explanation, confidence, source_note, created_by, updated_by
)
select
  m.new_id,
  '33333333-3333-3333-3333-333333333333'::uuid,
  r.slug,
  r.name,
  r.category,
  r.base_unit,
  r.factor_kgco2e_per_base_unit,
  r.explanation,
  r.confidence,
  r.source_note,
  r.created_by,
  r.updated_by
from public.resources r
join tmp_resource_map m on m.old_id = r.id;

insert into public.resource_units (id, resource_id, unit_name, unit_symbol, to_base_factor, is_base)
select gen_random_uuid(), m.new_id, u.unit_name, u.unit_symbol, u.to_base_factor, u.is_base
from public.resource_units u
join tmp_resource_map m on m.old_id = u.resource_id;

insert into public.resource_sources (resource_id, source_id)
select m.new_id, rs.source_id
from public.resource_sources rs
join tmp_resource_map m on m.old_id = rs.resource_id
on conflict do nothing;

-- Clone equivalences from v2 -> v3.
create temp table tmp_equivalence_map on commit drop as
select e.id as old_id, gen_random_uuid() as new_id
from public.equivalences e
where e.version_id = '22222222-2222-2222-2222-222222222222';

insert into public.equivalences (
  id, version_id, slug, title, output_unit, description, confidence, co2e_ton_per_unit,
  formula, is_demo, created_by, updated_by
)
select
  m.new_id,
  '33333333-3333-3333-3333-333333333333'::uuid,
  e.slug,
  e.title,
  e.output_unit,
  e.description,
  e.confidence,
  e.co2e_ton_per_unit,
  e.formula,
  e.is_demo,
  e.created_by,
  e.updated_by
from public.equivalences e
join tmp_equivalence_map m on m.old_id = e.id;

insert into public.equivalence_sources (equivalence_id, source_id)
select m.new_id, es.source_id
from public.equivalence_sources es
join tmp_equivalence_map m on m.old_id = es.equivalence_id
on conflict do nothing;

-- 2) Tetrapak: non-verified/provisional until a dedicated LCA/EPD source is adopted.
update public.resources r
set confidence = 'low',
    explanation = 'Factor provisional. Tetrapak no corresponde a categoría WARM oficial verificable; pendiente reemplazo por LCA/EPD específico.',
    source_note = 'No verificado en WARM. Valor provisional heredado del workbook interno hasta integrar fuente trazable externa.'
where r.version_id = '33333333-3333-3333-3333-333333333333'
  and r.slug = 'tetrapak';

insert into public.resource_sources (resource_id, source_id)
select r.id, '21000000-0000-0000-0000-000000000009'::uuid
from public.resources r
where r.version_id = '33333333-3333-3333-3333-333333333333'
  and r.slug = 'tetrapak'
on conflict do nothing;

-- 3) Organics WARM v16 review (landfill sensitivity applied to differentiate organics).
-- Note: these values are adjusted from v2 to reflect the v16 directional changes from the deep recheck.
update public.resources r
set factor_kgco2e_per_base_unit = case r.slug
      when 'residuos-de-alimentos' then 0.681242
      when 'residuos-de-alimentos-sin-carne' then 0.682057
      when 'residuos-de-alimentos-solo-carne' then 0.629486
      when 'carne' then 0.584659
      when 'pollos' then 0.667250
      when 'granos' then 1.865502
      when 'pan' then 1.348356
      when 'frutas-y-verduras' then 0.310532
      when 'productos-lacteos' then 0.653123
      when 'mezcla-organica' then 0.257877
      else r.factor_kgco2e_per_base_unit
    end,
    confidence = case
      when r.slug in (
        'residuos-de-alimentos','residuos-de-alimentos-sin-carne','residuos-de-alimentos-solo-carne',
        'carne','pollos','granos','pan','frutas-y-verduras','productos-lacteos','mezcla-organica'
      ) then 'medium'
      else r.confidence
    end,
    source_note = case
      when r.slug in (
        'residuos-de-alimentos','residuos-de-alimentos-sin-carne','residuos-de-alimentos-solo-carne',
        'carne','pollos','granos','pan','frutas-y-verduras','productos-lacteos','mezcla-organica'
      ) then 'Ajuste de revisión WARM v16 aplicado en 2026-02-22 sobre base v2 para diferenciar orgánicos por sensibilidad de vertedero.'
      else r.source_note
    end
where r.version_id = '33333333-3333-3333-3333-333333333333'
  and r.slug in (
    'residuos-de-alimentos','residuos-de-alimentos-sin-carne','residuos-de-alimentos-solo-carne',
    'carne','pollos','granos','pan','frutas-y-verduras','productos-lacteos','mezcla-organica'
  );

-- 1) Core ecoequivalence updates from deep recheck (EPA update set).
update public.equivalences e
set co2e_ton_per_unit = case e.slug
      when 'automoviles-gasolina-anio' then 4.290000000000
      when 'km-vehiculo-gasolina' then 0.000244000000
      when 'hogar-energia-anual' then 7.446000000000
      when 'balon-gas-8kg' then 0.022000000000
      when 'cargas-smartphone' then 0.000012400000
      when 'turbina-eolica-anio' then 3348.000000000000
      when 'bombilla-led-reemplazo' then 0.026400000000
      when 'hectarea-bosque-anio' then 2.471000000000
      when 'automoviles-gasolina-mes' then 0.357500000000
      when 'automoviles-gasolina-dia' then 0.011753424658
      when 'hogar-energia-mes' then 0.620500000000
      when 'hogar-energia-dia' then 0.020400000000
      when 'cargas-smartphone-100' then 0.001240000000
      when 'cargas-smartphone-1000' then 0.012400000000
      when 'cargas-smartphone-10000' then 0.124000000000
      when 'turbina-eolica-mes' then 279.000000000000
      when 'turbina-eolica-dia' then 9.172602739726
      when 'hectarea-bosque-mes' then 0.205916666667
      when 'hectarea-bosque-dia' then 0.006769863014
      when 'm2-bosque-anio' then 0.000247100000
      when 'viajes-auto-10-km' then 0.002440000000
      when 'viajes-auto-50-km' then 0.012200000000
      when 'viajes-auto-100-km' then 0.024400000000
      else e.co2e_ton_per_unit
    end,
    formula = case e.slug
      when 'automoviles-gasolina-anio' then 'co2e_ton / 4.290000000000'
      when 'km-vehiculo-gasolina' then 'co2e_ton / 0.000244000000'
      when 'hogar-energia-anual' then 'co2e_ton / 7.446000000000'
      when 'balon-gas-8kg' then 'co2e_ton / 0.022000000000'
      when 'cargas-smartphone' then 'co2e_ton / 0.000012400000'
      when 'turbina-eolica-anio' then 'co2e_ton / 3348.000000000000'
      when 'bombilla-led-reemplazo' then 'co2e_ton / 0.026400000000'
      when 'hectarea-bosque-anio' then 'co2e_ton / 2.471000000000'
      when 'automoviles-gasolina-mes' then 'co2e_ton / 0.357500000000'
      when 'automoviles-gasolina-dia' then 'co2e_ton / 0.011753424658'
      when 'hogar-energia-mes' then 'co2e_ton / 0.620500000000'
      when 'hogar-energia-dia' then 'co2e_ton / 0.020400000000'
      when 'cargas-smartphone-100' then 'co2e_ton / 0.001240000000'
      when 'cargas-smartphone-1000' then 'co2e_ton / 0.012400000000'
      when 'cargas-smartphone-10000' then 'co2e_ton / 0.124000000000'
      when 'turbina-eolica-mes' then 'co2e_ton / 279.000000000000'
      when 'turbina-eolica-dia' then 'co2e_ton / 9.172602739726'
      when 'hectarea-bosque-mes' then 'co2e_ton / 0.205916666667'
      when 'hectarea-bosque-dia' then 'co2e_ton / 0.006769863014'
      when 'm2-bosque-anio' then 'co2e_ton / 0.000247100000'
      when 'viajes-auto-10-km' then 'co2e_ton / 0.002440000000'
      when 'viajes-auto-50-km' then 'co2e_ton / 0.012200000000'
      when 'viajes-auto-100-km' then 'co2e_ton / 0.024400000000'
      else e.formula
    end,
    confidence = case
      when e.slug = 'bombilla-led-reemplazo' then 'low'
      when e.slug in (
        'automoviles-gasolina-anio','km-vehiculo-gasolina','hogar-energia-anual','balon-gas-8kg',
        'cargas-smartphone','turbina-eolica-anio','hectarea-bosque-anio'
      ) then 'high'
      else e.confidence
    end,
    description = case
      when e.slug = 'bombilla-led-reemplazo'
        then 'Equivalencia mantenida por continuidad histórica; considerada deprecada en revisiones recientes.'
      else e.description
    end
where e.version_id = '33333333-3333-3333-3333-333333333333'
  and e.slug in (
    'automoviles-gasolina-anio','km-vehiculo-gasolina','hogar-energia-anual','balon-gas-8kg',
    'cargas-smartphone','turbina-eolica-anio','bombilla-led-reemplazo','hectarea-bosque-anio',
    'automoviles-gasolina-mes','automoviles-gasolina-dia','hogar-energia-mes','hogar-energia-dia',
    'cargas-smartphone-100','cargas-smartphone-1000','cargas-smartphone-10000',
    'turbina-eolica-mes','turbina-eolica-dia','hectarea-bosque-mes','hectarea-bosque-dia','m2-bosque-anio',
    'viajes-auto-10-km','viajes-auto-50-km','viajes-auto-100-km'
  );

insert into public.equivalence_sources (equivalence_id, source_id)
select e.id, '21000000-0000-0000-0000-000000000008'::uuid
from public.equivalences e
where e.version_id = '33333333-3333-3333-3333-333333333333'
  and e.slug in (
    'automoviles-gasolina-anio','km-vehiculo-gasolina','hogar-energia-anual','balon-gas-8kg',
    'cargas-smartphone','turbina-eolica-anio','bombilla-led-reemplazo','hectarea-bosque-anio',
    'automoviles-gasolina-mes','automoviles-gasolina-dia','hogar-energia-mes','hogar-energia-dia',
    'cargas-smartphone-100','cargas-smartphone-1000','cargas-smartphone-10000',
    'turbina-eolica-mes','turbina-eolica-dia','hectarea-bosque-mes','hectarea-bosque-dia','m2-bosque-anio',
    'viajes-auto-10-km','viajes-auto-50-km','viajes-auto-100-km'
  )
on conflict do nothing;

commit;
