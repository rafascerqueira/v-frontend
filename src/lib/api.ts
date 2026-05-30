import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
	baseURL: API_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

const MAX_429_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 500;

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

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
// array or a paginated { data, totalPages } payload.
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

		const totalPages = response?.totalPages ?? 1;
		if (page >= totalPages || items.length < limit) break;
		page += 1;
	}

	return all;
}
