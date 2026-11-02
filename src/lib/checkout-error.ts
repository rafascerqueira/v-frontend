/**
 * Maps a failed `POST /subscriptions/checkout` into something the plans page can
 * act on. The backend answers a refused checkout with
 * `409 { message, code: 'SUBSCRIPTION_EXISTS' | 'CHECKOUT_IN_PROGRESS' }`:
 *
 * - `SUBSCRIPTION_EXISTS`: the account already has a live subscription (active,
 *   past_due/unpaid or paused). The way forward is the Stripe Billing Portal.
 * - `CHECKOUT_IN_PROGRESS`: another checkout for the same account is being started
 *   right now (double click, two tabs). The seller only has to wait.
 *
 * Pure and defensive on purpose: `error` is whatever axios (or anything else)
 * threw, so it never assumes a shape and never throws.
 */

export type CheckoutErrorCode =
	| "SUBSCRIPTION_EXISTS"
	| "CHECKOUT_IN_PROGRESS"
	| "UNKNOWN";

export interface CheckoutError {
	code: CheckoutErrorCode;
	message: string;
}

/** pt-BR copy used when the backend sends no usable message. */
export const CHECKOUT_ERROR_FALLBACK_MESSAGES: Record<
	CheckoutErrorCode,
	string
> = {
	SUBSCRIPTION_EXISTS:
		'Você já tem uma assinatura. Use "Gerenciar assinatura" para trocar de plano ou atualizar o pagamento.',
	CHECKOUT_IN_PROGRESS:
		"Já existe um pagamento sendo iniciado. Aguarde alguns segundos.",
	UNKNOWN: "Erro ao iniciar pagamento. Tente novamente.",
};

const KNOWN_CONFLICT_CODES = new Set<CheckoutErrorCode>([
	"SUBSCRIPTION_EXISTS",
	"CHECKOUT_IN_PROGRESS",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isKnownConflictCode(
	value: unknown,
): value is Exclude<CheckoutErrorCode, "UNKNOWN"> {
	return (
		typeof value === "string" &&
		KNOWN_CONFLICT_CODES.has(value as CheckoutErrorCode)
	);
}

function unknownError(): CheckoutError {
	return {
		code: "UNKNOWN",
		message: CHECKOUT_ERROR_FALLBACK_MESSAGES.UNKNOWN,
	};
}

export function getCheckoutError(error: unknown): CheckoutError {
	try {
		const response = isRecord(error) ? error.response : undefined;
		if (!isRecord(response) || response.status !== 409) return unknownError();

		const data = isRecord(response.data) ? response.data : {};
		const backendMessage =
			typeof data.message === "string" && data.message.trim() !== ""
				? data.message
				: undefined;

		if (isKnownConflictCode(data.code)) {
			return {
				code: data.code,
				message: backendMessage ?? CHECKOUT_ERROR_FALLBACK_MESSAGES[data.code],
			};
		}

		// Backward compatibility: the backend before `code` existed answered a
		// refused checkout with a bare 409 + message, which always meant
		// "you already have a subscription".
		if (backendMessage) {
			return { code: "SUBSCRIPTION_EXISTS", message: backendMessage };
		}

		return unknownError();
	} catch {
		// A hostile shape (e.g. a throwing getter) still degrades to the generic copy.
		return unknownError();
	}
}
