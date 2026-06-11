"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "./auth-context";

export type PlanType = "free" | "pro" | "enterprise";

export interface UsageInfo {
	current: number;
	limit: number;
	percentage: number;
}

export interface ActiveWindow {
	type: "unlimited_period";
	startDate: string | null;
	endDate: string | null;
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
	activeWindow: ActiveWindow | null;
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
	isProEffective: boolean;
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

			// NOTE: keep this a pure getter — it may be called during render, so
			// side effects (e.g. toasts) here fire once per render and are unsafe.
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

	// Memoized so consumers only re-render when subscription data actually
	// changes — this provider wraps the whole app and re-runs whenever the auth
	// context updates, and an inline value object would re-render every
	// useSubscription() consumer on each of those passes.
	const value = useMemo(() => {
		const isPro = subscription?.plan === "pro";
		const isEnterprise = subscription?.plan === "enterprise";
		const isFree = subscription?.plan === "free";
		const isProEffective =
			isPro ||
			isEnterprise ||
			(isFree && subscription?.activeWindow?.type === "unlimited_period");

		return {
			subscription,
			plans,
			loading,
			refreshSubscription,
			checkLimit,
			hasFeature,
			isPro,
			isEnterprise,
			isFree,
			isProEffective,
		};
	}, [
		subscription,
		plans,
		loading,
		refreshSubscription,
		checkLimit,
		hasFeature,
	]);

	return (
		<SubscriptionContext.Provider value={value}>
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
