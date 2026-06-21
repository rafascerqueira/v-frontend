import { describe, expect, it } from "vitest";
import type { Product } from "@/types";
import { displayStock, getLineStockWarning } from "./stock";

// Minimal Product for the stock checks. Pass stock: null for a product with no
// stock control (the cast keeps the fixture small without the full Product shape).
const makeProduct = (
	allowOversell: boolean,
	stock: { quantity: number; reserved_quantity?: number } | null,
): Product =>
	({
		id: 1,
		name: "Camiseta",
		allow_oversell: allowOversell,
		stock:
			stock === null
				? null
				: {
						id: 1,
						quantity: stock.quantity,
						reserved_quantity: stock.reserved_quantity ?? 0,
						min_stock: 0,
						max_stock: 0,
					},
	}) as unknown as Product;

describe("displayStock", () => {
	it("clamps a negative (oversold) quantity to 0", () => {
		expect(displayStock(-3)).toBe(0);
		expect(displayStock(-1)).toBe(0);
	});

	it("passes through zero and positive quantities", () => {
		expect(displayStock(0)).toBe(0);
		expect(displayStock(7)).toBe(7);
	});
});

describe("getLineStockWarning", () => {
	it("returns null when the product has no stock control", () => {
		expect(getLineStockWarning(makeProduct(false, null), 100)).toBeNull();
		expect(getLineStockWarning(undefined, 100)).toBeNull();
	});

	it("returns null when there is enough available stock", () => {
		// available = 10 - 2 = 8, requested 8 → no shortage
		expect(
			getLineStockWarning(
				makeProduct(false, { quantity: 10, reserved_quantity: 2 }),
				8,
			),
		).toBeNull();
	});

	it("flags a shortage with allowOversell=false for a non-oversell product", () => {
		expect(getLineStockWarning(makeProduct(false, { quantity: 2 }), 5)).toEqual(
			{
				available: 2,
				shortage: 3,
				allowOversell: false,
			},
		);
	});

	it("flags a shortage with allowOversell=true for an oversell product", () => {
		expect(getLineStockWarning(makeProduct(true, { quantity: 2 }), 5)).toEqual({
			available: 2,
			shortage: 3,
			allowOversell: true,
		});
	});

	it("clamps reported available to 0 when stock is already negative", () => {
		// available is -1 → reported as 0; shortage is the full requested amount.
		expect(getLineStockWarning(makeProduct(true, { quantity: -1 }), 2)).toEqual(
			{
				available: 0,
				shortage: 3,
				allowOversell: true,
			},
		);
	});
});
