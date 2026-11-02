import { describe, expect, it } from "vitest";
import { apiErrorCode, apiErrorMessage } from "./api-error";
import { orderTrackingHref } from "./order-tracking";

/** Placeholder in the tracking-token format (22 chars). Zero entropy on purpose: secret scanners. */
const TRACKING_TOKEN = "x".repeat(22);

const axiosError = (data: unknown) => ({
	message: "Request failed with status code 409",
	response: { status: 409, data },
});

describe("apiErrorMessage", () => {
	it("returns the backend's pt-BR message instead of axios' English text", () => {
		const error = axiosError({
			message: "Este pedido tem pagamento registrado e não pode ser excluído.",
			code: "HAS_PAYMENTS",
		});

		expect(apiErrorMessage(error, "Erro ao excluir pedido")).toBe(
			"Este pedido tem pagamento registrado e não pode ser excluído.",
		);
	});

	it("takes the first message of a validation list", () => {
		expect(
			apiErrorMessage(
				axiosError({ message: ["Campo inválido", "Outro"] }),
				"x",
			),
		).toBe("Campo inválido");
	});

	it.each([
		["a network error", new Error("Network Error")],
		["no message", axiosError({})],
		["a blank message", axiosError({ message: "  " })],
		["a non-object", "boom"],
		["null", null],
	])("falls back on %s", (_case, error) => {
		expect(apiErrorMessage(error, "Erro ao criar pedido")).toBe(
			"Erro ao criar pedido",
		);
	});
});

describe("apiErrorCode", () => {
	it("reads the machine-readable code", () => {
		expect(apiErrorCode(axiosError({ code: "IDEMPOTENCY_KEY_MISMATCH" }))).toBe(
			"IDEMPOTENCY_KEY_MISMATCH",
		);
	});

	it("is undefined without one", () => {
		expect(apiErrorCode(axiosError({ message: "x" }))).toBeUndefined();
		expect(apiErrorCode(new Error("x"))).toBeUndefined();
	});
});

describe("orderTrackingHref", () => {
	it("links by the unguessable tracking token", () => {
		expect(
			orderTrackingHref("minha-loja", {
				tracking_token: TRACKING_TOKEN,
				order_number: "PED-000123",
			}),
		).toBe(`/loja/minha-loja/pedido/${TRACKING_TOKEN}`);
	});

	it("falls back to the order number when an older backend sends no token", () => {
		expect(
			orderTrackingHref("minha-loja", { order_number: "PED-MHZ3K2AB7Q" }),
		).toBe("/loja/minha-loja/pedido/PED-MHZ3K2AB7Q");
	});
});
