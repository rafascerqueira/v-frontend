"use client";

import { Box, ShoppingCart, Users } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";

export function UsageCard() {
	const { subscription, isFree } = useSubscription();

	if (!subscription) return null;

	const usageItems = [
		{
			label: "Produtos",
			icon: Box,
			...subscription.usage.products,
			color: "indigo",
		},
		{
			label: "Vendas/mês",
			icon: ShoppingCart,
			...subscription.usage.orders,
			color: "emerald",
		},
		{
			label: "Clientes",
			icon: Users,
			...subscription.usage.customers,
			color: "purple",
		},
	];

	return (
		<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
			<div className="flex items-center justify-between mb-4">
				<h3 className="font-semibold text-gray-900 dark:text-white">
					Uso do Plano
				</h3>
				<span
					className={`px-2 py-1 text-xs font-medium rounded-full ${
						isFree
							? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
							: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
					}`}
				>
					{subscription.plan === "free"
						? "Gratuito"
						: subscription.plan === "pro"
							? "Profissional"
							: "Empresarial"}
				</span>
			</div>

			<div className="space-y-4">
				{usageItems.map((item) => {
					const isUnlimited = item.limit === -1;
					const isNearLimit = item.percentage >= 80;
					const isAtLimit = item.percentage >= 100;

					return (
						<div key={item.label}>
							<div className="flex items-center justify-between text-sm mb-1">
								<div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
									<item.icon className="w-4 h-4" />
									{item.label}
								</div>
								<span className="text-gray-900 dark:text-white font-medium">
									{item.current}
									{isUnlimited ? "" : ` / ${item.limit}`}
								</span>
							</div>
							{!isUnlimited && (
								<div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
									<div
										className={`h-full rounded-full transition-all ${
											isAtLimit
												? "bg-red-500"
												: isNearLimit
													? "bg-amber-500"
													: `bg-${item.color}-500`
										}`}
										style={{ width: `${Math.min(100, item.percentage)}%` }}
									/>
								</div>
							)}
							{isUnlimited && (
								<p className="text-xs text-gray-500 dark:text-gray-400">
									Ilimitado
								</p>
							)}
						</div>
					);
				})}
			</div>

			{isFree && (
				<div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
					<a
						href="/plans"
						className="block text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
					>
						Aumentar limites →
					</a>
				</div>
			)}
		</div>
	);
}
