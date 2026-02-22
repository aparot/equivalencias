# EcoEquivalencias - Diseno de datos MVP

## Entidades principales
- `dataset_versions`: versionado de factores/formulas (`draft`, `published`, `archived`) con vigencia.
- `resources`: recurso de entrada (PET, papel, vidrio, etc.) por version.
- `resource_units`: unidades del recurso y conversion a unidad base.
- `equivalences`: equivalencias de salida con formula/factor por version.
- `sources`: citas/fuentes bibliograficas.
- `equivalence_sources`: relacion N:N entre equivalencias y fuentes.
- `resource_sources`: relacion N:N entre recursos y fuentes.
- `profiles`: rol (`admin` o `user`).
- `audit_log`: auditoria de cambios (insert/update/delete).

## Reglas de negocio
- Solo una version `published` activa a la vez.
- Mobile consulta solo datos publicados.
- Las equivalencias sin citas no se muestran:
  - en backend: vista `published_equivalences_with_sources` usa `inner join` con `equivalence_sources`.
  - en mobile: filtro adicional `equivalence.citations.length > 0`.
- Maximo 10 equivalencias por consulta.

## Calculo base
1. Convertir cantidad ingresada a unidad base del recurso.
2. `co2e_ton = (cantidad_base * factor_kgco2e_per_base_unit) / 1000`
3. Para cada equivalencia: `resultado = co2e_ton / co2e_ton_per_unit`

## Versionado
- Cada `resource` y `equivalence` pertenece a `dataset_versions.id`.
- Publicacion: admin cambia estado de version a `published` y archiva la version previamente publicada.
