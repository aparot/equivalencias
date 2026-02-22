import type { LocaleCode } from "./types";

type Dict = Record<string, string>;

const dictionaries: Record<LocaleCode, Dict> = {
  es: {
    appTitle: "EcoEquivalencias",
    calculate: "Calcular",
    quantity: "Cantidad",
    resource: "Recurso",
    unit: "Unidad",
    recentHistory: "Historial reciente",
    sources: "Fuentes"
  },
  en: {
    appTitle: "EcoEquivalences",
    calculate: "Calculate",
    quantity: "Quantity",
    resource: "Resource",
    unit: "Unit",
    recentHistory: "Recent history",
    sources: "Sources"
  },
  pt: {
    appTitle: "EcoEquivalências",
    calculate: "Calcular",
    quantity: "Quantidade",
    resource: "Recurso",
    unit: "Unidade",
    recentHistory: "Histórico recente",
    sources: "Fontes"
  }
};

export function t(locale: LocaleCode, key: string): string {
  return dictionaries[locale][key] ?? dictionaries.es[key] ?? key;
}
