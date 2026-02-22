create or replace view public.published_resources as
select r.*
from public.resources r
join public.dataset_versions v on v.id = r.version_id
where v.status = 'published'::public.version_status
  and (v.valid_to is null or v.valid_to >= current_date)
  and v.valid_from <= current_date;

create or replace view public.published_equivalences as
select e.*
from public.equivalences e
join public.dataset_versions v on v.id = e.version_id
where v.status = 'published'::public.version_status
  and (v.valid_to is null or v.valid_to >= current_date)
  and v.valid_from <= current_date;

create or replace view public.published_equivalences_with_sources as
select
  e.id,
  e.slug,
  e.title,
  e.output_unit,
  e.description,
  e.confidence,
  e.co2e_ton_per_unit,
  e.formula,
  e.is_demo,
  jsonb_agg(jsonb_build_object(
    'id', s.id,
    'author', s.author,
    'organization', s.organization,
    'title', s.title,
    'year', s.year,
    'url', s.url,
    'doi', s.doi,
    'accessedAt', s.accessed_at,
    'notes', s.notes,
    'isDemo', s.is_demo
  ) order by s.year desc) as citations
from public.published_equivalences e
join public.equivalence_sources es on es.equivalence_id = e.id
join public.sources s on s.id = es.source_id
group by e.id, e.slug, e.title, e.output_unit, e.description, e.confidence, e.co2e_ton_per_unit, e.formula, e.is_demo;

create or replace view public.published_resources_with_units as
select
  r.id,
  r.slug,
  r.name,
  r.base_unit,
  r.factor_kgco2e_per_base_unit,
  r.explanation,
  r.confidence,
  coalesce(
    jsonb_agg(jsonb_build_object(
      'id', u.id,
      'resourceId', r.id,
      'name', u.unit_name,
      'symbol', u.unit_symbol,
      'toBaseFactor', u.to_base_factor,
      'isBase', u.is_base
    ) order by u.is_base desc, u.unit_name) filter (where u.id is not null),
    '[]'::jsonb
  ) as units,
  coalesce(
    jsonb_agg(distinct jsonb_build_object(
      'id', s.id,
      'author', s.author,
      'organization', s.organization,
      'title', s.title,
      'year', s.year,
      'url', s.url,
      'doi', s.doi,
      'accessedAt', s.accessed_at,
      'notes', s.notes,
      'isDemo', s.is_demo
    )) filter (where s.id is not null),
    '[]'::jsonb
  ) as citations
from public.published_resources r
left join public.resource_units u on u.resource_id = r.id
left join public.resource_sources rs on rs.resource_id = r.id
left join public.sources s on s.id = rs.source_id
group by r.id, r.slug, r.name, r.base_unit, r.factor_kgco2e_per_base_unit, r.explanation, r.confidence;
