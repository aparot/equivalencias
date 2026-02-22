-- Demo seed for EcoEquivalencias

insert into public.dataset_versions (id, name, status, valid_from, notes)
values
  ('11111111-1111-1111-1111-111111111111', 'MVP demo v1', 'published', '2026-01-01', 'Dataset demo basado en Excel + factores EPA/WARM')
on conflict (id) do nothing;

insert into public.sources (id, key, author, organization, title, year, url, doi, accessed_at, notes, is_demo)
values
  ('20000000-0000-0000-0000-000000000001','epa-ghg-equivalencies','US EPA','US EPA','Greenhouse Gas Equivalencies Calculator',2024,'https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator',null,'2026-02-21','Fuente principal para equivalencias de CO2e',false),
  ('20000000-0000-0000-0000-000000000002','epa-ghg-calcs','US EPA','US EPA','GHG Equivalencies Calculator - Calculations and References',2024,'https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references',null,'2026-02-21','Detalle de formulas equivalentes',false),
  ('20000000-0000-0000-0000-000000000003','epa-warm','US EPA','US EPA','WARM Model 15',2024,'https://www.epa.gov/warm',null,'2026-02-21','Factores de manejo de residuos/reciclaje',false),
  ('20000000-0000-0000-0000-000000000004','eia-elec','EIA','US Energy Information Administration','Electric Power Annual',2024,'https://www.eia.gov/electricity/annual/',null,'2026-02-21','Contexto energia',false),
  ('20000000-0000-0000-0000-000000000005','fhwa-vmt','FHWA','Federal Highway Administration','Highway Statistics',2024,'https://www.fhwa.dot.gov/policyinformation/statistics.cfm',null,'2026-02-21','Contexto transporte',false),
  ('20000000-0000-0000-0000-000000000006','ipcc-2006','IPCC','IPCC','2006 IPCC Guidelines for National Greenhouse Gas Inventories',2006,'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',null,'2026-02-21','Metodologia de emisiones',false),
  ('20000000-0000-0000-0000-000000000007','demo-local-1','EcoEquivalencias Team','EcoEquivalencias','Factor de botella PET 500ml (demo)',2026,'https://example.org/demo/pet-500ml',null,'2026-02-21','Dato demo para desarrollo',true),
  ('20000000-0000-0000-0000-000000000008','demo-local-2','EcoEquivalencias Team','EcoEquivalencias','Factor de aluminio lata (demo)',2026,'https://example.org/demo/aluminio',null,'2026-02-21','Dato demo para desarrollo',true),
  ('20000000-0000-0000-0000-000000000009','demo-local-3','EcoEquivalencias Team','EcoEquivalencias','Factor de vidrio (demo)',2026,'https://example.org/demo/vidrio',null,'2026-02-21','Dato demo para desarrollo',true),
  ('20000000-0000-0000-0000-000000000010','demo-local-4','EcoEquivalencias Team','EcoEquivalencias','Factor de agua (demo)',2026,'https://example.org/demo/agua',null,'2026-02-21','Dato demo para desarrollo',true)
on conflict (id) do nothing;

insert into public.resources (id, version_id, slug, name, category, base_unit, factor_kgco2e_per_base_unit, explanation, confidence, source_note)
values
  ('30000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','pet-500ml','Botella PET 500ml','Plastico','kg',2.100000,'Factor demo basado en enfoque WARM para reciclaje de PET','medium','demo'),
  ('30000000-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','papel-mixto','Papel mixto','Papel','kg',1.200000,'Factor demo de emisiones evitadas por reciclaje de papel','medium','demo'),
  ('30000000-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','carton-corrugado','Carton corrugado','Papel','kg',1.450000,'Factor demo de carton corrugado','medium','demo'),
  ('30000000-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111','vidrio','Vidrio','Vidrio','kg',0.350000,'Factor demo de reciclaje de vidrio','medium','demo'),
  ('30000000-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111','lata-aluminio','Lata de aluminio','Metales','kg',7.500000,'Factor demo de reciclaje de aluminio','high','demo'),
  ('30000000-0000-0000-0000-000000000006','11111111-1111-1111-1111-111111111111','agua-ahorrada','Agua ahorrada','Agua','litro',0.000298,'Factor demo de agua ahorrada en equivalencia CO2e','low','demo'),
  ('30000000-0000-0000-0000-000000000007','11111111-1111-1111-1111-111111111111','energia-ahorrada','Energia ahorrada','Energia','kwh',0.367000,'Factor demo de energia ahorrada','medium','demo'),
  ('30000000-0000-0000-0000-000000000008','11111111-1111-1111-1111-111111111111','arbol-urbano','Arbol urbano plantado','Naturaleza','unidad',21.000000,'Factor demo de secuestro anual acumulado','low','demo')
