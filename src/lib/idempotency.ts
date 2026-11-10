import type { AxiosRequestConfig } from "axios";

/**
 * Retry-safe order creation (backend Phase 1A).
 *
 * The backend replays the original order when it receives the same
 * `Idempotency-Key` with the same body, so a retry after a timeout or a double
 * click never creates a second order. Same key with a different body answers
 * 422 `IDEMPOTENCY_KEY_MISMATCH`.
 *
 * `createIdempotencyKeyTracker()` hands out one key per logical submission:
 * resubmitting the SAME payload (a retry) reuses the key; an edited payload gets
 * a new one (so editing after an error never trips the 422); `reset()` after a
 * success makes the next order a new submission.
 */
export const IDEMPOTENCY_HEADER = "Idempotency-Key";

export function newIdempotencyKey(): string {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}
	// crypto.randomUUID needs a secure context; getRandomValues does not.
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** JSON with object keys sorted, so equal payloads compare equal. */
function fingerprint(value: unknown): string {
	return JSON.stringify(value, (_key, member: unknown) =>
		member && typeof member === "object" && !Array.isArray(member)
			? Object.fromEntries(
					Object.entries(member as Record<string, unknown>).sort(([a], [b]) =>
						a < b ? -1 : a > b ? 1 : 0,
					),
				)
			: member,
	);
}

export interface IdempotencyKeyTracker {
	/** The key for this payload: reused while the payload is unchanged. */
	keyFor(payload: unknown): string;
	/** Forget the key (call after a successful submission). */
	reset(): void;
}

export function createIdempotencyKeyTracker(): IdempotencyKeyTracker {
	let current: { fingerprint: string; key: string } | null = null;
	return {
		keyFor(payload) {
			const print = fingerprint(payload);
			if (current?.fingerprint !== print) {
				current = { fingerprint: print, key: newIdempotencyKey() };
			}
			return current.key;
		},
		reset() {
			current = null;
		},
	};
}

/** Axios config carrying the Idempotency-Key header. */
export function withIdempotencyKey(
	key: string,
	config: AxiosRequestConfig = {},
): AxiosRequestConfig {
	return {
		...config,
		headers: { ...(config.headers ?? {}), [IDEMPOTENCY_HEADER]: key },
	};
}
