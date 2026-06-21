import type { Product } from "@/types";

// Stock displayed to the seller never goes negative: a deficit (oversold stock) is
// conveyed by an "aguardando reposição" badge + owed quantity, not by a negative
// count. Keep this the single source of truth so products/stock pages agree.
export function displayStock(quantity: number): number {
	return Math.max(quantity, 0);
}

export interface LineStockWarning {
	// Units actually on hand (never negative).
	available: number;
	// How many requested units exceed what's available.
	shortage: number;
	// Whether the product is allowed to be sold past stock (backorder) or not.
	allowOversell: boolean;
}

// Returns a shortage descriptor when `quantity` of `product` exceeds available
// stock, or null when there's enough (or the product has no stock control). Drives
// the order modal's pre-submit warning so a non-oversell shortage is caught in the
// UI instead of bouncing off the backend's 400.
export function getLineStockWarning(
	product: Product | undefined,
	quantity: number,
): LineStockWarning | null {
	if (!product?.stock) return null; // product has no stock control
	const available = product.stock.quantity - product.stock.reserved_quantity;
	const shortage = quantity - available;
	if (shortage <= 0) return null;
	return {
		available: Math.max(available, 0),
		shortage,
		allowOversell: product.allow_oversell,
	};
}