on conflict (id) do nothing;

insert into public.resource_sources (resource_id, source_id)
values
  ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000007'),
  ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000009'),
  ('30000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000008'),
  ('30000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000010'),
  ('30000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0000-000000000008','20000000-0000-0000-0000-000000000002')
on conflict do nothing;

insert into public.resource_units (resource_id, unit_name, unit_symbol, to_base_factor, is_base)
values
  ('30000000-0000-0000-0000-000000000001','Kilogramo','kg',1,true),
  ('30000000-0000-0000-0000-000000000001','Botella 500ml','botella',0.025,false),
  ('30000000-0000-0000-0000-000000000001','Tonelada','t',1000,false),
  ('30000000-0000-0000-0000-000000000002','Kilogramo','kg',1,true),
  ('30000000-0000-0000-0000-000000000002','Tonelada','t',1000,false),
  ('30000000-0000-0000-0000-000000000003','Kilogramo','kg',1,true),
  ('30000000-0000-0000-0000-000000000003','Caja','caja',0.8,false),
  ('30000000-0000-0000-0000-000000000004','Kilogramo','kg',1,true),
  ('30000000-0000-0000-0000-000000000004','Botella vidrio','botella',0.3,false),
  ('30000000-0000-0000-0000-000000000005','Kilogramo','kg',1,true),
  ('30000000-0000-0000-0000-000000000005','Lata','lata',0.014,false),
  ('30000000-0000-0000-0000-000000000006','Litro','l',1,true),
  ('30000000-0000-0000-0000-000000000006','m3','m3',1000,false),
  ('30000000-0000-0000-0000-000000000007','kWh','kwh',1,true),
  ('30000000-0000-0000-0000-000000000007','MWh','mwh',1000,false),
  ('30000000-0000-0000-0000-000000000008','Unidad','unidad',1,true)
on conflict do nothing;

