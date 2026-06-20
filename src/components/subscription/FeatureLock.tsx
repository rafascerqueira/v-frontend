"use client";

import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	type SubscriptionInfo,
	useSubscription,
} from "@/contexts/SubscriptionContext";

type Feature = keyof SubscriptionInfo["features"];

const FEATURE_COPY: Partial<
	Record<Feature, { title: string; description: string }>
> = {
	reports: {
		title: "Relatórios é um recurso Pro",
		description:
			"Acompanhe faturamento, ticket médio e os produtos mais vendidos. Faça upgrade para o plano Pro para desbloquear.",
	},
	exportData: {
		title: "Exportação é um recurso Pro",
		description:
			"Exporte pedidos, produtos e clientes em Excel ou PDF. Disponível no plano Pro.",
	},
	customBranding: {
		title: "Personalização da loja é um recurso Empresarial",
		description:
			"Use logo e banner próprios na sua loja. Disponível no plano Empresarial.",
	},
};

interface FeatureLockProps {
	feature: Feature;
	children: ReactNode;
}

/**
 * Renders `children` only when the seller's effective plan includes `feature`
 * (mirrors the backend FeatureGuard). Otherwise shows a locked state with an
 * upgrade CTA. The backend still enforces the gate — this is the UX layer.
 */
export function FeatureLock({ feature, children }: FeatureLockProps) {
	const { hasFeature, loading } = useSubscription();

	// Avoid flashing the lock before the subscription has loaded.
	if (loading) return <>{children}</>;
	if (hasFeature(feature)) return <>{children}</>;

	const copy = FEATURE_COPY[feature] ?? {
		title: "Recurso Pro",
		description: "Faça upgrade para acessar este recurso.",
	};

	return (
		<div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface px-6 py-16 text-center">
			<div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
				<Lock className="h-6 w-6 text-muted-foreground" />
			</div>
			<div className="space-y-1">
				<h2 className="text-lg font-semibold text-foreground">{copy.title}</h2>
				<p className="mx-auto max-w-md text-sm text-muted-foreground">
					{copy.description}
				</p>
			</div>
			<Link href="/plans">
				<Button>
					<Sparkles className="h-4 w-4" />
					Fazer upgrade
				</Button>
			</Link>
		</div>
	);
}
