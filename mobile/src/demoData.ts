import type { Citation, Equivalence, Resource, Unit } from "@ecoequivalencias/shared";

const epa: Citation = {
  id: "c-epa",
  author: "US EPA",
  organization: "US EPA",
  title: "GHG Equivalencies Calculator",
  year: 2024,
  url: "https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator",
  accessedAt: "2026-02-21"
};

export const demoResources: Array<Resource & { units: Unit[] }> = [
  {
    id: "30000000-0000-0000-0000-000000000001",
    slug: "papel-blanco-oficio",
    name: "Papel blanco (hoja oficio)",
    baseUnit: "kg",
    factorKgCo2ePerBaseUnit: 1.15,
    version: "mvp-demo",
    validFrom: "2026-01-01",
    citations: [epa],
    units: [
      { id: "u001", resourceId: "30000000-0000-0000-0000-000000000001", name: "Kilogramo", symbol: "kg", toBaseFactor: 1, isBase: true },
      { id: "u002", resourceId: "30000000-0000-0000-0000-000000000001", name: "Hoja", symbol: "hoja", toBaseFactor: 0.005, isBase: false }
    ]
  },
  {
    id: "30000000-0000-0000-0000-000000000002",
    slug: "papel-periodico",
    name: "Papel periodico",
    baseUnit: "kg",
    factorKgCo2ePerBaseUnit: 1.05,
    version: "mvp-demo",
    validFrom: "2026-01-01",
    citations: [epa],
    units: [
      { id: "u003", resourceId: "30000000-0000-0000-0000-000000000002", name: "Kilogramo", symbol: "kg", toBaseFactor: 1, isBase: true },
      { id: "u004", resourceId: "30000000-0000-0000-0000-000000000002", name: "Diario", symbol: "diario", toBaseFactor: 0.12, isBase: false }
    ]
  },
  {
    id: "30000000-0000-0000-0000-000000000003",
    slug: "papel-mixto",
    name: "Papel mixto",
    baseUnit: "kg",
    factorKgCo2ePerBaseUnit: 1.2,
    version: "mvp-demo",
    validFrom: "2026-01-01",
    citations: [epa],
    units: [{ id: "u005", resourceId: "30000000-0000-0000-0000-000000000003", name: "Kilogramo", symbol: "kg", toBaseFactor: 1, isBase: true }]
  },
  {
    id: "30000000-0000-0000-0000-000000000004",
    slug: "carton-corrugado",
    name: "Carton corrugado",
    baseUnit: "kg",
    factorKgCo2ePerBaseUnit: 1.45,
    version: "mvp-demo",
    validFrom: "2026-01-01",
    citations: [epa],
    units: [{ id: "u006", resourceId: "30000000-0000-0000-0000-000000000004", name: "Kilogramo", symbol: "kg", toBaseFactor: 1, isBase: true }]
  },
  {
    id: "30000000-0000-0000-0000-000000000005",
    slug: "envase-carton-bebidas",
    name: "Envase carton para bebidas",
    baseUnit: "kg",
    factorKgCo2ePerBaseUnit: 1.28,
    version: "mvp-demo",
    validFrom: "2026-01-01",
    citations: [epa],
    units: [
      { id: "u007", resourceId: "30000000-0000-0000-0000-000000000005", name: "Kilogramo", symbol: "kg", toBaseFactor: 1, isBase: true },
      { id: "u008", resourceId: "30000000-0000-0000-0000-000000000005", name: "Envase 1L", symbol: "envase", toBaseFactor: 0.032, isBase: false }
    ]
  },
  {
    id: "30000000-0000-0000-0000-000000000006",
    slug: "pet-500ml",
    name: "Botella PET 500ml",
    baseUnit: "kg",
    factorKgCo2ePerBaseUnit: 2.1,
    version: "mvp-demo",
    validFrom: "2026-01-01",
    citations: [epa],
    units: [
      { id: "u009", resourceId: "30000000-0000-0000-0000-000000000006", name: "Kilogramo", symbol: "kg", toBaseFactor: 1, isBase: true },
      { id: "u010", resourceId: "30000000-0000-0000-0000-000000000006", name: "Botella 500ml", symbol: "botella500", toBaseFactor: 0.025, isBase: false }
    ]
  },
  {
    id: "30000000-0000-0000-0000-000000000007",
    slug: "pet-1litro",
    name: "Botella PET 1 litro",
    baseUnit: "kg",
    factorKgCo2ePerBaseUnit: 2.1,
    version: "mvp-demo",
    validFrom: "2026-01-01",
    citations: [epa],
    units: [
      { id: "u011", resourceId: "30000000-0000-0000-0000-000000000007", name: "Kilogramo", symbol: "kg", toBaseFactor: 1, isBase: true },
      { id: "u012", resourceId: "30000000-0000-0000-0000-000000000007", name: "Botella 1L", symbol: "botella1l", toBaseFactor: 0.038, isBase: false }
    ]
  },
  {
    id: "30000000-0000-0000-0000-000000000008",
    slug: "pet-1p5litros",
    name: "Botella PET 1.5 litros",
    baseUnit: "kg",
    factorKgCo2ePerBaseUnit: 2.1,
    version: "mvp-demo",
    validFrom: "2026-01-01",
    citations: [epa],
    units: [
      { id: "u013", resourceId: "30000000-0000-0000-0000-000000000008", name: "Kilogramo", symbol: "kg", toBaseFactor: 1, isBase: true },
      { id: "u014", resourceId: "30000000-0000-0000-0000-000000000008", name: "Botella 1.5L", symbol: "botella15l", toBaseFactor: 0.045, isBase: false }
    ]
  },
  {
    id: "30000000-0000-0000-0000-000000000009",
    slug: "lata-aluminio-350ml",
    name: "Lata aluminio 350ml",
    baseUnit: "kg",
    factorKgCo2ePerBaseUnit: 7.5,
    version: "mvp-demo",
    validFrom: "2026-01-01",
    citations: [epa],
    units: [
      { id: "u015", resourceId: "30000000-0000-0000-0000-000000000009", name: "Kilogramo", symbol: "kg", toBaseFactor: 1, isBase: true },
      { id: "u016", resourceId: "30000000-0000-0000-0000-000000000009", name: "Lata 350ml", symbol: "lata350", toBaseFactor: 0.014, isBase: false }
    ]
  },
  {
    id: "30000000-0000-0000-0000-000000000010",
    slug: "lata-aluminio-200cc",
    name: "Lata aluminio 200cc",
    baseUnit: "kg",
    factorKgCo2ePerBaseUnit: 7.5,
    version: "mvp-demo",
    validFrom: "2026-01-01",
    citations: [epa],
    units: [
      { id: "u017", resourceId: "30000000-0000-0000-0000-000000000010", name: "Kilogramo", symbol: "kg", toBaseFactor: 1, isBase: true },
      { id: "u018", resourceId: "30000000-0000-0000-0000-000000000010", name: "Lata 200cc", symbol: "lata200", toBaseFactor: 0.009, isBase: false }
    ]
  },
  {
    id: "30000000-0000-0000-0000-000000000011",
    slug: "lata-acero-conserva",
    name: "Lata acero conserva",
    baseUnit: "kg",
    factorKgCo2ePerBaseUnit: 3.2,
    version: "mvp-demo",
    validFrom: "2026-01-01",
    citations: [epa],
    units: [
      { id: "u019", resourceId: "30000000-0000-0000-0000-000000000011", name: "Kilogramo", symbol: "kg", toBaseFactor: 1, isBase: true },
      { id: "u020", resourceId: "30000000-0000-0000-0000-000000000011", name: "Lata conserva", symbol: "lata", toBaseFactor: 0.035, isBase: false }
    ]
  },
  {
    id: "30000000-0000-0000-0000-000000000012",
    slug: "vidrio-botella",
    name: "Vidrio botella",
    baseUnit: "kg",
    factorKgCo2ePerBaseUnit: 0.35,
    version: "mvp-demo",
    validFrom: "2026-01-01",
    citations: [epa],
    units: [
      { id: "u021", resourceId: "30000000-0000-0000-0000-000000000012", name: "Kilogramo", symbol: "kg", toBaseFactor: 1, isBase: true },
      { id: "u022", resourceId: "30000000-0000-0000-0000-000000000012", name: "Botella vidrio", symbol: "botella", toBaseFactor: 0.4, isBase: false }
    ]
  },
  {
    id: "30000000-0000-0000-0000-000000000013",
    slug: "vidrio-frasco",
    name: "Vidrio frasco",
    baseUnit: "kg",
    factorKgCo2ePerBaseUnit: 0.35,
    version: "mvp-demo",
    validFrom: "2026-01-01",
    citations: [epa],
    units: [
      { id: "u023", resourceId: "30000000-0000-0000-0000-000000000013", name: "Kilogramo", symbol: "kg", toBaseFactor: 1, isBase: true },
      { id: "u024", resourceId: "30000000-0000-0000-0000-000000000013", name: "Frasco vidrio", symbol: "frasco", toBaseFactor: 0.22, isBase: false }
    ]
  },
  {
    id: "30000000-0000-0000-0000-000000000014",
    slug: "envase-hdpe-detergente",
    name: "Envase HDPE detergente",
    baseUnit: "kg",
    factorKgCo2ePerBaseUnit: 1.9,
    version: "mvp-demo",
    validFrom: "2026-01-01",
    citations: [epa],
    units: [
      { id: "u025", resourceId: "30000000-0000-0000-0000-000000000014", name: "Kilogramo", symbol: "kg", toBaseFactor: 1, isBase: true },
      { id: "u026", resourceId: "30000000-0000-0000-0000-000000000014", name: "Envase 1L", symbol: "envase1l", toBaseFactor: 0.06, isBase: false }
    ]
  },
  {
    id: "30000000-0000-0000-0000-000000000015",
    slug: "bolsa-plastica-ldpe",
    name: "Bolsa plastica LDPE",
    baseUnit: "kg",
    factorKgCo2ePerBaseUnit: 2.3,
    version: "mvp-demo",
    validFrom: "2026-01-01",
    citations: [epa],
    units: [
      { id: "u027", resourceId: "30000000-0000-0000-0000-000000000015", name: "Kilogramo", symbol: "kg", toBaseFactor: 1, isBase: true },
      { id: "u028", resourceId: "30000000-0000-0000-0000-000000000015", name: "Bolsa", symbol: "bolsa", toBaseFactor: 0.008, isBase: false }
    ]
  },
  {
    id: "30000000-0000-0000-0000-000000000016",
    slug: "tapas-plasticas-pp",
    name: "Tapas plasticas PP",
    baseUnit: "kg",
    factorKgCo2ePerBaseUnit: 2.0,
    version: "mvp-demo",
    validFrom: "2026-01-01",
    citations: [epa],
    units: [
      { id: "u029", resourceId: "30000000-0000-0000-0000-000000000016", name: "Kilogramo", symbol: "kg", toBaseFactor: 1, isBase: true },
      { id: "u030", resourceId: "30000000-0000-0000-0000-000000000016", name: "Tapa", symbol: "tapa", toBaseFactor: 0.0025, isBase: false }
    ]
  }
];

export const demoEquivalences: Equivalence[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `eq-${i + 1}`,
  slug: `equivalencia-${i + 1}`,
  title: i === 0 ? "Kilometros en auto promedio" : `Equivalencia demo ${i + 1}`,
  outputUnit: i === 0 ? "km" : "unidades",
  description: "Comparacion de impacto evitado basada en CO2e.",
  confidence: i < 10 ? "high" : i < 20 ? "medium" : "low",
  co2eTonPerUnit: i === 0 ? 0.000251 : 0.0001 + i * 0.00005,
  formula: "co2e_ton / factor",
  version: "mvp-demo",
  validFrom: "2026-01-01",
  citations: [epa],
  isDemo: true
}));