insert into public.equivalences (id, version_id, slug, title, output_unit, description, confidence, co2e_ton_per_unit, formula, is_demo)
values
  ('40000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','auto-anual','Automoviles a gasolina fuera de circulacion por 1 ano','vehiculos','Vehiculos de pasajeros retirados durante un ano','high',4.64,'co2e_ton / 4.64',false),
  ('40000000-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','km-auto','Kilometros recorridos por auto promedio','km','Distancia equivalente en auto a gasolina','high',0.000251,'co2e_ton / 0.000251',false),
  ('40000000-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','hogar-energia','Consumo anual de energia de un hogar','hogares','Hogares cuyo consumo anual equivale al CO2e','high',7.94,'co2e_ton / 7.94',false),
  ('40000000-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111','kwh-ahorrados','kWh de electricidad','kwh','Electricidad equivalente en kWh','medium',0.000392,'co2e_ton / 0.000392',false),
  ('40000000-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111','camion-cisterna','Camiones cisterna de gasolina','camiones','Camiones cisterna llenos de gasolina','high',75.57,'co2e_ton / 75.57',false),
  ('40000000-0000-0000-0000-000000000006','11111111-1111-1111-1111-111111111111','litros-gasolina','Litros de gasolina consumidos','litros','Litros de gasolina equivalentes','high',0.00235,'co2e_ton / 0.00235',false),
  ('40000000-0000-0000-0000-000000000007','11111111-1111-1111-1111-111111111111','balones-gas','Balones de gas de 8 kg','balones','Consumo de cilindros de gas licuado','medium',0.024,'co2e_ton / 0.024',false),
  ('40000000-0000-0000-0000-000000000008','11111111-1111-1111-1111-111111111111','smartphones','Cargas de smartphones','cargas','Numero de cargas completas de smartphone','high',0.00000822,'co2e_ton / 0.00000822',false),
  ('40000000-0000-0000-0000-000000000009','11111111-1111-1111-1111-111111111111','turbinas-viento','Turbinas eolicas operando 1 ano','turbinas-anio','Turbinas de viento equivalentes','medium',3679,'co2e_ton / 3679',false),
  ('40000000-0000-0000-0000-000000000010','11111111-1111-1111-1111-111111111111','bombillas-led','Bombillas incandescentes reemplazadas por LED','bombillas','Recambio de bombillas por 1 ano','medium',0.0264,'co2e_ton / 0.0264',false),
  ('40000000-0000-0000-0000-000000000011','11111111-1111-1111-1111-111111111111','arboles-10','Arboles urbanos cultivados 10 anos','arboles','Secuestro de carbono por arboles urbanos','medium',0.060,'co2e_ton / 0.060',false),
  ('40000000-0000-0000-0000-000000000012','11111111-1111-1111-1111-111111111111','hectareas-bosque','Hectareas de bosque en 1 ano','ha-anio','Secuestro anual de bosque','medium',2.08,'co2e_ton / 2.08',false),
  ('40000000-0000-0000-0000-000000000013','11111111-1111-1111-1111-111111111111','duchas-8min','Duchas de 8 minutos','duchas','Equivalente de energia/agua promedio por ducha','low',0.0018,'co2e_ton / 0.0018',true),
  ('40000000-0000-0000-0000-000000000014','11111111-1111-1111-1111-111111111111','lavados-ropa','Ciclos de lavadora eficientes','ciclos','Ciclos de lavado equivalentes','low',0.00062,'co2e_ton / 0.00062',true),
  ('40000000-0000-0000-0000-000000000015','11111111-1111-1111-1111-111111111111','cargas-laptop','Cargas de laptop','cargas','Cargas completas de una laptop promedio','low',0.000045,'co2e_ton / 0.000045',true),
  ('40000000-0000-0000-0000-000000000016','11111111-1111-1111-1111-111111111111','horas-tv-led','Horas de TV LED','horas','Horas de TV LED equivalente','low',0.000031,'co2e_ton / 0.000031',true),
  ('40000000-0000-0000-0000-000000000017','11111111-1111-1111-1111-111111111111','email-enviados','Emails enviados','emails','Envio de correos electronicos equivalentes','low',0.000000004,'co2e_ton / 0.000000004',true),
  ('40000000-0000-0000-0000-000000000018','11111111-1111-1111-1111-111111111111','botellas-agua','Botellas de agua de 500 ml evitadas','botellas','Produccion y logistica evitada','low',0.00009,'co2e_ton / 0.00009',true),
  ('40000000-0000-0000-0000-000000000019','11111111-1111-1111-1111-111111111111','viajes-metro','Viajes de metro','viajes','Viajes urbanos en metro equivalentes','low',0.0012,'co2e_ton / 0.0012',true),
  ('40000000-0000-0000-0000-000000000020','11111111-1111-1111-1111-111111111111','viajes-bus','Viajes en bus urbano','viajes','Viajes promedio de bus equivalente','low',0.0019,'co2e_ton / 0.0019',true),
  ('40000000-0000-0000-0000-000000000021','11111111-1111-1111-1111-111111111111','kilos-carbon','kg de carbon no quemado','kg','Carbon mineral no quemado equivalente','low',0.00242,'co2e_ton / 0.00242',true),
  ('40000000-0000-0000-0000-000000000022','11111111-1111-1111-1111-111111111111','m3-gas-natural','m3 de gas natural no consumido','m3','Gas natural equivalente','low',0.0019,'co2e_ton / 0.0019',true),
  ('40000000-0000-0000-0000-000000000023','11111111-1111-1111-1111-111111111111','dias-nevera','Dias de uso de nevera eficiente','dias','Uso de electrodomestico equivalente','low',0.0033,'co2e_ton / 0.0033',true),
  ('40000000-0000-0000-0000-000000000024','11111111-1111-1111-1111-111111111111','horas-ac','Horas de aire acondicionado','horas','Uso de aire acondicionado equivalente','low',0.00081,'co2e_ton / 0.00081',true),
  ('40000000-0000-0000-0000-000000000025','11111111-1111-1111-1111-111111111111','vasos-cafe','Tazas de cafe preparadas','tazas','Consumo energetico de hervido equivalente','low',0.000055,'co2e_ton / 0.000055',true),
  ('40000000-0000-0000-0000-000000000026','11111111-1111-1111-1111-111111111111','km-bicicleta','Kilometros en bicicleta urbana','km','Sustitucion modal equivalente','low',0.00014,'co2e_ton / 0.00014',true),
  ('40000000-0000-0000-0000-000000000027','11111111-1111-1111-1111-111111111111','comidas-vegetales','Comidas vegetales en lugar de carne','comidas','Comparacion alimentaria equivalente','low',0.0011,'co2e_ton / 0.0011',true),
  ('40000000-0000-0000-0000-000000000028','11111111-1111-1111-1111-111111111111','bolsas-reutilizables','Usos de bolsa reutilizable','usos','Sustitucion de bolsa de un solo uso','low',0.000012,'co2e_ton / 0.000012',true),
  ('40000000-0000-0000-0000-000000000029','11111111-1111-1111-1111-111111111111','dias-computador','Dias de computador de escritorio','dias','Consumo electrico de un PC escritorio','low',0.0026,'co2e_ton / 0.0026',true),
  ('40000000-0000-0000-0000-000000000030','11111111-1111-1111-1111-111111111111','horas-streaming','Horas de streaming en HD','horas','Transmision de video equivalente','low',0.000036,'co2e_ton / 0.000036',true)
