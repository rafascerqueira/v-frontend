import { describe, expect, it } from "vitest";
import { formatCurrency } from "./utils";

// Smoke test for the Vitest harness + the money-cents pt-BR formatting rule:
// formatCurrency takes integer cents and renders Brazilian currency (NBSP-separated).
describe("formatCurrency", () => {
	it("formats integer cents as pt-BR BRL", () => {
		expect(formatCurrency(1490).replace(/ /g, " ")).toBe("R$ 14,90");
	});

	it("never emits a raw float decimal", () => {
		expect(formatCurrency(1990)).not.toMatch(/19\.9/);
	});
});
