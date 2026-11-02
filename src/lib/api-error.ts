/**
 * Reads the backend's error envelope (`{ message, code? }`, forwarded by the
 * GlobalExceptionFilter) out of whatever axios threw. Defensive on purpose: it
 * never assumes a shape and never throws.
 */

function responseData(error: unknown): Record<string, unknown> | undefined {
	if (typeof error !== "object" || error === null) return undefined;
	const response = (error as { response?: { data?: unknown } }).response;
	const data = response?.data;
	return typeof data === "object" && data !== null
		? (data as Record<string, unknown>)
		: undefined;
}

/** Machine-readable reason (e.g. `HAS_PAYMENTS`), when the backend sent one. */
export function apiErrorCode(error: unknown): string | undefined {
	const code = responseData(error)?.code;
	return typeof code === "string" ? code : undefined;
}

/** The backend's pt-BR message, or `fallback` (never axios' English text). */
export function apiErrorMessage(error: unknown, fallback: string): string {
	const message = responseData(error)?.message;
	if (typeof message === "string" && message.trim()) return message;
	if (Array.isArray(message)) {
		const first = message.find((m): m is string => typeof m === "string");
		if (first) return first;
	}
	return fallback;
}

/** pt-BR copy for an Idempotency-Key reused with different data. */
export const IDEMPOTENCY_MISMATCH_MESSAGE =
	"Os dados do pedido mudaram desde a última tentativa. Revise e envie novamente.";
