import { describe, expect, it } from "vitest";
import { toCsv, toSimpleHtmlReport } from "../src/export";
import type { CalculationResult } from "../src/types";

const results: CalculationResult[] = [
  {
    equivalenceId: "e1",
    title: "=SUM(1,2)",
    value: 1.23,
    outputUnit: "@u",
    description: "+cmd",
    confidence: "low",
    citations: [
      {
        id: "c1",
        author: "X",
        organization: "-Evil Org",
        title: "<script>alert(1)</script>",
        year: 2024,
        accessedAt: "2026-02-21",
        url: "javascript:alert(1)"
      }
    ]
  }
];

describe("export", () => {
  it("escapes CSV cells to prevent formula injection", () => {
    const csv = toCsv(results);
    const line = csv.split("\n")[1];
    expect(line).toContain("\"'=SUM(1,2)\"");
    expect(line).toContain("\"'@u\"");
    expect(line).toContain("\"'+cmd\"");
    expect(line).toContain("\"'-Evil Org (2024) <script>alert(1)</script> javascript:alert(1)\"");
  });

  it("escapes HTML in PDF report", () => {
    const html = toSimpleHtmlReport("Input <b>1</b>", results);
    expect(html).toContain("Input &lt;b&gt;1&lt;/b&gt;");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
  });
});
