import { describe, expect, it } from "vitest";
import {
	canReverse,
	type LedgerEntry,
	reversedPaymentIds,
} from "./billing-ledger";

const entry = (over: Partial<LedgerEntry>): LedgerEntry => ({
	id: 1,
	billing_id: 7,
	kind: "payment",
	amount: 1000,
	method: "pix",
	paid_at: "2026-11-01T12:00:00.000Z",
	note: null,
	created_by: null,
	reversal_of_id: null,
	created_at: "2026-11-01T12:00:00.000Z",
	...over,
});

describe("billing ledger helpers", () => {
	const payments = [
		entry({ id: 1 }),
		entry({ id: 2 }),
		entry({ id: 3, kind: "reversal", reversal_of_id: 1 }),
	];

	it("finds the payments that were reversed", () => {
		expect([...reversedPaymentIds(payments)]).toEqual([1]);
	});

	it("only lets a payment that was not reversed be reversed — never a reversal", () => {
		const reversed = reversedPaymentIds(payments);

		expect(canReverse(payments[0], reversed)).toBe(false);
		expect(canReverse(payments[1], reversed)).toBe(true);
		expect(canReverse(payments[2], reversed)).toBe(false);
	});
});
