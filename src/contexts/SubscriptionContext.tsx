"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "./auth-context";

export type PlanType = "free" | "pro" | "enterprise";

export interface UsageInfo {
	current: number;
	limit: number;
	percentage: number;
}

export interface SubscriptionInfo {
	plan: PlanType;
	subscription: {
		id: number;
		status: string;
		current_period_end: string;
		cancel_at_period_end: boolean;
	} | null;
	usage: {
		products: UsageInfo;
		orders: UsageInfo;
		customers: UsageInfo;
	};
	features: {
		reports: boolean;
		exportData: boolean;
		multipleImages: boolean;
		prioritySupport: boolean;
		customBranding: boolean;
		apiAccess: boolean;
	};
	periodStart: string;
	periodEnd: string;
}

export interface PlanInfo {
	id: string;
	name: string;
	price: number;
	limits: {
		maxProducts: number;
		maxOrdersPerMonth: number;
		maxCustomers: number;
	};
	features: Record<string, boolean>;
}

interface SubscriptionContextType {
	subscription: SubscriptionInfo | null;
	plans: PlanInfo[];
	loading: boolean;
	refreshSubscription: () => Promise<void>;
	checkLimit: (type: "products" | "orders" | "customers") => {
		allowed: boolean;
		remaining: number;
		percentage: number;
	};
	hasFeature: (feature: keyof SubscriptionInfo["features"]) => boolean;
	isPro: boolean;
	isEnterprise: boolean;
	isFree: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
	undefined,
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
		null,
	);
	const [plans, setPlans] = useState<PlanInfo[]>([]);
	const [loading, setLoading] = useState(true);

	const refreshSubscription = useCallback(async () => {
		if (!isAuthenticated) {
			setSubscription(null);
			setPlans([]);
			setLoading(false);
			return;
		}

		try {
			const [subRes, plansRes] = await Promise.all([
				api.get("/subscriptions/info"),
				api.get("/subscriptions/plans"),
			]);
			setSubscription(subRes.data);
			setPlans(plansRes.data.plans);
		} catch (error) {
			console.error("Failed to fetch subscription info:", error);
			setSubscription(null);
		} finally {
			setLoading(false);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		if (!authLoading) {
			refreshSubscription();
		}
	}, [refreshSubscription, authLoading]);

	const checkLimit = useCallback(
		(type: "products" | "orders" | "customers") => {
			if (!subscription) {
				return { allowed: true, remaining: 0, percentage: 0 };
			}

			const usage = subscription.usage[type];
			const limit = usage.limit;

			// -1 means unlimited
			if (limit === -1) {
				return { allowed: true, remaining: -1, percentage: 0 };
			}

			const remaining = Math.max(0, limit - usage.current);
			const allowed = usage.current < limit;

			// Show warning toast when approaching limit
			if (usage.percentage >= 80 && usage.percentage < 100) {
				const typeNames = {
					products: "produtos",
					orders: "vendas",
					customers: "clientes",
				};
				toast(
					`Você está usando ${usage.percentage}% do limite de ${typeNames[type]}`,
					{ icon: "⚠️" },
				);
			}

			return { allowed, remaining, percentage: usage.percentage };
		},
		[subscription],
	);

	const hasFeature = useCallback(
		(feature: keyof SubscriptionInfo["features"]) => {
			return subscription?.features[feature] ?? false;
		},
		[subscription],
	);

	const isPro = subscription?.plan === "pro";
	const isEnterprise = subscription?.plan === "enterprise";
	const isFree = subscription?.plan === "free";

	return (
		<SubscriptionContext.Provider
			value={{
				subscription,
				plans,
				loading,
				refreshSubscription,
				checkLimit,
				hasFeature,
				isPro,
				isEnterprise,
				isFree,
			}}
		>
			{children}
		</SubscriptionContext.Provider>
	);
}

export function useSubscription() {
	const context = useContext(SubscriptionContext);
	if (context === undefined) {
		throw new Error(
			"useSubscription must be used within a SubscriptionProvider",
		);
	}
	return context;
}
