"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
	AlertTriangle,
	CalendarClock,
	Check,
	CreditCard,
	Crown,
	Sparkles,
	Star,
	X,
	Zap,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { api } from "@/lib/api";
import { formatSubscriptionDate } from "@/lib/subscription-status";

interface PlanFeature {
	name: string;
	description: string;
	price: number;
	originalPrice?: number;
	promoLabel?: string;
	comingSoon?: boolean;
	icon: LucideIcon;
	color: string;
	popular: boolean;
	highlights: string[];
	features: Record<string, boolean>;
}

const PLAN_FEATURES: Record<string, PlanFeature> = {
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

function SubscriptionStatusBanner({
	status,
	cancelAtPeriodEnd,
	periodEnd,
	onManage,
	managing,
	disabled,
}: {
	status: string;
	cancelAtPeriodEnd: boolean;
	periodEnd: string;
	onManage: () => void;
	managing: boolean;
	disabled: boolean;
}) {
	const endLabel = formatSubscriptionDate(periodEnd);

	// Priority: a failed renewal is the most urgent, then a scheduled cancellation,
	// otherwise the normal "renews on" state.
	const variant =
		status === "past_due"
			? {
					tone: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
					icon: CreditCard,
					iconTone: "text-red-600 dark:text-red-400",
					title: "Pagamento pendente",
					message:
						"Não conseguimos renovar sua assinatura. Atualize seu cartão para manter o plano Pro ativo.",
					cta: "Atualizar pagamento",
				}
			: cancelAtPeriodEnd
				? {
						tone: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
						icon: AlertTriangle,
						iconTone: "text-amber-600 dark:text-amber-400",
						title: "Assinatura cancelada",
						message: endLabel
							? `Você mantém acesso ao plano Pro até ${endLabel}. Depois disso, sua conta volta ao plano Gratuito.`
							: "Você mantém acesso ao plano Pro até o fim do período atual.",
						cta: "Reativar assinatura",
					}
				: {
						tone: "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800",
						icon: CalendarClock,
						iconTone: "text-primary-600 dark:text-primary-400",
						title: "Plano Pro ativo",
						message: endLabel
							? `Sua assinatura renova automaticamente em ${endLabel}.`
							: "Sua assinatura está ativa.",
						cta: "Gerenciar assinatura",
					};

	const Icon = variant.icon;

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className={`mb-8 rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${variant.tone}`}
		>
			<div className="flex items-start gap-3 flex-1">
				<Icon className={`w-5 h-5 mt-0.5 shrink-0 ${variant.iconTone}`} />
				<div>
					<p className="font-semibold text-gray-900 dark:text-white">
						{variant.title}
					</p>
					<p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
						{variant.message}
					</p>
				</div>
			</div>
			<button
				type="button"
				onClick={onManage}
				disabled={disabled}
				className="shrink-0 py-2 px-4 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
			>
				{managing ? "Abrindo..." : variant.cta}
			</button>
		</motion.div>
	);
}

