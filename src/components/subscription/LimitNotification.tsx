"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Crown, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";

export function LimitNotification() {
	const { subscription, isFree } = useSubscription();
	const [notifications, setNotifications] = useState<
		Array<{ id: string; type: string; message: string; percentage: number }>
	>([]);

	useEffect(() => {
		if (!subscription || !isFree) return;

		const newNotifications: typeof notifications = [];

		const checkUsage = (
			type: "products" | "orders" | "customers",
			label: string,
		) => {
			const usage = subscription.usage[type];
			if (usage.percentage >= 100) {
				newNotifications.push({
					id: type,
					type: "limit",
					message: `Você atingiu o limite de ${label}`,
					percentage: 100,
				});
			} else if (usage.percentage >= 80) {
				newNotifications.push({
					id: type,
					type: "warning",
					message: `${usage.percentage}% do limite de ${label} utilizado`,
					percentage: usage.percentage,
				});
			}
		};

		checkUsage("products", "produtos");
		checkUsage("orders", "vendas do mês");
		checkUsage("customers", "clientes");

		setNotifications(newNotifications);
	}, [subscription, isFree]);

	const dismissNotification = (id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	if (notifications.length === 0) return null;

	return (
		<div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
			<AnimatePresence>
				{notifications.map((notification) => (
					<motion.div
						key={notification.id}
						initial={{ opacity: 0, x: 100, scale: 0.9 }}
						animate={{ opacity: 1, x: 0, scale: 1 }}
						exit={{ opacity: 0, x: 100, scale: 0.9 }}
						className={`relative overflow-hidden rounded-xl shadow-lg ${
							notification.type === "limit" ? "bg-red-600" : "bg-amber-500"
						} text-white p-4`}
					>
						<button
							type="button"
							onClick={() => dismissNotification(notification.id)}
							className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
						>
							<X className="w-4 h-4" />
						</button>

						<div className="flex items-start gap-3 pr-6">
							<div className="p-2 bg-white/20 rounded-lg shrink-0">
								{notification.type === "limit" ? (
									<AlertTriangle className="w-5 h-5" />
								) : (
									<Crown className="w-5 h-5" />
								)}
							</div>
							<div>
								<p className="font-medium">{notification.message}</p>
								<p className="text-sm text-white/80 mt-1">
									{notification.type === "limit"
										? "Faça upgrade para continuar"
										: "Considere fazer upgrade"}
								</p>
								<Link
									href="/plans"
									className="inline-block mt-2 text-sm font-medium bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
								>
									Ver planos →
								</Link>
							</div>
						</div>
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}
