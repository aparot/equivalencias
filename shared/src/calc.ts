import type { CalculationInput, CalculationResult, Equivalence } from "./types";

export const MAX_RESULTS = 10;

export function toResourceBaseUnits(quantity: number, toBaseFactor: number): number {
  return quantity * toBaseFactor;
}

export function calculateAvoidedCo2eTon(quantityBase: number, factorKgCo2ePerBaseUnit: number): number {
  const kgCo2e = quantityBase * factorKgCo2ePerBaseUnit;
  return kgCo2e / 1000;
}

function confidenceWeight(confidence?: "high" | "medium" | "low"): number {
  if (confidence === "high") {
    return 3;
  }
  if (confidence === "medium") {
    return 2;
  }
  return 1;
}

function familyKey(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readabilityScore(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return -100;
  }
  // Favor values close to human scale (around 1) over extreme tiny/huge outputs.
  return 20 - Math.abs(Math.log10(value));
}

export function calculateEquivalences(
  input: CalculationInput,
  equivalences: Equivalence[],
  maxResults = MAX_RESULTS
): CalculationResult[] {
  const quantityBase = toResourceBaseUnits(input.quantity, input.unit.toBaseFactor);
  const avoidedCo2eTon = calculateAvoidedCo2eTon(quantityBase, input.resource.factorKgCo2ePerBaseUnit);
  const computed = equivalences
    .filter((e) => e.citations.length > 0)
    .map((e) => {
      const value = avoidedCo2eTon / e.co2eTonPerUnit;
      return {
        equivalenceId: e.id,
        title: e.title,
        value,
        outputUnit: e.outputUnit,
        description: e.description,
        confidence: e.confidence,
        citations: e.citations,
        family: familyKey(e.title),
        score: confidenceWeight(e.confidence) * 100 + readabilityScore(value)
      };
    })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "es"));

  const selected: typeof computed = [];
  const seenFamilies = new Set<string>();

  for (const item of computed) {
    if (seenFamilies.has(item.family)) {
      continue;
    }
    selected.push(item);
    seenFamilies.add(item.family);
    if (selected.length >= maxResults) {
      break;
    }
  }

  if (selected.length < maxResults) {
    for (const item of computed) {
      if (selected.some((current) => current.equivalenceId === item.equivalenceId)) {
        continue;
      }
      selected.push(item);
      if (selected.length >= maxResults) {
        break;
      }
    }
  }

  return selected.map(({ family: _family, score: _score, ...result }) => result);
}
