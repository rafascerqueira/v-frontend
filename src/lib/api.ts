import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
	baseURL: API_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

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
