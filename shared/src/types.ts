export type LocaleCode = "es" | "en" | "pt";

export type Citation = {
  id: string;
  author: string;
  organization: string;
  title: string;
  year: number;
  url?: string;
  doi?: string;
  accessedAt: string;
  notes?: string;
  isDemo?: boolean;
};

export type Unit = {
  id: string;
  resourceId: string;
  name: string;
  symbol: string;
  toBaseFactor: number;
  isBase: boolean;
};

export type Resource = {
  id: string;
  slug: string;
  name: string;
  baseUnit: string;
  factorKgCo2ePerBaseUnit: number;
  version: string;
  validFrom: string;
  validTo?: string;
  citations: Citation[];
};

export type Equivalence = {
  id: string;
  slug: string;
  title: string;
  outputUnit: string;
  description: string;
  confidence?: "high" | "medium" | "low";
  co2eTonPerUnit: number;
  formula: string;
  version: string;
  validFrom: string;
  validTo?: string;
  citations: Citation[];
  isDemo?: boolean;
};

export type CalculationInput = {
  resource: Resource;
  unit: Unit;
  quantity: number;
};

export type CalculationResult = {
  equivalenceId: string;
  title: string;
  value: number;
  outputUnit: string;
  description: string;
  confidence?: "high" | "medium" | "low";
  citations: Citation[];
};
