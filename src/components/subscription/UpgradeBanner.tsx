"use client";

import { motion } from "framer-motion";
import { Crown, Sparkles, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface UpgradeBannerProps {
	type?: "products" | "orders" | "customers";
	variant?: "inline" | "modal" | "toast";
}

export function UpgradeBanner({
	type,
	variant = "inline",
}: UpgradeBannerProps) {
	const { subscription, isFree } = useSubscription();
	const [dismissed, setDismissed] = useState(false);

	if (!isFree || dismissed || !subscription) return null;

	const usage = type ? subscription.usage[type] : null;
	const isNearLimit = usage ? usage.percentage >= 80 : false;
	const isAtLimit = usage ? usage.percentage >= 100 : false;

	const messages = {
		products: {
			nearLimit: `Você está usando ${usage?.percentage}% do limite de produtos`,
			atLimit: "Você atingiu o limite de produtos do plano gratuito",
			upgrade: "Desbloqueie mais produtos com o plano Pro",
		},
		orders: {
			nearLimit: `Você está usando ${usage?.percentage}% do limite de vendas este mês`,
			atLimit: "Você atingiu o limite de vendas do plano gratuito",
			upgrade: "Continue vendendo sem limites com o plano Pro",
		},
		customers: {
			nearLimit: `Você está usando ${usage?.percentage}% do limite de clientes`,
			atLimit: "Você atingiu o limite de clientes do plano gratuito",
			upgrade: "Cadastre mais clientes com o plano Pro",
		},
	};

	const message = type
		? isAtLimit
			? messages[type].atLimit
			: isNearLimit
				? messages[type].nearLimit
				: messages[type].upgrade
		: "Desbloqueie recursos avançados com o Vendinhas Pro";

	if (variant === "inline" && !isNearLimit && !isAtLimit) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			className={`relative overflow-hidden rounded-xl ${
				isAtLimit
					? "bg-gradient-to-r from-red-600 to-orange-600"
					: isNearLimit
						? "bg-gradient-to-r from-amber-500 to-orange-500"
						: "bg-gradient-to-r from-indigo-600 to-purple-600"
			} p-4 text-white`}
		>
			<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

			<div className="relative flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-white/20 rounded-lg">
						{isAtLimit ? (
							<TrendingUp className="w-5 h-5" />
						) : (
							<Crown className="w-5 h-5" />
						)}
					</div>
					<div>
						<p className="font-medium">{message}</p>
						{type && (
							<p className="text-sm text-white/80">
								{usage?.current} de {usage?.limit}{" "}
								{type === "products"
									? "produtos"
									: type === "orders"
										? "vendas"
										: "clientes"}
							</p>
						)}
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Link
						href="/plans"
						className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 font-medium rounded-lg hover:bg-white/90 transition-colors"
					>
						<Sparkles className="w-4 h-4" />
						Fazer Upgrade
					</Link>
					{variant === "inline" && (
						<button
							type="button"
							onClick={() => setDismissed(true)}
							className="p-2 hover:bg-white/20 rounded-lg transition-colors"
						>
							<X className="w-4 h-4" />
						</button>
					)}
				</div>
			</div>
		</motion.div>
	);
}
