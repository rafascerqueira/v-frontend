import { afterEach, describe, expect, it, vi } from "vitest";
import { apiPublic, catalogApi } from "./api-public";

describe("catalogApi.trackOrder", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("calls the store-scoped tracking route", async () => {
		const get = vi
			.spyOn(apiPublic, "get")
			.mockResolvedValue({ data: {} } as never);

		await catalogApi.trackOrder("minha-loja", "PED-ABC123");

		expect(get).toHaveBeenCalledWith(
			"/catalog/loja/minha-loja/orders/PED-ABC123/track",
		);
	});

	it("keeps each URL value inside a single path segment", async () => {
		const get = vi
			.spyOn(apiPublic, "get")
			.mockResolvedValue({ data: {} } as never);

		await catalogApi.trackOrder("minha-loja", "../../auth/me");

		expect(get).toHaveBeenCalledWith(
			"/catalog/loja/minha-loja/orders/..%2F..%2Fauth%2Fme/track",
		);
	});
});

describe("catalogApi.createOrder", () => {
	const order = {
		customer: { name: "Maria", phone: "11988887777" },
		items: [{ product_id: 1, quantity: 1 }],
	};

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("sends the Idempotency-Key header when given one", async () => {
		const post = vi
			.spyOn(apiPublic, "post")
			.mockResolvedValue({ data: {} } as never);

		await catalogApi.createOrder("minha-loja", order, "key-1");

		expect(post).toHaveBeenCalledWith(
			"/catalog/loja/minha-loja/orders",
			order,
			{
				headers: { "Idempotency-Key": "key-1" },
			},
		);
	});

	it("sends no extra config without a key", async () => {
		const post = vi
			.spyOn(apiPublic, "post")
			.mockResolvedValue({ data: {} } as never);

		await catalogApi.createOrder("minha-loja", order);

		expect(post).toHaveBeenCalledWith(
			"/catalog/loja/minha-loja/orders",
			order,
			undefined,
		);
	});
});
