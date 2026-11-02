/**
 * A charge's payment ledger (backend Phase 1C). Entries are append-only: money
 * received is a `payment`; giving it back is a `reversal` pointing at the payment
 * it cancels (at most one per payment). Amounts are integer cents, always > 0.
 */
export interface LedgerEntry {
	id: number;
	billing_id: number;
	kind: "payment" | "reversal";
	amount: number;
	method: "cash" | "credit_card" | "debit_card" | "pix";
	paid_at: string;
	note: string | null;
	created_by: string | null;
	reversal_of_id: number | null;
	created_at: string;
}

export const PAYMENT_METHOD_LABELS: Record<LedgerEntry["method"], string> = {
	cash: "Dinheiro",
	credit_card: "Cartão de Crédito",
	debit_card: "Cartão de Débito",
	pix: "PIX",
};

/** Ids of the payments that already have a reversal. */
export function reversedPaymentIds(
	entries: readonly LedgerEntry[],
): Set<number> {
	const ids = new Set<number>();
	for (const entry of entries) {
		if (entry.kind === "reversal" && entry.reversal_of_id !== null) {
			ids.add(entry.reversal_of_id);
		}
	}
	return ids;
}

/** Only payments that were not reversed yet can be reversed (never a reversal). */
export function canReverse(
	entry: LedgerEntry,
	reversed: ReadonlySet<number>,
): boolean {
	return entry.kind === "payment" && !reversed.has(entry.id);
}

/** Minimum length the backend accepts for a reversal reason. */
export const MIN_REVERSAL_REASON = 3;
