"use client";

import { motion } from "framer-motion";
import {
	Calendar,
	CheckCircle,
	Database,
	Gift,
	Save,
	Server,
	Settings,
	Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

interface SystemHealth {
	status: string;
	database: string;
	timestamp: string;
}

interface SystemSettings {
	free_trial_end_date: string;
	free_plan_products_limit: number;
	free_plan_customers_limit: number;
	free_plan_sales_limit: number;
}

export default function AdminSettingsPage() {
	const [health, setHealth] = useState<SystemHealth | null>(null);
	const [loading, setLoading] = useState(true);
	const [settings, setSettings] = useState<SystemSettings>({
		free_trial_end_date: "2026-02-28",
		free_plan_products_limit: 60,
		free_plan_customers_limit: 40,
		free_plan_sales_limit: 30,
	});
	const [savingSettings, setSavingSettings] = useState(false);

	useEffect(() => {
		async function loadData() {
			try {
				const [healthRes, settingsRes] = await Promise.all([
					api.get("/admin/health").catch(() => null),
					api.get("/admin/settings").catch(() => null),
				]);
				if (healthRes) setHealth(healthRes.data);
				if (settingsRes?.data) {
					setSettings((prev) => ({
						free_trial_end_date: settingsRes.data.free_trial_end_date ?? prev.free_trial_end_date,
						free_plan_products_limit: settingsRes.data.free_plan_products_limit ?? prev.free_plan_products_limit,
						free_plan_customers_limit: settingsRes.data.free_plan_customers_limit ?? prev.free_plan_customers_limit,
						free_plan_sales_limit: settingsRes.data.free_plan_sales_limit ?? prev.free_plan_sales_limit,
					}));
				}
			} catch (_error) {
				toast.error("Erro ao carregar dados");
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, []);

	const handleSaveSettings = async () => {
		try {
			setSavingSettings(true);
			await api.patch("/admin/settings", settings);
			toast.success("Configurações salvas com sucesso!");
		} catch (_error) {
			toast.error("Erro ao salvar configurações");
		} finally {
			setSavingSettings(false);
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
							<span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-medium rounded">
								Development
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

				{/* Freemium Settings */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
							<Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">
								Período Freemium
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Configure o período de uso gratuito
							</p>
						</div>
					</div>

					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Data Limite do Período Gratuito
							</label>
							<div className="relative">
								<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									type="date"
									value={settings.free_trial_end_date}
									onChange={(e) =>
										setSettings({
											...settings,
											free_trial_end_date: e.target.value,
										})
									}
									className="pl-10"
								/>
							</div>
							<p className="text-xs text-gray-500 mt-1">
								Após esta data, usuários precisarão de um plano pago
							</p>
						</div>
					</div>
				</motion.div>

				{/* Plan Limits */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
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
								Configure os limites do plano gratuito
							</p>
						</div>
					</div>

					<div className="space-y-4">
						<Input
							label="Limite de Produtos"
							type="number"
							value={settings.free_plan_products_limit}
							onChange={(e) =>
								setSettings({
									...settings,
									free_plan_products_limit: parseInt(e.target.value, 10) || 0,
								})
							}
						/>
						<Input
							label="Limite de Clientes"
							type="number"
							value={settings.free_plan_customers_limit}
							onChange={(e) =>
								setSettings({
									...settings,
									free_plan_customers_limit: parseInt(e.target.value, 10) || 0,
								})
							}
						/>
						<Input
							label="Limite de Vendas/Mês"
							type="number"
							value={settings.free_plan_sales_limit}
							onChange={(e) =>
								setSettings({
									...settings,
									free_plan_sales_limit: parseInt(e.target.value, 10) || 0,
								})
							}
						/>
					</div>
				</motion.div>

				{/* Save Button */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="lg:col-span-2"
				>
					<Button
						onClick={handleSaveSettings}
						isLoading={savingSettings}
						className="w-full sm:w-auto"
					>
						<Save className="w-4 h-4 mr-2" />
						Salvar Configurações
					</Button>
				</motion.div>
			</div>
		</div>
	);
}
