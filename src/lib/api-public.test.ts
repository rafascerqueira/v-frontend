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
