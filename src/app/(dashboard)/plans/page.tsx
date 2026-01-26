"use client";

import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Star, X, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";

const PLAN_FEATURES = {
	free: {
		name: "Gratuito",
		description: "Para começar a vender",
		price: 0,
		icon: Zap,
		color: "gray",
		popular: false,
		highlights: [
			"Até 50 produtos",
			"30 vendas por mês",
			"100 clientes",
			"Suporte por email",
		],
		features: {
			"Cadastro de produtos": true,
			"Controle de estoque": true,
			"Gestão de clientes": true,
			"Pedidos e vendas": true,
			"Relatórios básicos": false,
			"Exportação de dados": false,
			"Múltiplas imagens por produto": false,
			"Suporte prioritário": false,
			"Marca personalizada": false,
			"Acesso à API": false,
		},
	},
	pro: {
		name: "Profissional",
		description: "Para vendedores em crescimento",
		price: 1490,
		originalPrice: 1990,
		promoLabel: "Early Adopter",
		icon: Star,
		color: "indigo",
		popular: true,
		highlights: [
			"Até 500 produtos",
			"500 vendas por mês",
			"1.000 clientes",
			"Relatórios avançados",
		],
		features: {
			"Cadastro de produtos": true,
			"Controle de estoque": true,
			"Gestão de clientes": true,
			"Pedidos e vendas": true,
			"Relatórios básicos": true,
			"Exportação de dados": true,
			"Múltiplas imagens por produto": true,
			"Suporte prioritário": false,
			"Marca personalizada": false,
			"Acesso à API": false,
		},
	},
	enterprise: {
		name: "Empresarial",
		description: "Para grandes operações",
		price: 0,
		comingSoon: true,
		icon: Crown,
		color: "purple",
		popular: false,
		highlights: [
			"Produtos ilimitados",
			"Vendas ilimitadas",
			"Clientes ilimitados",
			"Suporte 24/7",
		],
		features: {
			"Cadastro de produtos": true,
			"Controle de estoque": true,
			"Gestão de clientes": true,
			"Pedidos e vendas": true,
			"Relatórios básicos": true,
			"Exportação de dados": true,
			"Múltiplas imagens por produto": true,
			"Suporte prioritário": true,
			"Marca personalizada": true,
			"Acesso à API": true,
		},
	},
};

function formatPrice(cents: number) {
	if (cents === 0) return "Grátis";
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(cents / 100);
}

