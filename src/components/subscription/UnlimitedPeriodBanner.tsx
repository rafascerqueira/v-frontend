"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";

function formatDate(iso: string | null) {
	if (!iso) return null;
	return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
		new Date(iso),
	);
}

export function UnlimitedPeriodBanner() {
	const { subscription, isFree } = useSubscription();
	const window = subscription?.activeWindow;

	if (!isFree || !window || window.type !== "unlimited_period") return null;

	const endLabel = formatDate(window.endDate);

	return (
		<motion.div
			initial={{ opacity: 0, y: -8 }}
			animate={{ opacity: 1, y: 0 }}
			className="mb-4 rounded-xl border border-secondary-200 dark:border-secondary-900/50 bg-gradient-to-r from-secondary-50 to-primary-50 dark:from-secondary-900/20 dark:to-primary-900/20 p-4 flex items-start gap-3"
		>
			<div className="w-9 h-9 rounded-lg bg-secondary-100 dark:bg-secondary-900/40 flex items-center justify-center shrink-0">
				<Sparkles className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
			</div>
			<div className="flex-1">
				<p className="font-medium text-gray-900 dark:text-white">
					Período ilimitado ativo
				</p>
				<p className="text-sm text-gray-600 dark:text-gray-400">
					Você está com acesso completo aos recursos do plano Profissional
					{endLabel ? <> até {endLabel}</> : null}.
				</p>
			</div>
		</motion.div>
	);
}
