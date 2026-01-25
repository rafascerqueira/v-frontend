"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { api } from "@/lib/api";

interface User {
	id: string;
	email: string;
	name?: string;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (name: string, email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	const isAuthenticated = !!user;

	const fetchUser = useCallback(async () => {
		try {
			const { data } = await api.get("/auth/me");
			setUser(data);
		} catch {
			Cookies.remove("access_token");
			Cookies.remove("refresh_token");
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		const token = Cookies.get("access_token");
		if (token) {
			fetchUser();
		} else {
			setIsLoading(false);
		}
	}, [fetchUser]);

	const login = useCallback(
		async (email: string, password: string) => {
			const { data } = await api.post("/auth/login", { email, password });

			Cookies.set("access_token", data.accessToken, { expires: 1 });
			Cookies.set("refresh_token", data.refreshToken, { expires: 7 });

			await fetchUser();
			router.push("/dashboard");
		},
		[router, fetchUser],
	);

	const register = useCallback(
		async (name: string, email: string, password: string) => {
			await api.post("/auth/register", { name, email, password });
			router.push("/login?registered=true");
		},
		[router],
	);

	const logout = useCallback(async () => {
		try {
			await api.post("/auth/logout");
		} catch {
			// Continue with logout even if API fails
		}

		Cookies.remove("access_token");
		Cookies.remove("refresh_token");
		setUser(null);
		router.push("/login");
	}, [router]);

	return (
		<AuthContext.Provider
			value={{ user, isLoading, isAuthenticated, login, register, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