on conflict (id) do nothing;

-- 1-3 citas por equivalencia (obligatorias)
insert into public.equivalence_sources (equivalence_id, source_id)
values
  ('40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000005'),
  ('40000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000004'),
  ('40000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000008','20000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000009','20000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000010','20000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000011','20000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000012','20000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000013','20000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000013','20000000-0000-0000-0000-000000000010'),
  ('40000000-0000-0000-0000-000000000014','20000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000014','20000000-0000-0000-0000-000000000010'),
  ('40000000-0000-0000-0000-000000000015','20000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000015','20000000-0000-0000-0000-000000000010'),
  ('40000000-0000-0000-0000-000000000016','20000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000017','20000000-0000-0000-0000-000000000010'),
  ('40000000-0000-0000-0000-000000000018','20000000-0000-0000-0000-000000000010'),
  ('40000000-0000-0000-0000-000000000019','20000000-0000-0000-0000-000000000010'),
  ('40000000-0000-0000-0000-000000000020','20000000-0000-0000-0000-000000000010'),
  ('40000000-0000-0000-0000-000000000021','20000000-0000-0000-0000-000000000006'),
  ('40000000-0000-0000-0000-000000000022','20000000-0000-0000-0000-000000000006'),
  ('40000000-0000-0000-0000-000000000023','20000000-0000-0000-0000-000000000004'),
  ('40000000-0000-0000-0000-000000000024','20000000-0000-0000-0000-000000000004'),
  ('40000000-0000-0000-0000-000000000025','20000000-0000-0000-0000-000000000010'),
  ('40000000-0000-0000-0000-000000000026','20000000-0000-0000-0000-000000000010'),
  ('40000000-0000-0000-0000-000000000027','20000000-0000-0000-0000-000000000010'),
  ('40000000-0000-0000-0000-000000000028','20000000-0000-0000-0000-000000000010'),
  ('40000000-0000-0000-0000-000000000029','20000000-0000-0000-0000-000000000004'),
  ('40000000-0000-0000-0000-000000000030','20000000-0000-0000-0000-000000000010')
on conflict do nothing;
