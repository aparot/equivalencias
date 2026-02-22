const MAX_QUANTITY = 1_000_000;

export function validateQuantity(raw: string): { valid: boolean; value?: number; error?: string } {
  if (!raw.trim()) {
    return { valid: false, error: "La cantidad es obligatoria." };
  }

  const normalized = raw.replaceAll(",", ".");
  const value = Number(normalized);

  if (Number.isNaN(value)) {
    return { valid: false, error: "La cantidad debe ser numérica." };
  }

  if (value <= 0) {
    return { valid: false, error: "La cantidad debe ser mayor a 0." };
  }

  if (value > MAX_QUANTITY) {
    return { valid: false, error: `La cantidad no puede superar ${MAX_QUANTITY}.` };
  }

  return { valid: true, value };
}
