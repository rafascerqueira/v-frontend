import { describe, expect, it } from "vitest";
import {
	createIdempotencyKeyTracker,
	IDEMPOTENCY_HEADER,
	newIdempotencyKey,
	withIdempotencyKey,
} from "./idempotency";

describe("createIdempotencyKeyTracker", () => {
	const order = {
		customer_id: "c1",
		items: [{ product_id: 1, quantity: 2, unit_price: 1500, discount: 0 }],
	};

	it("reuses the key while the same order is resubmitted (retry)", () => {
		const tracker = createIdempotencyKeyTracker();

		const first = tracker.keyFor(order);
		const retry = tracker.keyFor(structuredClone(order));

		expect(retry).toBe(first);
	});

	it("treats the same data in another key order as the same order", () => {
		const tracker = createIdempotencyKeyTracker();

		const first = tracker.keyFor({ a: 1, b: { c: 2, d: 3 } });

		expect(tracker.keyFor({ b: { d: 3, c: 2 }, a: 1 })).toBe(first);
	});

	it("issues a new key when the order was edited (so the server never answers 422)", () => {
		const tracker = createIdempotencyKeyTracker();

		const first = tracker.keyFor(order);
		const edited = tracker.keyFor({
			...order,
			items: [{ ...order.items[0], quantity: 3 }],
		});

		expect(edited).not.toBe(first);
	});

	it("issues a new key after reset (the next order is a new submission)", () => {
		const tracker = createIdempotencyKeyTracker();

		const first = tracker.keyFor(order);
		tracker.reset();

		expect(tracker.keyFor(order)).not.toBe(first);
	});
});

describe("newIdempotencyKey", () => {
	it("produces keys the backend accepts ([A-Za-z0-9_-], up to 64 chars)", () => {
		const key = newIdempotencyKey();

		expect(key).toMatch(/^[A-Za-z0-9_-]{1,64}$/);
		expect(newIdempotencyKey()).not.toBe(key);
	});

	it("falls back to getRandomValues outside a secure context", () => {
		const original = crypto.randomUUID;
		Object.defineProperty(crypto, "randomUUID", {
			value: undefined,
			configurable: true,
		});
		try {
			expect(newIdempotencyKey()).toMatch(/^[0-9a-f]{32}$/);
		} finally {
			Object.defineProperty(crypto, "randomUUID", {
				value: original,
				configurable: true,
			});
		}
	});
});

describe("withIdempotencyKey", () => {
	it("adds the header and keeps other config", () => {
		expect(
			withIdempotencyKey("k1", { timeout: 5000, headers: { "X-A": "1" } }),
		).toEqual({
			timeout: 5000,
			headers: { "X-A": "1", [IDEMPOTENCY_HEADER]: "k1" },
		});
	});
});
