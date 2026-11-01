import { describe, expect, it } from "vitest";
import {
	CHECKOUT_ERROR_FALLBACK_MESSAGES,
	getCheckoutError,
} from "./checkout-error";

const GENERIC = "Erro ao iniciar pagamento. Tente novamente.";
const EXISTS_FALLBACK =
	'Você já tem uma assinatura. Use "Gerenciar assinatura" para trocar de plano ou atualizar o pagamento.';
const IN_PROGRESS_FALLBACK =
	"Já existe um pagamento sendo iniciado. Aguarde alguns segundos.";

/** Shape of what axios rejects with when the server answered. */
function httpError(status: unknown, data?: unknown) {
	return { isAxiosError: true, response: { status, data } };
}

describe("getCheckoutError", () => {
	it("pins the pt-BR fallback copy", () => {
		expect(CHECKOUT_ERROR_FALLBACK_MESSAGES).toEqual({
			SUBSCRIPTION_EXISTS: EXISTS_FALLBACK,
			CHECKOUT_IN_PROGRESS: IN_PROGRESS_FALLBACK,
			UNKNOWN: GENERIC,
		});
	});

	describe("409 SUBSCRIPTION_EXISTS", () => {
		it("uses the backend message", () => {
			const error = httpError(409, {
				statusCode: 409,
				message: "Mensagem do backend",
				error: "Conflict",
				code: "SUBSCRIPTION_EXISTS",
			});

			expect(getCheckoutError(error)).toEqual({
				code: "SUBSCRIPTION_EXISTS",
				message: "Mensagem do backend",
			});
		});

		it("falls back to the pt-BR copy when the message is missing", () => {
			const error = httpError(409, { code: "SUBSCRIPTION_EXISTS" });

			expect(getCheckoutError(error)).toEqual({
				code: "SUBSCRIPTION_EXISTS",
				message: EXISTS_FALLBACK,
			});
		});

		it("falls back to the pt-BR copy when the message is empty or blank", () => {
			for (const message of ["", "   "]) {
				const error = httpError(409, { code: "SUBSCRIPTION_EXISTS", message });

				expect(getCheckoutError(error)).toEqual({
					code: "SUBSCRIPTION_EXISTS",
					message: EXISTS_FALLBACK,
				});
			}
		});

		it("falls back to the pt-BR copy when the message is not a string", () => {
			const error = httpError(409, {
				code: "SUBSCRIPTION_EXISTS",
				message: ["validation", "array"],
			});

			expect(getCheckoutError(error).message).toBe(EXISTS_FALLBACK);
		});
	});

	describe("409 CHECKOUT_IN_PROGRESS", () => {
		it("uses the backend message", () => {
			const error = httpError(409, {
				statusCode: 409,
				message: "Aguarde, já estamos abrindo o pagamento.",
				error: "Conflict",
				code: "CHECKOUT_IN_PROGRESS",
			});

			expect(getCheckoutError(error)).toEqual({
				code: "CHECKOUT_IN_PROGRESS",
				message: "Aguarde, já estamos abrindo o pagamento.",
			});
		});

		it("falls back to the pt-BR copy when the message is missing or empty", () => {
			for (const data of [
				{ code: "CHECKOUT_IN_PROGRESS" },
				{ code: "CHECKOUT_IN_PROGRESS", message: "" },
			]) {
				expect(getCheckoutError(httpError(409, data))).toEqual({
					code: "CHECKOUT_IN_PROGRESS",
					message: IN_PROGRESS_FALLBACK,
				});
			}
		});
	});

	describe("409 without a known code (backend before `code` existed)", () => {
		it("maps a bare 409 with a message to SUBSCRIPTION_EXISTS", () => {
			const error = httpError(409, {
				statusCode: 409,
				message: "Você já tem uma assinatura.",
				error: "Conflict",
			});

			expect(getCheckoutError(error)).toEqual({
				code: "SUBSCRIPTION_EXISTS",
				message: "Você já tem uma assinatura.",
			});
		});

		it("maps a 409 with an unrecognised code but a message to SUBSCRIPTION_EXISTS", () => {
			const error = httpError(409, { code: "SOMETHING_NEW", message: "Oi" });

			expect(getCheckoutError(error)).toEqual({
				code: "SUBSCRIPTION_EXISTS",
				message: "Oi",
			});
		});

		it("is UNKNOWN when there is no usable message either", () => {
			for (const data of [undefined, null, {}, { message: "" }, "texto"]) {
				expect(getCheckoutError(httpError(409, data))).toEqual({
					code: "UNKNOWN",
					message: GENERIC,
				});
			}
		});
	});

	describe("anything else is UNKNOWN with the generic copy", () => {
		it("a 500, even carrying a known code and a message", () => {
			const error = httpError(500, {
				code: "SUBSCRIPTION_EXISTS",
				message: "Internal server error",
			});

			expect(getCheckoutError(error)).toEqual({
				code: "UNKNOWN",
				message: GENERIC,
			});
		});

		it("a network error with no response", () => {
			const error = Object.assign(new Error("Network Error"), {
				isAxiosError: true,
				code: "ERR_NETWORK",
				response: undefined,
			});

			expect(getCheckoutError(error)).toEqual({
				code: "UNKNOWN",
				message: GENERIC,
			});
		});

		it("a status that is not exactly the number 409", () => {
			expect(
				getCheckoutError(httpError("409", { code: "SUBSCRIPTION_EXISTS" }))
					.code,
			).toBe("UNKNOWN");
		});

		it("non-object errors", () => {
			for (const error of [
				undefined,
				null,
				"boom",
				42,
				true,
				Symbol("x"),
				() => {},
			]) {
				expect(getCheckoutError(error)).toEqual({
					code: "UNKNOWN",
					message: GENERIC,
				});
			}
		});

		it("odd shapes: a null or primitive response", () => {
			for (const response of [null, "409", 409]) {
				expect(getCheckoutError({ response }).code).toBe("UNKNOWN");
			}
		});

		it("never throws, even on a throwing getter", () => {
			const hostile = {
				get response(): never {
					throw new Error("nope");
				},
			};

			expect(() => getCheckoutError(hostile)).not.toThrow();
			expect(getCheckoutError(hostile)).toEqual({
				code: "UNKNOWN",
				message: GENERIC,
			});
		});
	});
});
