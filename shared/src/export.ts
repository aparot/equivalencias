import type { CalculationResult } from "./types";

function compactValue(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  const abs = Math.abs(value);
  if (abs === 0) {
    return "0";
  }
  if (abs < 0.01) {
    return "<0.01";
  }
  if (abs >= 1000) {
    return value.toLocaleString("es-CL", { maximumFractionDigits: 0 });
  }
  if (abs >= 100) {
    return value.toLocaleString("es-CL", { maximumFractionDigits: 1 });
  }
  return value.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escapeCsvCell(value: unknown): string {
  const text = String(value ?? "");
  const needsPrefix = /^[=+\-@]/.test(text.trimStart());
  return needsPrefix ? `'${text}` : text;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function toCsv(results: CalculationResult[]): string {
  const headers = ["equivalence", "value", "unit", "description", "sources"];
  const rows = results.map((r) => {
    const sources = r.citations
      .map((c) => `${c.organization} (${c.year}) ${c.title}${c.url ? ` ${c.url}` : ""}`)
      .join(" | ");

    return [r.title, compactValue(r.value), r.outputUnit, r.description, sources]
      .map((cell) => `"${escapeCsvCell(cell).replaceAll('"', '""')}"`)
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function toSimpleHtmlReport(
  inputLabel: string,
  results: CalculationResult[]
): string {
  const list = results
    .map((r) => {
      const cites = r.citations
        .map(
          (c) =>
            `<li>${escapeHtml(c.organization)} (${escapeHtml(c.year)}). ${escapeHtml(c.title)}. ${escapeHtml(
              c.url ?? c.doi ?? ""
            )}. Acceso: ${escapeHtml(c.accessedAt)}</li>`
        )
        .join("");

      return `<h3>${escapeHtml(r.title)}: ${escapeHtml(compactValue(r.value))} ${escapeHtml(
        r.outputUnit
      )}</h3><p>${escapeHtml(r.description)}</p><ul>${cites}</ul>`;
    })
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"/><title>EcoEquivalencias</title></head><body><h1>Reporte EcoEquivalencias</h1><p><strong>Entrada:</strong> ${escapeHtml(
    inputLabel
  )}</p>${list}</body></html>`;
}
