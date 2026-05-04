"use client";

import { motion } from "framer-motion";
import {
	CheckCircle,
	Crown,
	Database,
	Gift,
	Save,
	Server,
	Settings,
	Shield,
	Sparkles,
	Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

interface SystemHealth {
	status: string;
	database: string;
	environment: string;
	timestamp: string;
}

interface PlanLimitSettings {
	free_plan_products_limit: number;
	free_plan_customers_limit: number;
	free_plan_sales_limit: number;
}

interface UnlimitedPeriod {
	startDate: string | null;
	endDate: string | null;
	isActive: boolean;
}

interface PromotionalPeriod {
	startDate: string | null;
	endDate: string | null;
	discountPercent: number;
	isActive: boolean;
}

interface PromotionsResponse {
	unlimitedPeriod: UnlimitedPeriod;
	promotionalPeriod: PromotionalPeriod;
}

interface PlanGrantQuotas {
	pro: number;
	enterprise: number;
}

interface PlanGrantStat {
	active: number;
	quota: number;
	exceeded: boolean;
}

interface PlanGrantStats {
	pro: PlanGrantStat;
	enterprise: PlanGrantStat;
}

function toInputDate(iso: string | null): string {
	if (!iso) return "";
	return iso.slice(0, 10);
}

export default function AdminSettingsPage() {
	const [health, setHealth] = useState<SystemHealth | null>(null);
	const [loading, setLoading] = useState(true);
	const [planLimits, setPlanLimits] = useState<PlanLimitSettings>({
		free_plan_products_limit: 50,
		free_plan_customers_limit: 100,
		free_plan_sales_limit: 30,
	});
	const [unlimitedPeriod, setUnlimitedPeriod] = useState<UnlimitedPeriod>({
		startDate: null,
		endDate: null,
		isActive: false,
	});
	const [promoPeriod, setPromoPeriod] = useState<PromotionalPeriod>({
		startDate: null,
		endDate: null,
		discountPercent: 20,
		isActive: false,
	});
	const [savingLimits, setSavingLimits] = useState(false);
	const [savingUnlimited, setSavingUnlimited] = useState(false);
	const [savingPromo, setSavingPromo] = useState(false);
	const [quotas, setQuotas] = useState<PlanGrantQuotas>({
		pro: 0,
		enterprise: 0,
	});
	const [grantStats, setGrantStats] = useState<PlanGrantStats | null>(null);
	const [savingQuotas, setSavingQuotas] = useState(false);

	useEffect(() => {
		async function loadData() {
			try {
				const [healthRes, settingsRes, promotionsRes, quotasRes, statsRes] =
					await Promise.all([
						api.get("/admin/health").catch(() => null),
						api.get("/admin/settings").catch(() => null),
						api
							.get<PromotionsResponse>("/admin/settings/promotions")
							.catch(() => null),
						api
							.get<PlanGrantQuotas>("/admin/settings/plan-grant-quotas")
							.catch(() => null),
						api
							.get<PlanGrantStats>("/admin/exceptions/stats")
							.catch(() => null),
					]);
				if (healthRes) setHealth(healthRes.data);
				if (settingsRes?.data) {
					setPlanLimits((prev) => ({
						free_plan_products_limit:
							settingsRes.data.free_plan_products_limit ??
							prev.free_plan_products_limit,
						free_plan_customers_limit:
							settingsRes.data.free_plan_customers_limit ??
							prev.free_plan_customers_limit,
						free_plan_sales_limit:
							settingsRes.data.free_plan_sales_limit ??
							prev.free_plan_sales_limit,
					}));
				}
				if (promotionsRes?.data) {
					setUnlimitedPeriod(promotionsRes.data.unlimitedPeriod);
					setPromoPeriod(promotionsRes.data.promotionalPeriod);
				}
				if (quotasRes?.data) setQuotas(quotasRes.data);
				if (statsRes?.data) setGrantStats(statsRes.data);
			} catch (_error) {
				toast.error("Erro ao carregar dados");
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, []);

	const handleSaveQuotas = async () => {
		try {
			setSavingQuotas(true);
			const { data } = await api.put<PlanGrantQuotas>(
				"/admin/settings/plan-grant-quotas",
				quotas,
			);
			setQuotas(data);
			const { data: stats } = await api.get<PlanGrantStats>(
				"/admin/exceptions/stats",
			);
			setGrantStats(stats);
			toast.success("Quotas atualizadas!");
		} catch (error: unknown) {
			const message =
				(error as { response?: { data?: { message?: string } } })?.response
					?.data?.message ?? "Erro ao salvar quotas";
			toast.error(message);
		} finally {
			setSavingQuotas(false);
		}
	};

	const handleSaveLimits = async () => {
		try {
			setSavingLimits(true);
			await api.patch("/admin/settings", planLimits);
			toast.success("Limites do plano free salvos!");
		} catch (_error) {
			toast.error("Erro ao salvar limites");
		} finally {
			setSavingLimits(false);
		}
	};

	const handleSaveUnlimited = async () => {
		try {
			setSavingUnlimited(true);
			const payload = {
				startDate: unlimitedPeriod.startDate
					? toInputDate(unlimitedPeriod.startDate)
					: null,
				endDate: unlimitedPeriod.endDate
					? toInputDate(unlimitedPeriod.endDate)
					: null,
			};
			const { data } = await api.put<UnlimitedPeriod>(
				"/admin/settings/promotions/unlimited-period",
				payload,
			);
			setUnlimitedPeriod(data);
			toast.success("Período ilimitado atualizado!");
		} catch (error: unknown) {
			const message =
				(error as { response?: { data?: { message?: string } } })?.response
					?.data?.message ?? "Erro ao salvar período ilimitado";
			toast.error(message);
		} finally {
			setSavingUnlimited(false);
		}
	};

	const handleClearUnlimited = async () => {
		setUnlimitedPeriod({ startDate: null, endDate: null, isActive: false });
		try {
			setSavingUnlimited(true);
			const { data } = await api.put<UnlimitedPeriod>(
				"/admin/settings/promotions/unlimited-period",
				{ startDate: null, endDate: null },
			);
			setUnlimitedPeriod(data);
			toast.success("Período ilimitado removido");
		} catch (_error) {
			toast.error("Erro ao remover período");
		} finally {
			setSavingUnlimited(false);
		}
	};

	const handleSavePromo = async () => {
		try {
			setSavingPromo(true);
			const payload = {
				startDate: promoPeriod.startDate
					? toInputDate(promoPeriod.startDate)
					: null,
				endDate: promoPeriod.endDate ? toInputDate(promoPeriod.endDate) : null,
				discountPercent: promoPeriod.discountPercent,
			};
			const { data } = await api.put<PromotionalPeriod>(
				"/admin/settings/promotions/promotional-period",
				payload,
			);
			setPromoPeriod(data);
			toast.success("Período promocional atualizado!");
		} catch (error: unknown) {
			const message =
				(error as { response?: { data?: { message?: string } } })?.response
					?.data?.message ?? "Erro ao salvar período promocional";
			toast.error(message);
		} finally {
			setSavingPromo(false);
		}
	};

	const handleClearPromo = async () => {
		setPromoPeriod((prev) => ({
			...prev,
			startDate: null,
			endDate: null,
			isActive: false,
		}));
		try {
			setSavingPromo(true);
			const { data } = await api.put<PromotionalPeriod>(
				"/admin/settings/promotions/promotional-period",
				{
					startDate: null,
					endDate: null,
					discountPercent: promoPeriod.discountPercent,
				},
			);
			setPromoPeriod(data);
			toast.success("Período promocional removido");
		} catch (_error) {
			toast.error("Erro ao remover período");
		} finally {
			setSavingPromo(false);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Configurações do Sistema
				</h1>
				<p className="text-gray-500 dark:text-gray-400 mt-1">
					Monitoramento e configurações administrativas
				</p>
			</div>

			<div className="grid lg:grid-cols-2 gap-6">
				{/* System Health */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
							<Server className="w-5 h-5 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">
								Saúde do Sistema
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Status dos serviços
							</p>
						</div>
					</div>

					{loading ? (
						<div className="animate-pulse space-y-4">
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
						</div>
					) : health ? (
						<div className="space-y-4">
							<div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
								<div className="flex items-center gap-2">
									<Server className="w-4 h-4 text-gray-400" />
									<span className="text-gray-600 dark:text-gray-400">
										API Server
									</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="w-4 h-4 text-green-500" />
									<span className="text-green-600 font-medium">Online</span>
								</div>
							</div>
							<div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
								<div className="flex items-center gap-2">
									<Database className="w-4 h-4 text-gray-400" />
									<span className="text-gray-600 dark:text-gray-400">
										Database
									</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="w-4 h-4 text-green-500" />
									<span className="text-green-600 font-medium capitalize">
										{health.database}
									</span>
								</div>
							</div>
							<div className="flex items-center justify-between py-3">
								<span className="text-gray-600 dark:text-gray-400">
									Última verificação
								</span>
								<span className="text-gray-900 dark:text-white">
									{new Date(health.timestamp).toLocaleString("pt-BR")}
								</span>
							</div>
						</div>
					) : (
						<p className="text-red-500">Erro ao verificar saúde do sistema</p>
					)}
				</motion.div>

				{/* Admin Info */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
							<Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">
								Painel Administrativo
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Informações do sistema
							</p>
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
							<span className="text-gray-600 dark:text-gray-400">Versão</span>
							<span className="text-gray-900 dark:text-white font-mono">
								1.0.0
							</span>
						</div>
						<div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
							<span className="text-gray-600 dark:text-gray-400">Ambiente</span>
							<span
								className={`px-2 py-1 text-xs font-medium rounded ${
									health?.environment === "production"
										? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
										: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
								}`}
							>
								{health?.environment ?? "—"}
							</span>
						</div>
						<div className="flex items-center justify-between py-3">
							<span className="text-gray-600 dark:text-gray-400">
								Framework
							</span>
							<span className="text-gray-900 dark:text-white">
								NestJS + Next.js
							</span>
						</div>
					</div>
				</motion.div>

				{/* Window 1 — Unlimited Period */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg flex items-center justify-center">
							<Gift className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
						</div>
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<h3 className="font-semibold text-gray-900 dark:text-white">
									Período Ilimitado (Window 1)
								</h3>
								{unlimitedPeriod.isActive && (
									<span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
										Ativo
									</span>
								)}
							</div>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Durante este período, todos os usuários free se comportam como
								Pro
							</p>
						</div>
					</div>

					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label
									htmlFor="unlimited-start"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Data inicial
								</label>
								<Input
									id="unlimited-start"
									type="date"
									value={toInputDate(unlimitedPeriod.startDate)}
									onChange={(e) =>
										setUnlimitedPeriod({
											...unlimitedPeriod,
											startDate: e.target.value || null,
										})
									}
								/>
							</div>
							<div>
								<label
									htmlFor="unlimited-end"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Data final
								</label>
								<Input
									id="unlimited-end"
									type="date"
									value={toInputDate(unlimitedPeriod.endDate)}
									onChange={(e) =>
										setUnlimitedPeriod({
											...unlimitedPeriod,
											endDate: e.target.value || null,
										})
									}
								/>
							</div>
						</div>
						<p className="text-xs text-gray-500">
							Defina ambas as datas para ativar, ou limpe ambas para desativar.
						</p>
						<div className="flex gap-2">
							<Button
								onClick={handleSaveUnlimited}
								isLoading={savingUnlimited}
								disabled={
									!unlimitedPeriod.startDate || !unlimitedPeriod.endDate
								}
							>
								<Save className="w-4 h-4 mr-2" />
								Salvar período
							</Button>
							{(unlimitedPeriod.startDate || unlimitedPeriod.endDate) && (
								<Button
									variant="outline"
									onClick={handleClearUnlimited}
									disabled={savingUnlimited}
								>
									Remover
								</Button>
							)}
						</div>
					</div>
				</motion.div>

				{/* Window 2 — Promotional Period */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
							<Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
						</div>
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<h3 className="font-semibold text-gray-900 dark:text-white">
									Período Promocional (Window 2)
								</h3>
								{promoPeriod.isActive && (
									<span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
										Ativo
									</span>
								)}
							</div>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Cupom de desconto aplicado ao checkout do plano Pro
							</p>
						</div>
					</div>

					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label
									htmlFor="promo-start"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Data inicial
								</label>
								<Input
									id="promo-start"
									type="date"
									value={toInputDate(promoPeriod.startDate)}
									onChange={(e) =>
										setPromoPeriod({
											...promoPeriod,
											startDate: e.target.value || null,
										})
									}
								/>
							</div>
							<div>
								<label
									htmlFor="promo-end"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Data final
								</label>
								<Input
									id="promo-end"
									type="date"
									value={toInputDate(promoPeriod.endDate)}
									onChange={(e) =>
										setPromoPeriod({
											...promoPeriod,
											endDate: e.target.value || null,
										})
									}
								/>
							</div>
						</div>
						<div>
							<label
								htmlFor="promo-discount"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
							>
								Desconto (%)
							</label>
							<Input
								id="promo-discount"
								type="number"
								min={0}
								max={100}
								value={promoPeriod.discountPercent}
								onChange={(e) =>
									setPromoPeriod({
										...promoPeriod,
										discountPercent: Math.max(
											0,
											Math.min(100, parseInt(e.target.value, 10) || 0),
										),
									})
								}
							/>
						</div>
						<div className="flex gap-2">
							<Button onClick={handleSavePromo} isLoading={savingPromo}>
								<Save className="w-4 h-4 mr-2" />
								Salvar período
							</Button>
							{(promoPeriod.startDate || promoPeriod.endDate) && (
								<Button
									variant="outline"
									onClick={handleClearPromo}
									disabled={savingPromo}
								>
									Limpar datas
								</Button>
							)}
						</div>
					</div>
				</motion.div>

				{/* Plan Limits */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm lg:col-span-2"
				>
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
							<Settings className="w-5 h-5 text-orange-600 dark:text-orange-400" />
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">
								Limites do Plano Free
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Configure os limites numéricos do plano gratuito
							</p>
						</div>
					</div>

					<div className="grid md:grid-cols-3 gap-4">
						<Input
							label="Limite de Produtos"
							type="number"
							value={planLimits.free_plan_products_limit}
							onChange={(e) =>
								setPlanLimits({
									...planLimits,
									free_plan_products_limit: parseInt(e.target.value, 10) || 0,
								})
							}
						/>
						<Input
							label="Limite de Clientes"
							type="number"
							value={planLimits.free_plan_customers_limit}
							onChange={(e) =>
								setPlanLimits({
									...planLimits,
									free_plan_customers_limit: parseInt(e.target.value, 10) || 0,
								})
							}
						/>
						<Input
							label="Limite de Vendas/Mês"
							type="number"
							value={planLimits.free_plan_sales_limit}
							onChange={(e) =>
								setPlanLimits({
									...planLimits,
									free_plan_sales_limit: parseInt(e.target.value, 10) || 0,
								})
							}
						/>
					</div>
					<div className="mt-4">
						<Button onClick={handleSaveLimits} isLoading={savingLimits}>
							<Save className="w-4 h-4 mr-2" />
							Salvar limites
						</Button>
					</div>
				</motion.div>

				{/* Plan Grant Quotas */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.45 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm lg:col-span-2"
				>
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
							<Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">
								Quotas de planos concedidos
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Limite de concessões ativas (manuais) por plano.{" "}
								<strong>0 = ilimitado</strong>. Limite flexível: o sistema
								avisa, mas não bloqueia.
							</p>
						</div>
					</div>

					<div className="grid md:grid-cols-2 gap-4">
						<div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
							<div className="flex items-center gap-2 mb-3">
								<Star className="w-4 h-4 text-primary-600" />
								<span className="font-medium text-gray-900 dark:text-white">
									Profissional
								</span>
								{grantStats && (
									<span
										className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
											grantStats.pro.exceeded
												? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
												: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
										}`}
									>
										{grantStats.pro.active} /{" "}
										{grantStats.pro.quota === 0 ? "∞" : grantStats.pro.quota}{" "}
										ativas
									</span>
								)}
							</div>
							<Input
								type="number"
								min={0}
								value={quotas.pro}
								onChange={(e) =>
									setQuotas({
										...quotas,
										pro: Math.max(0, parseInt(e.target.value, 10) || 0),
									})
								}
								label="Quota (0 = ilimitado)"
							/>
						</div>

						<div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
							<div className="flex items-center gap-2 mb-3">
								<Crown className="w-4 h-4 text-secondary-600" />
								<span className="font-medium text-gray-900 dark:text-white">
									Empresarial
								</span>
								{grantStats && (
									<span
										className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
											grantStats.enterprise.exceeded
												? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
												: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
										}`}
									>
										{grantStats.enterprise.active} /{" "}
										{grantStats.enterprise.quota === 0
											? "∞"
											: grantStats.enterprise.quota}{" "}
										ativas
									</span>
								)}
							</div>
							<Input
								type="number"
								min={0}
								value={quotas.enterprise}
								onChange={(e) =>
									setQuotas({
										...quotas,
										enterprise: Math.max(0, parseInt(e.target.value, 10) || 0),
									})
								}
								label="Quota (0 = ilimitado)"
							/>
						</div>
					</div>

					<div className="mt-4">
						<Button onClick={handleSaveQuotas} isLoading={savingQuotas}>
							<Save className="w-4 h-4 mr-2" />
							Salvar quotas
						</Button>
					</div>
				</motion.div>

				{/* Link to Account Exceptions */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
					className="lg:col-span-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400"
				>
					Para conceder exceções por vendedor (limites customizados, plano
					presenteado, ajuste de cobrança), acesse a aba{" "}
					<a
						href="/admin/exceptions"
						className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
					>
						Exceções de Contas
					</a>
					.
				</motion.div>
			</div>
		</div>
	);
}
