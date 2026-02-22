import { describe, expect, it } from "vitest";
import { calculateAvoidedCo2eTon, calculateEquivalences, toResourceBaseUnits } from "../src/calc";
import type { Equivalence, Resource, Unit } from "../src/types";

const resource: Resource = {
  id: "r1",
  slug: "pet-500ml",
  name: "Botella PET 500ml",
  baseUnit: "kg",
  factorKgCo2ePerBaseUnit: 2.1,
  version: "v1",
  validFrom: "2026-01-01",
  citations: [
    {
      id: "c1",
      author: "EPA",
      organization: "EPA",
      title: "WARM",
      year: 2024,
      accessedAt: "2026-02-21"
    }
  ]
};

const unit: Unit = {
  id: "u1",
  resourceId: "r1",
  name: "botella",
  symbol: "botella",
  toBaseFactor: 0.025,
  isBase: false
};

const cited: Equivalence = {
  id: "e1",
  slug: "km-auto",
  title: "Kilómetros en auto",
  outputUnit: "km",
  description: "Distancia equivalente",
  co2eTonPerUnit: 0.000251,
  formula: "co2e_ton / 0.000251",
  version: "v1",
  validFrom: "2026-01-01",
  citations: [
    {
      id: "c2",
      author: "EPA",
      organization: "EPA",
      title: "GHG Equivalencies",
      year: 2024,
      accessedAt: "2026-02-21"
    }
  ]
};

const uncited: Equivalence = {
  ...cited,
  id: "e2",
  slug: "sin-cita",
  title: "No debería aparecer",
  citations: []
};

describe("unit conversion", () => {
  it("converts units to base", () => {
    expect(toResourceBaseUnits(6, 0.025)).toBeCloseTo(0.15, 6);
  });
});

describe("equivalence calculation", () => {
  it("calculates avoided co2e and equivalences", () => {
    const co2eTon = calculateAvoidedCo2eTon(0.15, 2.1);
    expect(co2eTon).toBeCloseTo(0.000315, 9);

    const result = calculateEquivalences({ resource, unit, quantity: 6 }, [cited], 10);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBeCloseTo(1.2549800796, 6);
  });

  it("never returns equivalences without citations", () => {
    const result = calculateEquivalences({ resource, unit, quantity: 6 }, [uncited], 10);
    expect(result).toHaveLength(0);
  });
});