export default function PlansPage() {
	const { subscription, loading, plans, refreshSubscription } =
		useSubscription();
	const currentPlan = subscription?.plan || "free";
	const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
	const searchParams = useSearchParams();

	useEffect(() => {
		const checkout = searchParams.get("checkout");
		if (checkout === "canceled") {
			toast("Pagamento cancelado.", { icon: "ℹ️" });
			return;
		}
		if (checkout !== "success") return;

		// Stripe redirects back to success_url as soon as payment completes — which
		// can land *before* the webhook flips the plan to pro. Poll the subscription
		// until it activates instead of asserting success blindly.
		let cancelled = false;
		const toastId = toast.loading("Confirmando seu pagamento…");

		(async () => {
			for (let attempt = 0; attempt < 6 && !cancelled; attempt++) {
				try {
					const { data } = await api.get("/subscriptions/info");
					if (data?.plan && data.plan !== "free") {
						await refreshSubscription();
						if (!cancelled) {
							toast.success(
								"Assinatura ativada com sucesso! Bem-vindo ao plano Pro.",
								{ id: toastId },
							);
						}
						return;
					}
				} catch {
					// transient — keep polling
				}
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}
			if (!cancelled) {
				await refreshSubscription();
				toast(
					"Pagamento recebido! Estamos confirmando sua assinatura — pode levar alguns instantes.",
					{ id: toastId, icon: "⏳" },
				);
			}
		})();

		return () => {
			cancelled = true;
			toast.dismiss(toastId);
		};
	}, [searchParams, refreshSubscription]);

	const handleSelectPlan = async (planId: string) => {
		if (planId === currentPlan) {
			toast("Você já está neste plano", { icon: "ℹ️" });
			return;
		}
		if (planId === "free") {
			toast.error("Não é possível fazer downgrade para o plano gratuito");
			return;
		}

		setLoadingPlan(planId);
		try {
			const { data } = await api.post("/subscriptions/checkout", { planId });
			window.location.href = data.url;
		} catch {
			toast.error("Erro ao iniciar pagamento. Tente novamente.");
			setLoadingPlan(null);
		}
	};

	const handleManageSubscription = async () => {
		setLoadingPlan("portal");
		try {
			const { data } = await api.post("/subscriptions/portal");
			window.location.href = data.url;
		} catch {
			toast.error("Erro ao abrir portal de pagamentos.");
			setLoadingPlan(null);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
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

			{/* Current subscription status — surfaces "how much Pro time is left",
			    a scheduled cancellation, or a failed renewal, all read from the
			    subscription info the app already fetched. */}
			{subscription?.subscription && currentPlan !== "free" && (
				<SubscriptionStatusBanner
					status={subscription.subscription.status}
					cancelAtPeriodEnd={subscription.subscription.cancel_at_period_end}
					periodEnd={subscription.subscription.current_period_end}
					onManage={handleManageSubscription}
					managing={loadingPlan === "portal"}
					disabled={loadingPlan !== null}
				/>
			)}

			{/* Plans Grid */}
			<div className="grid md:grid-cols-3 gap-8 mb-12">
				{Object.entries(PLAN_FEATURES).map(([planId, plan], index) => {
					const isCurrentPlan = currentPlan === planId;
					const Icon = plan.icon;
					// Price comes from the backend (GET /subscriptions/plans) — the same
					// source Stripe charges from — so the displayed value can't drift from
					// what's actually billed. Static config is only a fallback.
					const price = plans.find((p) => p.id === planId)?.price ?? plan.price;

					return (
						<motion.div
							key={planId}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
							className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden ${
								plan.popular
									? "ring-2 ring-primary-600"
									: "border border-gray-200 dark:border-gray-700"
							}`}
						>
							{plan.popular && (
								<div className="absolute top-0 right-0 bg-primary-600 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
									Mais popular
								</div>
							)}

							<div className="p-6">
								<div
									className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
										plan.color === "gray"
											? "bg-gray-100 dark:bg-gray-700"
											: plan.color === "indigo"
												? "bg-primary-100 dark:bg-primary-900/30"
												: "bg-secondary-100 dark:bg-secondary-900/30"
									}`}
								>
									<Icon
										className={`w-6 h-6 ${
											plan.color === "gray"
												? "text-gray-600 dark:text-gray-400"
												: plan.color === "indigo"
													? "text-primary-600 dark:text-primary-400"
													: "text-secondary-600 dark:text-secondary-400"
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
									{plan.comingSoon ? (
										<span className="text-xl font-bold text-secondary-600 dark:text-secondary-400">
											Em breve
										</span>
									) : (
										<>
											{plan.originalPrice && (
												<div className="flex items-center gap-2 mb-1">
													<span className="text-sm line-through text-gray-400">
														{formatPrice(plan.originalPrice)}
													</span>
													<span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
														{plan.promoLabel}
													</span>
												</div>
											)}
											<span className="text-3xl font-bold text-gray-900 dark:text-white">
												{formatPrice(price)}
											</span>
											{price > 0 && (
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
									disabled={
										isCurrentPlan || plan.comingSoon || loadingPlan !== null
									}
									className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
										plan.comingSoon
											? "bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 cursor-not-allowed"
											: isCurrentPlan
												? "bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
												: plan.popular
													? "bg-primary-600 hover:bg-primary-700 text-white"
													: "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
									}`}
								>
									{loadingPlan === planId
										? "Redirecionando..."
										: plan.comingSoon
											? "Em desenvolvimento"
											: isCurrentPlan
												? "Plano atual"
												: "Selecionar plano"}
								</button>

								{isCurrentPlan && currentPlan !== "free" && (
									<button
										type="button"
										onClick={handleManageSubscription}
										disabled={loadingPlan !== null}
										className="w-full mt-2 py-2 px-4 rounded-xl text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors disabled:opacity-50"
									>
										{loadingPlan === "portal"
											? "Abrindo..."
											: "Gerenciar assinatura"}
									</button>
								)}

								<ul className="mt-6 space-y-3">
									{plan.highlights.map((highlight) => (
										<li
											key={highlight}
											className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
										>
											<Sparkles className="w-4 h-4 text-primary-500" />
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
							<tr className="bg-gray-50 dark:bg-gray-800/50">
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
						className="text-primary-600 dark:text-primary-400 hover:underline"
					>
						suporte@vendinhas.com
					</a>
				</p>
			</motion.div>
		</div>
	);
}
