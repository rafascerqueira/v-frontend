import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export const api = axios.create({
	baseURL: API_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use((config) => {
	const token = Cookies.get("access_token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const refreshToken = Cookies.get("refresh_token");
				if (refreshToken) {
					const { data } = await api.post("/auth/refresh", { refreshToken });
					Cookies.set("access_token", data.accessToken);
					Cookies.set("refresh_token", data.refreshToken);
					originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
					return api(originalRequest);
				}
			} catch {
				Cookies.remove("access_token");
				Cookies.remove("refresh_token");
				window.location.href = "/login";
			}
		}

		return Promise.reject(error);
	},
);