export default function PlansPage() {
	const { subscription, loading } = useSubscription();
	const currentPlan = subscription?.plan || "free";

	const handleSelectPlan = (planId: string) => {
		if (planId === currentPlan) {
			toast("Você já está neste plano", { icon: "ℹ️" });
			return;
		}

		if (planId === "free") {
			toast.error("Não é possível fazer downgrade para o plano gratuito");
			return;
		}

		// TODO: Integrate with payment provider
		toast.success("Redirecionando para o pagamento...");
		// router.push(`/checkout?plan=${planId}`)
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			{/* Header */}
			<div className="text-center mb-12">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
						Escolha o plano ideal para você
					</h1>
					<p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
						Comece gratuitamente e faça upgrade quando precisar de mais
						recursos. Todos os planos incluem acesso ao app completo.
					</p>
				</motion.div>
			</div>

			{/* Plans Grid */}
			<div className="grid md:grid-cols-3 gap-8 mb-12">
				{Object.entries(PLAN_FEATURES).map(([planId, plan], index) => {
					const isCurrentPlan = currentPlan === planId;
					const Icon = plan.icon;

					return (
						<motion.div
							key={planId}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
							className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden ${plan.popular
									? "ring-2 ring-indigo-600"
									: "border border-gray-200 dark:border-gray-700"
								}`}
						>
							{plan.popular && (
								<div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
									Mais popular
								</div>
							)}

							<div className="p-6">
								<div
									className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.color === "gray"
											? "bg-gray-100 dark:bg-gray-700"
											: plan.color === "indigo"
												? "bg-indigo-100 dark:bg-indigo-900/30"
												: "bg-purple-100 dark:bg-purple-900/30"
										}`}
								>
									<Icon
										className={`w-6 h-6 ${plan.color === "gray"
												? "text-gray-600 dark:text-gray-400"
												: plan.color === "indigo"
													? "text-indigo-600 dark:text-indigo-400"
													: "text-purple-600 dark:text-purple-400"
											}`}
									/>
								</div>

								<h3 className="text-xl font-bold text-gray-900 dark:text-white">
									{plan.name}
								</h3>
								<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
									{plan.description}
								</p>

								<div className="mt-4 mb-6">
									{(plan as any).comingSoon ? (
										<span className="text-xl font-bold text-purple-600 dark:text-purple-400">
											Em breve
										</span>
									) : (
										<>
											{(plan as any).originalPrice && (
												<div className="flex items-center gap-2 mb-1">
													<span className="text-sm line-through text-gray-400">
														{formatPrice((plan as any).originalPrice)}
													</span>
													<span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
														{(plan as any).promoLabel}
													</span>
												</div>
											)}
											<span className="text-3xl font-bold text-gray-900 dark:text-white">
												{formatPrice(plan.price)}
											</span>
											{plan.price > 0 && (
												<span className="text-gray-500 dark:text-gray-400">
													/mês
												</span>
											)}
										</>
									)}
								</div>

								<button
									type="button"
									onClick={() => handleSelectPlan(planId)}
									disabled={isCurrentPlan || (plan as any).comingSoon}
									className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${(plan as any).comingSoon
											? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 cursor-not-allowed"
											: isCurrentPlan
												? "bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
												: plan.popular
													? "bg-indigo-600 hover:bg-indigo-700 text-white"
													: "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
										}`}
								>
									{(plan as any).comingSoon
										? "Em desenvolvimento"
										: isCurrentPlan
											? "Plano atual"
											: "Selecionar plano"}
								</button>

								<ul className="mt-6 space-y-3">
									{plan.highlights.map((highlight) => (
										<li
											key={highlight}
											className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
										>
											<Sparkles className="w-4 h-4 text-indigo-500" />
											{highlight}
										</li>
									))}
								</ul>
							</div>
						</motion.div>
					);
				})}
			</div>

			{/* Feature Comparison */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden"
			>
				<div className="p-6 border-b border-gray-200 dark:border-gray-700">
					<h2 className="text-xl font-bold text-gray-900 dark:text-white">
						Comparativo de recursos
					</h2>
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
						Veja o que cada plano oferece
					</p>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="bg-gray-50 dark:bg-gray-700/50">
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
									Recurso
								</th>
								{Object.entries(PLAN_FEATURES).map(([planId, plan]) => (
									<th
										key={planId}
										className="text-center px-6 py-4 text-sm font-medium text-gray-900 dark:text-white"
									>
										{plan.name}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
							{Object.keys(PLAN_FEATURES.free.features).map((feature) => (
								<tr key={feature}>
									<td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
										{feature}
									</td>
									{Object.entries(PLAN_FEATURES).map(([planId, plan]) => (
										<td key={planId} className="text-center px-6 py-4">
											{plan.features[feature as keyof typeof plan.features] ? (
												<Check className="w-5 h-5 text-green-500 mx-auto" />
											) : (
												<X className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
											)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</motion.div>

			{/* FAQ */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
				className="mt-12 text-center"
			>
				<p className="text-gray-600 dark:text-gray-400">
					Dúvidas? Entre em contato conosco em{" "}
					<a
						href="mailto:suporte@vendinhas.com"
						className="text-indigo-600 dark:text-indigo-400 hover:underline"
					>
						suporte@vendinhas.com
					</a>
				</p>
			</motion.div>
		</div>
	);
}
