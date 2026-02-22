import { describe, expect, it } from "vitest";
import { validateQuantity } from "../src/validation";

describe("validateQuantity", () => {
  it("accepts comma decimals", () => {
    const result = validateQuantity("1,25");
    expect(result.valid).toBe(true);
    expect(result.value).toBeCloseTo(1.25, 6);
  });
});
