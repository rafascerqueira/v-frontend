"use client";

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

export type AccountRole = "seller" | "admin";
export type PlanType = "free" | "pro" | "enterprise";

interface User {
	id: string;
	email: string;
	name?: string;
	role: AccountRole;
	planType: PlanType;
	phone?: string;
	address?: string;
	avatar?: string;
	two_factor_enabled?: boolean;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	isAdmin: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (name: string, email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	const isAuthenticated = !!user;
	const isAdmin = user?.role === "admin";

	const fetchUser = useCallback(async () => {
		try {
			const { data } = await api.get("/auth/me");
			setUser(data);
		} catch {
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	const login = useCallback(
		async (email: string, password: string) => {
			await api.post("/auth/login", { email, password });
			const { data: userData } = await api.get("/auth/me");
			setUser(userData);
			setIsLoading(false);

			if (userData.role === "admin") {
				router.push("/admin");
			} else {
				router.push("/dashboard");
			}
		},
		[router],
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

		setUser(null);
		router.push("/login");
	}, [router]);

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				isAuthenticated,
				isAdmin,
				login,
				register,
				logout,
				refreshUser: fetchUser,
			}}
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
