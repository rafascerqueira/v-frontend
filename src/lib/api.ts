import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
	baseURL: API_URL,
	withCredentials: true,
	// Double-submit CSRF: Axios reads this cookie and echoes it in the header on
	// every request, so state-changing calls clear the backend CsrfGuard.
	// `withXSRFToken` is REQUIRED — in Axios 1.x the header is otherwise only sent
	// for same-origin requests, and prod is cross-origin (vendinhas.app ->
	// api.vendinhas.app). Without it every cookie-auth mutation 403s. Safe because
	// this instance only ever talks to our own API (baseURL).
	withXSRFToken: true,
	xsrfCookieName: "csrf_token",
	xsrfHeaderName: "X-CSRF-Token",
	headers: {
		"Content-Type": "application/json",
	},
});

const MAX_429_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 500;

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function readCookie(name: string): string | null {
	if (typeof document === "undefined") return null;
	const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
	return match ? decodeURIComponent(match[1]) : null;
}

const SAFE_METHODS = new Set(["get", "head", "options"]);

// Inject X-CSRF-Token ourselves on every state-changing request instead of
// trusting Axios's automatic withXSRFToken read alone. The automatic read can
// race a just-written Set-Cookie (login/refresh rotate csrf_token), leaving the
// header empty/stale -> backend CsrfGuard 403. Reading document.cookie at send
// time, in the request interceptor, closes that window. (withXSRFToken stays on
// as a same-origin fallback; this header set takes precedence.)
api.interceptors.request.use((config) => {
	const method = (config.method ?? "get").toLowerCase();
	if (!SAFE_METHODS.has(method)) {
		const csrf = readCookie("csrf_token");
		if (csrf) {
			config.headers = config.headers ?? {};
			config.headers["X-CSRF-Token"] = csrf;
		}
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// Retry on 429 (Too Many Requests) with exponential backoff
		if (error.response?.status === 429) {
			const retryCount = originalRequest._retryCount ?? 0;
			if (retryCount < MAX_429_RETRIES) {
				originalRequest._retryCount = retryCount + 1;
				const backoff = BASE_RETRY_DELAY_MS * 2 ** retryCount;
				await delay(backoff);
				return api(originalRequest);
			}
		}

		// CSRF 403 recovery. A state-changing request can still hit the backend
		// CsrfGuard with a 403 if the csrf_token cookie wasn't readable when the
		// request was built (e.g. it landed in the same tick as the login/refresh
		// Set-Cookie). Re-read the cookie now that it has settled and retry once.
		// The request interceptor would re-inject it anyway, but we set it
		// explicitly here so a stale header on originalRequest is overwritten.
		if (
			error.response?.status === 403 &&
			!originalRequest._csrfRetry &&
			error.response?.data?.message?.toLowerCase?.().includes("csrf")
		) {
			originalRequest._csrfRetry = true;
			const csrf = readCookie("csrf_token");
			if (csrf) {
				originalRequest.headers = originalRequest.headers ?? {};
				originalRequest.headers["X-CSRF-Token"] = csrf;
				return api(originalRequest);
			}
		}

		// Don't retry for auth/me (initial auth check) or if already retried
		const isAuthCheck = originalRequest?.url?.includes("/auth/me");
		const isAuthEndpoint = originalRequest?.url?.includes("/auth/");

		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!isAuthCheck
		) {
			originalRequest._retry = true;

			try {
				await api.post("/auth/refresh");
				// The refresh rotated the csrf_token cookie via Set-Cookie. Re-read it
				// and set the header explicitly on the retry — axios's automatic
				// withXSRFToken read can race the cookie write, leaving the header
				// stale/empty and tripping the backend CsrfGuard with a 403.
				const csrf = readCookie("csrf_token");
				if (csrf) {
					originalRequest.headers = originalRequest.headers ?? {};
					originalRequest.headers["X-CSRF-Token"] = csrf;
				}
				return api(originalRequest);
			} catch {
				// Only redirect if not already on login page and not an auth endpoint
				if (typeof window !== "undefined" && !isAuthEndpoint) {
					const isLoginPage = window.location.pathname === "/login";
					if (!isLoginPage) {
						window.location.href = "/login";
					}
				}
			}
		}

		return Promise.reject(error);
	},
);

// Fetch every page of a list endpoint so dropdowns show ALL records, not just
// the API's default first page. Works whether the endpoint returns a plain
// array or a paginated { data, meta: { totalPages } } payload.
export async function fetchAllRecords<T>(endpoint: string): Promise<T[]> {
	const limit = 100;
	let page = 1;
	const all: T[] = [];

	while (true) {
		const { data: response } = await api.get(endpoint, {
			params: { page, limit },
		});

		if (Array.isArray(response)) {
			all.push(...(response as T[]));
			break;
		}

		const items: T[] = response?.data ?? [];
		all.push(...items);

		// Paginated endpoints report totalPages under `meta` — the old bare
		// `response.totalPages` read was always undefined, so the loop silently
		// stopped after page 1 (capping callers at 100 records).
		const totalPages = response?.meta?.totalPages ?? response?.totalPages ?? 1;
		if (page >= totalPages || items.length < limit) break;
		page += 1;
	}

	return all;
}
